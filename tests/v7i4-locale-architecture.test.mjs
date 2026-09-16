import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import { buildArchiveData, loadCatalog, loadFullTextCollections } from "../scripts/content-store.mjs";

const issuePath = new URL("../content/issues/v07-i04.json", import.meta.url);
const issue = JSON.parse(await readFile(issuePath, "utf8"));
const saudiSlug = "suudi-arabistanin-abd-ile-cin-arasinda-cok-boyutlu-kulturel-dengeleme-stratejisi";
const jordanSlug = "dijital-ipek-yolu-cercevesinde-cin-arap-isbirligi-urdun-ornegi";
const reviewSlug = "cinin-kuresel-altyapi-stratejisi";
const researchSlugs = issue.articles.filter((slug) => slug !== reviewSlug);

test("keeps Volume 7 Issue 4 exclusively in the locale-split store", async () => {
  const catalog = await loadCatalog();
  const { localized, current, enArchive } = await loadFullTextCollections();

  assert.deepEqual(new Set(catalog.fulltext.localized), new Set(issue.articles));
  for (const slug of issue.articles) {
    assert(localized[slug], `Missing localized record for ${slug}`);
    assert.equal(current[slug], undefined);
    assert.equal(enArchive[slug], undefined);

    for (const legacyName of ["current.json", "en-archive.json", "saudi-en.json"]) {
      const legacyUrl = new URL(`../content/articles/${slug}/fulltext/${legacyName}`, import.meta.url);
      await assert.rejects(access(legacyUrl), { code: "ENOENT" });
    }

    for (const field of ["sections", "keywords", "footnotes", "references", "figures"]) {
      assert.equal(
        localized[slug].en[field].length,
        localized[slug].tr[field].length,
        `${slug} ${field} parity`,
      );
    }
  }
});

test("stores explicit scholarly and peer-review classifications", async () => {
  const archive = await buildArchiveData();
  const records = new Map(archive.articles.map((article) => [article.slug, article]));

  for (const slug of researchSlugs) {
    const article = records.get(slug);
    assert.equal(article.publication_type_en, "Research Article");
    assert.equal(article.publication_type_tr, "Araştırma Makalesi");
    assert.equal(article.peer_reviewed, true);
    assert.equal(article.scholarly, true);
    assert.equal(article.published_online_date, "2026-09-01");
  }

  const review = records.get(reviewSlug);
  assert.equal(review.publication_type_en, "Book Review");
  assert.equal(review.publication_type_tr, "Kitap İncelemesi");
  assert.equal(review.peer_reviewed, false);
  assert.equal(review.scholarly, true);
  assert.equal(review.published_online_date, "2026-09-01");
});

test("keeps declarations in shared metadata and locale prose in full text", async () => {
  const archive = await buildArchiveData();
  const jordan = archive.articles.find((article) => article.slug === jordanSlug);
  const { localized } = await loadFullTextCollections();

  assert.match(jordan.funding.statement_en, /Northwestern Polytechnical University/u);
  assert.match(jordan.funding.statement_tr, /Kuzeybatı Politeknik Üniversitesi/u);
  assert.equal(jordan.funding.funders[0].grant_or_project_number, "D5000260296");
  assert.equal(localized[jordanSlug].en.declarations, undefined);
  assert.equal(localized[jordanSlug].tr.declarations, undefined);
});

test("restores the Saudi English figures and complete source bibliography", async () => {
  const { localized } = await loadFullTextCollections();
  const english = localized[saudiSlug].en;

  assert.equal(english.figures.length, 18);
  assert.equal(english.references.length, 58);
  assert(english.figures.every((figure) => !/(?:Şekil|Tablo|Fotoğraf)/u.test(figure.caption)));
  assert(english.references.some((reference) => reference.text.startsWith("Saudi Gazette. (2025, June 29)")));
  assert(english.references.some((reference) => reference.text.startsWith("Saudi Press Agency. (2025, May 14)")));
  assert(english.references.some((reference) => reference.text.startsWith("Thomas Keith Independent School.")));
  assert(english.references.some((reference) => reference.text.startsWith("Yang, D., & Knowles, H.")));
  assert(!english.references.some((reference) => reference.text.startsWith("Saudi Space Agency. (2025).")));
});

test("uses the real English cover and source issue PDF without a Turkish fallback", () => {
  assert.equal(issue.cover_en, "/assets/archive/covers/cilt-7-sayi-4-en-v3.jpg");
  assert.match(issue.pdf_en_source, /BRIQ%20Volume7%20Issue4%20AUTUMN%202026\\.pdf$/u);
  assert.doesNotMatch(issue.pdf_en_source, /Cilt7|Issue3|SUMMER/u);
});
