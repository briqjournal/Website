"use client";

import { useMemo, useState } from "react";
import type { ArchiveArticleListing } from "../archive-listing";
import { issueBadgeAccent } from "../issue-themes";

export function HomeArticleSearch({
  articles,
  locale = "tr",
}: {
  articles: ArchiveArticleListing[];
  locale?: "tr" | "en";
}) {
  const [query, setQuery] = useState("");
  const scholarlyArticles = useMemo(
    () => articles.filter((article) => article.typeEn === "Research Article"),
    [articles],
  );
  const visibleArticles = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(locale === "tr" ? "tr-TR" : "en-US");
    if (!normalized) return scholarlyArticles.slice(0, 10);
    return scholarlyArticles.filter((article) => {
      const title = locale === "tr" ? article.titleTr : article.titleEn;
      const type = locale === "tr" ? article.typeTr : article.typeEn;
      return `${title} ${article.author} ${type}`
        .toLocaleLowerCase(locale === "tr" ? "tr-TR" : "en-US")
        .includes(normalized);
    }).slice(0, 10);
  }, [scholarlyArticles, locale, query]);

  return (
    <>
      <div className="section-heading split-heading">
        <div>
          <p className="section-kicker">{locale === "tr" ? "Arşivden yeni yayınlar" : "Latest from the archive"}</p>
          <h2>{locale === "tr" ? "Son Makaleler" : "Latest Articles"}</h2>
        </div>
        <label className="article-search">
          <span className="sr-only">{locale === "tr" ? "Makalelerde ara" : "Search articles"}</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={locale === "tr" ? "Başlık veya yazar ara" : "Search title or author"}
          />
          <span aria-hidden="true">⌕</span>
        </label>
      </div>
      <div className="article-list">
        {visibleArticles.map((article) => (
          <a className="article-row" href={`${locale === "tr" ? "/tr/makaleler" : "/en/articles"}/${locale === "en" ? article.slugEn : article.slug}`} key={article.slug}>
            <span className="article-issue-cell">
              <span className="article-issue-badge" style={{ backgroundColor: issueBadgeAccent(article.volume, article.issue) }}>
                {locale === "tr" ? `Cilt ${article.volume} · Sayı ${article.issue}` : `Volume ${article.volume} · Issue ${article.issue}`}
              </span>
              <small>{locale === "tr" ? `${article.seasonTr} ${article.year}` : `${article.seasonEn} ${article.year}`}</small>
            </span>
            <span className="article-meta">
              <small>{locale === "tr" ? article.typeTr : article.typeEn}</small>
              <b>{article.author}</b>
            </span>
            <span className="article-title">
              {locale === "tr" ? article.titleTr : article.titleEn}
              {article.doi && <span className="article-doi">DOI: {article.doi}</span>}
            </span>
            <span className="article-arrow">↗︎</span>
          </a>
        ))}
        {visibleArticles.length === 0 && (
          <p className="empty-state">{locale === "tr" ? "Bu aramayla eşleşen içerik bulunamadı." : "No article matches this search."}</p>
        )}
      </div>
      <a className="underlined-link" href={locale === "tr" ? "/tr/makaleler" : "/en/articles"}>
        {locale === "tr" ? "Tüm makaleleri görüntüle" : "View all articles"} <span>→︎</span>
      </a>
    </>
  );
}
