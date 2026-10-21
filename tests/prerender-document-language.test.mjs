import assert from "node:assert/strict";
import { open, readdir } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const clientRoot = join(process.cwd(), "dist/client");

async function verifyHtmlDocuments(directory, locale) {
  let checked = 0;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      checked += await verifyHtmlDocuments(path, locale);
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      const file = await open(path, "r");
      let header;
      try {
        const buffer = Buffer.alloc(1024);
        const { bytesRead } = await file.read(buffer, 0, buffer.length, 0);
        header = buffer.toString("utf8", 0, bytesRead);
      } finally {
        await file.close();
      }
      const htmlTag = header.match(/<html\b[^>]*>/i)?.[0];
      assert.ok(htmlTag, `Missing <html> in ${path}`);
      assert.match(htmlTag, new RegExp(`\\blang=["']${locale}["']`, "i"), path);
      checked += 1;
    }
  }
  return checked;
}

test("all prerendered English and Turkish HTML documents declare the right root language", async () => {
  const [en, tr] = await Promise.all([
    verifyHtmlDocuments(join(clientRoot, "en"), "en"),
    verifyHtmlDocuments(join(clientRoot, "tr"), "tr"),
  ]);
  assert.ok(en > 500, `Expected complete English prerender output, got ${en}`);
  assert.ok(tr > 500, `Expected complete Turkish prerender output, got ${tr}`);
});
