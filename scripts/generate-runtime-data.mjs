import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const root = process.cwd();
const archive = JSON.parse(await readFile(join(root, "app/archive-data.json"), "utf8"));

const searchIndex = Object.fromEntries(
  archive.articles.map((article) => [
    article.slug,
    [article.abstract_tr, article.abstract_en].filter(Boolean).join(" "),
  ]),
);

const pdfRoutes = {};
for (const article of archive.articles) {
  if (article.pdf_tr_local) pdfRoutes[`makale/${article.slug}/tr.pdf`] = article.pdf_tr_local;
  if (article.pdf_en_local) pdfRoutes[`makale/${article.slug}/en.pdf`] = article.pdf_en_local;
}
for (const issue of archive.issues) {
  if (issue.pdf_tr_local) pdfRoutes[`sayi/cilt-${issue.volume}-sayi-${issue.issue}/tr.pdf`] = issue.pdf_tr_local;
  if (issue.pdf_en_local) pdfRoutes[`sayi/cilt-${issue.volume}-sayi-${issue.issue}/en.pdf`] = issue.pdf_en_local;
}
for (const [number, reports] of Object.entries(archive.pdf_archive?.reports || {})) {
  if (reports.tr) pdfRoutes[`rapor/${number}/tr.pdf`] = reports.tr;
  if (reports.en) pdfRoutes[`rapor/${number}/en.pdf`] = reports.en;
}

async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value)}\n`, "utf8");
}

await writeJson(join(root, "public/assets/data/article-search-index.json"), searchIndex);
await writeJson(join(root, "app/generated-runtime/pdf-routes.json"), pdfRoutes);
console.log(`Generated ${Object.keys(searchIndex).length} search records and ${Object.keys(pdfRoutes).length} legacy PDF redirects.`);

