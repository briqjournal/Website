import test from "node:test";
import assert from "node:assert/strict";
import { loadFullTextCollections } from "../scripts/content-store.mjs";

const slug = "cinin-kuresel-altyapi-stratejisi";

test("keeps the Koshy book review in clean locale-split canonical full text", async () => {
  const { localized, current, enArchive } = await loadFullTextCollections();
  const record = localized[slug];

  assert(record, "Expected localized Koshy record");
  assert.equal(current[slug], undefined);
  assert.equal(enArchive[slug], undefined);
  assert.equal(record.en.sections.length, 1);
  assert.equal(record.en.sections[0].title, "Full text");
  assert.equal(record.en.sections[0].paragraphs.length, 8);

  const body = record.en.sections[0].paragraphs.join("\n");
  assert.match(body, /^A persistent weakness in Belt and Road Initiative scholarship/u);
  assert.match(body, /approximately 4,000 projects from 1949 to 1999/u);
  assert.match(body, /UN Resolution 2758 in 1971/u);
  assert.match(body, /preference for higher quality and lower risk/u);
  assert.doesNotMatch(body, /(?:KUŞAK VE YOL|Çin’in|KYG’nin|yönelik)/u);
  assert.doesNotMatch(body, /A PERSISTENT WEAKNESS IN BELT AND ROAD\s+ical context/u);

  assert.equal(record.en.figures.length, 2);
  assert.equal(record.en.figures[0].caption, "Austin Strange, Chinese Global Infrastructure (Cambridge University Press, 2024).");
  assert.equal(record.en.figures[1].caption, "China will continue promoting BRI infrastructure development with established advantages (Illustration: Tang Tengfei/Global Times, 2023).");
  assert.equal(record.tr.sections[0].paragraphs.length, 8);
});
