import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../app/components/ArticleFigures.tsx", import.meta.url), "utf8");

test("ArticleFigures defensively normalizes empty and missing captions", () => {
  assert.match(source, /\(figure\.caption \?\? ["']{2}\)\.trim\(\)/);
  assert.match(source, /return \(figure\.caption \?\? ["']{2}\)/);
  assert.match(source, /alt=\{figure\.caption \?\? ["']{2}\}/);
  assert.match(source, /alt=\{active\.caption \?\? ["']{2}\}/);
});
