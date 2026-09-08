"use client";

import { useState } from "react";
import type { ArchiveIssue } from "../archive";
import { issueTheme } from "../issue-themes";

export function ArchiveExplorer({ issues, locale = "tr" }: { issues: ArchiveIssue[]; locale?: "tr" | "en" }) {
  const [year, setYear] = useState("all");
  const [query, setQuery] = useState("");
  const volumeYear = new Map<number, string>();
  for (const record of issues) {
    const recordYears = record.year.match(/\d{4}/g) || [];
    const latestYear = recordYears.sort((a, b) => Number(b) - Number(a))[0];
    const existing = volumeYear.get(record.volume);
    if (latestYear && (!existing || Number(latestYear) > Number(existing))) volumeYear.set(record.volume, latestYear);
  }
  const archiveYear = (record: ArchiveIssue) => volumeYear.get(record.volume) || record.year;
  const years = [...new Set(issues.map(archiveYear))].sort((a, b) => Number(b) - Number(a));
  const normalized = query.trim().toLocaleLowerCase(locale === "tr" ? "tr" : "en");
  const filtered = issues.filter((record) => {
    const matchesYear = year === "all" || archiveYear(record) === year;
    const searchable = `${record.volume} ${record.issue} ${record.year} ${record.season_tr} ${record.season_en} ${issueTheme(record.volume, record.issue, locale)}`.toLocaleLowerCase(locale === "tr" ? "tr" : "en");
    return matchesYear && (!normalized || searchable.includes(normalized));
  });
  const grouped = [...new Set(filtered.map(archiveYear))]
    .sort((a, b) => Number(b) - Number(a))
    .map((label) => ({ label, records: filtered.filter((record) => archiveYear(record) === label) }));

  return (
    <>
      <div className="directory-toolbar">
        <label className="directory-search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={locale === "en" ? "Search issue or cover title" : "Sayı veya kapak başlığı ara"} /></label>
        <label><span>{locale === "en" ? "Year" : "Yıl"}</span><select value={year} onInput={(event) => setYear(event.currentTarget.value)} onChange={(event) => setYear(event.target.value)}><option value="all">{locale === "en" ? "All years" : "Tüm yıllar"}</option>{years.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
        <span className="directory-result-count">{filtered.length} {locale === "en" ? "issues" : "sayı"}</span>
      </div>
      <div className="archive-year-list">
        {grouped.map((group) => (
          <section className="archive-year-group" key={group.label}>
            <div className="archive-year-heading"><h2>{group.label.replace("-", "–")}</h2><span>{group.records.length} {locale === "en" ? "issues" : "sayı"}</span></div>
            <div className="issue-grid">
              {group.records.map((record) => {
                const current = record.volume === 7 && record.issue === 4;
                const href = locale === "en" ? (current ? "/en/current-issue" : `/en/archive/volume-${record.volume}-issue-${record.issue}`) : (current ? "/guncel-sayi" : `/arsiv/cilt-${record.volume}-sayi-${record.issue}`);
                const cover = locale === "en" ? record.cover_en : (current ? "/assets/current-issue-tr.jpg" : record.cover_tr);
                return <a className={`issue-card ${current ? "is-current" : ""}`} href={href} key={`${record.volume}-${record.issue}`}><img src={cover} alt={locale === "en" ? `BRIQ Volume ${record.volume} Issue ${record.issue} cover` : `BRIQ Cilt ${record.volume} Sayı ${record.issue} kapağı`} /><div><span>{locale === "en" ? record.season_en : record.season_tr} {record.year}</span><h2>{locale === "en" ? `Volume ${record.volume} · Issue ${record.issue}` : `Cilt ${record.volume} · Sayı ${record.issue}`}</h2><p>{issueTheme(record.volume, record.issue, locale)}</p>{current && <b>{locale === "en" ? "Current issue" : "Güncel sayı"}</b>}</div></a>;
              })}
            </div>
          </section>
        ))}
      </div>
      {filtered.length === 0 && <p className="empty-state">{locale === "en" ? "No issue matches these filters." : "Bu filtrelerle eşleşen sayı bulunamadı."}</p>}
    </>
  );
}
