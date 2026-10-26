import assert from "node:assert/strict";
import test from "node:test";

const BASE = "https://briqjournal.com";
const REDIRECTS = [
  [
    "/tr/makale-cagrilari/belt-road-scientific-technological-cooperation",
    "/tr/makale-cagrilari/kusak-yol-bilimsel-teknolojik-isbirligi/"
  ],
  [
    "/user/prof-cheng-enfu",
    "/tr/yazar/cheng-enfu/"
  ]
];

async function requestLegacy(path) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("gsc-verified", String(Date.now()));
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(BASE + path),
    { ASSETS: { fetch: async () => new Response("Not Found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("two source-backed GSC 404 aliases reach the correct existing language routes", async () => {
  assert.equal(REDIRECTS.length, 2);
  for (const [source, target] of REDIRECTS) {
    const response = await requestLegacy(source);
    assert.equal(response.status, 301, source);
    assert.equal(new URL(response.headers.get("location")).href, BASE + target, source);
  }
});

test("trailing slash and parameters retain exact verified identity", async () => {
  for (const [source, target] of REDIRECTS) {
    const response = await requestLegacy(source + "/?ref=google");
    assert.equal(response.status, 301, source);
    const location = new URL(response.headers.get("location"));
    assert.equal(location.pathname, target, source);
    assert.equal(location.search, "?ref=google", source);
  }
});

test("unverified old authors and truncated URLs are not mapped to either verified target", async () => {
  for (const path of ["/user/ferhan-bayir", "/user/prof-dr-yang-guang", "/en/science-has-", "/en/user/242"]) {
    const response = await requestLegacy(path);
    if (response.status === 301) {
      const location = new URL(response.headers.get("location"));
      assert.ok(REDIRECTS.every(([, target]) => location.pathname !== target), path);
    }
  }
});
