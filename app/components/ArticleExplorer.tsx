"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ArchiveArticleListing } from "../archive-listing";
import { issueBadgeAccent } from "../issue-themes";
import { useArticleSearchIndex } from "./useArticleSearchIndex";

const ACADEMIC_TYPES: Record<"tr" | "en", string[]> = {
  tr: ["Araştırma Makalesi", "Derleme Makalesi", "Kitap İncelemesi"],
  en: ["Research Article", "Review Article", "Review Essay", "Book Review"],
};

function expandYears(value: string): string[] {
  const match = value.match(/^\s*((?:19|20)\d{2})\s*[–—-]\s*((?:19|20)?\d{2})\s*$/);
  if (!match) return [value];
  const start = Number(match[1]);
  const end = match[2].length === 2 ? Number(match[1].slice(0, 2) + match[2]) : Number(match[2]);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return [value];
  const years: string[] = [];
  for (let year = start; year <= end; year += 1) years.push(String(year));
  return years;
}

function DirectoryPagination({
  page,
  pageCount,
  onPage,
  locale,
  position,
}: {
  page: number;
  pageCount: number;
  onPage: (page: number) => void;
  locale: "tr" | "en";
  position: "top" | "bottom";
}) {
  const clamp = (value: number) => Math.min(pageCount, Math.max(1, value));
  return (
    <nav className={`pagination pagination-${position}`} aria-label={locale === "en" ? "Search results pages" : "Arama sonuçları sayfaları"}>
      <button type="button" disabled={page === 1} onClick={() => onPage(page - 1)} aria-label={locale === "en" ? "Previous page" : "Önceki sayfa"}>←︎</button>
      <span>{page} / {pageCount}</span>
      <form
        className="page-jump"
        onSubmit={(event) => {
          event.preventDefault();
          const raw = new FormData(event.currentTarget).get("page");
          const target = typeof raw === "string" ? Number.parseInt(raw, 10) : NaN;
          if (Number.isFinite(target)) onPage(clamp(target));
        }}
      >
        <label>
          <span>{locale === "en" ? "Page" : "Sayfa"}</span>
          <input key={page} name="page" defaultValue={page} inputMode="numeric" pattern="[0-9]*" aria-label={locale === "en" ? "Go to page" : "Sayfaya git"} />
        </label>
        <button type="submit">{locale === "en" ? "Go" : "Git"}</button>
      </form>
      <button type="button" disabled={page === pageCount} onClick={() => onPage(page + 1)} aria-label={locale === "en" ? "Next page" : "Sonraki sayfa"}>→︎</button>
    </nav>
  );
}

export function ArticleExplorer({ articles, locale = "tr" }: { articles: ArchiveArticleListing[]; locale?: "tr" | "en" }) {
  const [query, setQuery] = useState("");
  const [year, setYear] = useState("all");
  const [volume, setVolume] = useState("all");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [typeOpen, setTypeOpen] = useState(false);
  const typeRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!typeOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (typeRef.current && !typeRef.current.contains(event.target as Node)) setTypeOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setTypeOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [typeOpen]);
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const years = [...new Set(articles.flatMap((item) => expandYears(item.year)))].sort().reverse();
  const volumes = [...new Set(articles.map((item) => item.volume))].sort((a, b) => b - a);
  const types = [...new Set(articles.map((item) => locale === "en" ? item.typeEn : item.typeTr).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, locale === "tr" ? "tr-TR" : "en-US"));
  const academicTypes = ACADEMIC_TYPES[locale].filter((item) => types.includes(item));
  const otherTypes = types.filter((item) => !ACADEMIC_TYPES[locale].includes(item));
  const normalized = query.trim().toLocaleLowerCase(locale === "tr" ? "tr-TR" : "en-US");
  const abstractIndex = useArticleSearchIndex(normalized.length >= 2);
  const filtered = useMemo(() => {
    return articles.filter((article) => {
      const text = `${article.titleTr} ${article.titleEn} ${article.author} ${article.doi} ${abstractIndex?.[article.slug] || ""}`.toLocaleLowerCase(locale === "tr" ? "tr-TR" : "en-US");
      const articleType = locale === "en" ? article.typeEn : article.typeTr;
      return (year === "all" || expandYears(article.year).includes(year))
        && (volume === "all" || article.volume === Number(volume))
        && (selectedTypes.length === 0 || selectedTypes.includes(articleType))
        && (!normalized || text.includes(normalized));
    });
  }, [abstractIndex, articles, locale, normalized, selectedTypes, volume, year]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const update = (setter: (value: string) => void, value: string) => { setter(value); setPage(1); };
  const toggleType = (value: string) => {
    setSelectedTypes((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
    setPage(1);
  };

  return (
    <>
      <div className="article-search-panel">
        <div><p className="section-kicker">{locale === "en" ? "Archive search" : "Arşiv araması"}</p><h2>{locale === "en" ? "Find a publication" : "Bir yayın bulun"}</h2></div>
        <label className="directory-search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => update(setQuery, event.target.value)} placeholder={locale === "en" ? "Title, author, abstract, or DOI" : "Başlık, yazar, özet veya DOI"} /></label>
        <div className="article-filter-row">
          <label><span>{locale === "en" ? "Year" : "Yıl"}</span><select value={year} onInput={(event) => update(setYear, event.currentTarget.value)} onChange={(event) => update(setYear, event.target.value)}><option value="all">{locale === "en" ? "All" : "Tümü"}</option>{years.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
          <label><span>{locale === "en" ? "Volume" : "Cilt"}</span><select value={volume} onInput={(event) => update(setVolume, event.currentTarget.value)} onChange={(event) => update(setVolume, event.target.value)}><option value="all">{locale === "en" ? "All" : "Tümü"}</option>{volumes.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
          <label><span>{locale === "en" ? "Per page" : "Sayfa başına"}</span><select value={pageSize} onInput={(event) => { setPageSize(Number(event.currentTarget.value)); setPage(1); }} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}><option>10</option><option>20</option><option>50</option></select></label>
          <div className="type-dropwrap" ref={typeRef}>
            <span className="type-drop-label">{locale === "en" ? "Category" : "Kategori"}</span>
            <button type="button" className="type-dropbtn" aria-expanded={typeOpen} aria-haspopup="true" onClick={() => setTypeOpen((open) => !open)}>
              <span>{locale === "en" ? "Categories" : "Kategoriler"}{selectedTypes.length > 0 && <b>{selectedTypes.length}</b>}</span>
              <span aria-hidden="true">▾</span>
            </button>
            {typeOpen && (
              <div className="type-drop" role="group" aria-label={locale === "en" ? "Publication categories" : "Yayın kategorileri"}>
                <div className="type-group">
                  {academicTypes.map((item) => (
                    <label className="type-opt" key={item}><input type="checkbox" checked={selectedTypes.includes(item)} onChange={() => toggleType(item)} /><span className="type-box" aria-hidden="true">✓</span>{item}</label>
                  ))}
                </div>
                {academicTypes.length > 0 && otherTypes.length > 0 && <hr />}
                <div className="type-group">
                  {otherTypes.map((item) => (
                    <label className="type-opt" key={item}><input type="checkbox" checked={selectedTypes.includes(item)} onChange={() => toggleType(item)} /><span className="type-box" aria-hidden="true">✓</span>{item}</label>
                  ))}
                </div>
                {selectedTypes.length > 0 && (
                  <button type="button" className="type-clear" onClick={() => { setSelectedTypes([]); setPage(1); }}>
                    {locale === "en" ? "Clear selection" : "Seçimi temizle"}
                  </button>
                )}
              </div>
            )}
          </div>
          <strong>{filtered.length} {locale === "en" ? "results" : "sonuç"}</strong>
        </div>
      </div>
      {pageCount > 1 && <DirectoryPagination page={currentPage} pageCount={pageCount} onPage={setPage} locale={locale} position="top" />}
      <div className="article-directory">
        {visible.map((article, index) => <a href={`${locale === "en" ? "/en/articles" : "/tr/makaleler"}/${locale === "en" ? article.slugEn : article.slug}`} key={`${article.volume}-${article.issue}-${article.slug}`}><span className="article-number">{String((currentPage - 1) * pageSize + index + 1).padStart(2, "0")}</span><div className="article-directory-meta"><small title={locale === "en" ? "Publication type" : "Yayın türü"}>{locale === "en" ? article.typeEn : article.typeTr}</small><span className="article-issue-badge" style={{ backgroundColor: issueBadgeAccent(article.volume, article.issue) }}>{locale === "en" ? `Volume ${article.volume} · Issue ${article.issue}` : `Cilt ${article.volume} · Sayı ${article.issue}`}</span></div><div><h2>{locale === "en" ? article.titleEn : article.titleTr}</h2><p>{article.author}</p>{article.doi && <span className="article-doi">DOI: {article.doi}</span>}</div><b>↗︎</b></a>)}
      </div>
      {visible.length === 0 && <p className="empty-state">{locale === "en" ? "No publication matches these filters." : "Bu filtrelerle eşleşen yayın bulunamadı."}</p>}
      {pageCount > 1 && <DirectoryPagination page={currentPage} pageCount={pageCount} onPage={setPage} locale={locale} position="bottom" />}
    </>
  );
}
