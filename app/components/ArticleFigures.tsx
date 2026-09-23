"use client";

import { useRef, useState } from "react";

export type ArticleFigureKind = "figure" | "table" | "visual";

export type ArticleFigure = {
  id: string;
  src: string;
  caption: string;
  kind?: ArticleFigureKind;
  placement?: {
    sectionId: string;
    afterParagraph: number;
  };
};

export function articleFigureKind(figure: ArticleFigure): ArticleFigureKind {
  if (figure.kind) return figure.kind;
  const caption = figure.caption.trim();
  if (/^(?:tablo|table)\b/i.test(caption)) return "table";
  if (/^(?:şekil|figure)\b/i.test(caption)) return "figure";
  return "visual";
}

export function articleFigureLabel(
  figure: ArticleFigure,
  figures: ArticleFigure[],
  locale: "tr" | "en",
) {
  const kind = articleFigureKind(figure);
  const publishedNumber = figure.caption.trim().match(/^(?:figure|table|visual|şekil|tablo|görsel)\s+(\d+)\b/iu)?.[1];
  const number = publishedNumber ?? String(
    figures
      .filter((candidate) => articleFigureKind(candidate) === kind)
      .findIndex((candidate) => candidate.id === figure.id) + 1,
  );

  if (kind === "figure") return locale === "tr" ? `Şekil ${number}` : `Figure ${number}`;
  if (kind === "table") return locale === "tr" ? `Tablo ${number}` : `Table ${number}`;
  return locale === "tr" ? `Görsel ${number}` : `Visual ${number}`;
}

export function articleFigureDisplayCaption(figure: ArticleFigure) {
  return figure.caption
    .replace(/^(?:figure|table|visual|şekil|tablo|görsel)\s+\d+\s*[.:]\s*/iu, "")
    .trim();
}

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

  const groups: Array<{ kind: ArticleFigureKind; title: string }> = [
    { kind: "figure", title: locale === "tr" ? "Şekiller" : "Figures" },
    { kind: "table", title: locale === "tr" ? "Tablolar" : "Tables" },
    { kind: "visual", title: locale === "tr" ? "Görseller" : "Visuals" },
  ];

  return (
    <details className="article-accordion article-figures article-figures-accordion" id={locale === "tr" ? "gorseller" : "visuals"}>
      <summary><span>{locale === "tr" ? "Şekiller, tablolar ve görseller" : "Figures, tables and visuals"}</span><b>{figures.length}</b></summary>
      <div className="article-figure-accordion-body">
        <div className="article-figure-groups">
          {groups.map((group) => {
            const items = figures.filter((figure) => articleFigureKind(figure) === group.kind);
            if (!items.length) return null;
            return (
              <section className="article-figure-group" data-kind={group.kind} key={group.kind}>
                <h3>{group.title}</h3>
                <div className="article-figure-grid">
                  {items.map((figure) => {
                    const label = articleFigureLabel(figure, figures, locale);
                    return (
                      <figure key={figure.id}>
                        <button type="button" onClick={() => open(figure)} aria-label={locale === "tr" ? `${label} büyüt` : `Enlarge ${label}`}>
                          <img src={figure.src} alt={figure.caption} loading="lazy" decoding="async" />
                          <span><ExpandIcon />{locale === "tr" ? "Büyüt" : "Enlarge"}</span>
                        </button>
                        <figcaption><b>{label}</b>{articleFigureDisplayCaption(figure)}</figcaption>
                        <div className="figure-actions">
                          <a href={figure.src} target="_blank" rel="noreferrer">{locale === "tr" ? "Ayrı görüntüle ↗︎" : "Open separately ↗︎"}</a>
                          <a href={figure.src} download>{locale === "tr" ? "İndir ↓︎" : "Download ↓︎"}</a>
                        </div>
                      </figure>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
        <dialog className="figure-lightbox" ref={dialog} onClick={(event) => event.target === dialog.current && dialog.current?.close()}>
          <button className="figure-lightbox-close" type="button" onClick={() => dialog.current?.close()} aria-label={locale === "tr" ? "Kapat" : "Close"}>×</button>
          {active && <><img src={active.src} alt={active.caption} /><p>{active.caption}</p></>}
        </dialog>
      </div>
    </details>
  );
}
