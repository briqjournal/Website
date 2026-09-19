import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const issue = JSON.parse(fs.readFileSync("content/issues/v06-i04.json", "utf8"));
const root = "content/articles";
const read = (slug, locale) => JSON.parse(fs.readFileSync(path.join(root, slug, "fulltext", `${locale}.json`), "utf8"));
const expectedFigures = new Map([
  ["rusyanin-bolgesel-guvenlikteki-rolu-uzerine-bir-inceleme-kolektif-guvenlik-antlasmasi-orgutu-ve", 9],
  ["brics-terore-karsi-mucadele-stratejisi", 2],
  ["sanghay-isbirligi-orgutu-devlet-baskanlari-konseyinin-terorizm-ayrilikcilik-ve-asiriciliga-yol-acan", 0],
  ["dunya-ekonomik-forumunun-kuresellesme-surecindeki-etkisinin-ekonomi-politik-elestirisi", 9],
  ["genc-cin-ve-genc-cinliler-cinde-aydinlanma-yeni-kultur-hareketi-ve-yeni-siyasal-bicimlenme", 8],
  ["wape-18-yillik-forumu", 4],
  ["hallac-siir", 0],
  ["doksan-yedinci-sonnet-siir", 0],
]);
const expectedRefs = new Map([
  ["rusyanin-bolgesel-guvenlikteki-rolu-uzerine-bir-inceleme-kolektif-guvenlik-antlasmasi-orgutu-ve", [70,70]],
  ["brics-terore-karsi-mucadele-stratejisi", [1,1]],
  ["sanghay-isbirligi-orgutu-devlet-baskanlari-konseyinin-terorizm-ayrilikcilik-ve-asiriciliga-yol-acan", [2,2]],
  ["dunya-ekonomik-forumunun-kuresellesme-surecindeki-etkisinin-ekonomi-politik-elestirisi", [35,35]],
  ["genc-cin-ve-genc-cinliler-cinde-aydinlanma-yeni-kultur-hareketi-ve-yeni-siyasal-bicimlenme", [28,29]],
  ["wape-18-yillik-forumu", [0,0]],
  ["hallac-siir", [0,1]],
  ["doksan-yedinci-sonnet-siir", [0,1]],
]);
const norm = (v) => String(v ?? "").normalize("NFKC").replace(/\s+/gu, " ").trim().toLowerCase();

test("V6I4 preserves verified figure inventories and production assets", () => {
  assert.equal(issue.articles.length, 8);
  for (const slug of issue.articles) {
    const expected = expectedFigures.get(slug);
    for (const locale of ["en","tr"]) {
      const data = read(slug, locale);
      assert.equal((data.figures ?? []).length, expected, `${slug}/${locale}`);
      assert.deepEqual((data.figures ?? []).map(f => f.id), Array.from({length: expected},(_,i)=>`figure-${i+1}`));
      for (const figure of data.figures ?? []) {
        assert.match(figure.caption, /\S/u);
        assert.match(figure.src, new RegExp(`^/assets/article-figures/${slug.replace(/[.*+?^\${}()|[\]\\]/g,"\\$&")}/figure-\\d{2}-${locale}\\.(?:jpg|png)$`));
        const asset = path.join("public", figure.src.slice(1));
        assert.ok(fs.existsSync(asset), asset);
        assert.ok(fs.statSync(asset).size > 5000, `${asset} unexpectedly small`);
      }
    }
  }
});

test("V6I4 poem bodies preserve published stanza and line structure", () => {
  const hallajEn = read("hallac-siir","en");
  const hallajTr = read("hallac-siir","tr");
  const sonnetEn = read("doksan-yedinci-sonnet-siir","en");
  const sonnetTr = read("doksan-yedinci-sonnet-siir","tr");
  assert.deepEqual(hallajEn.sections[0].paragraphs.map(x=>x.split("\n").length), [6,12,5,4,4,2]);
  assert.deepEqual(hallajTr.sections[0].paragraphs.map(x=>x.split("\n").length), [6,13,5,4,4,2]);
  assert.deepEqual(sonnetEn.sections[0].paragraphs.map(x=>x.split("\n").length), [4,4,3,3]);
  assert.deepEqual(sonnetTr.sections[0].paragraphs.map(x=>x.split("\n").length), [4,4,3,3]);
  assert.match(hallajEn.footnotes?.[0]?.text ?? "", /Translated from Turkish to English by BRIQ/u);
  assert.match(hallajTr.footnotes?.[0]?.text ?? "", /Çeviri: M\. Babek/u);
  assert.match(sonnetEn.footnotes?.[0]?.text ?? "", /Translated from Turkish to English by BRIQ/u);
});

test("V6I4 reference cardinalities and integrity invariants remain stable", () => {
  const cross = new Map();
  for (const slug of issue.articles) {
    const refs = expectedRefs.get(slug);
    for (const [li,locale] of ["en","tr"].entries()) {
      const data = read(slug, locale);
      assert.equal((data.references ?? []).length, refs[li], `${slug}/${locale} refs`);
      const noteIds=(data.footnotes??[]).map(x=>x.id).filter(Boolean);
      assert.equal(new Set(noteIds).size,noteIds.length,`${slug}/${locale} footnotes`);
      const paragraphs=(data.sections??[]).flatMap(s=>s.paragraphs??[]).map(norm).filter(x=>x.split(" ").length>=8);
      assert.equal(new Set(paragraphs).size, paragraphs.length, `${slug}/${locale} duplicate paragraph`);
      for(const p of paragraphs.filter(x=>x.length>=120)){
        const key=`${locale}::${p}`, owner=cross.get(key);
        assert.ok(!owner || owner===slug, `cross-record paragraph contamination: ${owner} -> ${slug}/${locale}`);
        cross.set(key,slug);
      }
    }
  }
});

test("V6I4 representative published captions remain exact", () => {
  assert.match(read("brics-terore-karsi-mucadele-stratejisi","en").figures[0].caption,/16th Meeting of the BRICS Summit/u);
  assert.match(read("dunya-ekonomik-forumunun-kuresellesme-surecindeki-etkisinin-ekonomi-politik-elestirisi","en").figures[4].caption,/Tech companies that have laid off the most employees in 2024/u);
  assert.match(read("genc-cin-ve-genc-cinliler-cinde-aydinlanma-yeni-kultur-hareketi-ve-yeni-siyasal-bicimlenme","tr").figures[0].caption,/Komünist Gençlik Birliği bayrağı/u);
  assert.match(read("wape-18-yillik-forumu","tr").figures[3].caption,/Yeditepe Üniversitesi Rektörlüğü/u);
});
