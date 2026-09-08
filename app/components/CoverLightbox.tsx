"use client";

import { useEffect, useRef, useState } from "react";

function MagnifierIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/><path d="M10.5 7.5v6M7.5 10.5h6"/></svg>;
}

export function CoverLightbox({ src, alt, locale = "tr" }: { src: string; alt: string; locale?: "tr" | "en" }) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const label = locale === "en" ? "Inspect cover" : "Kapağı incele";

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button className="cover-inspect-button" type="button" onClick={() => setOpen(true)}>
        <span>{label}</span><MagnifierIcon />
      </button>
      {open && (
        <div className="cover-lightbox" role="dialog" aria-modal="true" aria-label={label} onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <div className="cover-lightbox-panel">
            <button ref={closeRef} className="cover-lightbox-close" type="button" onMouseDown={(event) => { event.stopPropagation(); setOpen(false); }} onClick={() => setOpen(false)} aria-label={locale === "en" ? "Close enlarged cover" : "Büyütülmüş kapağı kapat"}>×</button>
            <img src={src} alt={alt} />
            <p>{alt}</p>
          </div>
        </div>
      )}
    </>
  );
}
