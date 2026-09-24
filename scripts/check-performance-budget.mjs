import { readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");
const limits = {
  clientJavaScript: 600 * 1024,
  serverJavaScript: 4 * 1024 * 1024,
  html: 800 * 1024,
  searchIndex: 700 * 1024,
};

async function filesUnder(directory) {
  const files = [];
  async function visit(current) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const path = join(current, entry.name);
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile()) files.push(path);
    }
  }
  await visit(directory);
  return files;
}

const files = await filesUnder(dist);
const failures = [];
let largestClient = { path: "", bytes: 0 };
let largestServer = { path: "", bytes: 0 };
let largestHtml = { path: "", bytes: 0 };

for (const path of files) {
  const bytes = (await stat(path)).size;
  const display = relative(root, path);
  if (path.includes("/dist/client/") && path.endsWith(".js")) {
    if (bytes > largestClient.bytes) largestClient = { path: display, bytes };
    if (bytes > limits.clientJavaScript) failures.push(`Client JavaScript exceeds 600 KiB: ${display} (${bytes} bytes)`);
  }
  if (path.includes("/dist/server/") && path.endsWith(".js")) {
    if (bytes > largestServer.bytes) largestServer = { path: display, bytes };
    if (bytes > limits.serverJavaScript) failures.push(`Server JavaScript exceeds 4 MiB: ${display} (${bytes} bytes)`);
  }
  if (path.endsWith(".html")) {
    if (bytes > largestHtml.bytes) largestHtml = { path: display, bytes };
    if (bytes > limits.html) failures.push(`HTML exceeds 800 KiB: ${display} (${bytes} bytes)`);
  }
}

const searchPath = join(root, "public/assets/data/article-search-index.json");
const searchBytes = (await stat(searchPath)).size;
if (searchBytes > limits.searchIndex) {
  failures.push(`On-demand search index exceeds 700 KiB: ${searchBytes} bytes`);
}

console.log("Performance budget:");
console.log(` - largest client JavaScript: ${largestClient.bytes} bytes (${largestClient.path})`);
console.log(` - largest server JavaScript: ${largestServer.bytes} bytes (${largestServer.path})`);
console.log(` - largest HTML: ${largestHtml.bytes} bytes (${largestHtml.path})`);
console.log(` - on-demand search index: ${searchBytes} bytes`);

if (failures.length) {
  for (const failure of failures) console.error(failure);
  process.exit(65);
}

