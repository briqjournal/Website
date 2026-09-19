import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const issue = JSON.parse(fs.readFileSync("content/issues/v06-i03.json", "utf8"));
const root = "content/articles";
const read = (slug, locale) => JSON.parse(fs.readFileSync(path.join(root, slug, "fulltext", `${locale}.json`), "utf8"));
const norm = (v) => String(v ?? "").normalize("NFKC").replace(/\s+/gu, " ").trim().toLowerCase();

const ALG = "cezayir-devrimci-diplomasisi-bandung-temel-girisiminden-yeni-bir-baglantisizlar-konseptine";
const INTERVIEW = "70-yilinda-bandung-baglantisizliktan-hegemonyaciliga-karsi-milli-devletlerin-ortak-kalkinma-ve";
const INDONESIA = "endonezya-dis-politikasinda-bandung-mirasina-yeniden-bakis-tarihsel-bir-inceleme-ve-guncel";
const SPIRIT = "bandung-ruhu-70-yasinda";
const CHINA = "bandung-konferansi-oncesi-ve-sonrasinda-yeni-cinin-dis-politikasi-bandung-konferansini-yeniden";
const GAS = "yeni-bir-enerji-kaynagi-olarak-gaz-hidratlar";
const FAKE = "sahte-siir";
const WAR = "39-harbi";
const PHOTO = "china-reconstructs";
const PAINTING = "hendra-gunawan";
const STAMP = "endonezya-posta-pulu";

const expectedFigures = new Map([
  [ALG, 8],
  [INTERVIEW, 3],
  [INDONESIA, 5],
  [SPIRIT, 7],
  [CHINA, 6],
  [GAS, 12],
  [FAKE, 0],
  [WAR, 0],
  [PHOTO, 1],
  [PAINTING, 1],
  [STAMP, 1],
]);

const expectedRefs = new Map([
  [ALG, [32, 31]],
  [INTERVIEW, [0, 0]],
  [INDONESIA, [63, 63]],
  [SPIRIT, [51, 52]],
  [CHINA, [35, 35]],
  [GAS, [66, 66]],
  [FAKE, [1, 1]],
  [WAR, [0, 1]],
  [PHOTO, [0, 0]],
  [PAINTING, [0, 0]],
  [STAMP, [0, 0]],
]);

test("V6I3 preserves verified figure inventories and production assets", () => {
  assert.equal(issue.articles.length, 11);
  for (const slug of issue.articles) {
    const expected = expectedFigures.get(slug);
    for (const locale of ["en", "tr"]) {
      const data = read(slug, locale);
      assert.equal((data.figures ?? []).length, expected, `${slug}/${locale} figure count`);
      for (const figure of data.figures ?? []) {
        assert.match(String(figure.caption ?? ""), /\S/u, `${slug}/${locale}/${figure.id} caption`);
        assert.match(String(figure.src ?? ""), /^\/assets\/article-figures\//u);
        const asset = path.join("public", figure.src.slice(1));
        assert.ok(fs.existsSync(asset), asset);
        assert.ok(fs.statSync(asset).size > 5000, `${asset} unexpectedly small`);
      }
    }
  }
});

test("V6I3 Algeria English restores all eight published photographs", () => {
  const en = read(ALG, "en");
  const tr = read(ALG, "tr");
  assert.equal(en.figures.length, 8);
  assert.equal(tr.figures.length, 8);
  assert.match(en.figures[0].caption, /Algerian, Tunisian, and Moroccan delegates at the Bandung Conference/u);
  assert.match(en.figures[7].caption, /Abdelmadjid Tebboune/u);
  assert.match(en.figures[7].caption, /Presidency of the Rebublic of Azerbaijan/u);
});

test("V6I3 interview restores the published section boundary and removes contamination", () => {
  const en = read(INTERVIEW, "en");
  const tr = read(INTERVIEW, "tr");
  assert.equal(en.figures.length, 3);
  assert.equal(tr.figures.length, 3);
  assert.equal(en.sections[3].title, "The Strategy Turkey Needs");
  assert.equal(en.sections[3].paragraphs[0], "What role should Turkey play in cooperation with developing countries?");
  assert.equal(tr.sections[3].title, "Türkiye’nin İhtiyacı Olan Strateji");
  assert.equal(tr.sections[3].paragraphs[0], "Gelişen dünya ülkelerinin işbirliğinde Türkiye’nin rolü ne olmalı?");
  const trBody = tr.sections.flatMap(s => s.paragraphs ?? []).join("\n");
  assert.doesNotMatch(trBody, /70th anniversary of Bandung: from ‘non-alignment’/u);
  assert.doesNotMatch(trBody, /Whereas the Bandung Conference was a source of hope/u);
  assert.doesNotMatch(trBody, /^(?:Tam metin|Full text)$/mu);
});

test("V6I3 Bandung Spirit English follows the published two-column section order", () => {
  const en = read(SPIRIT, "en");
  const china = en.sections.find(s => s.title === "China’s Contributions");
  const indonesia = en.sections.find(s => s.title === "Indonesia’s Contributions");
  const delhi = en.sections.find(s => s.title === "Asian Relations Conference in Delhi");
  assert.equal(china.paragraphs.length, 3);
  assert.equal(indonesia.paragraphs.length, 4);
  assert.match(china.paragraphs[0], /^The Communist Party of China \(CPC\)/u);
  assert.match(china.paragraphs[1], /^Zhou Enlai’s attendance at the conference commenced under unfavorable circumstances/u);
  assert.match(china.paragraphs[2], /^China’s international political circumstances progressively enhanced following the Bandung meeting/u);
  assert.doesNotMatch(china.paragraphs.join("\n"), /com-\s*$/mu);
  assert.doesNotMatch(delhi.paragraphs.join("\n"), /Zhou evaded disaster/u);
  assert.match(indonesia.paragraphs[0], /^Ahmet Sukarno, the host of the Bandung Conference/u);
});

test("V6I3 Indonesian diplomacy English restores the post-Suharto section boundary", () => {
  const en = read(INDONESIA, "en");
  const legacy = en.sections.find(s => s.title === "Indonesia’s Inheritance or Divergence from the Bandung Legacy");
  const transformation = en.sections.find(s => s.title === "The Transformation of Indonesian Diplomacy and its Contribution to Fostering the Bandung Spirit");
  assert.match(legacy.paragraphs.at(-1), /^The 1997 Asian financial crisis/u);
  assert.match(transformation.paragraphs[0], /^In the post-Suharto period, the Bandung spirit/u);
  assert.equal(transformation.paragraphs.length, 9);
});

test("V6I3 poem bodies preserve published line structure and separate notes from verse", () => {
  const fakeEn = read(FAKE, "en");
  const fakeTr = read(FAKE, "tr");
  const warEn = read(WAR, "en");
  const warTr = read(WAR, "tr");

  assert.equal(fakeEn.sections.length, 1);
  assert.equal(fakeTr.sections.length, 1);
  assert.deepEqual(fakeEn.sections[0].paragraphs.map(x => x.split("\n").length), [32]);
  assert.deepEqual(fakeTr.sections[0].paragraphs.map(x => x.split("\n").length), [32]);
  assert.deepEqual(warEn.sections[0].paragraphs.map(x => x.split("\n").length), [43, 1]);
  assert.deepEqual(warTr.sections[0].paragraphs.map(x => x.split("\n").length), [43, 1]);
  assert.equal(warEn.sections[0].paragraphs[1], "1945");
  assert.equal(warTr.sections[0].paragraphs[1], "1945");

  assert.equal(fakeEn.references.length, 1);
  assert.equal(fakeTr.references.length, 1);
  assert.match(fakeTr.footnotes?.[0]?.text ?? "", /^Çeviri: Ulaş Başar Gezgin$/u);
  assert.match(warEn.footnotes?.[0]?.text ?? "", /Translated from Turkish into English by BRIQ/u);
  assert.equal(warTr.references.length, 1);

  const fakeBody = fakeEn.sections.flatMap(s => s.paragraphs).join("\n") + fakeTr.sections.flatMap(s => s.paragraphs).join("\n");
  const warBody = warEn.sections.flatMap(s => s.paragraphs).join("\n") + warTr.sections.flatMap(s => s.paragraphs).join("\n");
  assert.doesNotMatch(fakeBody, /Aveling, H\.|Çeviri: Ulaş Başar Gezgin|Gezgin, U\.B\./u);
  assert.doesNotMatch(warBody, /Translated from Turkish into English by BRIQ|Fuat, M\./u);
});

test("V6I3 gas-hydrate table fragments retain the published table captions", () => {
  const en = read(GAS, "en");
  const tr = read(GAS, "tr");
  const enCaptions = en.figures.map(f => f.caption);
  const trCaptions = tr.figures.map(f => f.caption);
  assert.deepEqual(enCaptions.slice(8), [
    "Table 2. Advantages and Disadvantages of Gas Hydrate Production Methods",
    "Table 2. Advantages and Disadvantages of Gas Hydrate Production Methods",
    "Table 3. Technological Maturity and Application Status of Gas Hydrate Production Methods",
    "Table 3. Technological Maturity and Application Status of Gas Hydrate Production Methods",
  ]);
  assert.deepEqual(trCaptions.slice(8), [
    "Tablo 2. Gaz Hidrat Üretim Yöntemlerinin Avantajları ve Dezavantajları",
    "Tablo 2. Gaz Hidrat Üretim Yöntemlerinin Avantajları ve Dezavantajları",
    "Tablo 3. Gaz Hidrat Üretim Yöntemlerinin Teknolojik Olgunluk ve Uygulama Durumu",
    "Tablo 3. Gaz Hidrat Üretim Yöntemlerinin Teknolojik Olgunluk ve Uygulama Durumu",
  ]);
  assert.ok(!enCaptions.slice(8).includes("Gas Hydrates as a New Energy Resource"));
  assert.ok(!trCaptions.slice(8).includes("Yeni Bir Enerji Kaynağı Olarak Gaz Hidratlar"));
});

test("V6I3 reference cardinalities, note IDs, and paragraph integrity remain stable", () => {
  const cross = new Map();
  for (const slug of issue.articles) {
    const refs = expectedRefs.get(slug);
    for (const [li, locale] of ["en", "tr"].entries()) {
      const data = read(slug, locale);
      assert.equal((data.references ?? []).length, refs[li], `${slug}/${locale} refs`);
      const noteIds = (data.footnotes ?? []).map(x => x.id).filter(Boolean);
      assert.equal(new Set(noteIds).size, noteIds.length, `${slug}/${locale} duplicate note ids`);
      const paragraphs = (data.sections ?? []).flatMap(s => s.paragraphs ?? []).map(norm).filter(x => x.split(" ").length >= 8);
      assert.equal(new Set(paragraphs).size, paragraphs.length, `${slug}/${locale} duplicate paragraph`);
      for (const p of paragraphs.filter(x => x.length >= 140)) {
        const key = `${locale}::${p}`;
        const owner = cross.get(key);
        assert.ok(!owner || owner === slug, `cross-record paragraph contamination: ${owner} -> ${slug}/${locale}`);
        cross.set(key, slug);
      }
    }
  }
});
