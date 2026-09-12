"use client";

import { useMemo, useState } from "react";

type PdfViewerProps = {
  title: string;
  turkishSrc?: string | null;
  englishSrc?: string | null;
  turkishDownloadName?: string;
  englishDownloadName?: string;
  startPage?: number;
  compact?: boolean;
  locale?: "tr" | "en";
};

export function PdfViewer({
  title,
  turkishSrc,
  englishSrc,
  turkishDownloadName,
  englishDownloadName,
  startPage = 1,
  compact = false,
  locale = "tr",
}: PdfViewerProps) {
  const initialLanguage = locale === "en" && englishSrc ? "en" : turkishSrc ? "tr" : "en";
  const [language, setLanguage] = useState<"tr" | "en">(initialLanguage);
  const activeSrc = language === "tr" ? turkishSrc : englishSrc;
  const activeDownloadName = language === "tr" ? turkishDownloadName : englishDownloadName;
  const viewerSrc = useMemo(
    () => activeSrc ? `${activeSrc}#page=${startPage}&zoom=100&toolbar=1&navpanes=0&scrollbar=1` : "",
    [activeSrc, startPage],
  );

  if (!activeSrc) return null;

  return (
    <section className={`pdf-reader ${compact ? "pdf-reader-compact" : ""}`} id="pdf-viewer">
      <div className="pdf-reader-toolbar">
        <div>
          <span className="pdf-reader-kicker">{locale === "en" ? "On-site PDF viewer" : "Site içi PDF görüntüleyici"}</span>
          <h2>{title}</h2>
        </div>
        <div className="pdf-reader-controls" aria-label="PDF dili">
          {turkishSrc && (
            <button
              type="button"
              className={language === "tr" ? "is-active" : ""}
              onClick={() => setLanguage("tr")}
            >
              Türkçe
            </button>
          )}
          {englishSrc && (
            <button
              type="button"
              className={language === "en" ? "is-active" : ""}
              onClick={() => setLanguage("en")}
            >
              English
            </button>
          )}
          <a href={activeSrc} target="_blank" rel="noreferrer">
            {locale === "en" ? "Open in new tab ↗︎" : "Yeni sekmede aç ↗︎"}
          </a>
          <a href={activeSrc} download={activeDownloadName || true}>
            {locale === "en" ? "Download ↓︎" : "İndir ↓︎"}
          </a>
        </div>
      </div>
      <div className="pdf-reader-frame">
        <iframe src={viewerSrc} title={`${title} - ${language === "tr" ? "Türkçe" : "İngilizce"} PDF`} />
        <p>
          {locale === "en" ? "If your browser does not support embedded PDFs, " : "Tarayıcınız gömülü PDF görüntülemeyi desteklemiyorsa "}
          <a href={activeSrc} target="_blank" rel="noreferrer">{locale === "en" ? "open the PDF in a new tab." : "PDF'yi yeni sekmede açın."}</a>
        </p>
      </div>
    </section>
  );
}
