import test from "node:test";
import assert from "node:assert/strict";
import { loadFullTextCollections } from "../scripts/content-store.mjs";

const slug = "dijital-ipek-yolu-cercevesinde-cin-arap-isbirligi-urdun-ornegi";

const englishHeadings = [
  "Introduction",
  "Methodology",
  "The Digital Silk Road Initiative and China-Jordan Cooperation",
  "The Evolving Concept of the Digital Silk Road and Its Global Context",
  "The Iterative Upgrading of Jordan’s Digital Transformation Strategy",
  "Jordan’s National Characteristics and Demand for Digital Partners",
  "Consolidation and Institutionalization of the China-Jordan Digital Cooperation Framework",
  "Recent Developments in Chinese Enterprises’ Participation in Jordan’s Digital Construction",
  "Opportunities and Challenges",
  "Opportunities",
  "Challenges",
  "Conclusion",
];

test("keeps the Jordan article in clean locale-split canonical full text", async () => {
  const { localized, current, enArchive } = await loadFullTextCollections();
  const record = localized[slug];

  assert(record, "Expected localized Jordan full-text record");
  assert.equal(current[slug], undefined);
  assert.equal(enArchive[slug], undefined);
  assert.deepEqual(record.en.sections.map((section) => section.title), englishHeadings);
  assert.equal(record.en.sections.length, 12);
  assert.deepEqual(record.en.sections.map((section) => section.paragraphs.length), [6, 2, 1, 4, 3, 3, 4, 4, 1, 5, 5, 3]);
  assert.equal(record.en.sections[9].level, "subsection");
  assert.equal(record.en.sections[9].toc, false);
  assert.equal(record.en.sections[10].level, "subsection");
  assert.equal(record.en.sections[10].toc, false);

  const englishBody = record.en.sections.flatMap((section) => [section.title, ...section.paragraphs]).join("\n");
  assert.match(englishBody, /^Introduction\nThe rapid advancement of digital technologies/u);
  assert.match(englishBody, /The Iterative Upgrading of Jordan’s Digital Transformation Strategy/u);
  assert.match(englishBody, /Debt sustainability and financial transparency/u);
  assert.doesNotMatch(englishBody, /\b(?:Giriş|Yöntem|Sonuç)\b/u);
  assert.doesNotMatch(englishBody, /THE RAPID ADVANCEMENT OF DIGITAL Forum/u);
  assert.doesNotMatch(englishBody, /(?:eco429|chal433|re435|understand437|con441)/u);

  assert.deepEqual(record.en.keywords, ["China-Arab Cooperation", "Digital Infrastructure", "Digital Silk Road", "Digital Transformation", "Jordan"]);
  assert.equal(record.en.references.length, 34);
  assert.match(record.en.references[0].text, /\(2025, July 7\)/u);
  assert.match(record.en.references[2].text, /Article 446/u);
  assert.match(record.en.references[32].text, /\(6th ed\.\)/u);
  assert(record.en.references.every((reference) => !/(?:Temmuz|Nisan|Kasım|Makale|baskı)/u.test(reference.text)));

  assert.equal(record.en.figures.length, 8);
  assert.match(record.en.figures[0].caption, /^The DSR aims to promote digital connectivity/u);
  assert.match(record.en.figures[7].caption, /^Jordan’s national digital transformation strategy/u);
  assert(record.en.figures.every((figure) => !/(?:Fotoğraf|Çizim|Ürdün)/u.test(figure.caption)));

  assert.match(record.en.declarations.funding, /D5000260296/u);
  assert.match(record.tr.declarations.funding, /D5000260296/u);
  assert.doesNotMatch(record.en.sections.at(-1).paragraphs.at(-1), /D5000260296/u);
  assert.doesNotMatch(record.tr.sections.at(-1).paragraphs.at(-1), /D5000260296/u);
});
