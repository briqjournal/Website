import test from "node:test";
import assert from "node:assert/strict";
import { loadFullTextCollections } from "../scripts/content-store.mjs";

function assertTitleCase(keyword, locale) {
  const language = locale === "tr" ? "tr-TR" : "en-US";
  const words = keyword.match(/\p{L}[\p{L}\p{M}]*(?:['’]\p{L}[\p{L}\p{M}]*)?/gu) || [];
  for (const word of words) {
    const letters = word.replace(/[^\p{L}]/gu, "");
    if (letters.length > 1 && letters === letters.toLocaleUpperCase(language)) continue;
    const first = word.match(/\p{L}/u)?.[0];
    assert.equal(first, first?.toLocaleUpperCase(language), `Keyword word is not title-cased: ${keyword}`);
  }
}

test("normalizes every Turkish and English keyword to title case", async () => {
  const { current, enArchive, saudiEn } = await loadFullTextCollections();
  let count = 0;

  for (const record of Object.values(current)) {
    for (const locale of ["tr", "en"]) {
      for (const keyword of record?.[locale]?.keywords || []) {
        assertTitleCase(keyword, locale);
        count += 1;
      }
    }
  }

  for (const record of Object.values(enArchive)) {
    for (const keyword of record?.keywords || []) {
      assertTitleCase(keyword, "en");
      count += 1;
    }
  }

  for (const keyword of saudiEn?.keywords || []) {
    assertTitleCase(keyword, "en");
    count += 1;
  }

  assert.equal(count, 721);
});

test("preserves acronyms while fixing known keyword spacing and casing", async () => {
  const { current } = await loadFullTextCollections();
  const relations = current["turkiye-cin-diplomatik-iliskilerinin-55-yilinda-avrasyada-guc-gecisi-ve-jeoekonomik-baglantisallik"];
  assert(relations.tr.keywords.includes("Türkiye Çin İlişkileri"));
  assert(relations.en.keywords.includes("Türkiye China Relations"));

  const development = current["uluslararasi-kalkinma-isbirliginin-ic-siyasal-mantigi-guneydogu-asyada-kusak-ve-yol-girisiminin"];
  assert(development.en.keywords.includes("Belt And Road Initiative"));
  assert(development.en.keywords.includes("Global South"));
  assert(development.en.keywords.includes("International Development Cooperation"));

  const acronyms = relations.tr.keywords.filter((keyword) => /\b(?:ABD|KYG|BIS)\b/u.test(keyword));
  for (const keyword of acronyms) assert.match(keyword, /\b(?:ABD|KYG|BIS)\b/u);
});
