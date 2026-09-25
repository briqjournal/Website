import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Volume 7 Issue 3 Turkish masthead uses 75% subtitle scale and lowercase ve", async () => {
  const [copy, platform, trPage, css] = await Promise.all([
    readFile(new URL("../app/issue-copy.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/components/IssuePlatform.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/tr/[...slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(
    copy,
    /tr: \{ title: "Kültürel Miras Yağması", subtitle: "Emperyalist Hegemonya ve İade Mücadelesi" \}/,
  );
  assert.match(platform, /subtitleScale75\?: boolean/);
  assert.match(platform, /subtitleScale75 \? "issue-title-subtitle-75" : ""/);
  assert.match(trPage, /const isVolumeSevenIssueThree = volume === 7 && issue === 3;/);
  assert.match(trPage, /subtitleScale75=\{isVolumeSevenIssueThree\}/);
  assert.match(css, /h1\.issue-title-subtitle-75 em \{[\s\S]*font-size: \.75em;/);
});
