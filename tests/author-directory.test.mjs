import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const client = new URL("../dist/client/", import.meta.url);

async function rendered(path) {
  return readFile(new URL(path, client), "utf8");
}

test("bilingual author directories are statically generated, canonical and reciprocally linked", async () => {
  const [tr, en] = await Promise.all([
    rendered("tr/yazar-dizini/index.html"),
    rendered("en/author-directory/index.html"),
  ]);
  assert.match(tr, /<h1[^>]*>Yazar Dizini/);
  assert.match(en, /<h1[^>]*>Author Directory/);
  assert.match(tr, /rel="canonical" href="https:\/\/briqjournal\.com\/tr\/yazar-dizini\/"/);
  assert.match(en, /rel="canonical" href="https:\/\/briqjournal\.com\/en\/author-directory\/"/);
  assert.match(tr, /hrefLang="en-US"[^>]*href="https:\/\/briqjournal\.com\/en\/author-directory\/"/);
  assert.match(en, /hrefLang="tr-TR"[^>]*href="https:\/\/briqjournal\.com\/tr\/yazar-dizini\/"/);
  assert.match(tr, /href="\/en\/author-directory\/"/);
  assert.match(en, /href="\/tr\/yazar-dizini\/"/);

  const trLinks = [...tr.matchAll(/href="\/tr\/yazar\/([a-z0-9-]+)\/"/g)].map((match) => match[1]);
  const enLinks = [...en.matchAll(/href="\/en\/authors\/([a-z0-9-]+)\/"/g)].map((match) => match[1]);
  assert.ok(trLinks.length > 200, "Turkish directory should expose all profiles as regular HTML links");
  assert.equal(new Set(trLinks).size, trLinks.length, "No duplicate Turkish profile links");
  assert.equal(new Set(enLinks).size, enLinks.length, "No duplicate English profile links");
  assert.deepEqual(new Set(trLinks), new Set(enLinks), "Locale directories contain the same authors");
  assert.match(tr, /href="\/tr\/yazar\/ahmet-kavas\/"/);
  assert.match(en, /href="\/en\/authors\/a-kadir-ekinci\/"/);
  assert.match(tr, /type="search"/);
  assert.match(en, /type="search"/);
});

test("published author directories appear as exact final URLs in the generated sitemap", async () => {
  const sitemap = await readFile(new URL("sitemap.xml", client), "utf8");
  assert.match(sitemap, /<loc>https:\/\/briqjournal\.com\/tr\/yazar-dizini\/<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/briqjournal\.com\/en\/author-directory\/<\/loc>/);
});
