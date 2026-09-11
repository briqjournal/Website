import type { ArchiveArticle } from "./archive";

function normalizedDoi(doi: string) {
  return doi.replace(/^https?:\/\/doi\.org\//i, "").trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function citationWithDoi(citation: string, doi?: string | null) {
  const base = citation.trim();
  if (!doi) return base;

  const cleanDoi = normalizedDoi(doi);
  if (!cleanDoi) return base;
  const url = `https://doi.org/${cleanDoi}`;
  const doiPattern = new RegExp(`(?:https?:\\/\\/doi\\.org\\/|doi\\s*:?\\s*)${escapeRegExp(cleanDoi)}`, "i");

  if (doiPattern.test(base)) {
    return base.replace(doiPattern, url).replace(new RegExp(`${escapeRegExp(url)}[.;,]$`), url);
  }
  return `${base} ${url}`;
}

export function articleCitation(article: ArchiveArticle, locale: "tr" | "en") {
  const stored = locale === "tr" ? article.citation_tr : article.citation_en;
  if (stored) return citationWithDoi(stored, article.doi);
  const title = locale === "tr" ? article.title_tr : (article.title_en || article.title_tr);
  const journal = locale === "tr" ? "BRIQ Kuşak ve Yol Girişimi Dergisi" : "BRIQ Belt & Road Initiative Quarterly";
  const pages = article.pages ? `, ${article.pages}` : "";
  return citationWithDoi(`${article.author} (${article.year}). ${title}. ${journal}, ${article.volume}(${article.issue})${pages}.`, article.doi);
}
