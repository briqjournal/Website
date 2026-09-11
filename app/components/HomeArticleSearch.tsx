"use client";

import { useMemo, useState } from "react";
import type { ArchiveArticleListing } from "../archive-listing";

export function HomeArticleSearch({
  articles,
  locale = "tr",
}: {
  articles: ArchiveArticleListing[];
  locale?: "tr" | "en";
}) {
  const [query, setQuery] = useState("");
  const visibleArticles = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(locale === "tr" ? "tr-TR" : "en-US");
    if (!normalized) return articles.slice(0, 5);
    return articles.filter((article) => {
      const title = locale === "tr" ? article.titleTr : article.titleEn;
      const type = locale === "tr" ? article.typeTr : article.typeEn;
      return `${title} ${article.author} ${type}`
        .toLocaleLowerCase(locale === "tr" ? "tr-TR" : "en-US")
        .includes(normalized);
    }).slice(0, 6);
  }, [articles, locale, query]);

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
        {visibleArticles.map((article, index) => (
          <a className="article-row" href={`${locale === "tr" ? "/makaleler" : "/en/articles"}/${article.slug}`} key={article.slug}>
            <span className="article-number">{String(index + 1).padStart(2, "0")}</span>
            <span className="article-meta">
              <small>{locale === "tr" ? article.typeTr : article.typeEn}</small>
              <b>{article.author}</b>
            </span>
            <span className="article-title">{locale === "tr" ? article.titleTr : article.titleEn}</span>
            <span className="article-arrow">↗︎</span>
          </a>
        ))}
        {visibleArticles.length === 0 && (
          <p className="empty-state">{locale === "tr" ? "Bu aramayla eşleşen içerik bulunamadı." : "No article matches this search."}</p>
        )}
      </div>
      <a className="underlined-link" href={locale === "tr" ? "/makaleler" : "/en/articles"}>
        {locale === "tr" ? "Tüm makaleleri görüntüle" : "View all articles"} <span>→︎</span>
      </a>
    </>
  );
}

