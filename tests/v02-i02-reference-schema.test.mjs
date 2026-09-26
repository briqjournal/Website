import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const slugs = [
  "kusak-ve-yol-girisiminde-ortak-ve-surdurulebilir-bir-gelecek-icin-bilime-dayali-cozumler",
  "ipek-yolunda-bilimsel-isbirligi",
];

test("v02-i02 canonical references use object records in both locales", async () => {
  for (const slug of slugs) {
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
  }
});
