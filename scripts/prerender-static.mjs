import { mkdir, writeFile } from "node:fs/promises";
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

async function render(pathname) {
  return worker.fetch(
    new Request(`https://briqjournal.com${pathname}`, {
      headers: { accept: pathname.endsWith(".xml") ? "application/xml" : "text/html" },
    }),
    env,
    context,
  );
}

async function writeResponse(pathname, outputPath) {
  const response = await render(pathname);
  if (!response.ok) {
    throw new Error(`Prerender failed for ${pathname}: HTTP ${response.status}`);
  }
  const body = await response.text();
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
for (const slug of articleAliases) paths.add(`/makaleler/${slug}`);

for (const pathname of [...paths]) {
  if (/^\/(?:makaleler|en\/articles)\/[^/]+$/.test(pathname)) {
    paths.add(`${pathname}/pdf`);
  }
}

const queue = [...paths];
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

console.log(`Prerendered ${completed} HTML routes plus sitemap.xml and robots.txt.`);

