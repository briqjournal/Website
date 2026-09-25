import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const trPath = new URL("../app/tr/[...slug]/page.tsx", import.meta.url);
const enPath = new URL("../app/en/[...slug]/page.tsx", import.meta.url);
const supplementaryPath = new URL("../app/issue-supplementary.ts", import.meta.url);
const editorialPath = new URL("../app/components/CurrentIssueEditorial.tsx", import.meta.url);

test("current issue aliases render the permanent Volume 7 Issue 4 archive page", async () => {
  const [tr, en] = await Promise.all([
    readFile(trPath, "utf8"),
    readFile(enPath, "utf8"),
  ]);

  assert.match(tr, /return <ArchiveIssue volume=\{7\} issue=\{4\} current \/>;/);
  assert.match(en, /return <EnglishIssue volume=\{7\} issueNumber=\{4\} current \/>;/);

  assert.match(tr, /canonical: `\/tr\/arsiv\/cilt-\$\{issue\.volume\}-sayi-\$\{issue\.issue\}`/);
  assert.match(en, /canonical: `\/en\/archive\/volume-\$\{issue\.volume\}-issue-\$\{issue\.issue\}`/);
});

test("Volume 7 Issue 4 remains complete at its permanent archive URLs", async () => {
  const [supplementary, editorial] = await Promise.all([
    readFile(supplementaryPath, "utf8"),
    readFile(editorialPath, "utf8"),
  ]);

  assert.match(supplementary, /volumeSevenIssueFourSupplementary/);
  assert.match(supplementary, /if \(issue === 4\) return volumeSevenIssueFourSupplementary;/);
  assert.match(supplementary, /\(volume === 7 && issue === 4\)/);

  assert.match(editorial, /currentAlias = false/);
  assert.match(editorial, /const issueHref = currentAlias/);
  assert.doesNotMatch(editorial, /const current = volume === 7 && issueNumber === 4/);
});
