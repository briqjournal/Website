import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Volume 6 Issue 3 uses a three-tier bilingual title with 75% upper and lower subtitles", async () => {
  const [copy, platform, trPage, enPage, css] = await Promise.all([
    readFile(new URL("../app/issue-copy.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/components/IssuePlatform.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/tr/[...slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/en/[...slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(
    copy,
    /tr: \{ title: "Bandung’dan BRICS’e", subtitle: "70\. Yıldönümünde", trailingSubtitle: "Hegemonyacılığa Karşı Küresel Güney’in Yükselişi" \}/,
  );
  assert.match(
    copy,
    /en: \{ title: "From Bandung to BRICS", subtitle: "On its 70th Anniversary", trailingSubtitle: "The Emergence of the Global South Against Hegemonism" \}/,
  );
  assert.match(trPage, /subtitleFirst=\{headingLayout\.subtitleFirst\}/);
  assert.match(enPage, /subtitleFirst=\{headingLayout\.subtitleFirst\}/);
  assert.match(trPage, /subtitleScale75=\{headingLayout\.subtitleScale75\}/);
  assert.match(enPage, /subtitleScale75=\{headingLayout\.subtitleScale75\}/);
  assert.match(trPage, /trailingSubtitle=\{heading\.trailingSubtitle\}/);
  assert.match(enPage, /trailingSubtitle=\{heading\.trailingSubtitle\}/);
  assert.match(platform, /trailingSubtitle && <em className="issue-title-trailing-subtitle">\{trailingSubtitle\}<\/em>/);
  assert.match(css, /h1\.issue-title-subtitle-first\.issue-title-subtitle-75 em \{[\s\S]*font-size: \.75em;/);
  assert.match(css, /em\.issue-title-trailing-subtitle \{[\s\S]*margin: 10px 0 0;/);
});
