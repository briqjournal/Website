import test from "node:test";
import assert from "node:assert/strict";
import { bilingualKeywordParityOverrides, loadFullTextCollections } from "../scripts/content-store.mjs";

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
  const { localized, current, enArchive } = await loadFullTextCollections();
  let count = 0;

  for (const record of [...Object.values(localized), ...Object.values(current)]) {
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


  assert(count > 0, "Expected at least one keyword to validate");
});

test("preserves acronyms while fixing known keyword spacing and casing", async () => {
  const { localized, current } = await loadFullTextCollections();
  const relations = localized["turkiye-cin-diplomatik-iliskilerinin-55-yilinda-avrasyada-guc-gecisi-ve-jeoekonomik-baglantisallik"];
  assert(relations.tr.keywords.includes("Türkiye-Çin İlişkileri"));
  assert(relations.en.keywords.includes("Türkiye-China Relations"));

  const development = current["uluslararasi-kalkinma-isbirliginin-ic-siyasal-mantigi-guneydogu-asyada-kusak-ve-yol-girisiminin"];
  assert(development.en.keywords.includes("Belt And Road Initiative"));
  assert(development.en.keywords.includes("Global South"));
  assert(development.en.keywords.includes("International Development Cooperation"));

  const acronyms = relations.tr.keywords.filter((keyword) => /\b(?:ABD|KYG|BIS)\b/u.test(keyword));
  for (const keyword of acronyms) assert.match(keyword, /\b(?:ABD|KYG|BIS)\b/u);
});

test("keeps bilingual keyword counts and reviewed ordering in parity", async () => {
  const { localized, current } = await loadFullTextCollections();

  for (const [slug, record] of [...Object.entries(localized), ...Object.entries(current)]) {
    const tr = record?.tr?.keywords || [];
    const en = record?.en?.keywords || [];
    assert.equal(tr.length, en.length, `Turkish/English keyword count mismatch for ${slug}`);
  }

  for (const [slug, override] of bilingualKeywordParityOverrides) {
    assert.equal(override.tr.length, override.en.length, `Reviewed keyword pair count mismatch for ${slug}`);
    assert(["tr", "en"].includes(override.source), `Missing source-language decision for ${slug}`);
  }

  const onishi = current["japonyadaki-abd-isgaline-karsi-sag-ve-sol-arasinda-olasi-ittifak"];
  assert.deepEqual(onishi.en.keywords, ["Exclusionism", "Japanese Communist Party", "Right Wing And Left Wing In Japan", "Sanseito Party", "USA"]);
  assert.deepEqual(onishi.tr.keywords, ["Dışlayıcılık", "Japonya Komünist Partisi", "Japonya'da Sağ Ve Sol", "Sanseito Partisi", "ABD"]);

  const ertan = current["iklim-degisikligi-baglaminda-su-kitligi-ve-kuresel-gida-krizi"];
  assert.deepEqual(ertan.tr.keywords, ["Gıda Güvencesi", "İklim Akıllı Tarım", "İklim Değişikliği", "Su Güvenliği", "Sürdürülebilir Kalkınma"]);
  assert.deepEqual(ertan.en.keywords, ["Food Security", "Climate-Smart Agriculture", "Climate Change", "Water Security", "Sustainable Development"]);

  const kolosovskiy = current["rusyanin-bolgesel-guvenlikteki-rolu-uzerine-bir-inceleme-kolektif-guvenlik-antlasmasi-orgutu-ve"];
  assert.deepEqual(kolosovskiy.en.keywords, ["Central Asian Security", "Counterterrorism Strategies", "CSTO", "Islamic Radicalism", "Russia’s Foreign Policy", "Transnational Jihadist Networks"]);
  assert.deepEqual(kolosovskiy.tr.keywords, ["Orta Asya Güvenliği", "Teröre Karşı Mücadele Stratejileri", "KGAÖ", "İslami Radikalizm", "Rusya’nın Dış Politikası", "Ulusötesi Cihatçı Ağlar"]);

  assert.equal(bilingualKeywordParityOverrides.get("kultur-varliklarinin-yasadisi-ithalatinin-onlenmesi-ve-iadesine-iliskin-turkiye-ile-isvicre")?.source, "tr");
  assert.equal(bilingualKeywordParityOverrides.get("turkiye-cin-diplomatik-iliskilerinin-55-yilinda-avrasyada-guc-gecisi-ve-jeoekonomik-baglantisallik")?.source, "tr");
  assert.equal(bilingualKeywordParityOverrides.get("mao-zedungun-diyalektik-anlayisi-ekonomik-determinizm-elestirisi-siyasal-ozne-ve-cin-dusunce")?.source, "tr");
  assert.equal(bilingualKeywordParityOverrides.get("iklim-degisikligi-baglaminda-su-kitligi-ve-kuresel-gida-krizi")?.source, "tr");
  assert.equal(bilingualKeywordParityOverrides.get("rusyanin-bolgesel-guvenlikteki-rolu-uzerine-bir-inceleme-kolektif-guvenlik-antlasmasi-orgutu-ve")?.source, "en");
});
