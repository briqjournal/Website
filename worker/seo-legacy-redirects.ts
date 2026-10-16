/**
 * Reviewed legacy URLs from Google Search Console's 2026-10-16 404 sample.
 * Targets are existing, language-correct BRIQ routes or verified R2 PDF keys.
 * Do not add speculative article redirects or route unrelated content home.
 */
export const SEO_LEGACY_REDIRECTS: Record<string, string> = {
  // Search Console's legacy /user aliases with honorifics; each target is a
  // verified existing EN/TR author profile in the production sitemap.
  "/user/dr-hande-gunozu": "/tr/yazar/hande-gunozu",
  "/en/user/dr-francisco-dominguez": "/en/authors/francisco-dominguez",
  "/user/assoc-prof-dr-yang-chen": "/tr/yazar/yang-chen",
  "/user/prof-dr-semih-koray": "/tr/yazar/semih-koray",
  "/en/user/assoc-prof-dr-aleksandr-sotnicenko": "/en/authors/aleksandr-sotnicenko",
  "/en/user/dr-alexandr-bovdunov": "/en/authors/alexandr-bovdunov",
  "/en/user/assoc-prof-dr-yang-chen": "/en/authors/yang-chen",
  "/user/prof-dr-mehmet-celal-ozdogan": "/tr/yazar/mehmet-celal-ozdogan",
  "/user/prof-dr-birol-kilkis": "/tr/yazar/birol-kilkis",
  "/en/user/prof-dr-semih-koray": "/en/authors/semih-koray",
  "/user/prof-dr-radhika-desai": "/tr/yazar/radhika-desai",
  "/user/dr-sean-thomas-mckenna": "/tr/yazar/sean-thomas-mckenna",
  "/en/user/prof-dr-radhika-desai": "/en/authors/radhika-desai",
  "/en/user/prof-dr-ufuk-tutan": "/en/authors/ufuk-tutan",
  "/en/user/prof-jinghua-cao": "/en/authors/jinghua-cao",
  "/en/user/dr-ramzy-baroud": "/en/authors/ramzy-baroud",
  "/en/user/prof-dr-david-laibman": "/en/authors/david-laibman",
  "/en/user/dr-digby-james-wren": "/en/authors/digby-james-wren",
  "/en/user/prof-caner-karavit": "/en/authors/caner-karavit",
  "/en/user/dr-sean-thomas-mckenna": "/en/authors/sean-thomas-mckenna",
  "/user/dr-francisco-dominguez": "/tr/yazar/francisco-dominguez",
  "/en/user/prof-dr-emin-gurses": "/en/authors/emin-gurses",
  "/en/user/prof-dr-mehmet-celal-ozdogan": "/en/authors/mehmet-celal-ozdogan",
  "/en/user/dr-ali-sahin": "/en/authors/ali-sahin",
  "/en/user/prof-dr-ugur-murat-leloglu": "/en/authors/ugur-murat-leloglu",
  "/en/user/prof-dr-cuneyt-akalin": "/en/authors/cuneyt-akalin",
  "/user/prof-dr-cuneyt-akalin": "/tr/yazar/cuneyt-akalin",
  "/tr/user/prof-dr-cuneyt-akalin": "/tr/yazar/cuneyt-akalin",
  "/user/prof-jinghua-cao": "/tr/yazar/jinghua-cao",
  "/user/prof-dr-gunay-cifci": "/tr/yazar/gunay-cifci",
  "/en/user/prof-dr-ahmet-kavas": "/en/authors/ahmet-kavas",
  "/user/dr-alexandr-bovdunov": "/tr/yazar/alexandr-bovdunov",
  "/user/dr-ersel-zafer-oral": "/tr/yazar/ersel-zafer-oral",
  "/user/dr-digby-james-wren": "/tr/yazar/digby-james-wren",
  "/user/dr-ramzy-baroud": "/tr/yazar/ramzy-baroud",
  "/en/user/doc-dr-ogasawara-hiroyuki": "/en/authors/ogasawara-hiroyuki",
  "/user/doc-dr-efe-can-gurcan": "/tr/yazar/efe-can-gurcan",
  "/user/prof-dr-ahmet-kavas": "/tr/yazar/ahmet-kavas",

  // Former static/journal URLs. Override stale targets in LEGACY_REDIRECTS.
  "/yayin-etigi": "/tr/yazarlar/yayin-etigi",
  "/telif-hakki-sartlari-ve-lisans": "/tr/yazarlar/telif-hakki-sartlari-ve-lisans",
  "/en/principles-publication": "/en/journal/publication-principles",
  "/en/principles-of-publication": "/en/journal/publication-principles",
  "/en/submission-guidelines": "/en/for-authors/guidelines",
  "/en/copyright-lisence-terms": "/en/for-authors/copyright-and-licence",
  "/en/evaluation-process-peer-reviewed-submissions": "/en/for-authors/review-process",
  "/en/call-book-reviews": "/en/calls-for-papers/book-reviews",
  "/en/call-for-book-reviews": "/en/calls-for-papers/book-reviews",
  "/en/kitap-inceleme": "/en/calls-for-papers/book-reviews",
  "/en/homepage": "/en",
  "/briq-1cilt-3-sayi": "/tr/arsiv/cilt-1-sayi-3",
  "/briq-6cilt-4sayi-0": "/tr/arsiv/cilt-6-sayi-4",

  // Old contributor slug conventions. Generic /user/:slug is handled separately.
  "/user/prof-caner-karavit": "/tr/yazar/caner-karavit",
  "/en/user/doc-dr-efe-can-gurcan": "/en/authors/efe-can-gurcan",
  "/user/dr-yang-chen": "/tr/yazar/yang-chen",
  "/en/author/gongjianhua": "/en/authors/gong-jianhua",
  "/en/author/degangsun": "/en/authors/sun-degang",
  "/en/author/emingurses": "/en/authors/emin-gurses",
  "/en/author/cemgurdeniz": "/en/authors/cem-gurdeniz",

  // Former call-for-papers article URLs: these are CFPs, not research articles.
  "/en/latin-americas-role-progressive-change-and-resistance-us-hegemonism": "/en/calls-for-papers/latin-amerikada-ilerici-donusumler",
  "/latin-amerikada-ilerici-donusumler-ve-amerikan-hegemonyaciligina-direnis": "/tr/makale-cagrilari/latin-amerikada-ilerici-donusumler",
  "/en/artificial-intelligence-productive-forces-and-the-common-prosperity-humanity": "/en/calls-for-papers/artificial-intelligence-productive-forces",
  "/dunyada-giderek-buyuyen-gida-ve-su-krizi-kuresel-kuzeyin-politika-ve-uygulamalari-gelismekte-olan": "/tr/makale-cagrilari/dunyada-gida-ve-su-krizi",
  "/gelisen-dunyada-kulturel-mirasin-yagmasina-karsi-onlemler-ve-isbirligi": "/tr/makale-cagrilari/kulturel-miras-yagmasina-karsi-stratejiler",
  "/sun-yat-senin-olumunun-100-yildonumunde-1911-cin-devrimi-ve-sun-yat-senin-guncel-mirasi": "/tr/makale-cagrilari/1911-cin-devrimi-ve-sun-yat-sen",
  "/en/the-centenary-sun-yat-sens-death-the-1911-chinese-revolution-and-sun-yat-sens-enduring-legacy": "/en/calls-for-papers/1911-cin-devrimi-ve-sun-yat-sen",
  "/en/belt-and-road-initiative-and-the-islamic-world-economic-geopolitical-and-cultural-interactions": "/en/calls-for-papers/kusak-ve-yol-ve-islam-dunyasi",
  "/kusak-ve-yol-girisimi-ve-islam-dunyasi-ekonomik-jeopolitik-kulturel-alanlarda-etkilesimler": "/tr/makale-cagrilari/kusak-ve-yol-ve-islam-dunyasi",
  "/en/belt-and-road-initiative-and-organization-turkic-states-the-balance-shifts-central-asia": "/en/calls-for-papers/orta-asyada-kusak-ve-yol-ve-tdt",
  "/orta-asyada-dengeler-degisirken-kusak-ve-yol-girisimi-ve-turk-devletleri-teskilati": "/tr/makale-cagrilari/orta-asyada-kusak-ve-yol-ve-tdt",
  "/savaslar-ve-stratejik-parcalanma-caginda-transatlantik-iliskilerin-yeniden-yapilanmasi": "/tr/makale-cagrilari/transatlantik-iliskilerin-yeniden-yapilanmasi",
  "/cok-kutupluluga-karsi-tehditler-ve-etnik-ayrilikci-dinci-asirilikci-kiskirtmalar": "/tr/makale-cagrilari/cok-kutupluluga-karsi-tehditler",
  "/en/challenges-multipolarity-and-provocations-ethnic-separatists-and-religious-extremists": "/en/calls-for-papers/cok-kutupluluga-karsi-tehditler",
  "/70-yil-donumunde-bandung-konferansinin-gecmisten-gunumuze-suregelen-mirasi": "/tr/makale-cagrilari/bandung-konferansinin-mirasi",
  "/makale-cagrisi-kuresel-guneyde-bilimsel-ve-teknolojik-gelisme-politikalari": "/tr/makale-cagrilari/kuresel-guneyde-bilim-ve-teknoloji",

  // Former article aliases that resolved to removed slugs (confirmed 404).
  // Targets are their verified, published EN/TR canonical article pages.
  "/dilek-uyar-fotograf-sanatcisi": "/tr/makaleler/cobanin-sagim-sonrasi-suruyu-tekrar-otlaklara-goturme-cabasi-ve-tozlu-yolculuk/",
  "/download/after-milking-shepherds-effort-to-bring-the-herd-back-to-pasture-and-their-dusty-journey": "/en/articles/after-milking-shepherds-effort-to-bring-the-herd-back-to-pasture-and-their-dusty-journey-bitlis/",
  "/en/articles/history-the-first-book-about-ataturk-ever-published-iran": "/en/articles/the-first-book-about-ataturk-ever-published-in-iran/",
  "/en/book-review-post-covid-19-global-system-old-problems-new-trends": "/en/articles/post-covid-19-global-system-old-problems-new-trends/",
  "/en/covid-19-sonrasi-kuresel-sistem-eski-sorunlar-yeni-trendler": "/en/articles/post-covid-19-global-system-old-problems-new-trends/",
  "/en/dilek-uyar-photography-artist": "/en/articles/after-milking-shepherds-effort-to-bring-the-herd-back-to-pasture-and-their-dusty-journey-bitlis/",
  "/en/fotograf-ni-min-fujian-huian-kadini-ag-onariyor": "/en/articles/fujian-huian-maidens-weaving-net/",
  "/en/history-the-first-book-about-ataturk-ever-published-in-iran": "/en/articles/the-first-book-about-ataturk-ever-published-in-iran/",
  "/en/history-the-first-book-about-ataturk-ever-published-iran": "/en/articles/the-first-book-about-ataturk-ever-published-in-iran/",
  "/en/iranda-ataturk-ve-milli-mucadele-konusunda-ilk-kitap": "/en/articles/the-first-book-about-ataturk-ever-published-in-iran/",
  "/en/makale/book-review-post-covid-19-global-system-old-problems-new-trends": "/en/articles/post-covid-19-global-system-old-problems-new-trends/",
  "/en/makale/covid-19-sonrasi-kuresel-sistem-eski-sorunlar-yeni-trendler": "/en/articles/post-covid-19-global-system-old-problems-new-trends/",
  "/en/makale/fotograf-ni-min-fujian-huian-kadini-ag-onariyor": "/en/articles/fujian-huian-maidens-weaving-net/",
  "/en/makale/history-the-first-book-about-ataturk-ever-published-in-iran": "/en/articles/the-first-book-about-ataturk-ever-published-in-iran/",
  "/en/makale/iranda-ataturk-ve-milli-mucadele-konusunda-ilk-kitap": "/en/articles/the-first-book-about-ataturk-ever-published-in-iran/",
  "/en/makale/nato-and-the-wider-international-territory": "/en/articles/nato-from-control-of-the-western-territorial-line-to-control-of-the-wider-international-territory/",
  "/en/makale/photograph-fujian-huian-maidens-weaving-net": "/en/articles/fujian-huian-maidens-weaving-net/",
  "/en/photograph-fujian-huian-maidens-weaving-net": "/en/articles/fujian-huian-maidens-weaving-net/",
  "/en/the-first-book-about-ataturk-ever-published-in-iran": "/en/articles/the-first-book-about-ataturk-ever-published-in-iran/",

  // Existing article whose old, noncanonical slug is an exact content match.
  "/en/the-belt-and-road-initiative-in-the-shadow-of-competition-between-china-and-the-us": "/en/articles/the-belt-and-road-initiative-in-the-shadow-of-competition-between-china-and-the-us",
  "/kusak-ve-yol-girisimi-avrasyanin-yolu": "/tr/makaleler/rus-stratejist-dr-alexander-dugin-kusak-ve-yol-girisimi-avrasyanin-yolu",
  "/sovyet-reformunun-tarihi-trajedisinden-bizi-kurtaran-ne-oldu-cinin-ekonomik-cagdaslasmasina-yon": "/tr/makaleler/sovyet-reformunun-tarihi-trajedisinden-bizi-kurtaran-ne-oldu-cinin-ekonomik-cagdaslasmasina-yon-0",

  // Exact formerly published slugs recovered from the Search Console 404 sample.
  "/roportaj-yesil-ve-dijital-donusum-kapsaminda-": "/tr/makaleler/roportaj-yesil-ve-dijital-donusum-kapsaminda-ar-ge-ve-yenilik-ekosistemini-harekete-geciriyoruz",
  "/1uluslararasi-kusak-ve-yol-inisiyatifi-turkiye-sempozyumu": "/tr/makaleler/1-uluslararasi-kusak-ve-yol-inisiyatifi-turkiye-sempozyumu-turkiye-dijital-ipek-yolunun-oncusu",

  // Additional legacy slugs matched to published records in the article catalog.
  "/en/neo-mahanian-": "/en/articles/a-neo-mahanian-reading-of-turkey-and-chinas-changing-maritime-geopolitics",
  "/en/russian-strategist-": "/en/articles/russian-strategist-dr-alexander-dugin-the-belt-and-road-initiative-a-eurasian-road",
  "/turk-milli-ordusunun-zaferinin-uluslararasi-kiymeti": "/tr/makaleler/turk-milli-ordusunun-zaferinin-uluslarasi-kiymeti",

  // Specific 2020 English Issue 4 upload: name omits volume, so automatic
  // legacy PDF parser cannot infer the published issue. R2 target verified.
  "/sites/default/files/dergi-sayilari/2020-11/BRIQ_ENG ISSUE 4.pdf": "/assets/archive/pdfs/issues/cilt-1-sayi-4-en.pdf",
  "/sites/default/files/dergi-sayilari/2020-11/briq_eng issue 4.pdf": "/assets/archive/pdfs/issues/cilt-1-sayi-4-en.pdf",

  // Volume 7 issues 3/4 live under /assets/issues, not the older PDF prefix.
  "/assets/archive/pdfs/issues/cilt-7-sayi-3-tr.pdf": "/assets/issues/briq-cilt-7-sayi-3-yaz-2026-tr.pdf",
  "/assets/archive/pdfs/issues/cilt-7-sayi-3-en.pdf": "/assets/issues/briq-cilt-7-sayi-3-yaz-2026.pdf",
  "/assets/archive/pdfs/issues/cilt-7-sayi-4-tr.pdf": "/assets/issues/briq-cilt-7-sayi-4-sonbahar-2026.pdf",
  "/assets/archive/pdfs/issues/cilt-7-sayi-4-en.pdf": "/assets/issues/BRIQ-Volume7-Issue4-EN-original.pdf",

  // Older issue filenames observed in live 404 logs; source and R2 targets
  // were checked by volume/issue metadata and exact R2 object existence.
  "/assets/archive/pdfs/cilt-3-sayi-1-turk-cin-iliskileri-tr.pdf": "/assets/archive/pdfs/issues/cilt-3-sayi-1-tr.pdf",
  "/assets/archive/pdfs/cilt-1-sayi-4-dogu-akdeniz-guney-kafkasya-tr.pdf": "/assets/archive/pdfs/issues/cilt-1-sayi-4-tr.pdf",
  "/assets/archive/pdfs/cilt-3-sayi-3-sanghay-hidrojen-tr.pdf": "/assets/archive/pdfs/issues/cilt-3-sayi-3-tr.pdf",
};
