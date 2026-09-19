import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const issue = JSON.parse(fs.readFileSync("content/issues/v07-i03.json", "utf8"));
const catalog = JSON.parse(fs.readFileSync("content/catalog.json", "utf8"));
const reviewSlug = "kusak-ve-yolun-guvenligi-ozel-guvenlik-risk-ve-cinin-kuresel-genislemesi";
const normalize = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

function terminalUrl(text) {
  const value = normalize(text);
  const index = value.search(/https?:\/\//i);
  if (index < 0) return null;
  const tail = value.slice(index);
  const marker = tail.search(/\s+(?:adresinden|adresine)\b/iu);
  return (marker >= 0 ? tail.slice(0, marker) : tail).replace(/[.,;:]$/, "");
}

test("V7I3 keeps canonical locale files and the June 2026 publication date", () => {
  assert.equal(issue.articles.length, 8);
  for (const slug of issue.articles) {
    const dir = path.join("content/articles", slug, "fulltext");
    assert.deepEqual(fs.readdirSync(dir).sort(), ["en.json", "tr.json"], slug);
    assert.ok(catalog.fulltext.localized.includes(slug), slug);
    assert.ok(!catalog.fulltext.current.includes(slug), slug);
    assert.ok(!catalog.fulltext.en_archive.includes(slug), slug);
    const metadata = JSON.parse(fs.readFileSync(path.join("content/articles", slug, "metadata.json"), "utf8"));
    const published = metadata.schemaVersion === 2 ? metadata.dates?.published : metadata.published_online_date;
    assert.equal(published, "2026-06-01", slug);
  }
});

test("V7I3 Turkish references contain no PDF line-break corruption inside URLs or DOI strings", () => {
  for (const slug of issue.articles) {
    const tr = JSON.parse(fs.readFileSync(path.join("content/articles", slug, "fulltext", "tr.json"), "utf8"));
    for (const reference of tr.references ?? []) {
      const url = terminalUrl(reference.text);
      if (url) {
        assert.doesNotMatch(url, /\s/u, `${slug} ${reference.id}: ${url}`);
        assert.doesNotMatch(url, /^https:\/\/10\./i, `${slug} ${reference.id}: malformed DOI URL ${url}`);
      }
      const doi = normalize(reference.text).match(/\bdoi:\s*(10\..*)$/iu)?.[1];
      if (doi) assert.doesNotMatch(doi, /\s/u, `${slug} ${reference.id}: split DOI ${doi}`);
    }
  }
});

test("V7I3 has distinct bilingual text without embedded PDF page-number tokens", () => {
  for (const slug of issue.articles) {
    const dir = path.join("content/articles", slug, "fulltext");
    const en = JSON.parse(fs.readFileSync(path.join(dir, "en.json"), "utf8"));
    const tr = JSON.parse(fs.readFileSync(path.join(dir, "tr.json"), "utf8"));
    assert.ok(en.sections?.length, slug);
    assert.ok(tr.sections?.length, slug);
    const enBody = en.sections.flatMap((section) => section.paragraphs ?? []).join(" ");
    const trBody = tr.sections.flatMap((section) => section.paragraphs ?? []).join(" ");
    assert.notEqual(enBody, trBody, slug);
    for (const body of [enBody, trBody]) {
      assert.doesNotMatch(body, /(?<=[A-Za-zÀ-ž])\d{3}\s+(?=[A-Za-zÀ-ž])/u, slug);
    }
  }
});

test("V7I3 book review does not publish the reviewed-book citation as an abstract", () => {
  const metadata = JSON.parse(fs.readFileSync(path.join("content/articles", reviewSlug, "metadata.json"), "utf8"));
  if (metadata.schemaVersion === 2) {
    assert.equal(metadata.abstract?.tr, null);
    assert.equal(metadata.abstract?.en, null);
  } else {
    assert.equal(metadata.abstract_tr, "");
    assert.equal(metadata.abstract_en, "");
  }
});


test("V7I3 preserves the PDF-verified fidelity repairs", () => {
  const root = "content/articles";

  const swiss = JSON.parse(fs.readFileSync(path.join(root, "kultur-varliklarinin-yasadisi-ithalatinin-onlenmesi-ve-iadesine-iliskin-turkiye-ile-isvicre", "fulltext", "en.json"), "utf8"));
  assert.equal(swiss.sections[0].title, "Introduction");
  assert.equal(swiss.sections[0].paragraphs.length, 5);
  assert.match(swiss.sections[0].paragraphs[0], /^Annual data on the illicit trade in cultural property/i);
  assert.doesNotMatch(swiss.sections[0].paragraphs.join(" "), /Keywords:\s*asymmetrical provisions/i);

  const ich = JSON.parse(fs.readFileSync(path.join(root, "cinde-somut-olmayan-kulturel-mirasin-korunmasi-yirmi-yillik-deneyim-suregelen-zorluklar-ve-gelecege", "fulltext", "en.json"), "utf8"));
  assert.deepEqual(ich.footnotes.map((note) => note.id), ["1", "2"]);
  assert.match(ich.footnotes[0].text, /^The Hezhe Imakan tradition constitutes a vital component/);
  assert.match(ich.footnotes[1].text, /^The Asia-Pacific Centre is a UNESCO Category 2 Centre/);

  const mongolia = JSON.parse(fs.readFileSync(path.join(root, "mogolistanin-ucuncu-komsu-diplomasisinde-kurumsal-dengeleme-sanghay-isbirligi-orgutu-ile-etkilesim", "fulltext", "en.json"), "utf8"));
  assert(!mongolia.sections.some((section) => section.title === "Figure 1. Mongolia-Russia-China Economic Corridor"));
  assert.equal(mongolia.figures[2].caption, "Figure 1. Mongolia-Russia-China Economic Corridor (Map: Tuvshintur, 2018).");
  assert.match(mongolia.figures[1].caption, /^“The Soviet withdrawal of its troops/);

  const review = JSON.parse(fs.readFileSync(path.join(root, reviewSlug, "fulltext", "en.json"), "utf8"));
  assert.match(review.figures[0].caption, /^“Looking ahead, the book examines future developments shaping security along the BRI\.”/);
  assert.equal(review.figures[1].caption, "Arduino, A. (2018). China’s Private Army: Protecting the New Silk Road. Singapore: Palgrave Pivot.");

  for (const slug of issue.articles) {
    for (const locale of ["en", "tr"]) {
      const fulltext = JSON.parse(fs.readFileSync(path.join(root, slug, "fulltext", `${locale}.json`), "utf8"));
      for (const figure of fulltext.figures ?? []) {
        assert.doesNotMatch(figure.caption, /^(?:Figure|Şekil)\s+\d+$/u, `${slug} ${locale} ${figure.id}`);
      }
    }
  }
});
