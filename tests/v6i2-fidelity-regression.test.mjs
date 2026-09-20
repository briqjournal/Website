import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const issue = JSON.parse(fs.readFileSync("content/issues/v06-i02.json", "utf8"));
const read = (slug, locale) =>
  JSON.parse(fs.readFileSync(path.join("content/articles", slug, "fulltext", `${locale}.json`), "utf8"));
const norm = (v) => String(v ?? "").normalize("NFKC").replace(/\s+/gu, " ").trim().toLowerCase();

const MODERN = "modernist-milliyetci-olarak-sun-yat-sen-ve-siyasal-mirasi";
const EARLY = "cinin-erken-modernizasyonuna-sun-yat-senin-katkisi";
const REV = "cinli-devrimcilerin-sun-yat-sen-ve-mustafa-kemal-arasindaki-benzerlikler-uzerine-gorusleri";
const MAO = "sun-yat-senin-olumunun-13-yildonumu-ve-japonyaya-karsi-savasta-hayatini-kaybeden-askerler-icin";
const OSAKA = "osaka-mainichi-shimbun-gazetesinin-sun-yat-sen-ile-roportaji-23-kasim-1924-dogu-asyali-bir-ulke";
const MIDDLE = "yukselen-orta-guclerin-denge-diplomasisi-kavramlar-saikler-ve-cikarimlar";
const ALTER = "alter-kuresellesme-baglaminda-cin-fransiz-iliskileri";
const UZBEK = "kamu-diplomasisi-ozbekistanin-yabanci-ulkelerle-iliskilerini-guclendirmenin-bir-yolu";
const TALE = "hikaye-siir";
const DEAD = "olu-su-siir";
const OGONYOK = "ogonyok";
const QI = "qi-baishi";
const MIYANO = "t-miyano-renkli-tasbaski";

const figureCounts = new Map([
  [MODERN, 7], [EARLY, 4], [REV, 4], [MAO, 3], [OSAKA, 2],
  [MIDDLE, 3], [ALTER, 7], [UZBEK, 1], [TALE, 0], [DEAD, 0],
  [OGONYOK, 1], [QI, 1], [MIYANO, 1],
]);

const refCounts = new Map([
  [MODERN, [29, 29]], [EARLY, [12, 12]], [REV, [46, 46]], [MAO, [0, 0]],
  [OSAKA, [0, 0]], [MIDDLE, [34, 39]], [ALTER, [62, 62]], [UZBEK, [0, 0]],
  [TALE, [0, 1]], [DEAD, [1, 1]], [OGONYOK, [0, 0]], [QI, [0, 0]], [MIYANO, [0, 0]],
]);

const ref = (data, id) => {
  const item = (data.references ?? []).find((r) => r.id === id);
  assert.ok(item, `missing ${id}`);
  return item.text;
};

test("V6I2 keeps the verified record and figure inventories", () => {
  assert.equal(issue.articles.length, 13);
  for (const slug of issue.articles) {
    for (const locale of ["en", "tr"]) {
      const data = read(slug, locale);
      assert.equal((data.figures ?? []).length, figureCounts.get(slug), `${slug}/${locale} figures`);
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

test("V6I2 keeps verified bibliography cardinalities", () => {
  for (const slug of issue.articles) {
    const expected = refCounts.get(slug);
    for (const [index, locale] of ["en", "tr"].entries()) {
      const data = read(slug, locale);
      assert.equal((data.references ?? []).length, expected[index], `${slug}/${locale} references`);
    }
  }
});

test("V6I2 Tale preserves only the published poem body and note/reference separation", () => {
  const en = read(TALE, "en");
  const tr = read(TALE, "tr");
  assert.equal(en.sections.length, 1);
  assert.equal(tr.sections.length, 1);
  assert.equal(en.sections[0].title, "TALE");
  assert.equal(tr.sections[0].title, "HİKAYE");
  assert.deepEqual(en.sections[0].paragraphs.map((p) => p.split("\n").length), [4,4,4,4,4,4,7,1]);
  assert.deepEqual(tr.sections[0].paragraphs.map((p) => p.split("\n").length), [4,4,4,4,4,4,4,1]);
  assert.equal(en.sections[0].paragraphs.at(-1), "1944");
  assert.equal(tr.sections[0].paragraphs.at(-1), "1944");
  assert.equal(en.footnotes?.[0]?.text, "Translated by Latif Bolat (2025).");
  assert.equal(tr.references?.[0]?.text, "Külebi, C. (1998). Hikaye. Bütün Şiirleri (s. 14), Adam Yayınları.");
  const body = [...en.sections[0].paragraphs, ...tr.sections[0].paragraphs].join("\n");
  assert.doesNotMatch(body, /Cahit Külebi \(1917|Translated by Latif Bolat/u);
  assert.equal(en.figures.length, 0);
  assert.equal(tr.figures.length, 0);
});

test("V6I2 Dead Water preserves only the published five-stanza poem body", () => {
  const en = read(DEAD, "en");
  const tr = read(DEAD, "tr");
  assert.equal(en.sections.length, 1);
  assert.equal(tr.sections.length, 1);
  assert.equal(en.sections[0].title, "DEAD WATER");
  assert.equal(tr.sections[0].title, "ÖLÜ SU");
  assert.deepEqual(en.sections[0].paragraphs.map((p) => p.split("\n").length), [4,4,4,4,4]);
  assert.deepEqual(tr.sections[0].paragraphs.map((p) => p.split("\n").length), [4,4,5,5,4]);
  assert.doesNotMatch(en.sections[0].paragraphs.join("\n"), /Wen Yiduo \(November 24/u);
  assert.doesNotMatch(tr.sections[0].paragraphs.join("\n"), /Wen Yiduo \(24 Kasım/u);
  assert.equal(en.references.length, 1);
  assert.equal(tr.references.length, 1);
});

test("V6I2 restores the full published alter-globalization Figure 2 captions", () => {
  const en = read(ALTER, "en");
  const tr = read(ALTER, "tr");
  const enFig = en.figures.find((f) => f.id === "figure-7");
  const trFig = tr.figures.find((f) => f.id === "figure-7");
  assert.match(enFig.caption, /^Figure 2\. EU top trading partners, 2000-2018/u);
  assert.match(enFig.caption, /eightfold surge in trade transactions/u);
  assert.match(enFig.caption, /Graph: Eurostat, 2019/u);
  assert.match(trFig.caption, /^Şekil 2\. AB'nin en büyük ticaret ortakları, 2000-2018/u);
  assert.match(trFig.caption, /sekiz kat artış/u);
  assert.match(trFig.caption, /Grafik: Eurostat, 2019/u);
  assert.equal(ref(en, "ref-20"), "Gürcan, Efe Can and Ahmet Gedik. (2020). “Hindistan ile Pakistan’da Yükselen Popülizmin İkili İlişkilere Etkisi ve Keşmir Sorunu”, Ulusaldan Küresele: Popülizm, Demokrasi, Güvenlik Konferansı. (64-70). İstanbul: Işık Üniversitesi Yayınları.");
  assert.equal(ref(tr, "ref-20"), ref(en, "ref-20"));
});

test("V6I2 repairs confirmed Sun Yat-sen bibliography extraction damage", () => {
  const en = read(MODERN, "en");
  const tr = read(MODERN, "tr");
  assert.doesNotMatch(ref(en, "ref-15"), /Ü zerine/u);
  assert.doesNotMatch(ref(en, "ref-16"), /Ü niversitesi/u);
  assert.doesNotMatch(ref(en, "ref-22"), /Ü niversitesi/u);
  assert.equal(ref(tr, "ref-6"), "China National Assembly Election. (1912). https://en.wikipedia.org/wiki/1912_Chinese_National_Assembly_election. Erişim Tarihi: 04.08.2023.");
  assert.equal(ref(tr, "ref-24"), "Wang, H. (2015). Çin’in Yirminci Yüzyılı: Devrim, Geri Çekilme ve Eşitliğe Giden Yol. Yordam Kitap. Çev. Ümit Şenesen. İstanbul.");
  assert.match(ref(tr, "ref-27"), /https:\/\/interpret\.csis\.org\/translations\/speech-at-the-conference-to-commemorate-the-150th-anniversary-of-the-birth-of-dr-sun-yat-sen\//u);
  assert.doesNotMatch(ref(tr, "ref-27"), /Eri şim/u);
});

test("V6I2 repairs the published Chinese-revolutionaries bibliography without erasing locale differences", () => {
  const en = read(REV, "en");
  const tr = read(REV, "tr");
  assert.equal(ref(en, "ref-7"), "Demircan, N. & Ye, Z. (2024). Ankara as a Role Model during the Second Sino-Japanese War: “Chongqing is Our Ankara!”. BRIQ Belt and Road Initiative Quarterly, 6(1), 92-103.");
  assert.equal(ref(tr, "ref-7"), "Demircan, N. & Ye, Z. (2024). İkinci Çin-Japon Savaşı Sırasında Rol Model Olarak Ankara: “Chongqing Bizim Ankara’mız!”. BRIQ Kuşak ve Yol Girişimi Dergisi, 6(1), 92-103.");
  assert.match(ref(en, "ref-22"), /\(2019a\)/u);
  assert.match(ref(tr, "ref-22"), /\(2019b\)/u);
  assert.equal(ref(en, "ref-18"), "Mao, Z. (2000). Seçme Eserler I. İstanbul: Kaynak Yayınları.");
  assert.equal(ref(tr, "ref-19"), "Mao, Z. (1992). Seçme Eserler II. İstanbul: Kaynak Yayınları.");
  for (const locale of ["en","tr"]) {
    const data = locale === "en" ? en : tr;
    const all = data.references.map((r) => r.text).join("\n");
    assert.doesNotMatch(all, /Se ç me|Yansımas ı|G ö rünen|T ürkiye G ö zlemleri|People ’ s Publishing|China ’ s Unequal/u);
    assert.match(ref(data, "ref-26"), /BRIQ Belt and Road Initiative Quarterly, 3\(1\), 40-49/u);
  }
});

test("V6I2 restores the published Edström spelling", () => {
  const tr = read(MIDDLE, "tr");
  assert.equal(ref(tr, "ref-6"), "Edström, H. & Westberg, J. (2020). The defense strategies of middle powers: Competing for security, influence and status in an era of unipolar demise. Comparative Strategy, 39(2), 171–190");
});

test("V6I2 keeps the shared-PDF English records distinct instead of falling back to Turkish", () => {
  const osakaEn = read(OSAKA, "en");
  const osakaTr = read(OSAKA, "tr");
  const qiEn = read(QI, "en");
  const qiTr = read(QI, "tr");
  assert.notEqual(norm(osakaEn.sections[0].paragraphs[0]), norm(osakaTr.sections[0].paragraphs[0]));
  assert.match(osakaEn.sections.flatMap((s) => s.paragraphs).join("\n"), /The English translation was done by BRIQ/u);
  assert.doesNotMatch(osakaTr.sections.flatMap((s) => s.paragraphs).join("\n"), /The English translation was done by BRIQ/u);
  assert.notEqual(norm(qiEn.sections[0].paragraphs[0]), norm(qiTr.sections[0].paragraphs[0]));
  assert.match(qiEn.sections[0].paragraphs[0], /one of the most well-known contemporary Chinese painters/u);
  assert.match(qiTr.sections[0].paragraphs[0], /en bilinen çağdaş Çinli ressamlardan biridir/u);
});

test("V6I2 has no duplicate note IDs, canonical paragraph duplicates, or cross-record paragraph contamination", () => {
  const cross = new Map();
  for (const slug of issue.articles) {
    for (const locale of ["en", "tr"]) {
      const data = read(slug, locale);
      const noteIds = (data.footnotes ?? []).map((x) => x.id).filter(Boolean);
      assert.equal(new Set(noteIds).size, noteIds.length, `${slug}/${locale} duplicate note ids`);
      const paras = (data.sections ?? []).flatMap((s) => s.paragraphs ?? []).map(norm).filter((p) => p.split(" ").length >= 8);
      assert.equal(new Set(paras).size, paras.length, `${slug}/${locale} duplicate paragraph`);
      for (const p of paras.filter((x) => x.length >= 140)) {
        const key = `${locale}::${p}`;
        const owner = cross.get(key);
        assert.ok(!owner || owner === slug, `cross-record paragraph contamination: ${owner} -> ${slug}/${locale}`);
        cross.set(key, slug);
      }
    }
  }
});
