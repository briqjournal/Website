"use client";

import { useState } from "react";
import { issueAccent } from "../issue-themes";

type Call = {
  title: string;
  titleEn?: string;
  deadline: string;
  deadlineEn?: string;
  issue: string;
  issueEn?: string;
  issueHref: string | null;
  issueHrefEn?: string | null;
  slug: string;
  slugEn?: string;
};

function callResultColor(issue: string) {
  const match = issue.match(/(?:Cilt|Volume)\s+(\d+).*?(?:Sayı|Issue)\s+(\d+)/i);
  return match ? issueAccent(Number(match[1]), Number(match[2])) : undefined;
}

export function CallsExplorer({ calls, locale = "tr" }: { calls: Call[]; locale?: "tr" | "en" }) {
  const [query, setQuery] = useState("");
  const [year, setYear] = useState("all");
  const localize = (call: Call) => ({
    title: locale === "en" ? (call.titleEn || call.title) : call.title,
    deadline: locale === "en" ? (call.deadlineEn || call.deadline) : call.deadline,
    issue: locale === "en" ? (call.issueEn || call.issue) : call.issue,
    issueHref: locale === "en" ? (call.issueHrefEn ?? call.issueHref) : call.issueHref,
    slug: locale === "en" ? (call.slugEn || call.slug) : call.slug,
  });
  const localizedCalls = calls.map(localize);
  const years = [...new Set(localizedCalls.map((call) => call.deadline.match(/\d{4}/)?.[0]).filter(Boolean) as string[])].sort().reverse();
  const normalized = query.trim().toLocaleLowerCase(locale === "tr" ? "tr" : "en");
  const filtered = localizedCalls.filter((call) => (year === "all" || call.deadline.includes(year)) && (!normalized || `${call.title} ${call.issue} ${call.deadline}`.toLocaleLowerCase(locale === "tr" ? "tr" : "en").includes(normalized)));
  const grouped = filtered.reduce<Record<string, Call[]>>((acc, call) => {
    const key = call.deadline.match(/\d{4}/)?.[0] || (locale === "en" ? "Other" : "Diğer");
    (acc[key] ||= []).push(call);
    return acc;
  }, {});

  return (
    <section className="past-calls" id={locale === "en" ? "past" : "gecmis"}>
      <div className="section-heading split-heading"><div><p className="section-kicker">{locale === "en" ? "Archive" : "Arşiv"}</p><h2>{locale === "en" ? "Past calls" : "Geçmiş çağrılar"}</h2></div><span className="record-count">{filtered.length} {locale === "en" ? "calls" : "çağrı"}</span></div>
      <div className="directory-toolbar calls-toolbar">
        <label className="directory-search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={locale === "en" ? "Search title or result" : "Çağrı başlığında veya sonuçta ara"} /></label>
        <label><span>{locale === "en" ? "Year" : "Yıl"}</span><select value={year} onInput={(event) => setYear(event.currentTarget.value)} onChange={(event) => setYear(event.target.value)}><option value="all">{locale === "en" ? "All years" : "Tüm yıllar"}</option>{years.map((item) => <option key={item}>{item}</option>)}</select></label>
      </div>
      {Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a)).map(([groupYear, items]) => <div className="call-year-group" key={groupYear}><h3>{groupYear}</h3><div>{items.map((call, index) => <a href={`${locale === "en" ? "/en/calls-for-papers" : "/tr/makale-cagrilari"}/${call.slug}`} key={call.title}><span>{String(index + 1).padStart(2, "0")}</span><div><b>{call.title}</b><small>{locale === "en" ? "Deadline" : "Son Tarih"}: {call.deadline}</small></div><div className="call-result"><small>{locale === "en" ? "Result" : "Çağrı sonucu"}</small>{call.issueHref ? <strong className="call-result-issue" style={{ backgroundColor: callResultColor(call.issue) }}>{call.issue}</strong> : <em>{call.issue}</em>}</div><em>↗︎</em></a>)}</div></div>)}
      {filtered.length === 0 && <p className="empty-state">{locale === "en" ? "No past call matches this search." : "Bu aramayla eşleşen geçmiş çağrı bulunamadı."}</p>}
    </section>
  );
}
