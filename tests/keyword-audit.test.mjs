import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));

function inspectKeywords(keywords, locale, source, candidates, inventory) {
  if (!Array.isArray(keywords)) return;
  for (const raw of keywords) {
    if (typeof raw !== "string") continue;
    const value = raw.trim();
    inventory[locale].add(value);
    const compactLetters = /^[\p{L}\p{M}]+$/u.test(value);
    const camelJoin = /[\p{Ll}][\p{Lu}]/u.test(value) || /[\p{Lu}]{2,}[\p{Lu}][\p{Ll}]/u.test(value);
    const longSingleToken = compactLetters && [...value].length >= 16;
    const whitespaceIssue = raw !== value || /\s{2,}|\u00a0/u.test(raw);
    const punctuationJoin = /[,;:]\S/u.test(value);
    if (camelJoin || longSingleToken || whitespaceIssue || punctuationJoin) {
      candidates.push({ source, locale, value, reasons: [
        camelJoin && "internal-case-boundary",
        longSingleToken && "long-single-token",
        whitespaceIssue && "whitespace",
        punctuationJoin && "punctuation-spacing",
      ].filter(Boolean) });
    }
  }
}

test("audit all canonical article keywords", async () => {
  const catalog = await readJson(join(root, "content/catalog.json"));
  const candidates = [];
  const inventory = { tr: new Set(), en: new Set() };
  let keywordCount = 0;
  let arrayCount = 0;

  for (const slug of catalog.fulltext.current || []) {
    const source = `content/articles/${slug}/fulltext/current.json`;
    const record = await readJson(join(root, source));
    for (const locale of ["tr", "en"]) {
      const keywords = record?.[locale]?.keywords;
      if (Array.isArray(keywords)) {
        arrayCount += 1;
        keywordCount += keywords.length;
      }
      inspectKeywords(keywords, locale, source, candidates, inventory);
    }
  }

  for (const slug of catalog.fulltext.en_archive || []) {
    const source = `content/articles/${slug}/fulltext/en-archive.json`;
    const record = await readJson(join(root, source));
    const keywords = record?.keywords;
    if (Array.isArray(keywords)) {
      arrayCount += 1;
      keywordCount += keywords.length;
    }
    inspectKeywords(keywords, "en", source, candidates, inventory);
  }

  if (catalog.fulltext.saudi_en) {
    const slug = catalog.fulltext.saudi_en;
    const source = `content/articles/${slug}/fulltext/saudi-en.json`;
    const record = await readJson(join(root, source));
    const keywords = record?.keywords;
    if (Array.isArray(keywords)) {
      arrayCount += 1;
      keywordCount += keywords.length;
    }
    inspectKeywords(keywords, "en", source, candidates, inventory);
  }

  console.log(`KEYWORD_AUDIT arrays=${arrayCount} keywords=${keywordCount}`);
  console.log(`KEYWORD_AUDIT_CANDIDATES ${JSON.stringify(candidates)}`);
  console.log(`KEYWORD_INVENTORY_TR ${JSON.stringify([...inventory.tr].sort((a, b) => a.localeCompare(b, "tr")))}`);
  console.log(`KEYWORD_INVENTORY_EN ${JSON.stringify([...inventory.en].sort((a, b) => a.localeCompare(b, "en")))}`);
  assert.fail(`Keyword audit emitted ${candidates.length} candidates for manual review.`);
});
