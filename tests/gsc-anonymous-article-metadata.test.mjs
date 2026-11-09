import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const archive = JSON.parse(await readFile(new URL("../app/archive-data.json", import.meta.url), "utf8"));

async function renderArticle(pathname) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("anonymous-seo-test", `${process.pid}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(
    new Request(`http://localhost${pathname.replace(/\/$/, "")}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  assert.equal(response.status, 200, pathname);
  return response.text();
}

function metaContent(html, name) {
  const tags = [...html.matchAll(/<meta\b[^>]*>/gi)].map(([tag]) => tag);
  const tag = tags.find((t) => new RegExp(`\\bname=["']${name}["']`, "i").test(t));
  return tag ? tag.match(/\bcontent=["']([^"']*)["']/i)?.[1] ?? "" : null;
}

test("canonical source genuinely records no named authors for five anonymous contributions", () => {
  const slugs = [
    "izmir-kizilcullu-koy-enstitusu",
    "brics-terore-karsi-mucadele-stratejisi",
    "sanghay-isbirligi-orgutu-devlet-baskanlari-konseyinin-terorizm-ayrilikcilik-ve-asiriciliga-yol-acan",
    "istanbul-bogazinin-kopuklerinden-yeni-anayasa-venusunun-dogusu",
    "filistin-1947",
  ];
  for (const slug of slugs) {
    const record = archive.articles.find((article) => article.slug === slug);
    assert.ok(record, `source record exists: ${slug}`);
    assert.equal(record.author, "", `do not fabricate a byline: ${slug}`);
  }
});

test("anonymous institutional declarations and visual contributions omit empty Highwire author tags", async () => {
  const paths = [
    "/en/articles/izmir-k-z-lcullu-village-institute/",
    "/tr/makaleler/brics-terore-karsi-mucadele-stratejisi/",
    "/tr/makaleler/sanghay-isbirligi-orgutu-devlet-baskanlari-konseyinin-terorizm-ayrilikcilik-ve-asiriciliga-yol-acan/",
    "/tr/makaleler/istanbul-bogazinin-kopuklerinden-yeni-anayasa-venusunun-dogusu/",
    "/en/articles/palestine-in-1947/",
  ];
  const htmls = await Promise.all(paths.map(renderArticle));
  for (const [index, html] of htmls.entries()) {
    assert.equal(metaContent(html, "citation_author"), null, paths[index]);
    assert.ok(metaContent(html, "citation_title"), paths[index]);
    assert.match(metaContent(html, "citation_publication_date"), /^\d{4}$/, paths[index]);
  }
});

test("anonymous contributions have a clean bilingual fallback description", async () => {
  const [en, tr] = await Promise.all([
    renderArticle("/en/articles/palestine-in-1947/"),
    renderArticle("/tr/makaleler/istanbul-bogazinin-kopuklerinden-yeni-anayasa-venusunun-dogusu/"),
  ]);
  assert.match(metaContent(en, "description"), /^Palestine in 1947\. Published in BRIQ, Volume 5, Issue 1\.$/);
  assert.match(metaContent(tr, "description"), /^İstanbul Boğazı'nın Köpüklerinden Yeni Anayasa Venüsünün Doğuşu, BRIQ Cilt 5, Sayı 3 içinde yayımlandı\.$/);
});

test("authored articles retain their verified Highwire author byline", async () => {
  const html = await renderArticle("/en/articles/research-on-the-islamic-system-and-the-democratization-of-international-relations/");
  assert.equal(metaContent(html, "citation_author"), "Zhang Yan Jun - Liu Yu Jun");
});
