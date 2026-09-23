"use client";

import { useRef, useState } from "react";

export type ArticleFigure = { id: string; src: string; caption: string };

function ExpandIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5m13 5h5v-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>;
}

export function ArticleFigures({ figures, locale }: { figures: ArticleFigure[]; locale: "tr" | "en" }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<ArticleFigure | null>(null);
  if (!figures.length) return null;

  const open = (figure: ArticleFigure) => {
    setActive(figure);
    dialog.current?.showModal();
  };

  const figureKinds = figures.map((figure) => /^(?:tablo|table)\b/i.test(figure.caption.trim()) ? "table" : "visual");
  const hasTables = figureKinds.includes("table");
  const hasVisuals = figureKinds.includes("visual");
  const collectionLabel = hasTables && hasVisuals
    ? (locale === "tr" ? "Görsel ve tablolar" : "Visuals and tables")
    : hasTables
      ? (locale === "tr" ? "Tablolar" : "Tables")
      : (locale === "tr" ? "Görseller" : "Visuals");
  const itemLabel = (index: number) => {
    const kind = figureKinds[index];
    const number = figureKinds.slice(0, index + 1).filter((candidate) => candidate === kind).length;
    if (kind === "table") return locale === "tr" ? `Tablo ${number}` : `Table ${number}`;
    return locale === "tr" ? `Görsel ${number}` : `Visual ${number}`;
  };

  return (
    <details className="article-accordion article-figures article-figures-accordion" id={locale === "tr" ? "gorseller" : "visuals"}>
      <summary><span>{collectionLabel}</span><b>{figures.length}</b></summary>
      <div className="article-figure-accordion-body">
        <div className="article-figure-grid">
          {figures.map((figure, index) => (
            <figure key={figure.id}>
              <button type="button" onClick={() => open(figure)} aria-label={locale === "tr" ? `${itemLabel(index)} büyüt` : `Enlarge ${itemLabel(index)}`}>
                <img src={figure.src} alt={figure.caption} loading="lazy" decoding="async" />
                <span><ExpandIcon />{locale === "tr" ? "Büyüt" : "Enlarge"}</span>
              </button>
              <figcaption><b>{itemLabel(index)}</b>{figure.caption}</figcaption>
              <div className="figure-actions">
                <a href={figure.src} target="_blank" rel="noreferrer">{locale === "tr" ? "Ayrı görüntüle ↗︎" : "Open separately ↗︎"}</a>
                <a href={figure.src} download>{locale === "tr" ? "İndir ↓︎" : "Download ↓︎"}</a>
              </div>
            </figure>
          ))}
        </div>
        <dialog className="figure-lightbox" ref={dialog} onClick={(event) => event.target === dialog.current && dialog.current?.close()}>
          <button className="figure-lightbox-close" type="button" onClick={() => dialog.current?.close()} aria-label={locale === "tr" ? "Kapat" : "Close"}>×</button>
          {active && <><img src={active.src} alt={active.caption} /><p>{active.caption}</p></>}
        </dialog>
      </div>
    </details>
  );
}
