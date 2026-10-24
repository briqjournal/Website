import { articleRouteSlug } from "../archive";
import { canonicalPageHref } from "../seo-links";
import { issueAccent } from "../issue-themes";
import { BiographyText } from "./BiographyText";
import { SiteFooter, SiteHeader } from "./SiteChrome";
import { type HistoricalAuthorGroup } from "../historical-author-groups";

export function HistoricalAuthorGroupPage({
  group,
  locale,
}: {
  group: HistoricalAuthorGroup;
  locale: "tr" | "en";
}) {
  const english = locale === "en";
  const names = group.members.map((profile) => profile.name);
  const title = names.join(english ? " & " : " ve ");
  const alternateHref = english
    ? `/tr/ortak-yazarlar/${group.slug}/`
    : `/en/coauthors/${group.slug}/`;

  return (
    <main className="historical-coauthors-page">
      <SiteHeader locale={locale} alternateHref={alternateHref} />
      <section className="author-page-hero">
        <div className="site-shell author-page-hero-inner">
          <div className="page-breadcrumb">
            <a href={canonicalPageHref(english ? "/en/" : "/tr/")}>{english ? "Home" : "Ana Sayfa"}</a>
            <span>/</span>
            <a href={canonicalPageHref(english ? "/en/author-directory/" : "/tr/yazar-dizini/")}>{english ? "Authors" : "Yazarlar"}</a>
            <span>/</span>
            <span>{english ? "Coauthors" : "Ortak yazarlar"}</span>
          </div>
          <div className="author-page-identity">
            <span className="author-page-monogram" aria-hidden="true">{group.members.length}</span>
            <div>
              <p className="section-kicker">{english ? "BRIQ ARCHIVE · COAUTHORS" : "BRIQ ARŞİVİ · ORTAK YAZARLAR"}</p>
              <h1>{title}</h1>
              <p>{english
                ? "A historic joint-author record linking the contributors' individual profiles and their shared publications."
                : "Yazarların bireysel profillerini ve birlikte yayımladıkları çalışmaları bir araya getiren tarihsel ortak yazar kaydı."}</p>
            </div>
          </div>
        </div>
      </section>
      <div className="site-shell author-page-layout">
        <aside>
          <span>{english ? "Shared publications" : "Ortak yayın"}</span>
          <b>{group.articles.length}</b>
          <p>{english
            ? "This historical grouping is not a separate person or institution. Each author keeps their own profile."
            : "Bu tarihsel kayıt ayrı bir kişi veya kurum değildir. Her yazarın kendi profili korunmaktadır."}</p>
        </aside>
        <div className="author-page-main">
          <section className="historical-coauthors-section" aria-label={english ? "Contributing authors" : "Katkıda bulunan yazarlar"}>
            <div className="historical-coauthors-heading">
              <p className="section-kicker">{english ? "CONTRIBUTORS" : "YAZARLAR"}</p>
              <h2>{english ? "Individual author profiles" : "Bireysel yazar profilleri"}</h2>
            </div>
            <div className="historical-coauthors-members">
              {group.members.map((profile) => (
                <article className="author-profile-panel" key={profile.id}>
                  <p className="section-kicker">{english ? "AUTHOR PROFILE" : "YAZAR PROFİLİ"}</p>
                  <h3>{profile.name}</h3>
                  <p className="historical-coauthors-affiliation">{english ? profile.affiliationEn : profile.affiliationTr}</p>
                  <p className="historical-coauthors-biography"><BiographyText text={english ? profile.biographyEn : profile.biographyTr} /></p>
                  <a className="historical-coauthors-profile-link" href={canonicalPageHref(`${english ? "/en/authors" : "/tr/yazar"}/${profile.id}`)}>
                    {english ? "View individual profile" : "Bireysel profile git"} <span aria-hidden="true">→</span>
                  </a>
                </article>
              ))}
            </div>
          </section>
          <section className="author-page-publications">
            <div>
              <p className="section-kicker">{english ? "PUBLISHED TOGETHER" : "BİRLİKTE YAYIMLANANLAR"}</p>
              <h2>{english ? "Shared work in BRIQ" : "BRIQ’te ortak çalışmalar"}</h2>
            </div>
            <div className="author-work-list">
              {group.articles.map((article) => (
                <a
                  key={article.slug}
                  href={canonicalPageHref(english
                    ? `/en/articles/${articleRouteSlug(article, "en")}`
                    : `/tr/makaleler/${article.slug}`)}
                >
                  <span className="author-work-issue" style={{ backgroundColor: issueAccent(article.volume, article.issue) }}>
                    {english ? `Volume ${article.volume} · Issue ${article.issue} · ${article.year}` : `Cilt ${article.volume} · Sayı ${article.issue} · ${article.year}`}
                  </span>
                  <h3>{english ? article.title_en || article.title_tr : article.title_tr}</h3>
                  <p>{article.pages ? `${english ? "pp." : "ss."} ${article.pages}` : english ? article.season_en : article.season_tr}</p>
                  <b aria-hidden="true">→</b>
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>
      <SiteFooter locale={locale} />
    </main>
  );
}
