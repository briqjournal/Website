import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const slug = "koronavirus-suclama-oyunu-kuresel-salgin-uzerinden-bir-hukuk-harbinin-yurutulmesi";

test("Kampmark canonical references use object records in both locales", async () => {
  for (const locale of ["en", "tr"]) {
    const raw = await readFile(new URL(`../content/articles/${slug}/fulltext/${locale}.json`, import.meta.url), "utf8");
    const fulltext = JSON.parse(raw);

    assert.ok(fulltext.references.length > 0);
    for (const [index, reference] of fulltext.references.entries()) {
      assert.equal(typeof reference, "object");
      assert.equal(reference.id, `ref-${index + 1}`);
      assert.equal(typeof reference.text, "string");
      assert.ok(reference.text.trim().length > 0);
    }
  }
});
