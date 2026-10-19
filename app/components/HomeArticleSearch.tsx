"use client";
import { canonicalPageHref } from "../seo-links";

import type { ArchiveArticleListing } from "../archive-listing";
import { issueBadgeAccent } from "../issue-themes";

export function HomeArticleSearch({
  articles,
  locale = "tr",
}: {
  articles: ArchiveArticleListing[];
  locale?: "tr" | "en";
}) {
  const visibleArticles = articles.filter((article) => article.typeEn === "Research Article").slice(0, 10);

  return (
    <>
      <div className="section-heading split-heading">
        <div>
          <p className="section-kicker">{locale === "tr" ? "Arşivden yeni yayınlar" : "Latest from the archive"}</p>
          <h2>{locale === "tr" ? "Son Makaleler" : "Latest Articles"}</h2>
        </div>
        <form className="article-search" role="search" method="get" action={canonicalPageHref(locale === "tr" ? "/tr/makaleler" : "/en/articles")}>
          <label className="sr-only" htmlFor="home-article-query">{locale === "tr" ? "Tüm makalelerde ara" : "Search all articles"}</label>
          <input
            id="home-article-query"
            name="q"
            placeholder={locale === "tr" ? "Başlık veya yazar ara" : "Search title or author"}
          />
          <button type="submit" aria-label={locale === "tr" ? "Makalelerde ara" : "Search articles"}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" /></svg></button>
        </form>
      </div>
      <div className="article-list">
        {visibleArticles.map((article) => (
          <a className="article-row" href={canonicalPageHref(`${locale === "tr" ? "/tr/makaleler" : "/en/articles"}/${locale === "en" ? article.slugEn : article.slug}`)} key={article.slug}>
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
      <a className="underlined-link" href={canonicalPageHref(locale === "tr" ? "/tr/makaleler" : "/en/articles")}>
        {locale === "tr" ? "Tüm makaleleri görüntüle" : "View all articles"} <span>→︎</span>
      </a>
    </>
  );
}
