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


test("exact historical GSC author spellings reach existing canonical profiles", async () => {
  for (const [source, destination] of [
    ["/user/mao-zedung", "/tr/yazar/mao-zedong/"],
    ["/user/robet-minor", "/tr/yazar/robert-minor/"],
    ["/user/sule-perincek", "/tr/yazar/h-sule-perincek/"],
    ["/user/igor-korotchenko", "/tr/yazar/igor-korotcenko/"],
    ["/user/drarif-acaloglu", "/tr/yazar/arif-acaloglu/"],
    ["/user/expert-committee-shanghai-energy-conservation-commission", "/tr/yazar/expert-committee-of-shanghai-energy-conservation-commission/"],
  ]) await assertRedirect(source, destination);

  // The existing front-controller normalization must preserve the exact alias.
  await assertRedirect("/index.php/user/mao-zedung", "/tr/yazar/mao-zedong/");
  await assertRedirect("/user/robet-minor?from=gsc", "/tr/yazar/robert-minor/", "?from=gsc");
});

test("recover GSC historical Drupal numeric and misspelled author identities", async () => {
  // Both are original Drupal pages preserved in the Wayback Machine:
  // /user/8 named Dominik Pietzcker, /user/sitki-rifat biography named Sıtkı Fırat.
  await assertRedirect("/user/8", "/tr/yazar/dominik-pietzcker/");
  await assertRedirect("/index.php/user/8", "/tr/yazar/dominik-pietzcker/");
  await assertRedirect("/user/sitki-rifat", "/tr/yazar/sitki-firat/");
});

test("historical joint byline aliases redirect to the published first author only", async () => {
  const mappings = [
    ["/user/amit-kumar-ve-dr-veena-ramachandran", "/tr/yazar/amit-kumar/"],
    ["/user/cheng-enfu-ve-li-jing", "/tr/yazar/cheng-enfu/"],
    ["/user/cheng-enfu-ve-lu-chunyi", "/tr/yazar/cheng-enfu/"],
    ["/user/dr-mohamad-zreik-prof-dr-zhao-changfeng", "/tr/yazar/mohamad-zreik/"],
    ["/user/dr-ogr-uyesi-assadollah-athari-ve-dr-ehsan-ejazi", "/tr/yazar/assadollah-athari/"],
    ["/user/efe-can-gurcan-ve-omer-ersin-kahraman", "/tr/yazar/efe-can-gurcan/"],
    ["/user/fahri-erenel-ahmet-gedik", "/tr/yazar/fahri-erenel/"],
    ["/user/fang-chenyu-ve-wang-weibin", "/tr/yazar/fang-chenyu/"],
    ["/user/liu-ningning-cheng-enfu", "/tr/yazar/liu-ningning/"],
    ["/user/luis-kato-maldonado-ve-guadalupe-huerta-moreno", "/tr/yazar/luis-kato-maldonado/"],
    ["/user/necati-demircan-ye-zhangxu", "/tr/yazar/necati-demircan/"],
    ["/user/prof-dr-song-shuli-prof-dr-cheng-enfu", "/tr/yazar/song-shuli/"],
    ["/user/prof-dr-sun-degang-dr-aml-ali-abdrabou", "/tr/yazar/sun-degang/"],
    ["/user/prof-dr-sun-degang-zhang-jieying", "/tr/yazar/sun-degang/"],
    ["/user/semih-guneri-ayca-avci-ahmet-z-bayburt", "/tr/yazar/semih-guneri/"],
    ["/user/shangtao-gao-jessica-durdu", "/tr/yazar/shangtao-gao/"],
    ["/user/wenbo-zhang-quan-heng", "/tr/yazar/wenbo-zhang/"],
    ["/user/yang-chen-ma-jinting", "/tr/yazar/yang-chen/"],
    ["/user/zhang-qingyi-du-donghui", "/tr/yazar/zhang-qingyi/"],
    ["/user/zhang-yan-jun-liu-yu-jun", "/tr/yazar/zhang-yan-jun/"],
  ];
  assert.equal(mappings.length, 20);
  for (const [source, destination] of mappings) await assertRedirect(source, destination);
  await assertRedirect("/index.php/user/necati-demircan-ye-zhangxu", "/tr/yazar/necati-demircan/");
  await assertRedirect("/user/efe-can-gurcan-ve-omer-ersin-kahraman?source=gsc", "/tr/yazar/efe-can-gurcan/", "?source=gsc");

  // The historical Bassam/Ziad group points to two articles with different
  // first authors; there is no unambiguous 301 target in this exact map.
  const { readFile } = await import("node:fs/promises");
  const map = await readFile(new URL("../worker/seo-legacy-redirects.ts", import.meta.url), "utf8");
  assert.ok(!map.includes('"/user/dr-bassam-abu-abdullah-ve-dr-ziad-ayoub-arbache":'));
});

test("2026 GSC English historical author aliases reach verified first-author profiles", async () => {
  const aliases = [
    ["/en/user/fahri-erenel-ahmet-gedik", "/en/authors/fahri-erenel/"],
    ["/en/user/liu-ningning-cheng-enfu", "/en/authors/liu-ningning/"],
    ["/en/user/wenbo-zhang-quan-heng", "/en/authors/wenbo-zhang/"],
    ["/en/user/shangtao-gao-jessica-durdu", "/en/authors/shangtao-gao/"],
    ["/en/user/8", "/en/authors/dominik-pietzcker/"],
    ["/en/user/necati-demircan-ye-zhangxu", "/en/authors/necati-demircan/"],
    ["/en/user/dr-mohamad-zreik-prof-dr-zhao-changfeng", "/en/authors/mohamad-zreik/"],
    ["/en/user/luis-kato-maldonado-ve-guadalupe-huerta-moreno", "/en/authors/luis-kato-maldonado/"],
    ["/en/user/sitki-rifat", "/en/authors/sitki-firat/"],
    ["/en/user/prof-dr-sun-degang-zhang-jieying", "/en/authors/sun-degang/"],
    ["/en/user/robet-minor", "/en/authors/robert-minor/"],
    ["/en/user/sule-perincek", "/en/authors/h-sule-perincek/"],
    ["/en/user/drarif-acaloglu", "/en/authors/arif-acaloglu/"],
    ["/en/user/igor-korotchenko", "/en/authors/igor-korotcenko/"],
    ["/en/user/yang-chen-ma-jinting", "/en/authors/yang-chen/"],
    ["/en/user/prof-dr-song-shuli-prof-dr-cheng-enfu", "/en/authors/song-shuli/"],
    ["/en/user/semih-guneri-ayca-avci-ahmet-z-bayburt", "/en/authors/semih-guneri/"],
    ["/en/user/cheng-enfu-ve-lu-chunyi", "/en/authors/cheng-enfu/"],
    ["/en/user/amit-kumar-ve-dr-veena-ramachandran", "/en/authors/amit-kumar/"],
    ["/en/user/zhang-yan-jun-liu-yu-jun", "/en/authors/zhang-yan-jun/"],
    ["/en/user/wang-laixi-na-risu-wu-lan", "/en/authors/wang-laixi/"],
    ["/en/user/fang-chenyu-and-wang-weibin", "/en/authors/fang-chenyu/"],
    ["/en/user/guo-xingen", "/en/authors/guo-xin-gen/"],
    ["/en/user/degang-sun-yingqi-yang", "/en/authors/sun-degang/"],
    ["/en/user/yi-shaoxuan-yang-chen", "/en/authors/yi-shaoxuan/"],
    ["/en/user/forugh-farrokhzad", "/en/authors/furug-ferruhzad/"],
    ["/en/user/sultan-hem-ve-degang-sun", "/en/authors/hend-elmahly-mahmoud-sultan/"],
  ];
  assert.equal(aliases.length, 27);
  for (const [source, target] of aliases) await assertRedirect(source, target);
  await assertRedirect("/index.php/en/user/wang-laixi-na-risu-wu-lan", "/en/authors/wang-laixi/");
  await assertRedirect("/en/user/fang-chenyu-and-wang-weibin?ref=gsc", "/en/authors/fang-chenyu/", "?ref=gsc");
});

test("two historically named publication aliases preserve editorial context", async () => {
  await assertRedirect("/en/reconfiguring-transatlantic-relations-era-war-and-strategic-fragmentation", "/en/calls-for-papers/transatlantic-relations/");
  await assertRedirect("/briq-1cilt-2-sayi", "/tr/arsiv/cilt-1-sayi-2/");
  const { readFile } = await import("node:fs/promises");
  const rules = await readFile(new URL("../worker/seo-legacy-redirects.ts", import.meta.url), "utf8");
  for (const old of ["/en/user/admin", "/en/user/prof-dr-yang-guang", "/en/user/inan-oner", "/en/user/dr-bassam-abu-abdullah-ve-dr-ziad-ayoub-arbache"]) {
    assert.ok(!rules.includes(JSON.stringify(old) + ":"), `unsupported source: ${old}`);
  }
});

test("Volume 1 issue 4 historic article URLs redirect directly to source-verified canonical records", async () => {
  // All three original publications were checked against live article title,
  // author, publication type, pages, issue and original PDF citations.
  const sources = [
    ["/en/articles/photograph-fujian-huian-maidens-weaving-net", "/en/articles/fujian-huian-maidens-weaving-net/"],
    ["/en/fotograf-ni-min-fujian-huian-kadini-ag-onariyor", "/en/articles/fujian-huian-maidens-weaving-net/"],
    ["/en/makale/fotograf-ni-min-fujian-huian-kadini-ag-onariyor", "/en/articles/fujian-huian-maidens-weaving-net/"],
    ["/en/makale/photograph-fujian-huian-maidens-weaving-net", "/en/articles/fujian-huian-maidens-weaving-net/"],
    ["/en/photograph-fujian-huian-maidens-weaving-net", "/en/articles/fujian-huian-maidens-weaving-net/"],
    ["/en/articles/history-the-first-book-about-ataturk-ever-published-in-iran", "/en/articles/the-first-book-about-ataturk-ever-published-in-iran/"],
    ["/en/the-first-book-about-ataturk-ever-published-in-iran", "/en/articles/the-first-book-about-ataturk-ever-published-in-iran/"],
    ["/en/articles/history-the-first-book-about-ataturk-ever-published-iran", "/en/articles/the-first-book-about-ataturk-ever-published-in-iran/"],
    ["/en/history-the-first-book-about-ataturk-ever-published-in-iran", "/en/articles/the-first-book-about-ataturk-ever-published-in-iran/"],
    ["/en/history-the-first-book-about-ataturk-ever-published-iran", "/en/articles/the-first-book-about-ataturk-ever-published-in-iran/"],
    ["/en/iranda-ataturk-ve-milli-mucadele-konusunda-ilk-kitap", "/en/articles/the-first-book-about-ataturk-ever-published-in-iran/"],
    ["/en/makale/history-the-first-book-about-ataturk-ever-published-in-iran", "/en/articles/the-first-book-about-ataturk-ever-published-in-iran/"],
    ["/en/makale/iranda-ataturk-ve-milli-mucadele-konusunda-ilk-kitap", "/en/articles/the-first-book-about-ataturk-ever-published-in-iran/"],
    ["/en/articles/book-review-post-covid-19-global-system-old-problems-new-trends", "/en/articles/post-covid-19-global-system-old-problems-new-trends/"],
    ["/en/book-review-post-covid-19-global-system-old-problems-new-trends", "/en/articles/post-covid-19-global-system-old-problems-new-trends/"],
    ["/en/covid-19-sonrasi-kuresel-sistem-eski-sorunlar-yeni-trendler", "/en/articles/post-covid-19-global-system-old-problems-new-trends/"],
    ["/en/makale/book-review-post-covid-19-global-system-old-problems-new-trends", "/en/articles/post-covid-19-global-system-old-problems-new-trends/"],
    ["/en/makale/covid-19-sonrasi-kuresel-sistem-eski-sorunlar-yeni-trendler", "/en/articles/post-covid-19-global-system-old-problems-new-trends/"],
  ];
  assert.equal(sources.length, 18);
  assert.equal(new Set(sources.map(([source]) => source)).size, 18);
  for (const [source, target] of sources) await assertRedirect(source, target);
  await assertRedirect("/index.php/en/articles/history-the-first-book-about-ataturk-ever-published-in-iran", "/en/articles/the-first-book-about-ataturk-ever-published-in-iran/");
  await assertRedirect("/en/articles/book-review-post-covid-19-global-system-old-problems-new-trends/?ref=gsc", "/en/articles/post-covid-19-global-system-old-problems-new-trends/", "?ref=gsc");
});


// GSC October 2026: safe only when first author is established by the
// official publication, and destination is an existing individual profile.
// The original grouping never warrants creation of new co-author pages.
test("12 verified historical individual/first-author aliases and the book-review CFP use direct permanent redirects", async () => {
  const pairs = [
    ["/en/calls-for-papers/kitap-incelemesi", "/en/calls-for-papers/book-reviews/"],
    ["/en/authors/li-sainan-li-xi", "/en/authors/li-sainan/"],
    ["/en/authors/salman-k-al-dhafeeire-sun-degang", "/en/authors/salman-k-al-dhafeeire/"],
    ["/tr/yazar/salman-k-al-dhafeeire-sun-degang", "/tr/yazar/salman-k-al-dhafeeire/"],
    ["/en/authors/pinar-gokcin-ozuyar-efe-can-gurcan-ve-esra-bayhantopcu", "/en/authors/pinar-gokcin-ozuyar/"],
    ["/tr/yazar/pinar-gokcin-ozuyar-efe-can-gurcan-ve-esra-bayhantopcu", "/tr/yazar/pinar-gokcin-ozuyar/"],
    ["/en/authors/prof-dr-gunay-cifci-and-team", "/en/authors/gunay-cifci/"],
    ["/tr/yazar/prof-dr-gunay-cifci-ve-ekibi", "/tr/yazar/gunay-cifci/"],
    ["/en/authors/shu-zhan-hao-ruiqi", "/en/authors/shu-zhan/"],
    ["/tr/yazar/shu-zhan-hao-ruiqi", "/tr/yazar/shu-zhan/"],
    ["/en/authors/bulent-gucubuk-dogan-basaran", "/en/authors/bulent-gulcubuk/"],
    ["/en/authors/engin-ture", "/en/authors/i-engin-ture/"],
    ["/tr/yazar/engin-ture", "/tr/yazar/i-engin-ture/"],
  ];
  assert.equal(pairs.length, 13);
  for (const [source, target] of pairs) await assertRedirect(source, target);
});

test("book-review CFP removes unsupported pagination without dropping unrelated query parameters", async () => {
  await assertRedirect(
    "/en/calls-for-papers/kitap-incelemesi?page=2",
    "/en/calls-for-papers/book-reviews/"
  );
  await assertRedirect(
    "/en/calls-for-papers/kitap-incelemesi?ref=gsc&page=2",
    "/en/calls-for-papers/book-reviews/",
    "?ref=gsc"
  );
  await assertRedirect(
    "/index.php/en/calls-for-papers/kitap-incelemesi?page=1",
    "/en/calls-for-papers/book-reviews/"
  );
  await assertRedirect(
    "/en/authors/engin-ture?ref=gsc",
    "/en/authors/i-engin-ture/",
    "?ref=gsc"
  );
});

test("uncertain author and historical administrative identities remain unmapped", async () => {
  const { readFile } = await import("node:fs/promises");
  const text = await readFile(new URL("../worker/seo-legacy-redirects.ts", import.meta.url), "utf8");
  for (const path of [
    "/en/authors/prof-dr-yang-guang",
    "/en/authors/inan-oner",
    "/en/authors/6",
    "/en/authors/admin",
    "/en/authors/dr-bassam-abu-abdullah-ve-dr-ziad-ayoub-arbache"
  ]) assert.ok(!text.includes(JSON.stringify(path) + ":"), path);
});

test("official 2026 publication first-author order preserves two safe legacy group aliases", async () => {
  // BRIQ 7(3), pp.302–325: Li Ning precedes Yang Xuyan.
  await assertRedirect("/tr/yazar/li-ning-yang-xuyan", "/tr/yazar/li-ning/");
  // BRIQ 7(4), pp.407–426: Hasret Çomak precedes Toker and Manioğlu.
  await assertRedirect("/en/authors/hasret-comak-furkan-toker-oguzhan-manioglu", "/en/authors/hasret-comak/");
  await assertRedirect("/tr/yazar/li-ning-yang-xuyan?ref=gsc", "/tr/yazar/li-ning/", "?ref=gsc");
});

test("combined old account does not rewrite independent coauthor profiles", async () => {
  for (const path of [
    "/tr/yazar/yang-xuyan/",
    "/tr/yazar/li-ning/",
    "/en/authors/ege-furkan-toker/",
    "/en/authors/oguzhan-manioglu/",
    "/en/authors/hasret-comak/",
  ]) {
    const response = await requestLegacy(path);
    assert.notEqual(response.status, 301, path);
  }
});

// October 26 GSC sample: four distinct aliases with existing profile targets.
test("four source-verified author alias routes resolve directly without changing other contributors", async () => {
  for (const [oldPath, target] of [
    ["/tr/yazar/prof-caner-karavit", "/tr/yazar/caner-karavit/"],
    ["/tr/yazar/prof-dr-david-laibman", "/tr/yazar/david-laibman/"],
    ["/en/authors/forugh-farrokhzad", "/en/authors/furug-ferruhzad/"],
    ["/tr/yazar/wang-jiani-bilguunzaya-luvsandandar", "/tr/yazar/wang-jiani/"],
  ]) await assertRedirect(oldPath, target);
  await assertRedirect("/tr/yazar/wang-jiani-bilguunzaya-luvsandandar?ref=gsc", "/tr/yazar/wang-jiani/", "?ref=gsc");
  const independent = await requestLegacy("/tr/yazar/bilguunzaya-luvsandandar/");
  assert.notEqual(independent.status, 301, "second author's existing personal profile must remain independent");
});
