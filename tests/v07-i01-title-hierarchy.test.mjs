import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Volume 7 Issue 1 keeps the crisis line as subtitle and solution line as main title", async () => {
  const [copy, platform, trPage, enPage, css] = await Promise.all([
    readFile(new URL("../app/issue-copy.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/components/IssuePlatform.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/tr/[...slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/en/[...slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(
    copy,
    /tr: \{ title: "Çözüm Yükselen Güney’de", subtitle: "İklim-Su-Gıda Krizi" \}/,
  );
  assert.match(
    copy,
    /en: \{ title: "The Solution Lies in the Global South", subtitle: "The Climate-Water-Food Crisis" \}/,
  );

  assert.match(platform, /subtitleScale75\?: boolean/);
  assert.match(trPage, /const isVolumeSevenIssueOne = volume === 7 && issue === 1;/);
  assert.match(enPage, /const isVolumeSevenIssueOne = volume === 7 && issueNumber === 1;/);
  assert.match(trPage, /subtitleFirst=\{isVolumeSevenIssueFour \|\| isVolumeSevenIssueOne\}/);
  assert.match(enPage, /subtitleFirst=\{isVolumeSevenIssueFour \|\| isVolumeSevenIssueOne\}/);
  assert.match(trPage, /subtitleScale75=\{isVolumeSevenIssueFour\}/);
  assert.match(enPage, /subtitleScale75=\{isVolumeSevenIssueFour\}/);
  assert.match(css, /h1\.issue-title-subtitle-first em \{[\s\S]*margin: 0 0 10px;\s*\}/);
});
