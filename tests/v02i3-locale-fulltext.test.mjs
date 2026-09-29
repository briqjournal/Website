import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const issue = JSON.parse(fs.readFileSync("content/issues/v02-i03.json", "utf8"));
const catalog = JSON.parse(fs.readFileSync("content/catalog.json", "utf8"));
const read = (slug, locale) =>
  JSON.parse(fs.readFileSync(path.join("content/articles", slug, "fulltext", locale + ".json"), "utf8"));

// 10 records × 2 locales = the 20 published full-text routes of v02-i03
const structure = {
  "cinin-cevre-politikalarinin-ekolojik-uygarliga-dogru-gelisimi": { en: [5, 72], tr: [5, 71] },
  "ekolojik-uygarlik-tum-canlilar-icin-ortak-bir-gelecek-insasi": { en: [1, 0], tr: [1, 0] },
  "turkiyenin-guncel-iklim-degisikligi-stratejisinin-ana-yonelimi": { en: [4, 20], tr: [4, 20] },
  "ekolojik-uygarlikta-enerji-cevre-kesisimi": { en: [11, 22], tr: [11, 22] },
  "iklim-acil-durumu-pandemi-ve-binalar-arasindaki-iliski-covid-19un-artik-bir-asisi-var-ancak-iklim": { en: [7, 14], tr: [7, 14] },
  "bati-cephesindeki-sessizlik": { en: [1, 0], tr: [1, 0] },
  "1920-1930lardaki-cin-gazetelerinde-bir-rol-model-olarak-turkiye": { en: [1, 0], tr: [1, 0] },
  "sadik-ucok": { en: [1, 0], tr: [1, 0] },
  "ekrem-kahraman": { en: [1, 0], tr: [1, 0] },
  "askin-ayrancioglu": { en: [1, 0], tr: [1, 0] },
};

test("V2I3 registers all 20 published full-text routes in the canonical localized catalog", () => {
  assert.equal(issue.articles.length, 10);
  for (const slug of issue.articles) {
    const dir = path.join("content/articles", slug, "fulltext");
    assert.deepEqual(fs.readdirSync(dir).sort(), ["en.json", "tr.json"], slug);
    assert.ok(catalog.fulltext.localized.includes(slug), slug);
    assert.ok(!catalog.fulltext.current.includes(slug), slug);
    assert.ok(!catalog.fulltext.en_archive.includes(slug), slug);
  }
});

test("V2I3 keeps published section/reference structure with legitimate EN/TR differences", () => {
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

test("V2I3 reconstructs tables as semantic data and keeps them out of the body", () => {
  for (const slug of ["cinin-cevre-politikalarinin-ekolojik-uygarliga-dogru-gelisimi", "turkiyenin-guncel-iklim-degisikligi-stratejisinin-ana-yonelimi"]) {
    for (const locale of ["en", "tr"]) {
      const doc = read(slug, locale);
      assert.ok(doc.tables.length >= 1, `${slug}/${locale} tables`);
      for (const table of doc.tables) {
        assert.ok(table.headers.length >= 1, `${slug}/${locale}/${table.id} headers`);
        assert.ok(table.rows.length >= 5, `${slug}/${locale}/${table.id} rows`);
        assert.ok(table.placement?.sectionId, `${slug}/${locale}/${table.id} placement`);
        assert.ok(Number.isInteger(table.placement?.afterParagraph), `${slug}/${locale}/${table.id} afterParagraph`);
      }
    }
  }
});

test("V2I3 preserves visual/non-standard records with exact production assets", () => {
  for (const slug of ["sadik-ucok", "ekrem-kahraman", "askin-ayrancioglu"]) {
    for (const locale of ["en", "tr"]) {
      const doc = read(slug, locale);
      assert.equal(doc.sections.length, 1, `${slug}/${locale}`);
      assert.equal(doc.figures.length, 1, `${slug}/${locale} figures`);
      const src = doc.figures[0].src;
      assert.ok(src.startsWith("/assets/article-figures/"), src);
      assert.ok(fs.existsSync(path.join("public", src)), src);
    }
  }
});

test("V2I3 speech keeps the published paragraph structure with notes outside the body", () => {
  const slug = "ekolojik-uygarlik-tum-canlilar-icin-ortak-bir-gelecek-insasi";
  const en = read(slug, "en");
  const tr = read(slug, "tr");
  assert.ok(en.sections[0].paragraphs.length >= 15, "en body paragraphs");
  assert.ok(tr.sections[0].paragraphs.length >= 15, "tr body paragraphs");
  assert.equal(en.footnotes.length, 2, "en source/title notes");
  assert.equal(tr.footnotes.length, 2, "tr source/title notes");
  for (const doc of [en, tr]) {
    const body = doc.sections.flatMap((s) => s.paragraphs).join(" ");
    assert.doesNotMatch(body, /We present to your attention|Çin Halk Cumhuriyeti Cumhurbaşkanı Xi Jinping'in 30 Eylül/u, "front matter leaked into body");
  }
});

test("V2I3 reference URLs and DOIs remain free of PDF line-break corruption", () => {
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

test("V2I3 never falls back from an English page to Turkish full text", () => {
  for (const slug of issue.articles) {
    if (slug === "askin-ayrancioglu") continue; // shared-bilingual printed page (v04-i02 football-fans precedent)
    const en = read(slug, "en");
    const body = en.sections.flatMap((s) => s.paragraphs).join(" ");
    const hits = body.match(/\b(ve|bir|bu|için|olarak|olan|çok|daha|ancak|çünkü|gibi|sonra|göre|üzerine|arasında|tarafından)\b/gu) || [];
    assert.ok(hits.length < 8, `${slug}: Turkish contamination candidates ${hits.slice(0, 8)}`);
  }
});
