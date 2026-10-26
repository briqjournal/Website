import assert from "node:assert/strict";
import test from "node:test";

const BASE = "https://briqjournal.com";
const REDIRECTS = [
  [
    "/en/past-present-the-enduring-legacy-the-bandung-conference-its-70th-anniversary",
    "/en/calls-for-papers/bandung-konferansinin-mirasi/"
  ],
  [
    "/makale-cagrisi-21-yuzyilda-ekolojik-bir-medeniyet-insa-etmek-gelismekte-olan-dunyadan-perspektifler",
    "/tr/makale-cagrilari/21-yuzyilda-ekolojik-medeniyet/"
  ],
  [
    "/en/calls-for-papers/ataturk-devriminin-yuzuncu-yili",
    "/en/calls-for-papers/centenary-1923-turkish-revolution/"
  ],
  [
    "/tr/yazar/prof-jinghua-cao",
    "/tr/yazar/jinghua-cao/"
  ],
  [
    "/en/author/yangchen",
    "/en/authors/yang-chen/"
  ],
  [
    "/en/author/efecangurcan",
    "/en/authors/efe-can-gurcan/"
  ],
  [
    "/en/author/ebrusahin",
    "/en/authors/ebru-sahin/"
  ],
  [
    "/en/authors/copyright-terms-and-licensing",
    "/en/for-authors/copyright-and-licence/"
  ],
  [
    "/telif-hakki-sartlari",
    "/tr/yazarlar/telif-hakki-sartlari-ve-lisans/"
  ],
  [
    "/yazim-kurallari",
    "/tr/yazarlar/yazim-kurallari/"
  ],
  [
    "/download/the-middle-eastern-security-dilemma-and-its-impact-on-chinas-belt-and-road-initiative",
    "/assets/archive/pdfs/articles/ortadoguda-guvenlik-ikileminin-cinin-kusak-ve-yol-girisimine-etkisi-en.pdf"
  ]
];

async function requestLegacy(path) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("gsc-404-test", String(Date.now()));
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(BASE + path),
    { ASSETS: { fetch: async () => new Response("Not Found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("all eleven verified 404 aliases use direct permanent redirects", async () => {
  assert.equal(REDIRECTS.length, 11);
  assert.equal(new Set(REDIRECTS.map(([source]) => source)).size, 11);
  for (const [source, canonicalTarget] of REDIRECTS) {
    const response = await requestLegacy(source);
    assert.equal(response.status, 301, source);
    const location = new URL(response.headers.get("location"));
    assert.equal(location.href, BASE + canonicalTarget, source);
    assert.equal(location.search, "", source);
  }
});

test("slash variants and meaningful parameters preserve target identity", async () => {
  for (const [source, destination] of REDIRECTS) {
    const response = await requestLegacy(source + "/?ref=gsc");
    assert.equal(response.status, 301, source);
    const location = new URL(response.headers.get("location"));
    assert.equal(location.pathname, destination, source);
    assert.equal(location.search, "?ref=gsc", source);
  }
});

test("old download query parameters do not change the verified PDF object", async () => {
  const source = "/download/the-middle-eastern-security-dilemma-and-its-impact-on-chinas-belt-and-road-initiative/?wpdmdl=2164&refresh=5fe4f3a2746e11608840098";
  const response = await requestLegacy(source);
  assert.equal(response.status, 301);
  const location = new URL(response.headers.get("location"));
  assert.equal(location.pathname, REDIRECTS.at(-1)[1]);
  assert.equal(location.search, "?wpdmdl=2164&refresh=5fe4f3a2746e11608840098");
});

test("uncertain identities and CMS IDs are never mapped to unrelated scholars", async () => {
  const unknown = ["/en/author/unverified-profile-98765/", "/user/ulusoy-erdogan", "/en/user/onurcan-balci", "/user/beyazit-karatas", "/user/6"];
  for (const pathname of unknown) {
    const response = await requestLegacy(pathname);
    if (response.status === 301) {
      const location = new URL(response.headers.get("location"));
      assert.ok(!REDIRECTS.some(([, destination]) => destination === location.pathname), pathname);
    }
  }
});
