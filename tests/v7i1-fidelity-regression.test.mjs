import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = "content/articles";
const issue = JSON.parse(fs.readFileSync("content/issues/v07-i01.json", "utf8"));
const expectedFigures = new Map([
  ["uluslararasi-ticarette-dusuk-karbon-kurallarinda-ortaya-cikan-egilimler-ve-kusak-yol-girisimi", 9],
  ["iklim-degisikligi-baglaminda-su-kitligi-ve-kuresel-gida-krizi", 10],
  ["dunyanin-yeniden-duzenlenisi-bolgesel-bloklar-ve-cok-kutuplu-kuresel-yonetisimin-yukselisi", 14],
  ["islami-sistem-ve-uluslararasi-iliskilerin-demokratiklesmesi-uzerine-bir-arastirma", 10],
  ["cin-abd-iliskilerinin-gelecegi", 2],
]);

const read = (slug, locale) =>
  JSON.parse(fs.readFileSync(path.join(root, slug, "fulltext", `${locale}.json`), "utf8"));
const norm = (value) => String(value ?? "").normalize("NFKC").replace(/\s+/gu, " ").trim().toLowerCase();

test("V7I1 preserves the PDF-verified published figure inventories and locale assets", () => {
  assert.equal(issue.articles.length, 5);
  for (const slug of issue.articles) {
    const expected = expectedFigures.get(slug);
    assert.ok(expected, slug);
    for (const locale of ["en", "tr"]) {
      const data = read(slug, locale);
      assert.equal(data.figures?.length, expected, `${slug}/${locale} figure count`);
      assert.deepEqual(
        data.figures.map((figure) => figure.id),
        Array.from({ length: expected }, (_, i) => `figure-${i + 1}`),
        `${slug}/${locale} figure ids`
      );
      for (const [index, figure] of data.figures.entries()) {
        assert.match(figure.caption, /\S/u, `${slug}/${locale}/figure-${index + 1} caption`);
        assert.match(
          figure.src,
          new RegExp(`^/assets/article-figures/${slug.replace(/[.*+?^\${}()|[\]\\]/g, "\\$&")}/figure-\\d{2}-${locale}\\.(?:jpg|png)$`),
          `${slug}/${locale}/figure-${index + 1} src`
        );
        const asset = path.join("public", figure.src.slice(1));
        assert.ok(fs.existsSync(asset), asset);
        assert.ok(fs.statSync(asset).size > 5_000, `${asset} unexpectedly small`);
      }
    }
  }
});

test("V7I1 keeps the confirmed bibliography fragment repair", () => {
  const slug = "dunyanin-yeniden-duzenlenisi-bolgesel-bloklar-ve-cok-kutuplu-kuresel-yonetisimin-yukselisi";
  for (const locale of ["en", "tr"]) {
    const refs = read(slug, locale).references ?? [];
    assert.equal(refs.length, 61, `${slug}/${locale}`);
    assert.ok(!refs.some((ref) => ref.text === "multilateral-development-banks)."));
    assert.equal(
      refs.filter((ref) => ref.text?.startsWith("Humphrey, C. and Chen, Y. (2021)")).length,
      1,
      `${slug}/${locale} Humphrey reference`
    );
  }
});

test("V7I1 retains clean paragraph and footnote invariants", () => {
  const cross = new Map();
  for (const slug of issue.articles) {
    for (const locale of ["en", "tr"]) {
      const data = read(slug, locale);
      const noteIds = (data.footnotes ?? []).map((note) => note.id).filter(Boolean);
      assert.equal(new Set(noteIds).size, noteIds.length, `${slug}/${locale} footnote ids`);

      const paragraphs = (data.sections ?? [])
        .flatMap((section) => section.paragraphs ?? [])
        .map((paragraph) => norm(typeof paragraph === "string" ? paragraph : paragraph?.text))
        .filter((paragraph) => paragraph.split(" ").length >= 8);
      assert.equal(new Set(paragraphs).size, paragraphs.length, `${slug}/${locale} duplicate paragraph`);

      for (const paragraph of paragraphs.filter((value) => value.length >= 120)) {
        const key = `${locale}::${paragraph}`;
        const owner = cross.get(key);
        assert.ok(!owner || owner === slug, `cross-record paragraph contamination: ${owner} -> ${slug}/${locale}`);
        cross.set(key, slug);
      }
    }
  }
});

test("V7I1 preserves representative published captions", () => {
  const yang = read("cin-abd-iliskilerinin-gelecegi", "en");
  assert.match(yang.figures[0].caption, /Mao Zedong with youth from Asia, Africa, and Latin America, 1959/u);
  const waterTr = read("iklim-degisikligi-baglaminda-su-kitligi-ve-kuresel-gida-krizi", "tr");
  assert.match(waterTr.figures[2].caption, /^Şekil 1\. Yeraltı su kaynaklarından çekiş\/kullanım oranı/u);
  const islamEn = read("islami-sistem-ve-uluslararasi-iliskilerin-demokratiklesmesi-uzerine-bir-arastirma", "en");
  assert.match(islamEn.figures[5].caption, /Riyadh, Kingdom of Saudi Arabia/u);
});
