import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const issue = JSON.parse(await readFile(new URL("content/issues/v02-i04.json", root), "utf8"));
const catalog = JSON.parse(await readFile(new URL("content/catalog.json", root), "utf8"));

test("v02-i04 publishes all 20 canonical locale routes", async () => {
  assert.equal(issue.articles.length, 10);
  const routes = [];
  for (const slug of issue.articles) {
    assert.ok(catalog.fulltext.localized.includes(slug), `localized: ${slug}`);
    const meta = JSON.parse(await readFile(new URL(`content/articles/${slug}/metadata.json`, root), "utf8"));
    for (const locale of ["en", "tr"]) {
      const fulltext = JSON.parse(await readFile(new URL(`content/articles/${slug}/fulltext/${locale}.json`, root), "utf8"));
      assert.ok(Array.isArray(fulltext.sections) && fulltext.sections.length > 0, `${slug} ${locale} canonical`);
      const route = new URL(meta.urls[locale]).pathname;
      assert.ok(route.startsWith("/"), `${slug} ${locale} route`);
      routes.push(route);
    }
  }
  assert.equal(routes.length, 20);
  assert.equal(new Set(routes).size, 20);
});
