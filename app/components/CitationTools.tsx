"use client";

import { useState } from "react";

function CitationText({ value }: { value: string }) {
  const match = value.match(/^(.*?)(https:\/\/doi\.org\/10\.\S+)$/i);
  if (!match) return <>{value}</>;
  return <>
    {match[1]}
    <a className="reference-inline-link" href={match[2]} target="_blank" rel="noreferrer">{match[2]}</a>
  </>;
}

export function CitationTools({ citation, slug, locale }: { citation: string; slug: string; locale: "tr" | "en" }) {
  const [copied, setCopied] = useState(false);
  const formattedCitation = citation.replace(/^\s*(?:Atıf|Citation)\s*/i, "").trim();
  const copy = async () => {
    await navigator.clipboard.writeText(formattedCitation);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div className="citation-toolbox">
      <div className="citation-toolbox-heading">
        <span>{locale === "tr" ? "Önerilen gösterim" : "Formatted citation"}</span>
        <b>APA 7</b>
      </div>
      <blockquote><p><CitationText value={formattedCitation} /></p></blockquote>
      <div className="citation-toolbox-actions">
        <button type="button" onClick={copy}>
          <svg aria-hidden="true" viewBox="0 0 24 24"><rect x="8" y="8" width="11" height="11" rx="1.5"/><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-10A1.5 1.5 0 0 0 3 5.5v10A1.5 1.5 0 0 0 4.5 17H8"/></svg>
          <span>{copied ? (locale === "tr" ? "Kopyalandı" : "Copied") : (locale === "tr" ? "Atıfı kopyala" : "Copy citation")}</span>
        </button>
        <div className="citation-export-group">
          <span>{locale === "tr" ? "Dışa aktar" : "Export"}</span>
          <a href={`/citations/${slug}.ris?locale=${locale}`}><span>RIS</span><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 4v11m0 0 4-4m-4 4-4-4M5 20h14"/></svg></a>
          <a href={`/citations/${slug}.bib?locale=${locale}`}><span>BibTeX</span><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 4v11m0 0 4-4m-4 4-4-4M5 20h14"/></svg></a>
          <a href={`/citations/${slug}.enw?locale=${locale}`}><span>EndNote</span><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 4v11m0 0 4-4m-4 4-4-4M5 20h14"/></svg></a>
        </div>
      </div>
    </div>
  );
}
