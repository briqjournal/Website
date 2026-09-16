import test from "node:test";
import assert from "node:assert/strict";
import { loadFullTextCollections } from "../scripts/content-store.mjs";

const slug = "turkiye-cin-diplomatik-iliskilerinin-55-yilinda-avrasyada-guc-gecisi-ve-jeoekonomik-baglantisallik";

test("keeps the Çomak-Toker-Manioğlu article bilingual instead of duplicating Turkish into English", async () => {
  const { current } = await loadFullTextCollections();
  const record = current[slug];

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

  assert.equal(record.tr.keywords.length, record.en.keywords.length);
  assert(record.en.figures.every((figure) => /[A-Za-z]/u.test(figure.caption)));
  assert.equal(record.en.figures[2].caption, "Table 1: Indicators used to distinguish a transit country from a joint production hub");
});
