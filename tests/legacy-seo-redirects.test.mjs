import assert from "node:assert/strict";
import test from "node:test";

async function requestLegacy(path) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("legacy-test", `${process.pid}-${Date.now()}-${Math.random()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`https://briqjournal.com${path}`),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

async function assertRedirect(source, destination, expectedQuery = "") {
  const response = await requestLegacy(source);
  assert.equal(response.status, 301, `status for ${source}`);
  const location = new URL(response.headers.get("location"));
  assert.equal(location.origin, "https://briqjournal.com", `host for ${source}`);
  // PDF and file targets must remain unchanged; HTML redirects land on the
  // actual published trailing-slash canonical URL in a single Worker hop.
  const canonicalDestination = /^\/(?:en|tr)(?:\/|$)/.test(destination)
    && !destination.endsWith("/")
    && !/\.[a-z0-9]{1,8}$/i.test(destination)
    ? destination + "/"
    : destination;
  assert.equal(location.pathname, canonicalDestination, `target for ${source}`);
  assert.equal(location.search, expectedQuery, `query for ${source}`);
}

test("legacy Drupal lists redirect to one canonical article directory without obsolete pagination", async () => {
  for (const [source, destination] of [
    ["/makale?page=28", "/tr/makaleler"],
    ["/en/makale?page=19", "/en/articles"],
    ["/tr/makale?page=1", "/tr/makaleler"],
    ["/en/roportaj?page=1", "/en/articles"],
    ["/tarihten?page=1", "/tr/makaleler"],
    ["/kitap-inceleme?page=2", "/tr/makaleler"],
    ["/index.php/sayilar?page=1", "/tr/arsiv"],
  ]) await assertRedirect(source, destination);
});

test("legacy front-controller routes preserve article, author, issue and language identity", async () => {
  for (const [source, destination] of [
    ["/index.php/en/briq-vol3-issue3", "/en/archive/volume-3-issue-3"],
    ["/index.php/e-briq/briq-7cilt-3sayi-e-dergi", "/tr/arsiv/cilt-7-sayi-3"],
    ["/index.php/user/cem-gurdeniz", "/tr/yazar/cem-gurdeniz"],
    ["/briq-1cilt-3-sayi", "/tr/arsiv/cilt-1-sayi-3"],
    ["/en/author/gongjianhua/", "/en/authors/gong-jianhua"],
    ["/en/user/doc-dr-efe-can-gurcan", "/en/authors/efe-can-gurcan"],
    ["/user/prof-caner-karavit", "/tr/yazar/caner-karavit"],
    ["/makaleler/dijital-ipek-yolu-cercevesinde-cin-arap-isbirligi-urdun-ornegi", "/tr/makaleler/dijital-ipek-yolu-cercevesinde-cin-arap-isbirligi-urdun-ornegi"],
    ["/makale-cagrilari/transatlantik-iliskilerin-yeniden-yapilanmasi", "/tr/makale-cagrilari/transatlantik-iliskilerin-yeniden-yapilanmasi"],
  ]) await assertRedirect(source, destination);
});

test("stale editorial redirects target existing content sections, not removed aliases", async () => {
  await assertRedirect("/yayin-etigi", "/tr/yazarlar/yayin-etigi");
  await assertRedirect("/telif-hakki-sartlari-ve-lisans", "/tr/yazarlar/telif-hakki-sartlari-ve-lisans");
  await assertRedirect("/en/principles-publication?source=old", "/en/journal/publication-principles", "?source=old");
  await assertRedirect("/en/submission-guidelines", "/en/for-authors/guidelines");
  await assertRedirect("/en/copyright-lisence-terms", "/en/for-authors/copyright-and-licence");
});

test("former issue-themed posts are sent to corresponding CFPs, not research articles", async () => {
  for (const [source, destination] of [
    ["/en/latin-americas-role-progressive-change-and-resistance-us-hegemonism", "/en/calls-for-papers/latin-amerikada-ilerici-donusumler"],
    ["/latin-amerikada-ilerici-donusumler-ve-amerikan-hegemonyaciligina-direnis", "/tr/makale-cagrilari/latin-amerikada-ilerici-donusumler"],
    ["/en/artificial-intelligence-productive-forces-and-the-common-prosperity-humanity", "/en/calls-for-papers/artificial-intelligence-productive-forces"],
    ["/gelisen-dunyada-kulturel-mirasin-yagmasina-karsi-onlemler-ve-isbirligi", "/tr/makale-cagrilari/kulturel-miras-yagmasina-karsi-stratejiler"],
    ["/en/belt-and-road-initiative-and-the-islamic-world-economic-geopolitical-and-cultural-interactions", "/en/calls-for-papers/kusak-ve-yol-ve-islam-dunyasi"],
    ["/savaslar-ve-stratejik-parcalanma-caginda-transatlantik-iliskilerin-yeniden-yapilanmasi", "/tr/makale-cagrilari/transatlantik-iliskilerin-yeniden-yapilanmasi"],
    ["/70-yil-donumunde-bandung-konferansinin-gecmisten-gunumuze-suregelen-mirasi", "/tr/makale-cagrilari/bandung-konferansinin-mirasi"],
  ]) await assertRedirect(source, destination);
});

test("volume 7 archived issue PDF links resolve to the actually published R2 paths", async () => {
  for (const [source, destination] of [
    ["/assets/archive/pdfs/issues/cilt-7-sayi-3-tr.pdf", "/assets/issues/briq-cilt-7-sayi-3-yaz-2026-tr.pdf"],
    ["/assets/archive/pdfs/issues/cilt-7-sayi-3-en.pdf", "/assets/issues/briq-cilt-7-sayi-3-yaz-2026.pdf"],
    ["/assets/archive/pdfs/issues/cilt-7-sayi-4-tr.pdf", "/assets/issues/briq-cilt-7-sayi-4-sonbahar-2026.pdf"],
    ["/assets/archive/pdfs/issues/cilt-7-sayi-4-en.pdf", "/assets/issues/BRIQ-Volume7-Issue4-EN-original.pdf"],
    ["/assets/archive/pdfs/cilt-3-sayi-1-turk-cin-iliskileri-tr.pdf", "/assets/archive/pdfs/issues/cilt-3-sayi-1-tr.pdf"],
  ]) await assertRedirect(source, destination);
});

test("legacy issue upload redirects never duplicate /assets/archive/pdfs in front of /assets/issues", async () => {
  for (const [source, destination] of [
    ["/sites/default/files/dergi-sayilari/2026-05/BRIQ%20Cilt7%20Say%C4%B13%20YAZ%202026_3.pdf", "/assets/issues/briq-cilt-7-sayi-3-yaz-2026-tr.pdf"],
    ["/sites/default/files/dergi-sayilari/2026-05/BRIQ%20Volume7%20Issue3%20SUMMER%202026_2.pdf", "/assets/issues/briq-cilt-7-sayi-3-yaz-2026.pdf"],
    ["/sites/default/files/dergi-sayilari/2026-08/BRIQ%20Cilt7%20Say%C4%B14%20SONBAHAR%202026.pdf", "/assets/issues/briq-cilt-7-sayi-4-sonbahar-2026.pdf"],
  ]) await assertRedirect(source, destination);
});

test("nonexistent paths are not redirected indiscriminately to the homepage", async () => {
  const response = await requestLegacy("/en/author/nonexistent-person-99999");
  assert.notEqual(response.status, 301);
});

test("four additional historically indexed 404 aliases reach verified canonical destinations", async () => {
  for (const [source, destination] of [
    ["/en/neo-mahanian-", "/en/articles/a-neo-mahanian-reading-of-turkey-and-chinas-changing-maritime-geopolitics"],
    ["/en/russian-strategist-", "/en/articles/russian-strategist-dr-alexander-dugin-the-belt-and-road-initiative-a-eurasian-road"],
    ["/turk-milli-ordusunun-zaferinin-uluslararasi-kiymeti", "/tr/makaleler/turk-milli-ordusunun-zaferinin-uluslarasi-kiymeti"],
    ["/sites/default/files/dergi-sayilari/2020-11/BRIQ_ENG%20ISSUE%204.pdf", "/assets/archive/pdfs/issues/cilt-1-sayi-4-en.pdf"],
  ]) await assertRedirect(source, destination);
});

test("old honorific-prefixed author URLs redirect only to verified localized author identities", async () => {
  for (const [from, to] of [
    ["/user/dr-hande-gunozu", "/tr/yazar/hande-gunozu"],
    ["/en/user/dr-francisco-dominguez", "/en/authors/francisco-dominguez"],
    ["/user/assoc-prof-dr-yang-chen", "/tr/yazar/yang-chen"],
    ["/en/user/assoc-prof-dr-yang-chen", "/en/authors/yang-chen"],
    ["/user/prof-dr-semih-koray", "/tr/yazar/semih-koray"],
    ["/en/user/prof-dr-semih-koray", "/en/authors/semih-koray"],
    ["/en/user/assoc-prof-dr-aleksandr-sotnicenko", "/en/authors/aleksandr-sotnicenko"],
  ]) await assertRedirect(from, to);
});

test("previously broken legacy article aliases now resolve straight to verified canonical articles", async () => {
  for (const [source, destination] of [
    ["/dilek-uyar-fotograf-sanatcisi", "/tr/makaleler/cobanin-sagim-sonrasi-suruyu-tekrar-otlaklara-goturme-cabasi-ve-tozlu-yolculuk/"],
    ["/download/after-milking-shepherds-effort-to-bring-the-herd-back-to-pasture-and-their-dusty-journey", "/en/articles/after-milking-shepherds-effort-to-bring-the-herd-back-to-pasture-and-their-dusty-journey-bitlis/"],
    ["/en/articles/history-the-first-book-about-ataturk-ever-published-iran", "/en/articles/the-first-book-about-ataturk-ever-published-in-iran/"],
    ["/en/book-review-post-covid-19-global-system-old-problems-new-trends", "/en/articles/post-covid-19-global-system-old-problems-new-trends/"],
    ["/en/covid-19-sonrasi-kuresel-sistem-eski-sorunlar-yeni-trendler", "/en/articles/post-covid-19-global-system-old-problems-new-trends/"],
    ["/en/dilek-uyar-photography-artist", "/en/articles/after-milking-shepherds-effort-to-bring-the-herd-back-to-pasture-and-their-dusty-journey-bitlis/"],
    ["/en/fotograf-ni-min-fujian-huian-kadini-ag-onariyor", "/en/articles/fujian-huian-maidens-weaving-net/"],
    ["/en/history-the-first-book-about-ataturk-ever-published-in-iran", "/en/articles/the-first-book-about-ataturk-ever-published-in-iran/"],
    ["/en/history-the-first-book-about-ataturk-ever-published-iran", "/en/articles/the-first-book-about-ataturk-ever-published-in-iran/"],
    ["/en/iranda-ataturk-ve-milli-mucadele-konusunda-ilk-kitap", "/en/articles/the-first-book-about-ataturk-ever-published-in-iran/"],
    ["/en/makale/book-review-post-covid-19-global-system-old-problems-new-trends", "/en/articles/post-covid-19-global-system-old-problems-new-trends/"],
    ["/en/makale/covid-19-sonrasi-kuresel-sistem-eski-sorunlar-yeni-trendler", "/en/articles/post-covid-19-global-system-old-problems-new-trends/"],
    ["/en/makale/fotograf-ni-min-fujian-huian-kadini-ag-onariyor", "/en/articles/fujian-huian-maidens-weaving-net/"],
    ["/en/makale/history-the-first-book-about-ataturk-ever-published-in-iran", "/en/articles/the-first-book-about-ataturk-ever-published-in-iran/"],
    ["/en/makale/iranda-ataturk-ve-milli-mucadele-konusunda-ilk-kitap", "/en/articles/the-first-book-about-ataturk-ever-published-in-iran/"],
    ["/en/makale/nato-and-the-wider-international-territory", "/en/articles/nato-from-control-of-the-western-territorial-line-to-control-of-the-wider-international-territory/"],
    ["/en/makale/photograph-fujian-huian-maidens-weaving-net", "/en/articles/fujian-huian-maidens-weaving-net/"],
    ["/en/photograph-fujian-huian-maidens-weaving-net", "/en/articles/fujian-huian-maidens-weaving-net/"],
    ["/en/the-first-book-about-ataturk-ever-published-in-iran", "/en/articles/the-first-book-about-ataturk-ever-published-in-iran/"],
  ]) await assertRedirect(source, destination);
});

test("HTML legacy redirects have no extra slash hop and PDFs preserve their filenames", async () => {
  for (const [source, destination, query] of [
    ["/kategori/karaman-denizi", "/tr/makaleler/", ""],
    ["/en/user/can-ulusoy", "/en/authors/can-ulusoy/", ""],
    ["/user/dr-hande-gunozu?ref=old", "/tr/yazar/hande-gunozu/", "?ref=old"],
    ["/en/briq-vol5-issue2", "/en/archive/volume-5-issue-2/", ""],
    ["/en/homepage", "/en/", ""],
    ["/assets/archive/pdfs/issues/cilt-7-sayi-3-tr.pdf", "/assets/issues/briq-cilt-7-sayi-3-yaz-2026-tr.pdf", ""],
  ]) await assertRedirect(source, destination, query);
});
