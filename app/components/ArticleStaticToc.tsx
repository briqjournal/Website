"use client";

import type { MouseEvent } from "react";

type TocItem = { id: string; label: string; level: number };

export function ArticleStaticToc({ items, locale }: { items: TocItem[]; locale: "tr" | "en" }) {
  const navigate = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    if (target instanceof HTMLDetailsElement) target.open = true;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);
  };

  const visibleItems = items.filter(
    (item) => !(item.level === 2 && (item.id === "full-text" || item.id === "tam-metin")),
  );

  return (
    <nav className="article-static-toc" aria-label={locale === "tr" ? "Makale içindekiler" : "Article navigation"}>
      <b>{locale === "tr" ? "İçindekiler" : "Article navigation"}</b>
      {visibleItems.map((item) => <a className={item.level === 2 ? "is-subsection" : ""} href={`#${item.id}`} onClick={(event) => navigate(event, item.id)} key={`${item.id}-${item.label}`}>{item.label}</a>)}
    </nav>
  );
}
