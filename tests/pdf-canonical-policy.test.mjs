import assert from "node:assert/strict";
import test from "node:test";

const ROOT = "https://briqjournal.com";
const PDF = "/assets/archive/pdfs/articles/fotograf-0-en.pdf";
const ISSUE_PDF = "/assets/issues/briq-cilt-7-sayi-3-yaz-2026.pdf";
const BYTES = new TextEncoder().encode("%PDF-1.7\nBRIQ test\n");

async function fetchWorker(pathname, { method = "GET", headers = {}, bucket } = {}) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(ROOT + pathname, { method, headers }),
    {
      BRIQ_PDF: bucket,
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

function mockBucket() {
  function metadata() {
    return {
      size: BYTES.length,
      httpEtag: '"br"',
      writeHttpMetadata(headers) {
        headers.set("content-type", "application/pdf");
      },
    };
  }
  return {
    async head(key) {
      if (!key.endsWith(".pdf") || key.includes("missing")) return null;
      // Mirrors R2 responses that expose range metadata for a full object.
      return { ...metadata(), range: { offset: 0, length: BYTES.length } };
    },
    async get(key, options = {}) {
      if (!key.endsWith(".pdf") || key.includes("missing")) return null;
      const requested = options.range?.get("range");
      if (requested === "bytes=0-3") {
        return { ...metadata(), range: { offset: 0, length: 4 },
          body: new Blob([BYTES.slice(0, 4)]).stream() };
      }
      if (requested === "bytes=-4") {
        return { ...metadata(), range: { offset: BYTES.length - 4, length: 4 },
          body: new Blob([BYTES.slice(-4)]).stream() };
      }
      // A full-range object is not necessarily a client partial-content request.
      return { ...metadata(), range: { offset: 0, length: BYTES.length },
        body: new Blob([BYTES]).stream() };
    },
  };
}

test("R2 PDF HEAD, GET and Range/206 all declare a stable self canonical", async () => {
  const bucket = mockBucket();
  const canonical = "<" + ROOT + PDF + '>; rel="canonical"';
  const [head, get, range] = await Promise.all([
    fetchWorker(PDF, { method: "HEAD", bucket }),
    fetchWorker(PDF + "?utm_source=search&dl=1", { bucket }),
    fetchWorker(PDF, { headers: { Range: "bytes=0-3" }, bucket }),
  ]);
  assert.equal(head.status, 200);
  assert.equal(get.status, 200);
  assert.equal(range.status, 206);
  for (const response of [head, get, range]) {
    assert.equal(response.headers.get("link"), canonical);
    assert.equal(response.headers.get("content-type"), "application/pdf");
    assert.equal(response.headers.get("accept-ranges"), "bytes");
    assert.equal(response.headers.get("content-disposition"), "inline");
  }
  assert.equal(head.headers.get("content-length"), String(BYTES.length));
  assert.equal(head.headers.get("content-range"), null);
  assert.equal(get.headers.get("content-length"), String(BYTES.length));
  assert.equal(get.headers.get("content-range"), null);
  assert.equal(range.headers.get("content-range"), "bytes 0-3/" + BYTES.length);
  assert.equal(await range.text(), "%PDF");
  assert.deepEqual(new Uint8Array(await get.arrayBuffer()), BYTES);
});

test("an explicitly requested full-file or suffix Range remains HTTP 206", async () => {
  const bucket = mockBucket();
  const [fullRange, suffix] = await Promise.all([
    fetchWorker(PDF, { bucket, headers: { Range: "bytes=0-" } }),
    fetchWorker(PDF, { bucket, headers: { Range: "bytes=-4" } }),
  ]);
  assert.equal(fullRange.status, 206);
  assert.equal(fullRange.headers.get("content-length"), String(BYTES.length));
  assert.equal(fullRange.headers.get("content-range"), "bytes 0-" + (BYTES.length - 1) + "/" + BYTES.length);
  assert.deepEqual(new Uint8Array(await fullRange.arrayBuffer()), BYTES);
  assert.equal(suffix.status, 206);
  assert.equal(suffix.headers.get("content-length"), "4");
  assert.equal(suffix.headers.get("content-range"), "bytes " + (BYTES.length - 4) + "-" + (BYTES.length - 1) + "/" + BYTES.length);
  assert.deepEqual(new Uint8Array(await suffix.arrayBuffer()), BYTES.slice(-4));
});

test("volume PDF path uses the same canonical policy without leaking request Host", async () => {
  const response = await fetchWorker(ISSUE_PDF, {
    bucket: mockBucket(),
    headers: { Host: "attacker.invalid" },
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("link"),
    "<" + ROOT + ISSUE_PDF + '>; rel="canonical"');
});

test("missing R2 PDFs and legacy redirects do not pretend to be canonical PDF responses", async () => {
  const bucket = mockBucket();
  const missing = await fetchWorker("/assets/archive/pdfs/articles/missing.pdf", { bucket });
  assert.equal(missing.status, 404);
  assert.equal(missing.headers.get("link"), null);
  const old = await fetchWorker(
    "/sites/default/files/dergi-sayilari/2020-11/BRIQ_ENG%20ISSUE%204.pdf",
    { bucket },
  );
  assert.equal(old.status, 301);
  assert.equal(new URL(old.headers.get("location")).href,
    ROOT + "/assets/archive/pdfs/issues/cilt-1-sayi-4-en.pdf");
  assert.equal(old.headers.get("link"), null);
});

test("bilingual HTML PDF viewers canonicalize to the article, not the viewer", async () => {
  const cases = [
    {
      viewer: "/tr/makaleler/filistin-1947/pdf/",
      article: "/tr/makaleler/filistin-1947/",
      alternate: "/en/articles/palestine-in-1947/",
    },
    {
      viewer: "/en/articles/palestine-in-1947/pdf/",
      article: "/en/articles/palestine-in-1947/",
      alternate: "/tr/makaleler/filistin-1947/",
    },
  ];
  for (const { viewer, article, alternate } of cases) {
    // Direct Worker tests bypass Cloudflare Static Assets redirect handling.
    // Follow the app router's trailing-slash normalization when present.
    let response = await fetchWorker(viewer, { headers: { Accept: "text/html" } });
    if (response.status === 307 || response.status === 308) {
      const target = response.headers.get("location");
      assert.ok(target, "redirect must declare Location: " + viewer);
      const location = new URL(target, ROOT);
      assert.equal(location.origin, ROOT);
      assert.equal(location.pathname, viewer.replace(/\/$/, ""));
      response = await fetchWorker(location.pathname, { headers: { Accept: "text/html" } });
    }
    assert.equal(response.status, 200, viewer);
    const html = await response.text();
    assert.ok(html.includes('<link rel="canonical" href="' + ROOT + article + '"'),
      "viewer must canonicalize to published HTML article: " + viewer);
    assert.ok(!html.includes('<link rel="canonical" href="' + ROOT + viewer + '"'),
      "viewer must not self-canonicalize: " + viewer);
    assert.ok(html.includes('href="' + ROOT + alternate + '"'),
      "metadata should retain language parity with HTML article: " + viewer);
    assert.match(html, /PDF (viewer|görüntüleyici)/i);
  }
});
