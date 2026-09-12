"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { navItems } from "../site-data";

type Locale = "tr" | "en";

const englishNavItems = [
  { label: "Journal", href: "/en/journal/about-briq", children: [["About BRIQ", "/en/journal/about-briq"], ["Publication Principles", "/en/journal/publication-principles"], ["Publication Board", "/en/journal/publication-board"], ["Advisory Board", "/en/journal/advisory-board"], ["Indexing & Archiving", "/en/journal/indexes"], ["Annual Reports", "/en/annual-reports"]] },
  { label: "Publications", href: "/en/current-issue", children: [["Current Issue", "/en/current-issue"], ["All Issues", "/en/archive"], ["Article Search", "/en/articles"]] },
  { label: "For Authors", href: "/en/for-authors", children: [["Submission Guidelines", "/en/for-authors/guidelines"], ["Publication Review Process", "/en/for-authors/review-process"], ["Publication Ethics", "/en/for-authors/publication-ethics"], ["Copyright Terms and Licence", "/en/for-authors/copyright-and-licence"]] },
  { label: "Calls for Papers", href: "/en/calls-for-papers", children: [["Active Calls", "/en/calls-for-papers#active"], ["Past Calls", "/en/calls-for-papers#past"], ["Book Reviews", "/en/calls-for-papers/book-reviews"]] },
  { label: "Contact", href: "/en/contact" },
];

const turkishToEnglishPaths: Record<string, string> = {
  "/": "/en",
  "/dergi/briq-hakkinda": "/en/journal/about-briq",
  "/dergi/yayin-ilkeleri": "/en/journal/publication-principles",
  "/dergi/yayin-kurulu": "/en/journal/publication-board",
  "/dergi/danisma-kurulu": "/en/journal/advisory-board",
  "/dergi/endeksler": "/en/journal/indexes",
  "/iletisim": "/en/contact",
  "/guncel-sayi": "/en/current-issue",
  "/arsiv": "/en/archive",
  "/makaleler": "/en/articles",
  "/yazarlar": "/en/for-authors",
  "/yazarlar/yazim-kurallari": "/en/for-authors/guidelines",
  "/yazarlar/yayin-degerlendirme-sureci": "/en/for-authors/review-process",
  "/yazarlar/telif-hakki-sartlari-ve-lisans": "/en/for-authors/copyright-and-licence",
  "/yazarlar/yayin-etigi": "/en/for-authors/publication-ethics",
  "/arama": "/en/search",
  "/makale-cagrilari": "/en/calls-for-papers",
  "/makale-cagrilari/transatlantik-iliskilerin-yeniden-yapilanmasi": "/en/calls-for-papers/transatlantic-relations",
  "/makale-cagrilari/yapay-zeka-uretici-gucler-ortak-refah": "/en/calls-for-papers/artificial-intelligence-productive-forces",
  "/makale-cagrilari/kitap-incelemesi": "/en/calls-for-papers/book-reviews",
  "/yillik-raporlar": "/en/annual-reports",
};

const currentIssueArticleSlugs: Record<string, string> = {
  "kulturel-silinmeden-tarihsel-kurtarmaya": "kulturel-silinmeden-tarihsel-kurtarmaya-nishio-kanji-ve-amerikan-isgali-altindaki-japonyanin",
  "turkiye-isvicre-kultur-varliklari-anlasmasi": "kultur-varliklarinin-yasadisi-ithalatinin-onlenmesi-ve-iadesine-iliskin-turkiye-ile-isvicre",
  "cinde-somut-olmayan-kulturel-mirasin-korunmasi": "cinde-somut-olmayan-kulturel-mirasin-korunmasi-yirmi-yillik-deneyim-suregelen-zorluklar-ve-gelecege",
  "anadolunun-kulturel-mirasini-koruma-sorumlulugu": "anadolunun-kulturel-mirasini-koruma-ve-gelecege-aktarma-sorumlulugu",
  "mogolistanin-ucuncu-komsu-diplomasisi": "mogolistanin-ucuncu-komsu-diplomasisinde-kurumsal-dengeleme-sanghay-isbirligi-orgutu-ile-etkilesim",
  "kusak-ve-yolun-guvenligi-kitap-incelemesi": "kusak-ve-yolun-guvenligi-ozel-guvenlik-risk-ve-cinin-kuresel-genislemesi",
};

const englishToTurkishPaths = Object.fromEntries(
  Object.entries(turkishToEnglishPaths).map(([turkish, english]) => [english, turkish]),
);
const canonicalToTurkishArticleSlugs = Object.fromEntries(
  Object.entries(currentIssueArticleSlugs).map(([turkish, canonical]) => [canonical, turkish]),
);

function normalizePath(pathname: string) {
  return pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
}

function alternateLocalePath(pathname: string, locale: Locale) {
  const path = normalizePath(pathname);

  if (locale === "tr") {
    if (turkishToEnglishPaths[path]) return turkishToEnglishPaths[path];

    const issue = path.match(/^\/arsiv\/cilt-(\d+)-sayi-(\d+)$/);
    if (issue) return `/en/archive/volume-${issue[1]}-issue-${issue[2]}`;

    const articlePdf = path.match(/^\/makaleler\/(.+)\/pdf$/);
    if (articlePdf) {
      const slug = currentIssueArticleSlugs[articlePdf[1]] || articlePdf[1];
      return `/en/articles/${slug}/pdf`;
    }

    const article = path.match(/^\/makaleler\/(.+)$/);
    if (article) {
      const slug = currentIssueArticleSlugs[article[1]] || article[1];
      return `/en/articles/${slug}`;
    }

    const author = path.match(/^\/yazar\/(.+)$/);
    if (author) return `/en/authors/${author[1]}`;

    const report = path.match(/^\/yillik-raporlar\/(\d+)$/);
    if (report) return `/en/annual-reports/${report[1]}`;

    const call = path.match(/^\/makale-cagrilari\/(.+)$/);
    if (call) return `/en/calls-for-papers/${call[1]}`;

    return path === "/" ? "/en" : `/en${path}`;
  }

  if (englishToTurkishPaths[path]) return englishToTurkishPaths[path];

  const issue = path.match(/^\/en\/archive\/volume-(\d+)-issue-(\d+)$/);
  if (issue) return `/arsiv/cilt-${issue[1]}-sayi-${issue[2]}`;

  const articlePdf = path.match(/^\/en\/articles\/(.+)\/pdf$/);
  if (articlePdf) {
    const slug = canonicalToTurkishArticleSlugs[articlePdf[1]] || articlePdf[1];
    return `/makaleler/${slug}/pdf`;
  }

  const article = path.match(/^\/en\/articles\/(.+)$/);
  if (article) {
    const slug = canonicalToTurkishArticleSlugs[article[1]] || article[1];
    return `/makaleler/${slug}`;
  }

  const author = path.match(/^\/en\/authors\/(.+)$/);
  if (author) return `/yazar/${author[1]}`;

  const report = path.match(/^\/en\/annual-reports\/(\d+)$/);
  if (report) return `/yillik-raporlar/${report[1]}`;

  const call = path.match(/^\/en\/calls-for-papers\/(.+)$/);
  if (call) return `/makale-cagrilari/${call[1]}`;

  return path.replace(/^\/en(?=\/|$)/, "") || "/";
}

export function SiteHeader({ locale = "tr" }: { locale?: Locale }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [condensed, setCondensed] = useState(false);
  const condensedRef = useRef(false);
  const pathname = usePathname() || (locale === "en" ? "/en" : "/");
  const isEnglish = locale === "en";
  const items = isEnglish ? englishNavItems : navItems;
  const alternateHref = alternateLocalePath(pathname, locale);

  useEffect(() => {
    const onScroll = () => {
      const next = condensedRef.current ? window.scrollY > 28 : window.scrollY > 88;
      if (next !== condensedRef.current) {
        condensedRef.current = next;
        setCondensed(next);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.lang = isEnglish ? "en" : "tr";
  }, [isEnglish]);

  useEffect(() => {
    if (!mobileOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileOpen]);

  return (
    <>
      <div className="utility-bar">
        <div className="site-shell utility-inner">
          <p>{isEnglish ? "Peer-reviewed · Open Access · Turkish / English · Quarterly" : "Hakemli · Açık Erişim · Türkçe / İngilizce · Üç Aylık"}</p>
          <div className="utility-links">
            <span>ISSN 2687-5896</span>
            <span>E-ISSN 2718-0581</span>
            <span>DOI 10.67696</span>
            {isEnglish ? <><a href={alternateHref} aria-label="Bu sayfanın Türkçe sürümü">TR</a><span className="utility-divider" /><strong>EN</strong></> : <><a href={alternateHref} aria-label="English version of this page">EN</a><span className="utility-divider" /><strong>TR</strong></>}
          </div>
        </div>
      </div>
      <header className={`site-header ${condensed ? "is-condensed" : ""}`}>
        <div className="site-shell header-main">
          <a href={isEnglish ? "/en" : "/"} className={`brand brand-${locale}`} aria-label={isEnglish ? "BRIQ home" : "BRIQ ana sayfa"}>
            <span className="brand-mark" aria-hidden="true">
              <img src={isEnglish ? "/assets/briq-logo.png" : "/assets/briq-logo-tr.png"} alt="" loading="eager" decoding="async" fetchPriority="high" />
            </span>
          </a>
          <button
            className={`menu-button ${mobileOpen ? "is-open" : ""}`}
            type="button"
            aria-label={isEnglish ? "Open or close menu" : "Menüyü aç veya kapat"}
            aria-expanded={mobileOpen}
            aria-controls="primary-navigation"
            onClick={() => setMobileOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
          <nav id="primary-navigation" className={mobileOpen ? "main-nav is-open" : "main-nav"}>
            {items.map((item) => (
              <div className="nav-item" key={item.label}>
                <a href={item.href} onClick={() => setMobileOpen(false)}>
                  {item.label}{item.children && <span className="nav-caret" aria-hidden="true">⌄</span>}
                </a>
                {item.children && (
                  <div className="nav-dropdown" aria-label={isEnglish ? `${item.label} submenu` : `${item.label} alt menüsü`}>
                    {item.children.map(([label, href]) => (
                      <a href={href} key={href} onClick={() => setMobileOpen(false)}>{label}</a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
          <div className="header-actions">
            <a className="submit-button reviewer-button" href={`https://dergipark.org.tr/${isEnglish ? "en" : "tr"}/journal/4696/reviewer-request/send`}>
              {isEnglish ? "Reviewer Request" : "Hakemlik Talebi"} <span>↗︎</span>
            </a>
            <a className="submit-button" href={`https://dergipark.org.tr/${isEnglish ? "en" : "tr"}/journal/4696/submission/step/manuscript/new`}>
              {isEnglish ? "Submit" : "Yazı Gönder"} <span>↗︎</span>
            </a>
            <a className="header-search" href={isEnglish ? "/en/search" : "/arama"} aria-label={isEnglish ? "Search BRIQ" : "BRIQ’te ara"}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>
            </a>
          </div>
        </div>
      </header>
    </>
  );
}

export function SiteFooter({ locale = "tr" }: { locale?: Locale }) {
  const isEnglish = locale === "en";
  return (
    <footer>
      <div className="site-shell footer-grid">
        <div className="footer-brand">
          <img src={isEnglish ? "/assets/briq-logo.png" : "/assets/briq-logo-tr.png"} alt="BRIQ" loading="lazy" decoding="async" />
          <p>
            {isEnglish ? "BRIQ is a quarterly journal of international politics, economics, and culture published in Turkish and English." : "BRIQ (Belt & Road Initiative Quarterly) Türkçe-İngilizce, üç aylık uluslararası siyaset, ekonomi ve kültür dergisidir."}
          </p>
          <p>
            {isEnglish
              ? "Published by the Turkish-Chinese Business Development and Friendship Association."
              : "Çin İş Geliştirme ve Dostluk Derneği tarafından yayımlanmaktadır."}
          </p>
        </div>
        <div>
          <h3>{isEnglish ? "Journal" : "Dergi"}</h3>
          <a href={isEnglish ? "/en/journal/about-briq" : "/dergi/briq-hakkinda"}>{isEnglish ? "About BRIQ" : "BRIQ Hakkında"}</a>
          <a href={isEnglish ? "/en/journal/publication-board" : "/dergi/yayin-kurulu"}>{isEnglish ? "Publication Board" : "Yayın Kurulu"}</a>
          <a href={isEnglish ? "/en/journal/indexes" : "/dergi/endeksler"}>{isEnglish ? "Indexes" : "Endeksler"}</a>
          <a href={isEnglish ? "/en/annual-reports" : "/yillik-raporlar"}>{isEnglish ? "Annual reports" : "Yıllık raporlar"}</a>
        </div>
        <div>
          <h3>{isEnglish ? "Publishing" : "Yayınlar"}</h3>
          <a href={isEnglish ? "/en/archive" : "/arsiv"}>{isEnglish ? "All issues" : "Tüm sayılar"}</a>
          <a href={isEnglish ? "/en/articles" : "/makaleler"}>{isEnglish ? "Article Search" : "Makale Arama"}</a>
          <a href={isEnglish ? "/en/for-authors/guidelines" : "/yazarlar/yazim-kurallari"}>{isEnglish ? "For authors" : "Yazarlar için"}</a>
          <a href={isEnglish ? "/en/calls-for-papers" : "/makale-cagrilari"}>{isEnglish ? "Calls for papers" : "Makale çağrıları"}</a>
        </div>
        <div>
          <h3>{isEnglish ? "Contact" : "İletişim"}</h3>
          <a href="mailto:briq@briqjournal.com">briq@briqjournal.com</a>
          <p>
            Ünalan Mahallesi, Libadiye Caddesi
            <br />
            No:84
            <br />
            Üsküdar · İstanbul · Türkiye
          </p>
        </div>
      </div>
      <div className="site-shell footer-bottom">
        <p>{isEnglish ? "Publisher: Turkish-Chinese Business Development and Friendship Association" : "Yayıncı: Çin İş Geliştirme ve Dostluk Derneği"}</p>
        <div>
          <img src="/assets/cc-by.png" alt="Creative Commons BY 4.0" loading="lazy" decoding="async" />
          <span>© 2026 BRIQ</span>
        </div>
      </div>
    </footer>
  );
}

export function IndexTicker({ locale = "tr" }: { locale?: Locale }) {
  const isEnglish = locale === "en";
  const items = [
    ["ERIH PLUS", "/assets/indexes/erih-plus.png", "https://erihplus.hkdir.no/"],
    ["EuroPub", "/assets/indexes/europub.png", "https://europub.co.uk/journals/briq-belt-road-initiative-quarterly-J-33908"],
    ["SSOAR", "/assets/indexes/ssoar.png", "https://www.ssoar.info/ssoar/"],
  ];
  const repeated = [...items, ...items];

  return (
    <section className="index-ticker" aria-label={isEnglish ? "Indexes and repositories featuring BRIQ" : "BRIQ'in yer aldığı endeksler ve açık arşiv"}>
      <div className="ticker-label">
        <b>{isEnglish ? "Indexes" : "Endeksler"}</b>
      </div>
      <div className="ticker-window">
        <div className="ticker-track">
          {repeated.map(([name, image, href], index) => (
            <a className="ticker-item" href={href} key={`${name}-${index}`} aria-label={`${name} kaydını aç`}>
              <img src={image} alt={name} loading="lazy" decoding="async" />
            </a>
          ))}
        </div>
      </div>
      <a href={isEnglish ? "/en/journal/indexes" : "/dergi/endeksler"} className="ticker-link">
        {isEnglish ? "Details" : "Ayrıntılar"} →︎
      </a>
    </section>
  );
}
