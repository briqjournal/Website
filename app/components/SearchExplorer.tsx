"use client";

import { useMemo, useState } from "react";
import type { ArchiveArticle, ArchiveIssue } from "../archive";
import { issueTheme } from "../issue-themes";

type Call = {
  title: string;
  titleEn?: string;
  deadline: string;
  deadlineEn?: string;
  slug?: string;
  url?: string;
  urlEn?: string;
};

export function SearchExplorer({ articles, issues, calls, locale = "tr" }: { articles: ArchiveArticle[]; issues: ArchiveIssue[]; calls: Call[]; locale?: "tr" | "en" }) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const records = useMemo(() => {
    const articleRecords = articles.map((item) => ({ kind: "article", title: locale === "en" ? (item.title_en || item.title_tr) : item.title_tr, meta: `${item.author} · ${locale === "en" ? `Volume ${item.volume}, Issue ${item.issue}` : `Cilt ${item.volume}, Sayı ${item.issue}`}`, text: `${item.abstract_tr || ""} ${item.abstract_en || ""} ${item.doi || ""}`, href: `${locale === "en" ? "/en/articles" : "/makaleler"}/${item.slug}` }));
    const issueRecords = issues.map((item) => ({ kind: "issue", title: issueTheme(item.volume, item.issue, locale), meta: locale === "en" ? `Volume ${item.volume} · Issue ${item.issue} · ${item.year}` : `Cilt ${item.volume} · Sayı ${item.issue} · ${item.year}`, text: `${item.season_tr} ${item.season_en}`, href: locale === "en" ? `/en/archive/volume-${item.volume}-issue-${item.issue}` : `/arsiv/cilt-${item.volume}-sayi-${item.issue}` }));
    const callRecords = calls.map((item) => ({
      kind: "call",
      title: locale === "en" ? (item.titleEn || item.title) : item.title,
      meta: `${locale === "en" ? "Deadline" : "Son tarih"}: ${locale === "en" ? (item.deadlineEn || item.deadline) : item.deadline}`,
      text: "",
      href: locale === "en" ? (item.urlEn || `/en/calls-for-papers/${item.slug || ""}`) : (item.url || `/makale-cagrilari/${item.slug}`),
    }));
    return [...articleRecords, ...issueRecords, ...callRecords];
  }, [articles, calls, issues, locale]);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(locale === "tr" ? "tr" : "en");
    if (normalized.length < 2) return [];
    return records.filter((item) => (kind === "all" || item.kind === kind) && `${item.title} ${item.meta} ${item.text}`.toLocaleLowerCase(locale === "tr" ? "tr" : "en").includes(normalized)).slice(0, 80);
  }, [kind, locale, query, records]);
  const labels = locale === "en" ? { all: "All", article: "Articles", issue: "Issues", call: "Calls" } : { all: "Tümü", article: "Makaleler", issue: "Sayılar", call: "Çağrılar" };
  return <div className="site-search-page"><div className="site-search-box"><span aria-hidden="true">⌕</span><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder={locale === "en" ? "Search title, author, keyword, or DOI" : "Başlık, yazar, anahtar kelime veya DOI ara"} /></div><div className="search-kind-tabs">{Object.entries(labels).map(([value, label]) => <button type="button" className={kind === value ? "is-active" : ""} onClick={() => setKind(value)} key={value}>{label}</button>)}</div>{query.trim().length < 2 ? <p className="search-prompt">{locale === "en" ? "Enter at least two characters to search the BRIQ archive." : "BRIQ arşivinde aramak için en az iki karakter yazın."}</p> : <><p className="search-summary">{filtered.length} {locale === "en" ? "results shown" : "sonuç gösteriliyor"}</p><div className="search-results">{filtered.map((item, index) => <a href={item.href} key={`${item.kind}-${index}-${item.title}`}><span>{labels[item.kind as keyof typeof labels]}</span><div><h2>{item.title}</h2><p>{item.meta}</p></div><b>↗︎</b></a>)}</div>{filtered.length === 0 && <p className="empty-state">{locale === "en" ? "No results found." : "Sonuç bulunamadı."}</p>}</>}</div>;
}
