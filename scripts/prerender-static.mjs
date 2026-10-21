import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const clientRoot = join(root, "dist/client");
const workerPath = join(root, "dist/server/index.js");
const workerUrl = pathToFileURL(workerPath);
workerUrl.searchParams.set("prerender", `${process.pid}-${Date.now()}`);
const { default: worker } = await import(workerUrl.href);

const env = {
  ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
};
const context = {
  waitUntil() {},
  passThroughOnException() {},
};

let staleHtmlRemoved = 0;
async function removeStaleHtml(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await removeStaleHtml(path);
    else if (entry.isFile() && entry.name.endsWith(".html")) {
      await rm(path);
      staleHtmlRemoved += 1;
    }
  }
}

await removeStaleHtml(clientRoot);
console.log(`Removed ${staleHtmlRemoved} stale prerendered HTML files.`);

async function render(pathname) {
  // vinext internally resolves slashless app routes. Cloudflare's static
  // assets serve the prerendered index.html files at final slash URLs.
  const internalPath = pathname.length > 1 && pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;
  return worker.fetch(
    new Request(`https://briqjournal.com${internalPath}`, {
      headers: { accept: pathname.endsWith(".xml") ? "application/xml" : "text/html" },
    }),
    env,
    context,
  );
}

// Published pages are served as static Cloudflare assets, bypassing the Worker.
// Fix the document language at build time without making every page dynamic.
function alignDocumentLanguage(pathname, html) {
  const locale = pathname.startsWith("/en/") ? "en"
    : pathname.startsWith("/tr/") ? "tr"
    : null;
  if (!locale) return html;

  const rootTag = html.match(/<html\b[^>]*>/i)?.[0];
  const language = rootTag?.match(/\blang\s*=\s*(["'])([^"']+)\1/i);
  if (!rootTag || !language) {
    throw new Error(`Missing HTML document language for ${pathname}`);
  }
  if (language[2] === locale) return html;

  // The shared Next/Vinext root layout currently renders lang="tr".
  // Only the English output requires correction; fail on other surprises.
  if (locale !== "en" || language[2] !== "tr") {
    throw new Error(`Unexpected HTML language ${language[2]} for ${pathname}`);
  }
  return html.replace(rootTag, rootTag.replace(language[0], 'lang="en"'));
}

async function writeResponse(pathname, outputPath) {
  const response = await render(pathname);
  if (!response.ok) {
    throw new Error(`Prerender failed for ${pathname}: HTTP ${response.status}`);
  }
  const renderedBody = await response.text();
  const body = outputPath.endsWith(".html")
    ? alignDocumentLanguage(pathname, renderedBody)
    : renderedBody;
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, body, "utf8");
  return body;
}

const sitemap = await writeResponse("/sitemap.xml", join(clientRoot, "sitemap.xml"));
await writeResponse("/robots.txt", join(clientRoot, "robots.txt"));

const paths = new Set(
  [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => new URL(match[1]).pathname),
);

const articleAliases = [
  "kulturel-silinmeden-tarihsel-kurtarmaya",
  "turkiye-isvicre-kultur-varliklari-anlasmasi",
  "cinde-somut-olmayan-kulturel-mirasin-korunmasi",
  "anadolunun-kulturel-mirasini-koruma-sorumlulugu",
  "mogolistanin-ucuncu-komsu-diplomasisi",
  "kusak-ve-yolun-guvenligi-kitap-incelemesi",
];
for (const slug of articleAliases) paths.add(`/tr/makaleler/${slug}/`);

for (const pathname of [...paths]) {
  if (/^\/(?:tr\/makaleler|en\/articles)\/[^/]+\/$/.test(pathname)) {
    paths.add(`${pathname}pdf/`);
  }
}

const queue = [...paths];
const expectedHtmlPaths = new Set(queue.map((pathname) => pathname === "/"
  ? join(clientRoot, "index.html")
  : join(clientRoot, pathname.slice(1), "index.html")));
let completed = 0;
const workerCount = Math.min(4, queue.length);
await Promise.all(Array.from({ length: workerCount }, async () => {
  while (queue.length) {
    const pathname = queue.shift();
    if (!pathname) continue;
    const outputPath = pathname === "/"
      ? join(clientRoot, "index.html")
      : join(clientRoot, pathname.slice(1), "index.html");
    await writeResponse(pathname, outputPath);
    completed += 1;
    if (completed % 100 === 0) console.log(`Prerendered ${completed}/${paths.size} routes`);
  }
}));

let unexpectedHtmlRemoved = 0;
async function removeUnexpectedHtml(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await removeUnexpectedHtml(path);
    else if (entry.isFile() && entry.name.endsWith(".html") && !expectedHtmlPaths.has(path)) {
      await rm(path);
      unexpectedHtmlRemoved += 1;
    }
  }
}
await removeUnexpectedHtml(clientRoot);

console.log(`Prerendered ${completed} HTML routes plus sitemap.xml and robots.txt.`);
if (unexpectedHtmlRemoved) console.log(`Removed ${unexpectedHtmlRemoved} unexpected stale HTML files after prerendering.`);
