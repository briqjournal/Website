import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const issue = JSON.parse(fs.readFileSync("content/issues/v02-i04.json", "utf8"));
const catalog = JSON.parse(fs.readFileSync("content/catalog.json", "utf8"));
const read = (slug, locale) =>
  JSON.parse(fs.readFileSync(path.join("content/articles", slug, "fulltext", locale + ".json"), "utf8"));

// 10 records × 2 locales = the 20 published full-text routes of v02-i04
const structure = {
  "ipek-yolunda-kulturel-bir-gezinti-ahmet-yeseviden-yunus-emreye-turk-sufi-humanizmi": { en: [15, 16], tr: [15, 16] },
  "zaman-ve-mekani-asacak-yeni-bir-medeniyet-icin-isbirligi": { en: [4, 0], tr: [4, 0] },
  "cin-ve-arap-ulkeleri-arasindaki-kulturel-alisverislerin-gelisimi-kusak-ve-yol-caginda-firsatlar-ve": { en: [7, 43], tr: [7, 45] },
  "kusak-yolun-kalp-atislari": { en: [8, 0], tr: [8, 0] },
  "senin-kokun-duydu-canim-yunus-emre-misralari-anadolu-xiii-xiv-yuzyillar": { en: [8, 6], tr: [8, 6] },
  "kusak-ve-yol-girisimi-kapsaminda-cinin-ortadogu-ile-kulturel-iletisimi-degerlendirme-ve-beklentiler": { en: [5, 28], tr: [5, 28] },
  "macaes-b-2019-kusak-ve-yol-cinli-bir-dunya-duzeni-londra-hurst-company": { en: [1, 0], tr: [1, 0] },
  "ibrahim-balaban": { en: [1, 0], tr: [1, 0] },
  "ipek-yolunun-geri-donusu": { en: [1, 0], tr: [1, 0] },
  "karikatur-0": { en: [1, 0], tr: [1, 0] },
};

test("V2I4 registers all 20 published full-text routes in the canonical localized catalog", () => {
  assert.equal(issue.articles.length, 10);
  for (const slug of issue.articles) {
    const dir = path.join("content/articles", slug, "fulltext");
    assert.deepEqual(fs.readdirSync(dir).sort(), ["en.json", "tr.json"], slug);
    assert.ok(catalog.fulltext.localized.includes(slug), slug);
    assert.ok(!catalog.fulltext.current.includes(slug), slug);
    assert.ok(!catalog.fulltext.en_archive.includes(slug), slug);
  }
});

test("V2I4 keeps published section/reference structure with legitimate EN/TR differences", () => {
  for (const [slug, expected] of Object.entries(structure)) {
    for (const locale of ["en", "tr"]) {
      const doc = read(slug, locale);
      assert.equal(doc.sections.length, expected[locale][0], `${slug}/${locale} sections`);
      assert.equal(doc.references?.length ?? 0, expected[locale][1], `${slug}/${locale} references`);
      assert.ok((doc.sections || []).every((s) => (s.paragraphs || []).length > 0), `${slug}/${locale} paragraphs`);
      assert.notDeepEqual(read(slug, "en"), read(slug, "tr"), `${slug} locales`);
    }
  }
});

test("V2I4 reconstructs tables as semantic data and keeps them out of the body", () => {
  const slug = "cin-ve-arap-ulkeleri-arasindaki-kulturel-alisverislerin-gelisimi-kusak-ve-yol-caginda-firsatlar-ve";
  for (const locale of ["en", "tr"]) {
    const doc = read(slug, locale);
    assert.equal(doc.tables.length, 3, `${locale} tables`);
    for (const table of doc.tables) {
      assert.ok(table.headers.length >= 2, `${locale}/${table.id} headers`);
      assert.ok(table.rows.length >= 10, `${locale}/${table.id} rows`);
      assert.ok(table.placement?.sectionId, `${locale}/${table.id} placement`);
      assert.ok(Number.isInteger(table.placement?.afterParagraph), `${locale}/${table.id} afterParagraph`);
    }
    const body = doc.sections.flatMap((s) => s.paragraphs).join(" ");
    assert.doesNotMatch(body, /^Table \d|\nTable \d/u, `${locale} table text leaked into body`);
  }
});

test("V2I4 preserves visual/non-standard records with exact production assets", () => {
  for (const slug of ["ibrahim-balaban", "ipek-yolunun-geri-donusu", "karikatur-0"]) {
    for (const locale of ["en", "tr"]) {
      const doc = read(slug, locale);
      assert.equal(doc.sections.length, 1, `${slug}/${locale}`);
      assert.equal(doc.figures.length, 1, `${slug}/${locale} figures`);
      const src = doc.figures[0].src;
      assert.ok(src.startsWith("/assets/article-figures/"), src);
      assert.ok(fs.existsSync(path.join("public", src)), src);
      const raw = JSON.stringify(doc);
      assert.doesNotMatch(raw, /Devrimci operalar|Revolutionary operas/u, `${slug}/${locale} cross-record contamination`);
    }
  }
});

test("V2I4 poems keep the published line structure with notes outside the verse body", () => {
  const slug = "senin-kokun-duydu-canim-yunus-emre-misralari-anadolu-xiii-xiv-yuzyillar";
  const en = read(slug, "en");
  const tr = read(slug, "tr");
  assert.ok(en.sections[1].paragraphs.length >= 10, "en verse lines");
  assert.ok(tr.sections[1].paragraphs.length >= 10, "tr verse lines");
  assert.ok(en.footnotes.length >= 9, "en source/translator notes");
  assert.ok(tr.footnotes.length >= 9, "tr source/translator notes");
  for (const doc of [en, tr]) {
    for (const section of doc.sections) {
      for (const p of section.paragraphs) {
        assert.doesNotMatch(p, /^(Çeviri|Translated by|Kaynak:)/u, "note leaked into verse");
      }
    }
  }
});

test("V2I4 reference URLs and DOIs remain free of PDF line-break corruption", () => {
  const normalize = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
  for (const slug of issue.articles) {
    for (const locale of ["en", "tr"]) {
      const doc = read(slug, locale);
      for (const record of [...(doc.references ?? []), ...(doc.footnotes ?? [])]) {
        const text = normalize(typeof record === "string" ? record : record.text);
        for (const match of text.matchAll(/https?:\/\/\S+/giu)) {
          assert.doesNotMatch(match[0], /\s/u, `${slug}/${locale}: ${match[0]}`);
        }
      }
    }
  }
});

test("V2I4 never falls back from an English page to Turkish full text", () => {
  for (const slug of issue.articles) {
    const en = read(slug, "en");
    const body = en.sections.flatMap((s) => s.paragraphs).join(" ");
    const hits = body.match(/\b(ve|bir|bu|için|olarak|olan|çok|daha|ancak|çünkü|gibi|sonra|göre|üzerine|arasında|tarafından)\b/gu) || [];
    assert.ok(hits.length < 8, `${slug}: Turkish contamination candidates ${hits.slice(0, 8)}`);
  }
});
