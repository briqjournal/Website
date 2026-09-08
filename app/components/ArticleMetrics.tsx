"use client";

import { useEffect, useState } from "react";

type MetricPayload = {
  views: number | null;
  citations: number | null;
  citedBy: { title: string; year?: number; url?: string }[];
};

export function ArticleMetrics({ slug, doi, title, locale }: { slug: string; doi?: string | null; title: string; locale: "tr" | "en" }) {
  const [metrics, setMetrics] = useState<MetricPayload>({ views: null, citations: null, citedBy: [] });
  useEffect(() => {
    const key = `briq-viewed:${slug}`;
    const counted = window.sessionStorage.getItem(key) === "1";
    fetch(`/api/article-metrics/${encodeURIComponent(slug)}${doi ? `?doi=${encodeURIComponent(doi)}` : ""}`, { method: counted ? "GET" : "POST" })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (data) setMetrics(data);
        if (!counted) window.sessionStorage.setItem(key, "1");
      })
      .catch(() => undefined);
  }, [slug, doi]);

  const unknown = locale === "tr" ? "Doğrulanmış veri yok" : "No verified data";
  return (
    <section className="article-metrics" id={locale === "tr" ? "etki" : "impact"}>
      <div className="metric-cards">
        <div><span>{locale === "tr" ? "Görüntülenme" : "Views"}</span><b>{metrics.views ?? "—"}</b><small>{metrics.views === null ? unknown : (locale === "tr" ? "BRIQ site içi" : "On BRIQ")}</small></div>
        <div><span>{locale === "tr" ? "Atıf" : "Citations"}</span><b>{metrics.citations ?? "—"}</b><small>{metrics.citations === null ? unknown : "Crossref"}</small></div>
      </div>
      <details className="article-accordion">
        <summary><span>{locale === "tr" ? "Atıf yapan çalışmalar" : "Cited by"}</span><b>{metrics.citedBy.length}</b></summary>
        <div className="cited-by-list">
          {metrics.citedBy.length ? metrics.citedBy.map((work) => (
            <a href={work.url || "#"} key={`${work.title}-${work.year || ""}`} target={work.url ? "_blank" : undefined} rel={work.url ? "noreferrer" : undefined}>
              <span>{work.title}</span>{work.year && <small>{work.year}</small>}
            </a>
          )) : <p>{locale === "tr" ? "Bu makaleye atıf yapan doğrulanmış bir çalışma henüz kaydedilmemiştir." : "No verified citing work has been recorded for this article yet."}</p>}
          <div className="metric-source-links">
            {doi && <a href={`https://search.crossref.org/?q=${encodeURIComponent(doi)}`} target="_blank" rel="noreferrer">Crossref ↗︎</a>}
            <a href={`https://scholar.google.com/scholar?q=${encodeURIComponent(`"${title}"`)}`} target="_blank" rel="noreferrer">Google Scholar ↗︎</a>
          </div>
        </div>
      </details>
    </section>
  );
}
