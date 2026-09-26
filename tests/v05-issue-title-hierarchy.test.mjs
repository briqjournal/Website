import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Volume 5 issue title hierarchy is shared across Turkish and English routes", async () => {
  const [copy, trPage, enPage] = await Promise.all([
    readFile(new URL("../app/issue-copy.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/tr/[...slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/en/[...slug]/page.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(copy, /"5-4": \{[\s\S]*tr: \{ title: "Kuşak-Yol Ve Türk Devletleri Teşkilatı", subtitle: "" \},[\s\S]*en: \{ title: "Belt & Road and Organization of Turkic States", subtitle: "" \}/);
  assert.match(copy, /"5-3": \{[\s\S]*tr: \{ title: "Medeniyetlerin Kaynaşma Yolu", subtitle: "Kuşak-Yol Ve İslam Dünyası" \},[\s\S]*en: \{ title: "Bridging Civilizations", subtitle: "BRI and the Islamic World" \}/);
  assert.match(copy, /"5-1": \{[\s\S]*tr: \{ title: "Hegemonyacılığa Karşı Dolarsızlaşma", subtitle: "Gelişen Dünyada Yükselen Finansal İşbirliği" \},[\s\S]*en: \{ title: "De-Dollarization Against Hegemonism", subtitle: "Emerging Financial Cooperation in the Developing World" \}/);

  assert.match(copy, /const subtitleFirstIssues = new Set\(\[[\s\S]*"5-3",[\s\S]*"5-1",[\s\S]*\]\);/);
  assert.doesNotMatch(copy, /const subtitleFirstIssues = new Set\(\[[\s\S]*"5-4",[\s\S]*\]\);/);

  for (const page of [trPage, enPage]) {
    assert.match(page, /getIssueHeadingLayout/);
    assert.match(page, /subtitleFirst=\{headingLayout\.subtitleFirst\}/);
    assert.match(page, /subtitleScale75=\{headingLayout\.subtitleScale75\}/);
  }
});
