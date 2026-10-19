"use client";

export function ArticleCitationShortcut({ locale }: { locale: "tr" | "en" }) {
  const targetId = locale === "tr" ? "atif" : "cite";

  return (
    <a
      className="article-citation-shortcut"
      href={`#${targetId}`}
      onClick={(event) => {
        const target = document.getElementById(targetId);
        if (!(target instanceof HTMLDetailsElement)) return;
        event.preventDefault();
        target.open = true;
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.replaceState(null, "", `#${targetId}`);
      }}
    >
      {locale === "tr" ? "Atıf" : "Cite"}
    </a>
  );
}
