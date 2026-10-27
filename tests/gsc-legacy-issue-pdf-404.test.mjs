import assert from "node:assert/strict";
import test from "node:test";

async function inspectLegacy(path) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("gsc-pdf-404-test", `${process.pid}-${Date.now()}-${Math.random()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`https://briqjournal.com${path}`),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("three GSC-listed historic Turkish issue PDFs redirect to published issue PDF assets", async () => {
  const cases = [
    [
      "/sites/default/files/dergi-sayilari/2023-06/BRIQ%202023%20Yaz%20Say%C4%B1s%C4%B1.pdf",
      "/assets/archive/pdfs/issues/cilt-4-sayi-3-tr.pdf",
    ],
    [
      "/sites/default/files/e-dergi-dosyalari/2024-06/BRIQ%202024%20Yaz%20-%20e-BRIQ_compressed.pdf",
      "/assets/archive/pdfs/issues/cilt-5-sayi-3-tr.pdf",
    ],
    [
      "/sites/default/files/dergi-sayilari/2020-09/BRIQ_TURKCE%20-%204.%20SAYI-min.pdf",
      "/assets/archive/pdfs/issues/cilt-1-sayi-4-tr.pdf",
    ],
  ];
  for (const [source, target] of cases) {
    const response = await inspectLegacy(source);
    assert.equal(response.status, 301, source);
    const location = new URL(response.headers.get("location"));
    assert.equal(location.origin, "https://briqjournal.com", source);
    assert.equal(location.pathname, target, source);
    assert.equal(location.search, "", source);
  }
});

test("unverified third-volume filename is not misassigned a language", async () => {
  const response = await inspectLegacy(
    "/sites/default/files/dergi-sayilari/2022-09/briq-journal-3-4.pdf",
  );
  assert.notEqual(response.status, 301);
});
