"use client";

import { useEffect, useState, type MouseEvent } from "react";

function ReturnIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m9 8-4 4 4 4M5 12h8.5a5.5 5.5 0 0 0 5.5-5.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function ReferenceBackLink({ targetId, locale, kind }: { targetId: string; locale: "tr" | "en"; kind: "reference" | "footnote" }) {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setAvailable(Boolean(document.querySelector(`[data-return-target="${CSS.escape(targetId)}"]`)));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [targetId]);

  if (!available) return null;

  const goBack = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const record = document.getElementById(targetId);
    const rememberedId = record?.dataset.returnAnchor;
    const target = (rememberedId && document.getElementById(rememberedId))
      || document.querySelector<HTMLElement>(`[data-return-target="${CSS.escape(targetId)}"]`);
    if (!target) return;
    record?.classList.remove("is-citation-target");
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    window.history.replaceState(null, "", `#${target.id}`);
  };

  const label = locale === "tr"
    ? (kind === "footnote" ? "Dipnottan metindeki işarete dön" : "Kaynakçadan metindeki atfa dön")
    : (kind === "footnote" ? "Return to the footnote marker" : "Return to the in-text citation");

  return <a className="reference-backlink" href={`#citation-${targetId}`} onClick={goBack} aria-label={label} title={label}><ReturnIcon /></a>;
}
