/**
 * Reviewed legacy URLs from Google Search Console's 2026-10-16 404 sample.
 * Targets are existing, language-correct BRIQ routes or verified R2 PDF keys.
 * Do not add speculative article redirects or route unrelated content home.
 */
export const SEO_LEGACY_REDIRECTS: Record<string, string> = {
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
  "/en/author/degangsun": "/en/authors/degang-sun",
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

  // Existing article whose old, noncanonical slug is an exact content match.
  "/en/the-belt-and-road-initiative-in-the-shadow-of-competition-between-china-and-the-us": "/en/articles/the-belt-and-road-initiative-in-the-shadow-of-competition-between-china-and-the-us",
  "/kusak-ve-yol-girisimi-avrasyanin-yolu": "/tr/makaleler/rus-stratejist-dr-alexander-dugin-kusak-ve-yol-girisimi-avrasyanin-yolu",
  "/sovyet-reformunun-tarihi-trajedisinden-bizi-kurtaran-ne-oldu-cinin-ekonomik-cagdaslasmasina-yon": "/tr/makaleler/sovyet-reformunun-tarihi-trajedisinden-bizi-kurtaran-ne-oldu-cinin-ekonomik-cagdaslasmasina-yon-0",

  // Additional legacy slugs matched to published records in the article catalog.
  "/en/neo-mahanian-": "/en/articles/a-neo-mahanian-reading-of-turkey-and-chinas-changing-maritime-geopolitics",
  "/en/russian-strategist-": "/en/articles/russian-strategist-dr-alexander-dugin-the-belt-and-road-initiative-a-eurasian-road",
  "/turk-milli-ordusunun-zaferinin-uluslararasi-kiymeti": "/tr/makaleler/turk-milli-ordusunun-zaferinin-uluslarasi-kiymeti",

  // Specific 2020 English Issue 4 upload: name omits volume, so automatic
  // legacy PDF parser cannot infer the published issue. R2 target verified.
  "/sites/default/files/dergi-sayilari/2020-11/BRIQ_ENG ISSUE 4.pdf": "/assets/archive/pdfs/issues/cilt-1-sayi-4-en.pdf",

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
