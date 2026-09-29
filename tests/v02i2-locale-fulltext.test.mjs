import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const issue = JSON.parse(fs.readFileSync("content/issues/v02-i02.json", "utf8"));
const catalog = JSON.parse(fs.readFileSync("content/catalog.json", "utf8"));
const read = (slug, locale) =>
  JSON.parse(fs.readFileSync(path.join("content/articles", slug, "fulltext", locale + ".json"), "utf8"));
const meta = (slug) => JSON.parse(fs.readFileSync(path.join("content/articles", slug, "metadata.json"), "utf8"));

// 11 records × 2 locales = the 22 published full-text routes of v02-i02
// values are [sections, references] per locale, as printed in the official locale PDFs
const structure = {
  "gorevimiz-kusak-yolda-ortak-gelisme-icin-bilimsel-isbirligi": { en: [13, 0], tr: [13, 0] },
  "pekin-bildirgesi": { en: [4, 0], tr: [4, 0] },
  "kusak-ve-yol-girisiminde-ortak-ve-surdurulebilir-bir-gelecek-icin-bilime-dayali-cozumler": { en: [6, 28], tr: [6, 28] },
  "bilimin-siniri-yoktur-ama-bilim-insanlarinin-vatani-vardir": { en: [4, 0], tr: [4, 0] },
  "ipek-yolunda-bilimsel-isbirligi": { en: [8, 25], tr: [8, 25] },
  "karadeniz-enerji-refah-ve-baris-denizi": { en: [14, 6], tr: [14, 6] },
  "covid-19-sonrasi-dunyada-saglik-ipek-yolundan-insan-sagligi-icin-ortak-gelecek-toplumuna": { en: [6, 29], tr: [6, 29] },
  "yunan-basbakani-venizelos-ile-tarihten-bir-soylesi": { en: [5, 6], tr: [5, 6] },
  "fotograf-0": { en: [1, 0], tr: [1, 0] },
  "sevgililer-tuvale-yagli-boya-ugur-durak": { en: [1, 0], tr: [1, 0] },
  "karikatur": { en: [1, 0], tr: [1, 0] },
};

test("V2I2 registers all 22 published full-text routes in the canonical localized catalog", () => {
  assert.equal(issue.articles.length, 11);
  for (const slug of issue.articles) {
    const dir = path.join("content/articles", slug, "fulltext");
    assert.deepEqual(fs.readdirSync(dir).sort(), ["en.json", "tr.json"], slug);
    assert.ok(catalog.fulltext.localized.includes(slug), slug);
    assert.ok(!catalog.fulltext.current.includes(slug), slug);
    assert.ok(!catalog.fulltext.en_archive.includes(slug), slug);
    // both published locale routes resolve to a record
    for (const locale of ["en", "tr"]) {
      const url = meta(slug).urls[locale];
      assert.match(url, /^https:\/\/briqjournal\.com\/(en\/)?[a-z0-9-]+$/, `${slug}/${locale}`);
    }
  }
});

test("V2I2 keeps the published section/reference structure with legitimate EN/TR differences", () => {
  for (const [slug, expected] of Object.entries(structure)) {
    for (const locale of ["en", "tr"]) {
      const doc = read(slug, locale);
      assert.equal(doc.sections.length, expected[locale][0], `${slug}/${locale} sections`);
      assert.equal(doc.references?.length ?? 0, expected[locale][1], `${slug}/${locale} references`);
      assert.ok(doc.sections.every((s) => (s.paragraphs || []).length > 0), `${slug}/${locale} paragraphs`);
    }
    assert.notDeepEqual(read(slug, "en"), read(slug, "tr"), `${slug} locales`);
  }
});

test("V2I2 visual records carry the printed artwork title, medium and exact embedded production asset", () => {
  const expected = {
    "fotograf-0": {
      en: { title: "Sevtap İnal", paragraphs: 1, caption: "CHINA", src: "figure-01.jpg" },
      tr: { title: "SEVTAP İNAL", paragraphs: 1, caption: "ÇİN", src: "figure-01.jpg" },
    },
    "sevgililer-tuvale-yagli-boya-ugur-durak": {
      en: { title: "Uğur Durak", paragraphs: 2, caption: "LOVERS", src: "figure-01.jpg" },
      tr: { title: "UĞUR DURAK", paragraphs: 2, caption: "SEVGİLİLER", src: "figure-01.jpg" },
    },
    karikatur: {
      en: { title: "Turhan Selçuk", paragraphs: 1, caption: "", src: "figure-01-en.jpg" },
      tr: { title: "TURHAN SELÇUK", paragraphs: 1, caption: "", src: "figure-01-tr.jpg" },
    },
  };
  for (const [slug, locales] of Object.entries(expected)) {
    assert.equal(meta(slug).articleType.id, slug === "karikatur" ? "cartoon" : slug === "fotograf-0" ? "photograph" : "painting");
    for (const [locale, want] of Object.entries(locales)) {
      const doc = read(slug, locale);
      assert.equal(doc.sections.length, 1, `${slug}/${locale}`);
      assert.equal(doc.sections[0].title, want.title, `${slug}/${locale} printed title`);
      assert.equal(doc.sections[0].paragraphs.length, want.paragraphs, `${slug}/${locale} paragraphs`);
      assert.equal(doc.figures.length, 1, `${slug}/${locale} figures`);
      assert.equal(doc.figures[0].caption, want.caption, `${slug}/${locale} printed caption`);
      assert.equal(path.basename(doc.figures[0].src), want.src, `${slug}/${locale} asset`);
      assert.ok(fs.existsSync(path.join("public", doc.figures[0].src)), doc.figures[0].src);
      assert.deepEqual(doc.keywords, [], `${slug}/${locale} keywords`);
      assert.deepEqual(doc.references, [], `${slug}/${locale} references`);
    }
  }
  // the painting keeps the printed medium as its own paragraph, as the v02-i03 record does
  const painting = read("sevgililer-tuvale-yagli-boya-ugur-durak", "tr");
  assert.equal(painting.sections[0].paragraphs[0], "Tuvale Yağlı Boya (100x140 cm)");
  // the cartoon page prints no caption in either locale
  assert.equal(read("karikatur", "en").figures[0].caption, "");
  assert.equal(read("karikatur", "tr").figures[0].caption, "");
});

test("V2I2 keeps each locale's figure list to what that locale's print actually contains", () => {
  // the English issue prints 6 photographs of the ANSO interview, the Turkish issue prints 7;
  // the English issue prints 6 figures of the science article, the Turkish issue prints 5
  const figures = {
    "gorevimiz-kusak-yolda-ortak-gelisme-icin-bilimsel-isbirligi": { en: 6, tr: 7 },
    "kusak-ve-yol-girisiminde-ortak-ve-surdurulebilir-bir-gelecek-icin-bilime-dayali-cozumler": { en: 6, tr: 5 },
  };
  for (const [slug, expected] of Object.entries(figures)) {
    for (const locale of ["en", "tr"]) {
      const doc = read(slug, locale);
      assert.equal(doc.figures.length, expected[locale], `${slug}/${locale} figures`);
      const ids = doc.figures.map((f) => f.id);
      assert.equal(new Set(ids).size, ids.length, `${slug}/${locale} unique figure ids`);
      for (const f of doc.figures) {
        assert.ok(fs.existsSync(path.join("public", f.src)), f.src);
      }
    }
  }
  // the solar-farm photograph exists only in the English print, the ANSO opening photograph
  // only in the Turkish print
  assert.ok(!read("kusak-ve-yol-girisiminde-ortak-ve-surdurulebilir-bir-gelecek-icin-bilime-dayali-cozumler", "tr")
    .figures.some((f) => /Hami|Sincan/.test(f.caption)));
  assert.ok(read("kusak-ve-yol-girisiminde-ortak-ve-surdurulebilir-bir-gelecek-icin-bilime-dayali-cozumler", "en")
    .figures.some((f) => /Hami/.test(f.caption)));
  assert.ok(!read("gorevimiz-kusak-yolda-ortak-gelisme-icin-bilimsel-isbirligi", "en")
    .figures.some((f) => /Around 700/.test(f.caption)));
  assert.ok(read("gorevimiz-kusak-yolda-ortak-gelisme-icin-bilimsel-isbirligi", "tr")
    .figures.some((f) => /700 bilim temsilcisi/.test(f.caption)));
});

test("V2I2 keeps page furniture and front matter out of the body", () => {
  for (const slug of issue.articles) {
    for (const locale of ["en", "tr"]) {
      const body = read(slug, locale).sections.flatMap((s) => s.paragraphs).join(" ");
      assert.doesNotMatch(body, /^(Keywords?|Anahtar Kelimeler)\s*:/im, `${slug}/${locale} keywords leaked`);
      assert.doesNotMatch(body, /^(How to cite|Atıf)\s*:/im, `${slug}/${locale} citation footer leaked`);
      // a markdown footnote marker must never reach the published body; notes live in footnotes[]
      assert.doesNotMatch(body, /\[\^\d+\]/, `${slug}/${locale} markdown footnote marker leaked`);
    }
  }
});

test("V2I2 reference URLs are whole, not split by a printed line break", () => {
  // a URL that the print engine wrapped continues with a URL-ish token (dot, slash, query
  // punctuation or digits); a URL followed by prose such as "adresinden alındı" does not
  const urlish = (token) =>
    /^[A-Za-z0-9._~:/?#[\]@!$&'()*+,;=%-]+$/.test(token) &&
    (/[.:/?#=&]/.test(token) || (token.length >= 6 && /\d/.test(token)));
  for (const slug of issue.articles) {
    for (const locale of ["en", "tr"]) {
      const doc = read(slug, locale);
      for (const record of [...(doc.references ?? []), ...(doc.footnotes ?? [])]) {
        const text = String(typeof record === "string" ? record : record.text).replace(/\s+/g, " ");
        for (const { url, next } of text.matchAll(/https?:\/\/(\S+)(?:\s+(\S+))?/gu)
          .map((m) => ({ url: m[0].split(" ")[0], next: m[2] }))) {
          assert.doesNotMatch(url, /\s/u, `${slug}/${locale}: ${url}`);
          assert.doesNotMatch(
            url,
            /^https?:\/\/(?:www\.)?$/iu,
            `${slug}/${locale}: truncated host in ${url}`
          );
          assert.ok(
            !(next && urlish(next)) || /[a-z]{2,}(?:$|[/?#])/iu.test(url),
            `${slug}/${locale}: split URL ${url} + ${next}`
          );
        }
      }
    }
  }
});

test("V2I2 never falls back from an English page to Turkish full text", () => {
  for (const slug of issue.articles) {
    const en = read(slug, "en");
    const body = en.sections.flatMap((s) => s.paragraphs).join(" ");
    const hits = body.match(/\b(ve|bir|bu|için|olarak|olan|çok|daha|ancak|çünkü|gibi|sonra|göre|üzerine|arasında|tarafından)\b/gu) || [];
    assert.ok(hits.length < 8, `${slug}: Turkish contamination candidates ${hits.slice(0, 8)}`);
    assert.notDeepEqual(en, read(slug, "tr"), `${slug} locales are not interchangeable`);
  }
});
