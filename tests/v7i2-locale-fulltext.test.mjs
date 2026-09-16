import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const issue = JSON.parse(fs.readFileSync("content/issues/v07-i02.json", "utf8"));
const catalog = JSON.parse(fs.readFileSync("content/catalog.json", "utf8"));
const prose = [
  ["sovyet-reformunun-tarihi-trajedisinden-bizi-kurtaran-ne-oldu-cinin-ekonomik-cagdaslasmasina-yon-0", 5, 5, 13, 13],
  ["cine-ozgu-sosyalist-politik-ekonomiye-genel-bakis", 12, 12, 7, 7],
  ["afrikada-yabanci-guclerin-mudahaleleri-elestirel-bir-degerlendirme", 14, 14, 55, 55],
  ["uluslararasi-kalkinma-isbirliginin-ic-siyasal-mantigi-guneydogu-asyada-kusak-ve-yol-girisiminin", 12, 12, 30, 30],
  ["hitlerin-sovyetler-birligine-karsi-savasi-ayni-zamanda-abd-icin-bir-vekalet-savasiydi", 39, 39, 30, 30],
  ["japonyadaki-abd-isgaline-karsi-sag-ve-sol-arasinda-olasi-ittifak", 5, 5, 4, 4],
];
const read = (slug, locale) => JSON.parse(fs.readFileSync(path.join("content/articles", slug, "fulltext", locale + ".json"), "utf8"));
const published = (meta) => meta.schemaVersion === 2 ? meta.dates?.published : meta.published_online_date;

test("V7I2 uses only canonical locale-split full-text files", () => {
  assert.equal(issue.articles.length, 11);
  for (const slug of issue.articles) {
    const dir = path.join("content/articles", slug, "fulltext");
    assert.deepEqual(fs.readdirSync(dir).sort(), ["en.json", "tr.json"], slug);
    assert.ok(catalog.fulltext.localized.includes(slug), slug);
    assert.ok(!catalog.fulltext.current.includes(slug), slug);
    assert.ok(!catalog.fulltext.en_archive.includes(slug), slug);
    const meta = JSON.parse(fs.readFileSync(path.join("content/articles", slug, "metadata.json"), "utf8"));
    assert.equal(published(meta), "2026-03-01", slug);
  }
});

test("V7I2 preserves the six existing bilingual scholarly/opinion texts losslessly at the structural boundary", () => {
  for (const [slug, trSections, enSections, trRefs, enRefs] of prose) {
    const tr = read(slug, "tr"); const en = read(slug, "en");
    assert.equal(tr.sections.length, trSections, slug + " tr sections");
    assert.equal(en.sections.length, enSections, slug + " en sections");
    assert.equal(tr.references?.length ?? 0, trRefs, slug + " tr refs");
    assert.equal(en.references?.length ?? 0, enRefs, slug + " en refs");
    assert.notDeepEqual(tr, en, slug + " locales");
  }
});

test("V7I2 reconstructs poems and visual contributions without PDF extraction noise", () => {
  for (const slug of issue.articles.slice(6)) {
    const tr = read(slug, "tr"); const en = read(slug, "en");
    const raw = JSON.stringify({tr,en});
    assert.doesNotMatch(raw, /B R I q|Volu me|Sa yı|How to cite:|\bAtıf:/u, slug);
    assert.doesNotMatch(raw, /�|Ã.|Â.|â€|â€™/u, slug);
    assert.ok(tr.sections?.length, slug + " tr");
    assert.ok(en.sections?.length, slug + " en");
  }
  const liEn = JSON.stringify(read("siir-li-bai-zor-yolculuk", "en"));
  assert.match(liEn, /li_bai_2012_8\.pdf/u);
  assert.doesNotMatch(liEn, /li_ bai|\b248\b/u);
  const zhangEn = JSON.stringify(read("zhang-yaxin", "en"));
  assert.match(zhangEn, /Revolutionary operas or model operas/u);
  assert.doesNotMatch(zhangEn, /Devrimci operalar veya model operalar/u);
});

test("V7I2 preserves article-history dates from the legacy bilingual containers", () => {
  const expected = {
    "sovyet-reformunun-tarihi-trajedisinden-bizi-kurtaran-ne-oldu-cinin-ekonomik-cagdaslasmasina-yon-0": ["2025-12-30", null, "2026-01-19"],
    "cine-ozgu-sosyalist-politik-ekonomiye-genel-bakis": ["2026-01-27", null, "2026-02-08"],
    "afrikada-yabanci-guclerin-mudahaleleri-elestirel-bir-degerlendirme": ["2025-11-16", "2025-12-30", "2026-02-07"],
    "uluslararasi-kalkinma-isbirliginin-ic-siyasal-mantigi-guneydogu-asyada-kusak-ve-yol-girisiminin": ["2025-11-26", "2026-01-23", "2026-02-07"],
    "hitlerin-sovyetler-birligine-karsi-savasi-ayni-zamanda-abd-icin-bir-vekalet-savasiydi": ["2025-11-07", null, "2026-01-31"],
    "japonyadaki-abd-isgaline-karsi-sag-ve-sol-arasinda-olasi-ittifak": ["2025-09-22", "2025-12-30", "2026-01-31"],
  };
  for (const [slug, dates] of Object.entries(expected)) {
    const m = JSON.parse(fs.readFileSync(path.join("content/articles", slug, "metadata.json"), "utf8"));
    const actual = m.schemaVersion === 2 ? [m.dates.received, m.dates.revised, m.dates.accepted] : [m.received_date ?? null, m.revised_date ?? null, m.accepted_date ?? null];
    assert.deepEqual(actual, dates, slug);
  }
});
