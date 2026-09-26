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

function parseIssuePdfTarget(filename: string): string | null {
  const fn = filename.toLowerCase();
  if (!fn.endsWith(".pdf")) return null;

  const isTr = fn.includes("cilt") || fn.includes("sayi") || fn.includes("sayı") || fn.includes("türkçe") || fn.includes("turkce");

  const cMatch = fn.match(/c(\d+)\s*s(\d+)/);
  if (cMatch) {
    const lang = isTr && !fn.includes("eng") ? "tr" : "en";
    return `issues/cilt-${Number(cMatch[1])}-sayi-${Number(cMatch[2])}-${lang}.pdf`;
  }

  const trMatch = fn.match(/(?:cilt[^\d]*(\d+)[^\d]*say[ıi][^\d]*(\d+)|(\d+)[^\d]*cilt[^\d]*(\d+)[^\d]*say[ıi]?)/);
  if (trMatch) {
    const v = Number(trMatch[1] || trMatch[3]);
    const i = Number(trMatch[2] || trMatch[4]);
    const lang = !isTr || fn.includes("eng") ? "en" : "tr";
    return `issues/cilt-${v}-sayi-${i}-${lang}.pdf`;
  }

  const enMatch = fn.match(/vol(?:ume)?[^\d]*(\d+)[^\d]*issue[^\d]*(\d+)/);
  if (enMatch) {
    const v = Number(enMatch[1]);
    const i = Number(enMatch[2]);
    return `issues/cilt-${v}-sayi-${i}-en.pdf`;
  }

  return null;
}

function getLegacyPatternRedirect(pathname: string): string | null {
  const p = pathname.toLowerCase();

  // 1. Author profiles: /en/user/:id -> /en/authors/:id, /user/:id or /tr/user/:id -> /tr/yazar/:id
  if (pathname.startsWith("/en/user/")) {
    return "/en/authors/" + pathname.slice("/en/user/".length);
  }
  if (pathname.startsWith("/tr/user/")) {
    return "/tr/yazar/" + pathname.slice("/tr/user/".length);
  }
  if (pathname.startsWith("/user/")) {
    return "/tr/yazar/" + pathname.slice("/user/".length);
  }

  // 2. English volume/issue: /en/briq-vol{v}-issue{i}, /briq-vol{v}-issue{i}, /en/e-briq/briq-vol...
  const enVolMatch = pathname.match(/^(?:\/tr)?(?:\/en)?(?:\/e-briq)?\/briq-vol(\d+)-issue(\d+)(?:-.*)?$/i);
  if (enVolMatch) {
    return `/en/archive/volume-${enVolMatch[1]}-issue-${enVolMatch[2]}`;
  }

  // 3. Turkish issue: /e-briq/briq-{v}cilt-{i}sayi
  const trVolMatch = pathname.match(/^(?:\/tr)?\/e-briq\/briq-(\d+)cilt-(\d+)sayi(?:-.*)?$/i);
  if (trVolMatch) {
    return `/tr/arsiv/cilt-${trVolMatch[1]}-sayi-${trVolMatch[2]}`;
  }

  // 4. Taxonomies, categories, tags
  if (/^\/(?:en\/)?(?:taxonomy\/term|tag|category|kategori)\//i.test(pathname)) {
    return pathname.startsWith("/en/") ? "/en/articles" : "/tr/makaleler";
  }

  // 5. Calls for papers
  if (/^\/en\/(?:call-for-papers|call-papers|special-issue-call-papers|makale-cagrilari)/i.test(pathname)) {
    return "/en/calls-for-papers";
  }
  if (/^\/(?:makale-cagrilari)/i.test(pathname)) {
    return "/tr/makale-cagrilari";
  }

  // 6. General archive / issues
  if (p === "/en/issues" || p === "/issues" || p === "/en/sayilar" || p === "/archive") {
    return "/en/archive";
  }
  if (p === "/sayilar" || p === "/tr/sayilar" || p === "/tr/archive") {
    return "/tr/arsiv";
  }

  return null;
}

function handleLegacyRedirect(url: URL): Response | null {
  const rawPath = normalizedLegacyPath(url.pathname);
  const decodedPath = decodeURIComponent(rawPath);

  // 1. Direct PDF redirect for legacy /sites/default/files/... (including /tr/sites/ and /en/sites/)
  if (rawPath.includes("/sites/default/files/") || decodedPath.includes("/sites/default/files/")) {
    const filename = (decodedPath.split("/").pop() || rawPath.split("/").pop() || "").toLowerCase();
    const relativeTarget = COMPACT_PDF_MAP[filename] || parseIssuePdfTarget(filename);

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

  // 3. Dynamic patterns (author, issue, taxonomy, calls, archive)
  if (!targetPath) {
    targetPath = getLegacyPatternRedirect(decodedPath) || getLegacyPatternRedirect(rawPath);
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

function localeGatewayRedirect(request: Request, url: URL): Response | null {
  // Fast-path the root locale gateway at the edge. The app-router gateway
  // (app/page.tsx) renders server-side before redirecting, which costs
  // ~800ms per request to "/". Redirect straight to the trailing-slash
  // locale home so production serves a single fast hop. GET/HEAD only;
  // query params preserved; no cache headers (the target varies by visitor).
  if (request.method !== "GET" && request.method !== "HEAD") return null;
  if (url.pathname !== "/") return null;

  const country = request.headers.get("cf-ipcountry")?.toUpperCase();
  const target = new URL(country === "TR" ? "/tr/" : "/en/", url.origin);
  target.search = url.search;
  return new Response(null, {
    status: 307,
    headers: { location: target.toString() },
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

    const localeRedirect = localeGatewayRedirect(request, url);
    if (localeRedirect) return localeRedirect;

    if (isR2PdfPath(url.pathname)) {
      return servePdfFromR2(request, env.BRIQ_PDF, url.pathname);
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          // vinext negotiates MIME types ("image/avif" | "image/webp" |
          // "image/jpeg") but Cloudflare Images only accepts short format
          // names ("avif" | "webp"). Passing the MIME string through made
          // every transform throw, and vinext then silently fell back to
          // serving the original full-resolution file. JPEG-only clients
          // keep the input format (only resize + quality apply).
          const requestedFormat = String(format ?? "");
          const outputFormat =
            requestedFormat === "image/avif" ? "avif"
            : requestedFormat === "image/webp" ? "webp"
            : undefined;
          const resizeWidth = Number(width) || 0;
          const result = await env.IMAGES.input(body)
            .transform(resizeWidth > 0 ? { width: resizeWidth } : {})
            .output(outputFormat ? { format: outputFormat, quality } : { quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;
