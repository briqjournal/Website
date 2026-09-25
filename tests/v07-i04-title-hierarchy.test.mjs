import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Volume 7 Issue 4 Turkish masthead keeps subtitle above the main title", async () => {
  const [copy, platform, trPage, css] = await Promise.all([
    readFile(new URL("../app/issue-copy.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/components/IssuePlatform.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/tr/[...slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(
    copy,
    /tr: \{ title: "Hegemonyacılık Geriliyor, Bölgesel İrade Güçleniyor", subtitle: "Batı Asya’da Yeni Dönem" \}/,
  );
  assert.match(platform, /subtitleFirst \? \(/);
  assert.match(platform, /\{subtitle && <em>\{subtitle\}<\/em>\}/);
  assert.match(platform, /<span>\{title\}<\/span>/);
  assert.match(trPage, /subtitleFirst=\{isVolumeSevenIssueFour\}/);
  assert.match(css, /h1\.issue-title-subtitle-first em \{[\s\S]*margin: 0 0 10px;/);
  assert.match(css, /h1\.issue-title-subtitle-first > span \{[\s\S]*font-style: normal;/);
});
