import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const importArchive = args.size === 0 || args.has("--all") || args.has("--archive");
const importFullText = args.size === 0 || args.has("--all") || args.has("--fulltext");
const contentRoot = join(root, "content");
const catalogPath = join(contentRoot, "catalog.json");
const safeSlug = /^[a-z0-9-]+$/;
const saudiSlug = "suudi-arabistanin-abd-ile-cin-arasinda-cok-boyutlu-kulturel-dengeleme-stratejisi";

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function readCatalog() {
  try {
    return await readJson(catalogPath);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
    return { generated_from: "https://briqjournal.com", issue_order: [], article_order: [], pdf_archive: {}, fulltext: {} };
  }
}

function requireSlug(slug) {
  if (!safeSlug.test(slug)) throw new Error(`Unsafe article slug: ${slug}`);
}

const catalog = await readCatalog();

if (importArchive) {
  const archive = await readJson(join(root, "app/archive-data.json"));
  catalog.generated_from = archive.generated_from;
  catalog.pdf_archive = archive.pdf_archive;
  catalog.issue_order = [];
  catalog.article_order = archive.articles.map((article) => article.slug);

  for (const issue of archive.issues) {
    const file = `v${String(issue.volume).padStart(2, "0")}-i${String(issue.issue).padStart(2, "0")}.json`;
    catalog.issue_order.push(file);
    await writeJson(join(contentRoot, "issues", file), issue);
  }
  for (const article of archive.articles) {
    requireSlug(article.slug);
    await writeJson(join(contentRoot, "articles", article.slug, "metadata.json"), article);
  }
}

if (importFullText) {
  const current = await readJson(join(root, "app/article-fulltext-current.json"));
  const enArchive = await readJson(join(root, "app/article-fulltext-en-archive.json"));
  const saudiEn = await readJson(join(root, "app/article-fulltext-saudi-en.json"));
  catalog.fulltext = {
    current: Object.keys(current),
    en_archive: Object.keys(enArchive),
    saudi_en: saudiSlug,
  };
  for (const [slug, value] of Object.entries(current)) {
    requireSlug(slug);
    await writeJson(join(contentRoot, "articles", slug, "fulltext/current.json"), value);
  }
  for (const [slug, value] of Object.entries(enArchive)) {
    requireSlug(slug);
    await writeJson(join(contentRoot, "articles", slug, "fulltext/en-archive.json"), value);
  }
  requireSlug(saudiSlug);
  await writeJson(join(contentRoot, "articles", saudiSlug, "fulltext/saudi-en.json"), saudiEn);
}

await writeJson(catalogPath, catalog);
console.log(`Updated modular content: ${catalog.issue_order.length} issues, ${catalog.article_order.length} articles, ${catalog.fulltext.current?.length || 0} current full texts, and ${catalog.fulltext.en_archive?.length || 0} archived English full texts.`);
