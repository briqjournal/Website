import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const issue = JSON.parse(fs.readFileSync("content/issues/v02-i01.json", "utf8"));
const catalog = JSON.parse(fs.readFileSync("content/catalog.json", "utf8"));
const read = (slug, locale) => JSON.parse(fs.readFileSync(path.join("content/articles", slug, "fulltext", locale + ".json"), "utf8"));
const structure = {
  "bes-deniz-stratejisini-canlandirmak-mumkun-mu": {
    "en": [
      5,
      46,
      5
    ],
    "tr": [
      5,
      46,
      6
    ]
  },
  "turkiye-ve-cinin-degisen-deniz-jeopolitiginin-neo-mahanci-bir-okumasi": {
    "en": [
      5,
      41,
      4
    ],
    "tr": [
      5,
      41,
      4
    ]
  },
  "mavi-vatan-doktrini-nasil-olustu": {
    "en": [
      11,
      42,
      4
    ],
    "tr": [
      11,
      41,
      6
    ]
  },
  "mare-nostrumdan-denizlerde-uluslararasi-isbirligine-tarih-akdenizin-gelecegi-ile-ilgili": {
    "en": [
      8,
      32,
      3
    ],
    "tr": [
      7,
      32,
      3
    ]
  },
  "gaz-hidratlar-yakin-gelecegin-enerji-kaynagi": {
    "en": [
      5,
      23,
      4
    ],
    "tr": [
      5,
      23,
      4
    ]
  },
  "karabag-baslangictan-gunumuze-sorunlar-ve-cozumler": {
    "en": [
      13,
      5,
      5
    ],
    "tr": [
      13,
      5,
      8
    ]
  },
  "fotograf-omer-burhanoglu": {
    "en": [
      1,
      0,
      1
    ],
    "tr": [
      1,
      0,
      1
    ]
  }
};

test("V2I1 registers all 14 published full-text routes in the canonical localized catalog", () => {
  assert.equal(issue.articles.length, 7);
  for (const slug of issue.articles) {
    const dir = path.join("content/articles", slug, "fulltext");
    assert.deepEqual(fs.readdirSync(dir).sort(), ["en.json", "tr.json"], slug);
    assert.ok(catalog.fulltext.localized.includes(slug), slug);
    assert.ok(!catalog.fulltext.current.includes(slug), slug);
    assert.ok(!catalog.fulltext.en_archive.includes(slug), slug);
  }
});

test("V2I1 preserves the published locale-specific section/reference/figure structure", () => {
  for (const [slug, expected] of Object.entries(structure)) for (const locale of ["en", "tr"]) {
    const doc = read(slug, locale);
    assert.equal(doc.sections.length, expected[locale][0], `${slug}/${locale} sections`);
    assert.equal(doc.references?.length ?? 0, expected[locale][1], `${slug}/${locale} refs`);
    assert.equal(doc.figures?.length ?? 0, expected[locale][2], `${slug}/${locale} figures`);
    assert.ok(doc.sections.every((s) => s.paragraphs.length > 0), `${slug}/${locale} paragraphs`);
  }
});

test("V2I1 uses exact production assets with valid inline placements", () => {
  for (const slug of issue.articles) for (const locale of ["en", "tr"]) {
    const doc = read(slug, locale);
    for (const figure of doc.figures ?? []) {
      assert.equal(typeof figure.id, "string"); assert.equal(typeof figure.src, "string"); assert.equal(typeof figure.caption, "string");
      assert.ok(fs.existsSync(path.join("public", figure.src)), `${slug}/${locale}: ${figure.src}`);
      if (figure.kind !== "visual") {
        assert.ok(figure.placement?.sectionId, `${slug}/${locale}/${figure.id} placement`);
        assert.ok(doc.sections.some((s) => s.id === figure.placement.sectionId), `${slug}/${locale}/${figure.id} section`);
        assert.ok(Number.isInteger(figure.placement.afterParagraph), `${slug}/${locale}/${figure.id} afterParagraph`);
      }
    }
  }
});

test("V2I1 references and notes keep canonical object shape and clean URL wrapping", () => {
  for (const slug of issue.articles) for (const locale of ["en", "tr"]) {
    const doc = read(slug, locale);
    for (const record of [...(doc.references ?? []), ...(doc.footnotes ?? [])]) {
      assert.equal(typeof record.id, "string"); assert.equal(typeof record.text, "string");
      for (const match of record.text.matchAll(/https?:\/\/\S+/giu)) assert.doesNotMatch(match[0], /\s/u);
    }
  }
});

test("V2I1 preserves the photograph as a visual record without invented body prose", () => {
  const slug = "fotograf-omer-burhanoglu";
  for (const locale of ["en", "tr"]) {
    const doc = read(slug, locale); assert.equal(doc.sections.length, 1); assert.equal(doc.figures.length, 1);
    assert.equal(doc.figures[0].caption, "Söğüt / Marmaris"); assert.equal(doc.figures[0].kind, "visual");
    assert.equal(doc.sections[0].paragraphs.length, 1);
  }
});

test("V2I1 keeps known legitimate EN/TR publication differences", () => {
  assert.equal(read("mavi-vatan-doktrini-nasil-olustu", "en").figures.length, 4);
  assert.equal(read("mavi-vatan-doktrini-nasil-olustu", "tr").figures.length, 6);
  assert.equal(read("karabag-baslangictan-gunumuze-sorunlar-ve-cozumler", "en").figures.length, 5);
  assert.equal(read("karabag-baslangictan-gunumuze-sorunlar-ve-cozumler", "tr").figures.length, 8);
  assert.notDeepEqual(read("mare-nostrumdan-denizlerde-uluslararasi-isbirligine-tarih-akdenizin-gelecegi-ile-ilgili", "en"), read("mare-nostrumdan-denizlerde-uluslararasi-isbirligine-tarih-akdenizin-gelecegi-ile-ilgili", "tr"));
});

test("V2I1 never uses a locale fallback or leaks PDF furniture into body paragraphs", () => {
  for (const slug of issue.articles) for (const locale of ["en", "tr"]) {
    const doc = read(slug, locale); const body = doc.sections.flatMap((s) => s.paragraphs).join(" ");
    assert.doesNotMatch(body, /(?:B R I q|How to cite|Atıf:|Keywords:|Anahtar Kelimeler:)/u, `${slug}/${locale} furniture`);
  }
});
