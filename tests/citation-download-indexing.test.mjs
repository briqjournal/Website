import assert from "node:assert/strict";
import test from "node:test";

const ROOT = "https://briqjournal.com";
const CITATION = "kusak-ve-yol-girisimi-ulkelerinde-ekonomik-ve-finansal-isbirligi";

async function requestWorker(pathname) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(ROOT + pathname, { method: "GET" }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("citation downloads remain valid attachments but are excluded from search indexing", async () => {
  for (const [format, contentType] of [
    ["bib", "application/x-bibtex"],
    ["ris", "application/x-research-info-systems"],
    ["enw", "text/plain"],
  ]) {
    const response = await requestWorker(`/citations/${CITATION}.${format}?locale=en`);
    assert.equal(response.status, 200, `${format} download status`);
    assert.equal(response.headers.get("x-robots-tag"), "noindex, follow", format);
    assert.match(response.headers.get("content-disposition") || "", new RegExp(`attachment; filename="[^"]+\\.${format}"`), format);
    assert.ok(response.headers.get("content-type")?.startsWith(contentType), format);
    assert.ok((await response.text()).length > 60, `${format} preserved body`);
  }
});

test("noindex for citation exports does not bleed into regular scholarly HTML pages", async () => {
  const response = await requestWorker("/en/articles/the-first-book-about-ataturk-ever-published-in-iran/");
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-robots-tag"), null);
  assert.match(await response.text(), /rel="canonical"/);
});

test("unsupported citation files stay 404 and are not converted into indexable fake articles", async () => {
  const response = await requestWorker(`/citations/${CITATION}.txt`);
  assert.equal(response.status, 404);
  assert.equal(response.headers.get("x-robots-tag"), null);
});
