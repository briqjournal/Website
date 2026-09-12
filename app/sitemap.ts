import type { MetadataRoute } from "next";
import { annualReports, archiveArticles, archiveIssues, articleRouteSlug } from "./archive";
import { SITE_URL } from "./site-url";
import { authorProfiles } from "./authors";
import { calls, pastCalls } from "./site-data";

const base = SITE_URL;

const trStatic = [
  "tr", "tr/dergi", "tr/dergi/briq-hakkinda", "tr/dergi/yayin-ilkeleri",
  "tr/dergi/yayin-kurulu", "tr/dergi/danisma-kurulu",
  "tr/dergi/endeksler", "tr/iletisim", "tr/arama", "tr/yazarlar", "tr/yazarlar/yazim-kurallari",
  "tr/yazarlar/yayin-degerlendirme-sureci", "tr/yazarlar/telif-hakki-sartlari-ve-lisans", "tr/yazarlar/yayin-etigi",
  "tr/guncel-sayi", "tr/arsiv", "tr/makaleler", "tr/makale-cagrilari", "tr/yillik-raporlar",
];

const enStatic = [
  "en", "en/journal", "en/journal/about-briq", "en/journal/publication-principles",
  "en/journal/publication-board", "en/journal/advisory-board",
  "en/journal/indexes", "en/contact", "en/search", "en/for-authors", "en/for-authors/guidelines",
  "en/for-authors/review-process", "en/for-authors/copyright-and-licence", "en/for-authors/publication-ethics", "en/current-issue",
  "en/archive", "en/articles", "en/calls-for-papers", "en/annual-reports",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = new Set<string>([...trStatic, ...enStatic]);
  for (const issue of archiveIssues) {
    paths.add(`tr/arsiv/cilt-${issue.volume}-sayi-${issue.issue}`);
    paths.add(`en/archive/volume-${issue.volume}-issue-${issue.issue}`);
  }
  for (const article of archiveArticles) {
    paths.add(`tr/makaleler/${article.slug}`);
    paths.add(`en/articles/${articleRouteSlug(article, "en")}`);
  }
  for (const author of authorProfiles) {
    paths.add(`tr/yazar/${author.id}`);
    paths.add(`en/authors/${author.id}`);
  }
  for (const report of annualReports) {
    paths.add(`tr/yillik-raporlar/${report.number}`);
    paths.add(`en/annual-reports/${report.number}`);
  }
  for (const call of calls) {
    paths.add(call.url.replace(/^\//, ""));
    paths.add(call.urlEn.replace(/^\//, ""));
  }
  for (const call of pastCalls) {
    paths.add(`tr/makale-cagrilari/${call.slug}`);
    paths.add(`en/calls-for-papers/${call.slug}`);
  }
  return [...paths].map((path) => ({
    url: path ? `${base}/${path}` : base,
    changeFrequency: path.includes("makaleler/") || path.includes("articles/") ? "yearly" : "monthly",
    priority: path === "tr" || path === "en" ? 1 : 0.7,
  }));
}
