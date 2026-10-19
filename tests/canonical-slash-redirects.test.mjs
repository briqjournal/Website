import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

// These rules run in Cloudflare Workers Static Assets, before Worker fetch.
// Worker.fetch cannot exercise them; preview HTTP tests validate deployment.
const source = readFileSync(new URL("../public/_redirects", import.meta.url), "utf8");
const lines = source.split(/\r?\n/).map(x => x.trim()).filter(x => x && !x.startsWith("#"));
const rules = lines.map((line) => line.split(/\s+/));
const bySource = new Map(rules.map(([src, target, code]) => [src, { target, code }]));

test("published canonical redirects are bounded, exact and loop-free", () => {
  assert.equal(lines.length, 1256, "audited sitemap snapshot");
  assert.ok(lines.length <= 2000, "Cloudflare static rules limit");
  assert.equal(bySource.size, lines.length, "no duplicate redirect sources");
  for (const [source, target, code, ...extras] of rules) {
    assert.deepEqual(extras, [], `unexpected redirect fields: ${source}`);
    assert.equal(code, "308");
    assert.match(source, /^\/(en|tr)(?:\/|$)/);
    assert.ok(!source.endsWith("/"), `never redirect canonical URL: ${source}`);
    assert.ok(!/[:*?]/.test(source), `no wildcard/dynamic rules: ${source}`);
    assert.equal(target, source + "/", `redirect to matching canonical: ${source}`);
    assert.ok(!bySource.has(target), `prevent a redirect chain: ${source}`);
  }
});

test("English and Turkish article, issue and author canonical routes are covered", () => {
  for (const src of [
    "/en/articles/anatolian-spells",
    "/tr/makaleler/dunyayi-sarsan-turk-devrimi",
    "/en/archive/volume-1-issue-3",
    "/tr/arsiv/cilt-1-sayi-3",
    "/en/authors/jessica-durdu",
    "/tr/yazar/cem-gurdeniz",
    "/en",
    "/tr",
  ]) assert.deepEqual(bySource.get(src), { target: src + "/", code: "308" });
});

test("never add indiscriminate redirects for missing articles, 404s or files", () => {
  for (const path of [
    "/en/articles/this-article-definitely-does-not-exist-99999",
    "/tr/makaleler/does-not-exist-99999",
    "/en/node/160",
    "/assets/archive/covers/cilt-1-sayi-1-en.jpg",
    "/",
  ]) assert.equal(bySource.has(path), false, `must not redirect ${path}`);
});
