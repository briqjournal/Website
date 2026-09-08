"use client";

import { useMemo, useState } from "react";
import { publicationType, type ArchiveArticle } from "../archive";
import { issueBadgeAccent } from "../issue-themes";

export function ArticleExplorer({ articles, locale = "tr" }: { articles: ArchiveArticle[]; locale?: "tr" | "en" }) {
  const [query, setQuery] = useState("");
  const [year, setYear] = useState("all");
  const [volume, setVolume] = useState("all");
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const years = [...new Set(articles.map((item) => item.year))].sort().reverse();
  const volumes = [...new Set(articles.map((item) => item.volume))].sort((a, b) => b - a);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(locale === "tr" ? "tr" : "en");
    return articles.filter((article) => {
      const text = `${article.title_tr} ${article.title_en || ""} ${article.author} ${article.abstract_tr || ""} ${article.abstract_en || ""} ${article.doi || ""}`.toLocaleLowerCase(locale === "tr" ? "tr" : "en");
      return (year === "all" || article.year === year) && (volume === "all" || article.volume === Number(volume)) && (!normalized || text.includes(normalized));
    });
  }, [articles, locale, query, volume, year]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const update = (setter: (value: string) => void, value: string) => { setter(value); setPage(1); };

  return (
    <>
      <div className="article-search-panel">
        <div><p className="section-kicker">{locale === "en" ? "Archive search" : "Arşiv araması"}</p><h2>{locale === "en" ? "Find a publication" : "Bir yayın bulun"}</h2></div>
        <label className="directory-search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => update(setQuery, event.target.value)} placeholder={locale === "en" ? "Title, author, abstract, or DOI" : "Başlık, yazar, özet veya DOI"} /></label>
        <div className="article-filter-row">
          <label><span>{locale === "en" ? "Year" : "Yıl"}</span><select value={year} onInput={(event) => update(setYear, event.currentTarget.value)} onChange={(event) => update(setYear, event.target.value)}><option value="all">{locale === "en" ? "All" : "Tümü"}</option>{years.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>{locale === "en" ? "Volume" : "Cilt"}</span><select value={volume} onInput={(event) => update(setVolume, event.currentTarget.value)} onChange={(event) => update(setVolume, event.target.value)}><option value="all">{locale === "en" ? "All" : "Tümü"}</option>{volumes.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
          <label><span>{locale === "en" ? "Per page" : "Sayfa başına"}</span><select value={pageSize} onInput={(event) => { setPageSize(Number(event.currentTarget.value)); setPage(1); }} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}><option>10</option><option>20</option><option>50</option></select></label>
          <strong>{filtered.length} {locale === "en" ? "results" : "sonuç"}</strong>
        </div>
      </div>
      <div className="article-directory">
        {visible.map((article, index) => <a href={`${locale === "en" ? "/en/articles" : "/makaleler"}/${article.slug}`} key={`${article.volume}-${article.issue}-${article.slug}`}><span className="article-number">{String((currentPage - 1) * pageSize + index + 1).padStart(2, "0")}</span><div className="article-directory-meta"><small title={locale === "en" ? "Publication type" : "Yayın türü"}>{publicationType(article, locale)}</small><span className="article-issue-badge" style={{ backgroundColor: issueBadgeAccent(article.volume, article.issue) }}>{locale === "en" ? `Volume ${article.volume} · Issue ${article.issue}` : `Cilt ${article.volume} · Sayı ${article.issue}`}</span></div><div><h2>{locale === "en" ? (article.title_en || article.title_tr) : article.title_tr}</h2><p>{article.author}</p></div><b>↗︎</b></a>)}
      </div>
      {visible.length === 0 && <p className="empty-state">{locale === "en" ? "No publication matches these filters." : "Bu filtrelerle eşleşen yayın bulunamadı."}</p>}
      {pageCount > 1 && <nav className="pagination" aria-label={locale === "en" ? "Search results pages" : "Arama sonuçları sayfaları"}><button type="button" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>←︎</button><span>{currentPage} / {pageCount}</span><button type="button" disabled={currentPage === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>→︎</button></nav>}
    </>
  );
}
