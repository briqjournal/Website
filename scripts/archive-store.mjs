import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { loadCatalog } from "./content-store.mjs";
import { toArchiveArticle } from "./article-metadata.mjs";

const safeSlug = /^[a-z0-9-]+$/;

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertSlug(slug, context) {
  assert(safeSlug.test(slug), `Unsafe article slug in ${context}: ${slug}`);
}

function metadataIssueKey(record) {
  if (record?.schemaVersion === 2 || record?.id) {
    return `${Number(record.journal?.volume)}:${Number(record.journal?.issue)}`;
  }
  return `${record?.volume}:${record?.issue}`;
}

export async function buildArchiveData(root = process.cwd()) {
  const catalog = await loadCatalog(root);
  const issues = [];
  const issueByKey = new Map();
  const referencedArticles = [];

  for (const file of catalog.issue_order) {
    assert(/^v\d{2}-i\d{2}\.json$/.test(file), `Unsafe issue filename: ${file}`);
    const issue = await readJson(join(root, "content/issues", file));
    const key = `${issue.volume}:${issue.issue}`;
    assert(!issueByKey.has(key), `Duplicate issue: ${key}`);
    issueByKey.set(key, issue);
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
    const raw = await readJson(join(root, "content/articles", slug, "metadata.json"));
    const issueRecord = issueByKey.get(metadataIssueKey(raw));
    const article = toArchiveArticle(raw, issueRecord);
    assert(article.slug === slug, `Metadata slug mismatch for ${slug}.`);
    assert(issueByKey.has(`${article.volume}:${article.issue}`), `Missing issue for ${slug}.`);
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
