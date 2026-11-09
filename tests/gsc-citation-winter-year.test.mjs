import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const archive = JSON.parse(await readFile(new URL("../app/archive-data.json", import.meta.url), "utf8"));

async function renderArticle(pathname) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("citation-year-test", `${process.pid}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  assert.equal(response.status, 200, pathname);
  return response.text();
}

function highwirePublicationYear(html) {
  const tag = (html.match(/<meta\b[^>]*\bname=["']citation_publication_date["'][^>]*>/i) || [])[0];
  assert.ok(tag, "Highwire publication-date meta tag exists");
  const year = tag.match(/\bcontent=["']([^"']+)["']/i)?.[1];
  assert.ok(year, "Highwire publication-date content exists");
  return year;
}

test("uses the January-side year for winter issue citations in both languages", async () => {
  const cases = [
    [
      "/en/articles/research-on-the-islamic-system-and-the-democratization-of-international-relations/",
      "2026",
    ],
    [
      "/tr/makaleler/islami-sistem-ve-uluslararasi-iliskilerin-demokratiklesmesi-uzerine-bir-arastirma/",
      "2026",
    ],
    [
      "/tr/makaleler/karsilikli-saygi-ve-dostluga-dayali-turk-cin-iliskilerinin-son-yarim-yuzyili-ve-gelecegi/",
      "2022",
    ],
    [
      "/en/articles/the-last-semi-century-and-the-future-of-turkish-chinese-relations-based-on-mutual-respect-and-friendship/",
      "2022",
    ],
    [
      "/en/articles/highlights-from-chinas-medium-and-long-term-plan-for-the-development-of-the-hydrogen-energy-industry/",
      "2022",
    ],
  ];
  const htmls = await Promise.all(cases.map(([path]) => renderArticle(path)));
  for (const [index, [path, expectedYear]] of cases.entries()) {
    assert.equal(highwirePublicationYear(htmls[index]), expectedYear, path);
  }
});

test("does not rewrite printed issue-year labels in canonical source-derived records", () => {
  const winter2026 = archive.articles.find((a) => a.slug === "islami-sistem-ve-uluslararasi-iliskilerin-demokratiklesmesi-uzerine-bir-arastirma");
  const winter2022 = archive.articles.find((a) => a.slug === "karsilikli-saygi-ve-dostluga-dayali-turk-cin-iliskilerinin-son-yarim-yuzyili-ve-gelecegi");
  assert.equal(winter2026?.year, "2025-2026");
  assert.equal(winter2022?.year, "2021-2022");
});
