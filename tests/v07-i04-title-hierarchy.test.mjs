import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Volume 7 Issue 4 keeps subtitle above the main title across issue pages and home slider", async () => {
  const [copy, platform, trPage, enPage, slider, css] = await Promise.all([
    readFile(new URL("../app/issue-copy.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/components/IssuePlatform.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/tr/[...slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/en/[...slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/HomeHeroSlider.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(
    copy,
    /tr: \{ title: "Hegemonyacılık Geriliyor, Bölgesel İrade Güçleniyor", subtitle: "Batı Asya’da Yeni Dönem" \}/,
  );
  assert.match(
    copy,
    /en: \{ title: "The Erosion of Hegemony and the Rise of Regional Agency", subtitle: "A New Era in West Asia" \}/,
  );

  assert.match(platform, /subtitleFirst \? \(/);
  assert.match(platform, /\{subtitle && <em>\{subtitle\}<\/em>\}/);
  assert.match(platform, /<span>\{title\}<\/span>/);
  assert.match(trPage, /subtitleFirst=\{isVolumeSevenIssueFour\}/);
  assert.match(enPage, /subtitleFirst=\{isVolumeSevenIssueFour\}/);

  assert.match(
    slider,
    /title: "Hegemonyacılık Geriliyor, Bölgesel İrade Güçleniyor",[\s\S]*subtitle: "Batı Asya’da Yeni Dönem",[\s\S]*subtitleFirst: true/,
  );
  assert.match(
    slider,
    /title: "The Erosion of Hegemony and the Rise of Regional Agency",[\s\S]*subtitle: "A New Era in West Asia",[\s\S]*subtitleFirst: true/,
  );
  assert.match(slider, /hero-title-subtitle-first/);
  assert.match(slider, /<em>\{slide\.subtitle\}<\/em>[\s\S]*<span>\{slide\.title\}<\/span>/);

  assert.match(css, /h1\.issue-title-subtitle-first em \{[\s\S]*margin: 0 0 10px;/);
  assert.match(css, /h1\.issue-title-subtitle-first > span \{[\s\S]*font-style: normal;/);
  assert.match(css, /h1\.hero-title-subtitle-first em \{[\s\S]*margin: 0 0 16px;/);
  assert.match(css, /h1\.hero-title-subtitle-first > span \{[\s\S]*font-style: normal;/);
});
