function callTone(slug: string) {
  if (slug.includes("yapay-zeka") || slug.includes("artificial-intelligence")) return "call-tone-ai";
  if (slug.includes("kitap") || slug.includes("book")) return "call-tone-book";
  return "call-tone-transatlantic";
}

export function CallHero({ locale, title, deadline, deadlineLabel, active, slug, image }: { locale: "tr" | "en"; title: string; deadline: string; deadlineLabel?: string; active: boolean; slug: string; image?: string }) {
  const isEnglish = locale === "en";
  return (
    <section className={`call-detail-hero ${callTone(slug)}`}>
      {image && <div className="call-detail-hero-media" style={{ backgroundImage: `url(${image})` }} aria-hidden="true" />}
      <div className="site-shell call-detail-hero-inner">
        <div className="page-breadcrumb"><a href={isEnglish ? "/en" : "/tr"}>{isEnglish ? "Home" : "Ana Sayfa"}</a><span>/</span><a href={isEnglish ? "/en/calls-for-papers" : "/tr/makale-cagrilari"}>{isEnglish ? "Calls for Papers" : "Makale Çağrıları"}</a></div>
        <div className="call-detail-hero-grid">
          <div><p className="section-kicker">{active ? (isEnglish ? "Active call" : "Aktif çağrı") : (isEnglish ? "Past call" : "Geçmiş çağrı")}</p><h1>{title}</h1></div>
          <div className="call-deadline-frame"><span>{deadlineLabel || (isEnglish ? "Deadline" : "Son Tarih")}</span><strong>{deadline}</strong></div>
        </div>
      </div>
    </section>
  );
}
