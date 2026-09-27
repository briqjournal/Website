import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("historical declaration UI keeps only funding and conflict of interest as fixed rows", async () => {
  const source = await readFile(new URL("../app/components/ArticlePlatform.tsx", import.meta.url), "utf8");
  const start = source.indexOf("function researchStatementItems(");
  const end = source.indexOf("function Acknowledgements(", start);
  assert.ok(start >= 0 && end > start);
  const block = source.slice(start, end);

  assert.match(block, /label: "Funding"/);
  assert.match(block, /label: "Conflict of Interest"/);
  assert.match(block, /No conflict of interest was declared by the author\(s\)\./);
  assert.match(block, /Yazar\(lar\) tarafından herhangi bir çıkar çatışması beyan edilmemiştir\./);
  assert.doesNotMatch(block, /label: "Author Contributions"/);
  assert.doesNotMatch(block, /label: "Data Availability"/);
});
