import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Volume 6 Issue 1 swaps bilingual title and subtitle with subtitle above", async () => {
  const [copy, trPage, enPage] = await Promise.all([
    readFile(new URL("../app/issue-copy.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/tr/[...slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/en/[...slug]/page.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(
    copy,
    /tr: \{ title: "Kuşak-Yol’da Bilimsel Teknolojik İşbirliği", subtitle: "Gelişen Dünya İçin Kalkınma Yolu" \}/,
  );
  assert.match(
    copy,
    /en: \{ title: "Scientific and Technological Cooperation Along the Belt & Road", subtitle: "The Development Pathway for the Developing World" \}/,
  );

  assert.match(trPage, /const isVolumeSixIssueOne = volume === 6 && issue === 1;/);
  assert.match(enPage, /const isVolumeSixIssueOne = volume === 6 && issueNumber === 1;/);
  assert.match(
    trPage,
    /subtitleFirst=\{isVolumeSevenIssueFour \|\| isVolumeSevenIssueOne \|\| isVolumeSixIssueThree \|\| isVolumeSixIssueTwo \|\| isVolumeSixIssueOne\}/,
  );
  assert.match(
    enPage,
    /subtitleFirst=\{isVolumeSevenIssueFour \|\| isVolumeSevenIssueOne \|\| isVolumeSixIssueThree \|\| isVolumeSixIssueTwo \|\| isVolumeSixIssueOne\}/,
  );

  assert.match(
    trPage,
    /subtitleScale75=\{isVolumeSevenIssueFour \|\| isVolumeSevenIssueOne \|\| isVolumeSixIssueThree\}/,
  );
  assert.match(
    enPage,
    /subtitleScale75=\{isVolumeSevenIssueFour \|\| isVolumeSevenIssueOne \|\| isVolumeSixIssueThree\}/,
  );
});
