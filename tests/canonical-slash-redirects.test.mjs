import assert from "node:assert/strict";
import test from "node:test";

const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("canonical-slash-audit", `${process.pid}-${Date.now()}`);

async function requestWorker(path, { method = "GET" } = {}) {
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`https://briqjournal.com${path}`, { method }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("app's canonical trailing-slash redirects are permanent, one hop", async () => {
  for (const path of [
    "/en/articles/anatolian-spells",
    "/tr/makaleler/dunyayi-sarsan-turk-devrimi",
    "/en/archive/volume-1-issue-3",
    "/tr/arsiv/cilt-1-sayi-3",
    "/en/authors/jessica-durdu",
    "/tr/yazar/cem-gurdeniz",
    "/en",
  ]) {
    const response = await requestWorker(path);
    assert.equal(response.status, 308, `expected permanent canonical redirect: ${path}`);
    const target = new URL(response.headers.get("location"), "https://briqjournal.com");
    assert.equal(target.href, `https://briqjournal.com${path}/`);
  }
});

test("canonical redirects preserve the query string and support HEAD", async () => {
  for (const method of ["GET", "HEAD"]) {
    const response = await requestWorker("/en/articles/anatolian-spells?utm_source=legacy&lang=en", { method });
    assert.equal(response.status, 308);
    const target = new URL(response.headers.get("location"), "https://briqjournal.com");
    assert.equal(target.href, "https://briqjournal.com/en/articles/anatolian-spells/?utm_source=legacy&lang=en");
  }
});

test("no conversion of legacy, root-locale, file, missing-route or canonical responses", async () => {
  const legacy = await requestWorker("/en/author/briq/");
  assert.equal(legacy.status, 301, "existing source-verified legacy redirect remains 301");

  const gateway = await requestWorker("/");
  assert.equal(gateway.status, 307, "country-sensitive homepage gateway stays temporary");

  for (const path of [
    "/en/articles/anatolian-spells/",
    "/en/node/160",
    "/assets/archive/covers/cilt-1-sayi-1-en.jpg",
  ]) {
    const response = await requestWorker(path);
    assert.notEqual(response.status, 308, `unchanged routing behavior for ${path}`);
  }
});
