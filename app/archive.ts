import archiveDataJson from "./archive-data.json";

export type ArchiveIssue = {
  volume: number;
  issue: number;
  season_tr: string;
  season_en: string;
  year: string;
  source_tr: string;
  source_en?: string | null;
  cover_tr: string;
  cover_en: string;
  pdf_tr_source?: string | null;
  pdf_en_source?: string | null;
  pdf_tr_local?: string;
  pdf_en_local?: string;
  articles: string[];
};

export type LocalizedStatementMetadata = {
  statement_tr?: string | null;
  statement_en?: string | null;
};

export type ArticleFundingMetadata = LocalizedStatementMetadata & {
  funders?: {
    name_tr?: string | null;
    name_en?: string | null;
    grant_or_project_number?: string | null;
  }[];
};

export type ArticleAuthorContributionsMetadata = LocalizedStatementMetadata & {
  credit_roles?: {
    role: string;
    authors: string[];
  }[];
};

export type ArticleEthicsMetadata = LocalizedStatementMetadata & {
  committee_name_tr?: string | null;
  committee_name_en?: string | null;
  approval_date?: string | null;
  decision_number?: string | null;
};

export type ArticleDataAvailabilityMetadata = LocalizedStatementMetadata & {
  repository_name?: string | null;
  data_doi?: string | null;
  url?: string | null;
};

export type ArchiveArticle = {
  slug: string;
  volume: number;
  issue: number;
  season_tr: string;
  season_en: string;
  year: string;
  author: string;
  title_tr: string;
  title_en?: string | null;
  abstract_tr?: string | null;
  abstract_en?: string | null;
  citation_tr?: string | null;
  citation_en?: string | null;
  pages?: string | null;
  doi?: string;
  orcids?: string[];
  received_date?: string | null;
  revised_date?: string | null;
  accepted_date?: string | null;
  published_online_date?: string | null;
  publication_type_tr?: string | null;
  publication_type_en?: string | null;
  source_tr: string;
  source_en?: string | null;
  pdf_tr_source?: string | null;
  pdf_en_source?: string | null;
  pdf_tr_local?: string;
  pdf_en_local?: string;
  shared_bilingual_pdf?: boolean;
  funding?: ArticleFundingMetadata;
  conflict_of_interest?: LocalizedStatementMetadata;
  author_contributions?: ArticleAuthorContributionsMetadata;
  ethics_approval_and_informed_consent?: ArticleEthicsMetadata;
  data_availability?: ArticleDataAvailabilityMetadata;
  ai_use_statement?: LocalizedStatementMetadata;
  acknowledgements?: LocalizedStatementMetadata;
};

type ArchiveData = {
  generated_from: string;
  issues: ArchiveIssue[];
  articles: ArchiveArticle[];
  pdf_archive?: {
    localized: boolean;
    unique_files: number;
    reports: Record<string, { tr: string; en: string }>;
  };
};

const archiveData = archiveDataJson as ArchiveData;

export const archiveIssues = archiveData.issues;
export const archiveArticles = archiveData.articles;

function routeSlug(value: string) {
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

const englishSlugBases = archiveArticles.map((article) =>
  article.title_en?.trim() ? routeSlug(article.title_en) : article.slug,
);
const englishSlugCounts = new Map<string, number>();
for (const slug of englishSlugBases) {
  englishSlugCounts.set(slug, (englishSlugCounts.get(slug) || 0) + 1);
}
const englishArticleSlugs = new Map(
  archiveArticles.map((article, index) => {
    const base = englishSlugBases[index] || article.slug;
    const slug = englishSlugCounts.get(base)! > 1
      ? `${base}-volume-${article.volume}-issue-${article.issue}`
      : base;
    return [article.slug, slug];
  }),
);

export function articleRouteSlug(record: ArchiveArticle, locale: "tr" | "en") {
  return locale === "en" ? (englishArticleSlugs.get(record.slug) || record.slug) : record.slug;
}

export function articlePdfFilename(record: ArchiveArticle, locale: "tr" | "en") {
  return `briq-${articleRouteSlug(record, locale)}-${locale}.pdf`;
}

const reportPdf = (number: number, locale: "tr" | "en") =>
  archiveData.pdf_archive?.reports?.[String(number)]?.[locale] ||
  `/assets/archive/pdfs/reports/briq-${number}-yil-raporu-${locale}.pdf`;

export const annualReports = [
  {
    number: 5,
    titleTr: "Beşinci Yıl Raporu",
    titleEn: "Fifth Annual Report",
    dateTr: "31 Aralık 2024",
    dateEn: "31 December 2024",
    pdfTrSource: "https://briqjournal.com/sites/default/files/yillik-raporlar/2025-03/BRIQBes%CC%A7inciY%C4%B1lRaporu.pdf",
    pdfEnSource: "https://briqjournal.com/sites/default/files/yillik-raporlar/2025-03/BRIQ5thAnnualReport.pdf",
    pdfTrLocal: reportPdf(5, "tr"),
    pdfEnLocal: reportPdf(5, "en"),
  },
  {
    number: 4,
    titleTr: "Dördüncü Yıl Raporu",
    titleEn: "Fourth Annual Report",
    dateTr: "1 Mart 2024",
    dateEn: "1 March 2024",
    pdfTrSource: "https://briqjournal.com/sites/default/files/yillik-raporlar/2024-03/BRIQ%204.%20Y%C4%B1l%20Raporu.pdf",
    pdfEnSource: "https://briqjournal.com/sites/default/files/yillik-raporlar/2024-03/BRIQ%204th%20Year%20Report.pdf",
    pdfTrLocal: reportPdf(4, "tr"),
    pdfEnLocal: reportPdf(4, "en"),
  },
  {
    number: 3,
    titleTr: "Üçüncü Yıl Raporu",
    titleEn: "Third Annual Report",
    dateTr: "10 Mart 2023",
    dateEn: "10 March 2023",
    pdfTrSource: "https://briqjournal.com/sites/default/files/yillik-raporlar/2023-03/BRIQ%203.Y%C4%B1l%20Raporu.pdf",
    pdfEnSource: "https://briqjournal.com/sites/default/files/yillik-raporlar/2023-03/BRIQ%20Third%20Year%20Report.pdf",
    pdfTrLocal: reportPdf(3, "tr"),
    pdfEnLocal: reportPdf(3, "en"),
  },
  {
    number: 2,
    titleTr: "İkinci Yıl Raporu",
    titleEn: "Second Annual Report",
    dateTr: "24 Ocak 2022",
    dateEn: "24 January 2022",
    pdfTrSource: "https://briqjournal.com/sites/default/files/yillik-raporlar/2023-03/BRIQ%20%C4%B0kinci%20Y%C4%B1l%20Rapor%20TR.pdf",
    pdfEnSource: "https://briqjournal.com/sites/default/files/yillik-raporlar/2023-03/BRIQ%20Second%20Year%20Report%20ENG.pdf",
    pdfTrLocal: reportPdf(2, "tr"),
    pdfEnLocal: reportPdf(2, "en"),
  },
  {
    number: 1,
    titleTr: "Birinci Yıl Raporu",
    titleEn: "First Annual Report",
    dateTr: "16 Kasım 2020",
    dateEn: "16 November 2020",
    pdfTrSource: "https://briqjournal.com/sites/default/files/yillik-raporlar/2023-03/briq-birinci-yil-raporu.pdf",
    pdfEnSource: "https://briqjournal.com/sites/default/files/yillik-raporlar/2023-03/briq-first-year-report.pdf",
    pdfTrLocal: reportPdf(1, "tr"),
    pdfEnLocal: reportPdf(1, "en"),
  },
] as const;

export function findArchiveIssue(volume: number, issue: number) {
  return archiveIssues.find(
    (record) => record.volume === volume && record.issue === issue,
  );
}

export function findArchiveArticle(slug: string) {
  return archiveArticles.find((record) => record.slug === slug);
}

export function findArticleByEnglishRouteSlug(slug: string) {
  return archiveArticles.find((record) => articleRouteSlug(record, "en") === slug)
    || findArchiveArticle(slug);
}

export const currentIssueArticleAliases: Record<string, string> = {
  "kulturel-silinmeden-tarihsel-kurtarmaya": "kulturel-silinmeden-tarihsel-kurtarmaya-nishio-kanji-ve-amerikan-isgali-altindaki-japonyanin",
  "turkiye-isvicre-kultur-varliklari-anlasmasi": "kultur-varliklarinin-yasadisi-ithalatinin-onlenmesi-ve-iadesine-iliskin-turkiye-ile-isvicre",
  "cinde-somut-olmayan-kulturel-mirasin-korunmasi": "cinde-somut-olmayan-kulturel-mirasin-korunmasi-yirmi-yillik-deneyim-suregelen-zorluklar-ve-gelecege",
  "anadolunun-kulturel-mirasini-koruma-sorumlulugu": "anadolunun-kulturel-mirasini-koruma-ve-gelecege-aktarma-sorumlulugu",
  "mogolistanin-ucuncu-komsu-diplomasisi": "mogolistanin-ucuncu-komsu-diplomasisinde-kurumsal-dengeleme-sanghay-isbirligi-orgutu-ile-etkilesim",
  "kusak-ve-yolun-guvenligi-kitap-incelemesi": "kusak-ve-yolun-guvenligi-ozel-guvenlik-risk-ve-cinin-kuresel-genislemesi",
};

export function findArticleByRouteSlug(slug: string) {
  return findArchiveArticle(currentIssueArticleAliases[slug] || slug)
    || findArticleByEnglishRouteSlug(slug);
}

export function publicationType(
  record: ArchiveArticle,
  locale: "tr" | "en",
) {
  const explicit = locale === "tr" ? record.publication_type_tr : record.publication_type_en;
  if (explicit?.trim()) return explicit;
  const text = [
    record.slug,
    record.title_tr,
    record.title_en,
    record.citation_tr,
    record.citation_en,
    record.abstract_tr,
    record.abstract_en,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("tr-TR");

  const label = (tr: string, en: string) => locale === "tr" ? tr : en;

  if (/kitap incelemesi|kitabının incelemesi|book review|review of|kusak-ve-yolun-guvenligi-ozel-guvenlik-risk-ve-cinin-kuresel-genislemesi/.test(text)) return label("Kitap İncelemesi", "Book Review");
  if (/röportaj|roportaj|interview|söyleşi/.test(text)) return label("Röportaj", "Interview");
  if (/(^|[^a-zçğıöşü])şiir([^a-zçğıöşü]|$)|(^|[^a-z])poem([^a-z]|$)/.test(text)) return label("Şiir", "Poem");
  if (/\[çeviri|translation|çeviren|çeviri:/.test(text)) return label("Çeviri", "Translation");
  if (/fotoğraf|photograph|karikatür|cartoon|\bafiş\b|poster|\bresim\b|tablosu|painting|visual contribution/.test(text)) return label("Görsel Katkı", "Visual Contribution");
  if (/editörden|editorial/.test(text)) return label("Editörden", "Editorial");
  return label("Araştırma Makalesi", "Research Article");
}

export function issuePdfUrl(
  record: ArchiveIssue,
  locale: "tr" | "en",
): string | null {
  const local = locale === "tr" ? record.pdf_tr_local : record.pdf_en_local;
  if (local) return local;
  const source = locale === "tr" ? record.pdf_tr_source : record.pdf_en_source;
  return source || null;
}

export function articlePdfUrl(
  record: ArchiveArticle,
  locale: "tr" | "en",
): string | null {
  if (locale === "tr") {
    if (record.pdf_tr_local) return record.pdf_tr_local;
    return record.pdf_tr_source
      ? `/dosyalar/makale/${record.slug}/tr.pdf`
      : null;
  }

  if (record.pdf_en_local) return record.pdf_en_local;
  if (record.shared_bilingual_pdf) {
    if (record.pdf_tr_local) return record.pdf_tr_local;
    return record.pdf_tr_source
      ? `/dosyalar/makale/${record.slug}/tr.pdf`
      : null;
  }
  return record.pdf_en_source
    ? `/dosyalar/makale/${record.slug}/en.pdf`
    : null;
}

export function issueLabel(record: ArchiveIssue, locale: "tr" | "en") {
  return locale === "tr"
    ? `Cilt ${record.volume} · Sayı ${record.issue} · ${record.season_tr} ${record.year}`
    : `Volume ${record.volume} · Issue ${record.issue} · ${record.season_en} ${record.year}`;
}
