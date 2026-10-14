import { SiteFooter, SiteHeader } from "./SiteChrome";
import { legalPages, type LegalKind, type LegalLocale } from "../legal-copy";

export function LegalPage({ locale, kind }: { locale: LegalLocale; kind: LegalKind }) {
  const copy = legalPages[locale][kind];
  const isEnglish = locale === "en";
  return (
    <main lang={locale}>
      <SiteHeader locale={locale} />
      <section className="page-hero">
        <div className="page-hero-rule" />
        <div className="site-shell page-hero-inner">
          <div className="page-breadcrumb">
            <a href={isEnglish ? "/en" : "/tr"}>{isEnglish ? "Home" : "Ana Sayfa"}</a>
            <span>/</span>
            <span>{copy.title}</span>
          </div>
          <p className="section-kicker light">{isEnglish ? "Legal information" : "Yasal bilgilendirme"}</p>
          <h1>{copy.title}</h1>
          <p>{copy.intro}</p>
        </div>
      </section>
      <div className="site-shell page-section">
        <div className="reading-content">
          <p>{isEnglish ? "Last reviewed:" : "Son inceleme:"} {copy.date}</p>
          {copy.sections.map((section, index) => (
            <section id={"section-" + (index + 1)} key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.bullets && (
                <ul>{section.bullets.map((item) => <li key={item}>{item}</li>)}</ul>
              )}
            </section>
          ))}
          <p><a href="mailto:briq@briqjournal.com">briq@briqjournal.com</a></p>
          <p>
            {kind === "privacy" ? (
              <a href={isEnglish ? "/en/cookie-policy" : "/tr/cerez-politikasi"}>
                {isEnglish ? "Read our Cookie Policy →" : "Çerez Politikası →"}
              </a>
            ) : (
              <a href={isEnglish ? "/en/privacy-policy" : "/tr/gizlilik-politikasi"}>
                {isEnglish ? "Read our Privacy Notice →" : "Gizlilik ve Kişisel Verilerin Korunması →"}
              </a>
            )}
          </p>
        </div>
      </div>
      <SiteFooter locale={locale} />
    </main>
  );
}
