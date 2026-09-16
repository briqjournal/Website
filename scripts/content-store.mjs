import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const safeSlug = /^[a-z0-9-]+$/;
const comakArticleSlug = "turkiye-cin-diplomatik-iliskilerinin-55-yilinda-avrasyada-guc-gecisi-ve-jeoekonomik-baglantisallik";
const comakMissingReference = {
  id: "ref-25a",
  text: "Tekdal, V. (2023). Özgün Ama Tanıdık: Piyasa Temelli Bir Olgu Olarak Çin’in Uluslararası Altyapı Yatırımları. Mülkiye Dergisi, 47(4), 1331-1353. https://doi.org/10.25064/mulkiye.1300476",
};

const keywordSpacingFixes = new Map([
  ["BeltandRoadInitiative", "Belt and Road Initiative"],
  ["GlobalSouth", "Global South"],
  ["internationaldevelopmentcooperation", "international development cooperation"],
  ["TürkiyeÇin ilişkileri", "Türkiye-Çin ilişkileri"],
  ["TürkiyeChina relations", "Türkiye-China relations"],
]);

export const bilingualKeywordParityOverrides = new Map([
  ["kulturel-silinmeden-tarihsel-kurtarmaya-nishio-kanji-ve-amerikan-isgali-altindaki-japonyanin", {
    source: "en",
    tr: ["Japonya’da Amerikan işgali", "funsho (yakılmış kitaplar)", "Genel Karargâh (GHQ)", "Nishio Kanji", "Müttefik Kuvvetler Yüksek Komutanlığı (SCAP)"],
    en: ["American Occupation of Japan", "funsho (burned books)", "General Headquarters (GHQ)", "Nishio Kanji", "Supreme Commander for the Allied Powers (SCAP)"],
  }],
  ["kultur-varliklarinin-yasadisi-ithalatinin-onlenmesi-ve-iadesine-iliskin-turkiye-ile-isvicre", {
    source: "tr",
    tr: ["asimetrik hükümler", "kültür varlıklarının iadesi", "kültür varlıklarının yasadışı ticareti", "Türkiye-İsviçre Anlaşması", "yasadışı ithalat"],
    en: ["asymmetrical provisions", "repatriation of cultural property", "illicit trade in cultural property", "Türkiye - Switzerland Agreement", "illicit import"],
  }],
  ["cinde-somut-olmayan-kulturel-mirasin-korunmasi-yirmi-yillik-deneyim-suregelen-zorluklar-ve-gelecege", {
    source: "en",
    tr: ["uyarlanabilir dönüşüm", "Kuşak ve Yol Girişimi", "Çin deneyimi", "kültürel yönetişim", "somut olmayan kültürel mirasın korunması"],
    en: ["adaptive transformation", "Belt and Road Initiative", "Chinese experience", "cultural governance", "intangible cultural heritage protection"],
  }],
  ["mogolistanin-ucuncu-komsu-diplomasisinde-kurumsal-dengeleme-sanghay-isbirligi-orgutu-ile-etkilesim", {
    source: "en",
    tr: ["risk dengeleme", "kaldıraç kullanımı", "Moğolistan", "Şanghay İşbirliği Örgütü", "Üçüncü Komşu Diplomasisi"],
    en: ["hedging", "leveraging", "Mongolia", "Shanghai Cooperation Organization", "Third Neighbor Diplomacy"],
  }],
  ["suudi-arabistanin-abd-ile-cin-arasinda-cok-boyutlu-kulturel-dengeleme-stratejisi", {
    source: "en",
    tr: ["Çin", "çok boyutlu kültürel dengeleme", "hedging stratejisi", "Suudi Arabistan", "ABD"],
    en: ["China", "complex cultural hedging", "hedging strategy", "Saudi Arabia", "US"],
  }],
  [comakArticleSlug, {
    source: "tr",
    tr: ["güç geçişi", "jeoekonomik bağlantısallık", "Kuşak ve Yol Girişimi", "Orta Koridor", "Türkiye-Çin ilişkileri"],
    en: ["power transition", "geoeconomic connectivity", "Belt and Road Initiative", "Middle Corridor", "Türkiye-China relations"],
  }],
  ["filistinciligin-zirve-paradoksu-transatlantik-kamuoyu-stratejik-realizm-ve-iki-devletli-cozumun", {
    source: "en",
    tr: ["İbrahim Anlaşmaları", "İran", "Filistincilik", "transatlantik ilişkiler", "iki devletli çözüm"],
    en: ["Abraham Accords", "Iran", "Palestinianism", "transatlantic relations", "two-state solution"],
  }],
  ["mao-zedungun-diyalektik-anlayisi-ekonomik-determinizm-elestirisi-siyasal-ozne-ve-cin-dusunce", {
    source: "tr",
    tr: ["diyalektik", "geleneksel Çin düşüncesi", "kitle çizgisi", "Mao Zedung", "Mao Zedung Düşüncesi", "siyasal özne"],
    en: ["dialectics", "traditional Chinese thought", "mass line", "Mao Zedong", "Mao Zedong Thought", "political subject"],
  }],
  ["sovyet-reformunun-tarihi-trajedisinden-bizi-kurtaran-ne-oldu-cinin-ekonomik-cagdaslasmasina-yon-0", {
    source: "en",
    tr: ["Çin’in çağdaşlaşması", "ortak refah", "piyasa ekonomisi", "Marksist ekonomi", "Çin’e özgü sosyalizm"],
    en: ["Chinese modernization", "common prosperity", "market economy", "Marxist economics", "socialism with Chinese characteristics"],
  }],
  ["cine-ozgu-sosyalist-politik-ekonomiye-genel-bakis", {
    source: "en",
    tr: ["Çin’de ekonomik reform", "Marksist politik ekonomi", "Çin’e özgü sosyalist politik ekonomi", "sosyalizmin inşası", "sosyalist piyasa ekonomisi"],
    en: ["economic reform in China", "Marxist political economy", "socialist political economy with Chinese characteristics", "socialist construction", "socialist market economy"],
  }],
  ["afrikada-yabanci-guclerin-mudahaleleri-elestirel-bir-degerlendirme", {
    source: "en",
    tr: ["Afrika’nın kalkınması", "sömürge dönemi mirası", "etnik çatışmalar", "yabancı müdahale", "sömürge sonrası devlet krizi"],
    en: ["Africa’s development", "colonial legacy", "ethnic conflicts", "foreign meddling", "post-colonial state crisis"],
  }],
  ["uluslararasi-kalkinma-isbirliginin-ic-siyasal-mantigi-guneydogu-asyada-kusak-ve-yol-girisiminin", {
    source: "en",
    tr: ["ASEAN", "Kuşak ve Yol Girişimi", "Küresel Güney", "uluslararası kalkınma işbirliği", "siyasallaşma"],
    en: ["ASEAN", "Belt and Road Initiative", "Global South", "international development cooperation", "politicization"],
  }],
  ["hitlerin-sovyetler-birligine-karsi-savasi-ayni-zamanda-abd-icin-bir-vekalet-savasiydi", {
    source: "en",
    tr: ["anti-komünizm", "Uluslararası Ödemeler Bankası (BIS)", "vekalet savaşı", "Nazi Almanyası", "ABD şirketleri"],
    en: ["anti-communism", "Bank for International Settlements (BIS)", "Proxy war", "Nazi Germany", "US corporations"],
  }],
  ["japonyadaki-abd-isgaline-karsi-sag-ve-sol-arasinda-olasi-ittifak", {
    source: "en",
    tr: ["dışlayıcılık", "Japonya Komünist Partisi", "Japonya'da sağ ve sol", "Sanseito Partisi", "ABD"],
    en: ["exclusionism", "Japanese Communist Party", "right wing and left wing in Japan", "Sanseito Party", "USA"],
  }],
  ["uluslararasi-ticarette-dusuk-karbon-kurallarinda-ortaya-cikan-egilimler-ve-kusak-yol-girisimi", {
    source: "en",
    tr: ["KYG", "uluslararası ticaret için karbon kuralları", "SKDM", "karbon etiketleme"],
    en: ["BRI", "carbon rules for international trade", "CBAM", "carbon labeling"],
  }],
  ["iklim-degisikligi-baglaminda-su-kitligi-ve-kuresel-gida-krizi", {
    source: "tr",
    tr: ["gıda güvencesi", "iklim akıllı tarım", "iklim değişikliği", "su güvenliği", "sürdürülebilir kalkınma"],
    en: ["food security", "climate-smart agriculture", "climate change", "water security", "sustainable development"],
  }],
  ["dunyanin-yeniden-duzenlenisi-bolgesel-bloklar-ve-cok-kutuplu-kuresel-yonetisimin-yukselisi", {
    source: "en",
    tr: ["Çin’in yükselişi", "küresel kurumlar", "Küresel Güney", "çok kutuplu yönetişim", "bölgesel bloklar", "post-hegemonik düzen"],
    en: ["China’s rise", "global institutions", "Global South", "multipolar governance", "regional blocs", "post-hegemonic order"],
  }],
  ["islami-sistem-ve-uluslararasi-iliskilerin-demokratiklesmesi-uzerine-bir-arastirma", {
    source: "en",
    tr: ["demokratikleşme", "uluslararası ilişkiler", "islami sistem", "anlaşma sistemi", "haraç sistemi"],
    en: ["democratization", "international relations", "islamic system", "treaty System", "tributary system"],
  }],
  ["rusyanin-bolgesel-guvenlikteki-rolu-uzerine-bir-inceleme-kolektif-guvenlik-antlasmasi-orgutu-ve", {
    source: "en",
    tr: ["Orta Asya güvenliği", "teröre karşı mücadele stratejileri", "KGAÖ", "İslami radikalizm", "Rusya’nın dış politikası", "ulusötesi cihatçı ağlar"],
    en: ["Central Asian security", "counterterrorism strategies", "CSTO", "Islamic radicalism", "Russia’s foreign policy", "transnational jihadist networks"],
  }],
]);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertSlug(slug, context) {
  assert(safeSlug.test(slug), `Unsafe article slug in ${context}: ${slug}`);
}

function assertUniqueIds(items, context) {
  const ids = items.map((item) => item?.id);
  assert(ids.every((id) => typeof id === "string" && id.trim()), `${context} items must define non-empty ids.`);
  assert(new Set(ids).size === ids.length, `Duplicate id in ${context}.`);
}

function validateFullTextCatalog(fulltext) {
  const collections = ["localized", "current", "en_archive"];
  const membership = new Map();

  for (const collection of collections) {
    const slugs = fulltext[collection] || [];
    assert(Array.isArray(slugs), `content/catalog.json fulltext.${collection} must be an array.`);
    assert(new Set(slugs).size === slugs.length, `Duplicate slug in fulltext.${collection}.`);
    for (const slug of slugs) {
      assertSlug(slug, `fulltext.${collection}`);
      assert(!membership.has(slug), `Full-text slug appears in both ${membership.get(slug)} and ${collection}: ${slug}`);
      membership.set(slug, collection);
    }
  }
}

function validateLocalizedStatementMetadata(value, context) {
  assert(value && typeof value === "object" && !Array.isArray(value), `${context} must be an object.`);
  for (const field of ["statement_en", "statement_tr"]) {
    if (value[field] !== undefined && value[field] !== null) {
      assert(typeof value[field] === "string" && value[field].trim(), `${context}.${field} must be a non-empty string.`);
    }
  }
}

function validateLocalizedArticleMetadata(article, slug) {
  assert(typeof article.publication_type_en === "string" && article.publication_type_en.trim(), `Localized metadata must define publication_type_en: ${slug}`);
  assert(typeof article.publication_type_tr === "string" && article.publication_type_tr.trim(), `Localized metadata must define publication_type_tr: ${slug}`);
  assert(typeof article.peer_reviewed === "boolean", `Localized metadata must define peer_reviewed: ${slug}`);
  assert(typeof article.scholarly === "boolean", `Localized metadata must define scholarly: ${slug}`);

  for (const field of ["conflict_of_interest", "author_contributions", "ethics_approval_and_informed_consent", "data_availability", "ai_use_statement", "acknowledgements"]) {
    if (article[field] !== undefined) validateLocalizedStatementMetadata(article[field], `${slug} metadata.${field}`);
  }

  if (article.funding !== undefined) {
    validateLocalizedStatementMetadata(article.funding, `${slug} metadata.funding`);
    if (article.funding.funders !== undefined) {
      assert(Array.isArray(article.funding.funders), `${slug} metadata.funding.funders must be an array.`);
      for (const [index, funder] of article.funding.funders.entries()) {
        assert(funder && typeof funder === "object" && !Array.isArray(funder), `${slug} metadata.funding.funders[${index}] must be an object.`);
        assert(
          (typeof funder.name_en === "string" && funder.name_en.trim()) ||
          (typeof funder.name_tr === "string" && funder.name_tr.trim()),
          `${slug} metadata.funding.funders[${index}] must define a localized name.`,
        );
        if (funder.grant_or_project_number !== undefined && funder.grant_or_project_number !== null) {
          assert(typeof funder.grant_or_project_number === "string" && funder.grant_or_project_number.trim(), `${slug} metadata.funding.funders[${index}].grant_or_project_number must be a non-empty string.`);
        }
      }
    }
  }
}

function validateLocalizedFullTextRecord(record, slug, locale) {
  const context = `${slug}/fulltext/${locale}.json`;
  assert(record && typeof record === "object" && !Array.isArray(record), `${context} must contain an object.`);

  for (const field of ["sections", "keywords", "footnotes", "references", "figures"]) {
    assert(Array.isArray(record[field]), `${context} must define a ${field} array.`);
  }
  assert(record.sections.length > 0, `${context} must contain at least one section.`);
  assert(record.keywords.every((keyword) => typeof keyword === "string" && keyword.trim()), `${context} keywords must be non-empty strings.`);

  assertUniqueIds(record.sections, `${context} sections`);
  for (const section of record.sections) {
    assert(typeof section.title === "string" && section.title.trim(), `${context} section ${section.id} must define a title.`);
    assert(Array.isArray(section.paragraphs), `${context} section ${section.id} must define paragraphs.`);
    assert(section.paragraphs.every((paragraph) => typeof paragraph === "string" && paragraph.trim()), `${context} section ${section.id} paragraphs must be non-empty strings.`);
  }

  assertUniqueIds(record.footnotes, `${context} footnotes`);
  assert(record.footnotes.every((item) => typeof item.text === "string" && item.text.trim()), `${context} footnotes must define text.`);
  assertUniqueIds(record.references, `${context} references`);
  assert(record.references.every((item) => typeof item.text === "string" && item.text.trim()), `${context} references must define text.`);
  assertUniqueIds(record.figures, `${context} figures`);
  assert(record.figures.every((item) =>
    typeof item.src === "string" && item.src.trim() &&
    typeof item.caption === "string" && item.caption.trim()
  ), `${context} figures must define src and caption.`);
}

function validateLocalizedPair(pair, slug) {
  for (const field of ["sections", "keywords", "footnotes", "references", "figures"]) {
    assert(
      pair.en[field].length === pair.tr[field].length,
      `Localized ${field} count mismatch for ${slug}: en=${pair.en[field].length}, tr=${pair.tr[field].length}`,
    );
  }
}

function titleCaseKeyword(value, locale) {
  const language = locale === "tr" ? "tr-TR" : "en-US";
  return value.trim().replace(/\p{L}[\p{L}\p{M}]*(?:['’]\p{L}[\p{L}\p{M}]*)?/gu, (word) => {
    const letters = word.replace(/[^\p{L}]/gu, "");
    if (letters.length > 1 && letters === letters.toLocaleUpperCase(language)) return word;
    const lower = word.toLocaleLowerCase(language);
    return lower.replace(/\p{L}/u, (letter) => letter.toLocaleUpperCase(language));
  });
}

function normalizeKeywordList(keywords, locale) {
  if (!Array.isArray(keywords)) return keywords;
  return keywords.map((keyword) => titleCaseKeyword(keywordSpacingFixes.get(keyword) || keyword, locale));
}

function normalizeFullTextKeywords(record, slug) {
  if (!record) return record;
  const parityOverride = bilingualKeywordParityOverrides.get(slug);
  if (record.tr && record.en && parityOverride) {
    record.tr.keywords = [...parityOverride.tr];
    record.en.keywords = [...parityOverride.en];
  }
  if (Array.isArray(record.keywords)) record.keywords = normalizeKeywordList(record.keywords, "en");
  if (record.tr) record.tr.keywords = normalizeKeywordList(record.tr.keywords, "tr");
  if (record.en) record.en.keywords = normalizeKeywordList(record.en.keywords, "en");
  return record;
}

function repairComakArticleFullText(record, slug) {
  if (slug !== comakArticleSlug || !record?.tr || !record?.en) return record;

  const repairHeading = (locale, prefix, continuation) => {
    const sections = record[locale]?.sections;
    if (!Array.isArray(sections)) return;
    const historical = sections.find((section) => section.id === `${locale}-section-4`);
    const connectivity = sections.find((section) => section.id === `${locale}-section-5`);
    if (historical?.paragraphs) {
      historical.paragraphs = historical.paragraphs.filter((paragraph) => paragraph.trim() !== prefix);
    }
    if (connectivity) connectivity.title = `${prefix} ${continuation}`;
  };

  repairHeading("tr", "Güç Geçişi ve Jeoekonomik Bağlantısallık:", "Kuşak ve Yol Girişimi ile Orta Koridor");
  repairHeading("en", "Power Transition and Geoeconomic Connectivity:", "The Belt and Road Initiative and the Middle Corridor");

  for (const locale of ["tr", "en"]) {
    const references = record[locale]?.references;
    if (!Array.isArray(references)) continue;
    if (!references.some((reference) => reference.text?.includes("10.25064/mulkiye.1300476"))) {
      const laterTekdal = references.findIndex((reference) => reference.text?.startsWith("Tekdal, V. (2024)"));
      const insertAt = laterTekdal >= 0 ? laterTekdal : references.length;
      references.splice(insertAt, 0, { ...comakMissingReference });
    }
  }

  return record;
}

export async function loadCatalog(root = process.cwd()) {
  const catalog = await readJson(join(root, "content/catalog.json"));
  assert(Array.isArray(catalog.issue_order), "content/catalog.json must define issue_order.");
  assert(Array.isArray(catalog.article_order), "content/catalog.json must define article_order.");
  assert(catalog.fulltext && typeof catalog.fulltext === "object", "content/catalog.json must define fulltext.");
  validateFullTextCatalog(catalog.fulltext);
  return catalog;
}

export async function buildArchiveData(root = process.cwd()) {
  const catalog = await loadCatalog(root);
  const issues = [];
  const issueKeys = new Set();
  const referencedArticles = [];
  const localizedSlugs = new Set(catalog.fulltext.localized || []);

  for (const file of catalog.issue_order) {
    assert(/^v\d{2}-i\d{2}\.json$/.test(file), `Unsafe issue filename: ${file}`);
    const issue = await readJson(join(root, "content/issues", file));
    const key = `${issue.volume}:${issue.issue}`;
    assert(!issueKeys.has(key), `Duplicate issue: ${key}`);
    issueKeys.add(key);
    assert(Array.isArray(issue.articles), `Issue ${key} must define articles.`);
    for (const slug of issue.articles) {
      assertSlug(slug, `issue ${key}`);
      referencedArticles.push(slug);
    }
    issues.push(issue);
  }

  const orderedSlugs = catalog.article_order;
  assert(new Set(orderedSlugs).size === orderedSlugs.length, "Duplicate slug in article_order.");
  assert(new Set(referencedArticles).size === referencedArticles.length, "An article is assigned to more than one issue.");
  assert(orderedSlugs.length === referencedArticles.length, "article_order and issue article lists differ in length.");
  assert(orderedSlugs.every((slug, index) => slug === referencedArticles[index]), "article_order must match issue article order exactly.");

  const articles = [];
  const dois = new Set();
  for (const slug of orderedSlugs) {
    assertSlug(slug, "article_order");
    const article = await readJson(join(root, "content/articles", slug, "metadata.json"));
    assert(article.slug === slug, `Metadata slug mismatch for ${slug}.`);
    assert(issueKeys.has(`${article.volume}:${article.issue}`), `Missing issue for ${slug}.`);
    if (localizedSlugs.has(slug)) validateLocalizedArticleMetadata(article, slug);
    if (article.doi) {
      assert(!dois.has(article.doi), `Duplicate DOI: ${article.doi}`);
      dois.add(article.doi);
    }
    articles.push(article);
  }

  const articleDirectories = (await readdir(join(root, "content/articles"), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const catalogDirectories = [...orderedSlugs].sort();
  assert(JSON.stringify(articleDirectories) === JSON.stringify(catalogDirectories), "Article directories and article_order differ.");

  return {
    generated_from: catalog.generated_from,
    issues,
    articles,
    pdf_archive: catalog.pdf_archive,
  };
}

async function readFullTextRecord(root, slug, file) {
  assertSlug(slug, file);
  const record = normalizeFullTextKeywords(await readJson(join(root, "content/articles", slug, "fulltext", file)), slug);
  return repairComakArticleFullText(record, slug);
}

async function readLocalizedFullText(root, slug, locale) {
  assertSlug(slug, `${locale}.json`);
  const record = await readJson(join(root, "content/articles", slug, "fulltext", `${locale}.json`));
  if (Array.isArray(record.keywords)) record.keywords = normalizeKeywordList(record.keywords, locale);
  validateLocalizedFullTextRecord(record, slug, locale);
  return record;
}

export async function loadFullTextCollections(root = process.cwd()) {
  const catalog = await loadCatalog(root);
  const localizedSlugs = catalog.fulltext.localized || [];
  const currentSlugs = catalog.fulltext.current || [];
  const archiveSlugs = catalog.fulltext.en_archive || [];
  assert(new Set(localizedSlugs).size === localizedSlugs.length, "Duplicate localized full-text slug.");
  assert(new Set(currentSlugs).size === currentSlugs.length, "Duplicate current full-text slug.");
  assert(new Set(archiveSlugs).size === archiveSlugs.length, "Duplicate English archive full-text slug.");
  const localized = {};
  for (const slug of localizedSlugs) {
    const pair = {
      en: await readLocalizedFullText(root, slug, "en"),
      tr: await readLocalizedFullText(root, slug, "tr"),
    };
    validateLocalizedPair(pair, slug);
    localized[slug] = pair;
  }
  const current = {};
  for (const slug of currentSlugs) current[slug] = await readFullTextRecord(root, slug, "current.json");
  const enArchive = {};
  for (const slug of archiveSlugs) enArchive[slug] = await readFullTextRecord(root, slug, "en-archive.json");
  return { localized, current, enArchive };
}