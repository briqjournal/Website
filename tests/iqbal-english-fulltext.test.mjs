import test from "node:test";
import assert from "node:assert/strict";
import { loadFullTextCollections } from "../scripts/content-store.mjs";

const slug = "filistinciligin-zirve-paradoksu-transatlantik-kamuoyu-stratejik-realizm-ve-iki-devletli-cozumun";

const headings = [
  "Introduction",
  "Research Design, Analytical Approach, and Sources",
  "Palestinianism as a Transatlantic Political-Rhetorical Phenomenon",
  "The Transatlantic Public Opinion Shift",
  "The American Trajectory",
  "The European Trajectory",
  "Generational and Institutional Dimensions",
  "Strategic Realism: The U.S.–Gulf–Israel–Iran Convergence",
  "The Twelve-Day War and the Striking of Iranian Nuclear Infrastructure",
  "The Degradation of the Axis of Resistance",
  "The Resilience and Quiet Expansion of the Abraham Accords",
  "The Saudi-Israeli Trajectory",
  "The Trump Administration and the Architecture of Regional Hegemony",
  "The End of the Two-State Solution: Extending the JST Argument",
  "Conclusion: Strategic Divergence and the Future of the Western Alliance",
];

const paragraphCounts = [6, 3, 7, 2, 4, 3, 4, 1, 4, 4, 4, 3, 4, 9, 7];

test("keeps the Iqbal Akhtar article in clean locale-split English full text", async () => {
  const { localized, current, enArchive } = await loadFullTextCollections();
  const record = localized[slug];

  assert(record, "Expected localized Iqbal Akhtar record");
  assert.equal(current[slug], undefined);
  assert.equal(enArchive[slug], undefined);
  assert.deepEqual(record.en.sections.map((section) => section.title), headings);
  assert.deepEqual(record.en.sections.map((section) => section.paragraphs.length), paragraphCounts);

  const body = record.en.sections.flatMap((section) => [section.title, ...section.paragraphs]).join("\n");
  assert.match(body, /^Introduction\nIn the final week of September 2025/u);
  assert.match(body, /Palestinianism as a Transatlantic Political-Rhetorical Phenomenon/u);
  assert.match(body, /The U\.S\.–Gulf–Israel–Iran Convergence/u);
  assert.match(body, /The Twelve-Day War and the Striking of Iranian Nuclear Infrastructure/u);
  assert.match(body, /The End of the Two-State Solution: Extending the JST Argument/u);
  assert.match(body, /Conclusion: Strategic Divergence and the Future of the Western Alliance/u);
  assert.doesNotMatch(body, /(?:Giriş|Araştırma Tasarımı|Transatlantik Kamuoyundaki Dönüşüm|Sonuç)/u);
  assert.doesNotMatch(body, /(?:B R I q •|Iqbal Akhtar - The Paradox of Peak Palestinianism:|Amer463|po469)/u);

  assert.deepEqual(record.en.keywords, ["Abraham Accords", "Iran", "Palestinianism", "Transatlantic Relations", "Two-State Solution"]);
  assert.equal(record.en.references.length, 70);
  assert.equal(record.en.figures.length, 7);
  assert.match(record.en.figures[0].caption, /^As of September 22, 2025/u);
  assert.equal(record.en.figures[0].kind, "figure");
  assert.deepEqual(record.en.figures[0].placement, { sectionId: "en-section-1", afterParagraph: 6 });
  assert.match(record.en.figures[0].src, /G1ZOhMoWEAAvhVl\.jpeg$/u);
  assert.match(record.en.figures[5].caption, /^IMEC is an example/u);
  assert.match(record.en.figures[6].caption, /^In 2024, the Israeli government declared/u);
  assert(record.en.figures.every((figure) => !/(?:Fotoğraf|Harita|Tablo|Filistin yanlısı|Batı Şeria)/u.test(figure.caption)));

  assert.equal(record.en.tables.length, 1);
  assert.equal(record.en.tables[0].id, "table-1");
  assert.equal(record.en.tables[0].rows.length, 11);
  assert.deepEqual(record.en.tables[0].placement, { sectionId: "en-section-4", afterParagraph: 2 });
  assert.match(record.en.tables[0].caption, /^Table 1: Principal transatlantic public-opinion surveys/u);
  assert.equal(record.en.tables[0].note, "Compiled by the author.");
  assert.equal(record.en.figures.some((figure) => ["figure-3", "figure-4"].includes(figure.id)), false);
});
