import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const canonicalSubtitle = "The Erosion of Hegemony and the Rise of Regional Agency";
const legacySubtitles = [
  "Hegemonism Recedes, Regional Agency Grows",
  "Hegemonism Recedes, Regional Will Grows Stronger",
];

const sourcePaths = [
  "../app/components/HomeHeroSlider.tsx",
  "../app/components/CurrentIssueEditorial.tsx",
  "../app/issue-copy.ts",
  "../app/issue-themes.ts",
];

test("keeps the Volume 7 Issue 4 English subtitle canonical across every rendered source", async () => {
  const sources = await Promise.all(
    sourcePaths.map((path) => readFile(new URL(path, import.meta.url), "utf8")),
  );

  for (const [index, source] of sources.entries()) {
    assert.match(source, new RegExp(canonicalSubtitle), `${sourcePaths[index]} canonical subtitle`);
    for (const legacySubtitle of legacySubtitles) {
      assert.doesNotMatch(source, new RegExp(legacySubtitle), `${sourcePaths[index]} legacy subtitle`);
    }
  }
});
