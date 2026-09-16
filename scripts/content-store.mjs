import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const safeSlug = /^[a-z0-9-]+$/;
const keywordSpacingFixes = new Map([
  ["BeltandRoadInitiative", "Belt and Road Initiative"],
  ["GlobalSouth", "Global South"],
  ["internationaldevelopmentcooperation", "international development cooperation"],
  ["TürkiyeÇin ilişkileri", "Türkiye Çin ilişkileri"],
  ["TürkiyeChina relations", "Türkiye China relations"],
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

function normalizeKeywordList(keywords) {
  if (!Array.isArray(keywords)) return keywords;
  return keywords.map((keyword) => keywordSpacingFixes.get(keyword) || keyword);
}

function normalizeFullTextKeywords(record) {
  if (!record) return record;
  if (Array.isArray(record.keywords)) record.keywords = normalizeKeywordList(record.keywords);
  if (record.tr) record.tr.keywords = normalizeKeywordList(record.tr.keywords);
  if (record.en) record.en.keywords = normalizeKeywordList(record.en.keywords);
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
  return normalizeFullTextKeywords(await readJson(join(root, "content/articles", slug, "fulltext", file)));
}

export async function loadFullTextCollections(root = process.cwd()) {
  const catalog = await loadCatalog(root);
  const currentSlugs = catalog.fulltext.current || [];
  const archiveSlugs = catalog.fulltext.en_archive || [];
  assert(new Set(currentSlugs).size === currentSlugs.length, "Duplicate current full-text slug.");
  assert(new Set(archiveSlugs).size === archiveSlugs.length, "Duplicate English archive full-text slug.");

  const current = {};
  for (const slug of currentSlugs) current[slug] = await readFullTextRecord(root, slug, "current.json");

  const enArchive = {};
  for (const slug of archiveSlugs) enArchive[slug] = await readFullTextRecord(root, slug, "en-archive.json");

  const saudiSlug = catalog.fulltext.saudi_en;
  const saudiEn = saudiSlug ? await readFullTextRecord(root, saudiSlug, "saudi-en.json") : null;
  return { current, enArchive, saudiEn, saudiSlug };
}
