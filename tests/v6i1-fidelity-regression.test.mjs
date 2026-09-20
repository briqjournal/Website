import fs from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const issue = read("content/issues/v06-i01.json");
const expectedFigures = new Map([
  ["roportaj-yesil-ve-dijital-donusum-kapsaminda-ar-ge-ve-yenilik-ekosistemini-harekete-geciriyoruz", 4],
  ["kuresel-guneyde-yenilik-sistemlerinin-kurulmasi-zorluklar-ve-guney-guney-isbirligi-ile-yol-haritasi", 6],
  ["kusak-yol-gelisen-dunyanin-onculugunde-toplumu-bicimlendirmenin-tek-yolu", 2],
  ["yukselen-yeni-uygarligin-bilim-ve-teknolojide-kuresel-onderlik-hedefi", 7],
  ["devlet-farkli-politika-araclari-ile-aktif-piyasa-mudahalesini-surekli-hale-getirmeli", 4],
  ["turkiyenin-guvenlik-politikalarina-istihbarat-teskilatlarinin-katkisi", 7],
  ["ikinci-cin-japon-savasi-sirasinda-rol-model-olarak-ankara-chongqing-bizim-ankaramiz", 4],
  ["kuresel-kalkinma-girisimi-ve-cinin-ortadogudaki-kalkinma-isbirligi-calismalari", 7],
  ["avrupayi-abd-liderligindeki-sanayisizlesmeden-kurtarmak", 4],
  ["ogrenmeye-ovgu", 0],
  ["sevgi-duvari", 0],
  ["abdnin-kurdugu-ekonomik-tuzak-isiginda-abd-cin-rekabetinin-mahiyeti", 4],
  ["izmir-kizilcullu-koy-enstitusu", 1],
  ["operarios-isciler-1933", 1],
  ["yeni-nesil-nazizm-2023", 1],
]);

const textOf = (x) => typeof x === "string" ? x : x?.text || "";
const norm = (s) => s.toLocaleLowerCase("tr").replace(/\s+/gu, " ").trim();

test("V6I1 canonical records keep source-verified structural invariants", () => {
  assert.equal(issue.articles.length, 15);
  assert.equal(new Set(issue.articles).size, 15);

  for (const slug of issue.articles) {
    const base = `content/articles/${slug}`;
    const meta = read(`${base}/metadata.json`);
    assert.equal(meta.schemaVersion, 2, slug);
    assert.equal(meta.journal.volume, 6, slug);
    assert.equal(meta.journal.issue, 1, slug);
    assert.deepEqual(
      fs.readdirSync(`${base}/fulltext`).filter((x) => x.endsWith(".json")).sort(),
      ["en.json", "tr.json"],
      slug,
    );

    for (const locale of ["en", "tr"]) {
      const ft = read(`${base}/fulltext/${locale}.json`);
      const sectionIds = (ft.sections || []).map((x) => x.id);
      assert.equal(sectionIds.length, new Set(sectionIds).size, `${slug}/${locale} duplicate section id`);
      const noteIds = (ft.footnotes || []).map((x) => String(x.id));
      assert.equal(noteIds.length, new Set(noteIds).size, `${slug}/${locale} duplicate footnote id`);

      const paras = (ft.sections || []).flatMap((s) => s.paragraphs || []).map(textOf).filter((x) => x.trim());
      const normalized = paras.filter((x) => norm(x).split(" ").length >= 8).map(norm);
      assert.equal(normalized.length, new Set(normalized).size, `${slug}/${locale} duplicate canonical paragraph`);
      for (const p of paras) {
        assert.doesNotMatch(p.trim(), /^(?:keywords?|anahtar\s+kelimeler|how\s+to\s+cite|atıf)\s*:/iu, `${slug}/${locale} metadata leakage`);
      }

      const figures = ft.figures || [];
      assert.equal(figures.length, expectedFigures.get(slug), `${slug}/${locale} figure count`);
      figures.forEach((figure, i) => {
        assert.equal(figure.id, `figure-${i + 1}`, `${slug}/${locale} figure id ${i + 1}`);
        assert.doesNotMatch(figure.caption || "", /^(?:Visual|Görsel)\s+\d+$/iu, `${slug}/${locale} generic figure caption`);
        const asset = `public${figure.src}`;
        assert(fs.existsSync(asset), `${slug}/${locale} missing ${asset}`);
        assert(fs.statSync(asset).size > 5000, `${slug}/${locale} undersized ${asset}`);
      });
    }
  }
});

test("V6I1 poem repairs exclude author front matter and preserve published verse", () => {
  const brechtEn = read("content/articles/ogrenmeye-ovgu/fulltext/en.json");
  const brechtTr = read("content/articles/ogrenmeye-ovgu/fulltext/tr.json");
  const yucelEn = read("content/articles/sevgi-duvari/fulltext/en.json");
  const yucelTr = read("content/articles/sevgi-duvari/fulltext/tr.json");

  assert.deepEqual(brechtEn.sections.map((s) => s.title), ["In Praise of Learning"]);
  assert.deepEqual(brechtTr.sections.map((s) => s.title), ["Öğrenmeye Övgü"]);
  assert.deepEqual(yucelEn.sections.map((s) => s.title), ["The Wall of Love"]);
  assert.deepEqual(yucelTr.sections.map((s) => s.title), ["Sevgi Duvarı"]);
  assert.equal(brechtEn.sections[0].paragraphs.length, 3);
  assert.equal(brechtTr.sections[0].paragraphs.length, 3);
  assert.equal(yucelEn.sections[0].paragraphs.length, 3);
  assert.equal(yucelTr.sections[0].paragraphs.length, 3);
  assert.equal(brechtEn.figures.length + brechtTr.figures.length + yucelEn.figures.length + yucelTr.figures.length, 0);
  assert.match(brechtEn.footnotes[0].text, /Mother, produced in 1935/);
  assert.match(yucelEn.footnotes[0].text, /Ruth Christie/);
});

test("V6I1 confirmed visual and caption repairs remain canonical", () => {
  const kizEn = read("content/articles/izmir-kizilcullu-koy-enstitusu/fulltext/en.json");
  const kizTr = read("content/articles/izmir-kizilcullu-koy-enstitusu/fulltext/tr.json");
  assert.match(kizEn.sections[0].paragraphs[0], /Village Institutes/);
  assert.match(kizTr.sections[0].paragraphs[0], /Köy Enstitüleri/);
  assert.equal(kizEn.figures[0].caption, "İzmir Kızılçullu Village Institute");
  assert.equal(kizTr.figures[0].caption, "İzmir Kızılçullu Köy Enstitüsü");

  const tubitak = read("content/articles/roportaj-yesil-ve-dijital-donusum-kapsaminda-ar-ge-ve-yenilik-ekosistemini-harekete-geciriyoruz/fulltext/en.json");
  assert.equal(tubitak.figures[0].caption, "RDI Topics in Green Growth Technology Roadmap (TÜBİTAK, 2024).");

  const globalSouth = read("content/articles/kuresel-guneyde-yenilik-sistemlerinin-kurulmasi-zorluklar-ve-guney-guney-isbirligi-ile-yol-haritasi/fulltext/en.json");
  assert.match(globalSouth.figures[4].caption, /monopolization presents a significant challenge/);
  assert.match(globalSouth.figures[5].caption, /^Table 1\./);

  const intelligence = read("content/articles/turkiyenin-guvenlik-politikalarina-istihbarat-teskilatlarinin-katkisi/fulltext/en.json");
  assert.match(intelligence.figures[4].caption, /^Figure 1\. Türkiye's Fight Against DAESH/);

  const europe = read("content/articles/avrupayi-abd-liderligindeki-sanayisizlesmeden-kurtarmak/fulltext/en.json");
  assert.equal(europe.figures.length, 4);
  assert.match(europe.figures[2].caption, /BASF's new plant in South China/);
});
