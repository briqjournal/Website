import { authorProfiles } from "../authors";
import { canonicalPageHref } from "../seo-links";
import { SiteFooter, SiteHeader } from "./SiteChrome";
import { AuthorDirectoryList, type DirectoryProfile } from "./AuthorDirectoryList";

export function AuthorDirectoryPage({ locale }: { locale: "tr" | "en" }) {
  const english = locale === "en";
  const profiles: DirectoryProfile[] = authorProfiles.map((profile) => ({
    id: profile.id,
    name: profile.name,
    affiliation: english ? profile.affiliationEn : profile.affiliationTr,
    role: (english ? profile.rolesEn : profile.rolesTr)[0] || "",
    works: profile.articles.length,
  }));

  const links = english
    ? [
        ["Current Issue", "/en/current-issue/"],
        ["All Issues", "/en/archive/"],
        ["Article Search", "/en/articles/"],
        ["Author Directory", "/en/author-directory/"],
      ]
    : [
        ["Güncel Sayı", "/tr/guncel-sayi/"],
        ["Tüm Sayılar", "/tr/arsiv/"],
        ["Makale Arama", "/tr/makaleler/"],
        ["Yazar Dizini", "/tr/yazar-dizini/"],
      ];

  return (
    <main className="author-directory-page" lang={locale}>
      <SiteHeader locale={locale} />
      <nav className="author-directory-subnav" aria-label={english ? "Publications navigation" : "Yayınlar gezintisi"}>
        <div className="site-shell">
          {links.map(([label, href], index) => (
            <a
              key={href}
              href={canonicalPageHref(href)}
              aria-current={index === 3 ? "page" : undefined}
            >
              {label}
            </a>
          ))}
        </div>
      </nav>
      <div className="site-shell author-directory-shell">
        <div className="author-directory-breadcrumb">
          <a href={canonicalPageHref(english ? "/en/" : "/tr/")}>{english ? "HOME" : "ANA SAYFA"}</a>
          <span aria-hidden="true">/</span>
          <span>{english ? "PUBLICATIONS" : "YAYINLAR"}</span>
          <span aria-hidden="true">/</span>
          <span>{english ? "AUTHOR DIRECTORY" : "YAZAR DİZİNİ"}</span>
        </div>

        <header className="author-directory-hero">
          <div className="author-directory-hero-copy">
            <p className="author-directory-kicker">{english ? "BRIQ ARCHIVE — PEOPLE" : "BRIQ ARŞİVİ — KİŞİLER"}</p>
            <h1>{english ? "Author Directory" : "Yazar Dizini"}<span>.</span></h1>
            <p>{english
              ? "Explore the authors published in BRIQ and the scholars contributing to the journal."
              : "BRIQ'da çalışmaları yayımlanan yazarları ve derginin akademik katkıda bulunanlarını keşfedin."}
            </p>
          </div>
          <div className="author-directory-total">
            <strong>{profiles.length}</strong>
            <span>{english ? "PROFILES" : "PROFİL"}</span>
          </div>
        </header>

        <AuthorDirectoryList profiles={profiles} locale={locale} />
      </div>
      <SiteFooter locale={locale} />
    </main>
  );
}
