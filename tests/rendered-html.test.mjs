import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const archive = JSON.parse(await readFile(new URL("../app/archive-data.json", import.meta.url), "utf8"));

function slugifyEnglishTitle(value) {
  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/&/g, " and ")
    .replace(/[’']/g, "")
    .toLocaleLowerCase("en-US")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

const englishSlugBases = archive.articles.map((article) =>
  article.title_en?.trim() ? slugifyEnglishTitle(article.title_en) : article.slug,
);
const englishSlugCounts = new Map();
for (const slug of englishSlugBases) englishSlugCounts.set(slug, (englishSlugCounts.get(slug) || 0) + 1);

function englishArticleSlug(turkishSlug) {
  const index = archive.articles.findIndex((article) => article.slug === turkishSlug);
  assert.notEqual(index, -1, `article fixture ${turkishSlug}`);
  const article = archive.articles[index];
  const base = englishSlugBases[index] || article.slug;
  return englishSlugCounts.get(base) > 1 ? `${base}-volume-${article.volume}-issue-${article.issue}` : base;
}

async function renderPath(pathname, headers = {}) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html", ...headers } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders production metadata without preview markers", async () => {
  const response = await renderPath("/tr");

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.doesNotMatch(html, /name=["']codex-preview["']/i);
  assert.match(html, /<link rel="canonical" href="https:\/\/briqjournal\.com\/tr"/i);
});

test("routes the locale gateway by Cloudflare country and preserves legacy Turkish URLs", async () => {
  const [turkey, abroad, legacy] = await Promise.all([
    renderPath("/", { "cf-ipcountry": "TR" }),
    renderPath("/", { "cf-ipcountry": "DE" }),
    renderPath("/arsiv?cilt=7"),
  ]);

  assert.equal(turkey.status, 307);
  assert.equal(new URL(turkey.headers.get("location")).pathname, "/tr");
  assert.equal(abroad.status, 307);
  assert.equal(new URL(abroad.headers.get("location")).pathname, "/en");
  assert.equal(legacy.status, 308);
  const legacyLocation = new URL(legacy.headers.get("location"));
  assert.equal(legacyLocation.pathname, "/tr/arsiv");
  assert.equal(legacyLocation.searchParams.get("cilt"), "7");
});

test("keeps registered BRIQ DOIs matched to their Crossref article records", async () => {
  const registered = Object.fromEntries(
    archive.articles
      .filter((article) => article.doi)
      .map((article) => [article.slug, article.doi]),
  );

  assert.deepEqual(registered, {
    "uluslararasi-ticarette-dusuk-karbon-kurallarinda-ortaya-cikan-egilimler-ve-kusak-yol-girisimi": "10.67696/2v3z8f5e",
    "iklim-degisikligi-baglaminda-su-kitligi-ve-kuresel-gida-krizi": "10.67696/6d5e3a4d",
    "dunyanin-yeniden-duzenlenisi-bolgesel-bloklar-ve-cok-kutuplu-kuresel-yonetisimin-yukselisi": "10.67696/7q2m9x4k",
    "islami-sistem-ve-uluslararasi-iliskilerin-demokratiklesmesi-uzerine-bir-arastirma": "10.67696/6r8h4k4a",
    "cin-abd-iliskilerinin-gelecegi": "10.67696/5y2r9u9d",
    "afrikada-yabanci-guclerin-mudahaleleri-elestirel-bir-degerlendirme": "10.67696/3s9f6q3t",
    "uluslararasi-kalkinma-isbirliginin-ic-siyasal-mantigi-guneydogu-asyada-kusak-ve-yol-girisiminin": "10.67696/4k5f5u3h",
    "kulturel-silinmeden-tarihsel-kurtarmaya-nishio-kanji-ve-amerikan-isgali-altindaki-japonyanin": "10.67696/8g8a8j3f",
    "kultur-varliklarinin-yasadisi-ithalatinin-onlenmesi-ve-iadesine-iliskin-turkiye-ile-isvicre": "10.67696/9v8n5x9a",
    "cinde-somut-olmayan-kulturel-mirasin-korunmasi-yirmi-yillik-deneyim-suregelen-zorluklar-ve-gelecege": "10.67696/4f9e7s8m",
    "mogolistanin-ucuncu-komsu-diplomasisinde-kurumsal-dengeleme-sanghay-isbirligi-orgutu-ile-etkilesim": "10.67696/7g5d4y5c",
    "suudi-arabistanin-abd-ile-cin-arasinda-cok-boyutlu-kulturel-dengeleme-stratejisi": "10.67696/5s9f9a2d",
    "turkiye-cin-diplomatik-iliskilerinin-55-yilinda-avrasyada-guc-gecisi-ve-jeoekonomik-baglantisallik": "10.67696/2z9q4h9h",
    "dijital-ipek-yolu-cercevesinde-cin-arap-isbirligi-urdun-ornegi": "10.67696/8q6a9a7j",
    "filistinciligin-zirve-paradoksu-transatlantik-kamuoyu-stratejik-realizm-ve-iki-devletli-cozumun": "10.67696/2t7q7z9t",
    "mao-zedungun-diyalektik-anlayisi-ekonomik-determinizm-elestirisi-siyasal-ozne-ve-cin-dusunce": "10.67696/7j5e3t9z",
    "kuresel-guneyde-yenilik-sistemlerinin-kurulmasi-zorluklar-ve-guney-guney-isbirligi-ile-yol-haritasi": "10.67696/7z8u9a8t",
    "turkiyenin-guvenlik-politikalarina-istihbarat-teskilatlarinin-katkisi": "10.67696/9d8g7g6p",
    "kuresel-kalkinma-girisimi-ve-cinin-ortadogudaki-kalkinma-isbirligi-calismalari": "10.67696/9t8p5a8b",
    "modernist-milliyetci-olarak-sun-yat-sen-ve-siyasal-mirasi": "10.67696/7w7s7q6w",
    "cinli-devrimcilerin-sun-yat-sen-ve-mustafa-kemal-arasindaki-benzerlikler-uzerine-gorusleri": "10.67696/6j2e8x6y",
    "yukselen-orta-guclerin-denge-diplomasisi-kavramlar-saikler-ve-cikarimlar": "10.67696/6z7p7k5f",
    "alter-kuresellesme-baglaminda-cin-fransiz-iliskileri": "10.67696/8v4k3s3a",
    "cezayir-devrimci-diplomasisi-bandung-temel-girisiminden-yeni-bir-baglantisizlar-konseptine": "10.67696/3h4m9n5e",
    "endonezya-dis-politikasinda-bandung-mirasina-yeniden-bakis-tarihsel-bir-inceleme-ve-guncel": "10.67696/9k2z2d6j",
    "bandung-ruhu-70-yasinda": "10.67696/3y9c6c9j",
    "bandung-konferansi-oncesi-ve-sonrasinda-yeni-cinin-dis-politikasi-bandung-konferansini-yeniden": "10.67696/6t8c3r4t",
    "yeni-bir-enerji-kaynagi-olarak-gaz-hidratlar": "10.67696/3y4k5w3e",
    "rusyanin-bolgesel-guvenlikteki-rolu-uzerine-bir-inceleme-kolektif-guvenlik-antlasmasi-orgutu-ve": "10.67696/5u4a7a4w",
    "dunya-ekonomik-forumunun-kuresellesme-surecindeki-etkisinin-ekonomi-politik-elestirisi": "10.67696/6b2t5b5a",
    "genc-cin-ve-genc-cinliler-cinde-aydinlanma-yeni-kultur-hareketi-ve-yeni-siyasal-bicimlenme": "10.67696/8d6b6r6u",
  });
});

test("keeps the revised Turkish and English information architecture in parity", async () => {
  const routePairs = [
    ["/tr/dergi/briq-hakkinda", "BRIQ Hakkında", "/en/journal/about-briq", "About BRIQ"],
    ["/tr/dergi/yayin-ilkeleri", "Yayın İlkeleri", "/en/journal/publication-principles", "Principles of Publication"],
    ["/tr/yazarlar", "Yazarlar İçin", "/en/for-authors", "For Authors"],
    ["/tr/yazarlar/yazim-kurallari", "Yazım kuralları", "/en/for-authors/guidelines", "Submission Guidelines"],
    ["/tr/yazarlar/yayin-degerlendirme-sureci", "Yayın Değerlendirme Süreci", "/en/for-authors/review-process", "Publication Review Process"],
    ["/tr/yazarlar/telif-hakki-sartlari-ve-lisans", "Telif Hakkı Şartları ve Lisans", "/en/for-authors/copyright-and-licence", "Lisence Terms"],
    ["/tr/yazarlar/yayin-etigi", "Yayın Etiği", "/en/for-authors/publication-ethics", "Ethical Principles"],
    ["/tr/iletisim", "Dergi iletişim sorumlusu", "/en/contact", "Journal contact person"],
    ["/tr/makale-cagrilari", "Geçmiş çağrılar", "/en/calls-for-papers", "Past calls"],
    ["/tr/makale-cagrilari/yapay-zeka-uretici-gucler-ortak-refah", "Önerilen Konu Başlıkları", "/en/calls-for-papers/artificial-intelligence-productive-forces", "Suggested Topics"],
  ];

  for (const [trPath, trText, enPath, enText] of routePairs) {
    const [trResponse, enResponse] = await Promise.all([renderPath(trPath), renderPath(enPath)]);
    assert.equal(trResponse.status, 200, trPath);
    assert.equal(enResponse.status, 200, enPath);
    const [trHtml, enHtml] = await Promise.all([trResponse.text(), enResponse.text()]);
    assert.match(trHtml, new RegExp(trText, "i"), trPath);
    assert.match(enHtml, new RegExp(enText, "i"), enPath);
    assert.match(trHtml, new RegExp(`href=["']${enPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`), `${trPath} language switch`);
    assert.match(enHtml, new RegExp(`href=["']${trPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`), `${enPath} language switch`);
  }
});

test("keeps calls for papers fully localised in both languages", async () => {
  const dataUrl = new URL("../app/site-data.ts", import.meta.url);
  const source = await readFile(dataUrl, "utf8");
  assert.doesNotMatch(source, /titleEn:\s*""/);
  assert.doesNotMatch(source, /deadlineEn:\s*""/);
  assert.match(source, /issueHrefEn:/);
  assert.match(source, /urlEn:/);
});

test("publishes reciprocal canonical and language metadata for both locales", async () => {
  const [trResponse, enResponse] = await Promise.all([
    renderPath("/tr/makale-cagrilari"),
    renderPath("/en/calls-for-papers"),
  ]);
  const [trHtml, enHtml] = await Promise.all([trResponse.text(), enResponse.text()]);
  assert.match(trHtml, /<title>Makale çağrıları \| BRIQ<\/title>/i);
  assert.match(enHtml, /<title>Calls for Papers \| BRIQ<\/title>/i);
  assert.match(trHtml, /hrefLang="en-US"/i);
  assert.match(enHtml, /hrefLang="tr-TR"/i);
  assert.match(trHtml, /\/en\/calls-for-papers/);
  assert.match(enHtml, /\/tr\/makale-cagrilari/);
});

test("uses a single calls-for-papers heading and keeps the publisher credit only once", async () => {
  const [trResponse, enResponse] = await Promise.all([
    renderPath("/tr/makale-cagrilari"),
    renderPath("/en/calls-for-papers"),
  ]);
  const [trHtml, enHtml] = await Promise.all([trResponse.text(), enResponse.text()]);

  assert.match(trHtml, /<h1>Makale Çağrıları<\/h1>/);
  assert.doesNotMatch(trHtml, /Açık ve geçmiş çağrılar/i);
  assert.doesNotMatch(trHtml, /<p class="section-kicker light">Makale Çağrıları<\/p>/);
  assert.match(enHtml, /<h1>Calls for Papers<\/h1>/);
  assert.doesNotMatch(enHtml, /Active and Past Calls/i);
  assert.doesNotMatch(enHtml, /<p class="section-kicker light">Calls for Papers<\/p>/);
  assert.equal((trHtml.match(/Çin İş Geliştirme ve Dostluk Derneği tarafından yayımlanmaktadır\./g) || []).length, 0);
  assert.equal((trHtml.match(/Yayıncı: Çin İş Geliştirme ve Dostluk Derneği/g) || []).length, 1);
});

test("renders source-faithful publication principles with a two-level section navigator", async () => {
  const [trResponse, enResponse] = await Promise.all([
    renderPath("/tr/dergi/yayin-ilkeleri"),
    renderPath("/en/journal/publication-principles"),
  ]);
  const [trHtml, enHtml] = await Promise.all([trResponse.text(), enResponse.text()]);

  assert.match(trHtml, /Amerika Birleşik Devletleri’nin tek kutuplu bir dünya düzeni yaratma arzusunu boşa çıkarmıştır/);
  assert.match(trHtml, /Barış, kardeşlik, işbirliği, refah, toplumsal fayda ve ortak kalkınma ilkeleri/);
  assert.match(enHtml, /At a time when US ambitions for a unipolar world order have lost their appeal/);
  assert.match(enHtml, /BRIQ stands for the unity of humanity and a fair world order/);

  for (const html of [trHtml, enHtml]) {
    assert.match(html, /class="[^"]*scrollspy-link level-2/);
    assert.match(html, /class="[^"]*scrollspy-link level-3/);
  }
  assert.match(trHtml, /href="#cok-kutuplulasma"/);
  assert.match(enHtml, /href="#multipolarisation"/);
});

test("keeps the Turkish and English About BRIQ pages in structural parity", async () => {
  const [trResponse, enResponse] = await Promise.all([
    renderPath("/tr/dergi/briq-hakkinda"),
    renderPath("/en/journal/about-briq"),
  ]);
  const [trHtml, enHtml] = await Promise.all([trResponse.text(), enResponse.text()]);

  assert.equal((trHtml.match(/class="fact-strip"/g) || []).length, 1);
  assert.match(trHtml, /class="[^"]*scrollspy-link level-2/);
  assert.match(trHtml, /class="[^"]*scrollspy-link level-3/);
  assert.match(trHtml, /BRIQ \(Belt &amp; Road Initiative Quarterly\) Türkçe-İngilizce yayınlanan üç aylık/);
  assert.match(trHtml, /Çin İş Geliştirme ve Dostluk Derneği tarafından yayımlanmaktadır/);
  assert.match(trHtml, /2019’da yayın hayatına başladı/);
  assert.match(trHtml, /Alternatif bir akademik alan/);
  assert.match(enHtml, /<h1>About BRIQ<\/h1>/);
  assert.equal((enHtml.match(/class="fact-strip"/g) || []).length, 1);
  assert.match(enHtml, /class="[^"]*scrollspy-link level-2/);
  assert.match(enHtml, /class="[^"]*scrollspy-link level-3/);
  assert.match(enHtml, /BRIQ \(Belt &amp; Road Initiative Quarterly\) is a scholarly journal/);
  assert.match(enHtml, /Independent publication decisions/);
  assert.match(enHtml, /Turkish-Chinese Business Development and Friendship Association/);
  assert.match(enHtml, /began publication in 2019/);
  assert.match(enHtml, /An alternative scholarly space/);
});

test("shows publication types and cover-colour issue badges in both article directories", async () => {
  const [trResponse, enResponse] = await Promise.all([
    renderPath("/tr/makaleler"),
    renderPath("/en/articles"),
  ]);
  const [trHtml, enHtml] = await Promise.all([trResponse.text(), enResponse.text()]);

  assert.match(trHtml, /title="Yayın türü">Araştırma Makalesi/);
  assert.match(trHtml, /title="Yayın türü">Röportaj/);
  assert.match(trHtml, /title="Yayın türü">Kitap İncelemesi/);
  assert.match(enHtml, /title="Publication type">Research Article/);
  assert.match(enHtml, /title="Publication type">Interview/);
  assert.match(enHtml, /title="Publication type">Book Review/);
  for (const html of [trHtml, enHtml]) {
    assert.match(html, /class="article-issue-badge" style="background-color:#[0-9a-f]{6}"/i);
    assert.match(html, /class="article-issue-badge" style="background-color:#713349"/i);
  }
});

test("keeps the official Turkish and English author guidance in the two-level longform system", async () => {
  const pagePairs = [
    [
      "/tr/yazarlar/yazim-kurallari",
      "BRIQ Dergisi, akademik makalelerden kitap incelemelerine",
      "Röportaj önerileri için lütfen Yayın Kurulu ile iletişime geçiniz.",
      "/en/for-authors/guidelines",
      "Belt and Road Initiative Quarterly (BRIQ) features a broad range of content",
      "Please contact the Editorial Board for interview proposals.",
    ],
    [
      "/tr/yazarlar/yayin-degerlendirme-sureci",
      "Makalelerin kabulü aşağıda belirtilen aşamalardan oluşur:",
      "son hali Yazıişleri’nin kontrolünden geçerek baskıya gönderilir.",
      "/en/for-authors/review-process",
      "Peer-review process for the submissions involves ten steps:",
      "controlled by the Editorial Team and then sent to publication.",
    ],
    [
      "/tr/yazarlar/telif-hakki-sartlari-ve-lisans",
      "İlgili yazar ve tüm diğer yazarlar bir bütün olarak",
      "Creative Commons Atıf 4.0 Uluslararası Lisansı",
      "/en/for-authors/copyright-and-licence",
      "The Corresponding Contributor and all co-authors of the Contribution",
      "The Journal uses Creative Commons Attribution 4.0 International License",
    ],
    [
      "/tr/yazarlar/yayin-etigi",
      "ulusal ve uluslararası akademik ilke ve etik değerlere bağlı",
      "Düşmanlık, iftira ve hakaret içeren aşağılayıcı kişisel yorumlar yapılmamalıdır.",
      "/en/for-authors/publication-ethics",
      "adheres to national and international academic principles and ethical values",
      "Personal comments that are hostile, slanderous and insulting should not be made.",
    ],
  ];

  for (const [trPath, trOpening, trClosing, enPath, enOpening, enClosing] of pagePairs) {
    const [trResponse, enResponse] = await Promise.all([renderPath(trPath), renderPath(enPath)]);
    const [trHtml, enHtml] = await Promise.all([trResponse.text(), enResponse.text()]);
    assert.ok(trHtml.includes(trOpening), `${trPath} opening source text`);
    assert.ok(trHtml.includes(trClosing), `${trPath} closing source text`);
    assert.ok(enHtml.includes(enOpening), `${enPath} opening source text`);
    assert.ok(enHtml.includes(enClosing), `${enPath} closing source text`);
    for (const html of [trHtml, enHtml]) {
      assert.match(html, /class="[^"]*editorial-longform/);
      assert.match(html, /class="[^"]*scrollspy-link level-2/);
      assert.match(html, /class="[^"]*scrollspy-link level-3/);
    }
  }
});

test("keeps contribution tables inside author-guide navigation and the licence lead at content scale", async () => {
  const [trResponse, enResponse] = await Promise.all([
    renderPath("/tr/yazarlar/yazim-kurallari"),
    renderPath("/en/for-authors/guidelines"),
  ]);
  const [trHtml, enHtml] = await Promise.all([trResponse.text(), enResponse.text()]);

  assert.match(trHtml, /class="[^"]*scrollspy-link level-2[^"]*" href="#icerik-turleri-ve-kelime-sayilari"/);
  assert.match(enHtml, /class="[^"]*scrollspy-link level-2[^"]*" href="#contribution-types-and-word-counts"/);
  assert.match(trHtml, /<h2>İçerik türleri ve kelime sayıları<\/h2>[\s\S]*class="format-table"/);
  assert.match(enHtml, /<h2>Contribution types and word counts<\/h2>[\s\S]*class="format-table"/);
  assert.doesNotMatch(trHtml, /class="editorial-page-module"/);
  assert.doesNotMatch(enHtml, /class="editorial-page-module"/);

  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /\.license-lead img \{\s*width: 110px/);
  assert.match(css, /\.license-lead h2 \{[\s\S]*font-size: clamp\(24px, 2\.4vw, 32px\)/);
});

test("keeps the new issue, board, archive, and author interactions in Turkish-English parity", async () => {
  const [trIssue, enIssue, trBoard, enBoard, trArchive, enArchive, trArticle, enArticle] = await Promise.all([
    renderPath("/tr/guncel-sayi"),
    renderPath("/en/current-issue"),
    renderPath("/tr/dergi/yayin-kurulu"),
    renderPath("/en/journal/publication-board"),
    renderPath("/tr/arsiv"),
    renderPath("/en/archive"),
    renderPath("/tr/makaleler/kulturel-silinmeden-tarihsel-kurtarmaya"),
    renderPath(`/en/articles/${englishArticleSlug("kulturel-silinmeden-tarihsel-kurtarmaya-nishio-kanji-ve-amerikan-isgali-altindaki-japonyanin")}`),
  ]).then((responses) => Promise.all(responses.map((response) => response.text())));

  assert.match(trIssue, /Kapağı incele/);
  assert.match(trIssue, /Sonbahar/);
  assert.match(trIssue, /Batı Asya’da Yeni Dönem/);
  assert.equal((trIssue.match(/class="issue-toc-number"/g) || []).length, 11);
  assert.match(trIssue, /Sunuş yazısını oku/);
  assert.match(trIssue, /Yalnızlığı Denemek/);
  assert.match(enIssue, /Inspect cover/);
  assert.match(enIssue, /Autumn/);
  assert.match(enIssue, /A New Era in West Asia/);
  assert.equal((enIssue.match(/class="issue-toc-number"/g) || []).length, 11);
  assert.match(enIssue, /Read the editorial/);

  assert.match(trBoard, /<h1>Yayın Kurulu<\/h1>/);
  assert.match(trBoard, /class="editorial-roster-list"/);
  assert.doesNotMatch(trBoard, /\/assets\/people\//);
  assert.match(trBoard, /href="\/tr\/yazar\/fikret-akfirat"/);
  assert.match(enBoard, /<h1>Editorial Info<\/h1>/);
  assert.match(enBoard, /<h2>Editorial Board<\/h2>/);
  assert.doesNotMatch(enBoard, /\/assets\/people\//);
  assert.match(enBoard, /href="\/en\/authors\/fikret-akfirat"/);

  for (const html of [trArchive, enArchive]) {
    assert.match(html, /class="archive-year-group"/);
    assert.match(html, /class="archive-year-heading"/);
  }

  for (const html of [trArticle, enArticle]) {
    assert.match(html, /class="author-profile-link"/);
    assert.doesNotMatch(html, /class="author-popover"/);
  }
});

test("renders archived issues with the same platform structure as the current issue", async () => {
  const responses = await Promise.all([
    renderPath("/tr/guncel-sayi"),
    renderPath("/tr/arsiv/cilt-6-sayi-4"),
    renderPath("/en/current-issue"),
    renderPath("/en/archive/volume-6-issue-4"),
  ]);
  const [currentTr, archivedTr, currentEn, archivedEn] = await Promise.all(
    responses.map((response) => response.text()),
  );

  for (const html of [currentTr, archivedTr, currentEn, archivedEn]) {
    for (const className of ["issue-masthead", "issue-cover-frame", "issue-actions", "issue-identity-row", "issue-facts", "issue-toc", "issue-pdf-section"]) {
      assert.match(html, new RegExp(`class="[^"]*${className}`), className);
    }
  }

  assert.match(archivedTr, /<h1>Birlikte Kalkınmak İçin<em>Ortak Güvenlik<\/em><\/h1>/);
  assert.match(archivedEn, /<h1>Common Security for<em>Shared Development<\/em><\/h1>/);
  assert.equal((archivedTr.match(/class="issue-toc-number"/g) || []).length, 8);
  assert.equal((archivedEn.match(/class="issue-toc-number"/g) || []).length, 8);
  for (const html of [archivedTr, archivedEn]) {
    assert.doesNotMatch(html, /class="issue-detail/);
    assert.doesNotMatch(html, /class="compact-article-list/);
  }
});

test("uses verified bilingual cover headings for every issue", async () => {
  const issuePaths = archive.issues.flatMap((issue) => [
    `/tr/arsiv/cilt-${issue.volume}-sayi-${issue.issue}`,
    `/en/archive/volume-${issue.volume}-issue-${issue.issue}`,
  ]);
  const responses = await Promise.all(issuePaths.map(renderPath));
  const pages = await Promise.all(responses.map((response) => response.text()));

  assert.equal(pages.length, archive.issues.length * 2);
  for (const [index, html] of pages.entries()) {
    assert.match(html, /<h1(?: class="issue-title-subtitle-first")?>(?:[^<]+(?:<em>[^<]+<\/em>)?|<em>[^<]+<\/em><span>[^<]+<\/span>)<\/h1>/, issuePaths[index]);
    assert.doesNotMatch(html, /(Bahar|Yaz|Sonbahar|Kış) \d{4} Sayısı/, issuePaths[index]);
    assert.doesNotMatch(html, /(Spring|Summer|Autumn|Winter) \d{4} Issue/, issuePaths[index]);
  }

  const spring2026Tr = pages[issuePaths.indexOf("/tr/arsiv/cilt-7-sayi-2")];
  const spring2026En = pages[issuePaths.indexOf("/en/archive/volume-7-issue-2")];
  assert.match(spring2026Tr, /<h1>Çin’e Özgü Sosyalizmin Ekonomi Politiği<\/h1>/);
  assert.match(spring2026En, /<h1>The Political Economy of Socialism with Chinese Characteristics<\/h1>/);
  assert.doesNotMatch(spring2026Tr, /<h1>Çin’e Özgü Sosyalizmin<em>/);
  assert.doesNotMatch(spring2026En, /<h1>The Political Economy of<em>/);
});

test("renders editorial information and advisory boards as scholarly mastheads", async () => {
  const [trEditorialResponse, enEditorialResponse] = await Promise.all([
    renderPath("/tr/dergi/yayin-kurulu"),
    renderPath("/en/journal/publication-board"),
  ]);
  const [trEditorial, enEditorial] = await Promise.all([
    trEditorialResponse.text(),
    enEditorialResponse.text(),
  ]);

  assert.equal(trEditorialResponse.status, 200);
  assert.equal(enEditorialResponse.status, 200);
  assert.match(trEditorial, /<h1>Yayın Kurulu<\/h1>/);
  assert.match(trEditorial, /<h2>Genel Yayın Yönetmeni<\/h2>/);
  assert.match(trEditorial, /<h2>Yayın Kurulu<\/h2>/);
  assert.match(trEditorial, /<h2>Editörler<\/h2>/);
  assert.match(trEditorial, /<h2>Dil Editörleri<\/h2>/);
  assert.match(trEditorial, /ODTÜ · TÜBİTAK/);
  assert.match(trEditorial, /<em>ODTÜ · TÜBİTAK<\/em>/);
  assert.match(trEditorial, /İTÜ TMDK/);
  assert.match(enEditorial, /<h1>Editorial Info<\/h1>/);
  assert.match(enEditorial, /<h2>Editor-in-Chief<\/h2>/);
  assert.match(enEditorial, /<h2>Editorial Board<\/h2>/);
  assert.match(enEditorial, /<h2>Editors<\/h2>/);
  assert.match(enEditorial, /<h2>Language Editors<\/h2>/);
  assert.match(enEditorial, /Middle East Technical University · TÜBİTAK/);
  assert.match(enEditorial, /<em>Middle East Technical University · TÜBİTAK<\/em>/);
  assert.match(enEditorial, /ITU Turkish Music State Conservatory/);

  for (const html of [trEditorial, enEditorial]) {
    assert.match(html, /class="editorial-roster-list"/);
    assert.doesNotMatch(html, /class="person-card"/);
    assert.doesNotMatch(html, /\/assets\/people\//);
    assert.doesNotMatch(html, /editorial-roster-number/);
  }
  assert.doesNotMatch(trEditorial, /Gazeteci-Yazar/);
  assert.doesNotMatch(enEditorial, /Journalist and author/);

  const advisoryPairs = [
    ["/tr/dergi/danisma-kurulu", "Danışma Kurulu", "Üyeler"],
    ["/en/journal/advisory-board", "Advisory Board", "Members"],
  ];

  for (const [pathname, title, memberLabel] of advisoryPairs) {
    const response = await renderPath(pathname);
    assert.equal(response.status, 200, pathname);
    const html = await response.text();
    const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    assert.match(html, /class="[^"]*board-page-section/);
    assert.match(html, /class="[^"]*editorial-roster is-compact/);
    assert.match(html, new RegExp(`<h1>${escapedTitle}<\\/h1>`));
    assert.doesNotMatch(html, new RegExp(`<h2>${escapedTitle}<\\/h2>`));
    assert.match(html, new RegExp(`<span>${memberLabel}<\\/span>`));
  }

  const [trInactive, enInactive] = await Promise.all([
    renderPath("/tr/dergi/editorluk-ekibi"),
    renderPath("/en/journal/editorial-team"),
  ]);
  assert.equal(trInactive.status, 404);
  assert.equal(enInactive.status, 404);
});

test("lists active calls with left-hand images and prominent deadlines", async () => {
  const [trResponse, enResponse] = await Promise.all([renderPath("/tr"), renderPath("/en")]);
  const [trHome, enHome] = await Promise.all([trResponse.text(), enResponse.text()]);

  for (const html of [trHome, enHome]) {
    assert.equal((html.match(/class="home-call-row"/g) || []).length, 3);
    assert.equal((html.match(/class="home-call-image"/g) || []).length, 3);
    assert.equal((html.match(/class="home-call-deadline"/g) || []).length, 3);
    assert.doesNotMatch(html, /class="call-card/);
  }
  assert.match(trHome, /<small>Uzatılmış Son Tarih<\/small><strong><span>10 Ekim<\/span><span>2026<\/span><\/strong>/);
  assert.match(enHome, /<small>Extended Deadline<\/small><strong><span>10 October<\/span><span>2026<\/span><\/strong>/);
});

test("renders the two active thematic calls with complete structured source copy", async () => {
  const [trTransatlanticResponse, trAiResponse, enTransatlanticResponse, enAiResponse] = await Promise.all([
    renderPath("/tr/makale-cagrilari/transatlantik-iliskilerin-yeniden-yapilanmasi"),
    renderPath("/tr/makale-cagrilari/yapay-zeka-uretici-gucler-ortak-refah"),
    renderPath("/en/calls-for-papers/transatlantic-relations"),
    renderPath("/en/calls-for-papers/artificial-intelligence-productive-forces"),
  ]);
  const [trTransatlantic, trAi, enTransatlantic, enAi] = await Promise.all([
    trTransatlanticResponse.text(),
    trAiResponse.text(),
    enTransatlanticResponse.text(),
    enAiResponse.text(),
  ]);

  for (const response of [trTransatlanticResponse, trAiResponse, enTransatlanticResponse, enAiResponse]) {
    assert.equal(response.status, 200);
  }
  for (const html of [trTransatlantic, trAi, enTransatlantic, enAi]) {
    assert.match(html, /class="call-detail-hero-media"/);
    assert.doesNotMatch(html, /class="reading-nav"/);
    assert.match(html, /class="call-topics-section"/);
    assert.match(html, /class="call-guidelines-section"/);
    assert.match(html, /class="call-important-date"/);
    assert.match(html, /class="call-contact-section"/);
    assert.match(html, /mailto:briq@briqjournal\.com/);
  }

  assert.match(trTransatlantic, /<h3>Transatlantik İlişkilerde Dönüşüm<\/h3>/);
  assert.match(trTransatlantic, /<h3>Çok Kutupluluk ve Batı İttifakının Krizi<\/h3>/);
  assert.match(trTransatlantic, /Atıf sistemi: APA 7\./);
  assert.match(trTransatlantic, /Uzatılmış son metin gönderim tarihi: 10 Ekim 2026/);
  assert.match(enTransatlantic, /Extended deadline for final manuscript submission: 10 October 2026/);
  assert.doesNotMatch(trTransatlantic, /15 Ağustos 2026|APA 6/);

  assert.match(trAi, /BRIQ, yukarıdaki genel çerçeve içinde/);
  assert.match(trAi, /Yapay zekânın askerileşmesi ile sivil\/kamucu kullanım/);
  assert.match(trAi, /Son metin gönderimi: 1 Aralık 2026/);
  assert.match(enTransatlantic, /<h3>Transformation in Transatlantic Relations<\/h3>/);
  assert.match(enAi, /Within this general framework, BRIQ welcomes submissions/);

  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /\.board-page-section > \.editorial-roster \{\s*margin-top: 0/);
  assert.match(css, /\.editorial-info-page \{\s*max-width: none/);
  assert.match(css, /\.editorial-roster\.is-compact \.editorial-roster-meta > span:first-child/);
  assert.match(css, /#111b28/);
  assert.match(css, /#173e5c/);
  assert.match(css, /\.home-call-row:nth-child\(4n \+ 1\) \{[^}]*background: var\(--call-field\)/);
  assert.match(css, /\.home-call-row:nth-child\(4n \+ 2\) \{[^}]*background: var\(--call-field\)/);
  assert.match(css, /\.home-call-row:nth-child\(4n \+ 3\) \{[^}]*background: var\(--call-field\)/);
  assert.match(css, /\.home-call-row:nth-child\(4n\) \{[^}]*background: var\(--call-field\)/);
  assert.match(css, /Compact publisher-style call pages: one reading column and image-tinted mastheads/);
  assert.match(css, /\.call-topic-group,[\s\S]*?display: block/);
  assert.match(css, /\.call-detail-hero h1 \{[\s\S]*?font-size: clamp\(32px, 3\.7vw, 50px\)/);
});

test("uses four consistent monochrome issue palettes across all volumes", async () => {
  const responses = await Promise.all([
    renderPath("/tr/arsiv/cilt-7-sayi-1"),
    renderPath("/tr/arsiv/cilt-7-sayi-2"),
    renderPath("/tr/arsiv/cilt-7-sayi-3"),
    renderPath("/tr/guncel-sayi"),
  ]);
  const pages = await Promise.all(responses.map((response) => response.text()));

  assert.match(pages[0], /--issue-tone:#0b3438;--issue-accent:#1f6668/);
  assert.match(pages[1], /--issue-tone:#0c315f;--issue-accent:#1e5a91/);
  assert.match(pages[2], /--issue-tone:#4b281d;--issue-accent:#b95524/);
  assert.match(pages[3], /--issue-tone:#35131f;--issue-accent:#713349/);
});

test("separates bilingual HTML article reading from the dedicated PDF viewer", async () => {
  const slug = "kulturel-silinmeden-tarihsel-kurtarmaya-nishio-kanji-ve-amerikan-isgali-altindaki-japonyanin";
  const englishSlug = englishArticleSlug(slug);
  const [trArticleResponse, enArticleResponse, trPdfResponse, enPdfResponse] = await Promise.all([
    renderPath(`/tr/makaleler/${slug}`),
    renderPath(`/en/articles/${englishSlug}`),
    renderPath(`/tr/makaleler/${slug}/pdf`),
    renderPath(`/en/articles/${englishSlug}/pdf`),
  ]);
  const [trArticle, enArticle, trPdf, enPdf] = await Promise.all([
    trArticleResponse.text(),
    enArticleResponse.text(),
    trPdfResponse.text(),
    enPdfResponse.text(),
  ]);

  assert.match(trArticle, /Kitaplar Nasıl “Yakıldı”/);
  assert.match(enArticle, /How the Books Were “Burned”/);
  assert.match(trArticle, new RegExp(`href="/tr/makaleler/${slug}/pdf"`));
  assert.match(enArticle, new RegExp(`href="/en/articles/${englishSlug}/pdf"`));
  assert.match(enArticle, new RegExp(`download="briq-${englishSlug}-en\\.pdf"`));
  assert.match(trArticle, /class="inline-citation"/);
  assert.match(trArticle, /class="article-accordion article-references"/);
  assert.match(trArticle, new RegExp(`/citations/${slug}\\.ris`));
  assert.doesNotMatch(trArticle, /<iframe/);
  assert.doesNotMatch(enArticle, /<iframe/);

  assert.match(trPdf, /PDF görüntüleyici/);
  assert.match(enPdf, /PDF viewer/);
  assert.match(trPdf, /<iframe/);
  assert.match(enPdf, /<iframe/);
  assert.match(trPdf, new RegExp(`href="/tr/makaleler/${slug}"`));
  assert.match(enPdf, new RegExp(`href="/en/articles/${englishSlug}"`));
  assert.match(enPdf, new RegExp(`download="briq-${englishSlug}-en\\.pdf"`));
});

test("uses English article slugs and redirects legacy Turkish-slug English URLs", async () => {
  const slug = "suudi-arabistanin-abd-ile-cin-arasinda-cok-boyutlu-kulturel-dengeleme-stratejisi";
  const englishSlug = englishArticleSlug(slug);
  const [directory, englishArticle, englishPdf, legacyArticle, legacyPdf, misplacedTurkishArticle, misplacedTurkishPdf] = await Promise.all([
    renderPath("/en/articles"),
    renderPath(`/en/articles/${englishSlug}`),
    renderPath(`/en/articles/${englishSlug}/pdf`),
    renderPath(`/en/articles/${slug}`),
    renderPath(`/en/articles/${slug}/pdf`),
    renderPath(`/tr/makaleler/${englishSlug}`),
    renderPath(`/tr/makaleler/${englishSlug}/pdf`),
  ]);
  const directoryHtml = await directory.text();
  const [englishArticleHtml, englishPdfHtml] = await Promise.all([englishArticle.text(), englishPdf.text()]);

  assert.match(directoryHtml, new RegExp(`href="/en/articles/${englishSlug}"`));
  assert.doesNotMatch(directoryHtml, new RegExp(`href="/en/articles/${slug}"`));
  const articleSwitchHref = englishArticleHtml.match(/href="([^"]+)"[^>]+aria-label="Bu sayfanın Türkçe sürümü"/)?.[1];
  const pdfSwitchHref = englishPdfHtml.match(/href="([^"]+)"[^>]+aria-label="Bu sayfanın Türkçe sürümü"/)?.[1];
  assert.ok([`/tr/makaleler/${slug}`, `/tr/makaleler/${englishSlug}`].includes(articleSwitchHref));
  assert.ok([`/tr/makaleler/${slug}/pdf`, `/tr/makaleler/${englishSlug}/pdf`].includes(pdfSwitchHref));
  assert.ok([307, 308].includes(legacyArticle.status));
  assert.equal(new URL(legacyArticle.headers.get("location")).pathname, `/en/articles/${englishSlug}`);
  assert.ok([307, 308].includes(legacyPdf.status));
  assert.equal(new URL(legacyPdf.headers.get("location")).pathname, `/en/articles/${englishSlug}/pdf`);
  assert.ok([307, 308].includes(misplacedTurkishArticle.status));
  assert.equal(new URL(misplacedTurkishArticle.headers.get("location")).pathname, `/tr/makaleler/${slug}`);
  assert.ok([307, 308].includes(misplacedTurkishPdf.status));
  assert.equal(new URL(misplacedTurkishPdf.headers.get("location")).pathname, `/tr/makaleler/${slug}/pdf`);

  const bareMisplacedEnArticle = await renderPath(`/tr/${englishSlug}`);
  assert.ok([307, 308].includes(bareMisplacedEnArticle.status));
  assert.equal(new URL(bareMisplacedEnArticle.headers.get("location")).pathname, `/en/articles/${englishSlug}`);
});

test("redirects legacy user author profile URLs to canonical author routes", async () => {
  const [trUser] = await Promise.all([
    renderPath("/tr/user/prof-dr-cuneyt-akalin"),
  ]);
  assert.ok([301, 307, 308].includes(trUser.status));
  assert.equal(new URL(trUser.headers.get("location")).pathname, "/tr/yazar/prof-dr-cuneyt-akalin");
});

test("renders every current-issue contribution in the bilingual HTML article platform", async () => {
  const slugs = [
    "kulturel-silinmeden-tarihsel-kurtarmaya-nishio-kanji-ve-amerikan-isgali-altindaki-japonyanin",
    "turkiyenin-kulturel-varliklari-geri-kazanma-mucadelesi",
    "kultur-varliklarinin-yasadisi-ithalatinin-onlenmesi-ve-iadesine-iliskin-turkiye-ile-isvicre",
    "cinde-somut-olmayan-kulturel-mirasin-korunmasi-yirmi-yillik-deneyim-suregelen-zorluklar-ve-gelecege",
    "anadolunun-kulturel-mirasini-koruma-ve-gelecege-aktarma-sorumlulugu",
    "yagmalanan-iskit-altinlarinin-mirasi",
    "mogolistanin-ucuncu-komsu-diplomasisinde-kurumsal-dengeleme-sanghay-isbirligi-orgutu-ile-etkilesim",
    "kusak-ve-yolun-guvenligi-ozel-guvenlik-risk-ve-cinin-kuresel-genislemesi",
  ];

  for (const slug of slugs) {
    const [trResponse, enResponse] = await Promise.all([
      renderPath(`/tr/makaleler/${slug}`),
      renderPath(`/en/articles/${englishArticleSlug(slug)}`),
    ]);
    assert.equal(trResponse.status, 200, `TR ${slug}`);
    assert.equal(enResponse.status, 200, `EN ${slug}`);
    const [trHtml, enHtml] = await Promise.all([trResponse.text(), enResponse.text()]);
    assert.match(trHtml, /class="article-body-section"/, `TR full text ${slug}`);
    assert.match(enHtml, /class="article-body-section"/, `EN full text ${slug}`);
    assert.doesNotMatch(trHtml, /legacy-fulltext-note/, `TR legacy fallback ${slug}`);
    assert.doesNotMatch(enHtml, /legacy-fulltext-note/, `EN legacy fallback ${slug}`);
  }
});

test("publishes every Volume 4 Issue 3 canonical record as localized bilingual HTML", async () => {
  const issueArticles = archive.articles.filter((article) => article.volume === 4 && article.issue === 3);
  assert.equal(issueArticles.length, 10);

  for (const article of issueArticles) {
    const slug = article.slug;
    const [trResponse, enResponse] = await Promise.all([
      renderPath(`/tr/makaleler/${slug}`),
      renderPath(`/en/articles/${englishArticleSlug(slug)}`),
    ]);
    assert.equal(trResponse.status, 200, `TR v04-i03 ${slug}`);
    assert.equal(enResponse.status, 200, `EN v04-i03 ${slug}`);
    const [trHtml, enHtml] = await Promise.all([trResponse.text(), enResponse.text()]);
    assert.match(trHtml, /<section class="article-fulltext" id="tam-metin"><h2>Tam Metin<\/h2>/, `TR full text ${slug}`);
    assert.match(enHtml, /<section class="article-fulltext" id="full-text-body"><h2>Full Text<\/h2>/, `EN full text ${slug}`);
    assert.match(trHtml, /class="article-body-section"/, `TR body ${slug}`);
    assert.match(enHtml, /class="article-body-section"/, `EN body ${slug}`);
    assert.doesNotMatch(trHtml, /legacy-fulltext-note/, `TR legacy fallback ${slug}`);
    assert.doesNotMatch(enHtml, /legacy-fulltext-note/, `EN legacy fallback ${slug}`);
  }
});

test("publishes every Volume 3 Issue 4 canonical record as localized bilingual HTML", async () => {
  const issueArticles = archive.articles.filter((article) => article.volume === 3 && article.issue === 4);
  assert.equal(issueArticles.length, 12);

  for (const article of issueArticles) {
    const slug = article.slug;
    const [trResponse, enResponse] = await Promise.all([
      renderPath(`/tr/makaleler/${slug}`),
      renderPath(`/en/articles/${englishArticleSlug(slug)}`),
    ]);
    assert.equal(trResponse.status, 200, `TR v03-i04 ${slug}`);
    assert.equal(enResponse.status, 200, `EN v03-i04 ${slug}`);
    const [trHtml, enHtml] = await Promise.all([trResponse.text(), enResponse.text()]);
    assert.match(trHtml, /<section class="article-fulltext" id="tam-metin"><h2>Tam Metin<\/h2>/, `TR full text ${slug}`);
    assert.match(enHtml, /<section class="article-fulltext" id="full-text-body"><h2>Full Text<\/h2>/, `EN full text ${slug}`);
    assert.match(trHtml, /class="article-body-section"/, `TR body ${slug}`);
    assert.match(enHtml, /class="article-body-section"/, `EN body ${slug}`);
    assert.doesNotMatch(trHtml, /legacy-fulltext-note/, `TR legacy fallback ${slug}`);
    assert.doesNotMatch(enHtml, /legacy-fulltext-note/, `EN legacy fallback ${slug}`);
  }
});

test("publishes every Volume 5 Issues 1–2 canonical record as localized bilingual HTML", async () => {
  const issueOne = archive.articles.filter((article) => article.volume === 5 && article.issue === 1);
  const issueTwo = archive.articles.filter((article) => article.volume === 5 && article.issue === 2);
  assert.equal(issueOne.length, 11);
  assert.equal(issueTwo.length, 14);

  for (const article of [...issueOne, ...issueTwo]) {
    const slug = article.slug;
    const [trResponse, enResponse] = await Promise.all([
      renderPath(`/tr/makaleler/${slug}`),
      renderPath(`/en/articles/${englishArticleSlug(slug)}`),
    ]);
    assert.equal(trResponse.status, 200, `TR v05-i0${article.issue} ${slug}`);
    assert.equal(enResponse.status, 200, `EN v05-i0${article.issue} ${slug}`);
    const [trHtml, enHtml] = await Promise.all([trResponse.text(), enResponse.text()]);
    assert.match(trHtml, /<section class="article-fulltext" id="tam-metin"><h2>Tam Metin<\/h2>/, `TR full text ${slug}`);
    assert.match(enHtml, /<section class="article-fulltext" id="full-text-body"><h2>Full Text<\/h2>/, `EN full text ${slug}`);
    assert.match(trHtml, /class="article-body-section"/, `TR body ${slug}`);
    assert.match(enHtml, /class="article-body-section"/, `EN body ${slug}`);
    assert.doesNotMatch(trHtml, /legacy-fulltext-note/, `TR legacy fallback ${slug}`);
    assert.doesNotMatch(enHtml, /legacy-fulltext-note/, `EN legacy fallback ${slug}`);
  }
});

test("publishes Volume 7 Issues 1–3 editorials and Issue 3 supplementary contents", async () => {
  for (const issue of [1, 2, 3]) {
    const [trIssueResponse, enIssueResponse, trEditorialResponse, enEditorialResponse] = await Promise.all([
      renderPath(`/tr/arsiv/cilt-7-sayi-${issue}`),
      renderPath(`/en/archive/volume-7-issue-${issue}`),
      renderPath(`/tr/arsiv/cilt-7-sayi-${issue}/sunus`),
      renderPath(`/en/archive/volume-7-issue-${issue}/editorial`),
    ]);
    assert.equal(trEditorialResponse.status, 200, `TR editorial 7.${issue}`);
    assert.equal(enEditorialResponse.status, 200, `EN editorial 7.${issue}`);
    const [trIssue, enIssue, trEditorial, enEditorial] = await Promise.all([
      trIssueResponse.text(),
      enIssueResponse.text(),
      trEditorialResponse.text(),
      enEditorialResponse.text(),
    ]);
    assert.match(trIssue, new RegExp(`/tr/arsiv/cilt-7-sayi-${issue}/sunus`));
    assert.match(enIssue, new RegExp(`/en/archive/volume-7-issue-${issue}/editorial`));
    assert.match(trEditorial, /Fikret Akfırat/);
    assert.match(enEditorial, /Editor-in-Chief/);
    assert.match(trEditorial, /class="current-editorial-imprint"/);
    assert.match(trEditorial, /ISSN/);
    assert.match(trEditorial, /2687-5896/);
    assert.match(trEditorial, /2718-0581/);
    assert.match(trEditorial, /--issue-accent:#[0-9a-f]{6}/i);
    assert.match(trEditorial, new RegExp(`href="/en/archive/volume-7-issue-${issue}/editorial"`));
    assert.match(enEditorial, new RegExp(`href="/tr/arsiv/cilt-7-sayi-${issue}/sunus"`));
  }

  const issueThree = await (await renderPath("/tr/arsiv/cilt-7-sayi-3")).text();
  assert.equal((issueThree.match(/class="issue-toc-number"/g) || []).length, 13);
  assert.match(issueThree, /Hafız Şirazi/);
  assert.match(issueThree, /Hasan Hüseyin Korkmazgil/);
  assert.match(issueThree, /Louis Daguerre/);
  assert.match(issueThree, /Rawan Anani/);
  assert.match(issueThree, /Olivio Martinez/);
  for (const page of [123, 125, 127, 128, 129]) assert.match(issueThree, new RegExp(`#page=${page}`));

  const [issueOne, issueTwo] = await Promise.all([
    renderPath("/tr/arsiv/cilt-7-sayi-1").then((response) => response.text()),
    renderPath("/tr/arsiv/cilt-7-sayi-2").then((response) => response.text()),
  ]);
  assert.equal((issueOne.match(/class="issue-toc-number"/g) || []).length, 10);
  assert.match(issueOne, /Hiroshi Sugimoto/);
  assert.match(issueOne, /Nazmi Ziya Güran/);
  assert.match(issueOne, /Semih Balcıoğlu/);
  assert.match(issueOne, /Cahit Sıtkı Tarancı/);
  assert.match(issueOne, /Pablo Neruda/);
  for (const page of [128, 129, 130, 131, 133]) assert.match(issueOne, new RegExp(`#page=${page}`));
  assert.equal((issueTwo.match(/class="issue-toc-number"/g) || []).length, 11);
  assert.match(issueTwo, /Devrimci Operalar/);
  assert.match(issueTwo, /Anyuan’a Giderken Başkan Mao/);
  assert.match(issueTwo, /On Bin Hane, Bir Aile, Bahar Şehri Doldurur/);
  for (const page of [125, 127, 129, 130, 131]) assert.match(issueTwo, new RegExp(`#page=${page}`));
});

test("renders Volume 7 Issue 2 articles as bilingual HTML with issue-verified affiliations", async () => {
  const expected = [
    ["sovyet-reformunun-tarihi-trajedisinden-bizi-kurtaran-ne-oldu-cinin-ekonomik-cagdaslasmasina-yon-0", "Nanjing Finans ve Ekonomi Üniversitesi", "Nanjing University of Finance and Economics"],
    ["cine-ozgu-sosyalist-politik-ekonomiye-genel-bakis", "Wuhan Üniversitesi", "Wuhan University"],
    ["afrikada-yabanci-guclerin-mudahaleleri-elestirel-bir-degerlendirme", "Cezayir Üniversitesi", "University of Algiers"],
    ["uluslararasi-kalkinma-isbirliginin-ic-siyasal-mantigi-guneydogu-asyada-kusak-ve-yol-girisiminin", "Fudan Üniversitesi", "Fudan University"],
    ["hitlerin-sovyetler-birligine-karsi-savasi-ayni-zamanda-abd-icin-bir-vekalet-savasiydi", "Yazar, Köln, Almanya", "Author, Cologne, Germany"],
    ["japonyadaki-abd-isgaline-karsi-sag-ve-sol-arasinda-olasi-ittifak", "Keio Üniversitesi ve Kyoto Üniversitesi", "Keio University and Kyoto University"],
  ];

  for (const [slug, affiliationTr, affiliationEn] of expected) {
    const [trResponse, enResponse] = await Promise.all([
      renderPath(`/tr/makaleler/${slug}`),
      renderPath(`/en/articles/${englishArticleSlug(slug)}`),
    ]);
    assert.equal(trResponse.status, 200, `TR 7.2 ${slug}`);
    assert.equal(enResponse.status, 200, `EN 7.2 ${slug}`);
    const [trHtml, enHtml] = await Promise.all([trResponse.text(), enResponse.text()]);
    assert.match(trHtml, /class="article-body-section"/, `TR full text ${slug}`);
    assert.match(enHtml, /class="article-body-section"/, `EN full text ${slug}`);
    assert.match(trHtml, new RegExp(affiliationTr));
    assert.match(enHtml, new RegExp(affiliationEn));
    assert.doesNotMatch(trHtml, /Bağımsız Araştırmacı/);
    assert.doesNotMatch(enHtml, /Independent Researcher/);
    assert.match(trHtml, /1 Mart 2026/);
    assert.match(enHtml, /1 March 2026/);
    assert.match(trHtml, /Atıfta bulun/);
  }

  const issueArticles = archive.articles.filter((article) => article.volume === 7 && article.issue === 2);
  assert.equal(issueArticles.length, 11);
  assert.ok(issueArticles.every((article) => article.published_online_date === "2026-03-01"));
  assert.equal(issueArticles[0].publication_type_tr, "Çeviri");
  assert.equal(issueArticles[1].publication_type_tr, "Çeviri");
  assert.equal(issueArticles[4].publication_type_tr, "Görüş Makalesi");
  assert.equal(issueArticles[5].publication_type_tr, "Görüş Makalesi");

  const [firstTranslation, secondTranslation] = await Promise.all([
    renderPath(`/tr/makaleler/${expected[0][0]}`).then((response) => response.text()),
    renderPath(`/tr/makaleler/${expected[1][0]}`).then((response) => response.text()),
  ]);
  assert.match(firstTranslation, /<span>Yayın notu<\/span>/);
  assert.match(firstTranslation, /Politik Ekonomi Araştırmaları/);
  assert.match(secondTranslation, /<span>Yayın notu<\/span>/);
  assert.match(secondTranslation, /1–24\. sayfalarında yer alan Giriş bölümünün çevirisidir/);
  assert.doesNotMatch(firstTranslation, /Yazar Beyanları/);
  assert.doesNotMatch(secondTranslation, /Yazar Beyanları/);
});

test("renders every Volume 7 Issue 1 article and book review as bilingual HTML with verified author affiliations", async () => {
  const expected = [
    ["uluslararasi-ticarette-dusuk-karbon-kurallarinda-ortaya-cikan-egilimler-ve-kusak-yol-girisimi", "Şanghay Sosyal Bilimler Akademisi", "Shanghai Academy of Social Sciences"],
    ["iklim-degisikligi-baglaminda-su-kitligi-ve-kuresel-gida-krizi", "Elektrik Mühendisi ve Yenilenebilir Enerji Uzmanı", "Electrical Engineer and Renewable Energy Expert"],
    ["dunyanin-yeniden-duzenlenisi-bolgesel-bloklar-ve-cok-kutuplu-kuresel-yonetisimin-yukselisi", "Çin Dışişleri Üniversitesi", "China Foreign Affairs University"],
    ["islami-sistem-ve-uluslararasi-iliskilerin-demokratiklesmesi-uzerine-bir-arastirma", "Xi’an Uluslararası Çalışmalar Üniversitesi", "Xi’an International Studies University"],
    ["cin-abd-iliskilerinin-gelecegi", "Şanghay Üniversitesi", "Shanghai University"],
  ];

  for (const [slug, affiliationTr, affiliationEn] of expected) {
    const [trResponse, enResponse] = await Promise.all([
      renderPath(`/tr/makaleler/${slug}`),
      renderPath(`/en/articles/${englishArticleSlug(slug)}`),
    ]);
    assert.equal(trResponse.status, 200, `TR 7.1 ${slug}`);
    assert.equal(enResponse.status, 200, `EN 7.1 ${slug}`);
    const [trHtml, enHtml] = await Promise.all([trResponse.text(), enResponse.text()]);
    assert.match(trHtml, /class="article-body-section"/);
    assert.match(enHtml, /class="article-body-section"/);
    assert.match(trHtml, new RegExp(affiliationTr));
    assert.match(enHtml, new RegExp(affiliationEn));
    assert.doesNotMatch(trHtml, /legacy-fulltext-note/);
    assert.doesNotMatch(enHtml, /legacy-fulltext-note/);
    assert.doesNotMatch(trHtml, /Bağımsız Araştırmacı/);
    assert.doesNotMatch(enHtml, /Independent Researcher/);
  }
});

test("renders every Volume 7 Issue 4 contribution from its source PDF with the corrected online date", async () => {
  const slugs = [
    "suudi-arabistanin-abd-ile-cin-arasinda-cok-boyutlu-kulturel-dengeleme-stratejisi",
    "turkiye-cin-diplomatik-iliskilerinin-55-yilinda-avrasyada-guc-gecisi-ve-jeoekonomik-baglantisallik",
    "dijital-ipek-yolu-cercevesinde-cin-arap-isbirligi-urdun-ornegi",
    "filistinciligin-zirve-paradoksu-transatlantik-kamuoyu-stratejik-realizm-ve-iki-devletli-cozumun",
    "mao-zedungun-diyalektik-anlayisi-ekonomik-determinizm-elestirisi-siyasal-ozne-ve-cin-dusunce",
    "cinin-kuresel-altyapi-stratejisi",
  ];

  const issueArticles = archive.articles.filter((article) => article.volume === 7 && article.issue === 4);
  assert.equal(issueArticles.length, 6);
  assert.ok(issueArticles.every((article) => article.published_online_date === "2026-09-01"));

  for (const slug of slugs) {
    const [trResponse, enResponse] = await Promise.all([
      renderPath(`/tr/makaleler/${slug}`),
      renderPath(`/en/articles/${englishArticleSlug(slug)}`),
    ]);
    assert.equal(trResponse.status, 200, `TR ${slug}`);
    assert.equal(enResponse.status, 200, `EN ${slug}`);
    const [trHtml, enHtml] = await Promise.all([trResponse.text(), enResponse.text()]);
    assert.match(trHtml, /class="article-body-section"/, `TR full text ${slug}`);
    assert.match(enHtml, /class="article-body-section"/, `EN full text ${slug}`);
    assert.match(trHtml, /1 Eylül 2026/, `TR online date ${slug}`);
    assert.match(enHtml, /1 September 2026/, `EN online date ${slug}`);
    assert.doesNotMatch(trHtml, /legacy-fulltext-note/, `TR legacy fallback ${slug}`);
    assert.doesNotMatch(enHtml, /legacy-fulltext-note/, `EN legacy fallback ${slug}`);
  }
});

test("keeps article history fixed and hides unavailable publication statements", async () => {
  const slug = "kulturel-silinmeden-tarihsel-kurtarmaya-nishio-kanji-ve-amerikan-isgali-altindaki-japonyanin";
  const [trResponse, enResponse] = await Promise.all([
    renderPath(`/tr/makaleler/${slug}`),
    renderPath(`/en/articles/${englishArticleSlug(slug)}`),
  ]);
  const [trHtml, enHtml] = await Promise.all([trResponse.text(), enResponse.text()]);

  assert.match(trHtml, /class="article-static-toc"/);
  assert.doesNotMatch(trHtml, /class="reading-nav scrollspy-nav"/);
  for (const label of ["Geliş", "Revizyon", "Kabul", "Çevrimiçi yayım"]) assert.match(trHtml, new RegExp(label));
  for (const label of ["Received", "Revised", "Accepted", "Published online"]) assert.match(enHtml, new RegExp(label));
  assert.equal((trHtml.match(/class="article-declaration"/g) || []).length, 0);
  assert.equal((enHtml.match(/class="article-declaration"/g) || []).length, 0);
  assert.doesNotMatch(trHtml, /Kaynak dosyada ayrı bir beyan bulunmamaktadır/);
  assert.doesNotMatch(enHtml, /The source file does not contain a separate statement/);
  assert.doesNotMatch(trHtml, /Ek materyaller/);
  assert.doesNotMatch(enHtml, /Supplementary information/);
  assert.doesNotMatch(trHtml, /Editöryal kayıt ve yayıncı notu/);
  assert.doesNotMatch(enHtml, /Editorial record and publisher’s note/);
  for (const removed of ["Katılımcı onamı", "Yayın onamı", "Veri erişilebilirliği", "Kod erişilebilirliği", "Yazar katkıları", "Yapay zekâ kullanım beyanı"]) assert.doesNotMatch(trHtml, new RegExp(removed));
});

test("capitalizes the first letter of every displayed keyword", async () => {
  const slug = "kulturel-silinmeden-tarihsel-kurtarmaya-nishio-kanji-ve-amerikan-isgali-altindaki-japonyanin";
  const [trResponse, enResponse] = await Promise.all([
    renderPath(`/tr/makaleler/${slug}`),
    renderPath(`/en/articles/${englishArticleSlug(slug)}`),
  ]);
  for (const html of [await trResponse.text(), await enResponse.text()]) {
    const keywordSection = html.match(/<section class="article-keywords"[\s\S]*?<\/section>/)?.[0] || "";
    const keywords = [...keywordSection.matchAll(/<span>([^<]+)<\/span>/g)].map((match) => match[1]);
    assert.ok(keywords.length > 0);
    assert.ok(keywords.every((keyword) => !/^\p{Ll}/u.test(keyword.trim())), keywords.join(" | "));
  }
});

test("links each resolvable in-text citation to an expandable reference record", async () => {
  const slug = "kulturel-silinmeden-tarihsel-kurtarmaya-nishio-kanji-ve-amerikan-isgali-altindaki-japonyanin";
  const response = await renderPath(`/tr/makaleler/${slug}`);
  const html = await response.text();
  assert.ok((html.match(/class="inline-citation"/g) || []).length >= 60);
  assert.doesNotMatch(html, /class="inline-citation"[^>]*data-tooltip=/);
  assert.match(html, /class="inline-citation"[^>]*href="#ref-/);
  const tooltips = [...html.matchAll(/<span class="citation-tooltip"[^>]*>([\s\S]*?)<\/span>/g)].map((match) => match[1]);
  assert.ok(tooltips.length >= 60);
  assert.ok(tooltips.some((tooltip) => /<em>/.test(tooltip)), "APA 7 italics in citation tooltips");
  for (const tooltip of tooltips) {
    assert.doesNotMatch(tooltip, /<a\b/i);
    assert.doesNotMatch(tooltip, /https?:\/\/|doi\.org/i);
  }
  assert.match(html, /data-return-target="ref-/);
  assert.match(html, /Kaynak metnin kaynakça bölümünde bu atıf için ayrı bir tam künye verilmemiştir/);
  assert.doesNotMatch(html, /Google Scholar/);
  assert.doesNotMatch(html, /Kaynak bağlantısı/);
  assert.match(html, /class="reference-inline-link"/);
  assert.match(html, /<details class="article-accordion article-citation-accordion" id="atif">/);
  assert.doesNotMatch(html, /Görüntülenme ve atıflar/);
  assert.doesNotMatch(html, /class="article-metrics"/);

  const doiArticle = await renderPath("/tr/makaleler/cinde-somut-olmayan-kulturel-mirasin-korunmasi-yirmi-yillik-deneyim-suregelen-zorluklar-ve-gelecege");
  const doiHtml = await doiArticle.text();
  assert.match(doiHtml, /href="https:\/\/doi\.org\/10\.[^"]+"/);
  assert.match(doiHtml, /https:\/\/doi\.org\/10\./);
  const styledCitationArticle = await renderPath("/tr/makaleler/uluslararasi-ticarette-dusuk-karbon-kurallarinda-ortaya-cikan-egilimler-ve-kusak-yol-girisimi");
  const styledCitationHtml = await styledCitationArticle.text();
  const citationBlock = styledCitationHtml.match(/<blockquote><p>([\s\S]*?)<\/p><\/blockquote>/)?.[1] || "";
  assert.match(citationBlock, /<em>/);
  assert.match(citationBlock, /class="reference-inline-link"/);
  assert.doesNotMatch(citationBlock, /style=/);
  assert.ok((doiHtml.match(/article-declaration-accordion/g) || []).length >= 1);
  assert.ok((doiHtml.match(/article-declaration-item/g) || []).length >= 4);
  const declarationOrder = ["Finansman", "Çıkar Çatışması", "Yazar Katkıları", "Veri Kullanılabilirliği"]
    .map((label) => doiHtml.indexOf(label));
  assert.ok(declarationOrder.every((position) => position >= 0));
  assert.deepEqual(declarationOrder, [...declarationOrder].sort((left, right) => left - right));
  assert.doesNotMatch(doiHtml, /Etik Onay ve Katılımcı Onamı/);
  assert.doesNotMatch(doiHtml, /Yapay Zekâ Kullanımı/);
});

test("renders only Çomak figures and tables inline while retaining all PDF media in the archive", async () => {
  const response = await renderPath("/en/articles/power-transition-and-geoeconomic-connectivity-in-eurasia-on-the-55th-anniversary-of-turkiye-china-diplomatic-relations");
  assert.equal(response.status, 200);
  const html = await response.text();

  // Full Text: only Figures and Tables.
  assert.match(html, /class="article-inline-media" id="inline-figure-1"><img src="[^"]*figure-01\.jpg"/);
  assert.match(html, /class="article-inline-table article-inline-table-image" id="table-1"><img src="[^"]*figure-03-en\.png"/);
  assert.match(html, /class="article-inline-table article-inline-table-image" id="table-2"><img src="[^"]*figure-04-en\.png"/);
  assert.match(html, /class="article-inline-media" id="inline-figure-5"><img src="[^"]*figure-05-en\.jpg"/);
  assert.doesNotMatch(html, /id="inline-figure-2"/);
  assert.doesNotMatch(html, /id="inline-figure-6"/);

  // PDF-aligned paragraph positions.
  const researchQuestion = html.indexOf("This article addresses the following question:");
  const contribution = html.indexOf("The study makes an original contribution at three levels.");
  const figureOne = html.indexOf('id="inline-figure-1"');
  assert.ok(researchQuestion >= 0 && figureOne > researchQuestion && contribution > figureOne);

  const codingParagraph = html.indexOf("During coding, the date, document type, institutional producer");
  const limitationsParagraph = html.indexOf("The method has two limitations.");
  const tableOne = html.indexOf('id="table-1"');
  assert.ok(codingParagraph >= 0 && tableOne > codingParagraph && limitationsParagraph > tableOne);

  const fdiParagraph = html.indexOf("Foreign direct investment data likewise reveal the gap between trade volume and production integration.");
  const bydParagraph = html.indexOf("The approximately USD 1 billion investment agreement signed with BYD");
  const tableTwo = html.indexOf('id="table-2"');
  assert.ok(fdiParagraph >= 0 && tableTwo > fdiParagraph && bydParagraph > tableTwo);

  const localValueParagraph = html.indexOf("Local value added and technology transfer should not be used interchangeably.");
  const figureFive = html.indexOf('id="inline-figure-5"');
  assert.ok(bydParagraph >= 0 && figureFive > bydParagraph && localValueParagraph > figureFive);

  // Archive: every body-media item from the official PDF, grouped Figures → Tables → Visuals.
  assert.match(html, /Visuals and tables/);
  const figureGroup = html.indexOf('data-kind="figure"');
  const tableGroup = html.indexOf('data-kind="table"');
  const visualGroup = html.indexOf('data-kind="visual"');
  const dialog = html.indexOf('class="figure-lightbox"');
  assert.ok(figureGroup >= 0 && tableGroup > figureGroup && visualGroup > tableGroup && dialog > visualGroup);

  const figuresHtml = html.slice(figureGroup, tableGroup);
  const tablesHtml = html.slice(tableGroup, visualGroup);
  const visualsHtml = html.slice(visualGroup, dialog);

  assert.equal((figuresHtml.match(/<figure/g) || []).length, 2);
  assert.equal((tablesHtml.match(/<figure/g) || []).length, 2);
  assert.equal((visualsHtml.match(/<figure/g) || []).length, 2);

  assert.match(figuresHtml, /figure-01\.jpg/);
  assert.match(figuresHtml, /figure-05-en\.jpg/);
  assert.doesNotMatch(figuresHtml, /figure-02\.jpg|figure-06\.jpg|figure-03-en\.png|figure-04-en\.png/);

  assert.match(tablesHtml, /figure-03-en\.png/);
  assert.match(tablesHtml, /figure-04-en\.png/);
  assert.doesNotMatch(tablesHtml, /figure-01\.jpg|figure-02\.jpg|figure-05-en\.jpg|figure-06\.jpg/);

  assert.match(visualsHtml, /figure-02\.jpg/);
  assert.match(visualsHtml, /figure-06\.jpg/);
  assert.doesNotMatch(visualsHtml, /figure-01\.jpg|figure-03-en\.png|figure-04-en\.png|figure-05-en\.jpg/);

  assert.match(html, /<b>Figure 1<\/b>The Middle Corridor connects China and Europe/);
  assert.match(html, /<b>Figure 2<\/b>Eurasian transport corridors:/);
  assert.match(html, /<b>Table 1<\/b>Indicators Used to Distinguish a Transit Country from a Joint Production Hub/);
  assert.match(html, /<b>Table 2<\/b>Indicator-Based Assessment of the Research Question/);
  assert.match(html, /<b>Visual 1<\/b>Turkish President Recep Tayyip Erdoğan met with Chinese President Xi Jinping/);
  assert.match(html, /<b>Visual 2<\/b>In Türkiye-China relations, the combination of economic reciprocity/);

  const prerenderedHtml = await readFile(
    new URL(
      "../dist/client/en/articles/power-transition-and-geoeconomic-connectivity-in-eurasia-on-the-55th-anniversary-of-turkiye-china-diplomatic-relations/index.html",
      import.meta.url,
    ),
    "utf8",
  );

  for (const id of ["inline-figure-1", "table-1", "table-2", "inline-figure-5"]) {
    assert.ok(prerenderedHtml.includes('id="' + id + '"'));
  }
  assert.ok(!prerenderedHtml.includes('id="inline-figure-2"'));
  assert.ok(!prerenderedHtml.includes('id="inline-figure-6"'));

  const prerenderFigureGroup = prerenderedHtml.indexOf('data-kind="figure"');
  const prerenderTableGroup = prerenderedHtml.indexOf('data-kind="table"');
  const prerenderVisualGroup = prerenderedHtml.indexOf('data-kind="visual"');
  const prerenderDialog = prerenderedHtml.indexOf('class="figure-lightbox"');
  assert.ok(prerenderFigureGroup >= 0 && prerenderTableGroup > prerenderFigureGroup && prerenderVisualGroup > prerenderTableGroup && prerenderDialog > prerenderVisualGroup);

  const prerenderFigures = prerenderedHtml.slice(prerenderFigureGroup, prerenderTableGroup);
  const prerenderTables = prerenderedHtml.slice(prerenderTableGroup, prerenderVisualGroup);
  const prerenderVisuals = prerenderedHtml.slice(prerenderVisualGroup, prerenderDialog);
  assert.equal((prerenderFigures.match(/<figure/g) || []).length, 2);
  assert.equal((prerenderTables.match(/<figure/g) || []).length, 2);
  assert.equal((prerenderVisuals.match(/<figure/g) || []).length, 2);
});

test("renders Turkish Çomak figures and tables inline while retaining all PDF media in the archive", async () => {
  const slug = "turkiye-cin-diplomatik-iliskilerinin-55-yilinda-avrasyada-guc-gecisi-ve-jeoekonomik-baglantisallik";
  const response = await renderPath(`/tr/makaleler/${slug}`);
  assert.equal(response.status, 200);
  const html = await response.text();

  // Tam Metin: yalnız Şekiller ve Tablolar.
  assert.match(html, /class="article-inline-media" id="inline-figure-1"><img src="[^"]*figure-01\.jpg"/);
  assert.match(html, /class="article-inline-table article-inline-table-image" id="table-1"><img src="[^"]*figure-03\.jpg"/);
  assert.match(html, /class="article-inline-table article-inline-table-image" id="table-2"><img src="[^"]*figure-04\.jpg"/);
  assert.match(html, /class="article-inline-media" id="inline-figure-5"><img src="[^"]*figure-05\.jpg"/);
  assert.doesNotMatch(html, /id="inline-figure-2"/);
  assert.doesNotMatch(html, /id="inline-figure-6"/);

  // Türkçe PDF akışına karşı paragraf konumları.
  const researchQuestion = html.indexOf("Bu makale şu soruya yanıt aramaktadır:");
  const contribution = html.indexOf("Çalışmanın özgün katkısı üç düzeydedir.");
  const figureOne = html.indexOf('id="inline-figure-1"');
  assert.ok(researchQuestion >= 0 && figureOne > researchQuestion && contribution > figureOne);

  const codingParagraph = html.indexOf("Kodlama sürecinde her belge için tarih, belge türü, kurumsal üretici");
  const limitationsParagraph = html.indexOf("Yöntemin iki sınırlılığı bulunmaktadır.");
  const tableOne = html.indexOf('id="table-1"');
  assert.ok(codingParagraph >= 0 && tableOne > codingParagraph && limitationsParagraph > tableOne);

  const fdiParagraph = html.indexOf("Doğrudan yatırım verileri de ticaret hacmi ile üretim entegrasyonu arasındaki farkı ortaya koymaktadır.");
  const bydParagraph = html.indexOf("BYD ile Temmuz 2024’te imzalanan yaklaşık 1 milyar dolarlık yatırım anlaşması");
  const tableTwo = html.indexOf('id="table-2"');
  assert.ok(fdiParagraph >= 0 && tableTwo > fdiParagraph && bydParagraph > tableTwo);

  const localValueParagraph = html.indexOf("Yerel katma değer ile teknoloji transferi birbirinin yerine kullanılmamalıdır.");
  const figureFive = html.indexOf('id="inline-figure-5"');
  assert.ok(bydParagraph >= 0 && figureFive > bydParagraph && localValueParagraph > figureFive);

  // Görsel ve tablolar: PDF'deki 6/6 medya, Şekiller → Tablolar → Görseller.
  assert.match(html, /Görsel ve tablolar/);
  const figureGroup = html.indexOf('data-kind="figure"');
  const tableGroup = html.indexOf('data-kind="table"');
  const visualGroup = html.indexOf('data-kind="visual"');
  const dialog = html.indexOf('class="figure-lightbox"');
  assert.ok(figureGroup >= 0 && tableGroup > figureGroup && visualGroup > tableGroup && dialog > visualGroup);

  const figuresHtml = html.slice(figureGroup, tableGroup);
  const tablesHtml = html.slice(tableGroup, visualGroup);
  const visualsHtml = html.slice(visualGroup, dialog);
  assert.equal((figuresHtml.match(/<figure/g) || []).length, 2);
  assert.equal((tablesHtml.match(/<figure/g) || []).length, 2);
  assert.equal((visualsHtml.match(/<figure/g) || []).length, 2);

  assert.match(figuresHtml, /figure-01\.jpg/);
  assert.match(figuresHtml, /figure-05\.jpg/);
  assert.match(tablesHtml, /figure-03\.jpg/);
  assert.match(tablesHtml, /figure-04\.jpg/);
  assert.match(visualsHtml, /figure-02\.jpg/);
  assert.match(visualsHtml, /figure-06\.jpg/);

  assert.match(html, /<b>Şekil 1<\/b>Orta Koridor’un Orta Asya ve Türkiye üzerinden Çin ile Avrupa arasındaki bağlantısı/);
  assert.match(html, /<b>Şekil 2<\/b>Avrasya ulaştırma koridorları:/);
  assert.match(html, /<b>Tablo 1<\/b>Transit ülke ile ortak üretim merkezi ayrımında kullanılan göstergeler/);
  assert.match(html, /<b>Tablo 2<\/b>Araştırma sorusuna ilişkin gösterge temelli değerlendirme/);
  assert.match(html, /<b>Görsel 1<\/b>Cumhurbaşkanı Recep Tayyip Erdoğan ve Çin Devlet Başkanı Xi Jinping/);
  assert.match(html, /<b>Görsel 2<\/b>Türkiye-Çin ilişkilerinde ekonomik karşılıklılık/);

  const prerenderedHtml = await readFile(
    new URL("../dist/client/tr/makaleler/" + slug + "/index.html", import.meta.url),
    "utf8",
  );
  for (const id of ["inline-figure-1", "table-1", "table-2", "inline-figure-5"]) {
    assert.ok(prerenderedHtml.includes('id="' + id + '"'));
  }
  assert.ok(!prerenderedHtml.includes('id="inline-figure-2"'));
  assert.ok(!prerenderedHtml.includes('id="inline-figure-6"'));

  const prerenderFigureGroup = prerenderedHtml.indexOf('data-kind="figure"');
  const prerenderTableGroup = prerenderedHtml.indexOf('data-kind="table"');
  const prerenderVisualGroup = prerenderedHtml.indexOf('data-kind="visual"');
  const prerenderDialog = prerenderedHtml.indexOf('class="figure-lightbox"');
  assert.ok(prerenderFigureGroup >= 0 && prerenderTableGroup > prerenderFigureGroup && prerenderVisualGroup > prerenderTableGroup && prerenderDialog > prerenderVisualGroup);

  assert.equal((prerenderedHtml.slice(prerenderFigureGroup, prerenderTableGroup).match(/<figure/g) || []).length, 2);
  assert.equal((prerenderedHtml.slice(prerenderTableGroup, prerenderVisualGroup).match(/<figure/g) || []).length, 2);
  assert.equal((prerenderedHtml.slice(prerenderVisualGroup, prerenderDialog).match(/<figure/g) || []).length, 2);
});

test("keeps Saudi Turkish media archive-only and renders Table 8 once", async () => {
  const slug = "suudi-arabistanin-abd-ile-cin-arasinda-cok-boyutlu-kulturel-dengeleme-stratejisi";
  const response = await renderPath(`/tr/makaleler/${slug}`);
  assert.equal(response.status, 200);
  const html = await response.text();

  // This article intentionally keeps all media out of Tam Metin.
  assert.doesNotMatch(html, /id="inline-figure-/);
  assert.doesNotMatch(html, /id="table-[1-8]"/);

  // Archive remains complete, but Table 8 is one logical/rendered table.
  assert.match(html, /Görsel ve tablolar/);
  const figureGroup = html.indexOf('data-kind="figure"');
  const tableGroup = html.indexOf('data-kind="table"');
  const visualGroup = html.indexOf('data-kind="visual"');
  const dialog = html.indexOf('class="figure-lightbox"');
  assert.ok(figureGroup >= 0 && tableGroup > figureGroup && visualGroup > tableGroup && dialog > visualGroup);

  const figuresHtml = html.slice(figureGroup, tableGroup);
  const tablesHtml = html.slice(tableGroup, visualGroup);
  const visualsHtml = html.slice(visualGroup, dialog);

  assert.equal((figuresHtml.match(/<figure/g) || []).length, 3);
  assert.equal((tablesHtml.match(/<figure/g) || []).length, 8);
  assert.equal((visualsHtml.match(/<figure/g) || []).length, 6);
  assert.match(html, /<summary><span>Görsel ve tablolar<\/span><b>17<\/b><\/summary>/);

  assert.equal(tablesHtml.split("<b>Tablo 8</b>").length - 1, 1);
  assert.match(tablesHtml, /table-08-combined\.svg/);
  assert.doesNotMatch(tablesHtml, /figure-17\.jpg|figure-18\.jpg/);
  assert.match(tablesHtml, /<b>Tablo 8<\/b>Birincil Veri Kaynakları ve Yöntemsel Notlar/);

  const prerenderedHtml = await readFile(
    new URL("../dist/client/tr/makaleler/" + slug + "/index.html", import.meta.url),
    "utf8",
  );
  assert.ok(!prerenderedHtml.includes('id="inline-figure-'));
  assert.doesNotMatch(prerenderedHtml, /id="table-[1-8]"/);

  const prerenderFigureGroup = prerenderedHtml.indexOf('data-kind="figure"');
  const prerenderTableGroup = prerenderedHtml.indexOf('data-kind="table"');
  const prerenderVisualGroup = prerenderedHtml.indexOf('data-kind="visual"');
  const prerenderDialog = prerenderedHtml.indexOf('class="figure-lightbox"');
  assert.ok(prerenderFigureGroup >= 0 && prerenderTableGroup > prerenderFigureGroup && prerenderVisualGroup > prerenderTableGroup && prerenderDialog > prerenderVisualGroup);

  const prerenderTables = prerenderedHtml.slice(prerenderTableGroup, prerenderVisualGroup);
  assert.equal((prerenderedHtml.slice(prerenderFigureGroup, prerenderTableGroup).match(/<figure/g) || []).length, 3);
  assert.equal((prerenderTables.match(/<figure/g) || []).length, 8);
  assert.equal((prerenderedHtml.slice(prerenderVisualGroup, prerenderDialog).match(/<figure/g) || []).length, 6);
  assert.equal(prerenderTables.split("<b>Tablo 8</b>").length - 1, 1);
  assert.match(prerenderTables, /table-08-combined\.svg/);
});

test("renders the Palestinianism article secondary headings as subsections in both locales", async () => {
  const slug = "filistinciligin-zirve-paradoksu-transatlantik-kamuoyu-stratejik-realizm-ve-iki-devletli-cozumun";
  const [trResponse, enResponse] = await Promise.all([
    renderPath(`/tr/makaleler/${slug}`),
    renderPath(`/en/articles/${englishArticleSlug(slug)}`),
  ]);
  assert.equal(trResponse.status, 200);
  assert.equal(enResponse.status, 200);
  const [trHtml, enHtml] = await Promise.all([trResponse.text(), enResponse.text()]);

  const trSubsections = [
    "Araştırma Tasarımı, Analitik Yaklaşım ve Kaynaklar",
    "Amerika’daki Seyir",
    "Avrupa’daki Seyir",
    "Kuşaksal ve Kurumsal Boyutlar",
    "On İki Gün Savaşı ve İran’ın Nükleer Altyapısının Vurulması",
    "Direniş Ekseni’nin Zayıflatılması",
    "İbrahim Anlaşmaları’nın Dayanıklılığı ve Sessizce Genişlemesi",
    "Suudi Arabistan-İsrail İlişkilerinin Seyri",
    "Trump Yönetimi ve Bölgesel Hegemonya Mimarisi",
  ];
  const enSubsections = [
    "Research Design, Analytical Approach, and Sources",
    "The American Trajectory",
    "The European Trajectory",
    "Generational and Institutional Dimensions",
    "The Twelve-Day War and the Striking of Iranian Nuclear Infrastructure",
    "The Degradation of the Axis of Resistance",
    "The Resilience and Quiet Expansion of the Abraham Accords",
    "The Saudi-Israeli Trajectory",
    "The Trump Administration and the Architecture of Regional Hegemony",
  ];

  for (const title of trSubsections) {
    assert.ok(trHtml.includes(`<h4>${title}</h4>`), `TR subsection: ${title}`);
    assert.ok(!trHtml.includes(`<h3>${title}</h3>`), `TR must not be main section: ${title}`);
  }
  for (const title of enSubsections) {
    assert.ok(enHtml.includes(`<h4>${title}</h4>`), `EN subsection: ${title}`);
    assert.ok(!enHtml.includes(`<h3>${title}</h3>`), `EN must not be main section: ${title}`);
  }

  for (const title of [
    "Transatlantik Siyasal-Retorik Bir Olgu Olarak Filistincilik",
    "Transatlantik Kamuoyundaki Dönüşüm",
    "Stratejik Realizm: ABD-Körfez-İsrail-İran Yakınlaşması",
    "İki Devletli Çözümün Sonu: JST Argümanının Geliştirilmesi",
    "Sonuç: Stratejik Ayrışma ve Batı İttifakının Geleceği",
  ]) {
    assert.ok(trHtml.includes(`<h3>${title}</h3>`), `TR main section preserved: ${title}`);
  }
  for (const title of [
    "Palestinianism as a Transatlantic Political-Rhetorical Phenomenon",
    "The Transatlantic Public Opinion Shift",
    "Strategic Realism: The U.S.–Gulf–Israel–Iran Convergence",
    "The End of the Two-State Solution: Extending the JST Argument",
    "Conclusion: Strategic Divergence and the Future of the Western Alliance",
  ]) {
    assert.ok(enHtml.includes(`<h3>${title}</h3>`), `EN main section preserved: ${title}`);
  }

  assert.match(trHtml, /class="article-inline-media" id="inline-figure-1"/);
  assert.match(trHtml, /Şekil 1/);
  assert.match(enHtml, /class="article-inline-media" id="inline-figure-1"/);
  assert.match(enHtml, /G1ZOhMoWEAAvhVl\.jpeg/);
  assert.match(enHtml, /Figure 1/);

  assert.match(trHtml, /id="inline-figure-3"/);
  assert.match(trHtml, /id="inline-figure-4"/);
  assert.match(trHtml, /Tablo 1/);
  assert.match(enHtml, /class="article-inline-table" id="table-1"/);
  assert.match(enHtml, /Survey \(source\)/);
  assert.match(enHtml, /Compiled by the author\./);
  assert.doesNotMatch(enHtml, /figure-03\.jpg|figure-04\.jpg/);

  const trIntroEnd = trHtml.indexOf("Makale beş bölümden oluşmaktadır.");
  const trFigureOne = trHtml.indexOf('id="inline-figure-1"');
  const trResearchDesign = trHtml.indexOf("<h4>Araştırma Tasarımı, Analitik Yaklaşım ve Kaynaklar</h4>");
  assert.ok(trIntroEnd >= 0 && trFigureOne > trIntroEnd && trResearchDesign > trFigureOne);

  const enIntroEnd = enHtml.indexOf("The article proceeds in five parts.");
  const enFigureOne = enHtml.indexOf('id="inline-figure-1"');
  const enResearchDesign = enHtml.indexOf("<h4>Research Design, Analytical Approach, and Sources</h4>");
  assert.ok(enIntroEnd >= 0 && enFigureOne > enIntroEnd && enResearchDesign > enFigureOne);

  const trTableLead = trHtml.indexOf("Tablo 1, bu bölümde yararlanılan başlıca anketleri");
  const trTableFirst = trHtml.indexOf('id="inline-figure-3"');
  const trTableSecond = trHtml.indexOf('id="inline-figure-4"');
  const trAmerican = trHtml.indexOf("<h4>Amerika’daki Seyir</h4>");
  assert.ok(trTableLead >= 0 && trTableFirst > trTableLead && trTableSecond > trTableFirst && trAmerican > trTableSecond);

  const enTableLead = enHtml.indexOf("Table 1 summarizes the principal surveys drawn upon in this section");
  const enTable = enHtml.indexOf('id="table-1"');
  const enAmerican = enHtml.indexOf("<h4>The American Trajectory</h4>");
  assert.ok(enTableLead >= 0 && enTable > enTableLead && enAmerican > enTable);

});

test("renders the Jordan article secondary headings as subsections in both locales", async () => {
  const slug = "dijital-ipek-yolu-cercevesinde-cin-arap-isbirligi-urdun-ornegi";
  const [trResponse, enResponse] = await Promise.all([
    renderPath(`/tr/makaleler/${slug}`),
    renderPath(`/en/articles/${englishArticleSlug(slug)}`),
  ]);
  assert.equal(trResponse.status, 200);
  assert.equal(enResponse.status, 200);
  const [trHtml, enHtml] = await Promise.all([trResponse.text(), enResponse.text()]);

  const trSubsections = [
    "Yöntem",
    "Dijital İpek Yolu Kavramının Gelişimi ve Küresel Bağlamı",
    "Ürdün’ün Dijital Dönüşüm Stratejisinin Aşamalı Olarak Güncellenmesi",
    "Ürdün’ün Ulusal Özellikleri ve Dijital Ortaklara Duyduğu İhtiyaç",
    "Çin-Ürdün Dijital İşbirliği Çerçevesinin Pekişmesi ve Kurumsallaşması",
    "Fırsatlar",
    "Zorluklar",
  ];
  const enSubsections = [
    "Methodology",
    "The Evolving Concept of the Digital Silk Road and Its Global Context",
    "The Iterative Upgrading of Jordan’s Digital Transformation Strategy",
    "Jordan’s National Characteristics and Demand for Digital Partners",
    "Consolidation and Institutionalization of the China-Jordan Digital Cooperation Framework",
    "Opportunities",
    "Challenges",
  ];

  for (const title of trSubsections) {
    assert.ok(trHtml.includes(`<h4>${title}</h4>`), `TR subsection: ${title}`);
    assert.ok(!trHtml.includes(`<h3>${title}</h3>`), `TR must not be main section: ${title}`);
  }
  for (const title of enSubsections) {
    assert.ok(enHtml.includes(`<h4>${title}</h4>`), `EN subsection: ${title}`);
    assert.ok(!enHtml.includes(`<h3>${title}</h3>`), `EN must not be main section: ${title}`);
  }

  for (const title of [
    "Dijital İpek Yolu Girişimi ve Çin-Ürdün İşbirliği",
    "Çinli Şirketlerin Ürdün’ün Dijital Yapılanmasına Katılımındaki Son Gelişmeler",
    "Fırsatlar ve Zorluklar",
    "Sonuç",
  ]) {
    assert.ok(trHtml.includes(`<h3>${title}</h3>`), `TR main section preserved: ${title}`);
  }
  for (const title of [
    "The Digital Silk Road Initiative and China-Jordan Cooperation",
    "Recent Developments in Chinese Enterprises’ Participation in Jordan’s Digital Construction",
    "Opportunities and Challenges",
    "Conclusion",
  ]) {
    assert.ok(enHtml.includes(`<h3>${title}</h3>`), `EN main section preserved: ${title}`);
  }
});

test("uses bilingual visual, footnote, and return-navigation labels", async () => {
  const slug = "kulturel-silinmeden-tarihsel-kurtarmaya-nishio-kanji-ve-amerikan-isgali-altindaki-japonyanin";
  const [trResponse, enResponse] = await Promise.all([
    renderPath(`/tr/makaleler/${slug}`),
    renderPath(`/en/articles/${englishArticleSlug(slug)}`),
  ]);
  const [trHtml, enHtml] = await Promise.all([trResponse.text(), enResponse.text()]);

  assert.match(trHtml, /Görsel ve tablolar/);
  assert.match(trHtml, /<b>Görsel 1<\/b>/);
  assert.match(trHtml, />Dipnotlar</);
  assert.doesNotMatch(trHtml, /Notlar ve dipnotlar/);
  assert.match(enHtml, /Visuals and tables/);
  assert.match(enHtml, /<b>Visual 1<\/b>/);
  assert.match(enHtml, />Footnotes</);
  assert.doesNotMatch(enHtml, /Notes and footnotes/);
  for (const html of [trHtml, enHtml]) assert.match(html, /class="[^\"]*back-to-top/);
});

test("keeps the refined article hierarchy, action order, and call deadline in parity", async () => {
  const slug = "kulturel-silinmeden-tarihsel-kurtarmaya-nishio-kanji-ve-amerikan-isgali-altindaki-japonyanin";
  const [trArticleResponse, enArticleResponse, trHomeResponse, enHomeResponse, trCallsResponse, enCallsResponse] = await Promise.all([
    renderPath(`/tr/makaleler/${slug}`),
    renderPath(`/en/articles/${englishArticleSlug(slug)}`),
    renderPath("/tr"),
    renderPath("/en"),
    renderPath("/tr/makale-cagrilari"),
    renderPath("/en/calls-for-papers"),
  ]);
  const [trArticle, enArticle, trHome, enHome, trCalls, enCalls] = await Promise.all([
    trArticleResponse.text(),
    enArticleResponse.text(),
    trHomeResponse.text(),
    enHomeResponse.text(),
    trCallsResponse.text(),
    enCallsResponse.text(),
  ]);

  assert.match(trArticle, /<h2>Öz<\/h2>/);
  assert.doesNotMatch(trArticle, /<h2>Özet<\/h2>/);
  assert.doesNotMatch(trArticle, /<p class="section-kicker">Öz<\/p>/);
  assert.equal((enArticle.match(/<h2>Abstract<\/h2>/g) || []).length, 1);
  assert.match(trArticle, /<section class="article-fulltext" id="tam-metin"><h2>Tam Metin<\/h2>/);
  assert.match(enArticle, /<section class="article-fulltext" id="full-text-body"><h2>Full Text<\/h2>/);
  assert.match(trArticle, /<details class="article-accordion article-figures article-figures-accordion" id="gorseller">/);
  assert.doesNotMatch(trArticle, /HTML tam metin/);
  assert.doesNotMatch(enArticle, /HTML full text/i);

  const actionOrder = ["Tam metin", "Sayıya git", "PDF’yi görüntüle", "PDF’yi indir"].map((label) => trArticle.indexOf(label));
  assert.ok(actionOrder.every((position) => position >= 0));
  assert.deepEqual(actionOrder, [...actionOrder].sort((left, right) => left - right));
  assert.match(trArticle, /class="article-issue-action"[^>]*background-color:#[0-9a-f]{6}/i);
  assert.ok((trArticle.match(/class="article-action-icon/g) || []).length >= 5);
  assert.doesNotMatch(trArticle, /class="open-access-badge"/);
  assert.doesNotMatch(enArticle, /class="open-access-badge"/);
  assert.match(trArticle, /class="citation-toolbox-heading"/);
  assert.match(trArticle, /class="citation-export-group"/);
  assert.match(trArticle, /class="article-disclosure-stack"/);
  assert.equal((trHome.match(/class="hero-slide /g) || []).length, 5);
  assert.equal((enHome.match(/class="hero-slide /g) || []).length, 5);
  assert.match(trHome, /Gelişen Dünyanın Fikir Platformu/);
  assert.match(enHome, /A Forum for the Developing World/);
  assert.match(trHome, /briq-logo-tr\.png/);
  assert.match(enHome, /briq-logo\.png/);
  assert.doesNotMatch(trHome, /Sayı gündemini incele/);
  assert.doesNotMatch(enHome, /Explore the issue focus/);
  assert.match(trHome, /Yayıncı: Çin İş Geliştirme ve Dostluk Derneği/);
  assert.match(enHome, /Publisher: Turkish-Chinese Business Development and Friendship Association/);

  assert.match(trHome, /10 Ekim/);
  assert.match(trHome, /1 Aralık/);
  assert.doesNotMatch(trHome, /1 Ekim 2026|15 Ağustos 2026/);
  assert.match(trCalls, /10 Ekim 2026/);
  assert.doesNotMatch(trCalls, /1 Ekim 2026|15 Ağustos 2026/);
  assert.match(enHome, /10 October/);
  assert.match(enHome, /1 December/);
  assert.doesNotMatch(enHome, /1 October 2026|15 August 2026/);
  assert.match(enCalls, /10 October 2026/);
  assert.doesNotMatch(enCalls, /1 October 2026|15 August 2026/);

  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /Article hierarchy, compact disclosures, and sitewide density refinement/);
  assert.match(css, /Refined scholarly controls: quiet rules, compact disclosure rows, and publisher-style citation tools/);
  assert.match(css, /\.article-disclosure-stack \.article-accordion[\s\S]*?border-bottom: 1px solid var\(--line\)/);
  assert.match(css, /\.article-platform-actions > div \{\s*min-height: 58px/);
  assert.doesNotMatch(css, /\.citation-toolbox button,\s*\.citation-toolbox a/);
});

test("orders author guidance as rules, review, ethics, and copyright in both languages", async () => {
  const [trHubResponse, trReviewResponse, trEthicsResponse, enHubResponse, enReviewResponse, enEthicsResponse] = await Promise.all([
    renderPath("/tr/yazarlar"),
    renderPath("/tr/yazarlar/yayin-degerlendirme-sureci"),
    renderPath("/tr/yazarlar/yayin-etigi"),
    renderPath("/en/for-authors"),
    renderPath("/en/for-authors/review-process"),
    renderPath("/en/for-authors/publication-ethics"),
  ]);
  const [trHub, trReview, trEthics, enHub, enReview, enEthics] = await Promise.all([
    trHubResponse.text(),
    trReviewResponse.text(),
    trEthicsResponse.text(),
    enHubResponse.text(),
    enReviewResponse.text(),
    enEthicsResponse.text(),
  ]);

  assert.ok(trHub.indexOf("Yayın Etiği") < trHub.indexOf("Telif Hakkı Şartları ve Lisans"));
  assert.ok(enHub.indexOf("Publication Ethics") < enHub.indexOf("Copyright Terms and Licence"));
  assert.match(trReview, /class="editorial-next-link" href="\/tr\/yazarlar\/yayin-etigi">Yayın Etiği/);
  assert.match(enReview, /class="editorial-next-link" href="\/en\/for-authors\/publication-ethics">Publication Ethics/);
  assert.match(trEthics, /class="editorial-next-link" href="\/tr\/yazarlar\/telif-hakki-sartlari-ve-lisans">Telif Hakkı Şartları ve Lisans/);
  assert.match(enEthics, /class="editorial-next-link" href="\/en\/for-authors\/copyright-and-licence">Copyright Terms and Licence/);
});

test("shows biographies and dated BRIQ appointments on staff profiles", async () => {
  const [trResponse, enResponse] = await Promise.all([
    renderPath("/tr/yazar/fikret-akfirat"),
    renderPath("/en/authors/fikret-akfirat"),
  ]);
  const [trHtml, enHtml] = await Promise.all([trResponse.text(), enResponse.text()]);

  assert.match(trHtml, /Kısa biyografi/);
  assert.match(trHtml, /Görevler ve dönemler/);
  assert.match(trHtml, /Genel Yayın Yönetmeni/);
  assert.match(trHtml, /2026–Günümüz/);
  assert.match(enHtml, /Short biography/);
  assert.match(enHtml, /Roles and terms/);
  assert.match(enHtml, /Editor-in-Chief/);
  assert.match(enHtml, /2026–Present/);
  assert.match(trHtml, />Google Scholar<\/span>/);
  assert.match(trHtml, /class="author-action-icon/);
});

test("groups all issues of each volume under one archive year without rewriting issue dates", async () => {
  const [trResponse, enResponse] = await Promise.all([renderPath("/tr/arsiv"), renderPath("/en/archive")]);
  const [trHtml, enHtml] = await Promise.all([trResponse.text(), enResponse.text()]);

  for (const html of [trHtml, enHtml]) {
    assert.equal((html.match(/class="archive-year-group"/g) || []).length, 7);
    assert.match(html, /class="archive-year-heading"><h2>2021<\/h2><span>4/);
  }
  assert.match(trHtml, /Kış[^<]*(?:<!-- -->[^<]*)*2020-2021/);
  assert.match(enHtml, /Winter[^<]*(?:<!-- -->[^<]*)*2020-2021/);
});

test("keeps current-issue identity values at the same type size as the other facts", async () => {
  const cssUrl = new URL("../app/globals.css", import.meta.url);
  const css = await readFile(cssUrl, "utf8");
  assert.match(css, /\.issue-identity-row dd\s*{[^}]*font-size:\s*16px;/s);
  assert.match(css, /\.issue-facts dd\s*{[^}]*font-size:\s*16px;/s);
});

test("shows the DOI prefix and official DergiPark wordmark in both home pages", async () => {
  const [trResponse, enResponse] = await Promise.all([renderPath("/tr"), renderPath("/en")]);
  const [trHtml, enHtml] = await Promise.all([trResponse.text(), enResponse.text()]);
  for (const html of [trHtml, enHtml]) {
    assert.match(html, /DOI 10\.67696/);
    assert.match(html, /\/assets\/dergipark-logo\.png/);
    assert.match(html, /class="header-search"/);
  }
  assert.match(trHtml, /Türkçe \/ İngilizce/);
});

test("ships a complete bilingual mobile layout without emoji-presented arrows", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const sourceFiles = [
    "../app/[...slug]/route.ts",
    "../app/en/[...slug]/page.tsx",
    "../app/page.tsx",
    "../app/tr/[...slug]/page.tsx",
    "../app/tr/page.tsx",
    "../app/en/page.tsx",
    "../app/components/ArticleExplorer.tsx",
    "../app/components/CallsExplorer.tsx",
    "../app/components/ContactForm.tsx",
    "../app/components/HomeHeroSlider.tsx",
    "../app/components/ImprintRoster.tsx",
    "../app/components/PdfViewer.tsx",
    "../app/components/SearchExplorer.tsx",
    "../app/components/SiteChrome.tsx",
  ];
  const sources = await Promise.all(
    sourceFiles.map((path) => readFile(new URL(path, import.meta.url), "utf8")),
  );

  assert.match(css, /Mobile experience final pass/);
  assert.doesNotMatch(css, /body\.mobile-menu-open/);
  assert.doesNotMatch(sources.join("\n"), /classList\.(?:add|remove|toggle)\("mobile-menu-open"/);
  assert.match(css, /\.main-nav\.is-open\s*{[^}]*touch-action:\s*pan-y/s);
  assert.match(css, /\.menu-button\.is-open span:first-child/);
  assert.match(css, /\.hero-slide \.hero-grid\s*{[^}]*min-height:\s*0\s*!important/s);
  assert.match(css, /\.pdf-reader-frame iframe[\s\S]*height:\s*66dvh/);
  assert.match(css, /@media \(max-width: 380px\)/);
  assert.doesNotMatch(sources.join("\n"), /[←→↓↑↗](?!︎)/u);

  const [trResponse, enResponse] = await Promise.all([renderPath("/tr"), renderPath("/en")]);
  const [trHtml, enHtml] = await Promise.all([trResponse.text(), enResponse.text()]);
  for (const html of [trHtml, enHtml]) {
    assert.match(html, /aria-controls="primary-navigation"/);
  }
});

test("preserves Volume 7 PDF hierarchy, metadata, and compact archive/PDF navigation", async () => {
  const currentFullText = JSON.parse(await readFile(new URL("../app/article-fulltext-current.json", import.meta.url), "utf8"));
  const localizedFullText = JSON.parse(await readFile(new URL("../app/article-fulltext-localized.json", import.meta.url), "utf8"));
  const fullTextFor = (slug) => localizedFullText[slug] || currentFullText[slug];
  const volumeSeven = archive.articles.filter((article) => article.volume === 7);
  assert.equal(volumeSeven.some((article) => /Hakemli Araştırma|Peer-reviewed Research/.test(`${article.publication_type_tr} ${article.publication_type_en}`)), false);

  const africa = volumeSeven.find((article) => article.slug === "afrikada-yabanci-guclerin-mudahaleleri-elestirel-bir-degerlendirme");
  const domestic = volumeSeven.find((article) => article.slug === "uluslararasi-kalkinma-isbirliginin-ic-siyasal-mantigi-guneydogu-asyada-kusak-ve-yol-girisiminin");
  assert.equal(africa.revised_date, "2025-12-30");
  assert.equal(domestic.revised_date, "2026-01-23");
  assert.ok(fullTextFor(africa.slug).tr.references.filter((reference) => reference.text.includes("(Erişim tarihi:")).length > 30);

  const lowCarbonSlug = "uluslararasi-ticarette-dusuk-karbon-kurallarinda-ortaya-cikan-egilimler-ve-kusak-yol-girisimi";
  const lowCarbon = fullTextFor(lowCarbonSlug).tr;
  const policy = lowCarbon.sections.find((section) => section.title === "Politika Önerileri");
  assert.equal(policy.toc, false);
  assert.match(policy.paragraphs.join(" "), /\*\*Bir KYG karbon muhasebesi sistemi oluşturulmalıdır\.\*\*/);
  assert.equal(lowCarbon.sections.some((section) => section.title.includes("oluştu-")), false);

  const [archiveResponse, pdfResponse] = await Promise.all([
    renderPath("/tr/arsiv"),
    renderPath(`/tr/makaleler/${lowCarbonSlug}/pdf`),
  ]);
  const [archiveHtml, pdfHtml] = await Promise.all([archiveResponse.text(), pdfResponse.text()]);
  assert.match(archiveHtml, /class="archive-page"/);
  assert.doesNotMatch(archiveHtml, /BRIQ’in ilk sayısından güncel sayıya/);
  assert.match(pdfHtml, /Tam Metne Geri Dön/);
  assert.match(pdfHtml, /Sayıya Dön/);
  assert.match(pdfHtml, /Cilt 7(?:<!-- -->)? · (?:<!-- -->)?Sayı 1/);

  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /\.call-detail-page \{[^}]*max-width:\s*1240px/s);
  assert.match(css, /\.call-detail-page \.reading-content \{[^}]*margin:\s*0;/s);
  assert.match(css, /\.article-body-section h4 \{[^}]*font-style:\s*italic;/s);

  const waterSlug = "iklim-degisikligi-baglaminda-su-kitligi-ve-kuresel-gida-krizi";
  const waterResponse = await renderPath(`/en/articles/${englishArticleSlug(waterSlug)}`);
  const waterHtml = await waterResponse.text();
  assert.match(waterHtml, /Concrete Solutions and Recommendations for the Climate-Water-Food Triple Crisis/);
  assert.doesNotMatch(waterHtml, /Concrete Solutions and Recommendations for the Triple Crisis of Climate, Water, and Food/);
});


test("renders linked season-coloured issue metadata and an always-visible DOI field on article pages", async () => {
  const doiSlug = "cin-abd-iliskilerinin-gelecegi";
  const noDoiSlug = "cinin-kuresel-altyapi-stratejisi";
  const responses = await Promise.all([
    renderPath(`/tr/makaleler/${doiSlug}`),
    renderPath(`/en/articles/${englishArticleSlug(doiSlug)}`),
    renderPath(`/tr/makaleler/${noDoiSlug}`),
    renderPath(`/en/articles/${englishArticleSlug(noDoiSlug)}`),
  ]);
  const [doiTr, doiEn, noDoiTr, noDoiEn] = await Promise.all(responses.map((response) => response.text()));

  const compactRecord = (html) => (html.match(/<div class="article-record-compact">([\s\S]*?)<\/div><div class="publication-record-group">/)?.[1] || "").replace(/<!-- -->/g, "");
  const [doiTrRecord, doiEnRecord, noDoiTrRecord, noDoiEnRecord] = [doiTr, doiEn, noDoiTr, noDoiEn].map(compactRecord);

  assert.match(doiTrRecord, /<span>Cilt \/ Sayı<\/span>/);
  assert.match(doiEnRecord, /<span>Volume \/ Issue<\/span>/);
  assert.match(doiTrRecord, /class="article-record-issue-link"[^>]*href="\/tr\/arsiv\/cilt-7-sayi-1"[^>]*style="[^"]*background-color:#1f6668[^"]*"[^>]*>7 \/ 1 \(Kış\)<\/a>/);
  assert.match(doiEnRecord, /class="article-record-issue-link"[^>]*href="\/en\/archive\/volume-7-issue-1"[^>]*style="[^"]*background-color:#1f6668[^"]*"[^>]*>7 \/ 1 \(Winter\)<\/a>/);
  assert.match(noDoiTrRecord, /class="article-record-issue-link"[^>]*href="\/tr\/guncel-sayi"[^>]*style="[^"]*background-color:#713349[^"]*"[^>]*>7 \/ 4 \(Sonbahar\)<\/a>/);
  assert.match(noDoiEnRecord, /class="article-record-issue-link"[^>]*href="\/en\/current-issue"[^>]*style="[^"]*background-color:#713349[^"]*"[^>]*>7 \/ 4 \(Autumn\)<\/a>/);

  for (const record of [doiTrRecord, doiEnRecord, noDoiTrRecord, noDoiEnRecord]) {
    assert.doesNotMatch(record, /<span>(?:Yayın|Published)<\/span>/);
    assert.match(record, /<span>DOI<\/span>/);
  }

  assert.match(doiTrRecord, /<span>DOI<\/span><b><a href="https:\/\/doi\.org\/10\.67696\/5y2r9u9d"/);
  assert.match(doiEnRecord, /<span>DOI<\/span><b><a href="https:\/\/doi\.org\/10\.67696\/5y2r9u9d"/);
  assert.match(noDoiTrRecord, /<span>DOI<\/span><b><\/b>/);
  assert.match(noDoiEnRecord, /<span>DOI<\/span><b><\/b>/);
});
