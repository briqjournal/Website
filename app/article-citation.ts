import type { ArchiveArticle } from "./archive";

export function articleCitation(article: ArchiveArticle, locale: "tr" | "en") {
  const stored = locale === "tr" ? article.citation_tr : article.citation_en;
  if (stored) return stored;
  const title = locale === "tr" ? article.title_tr : (article.title_en || article.title_tr);
  const journal = locale === "tr" ? "BRIQ Kuşak ve Yol Girişimi Dergisi" : "BRIQ Belt & Road Initiative Quarterly";
  const pages = article.pages ? `, ${article.pages}` : "";
  return `${article.author} (${article.year}). ${title}. ${journal}, ${article.volume}(${article.issue})${pages}.`;
}

