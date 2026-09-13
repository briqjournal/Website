const indexServices = [
  {
    name: "ERIH PLUS",
    logo: "/assets/indexes/erih-plus.svg",
    href: "https://erihplus.hkdir.no/en/journal?id=509127",
    tr: "Beşerî ve sosyal bilimler için Avrupa referans dizinindeki doğrulanmış BRIQ kaydı.",
    en: "BRIQ’s verified record in the European Reference Index for the Humanities and Social Sciences.",
  },
  {
    name: "EuroPub",
    logo: "/assets/indexes/europub.svg",
    href: "https://europub.co.uk/journals/briq-belt-road-initiative-quarterly-J-33908",
    tr: "BRIQ dergi profili ile taranan makalelerin yer aldığı akademik dizin kaydı.",
    en: "Academic index record containing BRIQ’s journal profile and indexed articles.",
  },
  {
    name: "Root Indexing",
    logo: "/assets/indexes/root-indexing.svg",
    href: "https://rootindexing.com/journal/belt-road-initiative-quarterly-BRIQ/",
    tr: "BRIQ’in dergi bilgileri ve yayın kapsamını gösteren doğrudan profil sayfası.",
    en: "Direct profile page presenting BRIQ’s journal information and publication scope.",
  },
] as const;

const archiveServices = [
  {
    name: "SSOAR",
    logo: "/assets/indexes/ssoar.svg",
    href: "https://www.ssoar.info/ssoar/discover?query=2687-5896",
    tr: "BRIQ yayınlarının tam metin kayıtlarını kalıcı tanımlayıcılarla koruyan sosyal bilimler açık erişim deposu.",
    en: "Open social-science repository preserving full-text BRIQ records with persistent identifiers.",
  },
  {
    name: "ISSN Portal",
    logo: "/assets/indexes/issn.svg",
    href: "https://portal.issn.org/resource/ISSN/2687-5896",
    tr: "BRIQ’in basılı ISSN kaydına ve bağlantılı bibliyografik kimliğine doğrudan erişim.",
    en: "Direct access to BRIQ’s print ISSN record and linked bibliographic identity.",
  },
] as const;

function ServiceGrid({ services, locale }: { services: readonly { name: string; logo: string; href: string; tr: string; en: string }[]; locale: "tr" | "en" }) {
  return (
    <div className="index-detail-grid">
      {services.map((service) => (
        <a className="index-service-card" href={service.href} target="_blank" rel="noreferrer" key={service.name}>
          <span className="index-logo-wrap"><img src={service.logo} width="210" height="72" alt={`${service.name} logo`} loading="lazy" decoding="async" /></span>
          <h2>{service.name}</h2>
          <p>{locale === "en" ? service.en : service.tr}</p>
          <b>{locale === "en" ? "Open BRIQ record" : "BRIQ kaydını aç"} <span>↗︎</span></b>
        </a>
      ))}
    </div>
  );
}

export function IndexDirectory({ locale = "tr" }: { locale?: "tr" | "en" }) {
  return (
    <div className="index-directory">
      <section>
        <p className="section-kicker">{locale === "en" ? "Abstracting & Indexing" : "Dizinler · Abstracting & Indexing"}</p>
        <ServiceGrid services={indexServices} locale={locale} />
      </section>
      <section>
        <p className="section-kicker">{locale === "en" ? "Repositories & Bibliographic Archiving" : "Açık Erişim Depoları ve Bibliyografik Arşivleme"}</p>
        <ServiceGrid services={archiveServices} locale={locale} />
      </section>
    </div>
  );
}
