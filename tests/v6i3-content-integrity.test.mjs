import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const issue = JSON.parse(await readFile(join(root, "content/issues/v06-i03.json"), "utf8"));
const slugs = issue.articles;
const article = async (slug, file) => JSON.parse(await readFile(join(root, "content/articles", slug, file), "utf8"));

const substantive = slugs.slice(0, 6);
const visual = ["china-reconstructs", "hendra-gunawan", "endonezya-posta-pulu"];

async function exists(path) { try { await access(path); return true; } catch { return false; } }

test("V6I3 uses canonical locale-split full text only", async () => {
  for (const slug of slugs) {
    const dir = join(root, "content/articles", slug, "fulltext");
    assert.equal(await exists(join(dir, "en.json")), true, `${slug} missing en.json`);
    assert.equal(await exists(join(dir, "tr.json")), true, `${slug} missing tr.json`);
    assert.equal(await exists(join(dir, "en-archive.json")), false, `${slug} retains en-archive.json`);
    assert.equal(await exists(join(dir, "current.json")), false, `${slug} retains current.json`);
  }
});

test("V6I3 substantive articles have bilingual structured bodies", async () => {
  for (const slug of substantive) {
    for (const locale of ["en", "tr"]) {
      const full = await article(slug, `fulltext/${locale}.json`);
      assert.ok(full.sections.length > 0, `${slug} ${locale} missing sections`);
      assert.ok(full.sections.every((section) => section.id.startsWith(`${locale}-section-`)));
      const prose = full.sections.flatMap((section) => section.paragraphs).join(" ");
      assert.ok(prose.length > 500, `${slug} ${locale} body unexpectedly short`);
      assert.doesNotMatch(prose, /B\s+R\s+I\s+[Qq].{0,40}(?:Volume|Cilt)\s+6/i);
    }
  }
});

test("V6I3 printed-PDF metadata corrections are preserved", async () => {
  const iratni = await article(slugs[0], "metadata.json");
  assert.equal(iratni.dates.received, "2024-07-10");
  assert.equal(iratni.dates.accepted, "2024-10-01");
  assert.deepEqual(iratni.keywords.en, ["Algeria", "liberation movements", "New International Economic Order", "nonalignment", "revolutionary diplomacy"]);
  assert.equal(iratni.keywords.tr.length, 5);
  assert.equal(iratni.authors[0].orcid, "https://orcid.org/0009-0007-4747-8836");
  assert.equal(iratni.authors[0].affiliations[0].name, "University of Algiers 3");

  const zhangDu = await article(slugs[2], "metadata.json");
  assert.equal(zhangDu.title.en, "Revisiting the Bandung Legacy in Indonesian Foreign Policy: A Historical Review and Its Contemporary Implications");
  assert.equal(zhangDu.authors[0].orcid, "https://orcid.org/0009-0000-8505-0741");
  assert.equal(zhangDu.authors[1].orcid, "https://orcid.org/0009-0005-8912-1670");
  assert.deepEqual(zhangDu.funding.funders[0].awardNumbers, ["21CGJ037"]);
  assert.match(zhangDu.funding.statement.en, /National Social Science Foundation Youth Program/);
  assert.match(zhangDu.funding.statement.tr, /Ulusal Sosyal Bilimler Vakfı Gençlik Programı/);

  const gas = await article(slugs[5], "metadata.json");
  assert.equal(gas.dates.received, "2024-12-03");
  assert.equal(gas.dates.accepted, "2025-04-22");
  assert.ok(gas.keywords.tr.length >= 4, "gas-hydrates Turkish keywords missing");
});

test("V6I3 references and visual objects were not dropped", async () => {
  const minimumRefs = new Map([[slugs[0], 20], [slugs[2], 35], [slugs[3], 20], [slugs[4], 20], [slugs[5], 35]]);
  for (const [slug, minimum] of minimumRefs) {
    for (const locale of ["en", "tr"]) {
      const full = await article(slug, `fulltext/${locale}.json`);
      assert.ok(full.references.length >= minimum, `${slug} ${locale} has only ${full.references.length} references`);
    }
  }
  const gas = await article(slugs[5], "fulltext/tr.json");
  assert.ok(gas.figures.length >= 8, "gas-hydrates figures/tables were dropped");
  for (const slug of visual) {
    for (const locale of ["en", "tr"]) {
      const full = await article(slug, `fulltext/${locale}.json`);
      assert.equal(full.figures.length, 1, `${slug} ${locale} should expose its published artwork`);
    }
  }
});

test("V6I3 catalog points to localized full text", async () => {
  const catalog = JSON.parse(await readFile(join(root, "content/catalog.json"), "utf8"));
  for (const slug of slugs) {
    assert.ok(catalog.fulltext.localized.includes(slug), `${slug} absent from localized catalog`);
    assert.ok(!catalog.fulltext.current.includes(slug), `${slug} still in current catalog`);
    assert.ok(!catalog.fulltext.en_archive.includes(slug), `${slug} still in archive catalog`);
  }
});
