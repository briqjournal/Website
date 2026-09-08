"use client";

import { useEffect, useState } from "react";

export function BackToTop({ locale }: { locale: "tr" | "en" }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.scrollY > Math.max(640, window.innerHeight * 0.8));
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <button
      className={`back-to-top${visible ? " is-visible" : ""}`}
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label={locale === "tr" ? "Sayfanın başına dön" : "Back to top"}
      title={locale === "tr" ? "Başa dön" : "Back to top"}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m6 14 6-6 6 6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
  );
}
