import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Volume 6 Issue 2 swaps bilingual title and subtitle with subtitle above", async () => {
  const [copy, trPage, enPage] = await Promise.all([
    readFile(new URL("../app/issue-copy.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/tr/[...slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/en/[...slug]/page.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(
    copy,
    /tr: \{ title: "Sun Yat-sen’in Yaşayan Mirası", subtitle: "Ölümünün 100\. Yıldönümünde" \}/,
  );
  assert.match(
    copy,
    /en: \{ title: "The Enduring Legacy of Sun Yat-sen", subtitle: "On the Centenary of His Demise" \}/,
  );

  assert.match(trPage, /const isVolumeSixIssueTwo = volume === 6 && issue === 2;/);
  assert.match(enPage, /const isVolumeSixIssueTwo = volume === 6 && issueNumber === 2;/);
  assert.match(
    trPage,
    /subtitleFirst=\{isVolumeSevenIssueFour \|\| isVolumeSevenIssueOne \|\| isVolumeSixIssueThree \|\| isVolumeSixIssueTwo\}/,
  );
  assert.match(
    enPage,
    /subtitleFirst=\{isVolumeSevenIssueFour \|\| isVolumeSevenIssueOne \|\| isVolumeSixIssueThree \|\| isVolumeSixIssueTwo\}/,
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
