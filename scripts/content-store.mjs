import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const safeSlug = /^[a-z0-9-]+$/;
const keywordSpacingFixes = new Map([
  ["BeltandRoadInitiative", "Belt and Road Initiative"],
  ["GlobalSouth", "Global South"],
  ["internationaldevelopmentcooperation", "international development cooperation"],
  ["TürkiyeÇin ilişkileri", "Türkiye-Çin ilişkileri"],
  ["TürkiyeChina relations", "Türkiye-China relations"],
]);

export const bilingualKeywordParityOverrides = new Map([
  ["rusyanin-bolgesel-guvenlikteki-rolu-uzerine-bir-inceleme-kolektif-guvenlik-antlasmasi-orgutu-ve", {
    source: "en",
    tr: ["Orta Asya güvenliği", "teröre karşı mücadele stratejileri", "KGAÖ", "İslami radikalizm", "Rusya’nın dış politikası", "ulusötesi cihatçı ağlar"],
    en: ["Central Asian security", "counterterrorism strategies", "CSTO", "Islamic radicalism", "Russia’s foreign policy", "transnational jihadist networks"],
  }],
]);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertSlug(slug, context) {
  assert(safeSlug.test(slug), `Unsafe article slug in ${context}: ${slug}`);
}

function titleCaseKeyword(value, locale) {
  const language = locale === "tr" ? "tr-TR" : "en-US";
  return value.trim().replace(/\p{L}[\p{L}\p{M}]*(?:['’]\p{L}[\p{L}\p{M}]*)?/gu, (word) => {
    const letters = word.replace(/[^\p{L}]/gu, "");
    if (letters.length > 1 && letters === letters.toLocaleUpperCase(language)) return word;
    const lower = word.toLocaleLowerCase(language);
    return lower.replace(/\p{L}/u, (letter) => letter.toLocaleUpperCase(language));
  });
}

function normalizeKeywordList(keywords, locale) {
  if (!Array.isArray(keywords)) return keywords;
  return keywords.map((keyword) => titleCaseKeyword(keywordSpacingFixes.get(keyword) || keyword, locale));
}

function normalizeFullTextKeywords(record, slug) {
  if (!record) return record;
  const parityOverride = bilingualKeywordParityOverrides.get(slug);
  if (record.tr && record.en && parityOverride) {
    record.tr.keywords = [...parityOverride.tr];
    record.en.keywords = [...parityOverride.en];
  }
  if (Array.isArray(record.keywords)) record.keywords = normalizeKeywordList(record.keywords, "en");
  if (record.tr) record.tr.keywords = normalizeKeywordList(record.tr.keywords, "tr");
  if (record.en) record.en.keywords = normalizeKeywordList(record.en.keywords, "en");
  return record;
}

export async function loadCatalog(root = process.cwd()) {
  const catalog = await readJson(join(root, "content/catalog.json"));
  assert(Array.isArray(catalog.issue_order), "content/catalog.json must define issue_order.");
  assert(Array.isArray(catalog.article_order), "content/catalog.json must define article_order.");
  assert(catalog.fulltext && typeof catalog.fulltext === "object", "content/catalog.json must define fulltext.");
  return catalog;
}

export async function buildArchiveData(root = process.cwd()) {
  const catalog = await loadCatalog(root);
  const issues = [];
  const issueKeys = new Set();
  const referencedArticles = [];

  for (const file of catalog.issue_order) {
    assert(/^v\d{2}-i\d{2}\.json$/.test(file), `Unsafe issue filename: ${file}`);
    const issue = await readJson(join(root, "content/issues", file));
    const key = `${issue.volume}:${issue.issue}`;
    assert(!issueKeys.has(key), `Duplicate issue: ${key}`);
    issueKeys.add(key);
    assert(Array.isArray(issue.articles), `Issue ${key} must define articles.`);
    for (const slug of issue.articles) {
      assertSlug(slug, `issue ${key}`);
      referencedArticles.push(slug);
    }
    issues.push(issue);
  }

  const orderedSlugs = catalog.article_order;
  assert(new Set(orderedSlugs).size === orderedSlugs.length, "Duplicate slug in article_order.");
  assert(new Set(referencedArticles).size === referencedArticles.length, "An article is assigned to more than one issue.");
  assert(orderedSlugs.length === referencedArticles.length, "article_order and issue article lists differ in length.");
  assert(orderedSlugs.every((slug, index) => slug === referencedArticles[index]), "article_order must match issue article order exactly.");

  const articles = [];
  const dois = new Set();
  for (const slug of orderedSlugs) {
    assertSlug(slug, "article_order");
    const article = await readJson(join(root, "content/articles", slug, "metadata.json"));
    assert(article.slug === slug, `Metadata slug mismatch for ${slug}.`);
    assert(issueKeys.has(`${article.volume}:${article.issue}`), `Missing issue for ${slug}.`);
    if (article.doi) {
      assert(!dois.has(article.doi), `Duplicate DOI: ${article.doi}`);
      dois.add(article.doi);
    }
    articles.push(article);
  }

  const articleDirectories = (await readdir(join(root, "content/articles"), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const catalogDirectories = [...orderedSlugs].sort();
  assert(JSON.stringify(articleDirectories) === JSON.stringify(catalogDirectories), "Article directories and article_order differ.");

  return {
    generated_from: catalog.generated_from,
    issues,
    articles,
    pdf_archive: catalog.pdf_archive,
  };
}

async function readFullTextRecord(root, slug, file) {
  assertSlug(slug, file);
  const record = normalizeFullTextKeywords(await readJson(join(root, "content/articles", slug, "fulltext", file)), slug);
  return record;
}

async function readLocalizedFullText(root, slug, locale) {
  assertSlug(slug, `${locale}.json`);
  const record = await readJson(join(root, "content/articles", slug, "fulltext", `${locale}.json`));
  if (Array.isArray(record.keywords)) record.keywords = normalizeKeywordList(record.keywords, locale);
  return record;
}

export async function loadFullTextCollections(root = process.cwd()) {
  const catalog = await loadCatalog(root);
  const localizedSlugs = catalog.fulltext.localized || [];
  const currentSlugs = catalog.fulltext.current || [];
  const archiveSlugs = catalog.fulltext.en_archive || [];
  assert(new Set(localizedSlugs).size === localizedSlugs.length, "Duplicate localized full-text slug.");
  assert(new Set(currentSlugs).size === currentSlugs.length, "Duplicate current full-text slug.");
  assert(new Set(archiveSlugs).size === archiveSlugs.length, "Duplicate English archive full-text slug.");
  const localized = {};
  for (const slug of localizedSlugs) localized[slug] = {
    en: await readLocalizedFullText(root, slug, "en"),
    tr: await readLocalizedFullText(root, slug, "tr"),
  };
  const current = {};
  for (const slug of currentSlugs) current[slug] = await readFullTextRecord(root, slug, "current.json");
  const enArchive = {};
  for (const slug of archiveSlugs) enArchive[slug] = await readFullTextRecord(root, slug, "en-archive.json");
  return { localized, current, enArchive };
}