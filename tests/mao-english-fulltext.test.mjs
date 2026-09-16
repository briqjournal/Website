import test from "node:test";
import assert from "node:assert/strict";
import { loadFullTextCollections } from "../scripts/content-store.mjs";

const slug = "mao-zedungun-diyalektik-anlayisi-ekonomik-determinizm-elestirisi-siyasal-ozne-ve-cin-dusunce";

const headings = [
  "Introduction",
  "Methodology",
  "Sources of Mao’s Dialectical Thought",
  "The Fundamental Principles of Dialectics in Mao",
  "Conclusion",
];

test("keeps the Mao article in clean locale-split English full text", async () => {
  const { localized, current, enArchive } = await loadFullTextCollections();
  const record = localized[slug];

  assert(record, "Expected localized Mao record");
  assert.equal(current[slug], undefined);
  assert.equal(enArchive[slug], undefined);
  assert.deepEqual(record.en.sections.map((section) => section.title), headings);
  assert.deepEqual(record.en.sections.map((section) => section.paragraphs.length), [6, 1, 14, 24, 6]);

  const body = record.en.sections.flatMap((section) => [section.title, ...section.paragraphs]).join("\n");
  assert.match(body, /^Introduction\nMao Zedong’s understanding of dialectics was shaped/u);
  assert.match(body, /Sources of Mao’s Dialectical Thought/u);
  assert.match(body, /from the masses, to the masses/u);
  assert.match(body, /Great Proletarian Cultural Revolution/u);
  assert.doesNotMatch(body, /\b(?:Giriş|Yöntem|Sonuç)\b/u);
  assert.doesNotMatch(body, /(?:B R I q •|Can Ulusoy- Mao Zedong)/u);

  assert.deepEqual(record.en.keywords, ["Dialectics", "Mao Zedong", "Mao Zedong Thought", "Mass Line", "Political Subject", "Traditional Chinese Thought"]);
  assert.equal(record.en.references.length, 35);
  assert(record.en.references.some((reference) => reference.text.includes("10.4312/as.2019.7.1.55-73")));
  assert.equal(record.en.figures.length, 6);
  assert.match(record.en.figures[0].caption, /^Xi Jinping, general secretary/u);
  assert.match(record.en.figures[5].caption, /^Mao Zedong and Joseph Stalin/u);
  assert(record.en.figures.every((figure) => !/(?:Fotoğraf|Çin’in|Büyük İleri)/u.test(figure.caption)));
});
