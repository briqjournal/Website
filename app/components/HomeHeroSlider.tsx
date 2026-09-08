"use client";

import { useEffect, useRef, useState } from "react";

type Locale = "tr" | "en";

const slides = {
  tr: [
    {
      eyebrow: "Cilt 7 · Sayı 4 · Sonbahar 2026",
      kicker: "Güncel sayı",
      title: "Batı Asya’da Yeni Dönem",
      subtitle: "Hegemonyacılık Geriliyor, Bölgesel İrade Güçleniyor",
      summary: "BRIQ’in yeni sayısı Batı Asya’daki dönüşümü, Türkiye–Çin ilişkilerini, Dijital İpek Yolu’nu ve Çin’in küresel altyapı stratejisini birlikte ele alıyor.",
      href: "/guncel-sayi",
      action: "Sayıyı keşfet",
      secondaryHref: "/guncel-sayi#pdf-viewer",
      secondary: "Tam sayı PDF",
      image: "/assets/current-issue-tr.jpg",
      imageAlt: "BRIQ 7. Cilt 4. Sayı kapağı",
      tone: "plum",
    },
    {
      eyebrow: "Cilt 7 · Sayı 3 · Yaz 2026",
      kicker: "Önceki sayı",
      title: "Kültürel Miras Yağması",
      subtitle: "Emperyalist Hegemonya ve İade Mücadelesi",
      summary: "Kültürel mirasın yağmalanmasını, tarihsel hafızanın silinmesini ve eserlerin ait oldukları toplumlara iadesi için yürütülen mücadeleyi ele alan dosya.",
      href: "/arsiv/cilt-7-sayi-3",
      action: "Sayıyı incele",
      secondaryHref: "/arsiv",
      secondary: "Tüm sayılar",
      image: "/assets/archive/covers/cilt-7-sayi-3-tr.jpg",
      imageAlt: "BRIQ 7. Cilt 3. Sayı kapağı",
      tone: "umber",
    },
    {
      eyebrow: "Son tarih · 1 Ekim 2026",
      kicker: "Makale çağrısı",
      title: "Transatlantik İlişkilerin Yeniden Yapılanması",
      subtitle: "Savaşlar ve Stratejik Parçalanma Çağında",
      summary: "ABD–Avrupa ilişkileri, NATO’nun dönüşen rolü, çok kutupluluk ve Küresel Güney’in yükselişi üzerine eleştirel ve disiplinler arası çalışmalar bekleniyor.",
      href: "/makale-cagrilari/transatlantik-iliskilerin-yeniden-yapilanmasi",
      action: "Çağrıyı incele",
      secondaryHref: "/yazarlar/yazim-kurallari",
      secondary: "Yazım kuralları",
      image: "/assets/cfp-transatlantic.png",
      imageAlt: "Transatlantik ilişkiler makale çağrısı",
      tone: "transatlantic",
    },
    {
      eyebrow: "Son tarih · 1 Aralık 2026",
      kicker: "Makale çağrısı",
      title: "Yapay Zekâ ve Üretici Güçler",
      subtitle: "İnsanlığın Ortak Refahı",
      summary: "Yapay zekânın emek, bilimsel üretim, kamusal planlama, teknolojik egemenlik ve toplumsal refah üzerindeki etkilerini inceleyen çalışmalar bekleniyor.",
      href: "/makale-cagrilari/yapay-zeka-uretici-gucler-ortak-refah",
      action: "Çağrıyı incele",
      secondaryHref: "/yazarlar/yazim-kurallari",
      secondary: "Yazım kuralları",
      image: "/assets/cfp-ai.png",
      imageAlt: "Yapay zekâ makale çağrısı",
      tone: "ai",
    },
    {
      eyebrow: "Türkiye’den dünyaya · 2019’dan beri",
      kicker: "BRIQ’i keşfedin",
      title: "Gelişen Dünyanın Fikir Platformu",
      subtitle: "Siyaset · Ekonomi · Kültür",
      summary: "BRIQ, Türkiye ile Çin başta olmak üzere gelişen dünya ülkeleri arasındaki doğrudan düşünsel alışverişe açık erişimli ve disiplinler arası bir zemin sunuyor.",
      href: "/dergi/briq-hakkinda",
      action: "BRIQ hakkında",
      secondaryHref: "/makaleler",
      secondary: "Makale arşivi",
      image: "/assets/briq-logo-tr.png",
      imageAlt: "BRIQ Kuşak ve Yol Girişimi Dergisi logosu",
      tone: "logo",
    },
  ],
  en: [
    {
      eyebrow: "Volume 7 · Issue 4 · Autumn 2026",
      kicker: "Current issue",
      title: "A New Era in West Asia",
      subtitle: "Hegemonism Recedes, Regional Agency Grows",
      summary: "The new issue brings together work on West Asia’s changing order, Türkiye–China relations, the Digital Silk Road, and China’s global infrastructure strategy.",
      href: "/en/current-issue",
      action: "Explore the issue",
      secondaryHref: "/en/current-issue#pdf-viewer",
      secondary: "Full issue PDF",
      image: "/assets/current-issue-en.jpg",
      imageAlt: "BRIQ Volume 7 Issue 4 cover",
      tone: "plum",
    },
    {
      eyebrow: "Volume 7 · Issue 3 · Summer 2026",
      kicker: "Previous issue",
      title: "Cultural Heritage Plunder",
      subtitle: "Imperialist Hegemony and the Struggle for Restitution",
      summary: "A special issue on cultural plunder, historical erasure, and the struggle to return cultural property to its communities.",
      href: "/en/archive/volume-7-issue-3",
      action: "Explore the issue",
      secondaryHref: "/en/archive",
      secondary: "All issues",
      image: "/assets/archive/covers/cilt-7-sayi-3-en.jpg",
      imageAlt: "BRIQ Volume 7 Issue 3 cover",
      tone: "umber",
    },
    {
      eyebrow: "Deadline · 1 October 2026",
      kicker: "Call for papers",
      title: "Reconfiguring Transatlantic Relations",
      subtitle: "In an Era of War and Strategic Fragmentation",
      summary: "BRIQ welcomes critical, interdisciplinary work on US–Europe relations, NATO’s changing role, multipolarity, and the rise of the Global South.",
      href: "/en/calls-for-papers/transatlantic-relations",
      action: "View the call",
      secondaryHref: "/en/for-authors/guidelines",
      secondary: "Submission guidelines",
      image: "/assets/cfp-transatlantic.png",
      imageAlt: "Transatlantic relations call for papers",
      tone: "transatlantic",
    },
    {
      eyebrow: "Deadline · 1 December 2026",
      kicker: "Call for papers",
      title: "Artificial Intelligence and Productive Forces",
      subtitle: "The Common Prosperity of Humanity",
      summary: "BRIQ welcomes work on AI, labour, scientific production, public planning, technological sovereignty, and social welfare.",
      href: "/en/calls-for-papers/artificial-intelligence-productive-forces",
      action: "View the call",
      secondaryHref: "/en/for-authors/guidelines",
      secondary: "Submission guidelines",
      image: "/assets/cfp-ai.png",
      imageAlt: "Artificial intelligence call for papers",
      tone: "ai",
    },
    {
      eyebrow: "From Türkiye to the world · Since 2019",
      kicker: "Discover BRIQ",
      title: "A Forum for the Developing World",
      subtitle: "Politics · Economics · Culture",
      summary: "BRIQ provides an open-access, interdisciplinary forum for direct intellectual exchange between Türkiye, China, and the wider developing world.",
      href: "/en/journal/about-briq",
      action: "About BRIQ",
      secondaryHref: "/en/articles",
      secondary: "Article archive",
      image: "/assets/briq-logo.png",
      imageAlt: "BRIQ Belt and Road Initiative Quarterly logo",
      tone: "logo",
    },
  ],
} as const;

export function HomeHeroSlider({ locale = "tr" }: { locale?: Locale }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const items = slides[locale];

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setActive((index) => (index + 1) % items.length), 9000);
    return () => window.clearInterval(timer);
  }, [items.length, paused]);

  const previous = () => setActive((index) => (index - 1 + items.length) % items.length);
  const next = () => setActive((index) => (index + 1) % items.length);

  const finishTouch = (clientX?: number) => {
    const startX = touchStartX.current;
    touchStartX.current = null;
    setPaused(false);
    if (startX === null || clientX === undefined) return;

    const distance = clientX - startX;
    if (Math.abs(distance) < 48) return;
    if (distance > 0) previous();
    else next();
  };

  return (
    <section
      className={`hero hero-${items[active].tone}`}
      aria-roledescription="carousel"
      aria-label={locale === "en" ? "BRIQ highlights" : "BRIQ öne çıkanlar"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(event) => {
        touchStartX.current = event.changedTouches[0]?.clientX ?? null;
        setPaused(true);
      }}
      onTouchEnd={(event) => finishTouch(event.changedTouches[0]?.clientX)}
      onTouchCancel={() => finishTouch()}
    >
      <div className="hero-rule" />
      <div className="hero-slides">
        {items.map((slide, index) => (
          <article className={`hero-slide ${index === active ? "is-active" : ""}`} aria-hidden={index !== active} key={slide.title}>
            <div className="site-shell hero-grid">
              <div className="hero-copy">
                <div className="eyebrow"><span>{slide.eyebrow}</span></div>
                <p className="hero-kicker">{slide.kicker}</p>
                <h1>{slide.title}<em>{slide.subtitle}</em></h1>
                <p className="hero-summary">{slide.summary}</p>
                <div className="hero-actions">
                  <a className="button button-dark" href={slide.href} tabIndex={index === active ? 0 : -1}>{slide.action} <span>→︎</span></a>
                  <a className="text-link" href={slide.secondaryHref} tabIndex={index === active ? 0 : -1}>{slide.secondary} <span>↗︎</span></a>
                </div>
              </div>
              <a className="issue-cover" href={slide.href} tabIndex={index === active ? 0 : -1}>
                <span className="cover-shadow cover-shadow-one" />
                <span className="cover-shadow cover-shadow-two" />
                <img src={slide.image} alt={slide.imageAlt} />
              </a>
            </div>
          </article>
        ))}
      </div>
      <div className="hero-bottom">
        <div className="site-shell hero-controls">
          <div className="trust-row"><span>{locale === "en" ? "Double-blind peer review" : "Çift kör hakemlik"}</span><span>CC BY 4.0</span><span>{locale === "en" ? "No author fees" : "Yazar ücreti yoktur"}</span><span>DOI: 10.67696</span></div>
          <div className="slider-controls">
            <button type="button" onClick={previous} aria-label={locale === "en" ? "Previous slide" : "Önceki slayt"}>←︎</button>
            <span>{String(active + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
            <button type="button" onClick={next} aria-label={locale === "en" ? "Next slide" : "Sonraki slayt"}>→︎</button>
          </div>
        </div>
      </div>
    </section>
  );
}
