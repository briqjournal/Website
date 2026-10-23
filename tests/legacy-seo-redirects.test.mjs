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
    ["/tr/user/prof-dr-cuneyt-akalin", "/tr/yazar/cuneyt-akalin/"],
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

test("four source-verified Search Console 404 aliases reach their exact published destinations", async () => {
  for (const [source, destination] of [
    ["/en/author/degangsun/", "/en/authors/sun-degang/"],
    ["/roportaj-yesil-ve-dijital-donusum-kapsaminda-", "/tr/makaleler/roportaj-yesil-ve-dijital-donusum-kapsaminda-ar-ge-ve-yenilik-ekosistemini-harekete-geciriyoruz/"],
    ["/1uluslararasi-kusak-ve-yol-inisiyatifi-turkiye-sempozyumu", "/tr/makaleler/1-uluslararasi-kusak-ve-yol-inisiyatifi-turkiye-sempozyumu-turkiye-dijital-ipek-yolunun-oncusu/"],
    ["/sites/default/files/dergi-sayilari/2020-11/briq_eng%20issue%204.pdf", "/assets/archive/pdfs/issues/cilt-1-sayi-4-en.pdf"],
  ]) await assertRedirect(source, destination);
  await assertRedirect("/roportaj-yesil-ve-dijital-donusum-kapsaminda-?ref=gsc", "/tr/makaleler/roportaj-yesil-ve-dijital-donusum-kapsaminda-ar-ge-ve-yenilik-ekosistemini-harekete-geciriyoruz/", "?ref=gsc");
});


test("historical calls redirect to their verified original-language archive records", async () => {
  for (const [source, destination] of [
    [
        "/makale-cagrisi-ataturk-devriminin-yuzuncu-yili-ve-avrasyayi-birlestiren-ortak-program",
        "/tr/makale-cagrilari/ataturk-devriminin-yuzuncu-yili/"
    ],
    [
        "/makale-cagrisi-natonun-asya-pasifike-dogru-genisleme-planlarinin-dunyaya-etkisi",
        "/tr/makale-cagrilari/natonun-asya-pasifike-genislemesi/"
    ],
    [
        "/makale-cagrisi-enerjide-hidrojen-cagi",
        "/tr/makale-cagrilari/enerjide-hidrojen-cagi/"
    ],
    [
        "/makale-cagrisi-turkiye-cumhuriyeti-ile-cin-halk-cumhuriyeti-arasinda-diplomatik-iliskilerin",
        "/tr/makale-cagrilari/turkiye-cin-diplomatik-iliskilerinin-50-yili/"
    ],
    [
        "/21-yuzyilda-ekolojik-bir-makale-cagrisi-medeniyet-insa-etmek-gelismekte-olan-dunyadan-perspektifler",
        "/tr/makale-cagrilari/21-yuzyilda-ekolojik-medeniyet/"
    ],
    [
        "/makale-cagrisi-kusak-yol-girisimi-kapsaminda-bilimsel-ve-teknolojik-isbirligi",
        "/tr/makale-cagrilari/kusak-yol-bilimsel-teknolojik-isbirligi/"
    ],
    [
        "/makale-cagrisi-koronavirus-sonrasi-dunyada-sosyoekonomik-sistemlerin-catismasi",
        "/tr/makale-cagrilari/koronavirus-sonrasi-sosyoekonomik-sistemler/"
    ],
    [
        "/makale-cagrisi-gelismekte-olan-dunyada-uluslararasi-guvenlik-sorunlar-ve-cozumleri",
        "/tr/makale-cagrilari/gelismekte-olan-dunyada-uluslararasi-guvenlik/"
    ],
    [
        "/en/special-issue-call-papers-centenary-the-1923-turkish-revolution",
        "/en/calls-for-papers/centenary-1923-turkish-revolution/"
    ],
    [
        "/en/special-issue-call-papers-the-impact-natos-expansion-plans-towards-asia-pacific",
        "/en/calls-for-papers/nato-expansion-asia-pacific/"
    ],
    [
        "/en/special-issue-call-papers-carbon-hydrogen-era",
        "/en/calls-for-papers/carbon-hydrogen-era/"
    ],
    [
        "/en/special-issue-call-papers-the-50th-anniversary-the-establishment-diplomatic-relations-between-the",
        "/en/calls-for-papers/turkey-china-diplomatic-relations-50th-anniversary/"
    ],
    [
        "/en/special-issue-call-papers-building-ecological-civilization-the-21st-century-perspectives-the",
        "/en/calls-for-papers/ecological-civilization-21st-century/"
    ],
    [
        "/en/special-issue-call-papers-scientific-and-technological-cooperation-the-framework-the-belt-and-road",
        "/en/calls-for-papers/belt-road-scientific-technological-cooperation/"
    ],
    [
        "/en/call-papers-the-clash-socioeconomic-systems-post-coronavirus-world",
        "/en/calls-for-papers/post-coronavirus-socioeconomic-systems/"
    ],
    [
        "/en/call-papers-international-security-the-developing-world-problems-and-solutions",
        "/en/calls-for-papers/international-security-developing-world/"
    ],
    [
        "/en/special-issue-call-for-papers-scientific-and-technological-cooperation-in-the-framework-of-the-belt-and-road-initiative",
        "/en/calls-for-papers/belt-road-scientific-technological-cooperation/"
    ],
    [
        "/en/special-issue-call-for-papers-building-an-ecological-civilization-in-the-21st-century-perspectives-from-the-developing-world",
        "/en/calls-for-papers/ecological-civilization-21st-century/"
    ]
]) {
    await assertRedirect(source, destination);
  }
  await assertRedirect("/makale-cagrisi-enerjide-hidrojen-cagi?source=historic", "/tr/makale-cagrilari/enerjide-hidrojen-cagi/", "?source=historic");
});

test("recover three source-verified GSC 404s without extra redirects", async () => {
  for (const [source, destination] of [
    ["/index.php/user/7", "/tr/yazar/mehmet-adnan-akfirat"],
    ["/user/7", "/tr/yazar/mehmet-adnan-akfirat"],
    ["/en/author/briq/", "/en/calls-for-papers"],
    ["/2729-2/", "/tr/makaleler/bmc-yonetim-kurulu-baskani-ethem-sancak-asya-kartalinin-iki-kanadi-turkiye-ve-cin"],
  ]) {
    await assertRedirect(source, destination);
  }
  await assertRedirect(
    "/index.php/user/7?source=historic",
    "/tr/yazar/mehmet-adnan-akfirat",
    "?source=historic",
  );
  await assertRedirect(
    "/2729-2/?archive=2020",
    "/tr/makaleler/bmc-yonetim-kurulu-baskani-ethem-sancak-asya-kartalinin-iki-kanadi-turkiye-ve-cin",
    "?archive=2020",
  );
});

test("resolve precisely matched 404 legacy CFP and issue PDF URLs without chains", async () => {
  // GSC's literal old paths, including the Drupal front controller and
  // URL-encoded spaces, must resolve directly to verified publication routes.
  for (const [source, destination] of [
    ["/kitap-incelemesi", "/tr/makale-cagrilari/kitap-incelemesi/"],
    ["/index.php/yapay-zeka-uretici-gucler-ve-insanligin-ortak-refahi",
      "/tr/makale-cagrilari/yapay-zeka-uretici-gucler-ortak-refah/"],
    ["/yapay-zeka-uretici-gucler-ve-insanligin-ortak-refahi",
      "/tr/makale-cagrilari/yapay-zeka-uretici-gucler-ortak-refah/"],
    ["/sites/default/files/dergi-sayilari/2020-09/BRIQ_TURKCE%20-%203.%20SAYI.pdf",
      "/assets/archive/pdfs/issues/cilt-1-sayi-3-tr.pdf"],
  ]) {
    await assertRedirect(source, destination);
  }
});


test("recover GSC's Drupal user 68 and uniquely identified truncated issue PDF paths", async () => {
  // Google-indexed, historical /en/user/emrah-alan HTML proves that
  // /user/68 was its Turkish language link (Drupal system path user/68).
  await assertRedirect("/user/68", "/tr/yazar/emrah-alan/");
  await assertRedirect("/index.php/user/68", "/tr/yazar/emrah-alan/");

  // One old April 2021 PDF in the published 619-file migration manifest
  // starts with this exact prefix. Test both variants of the cut-off GSC URL.
  for (const path of [
    "/sites/default/files/yazi-ici-dosyalar/2021-04/Turkey%20in%20the",
    "/sites/default/files/yazi-ici-dosyalar/2021-04/Turkey%20in%20the%20",
  ]) await assertRedirect(
    path,
    "/assets/archive/pdfs/articles/deniz-ve-asya-yuzyilinda-turkiye-en.pdf",
  );
});

