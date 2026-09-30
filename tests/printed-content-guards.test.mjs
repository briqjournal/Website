import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// A published page must never show extraction debris or markdown. The BRIQ print is two-column
// and justified, and an early migration pass stored several printed tables as raw markdown
// paragraphs, reference-list fragments inside body paragraphs, and year ranges whose printed
// line-break hyphen was lost. All three reached the live pages; these guards cover every record
// in the archive so the same damage cannot come back through another unit.

const contentDir = path.join("content", "articles");
const slugs = fs.readdirSync(contentDir).filter((slug) =>
  fs.existsSync(path.join(contentDir, slug, "fulltext")));

const localesOf = (slug) => fs
  .readdirSync(path.join(contentDir, slug, "fulltext"))
  .filter((name) => name.endsWith(".json"))
  .map((name) => name.replace(/\.json$/, ""));
const read = (slug, locale) =>
  JSON.parse(fs.readFileSync(path.join(contentDir, slug, "fulltext", `${locale}.json`), "utf8"));

const bodyOf = (doc) => [
  ...(doc.sections || []).map((section) => section.title || ""),
  ...(doc.sections || []).flatMap((section) => section.paragraphs || []),
  ...(doc.figures || []).map((figure) => figure.caption || ""),
].join("\n");

test("archive: no raw markdown reaches the published body", () => {
  for (const slug of slugs) {
    for (const locale of localesOf(slug)) {
      const body = bodyOf(read(slug, locale));
      assert.doesNotMatch(body, /\|\s*-{3,}/, `${slug}/${locale}: markdown table in the body`);
      assert.doesNotMatch(body, /\[\^\d+\]/, `${slug}/${locale}: markdown footnote marker`);
      assert.doesNotMatch(body, /^\s*#{1,6}\s/m, `${slug}/${locale}: markdown heading`);
      assert.doesNotMatch(body, /\[[^\]]+\]\([^)]+\)/, `${slug}/${locale}: markdown link`);
      assert.doesNotMatch(body, /```/, `${slug}/${locale}: markdown code fence`);
    }
  }
});

test("archive: a year range never loses the hyphen the print wraps at the line end", () => {
  for (const slug of slugs) {
    for (const locale of localesOf(slug)) {
      const doc = read(slug, locale);
      const texts = [
        ...(doc.sections || []).flatMap((section) => section.paragraphs || []),
        ...(doc.references || []).map((r) => (typeof r === "string" ? r : r.text)),
        ...(doc.figures || []).map((f) => f.caption || ""),
      ];
      for (const text of texts) {
        for (const match of text.matchAll(/(?:19|20)\d{6,8}\b/gu)) {
          // a run inside a URL path, a DOI or a catalogue number is legitimate; a run that follows
          // a word, a quote or a bracket is a year range the print hyphenated at the line end
          const before = text.slice(Math.max(0, match.index - 40), match.index);
          if (/[-_/.]/u.test(before.slice(-1)) || /(?:https?:\/\/|www\.|doi\.org)/u.test(before)) continue;
          if (/[A-Za-z0-9)\]]$/u.test(before)) continue;
          assert.fail(`${slug}/${locale}: year range read as one number — …${before}${match[0]}`);
        }
      }
    }
  }
});

test("archive: a body paragraph never repeats the reference list", () => {
  for (const slug of slugs) {
    for (const locale of localesOf(slug)) {
      const doc = read(slug, locale);
      const refs = (doc.references || []).map((r) => (typeof r === "string" ? r : r.text)).filter(Boolean);
      for (const section of doc.sections || []) {
        for (const paragraph of section.paragraphs || []) {
          // body prose may cite its sources, and a long citation group repeats much of the
          // bibliography; what never belongs in the body is a paragraph that *opens* with a
          // reference entry, or one made up mostly of them
          // body prose may cite its sources and can repeat much of a bibliography inside one
          // citation group, so the signal is not "matches a reference" but "is made of
          // references": several entries, covering almost the whole paragraph
          const spans = [];
          for (const ref of refs) {
            const head = ref.slice(0, 40);
            if (!head) continue;
            let at = paragraph.indexOf(head);
            while (at >= 0) {
              spans.push([at, at + ref.length]);
              at = paragraph.indexOf(head, at + head.length);
            }
          }
          spans.sort((a, b) => a[0] - b[0]);
          let coveredChars = 0;
          let end = -1;
          for (const [from, to] of spans) {
            if (from > end) coveredChars += to - from;
            else if (to > end) coveredChars += to - end;
            end = Math.max(end, to);
          }
          const entries = new Set(spans.map(([from]) => paragraph.slice(from, from + 30))).size;
          const covered = coveredChars / paragraph.length;
          assert.ok(!(entries >= 3 && covered >= 0.85),
            `${slug}/${locale} ${section.id}: reference list repeated in the body (${entries} entries, ${Math.round(covered * 100)}% of the paragraph)`);
        }
      }
    }
  }
});

test("archive: every table is semantic data with a caption, headers and a placement", () => {
  let tables = 0;
  for (const slug of slugs) {
    for (const locale of localesOf(slug)) {
      const doc = read(slug, locale);
      const sectionIds = new Set((doc.sections || []).map((s) => s.id));
      for (const table of doc.tables || []) {
        tables += 1;
        const where = `${slug}/${locale}/${table.id}`;
        assert.ok(table.caption && table.caption.trim().length > 5, `${where}: caption`);
        // a table published as an image carries its content in the asset, not in cells
        for (const src of [table.imageSrc, ...(table.imageSrcs || [])].filter(Boolean)) {
          assert.ok(fs.existsSync(path.join("public", src)), `${where}: missing table image ${src}`);
        }
        if (table.imageSrc || (table.imageSrcs || []).length) {
          assert.equal(sectionIds.has(table.placement?.sectionId), true, `${where}: placement sectionId`);
          continue;
        }
        assert.ok(Array.isArray(table.headers) && table.headers.length >= 1, `${where}: headers`);
        assert.ok(Array.isArray(table.rows) && table.rows.length >= 2, `${where}: rows`);
        assert.ok(table.rows.every((row) => Array.isArray(row) && row.length === table.headers.length),
          `${where}: every row has one cell per header`);
        assert.ok(sectionIds.has(table.placement?.sectionId), `${where}: placement sectionId`);
        assert.ok(Number.isInteger(table.placement?.afterParagraph), `${where}: placement afterParagraph`);
        assert.doesNotMatch(JSON.stringify(table), /\|\s*-{3,}/u, `${where}: markdown inside the table`);
      }
    }
  }
  assert.ok(tables > 0, "the archive has semantic tables to check");
});

test("archive: every reference carries a unique, sequential id and readable text", () => {
  // a printed entry that never reaches `references[]` is invisible to a print-coverage ratio,
  // and a renumbered list silently breaks anything that addressed an id, so both are invariants
  let entries = 0;
  for (const slug of slugs) {
    for (const locale of localesOf(slug)) {
      const refs = read(slug, locale).references || [];
      const ids = refs.map((ref) => ref.id);
      assert.equal(new Set(ids).size, ids.length,
        `${slug}/${locale}: duplicate reference id`);
      ids.forEach((id, i) => assert.equal(id, `ref-${i + 1}`,
        `${slug}/${locale}: reference ${i + 1} has id ${id}, expected ref-${i + 1}`));
      for (const ref of refs) {
        const text = (ref.text || "").trim();
        assert.ok(text.length > 0, `${slug}/${locale}/${ref.id}: empty reference`);
        // a printed reference, or the bare group heading the print uses to introduce a block of
        // newspaper sources ("Newspapers", "Gazeteler") — never a fragment of a split entry
        const isGroupHeading = !/[.,]/.test(text) && text.split(/\s+/).length <= 3;
        assert.ok(text.length > 10 || isGroupHeading,
          `${slug}/${locale}/${ref.id}: reference looks like a fragment — "${text}"`);
        entries += 1;
      }
    }
  }
  assert.ok(entries > 0, "the archive has references to check");
});
