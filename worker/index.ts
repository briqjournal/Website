/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import {
  LEGACY_REDIRECTS,
  COMPACT_PDF_MAP,
} from "./legacy-redirects";

interface Env {
  ASSETS: Fetcher;
  BRIQ_PDF?: R2Bucket;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

const R2_PDF_PATH_PREFIXES = [
  "/assets/archive/pdfs/",
  "/assets/issues/",
] as const;

function normalizedLegacyPath(pathname: string): string {
  if (pathname === "/") return pathname;
  return pathname.replace(/\/+$/, "");
}

function handleLegacyRedirect(url: URL): Response | null {
  const rawPath = normalizedLegacyPath(url.pathname);
  const decodedPath = decodeURIComponent(rawPath);

  // 1. Direct PDF redirect for legacy /sites/default/files/... (including /tr/sites/ and /en/sites/)
  if (rawPath.includes("/sites/default/files/") || decodedPath.includes("/sites/default/files/")) {
    const filename = (decodedPath.split("/").pop() || rawPath.split("/").pop() || "").toLowerCase();
    const relativeTarget = COMPACT_PDF_MAP[filename];

    if (relativeTarget) {
      const target = new URL(`/assets/archive/pdfs/${relativeTarget}`, url.origin);
      return new Response(null, {
        status: 301,
        headers: {
          location: target.toString(),
          "cache-control": "public, max-age=86400, s-maxage=604800",
        },
      });
    }
  }

  // 2. Direct page redirect from LEGACY_REDIRECTS
  let targetPath = LEGACY_REDIRECTS[rawPath] || LEGACY_REDIRECTS[decodedPath];

  // 3. Wildcard match for author profiles /en/user/:id* -> /en/authors/:id*
  if (!targetPath && (rawPath.startsWith("/en/user/") || decodedPath.startsWith("/en/user/"))) {
    targetPath = decodedPath.replace("/en/user/", "/en/authors/");
  }

  if (!targetPath) return null;

  const target = new URL(targetPath, url.origin);
  target.search = url.search;
  return new Response(null, {
    status: 301,
    headers: {
      location: target.toString(),
      "cache-control": "public, max-age=86400, s-maxage=604800",
    },
  });
}

function isR2PdfPath(pathname: string): boolean {
  return (
    pathname.toLowerCase().endsWith(".pdf") &&
    R2_PDF_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  );
}

function applyPdfHeaders(headers: Headers): void {
  if (!headers.has("content-type")) {
    headers.set("content-type", "application/pdf");
  }
  if (!headers.has("cache-control")) {
    headers.set("cache-control", "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000");
  }
  if (!headers.has("content-disposition")) headers.set("content-disposition", "inline");
  headers.set("accept-ranges", "bytes");
  headers.set("x-content-type-options", "nosniff");
}

function applyContentLengthAndRange(
  headers: Headers,
  object: R2Object | R2ObjectBody,
): number {
  const range = object.range;
  if (!range) {
    headers.set("content-length", String(object.size));
    return 200;
  }

  const length = range.length ?? Math.min(range.suffix ?? object.size, object.size);
  const offset = range.offset ?? Math.max(object.size - length, 0);
  headers.set("content-length", String(length));
  headers.set(
    "content-range",
    `bytes ${offset}-${offset + length - 1}/${object.size}`,
  );
  return 206;
}

async function servePdfFromR2(
  request: Request,
  bucket: R2Bucket | undefined,
  pathname: string,
): Promise<Response> {
  if (!bucket) {
    return new Response("PDF archive is temporarily unavailable.", {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { allow: "GET, HEAD" },
    });
  }

  const key = pathname.slice(1);
  if (request.method === "HEAD") {
    const object = await bucket.head(key);
    if (!object) return new Response("PDF Not Found", { status: 404 });

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    applyPdfHeaders(headers);
    applyContentLengthAndRange(headers, object);
    return new Response(null, { status: 200, headers });
  }

  const object = await bucket.get(key, { range: request.headers });
  if (!object) return new Response("PDF Not Found", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  applyPdfHeaders(headers);
  const status = applyContentLengthAndRange(headers, object);
  return new Response(object.body, { status, headers });
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const legacyRedirect = handleLegacyRedirect(url);
    if (legacyRedirect) return legacyRedirect;

    if (isR2PdfPath(url.pathname)) {
      return servePdfFromR2(request, env.BRIQ_PDF, url.pathname);
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;
