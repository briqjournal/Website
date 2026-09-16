import assert from "node:assert/strict";
import test from "node:test";
import { buildArchiveData } from "../scripts/archive-store.mjs";
import { isArticleMetadataV2, toArchiveArticle } from "../scripts/article-metadata.mjs";

const sampleV2 = {
  schemaVersion: 2,
  id: "sample-article",
  articleType: {
    id: "review-article",
    tr: "Derleme Makalesi",
    en: "Review Article",
    peerReviewed: true,
  },
  title: { en: "Article Title", tr: "Makale Başlığı" },
  authors: [
    {
      displayName: "John Smith",
      givenName: "John",
      familyName: "Smith",
      orcid: "https://orcid.org/0000-0000-0000-0000",
      affiliations: [
        {
          name: "Example University",
          nameTr: "Örnek Üniversitesi",
          nameEn: "Example University",
          country: "Türkiye",
          ror: null,
        },
      ],
    },
  ],
  abstract: { en: "English abstract", tr: "Türkçe özet" },
  keywords: { en: ["China"], tr: ["Çin"] },
  dates: {
    received: "2026-01-15",
    revised: "2026-03-20",
    accepted: "2026-04-10",
    published: "2026-06-01",
  },
  journal: {
    title: "BRIQ Belt & Road Initiative Quarterly",
    titleTr: "BRIQ Kuşak ve Yol Girişimi Dergisi",
    issn: null,
    eissn: null,
    volume: 7,
    issue: 3,
    year: 2026,
    season: { en: "Summer", tr: "Yaz" },
  },
  pages: { first: "25", last: "44" },
  doi: "10.67696/example",
  language: ["en", "tr"],
  license: {
    name: "CC BY 4.0",
    url: "https://creativecommons.org/licenses/by/4.0/",
  },
  funding: {
    statement: { en: "Funded by Example.", tr: "Örnek tarafından desteklenmiştir." },
    funders: [
      {
        name: "Example Funder",
        awardNumbers: ["ABC-123"],
      },
    ],
  },
  conflictOfInterest: { en: "None.", tr: "Yoktur." },
  authorContributions: {
    statement: { en: "Sole author.", tr: "Tek yazardır." },
    creditRoles: [{ role: "Writing – original draft", authors: ["John Smith"] }],
  },
  ethicsApproval: null,
  dataAvailability: {
    statement: { en: "No dataset was generated.", tr: "Veri seti üretilmemiştir." },
    repositoryName: null,
    doi: null,
    url: null,
  },
  aiUse: null,
  urls: {
    en: "https://briqjournal.com/en/sample-article",
    tr: "https://briqjournal.com/tr/makaleler/sample-article",
    pdfEn: "/makale/sample-article/en.pdf",
    pdfTr: "/makale/sample-article/tr.pdf",
    pdfEnLocal: "/assets/archive/pdfs/articles/sample-article-en.pdf",
    pdfTrLocal: "/assets/archive/pdfs/articles/sample-article-tr.pdf",
    sharedBilingualPdf: false,
  },
};

test("detects article metadata v2", () => {
  assert.equal(isArticleMetadataV2(sampleV2), true);
  assert.equal(isArticleMetadataV2({ slug: "legacy" }), false);
});

test("maps metadata v2 to the existing archive contract", () => {
  const article = toArchiveArticle(sampleV2);
  assert.equal(article.slug, "sample-article");
  assert.equal(article.volume, 7);
  assert.equal(article.issue, 3);
  assert.equal(article.author, "John Smith");
  assert.equal(article.title_tr, "Makale Başlığı");
  assert.equal(article.title_en, "Article Title");
  assert.equal(article.pages, "25-44");
  assert.equal(article.received_date, "2026-01-15");
  assert.equal(article.revised_date, "2026-03-20");
  assert.equal(article.accepted_date, "2026-04-10");
  assert.equal(article.published_online_date, "2026-06-01");
  assert.deepEqual(article.orcids, ["0000-0000-0000-0000"]);
  assert.equal(article.publication_type_tr, "Derleme Makalesi");
  assert.equal(article.publication_type_en, "Review Article");
  assert.equal(article.funding.funders[0].grant_or_project_number, "ABC-123");
  assert.equal(article.conflict_of_interest.statement_en, "None.");
});

test("legacy metadata remains unchanged during gradual migration", () => {
  const legacy = {
    slug: "legacy-article",
    volume: 6,
    issue: 4,
    author: "Legacy Author",
  };
  assert.equal(toArchiveArticle(legacy), legacy);
});

test("current repository can still build through the v2-aware archive loader", async () => {
  const archive = await buildArchiveData(process.cwd());
  assert.ok(archive.issues.length > 0);
  assert.ok(archive.articles.length > 0);
  assert.equal(archive.articles.length, archive.issues.flatMap((issue) => issue.articles).length);
  assert.ok(archive.articles.every((article) => article.slug && article.volume && article.issue));
});
