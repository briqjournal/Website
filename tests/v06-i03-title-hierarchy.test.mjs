import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Volume 6 Issue 3 uses the 70th anniversary line as subtitle in both locales", async () => {
  const [copy, trPage, enPage] = await Promise.all([
    readFile(new URL("../app/issue-copy.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/tr/[...slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/en/[...slug]/page.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(
    copy,
    /tr: \{ title: "Bandung’dan BRICS’e Hegemonyacılığa Karşı Küresel Güney’in Yükselişi", subtitle: "70\. Yıldönümünde" \}/,
  );
  assert.match(
    copy,
    /en: \{ title: "From Bandung to BRICS The Emergence of the Global South Against Hegemonism", subtitle: "On its 70th Anniversary" \}/,
  );

  assert.match(trPage, /const isVolumeSixIssueThree = volume === 6 && issue === 3;/);
  assert.match(enPage, /const isVolumeSixIssueThree = volume === 6 && issueNumber === 3;/);
  assert.match(trPage, /subtitleFirst=\{isVolumeSevenIssueFour \|\| isVolumeSevenIssueOne \|\| isVolumeSixIssueThree\}/);
  assert.match(enPage, /subtitleFirst=\{isVolumeSevenIssueFour \|\| isVolumeSevenIssueOne \|\| isVolumeSixIssueThree\}/);

  assert.match(trPage, /subtitleScale75=\{isVolumeSevenIssueFour \|\| isVolumeSevenIssueOne\}/);
  assert.match(enPage, /subtitleScale75=\{isVolumeSevenIssueFour \|\| isVolumeSevenIssueOne\}/);
});
