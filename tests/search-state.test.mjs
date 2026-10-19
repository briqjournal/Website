import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../app/search-state.ts", import.meta.url), "utf8");
const javascript = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { readSearchState, writeSearchState, searchScopeHref, searchExcerpt } = await import(`data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`);

test("search URLs restore a Turkish query, multiple categories, filters, and pagination", () => {
  const state = {
    query: "Çin & yeşil hidrojen", kind: "article", year: "2022", volume: "3",
    types: ["Araştırma Makalesi", "Derleme Makalesi"], pageSize: 10, page: 2,
  };
  const encoded = writeSearchState("?campaign=archive", state, "article");
  assert.deepEqual(readSearchState(encoded, "article"), state);
  assert.equal(new URLSearchParams(encoded).get("campaign"), "archive");
});

test("invalid shared search URLs fall back safely and defaults keep URLs short", () => {
  const state = readSearchState("?kind=unknown&year=oops&volume=99&size=100000&page=-5&type=&type=Review&type=Review", "all");
  assert.equal(state.kind, "all");
  assert.equal(state.year, "all");
  assert.equal(state.volume, "all");
  assert.equal(state.pageSize, 20);
  assert.equal(state.page, 1);
  assert.deepEqual(state.types, ["Review"]);
  assert.equal(writeSearchState("?q=old&page=5", readSearchState("", "article"), "article"), "");
});

test("switching search scope retains the query and uses the correct locale routes", () => {
  const query = "Türkiye Çin";
  for (const locale of ["tr", "en"]) {
    for (const kind of ["all", "article", "issue", "call"]) {
      const url = new URL(searchScopeHref(locale, kind, query), "https://briqjournal.com");
      assert.equal(url.searchParams.get("q"), query);
      assert.ok(url.pathname.startsWith(`/${locale}/`));
      assert.ok(url.pathname.endsWith("/"));
      assert.equal(url.searchParams.get("kind"), ["issue", "call"].includes(kind) ? kind : null);
    }
  }
});

test("abstract excerpts explain Turkish case-insensitive matches without inventing text", () => {
  const abstract = "Bu çalışma bilimsel işbirliği ile YEŞİL HİDROJEN arasındaki ilişkiyi araştırır.";
  assert.ok(searchExcerpt(abstract, "hidrojen", "tr").includes("HİDROJEN"));
  assert.equal(searchExcerpt(abstract, "NATO", "tr"), "");
  assert.equal(searchExcerpt(abstract, "", "tr"), "");
});
