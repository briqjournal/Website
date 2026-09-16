import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));

test("audit bilingual keyword count and order", async () => {
  const catalog = await readJson(join(root, "content/catalog.json"));
  const rows = [];
  for (const slug of catalog.fulltext.current || []) {
    const metadata = await readJson(join(root, "content/articles", slug, "metadata.json"));
    const fulltext = await readJson(join(root, "content/articles", slug, "fulltext", "current.json"));
    const tr = Array.isArray(fulltext?.tr?.keywords) ? fulltext.tr.keywords : [];
    const en = Array.isArray(fulltext?.en?.keywords) ? fulltext.en.keywords : [];
    rows.push({
      slug,
      author: metadata.author,
      volume: metadata.volume,
      issue: metadata.issue,
      title_tr: metadata.title_tr,
      title_en: metadata.title_en,
      tr_count: tr.length,
      en_count: en.length,
      tr,
      en,
    });
  }
  console.log(`KEYWORD_PARITY_AUDIT ${JSON.stringify(rows)}`);
  assert.fail(`Audit emitted ${rows.length} bilingual article keyword records for review.`);
});
