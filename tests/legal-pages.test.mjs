import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

const pairs = [
  ["tr/gizlilik-politikasi", "en/privacy-policy", "privacy"],
  ["tr/cerez-politikasi", "en/cookie-policy", "cookies"],
];

test("legal policy pages exist in both locales with reciprocal alternate metadata", () => {
  const footer = read("app/components/SiteChrome.tsx");
  const sitemap = read("app/sitemap.ts");
  for (const [trPath, enPath, kind] of pairs) {
    for (const path of [trPath, enPath]) {
      assert.ok(existsSync(new URL("../app/" + path + "/page.tsx", import.meta.url)), path);
      assert.ok(sitemap.includes('"' + path + '"'), "Missing sitemap route: " + path);
      const page = read("app/" + path + "/page.tsx");
      assert.ok(page.includes('kind="' + kind + '"'), "Wrong policy route: " + path);
      assert.ok(page.includes('"/' + trPath + '"'), "Missing TR alternate: " + path);
      assert.ok(page.includes('"/' + enPath + '"'), "Missing EN alternate: " + path);
      assert.ok(footer.includes('"/' + path + '"'), "Missing footer or switch link: " + path);
    }
  }
});

test("legal pages do not introduce cookies, storage, tracking or additional Worker calls", () => {
  const sources = [
    read("app/legal-copy.ts"),
    read("app/components/LegalPage.tsx"),
    ...pairs.flatMap(([trPath, enPath]) => [
      read("app/" + trPath + "/page.tsx"),
      read("app/" + enPath + "/page.tsx"),
    ]),
  ];
  const source = sources.join("\n");
  assert.doesNotMatch(source, /document\.cookie\s*=|localStorage\.setItem|sessionStorage\.setItem|navigator\.sendBeacon|fetch\s*\(/);
});
