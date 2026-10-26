import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const base = new URL("../", import.meta.url);
const load = (p) => readFile(new URL(p, base), "utf8");

test("Volume 7 Issue 2 supplementary entries already exist as published article records", async () => {
  const [issue, supplementary] = await Promise.all([
    load("content/issues/v07-i02.json"),
    load("app/issue-supplementary.ts"),
  ]);
  const data = JSON.parse(issue);
  const section = supplementary.split("export const volumeSevenIssueTwoSupplementary")[1]
    .split("export const volumeSevenIssueThreeSupplementary")[0];
  const slugs = [...section.matchAll(/sourceSlug: "([^"]+)"/g)].map(m => m[1]);
  assert.equal(slugs.length, 5);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const slug of slugs) assert.ok(data.articles.includes(slug), slug);
});

test("TOC prefers published HTML and preserves PDF page fallback for PDF-only items", async () => {
  const source = await load("app/components/IssuePlatform.tsx");
  assert.ok(source.includes("content.sourceSlug ? findArchiveArticle(content.sourceSlug) : undefined"));
  assert.ok(source.includes('/en/articles/${articleRouteSlug(publication, "en")}'));
  assert.ok(source.includes('/tr/makaleler/${publication.slug}'));
  assert.ok(source.includes('${readingPdf}#page=${content.pdfPage}'));
  assert.ok(source.includes('href={canonicalPageHref(href)}'));
  assert.ok(source.includes('.filter((slug) => !supplementalSlugs.has(slug))'));
});
