import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const guide = readFileSync(new URL("../app/components/SubmissionGuide.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const en = readFileSync(new URL("../app/en/[...slug]/page.tsx", import.meta.url), "utf8");
const tr = readFileSync(new URL("../app/tr/[...slug]/page.tsx", import.meta.url), "utf8");
const chrome = readFileSync(new URL("../app/components/SiteChrome.tsx", import.meta.url), "utf8");

test("the submission accordion reserves separate columns for the text and toggle", () => {
  assert.match(css, /grid-template-columns:34px 25px minmax\(0,1fr\) 18px/);
  assert.match(css, /grid-template-columns:25px 22px minmax\(0,1fr\) 18px/);
  assert.match(css, /\.submission-step summary::after \{[^}]*grid-column:4/);
  assert.match(css, /\.submission-step summary > span:last-of-type \{[^}]*grid-column:3/);
  assert.match(css, /:not\(\.editorial-next-link\)/);
});

test("both locales describe the five actual DergiPark submission stages", () => {
  const trSteps = guide.match(/const stepsTr = \[([\s\S]*?)\];/)?.[1] || "";
  const enSteps = guide.match(/const stepsEn = \[([\s\S]*?)\];/)?.[1] || "";
  assert.equal((trSteps.match(/title:/g) || []).length, 5);
  assert.equal((enSteps.match(/title:/g) || []).length, 5);
  assert.match(trSteps, /Makale üst verilerini girin/);
  assert.match(trSteps, /Ek bilgileri ve beyanları tamamlayın/);
  assert.match(enSteps, /Complete additional information/);
  assert.match(guide, /intihal\.net/);
});

test("English submission guide has a reciprocal canonical locale route and internal CTA", () => {
  assert.match(en, /"for-authors\/submit": \["Submit a Manuscript"/);
  assert.match(en, /<SubmissionGuide locale="en" \/>/);
  assert.match(en, /key === "for-authors\/submit"/);
  assert.match(tr, /"yazarlar\/yazi-gonder": "\/en\/for-authors\/submit"/);
  assert.match(chrome, /"\/tr\/yazarlar\/yazi-gonder": "\/en\/for-authors\/submit"/);
  assert.match(chrome, /isEnglish \? "\/en\/for-authors\/submit" : "\/tr\/yazarlar\/yazi-gonder"/);
  assert.doesNotMatch(tr, /<a className="submission-mobile-help"/);
});
