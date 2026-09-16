import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { loadFullTextCollections } from "../scripts/content-store.mjs";

const slug = "turkiye-cin-diplomatik-iliskilerinin-55-yilinda-avrasyada-guc-gecisi-ve-jeoekonomik-baglantisallik";

test("keeps the Çomak-Toker-Manioğlu article bilingual instead of duplicating Turkish into English", async () => {
  const { localized } = await loadFullTextCollections();
  const record = localized[slug];

  assert(record, "Expected current full-text record");
  assert.equal(record.tr.sections.length, 9);
  assert.equal(record.en.sections.length, 9);
  assert.equal(record.tr.sections[0].title, "Giriş");
  assert.equal(record.en.sections[0].title, "Introduction");
  assert.match(record.tr.sections[0].paragraphs[0], /^Uluslararası sistem/u);
  assert.match(record.en.sections[0].paragraphs[0], /^The international system/u);

  const englishBody = record.en.sections.flatMap((section) => [section.title, ...section.paragraphs]).join("\n");
  assert.doesNotMatch(englishBody, /\b(?:Giriş|Kuramsal Çerçeve|Yöntem, Veri Kaynakları|İlişkilerin Tarihsel Seyri|Sonuç)\b/u);
  assert.match(englishBody, /joint production hub/u);
  assert.match(englishBody, /Middle Corridor/u);
  assert.match(englishBody, /weaponized interdependence/u);

  assert.equal(
    record.tr.sections[4].title,
    "Güç Geçişi ve Jeoekonomik Bağlantısallık: Kuşak ve Yol Girişimi ile Orta Koridor",
  );
  assert.equal(
    record.en.sections[4].title,
    "Power Transition and Geoeconomic Connectivity: The Belt and Road Initiative and the Middle Corridor",
  );
  assert(!record.tr.sections[3].paragraphs.includes("Güç Geçişi ve Jeoekonomik Bağlantısallık:"));
  assert(!record.en.sections[3].paragraphs.includes("Power Transition and Geoeconomic Connectivity:"));

  assert.equal(record.tr.keywords.length, record.en.keywords.length);
  assert(record.tr.keywords.includes("Türkiye-Çin İlişkileri"));
  assert(record.en.keywords.includes("Türkiye-China Relations"));

  assert.equal(record.tr.references.length, 32);
  assert.equal(record.en.references.length, 32);
  assert(record.tr.references.some((reference) => reference.text.includes("10.25064/mulkiye.1300476")));
  assert(record.en.references.some((reference) => reference.text.includes("10.25064/mulkiye.1300476")));

  assert(record.en.figures.every((figure) => /[A-Za-z]/u.test(figure.caption)));
  assert.equal(record.en.figures[2].caption, "Table 1: Indicators used to distinguish a transit country from a joint production hub");
});


test("uses locale-split canonical files without article-specific render exceptions", async () => {
  const platform = await readFile(new URL("../app/components/ArticlePlatform.tsx", import.meta.url), "utf8");
  assert.match(platform, /loadLocalizedFullText/u);
  assert.doesNotMatch(platform, /COMAK_ENGLISH_FULLTEXT_SLUG/u);
  assert.doesNotMatch(platform, /SAUDI_CULTURAL_HEDGING_SLUG/u);
});
