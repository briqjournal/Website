import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { IndexTicker, SiteFooter, SiteHeader } from "../../components/SiteChrome";
import { PdfViewer } from "../../components/PdfViewer";
import { AuthorLinks } from "../../components/AuthorLinks";
import { PublicationRecord } from "../../components/PublicationRecord";
import { ArchiveExplorer } from "../../components/ArchiveExplorer";
import { ArticleExplorer } from "../../components/ArticleExplorer";
import { CallsExplorer } from "../../components/CallsExplorer";
import { ContactForm } from "../../components/ContactForm";
import { SearchExplorer } from "../../components/SearchExplorer";
import { ScrollSpyNav, type ScrollSpyItem } from "../../components/ScrollSpyNav";
import { EditorialLongform } from "../../components/EditorialLongform";
import { PeopleDirectory } from "../../components/PeopleDirectory";
import { DergiParkLogo } from "../../components/DergiParkLogo";
import { ArticlePdfPage, ArticlePlatform } from "../../components/ArticlePlatform";
import { IssuePlatform, issueContributionCount } from "../../components/IssuePlatform";
import { CurrentIssueEditorial } from "../../components/CurrentIssueEditorial";
import { AuthorProfileActions } from "../../components/AuthorProfileActions";
import { IndexDirectory } from "../../components/IndexDirectory";
import { CallHero } from "../../components/CallHero";
import { completeCallCopyTr } from "../../call-content";
import { authorProfiles, findAuthorProfile, bylineAffiliation } from "../../authors";
import { archiveArticleListings, archiveIssueListings } from "../../archive-listing";
import { absoluteSiteUrl } from "../../site-url";
import { issueAccent } from "../../issue-themes";
import { getIssueCopy } from "../../issue-copy";
import { archiveEditorialHref, issueSupplementaryContents } from "../../issue-supplementary";
import {
  archiveArticles,
  archiveIssues,
  annualReports,
  articlePdfUrl,
  articleRouteSlug,
  currentIssueArticleAliases,
  findArticleByRouteSlug,
  findArchiveIssue,
  issueLabel,
} from "../../archive";
import {
  advisoryBoard,
  articleDetails,
  articles,
  calls,
  editorialBoard,
  editors,
  pastCalls,
} from "../../site-data";

type Section = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

function PageHero({
  kicker,
  title,
  intro,
  breadcrumbLabel,
}: {
  kicker?: string;
  title: string;
  intro?: string;
  breadcrumbLabel?: string;
}) {
  return (
    <section className="page-hero">
      <div className="page-hero-rule" />
      <div className="site-shell page-hero-inner">
        <div className="page-breadcrumb">
          <a href="/tr">Ana Sayfa</a>
          <span>/</span>
          <span>{breadcrumbLabel || kicker || title}</span>
        </div>
        {kicker && <p className="section-kicker light">{kicker}</p>}
        <h1>{title}</h1>
        {intro && <p>{intro}</p>}
      </div>
    </section>
  );
}

function LinkCards({
  items,
}: {
  items: { number: string; title: string; text: string; href: string }[];
}) {
  return (
    <div className="link-card-grid">
      {items.map((item) => (
        <a className="link-card" href={item.href} key={item.href}>
          <span>{item.number}</span>
          <h2>{item.title}</h2>
          <p>{item.text}</p>
          <b>İncele →︎</b>
        </a>
      ))}
    </div>
  );
}

function ProseSections({ sections }: { sections: Section[] }) {
  return (
    <div className="prose-sections">
      {sections.map((section, index) => (
        <section className="prose-section" key={section.title}>
          <span className="prose-index">{String(index + 1).padStart(2, "0")}</span>
          <div>
            <h2>{section.title}</h2>
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {section.bullets && (
              <ul>
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

function JournalOverview() {
  return (
    <>
      <PageHero
        kicker="Dergi"
        title="BRIQ hakkında"
        intro="BRIQ, gelişen dünyanın birikimini doğrudan buluşturan; uluslararası siyaset, ekonomi ve kültür alanlarında Türkçe ve İngilizce yayımlanan üç aylık bilimsel bir dergidir."
      />
      <div className="site-shell page-section">
        <div className="fact-strip">
          <div><span>Yayın takvimi</span><b>Aralık · Mart · Haziran · Eylül</b></div>
          <div><span>Yayın dilleri</span><b>Türkçe · English</b></div>
          <div><span>ISSN</span><b>2687-5896</b></div>
          <div><span>E-ISSN</span><b>2718-0581</b></div>
        </div>
        <LinkCards
          items={[
            { number: "01", title: "Yayın İlkeleri", text: "Derginin temel ilkeleri, çalışma alanları ve yayın yaklaşımı.", href: "/tr/dergi/yayin-ilkeleri" },
            { number: "02", title: "Yayın Kurulu", text: "Derginin editoryal yapısı, yayın kurulu ve editörleri.", href: "/tr/dergi/yayin-kurulu" },
            { number: "03", title: "Danışma Kurulu", text: "Bilimsel danışmanlık sağlayan uluslararası kurul.", href: "/tr/dergi/danisma-kurulu" },
            { number: "04", title: "Dizinler ve Arşivler", text: "BRIQ’in akademik dizin, açık erişim deposu ve arşivleme kayıtları.", href: "/tr/dergi/endeksler" },
            { number: "05", title: "Yıllık Raporlar", text: "Derginin faaliyetlerini, yayın performansını ve gelişimini belgeleyen raporlar.", href: "/tr/yillik-raporlar" },
            { number: "06", title: "İletişim", text: "Yönetim yeri, yayıncı bilgisi ve kurumsal iletişim kanalları.", href: "/tr/dergi/iletisim" },
          ]}
        />
      </div>
    </>
  );
}

function AboutBriq() {
  return (
    <>
      <PageHero kicker="Dergi" title="BRIQ Hakkında" intro="2019’dan beri Türkiye, Çin ve gelişen dünya arasında doğrudan bilgi alışverişi için bağımsız, iki dilli ve açık erişimli bir akademik alan." />
      <EditorialLongform
        navigationTitle="Bu sayfada"
        className="about-briq editorial-about"
        before={
          <>
            <section className="about-era-card" aria-label="BRIQ yayın tarihçesi">
              <div><span>2019</span><small>Yayın hayatının başlangıcı</small></div>
              <p>BRIQ, gelişen dünyanın araştırmacılarının kendi deneyimlerini, kavramlarını ve çözüm arayışlarını doğrudan tartışabildiği akademik bir alternatif alan oluşturmak üzere 2019’da yayın hayatına başladı.</p>
            </section>
            <div className="fact-strip">
              <div><span>Yayın sıklığı</span><b>Üç aylık</b></div>
              <div><span>Yayın dilleri</span><b>Türkçe · English</b></div>
              <div><span>Erişim</span><b>Açık erişim</b></div>
              <div><span>Değerlendirme</span><b>Çift kör hakemlik</b></div>
            </div>
          </>
        }
        sections={[
          {
            id: "briq-nedir",
            title: "BRIQ nedir?",
            subsections: [
              { id: "bilimsel-dergi", title: "Bilimsel ve iki dilli yayın", content: <p>BRIQ (Belt &amp; Road Initiative Quarterly) Türkçe-İngilizce yayınlanan üç aylık bir ekonomi, siyaset ve kültür dergisidir.</p> },
              { id: "alternatif-akademik-alan", title: "Alternatif bir akademik alan", content: <p>2019’dan beri yayımlanan BRIQ, Batı merkezli ikincil çerçevelere bağımlılığı azaltan; Türkiye, Çin ve gelişen dünya ülkelerinin kendi araştırma gündemlerini ve birikimlerini doğrudan paylaşabildiği bilimsel bir tartışma zemini geliştirmeyi amaçlar.</p> },
              { id: "dogrudan-bilgi", title: "Doğrudan bilgi alışverişi", content: <p>BRIQ, öncelikle Çin ve Türkiye’nin akademisyen, aydın ve karar vericileri arasında doğrudan görüş ve bilgi alışverişini sağlayacaktır. Aynı zamanda insanlığın ortak geleceği için tarihsel olanaklar sağlayan Kuşak ve Yol Girişimi temelinde bütün dünyanın, özellikle de gelişmekte olan dünyanın entelektüel birikimini bir araya getirecek bir platform olma iddiasındadır.</p> },
            ],
          },
          {
            id: "neden-yayimlaniyor",
            title: "Neden yayımlanıyor?",
            subsections: [
              { id: "bilgi-acigi-hakkinda", title: "Bilgi açığını aşmak", content: <p>Türkiye, gelişmekte olan ülkeler arasındaki işbirliğini ilerletmede kilit bir konuma sahiptir. Tıpkı eski İpekyolu’nda olduğu gibi, Kuşak ve Yol Girişimi’nin Asya’dan batıya açılan en ileri kapısı konumunda olacaktır. Yine Türkiye, Kuşak ve Yol Girişimi’nin Kuzey-Güney ve Doğu-Batı ekseninde son derece önemli bir konumdadır. Ancak genel olarak Çin’in gelişmesi ve Kuşak ve Yol Girişimi’nin insanlığın geleceğine katkıları; Türkiye’de akademide, medyada ve siyaset dünyasında çok yüzeysel bir şekilde bilinmektedir. Bu durumun başlıca nedeni, Türk akademi ve medyasının, buna bağlı olarak da siyasi karar vericilerin Çin’i Batı kaynaklarından takip etmeleridir. Aynı şekilde Türkiye’deki değişim ve dönüşümlerle ilgili bilgiler, Batı kaynakları süzgecinden geçerek Çin’e ve Kuşak ve Yol Girişimi’nin potansiyel ortakları olan diğer ülkelere ulaşmaktadır.</p> },
              { id: "asya-yuzyili-hakkinda", title: "Asya Yüzyılı’nın olanaklarını anlamak", content: <p>BRIQ, Asya Yüzyılı’na doğru ortaya çıkan yeni olanak ve güçlükleri derinlemesine anlama amacıyla yayın hayatına atılmıştır.</p> },
            ],
          },
          {
            id: "yayin-yaklasimi",
            title: "Yayın yaklaşımı",
            subsections: [
              { id: "kamucu-ekonomi-hakkinda", title: "Kamucu ekonomi", content: <p>Dergi, bireysel kâr ve çıkar sistemine karşı halkın yararının temel ilke olarak benimsendiği kamucu ekonomilerin dönüştürücü gücünü ortaya koyan entelektüel katkıların yayımlanmasına adanmıştır. Özellikle Kuşak ve Yol Girişimi’nin kamucu ekonomi modelinin uygulanmasındaki rolünü ve bu girişimin gelecekteki ortaklarının mevcut dönüştürücü potansiyele katkılarını anlamak derginin öncelikleri arasındadır.</p> },
              { id: "adil-dunya-duzeni", title: "Adil bir dünya düzeni", content: <p>BRIQ, adil bir uluslararası dünya düzeni altında insanlığın birliğini savunmaktadır. Dolayısıyla dergi, Avrasya, Afrika ve Amerika başta olmak üzere tüm dünyadan seçkin akademisyen ve aydınların buluştuğu bir yayın organı olacaktır. Barış, kardeşlik, işbirliği, refah, toplumsal fayda ve ortak kalkınma ilkeleri temelinde yeni bir uygarlığın savunucuları BRIQ çatısı altında buluşacaklardır.</p> },
            ],
          },
          {
            id: "kurumsal-yapi",
            title: "Kurumsal yapı",
            subsections: [
              { id: "yayinci", title: "Yayıncı", content: <p>BRIQ, Çin İş Geliştirme ve Dostluk Derneği tarafından yayımlanmaktadır. Derginin sahibi, Çin İş Geliştirme ve Dostluk Derneği (Türk-Çin İş Der) adına Emine Sağlam’dır.</p> },
              { id: "bagimsiz-karar", title: "Bağımsız yayın kararları", content: <><p>Yayıncı derginin kurumsal ve idari sürdürülebilirliğini sağlar; tekil yazıların değerlendirme, kabul, revizyon veya ret kararları bilimsel yayın organları tarafından verilir.</p><p>Dergi yazarlardan başvuru, değerlendirme veya yayın ücreti almaz. Sponsor, bağışçı ve dış paydaşlar hakem seçimine ya da yayın kararına müdahale edemez.</p></> },
            ],
          },
        ]}
      />
    </>
  );
}

function PublicationPrinciples() {
  const navigation: ScrollSpyItem[] = [
    { id: "degisen-dunya", label: "Değişen dünya ve Kuşak ve Yol", level: 2 },
    { id: "cok-kutuplulasma", label: "Çok kutuplulaşma ve ortak kalkınma", level: 3, parentId: "degisen-dunya" },
    { id: "kusak-ve-yol", label: "Kuşak ve Yol Girişimi", level: 3, parentId: "degisen-dunya" },
    { id: "turkiyenin-konumu", label: "Türkiye’nin stratejik konumu", level: 2 },
    { id: "bilgi-acigi", label: "Türkiye ile Çin arasındaki bilgi açığı", level: 3, parentId: "turkiyenin-konumu" },
    { id: "briqin-gorevi", label: "BRIQ’in yayın görevi", level: 2 },
    { id: "asya-yuzyili", label: "Asya Yüzyılı ve doğrudan bilgi alışverişi", level: 3, parentId: "briqin-gorevi" },
    { id: "kamucu-ekonomi", label: "Kamucu ekonomi ve adil dünya düzeni", level: 3, parentId: "briqin-gorevi" },
  ];
  return (
    <>
      <PageHero kicker="Dergi" title="Yayın İlkeleri" />
      <div className="site-shell reading-layout publication-principles-layout">
        <ScrollSpyNav title="Bu sayfada" items={navigation} />
        <div className="reading-content publication-principles">
          <section className="principle-section" id="degisen-dunya">
            <h2>Değişen dünya ve Kuşak ve Yol</h2>
            <div className="principle-subsection" id="cok-kutuplulasma">
              <h3>Çok kutuplulaşma ve ortak kalkınma</h3>
              <p>Dünya siyasetinin çok kutuplulaşması ve gelişmekte olan ülkeler arasındaki işbirliğinin hız kazanması, Amerika Birleşik Devletleri’nin tek kutuplu bir dünya düzeni yaratma arzusunu boşa çıkarmıştır. İşte böyle bir dönemde, emperyalist devletlerin küreselleşmeciliğini reddeden yeni bir dünya düzeninin şekillendiği gözlemlenmektedir. Şekillenmekte olan yeni dünya düzeni, kamusal ağırlıklı projeler üzerinden ortak kalkınma ve dayanışma sağlamaya meyilli gelişmekte olan ülkelerin gereksinim ve özlemlerine yanıt vermelidir. Özellikle Çin Halk Cumhuriyeti Devlet Başkanı Xi Jinping’in 2013’te ortaya attığı Kuşak ve Yol Girişimi, bu temelde yeni bir işbirliği modeli için uygun bir fırsat ve zemin oluşturmuştur.</p>
            </div>
            <div className="principle-subsection" id="kusak-ve-yol">
              <h3>Kuşak ve Yol Girişimi</h3>
              <p>Kuşak ve Yol Girişimi, İpekyolu kavramını yeniden uygulamaya yönelik büyük ve çığır açıcı bir hamledir. İpekyolu, 2 bin yıl öncesine kadar Çin’in küresel refaha, ticarete ve işbirliğine yoğun şekilde katkı koyduğu bir dönemi betimlemektedir. Günümüzün İpekyolu projesi ise bu kez demir ve deniz yollarının yanı sıra dijital sistemleri de içermektedir.</p>
              <p>Kuşak ve Yol Girişimi; Çin’in teklifi ve desteğiyle Asya, Avrupa, Afrika ve Latin Amerika’dan 60’ın üzerinde ülkeyi ortak refah ve kalkınma gayesiyle bir araya getirmeyi öneriyor. Bütün bu ülkeler, günümüzde dünya üretiminin yarısını gerçekleştirmektedir. Kuşak ve Yol Girişimi; Batı merkezli dünya düzeninden farklı olarak, insanlığın ortak çıkarları adına küresel üretim ve ticareti ilerletmeye yönelik barışçıl bir işbirliği yaratma arzusundadır. Emperyalist sömürü düzenini kesin olarak reddetmektedir. Barut, baharat, ipekliler, pusula ve kâğıdı 2 bin yıl önce insanlığa sunan Asya merkezli İpekyolu; bugün de yapay zekâ, kuantum bilgisayarı, yeni enerji ve malzeme teknolojileriyle uzay vizyonunu yaygınlaştırmayı gelişmekte olan ülkelere teklif ediyor. Bunun yanı sıra, Kuşak ve Yol Girişimi, ekosistemi yok olmanın eşiğine getiren iklim değişikliği ve diğer çevresel tehditlere karşı biyoekonomik planların oluşturulup harekete geçirilmesi için paydaş ülkelere teşvik ve fırsatlar sunmaktadır.</p>
            </div>
          </section>
          <section className="principle-section" id="turkiyenin-konumu">
            <h2>Türkiye’nin stratejik konumu</h2>
            <div className="principle-subsection" id="bilgi-acigi">
              <h3>Türkiye ile Çin arasındaki bilgi açığı</h3>
              <p>Türkiye, gelişmekte olan ülkeler arasındaki işbirliğini ilerletmede kilit bir konuma sahiptir. Tıpkı eski İpekyolu’nda olduğu gibi, Kuşak ve Yol Girişimi’nin Asya’dan batıya açılan en ileri kapısı konumunda olacaktır. Yine Türkiye, Kuşak ve Yol Girişimi’nin Kuzey-Güney ve Doğu-Batı ekseninde son derece önemli bir konumdadır. Ancak genel olarak Çin’in gelişmesi ve Kuşak ve Yol Girişimi’nin insanlığın geleceğine katkıları; Türkiye’de akademide, medyada ve siyaset dünyasında çok yüzeysel bir şekilde bilinmektedir. Bu durumun başlıca nedeni, Türk akademi ve medyasının, buna bağlı olarak da siyasi karar vericilerin Çin’i Batı kaynaklarından takip etmeleridir. Aynı şekilde Türkiye’deki değişim ve dönüşümlerle ilgili bilgiler, Batı kaynakları süzgecinden geçerek Çin’e ve Kuşak ve Yol Girişimi’nin potansiyel ortakları olan diğer ülkelere ulaşmaktadır.</p>
            </div>
          </section>
          <section className="principle-section" id="briqin-gorevi">
            <h2>BRIQ’in yayın görevi</h2>
            <div className="principle-subsection" id="asya-yuzyili">
              <h3>Asya Yüzyılı ve doğrudan bilgi alışverişi</h3>
              <p>BRIQ, Asya Yüzyılı’na doğru ortaya çıkan yeni olanak ve güçlükleri derinlemesine anlama amacıyla yayın hayatına atılmıştır.</p>
              <p>BRIQ, öncelikle Çin ve Türkiye’nin akademisyen, aydın ve karar vericileri arasında doğrudan görüş ve bilgi alışverişini sağlayacaktır. Aynı zamanda insanlığın ortak geleceği için tarihsel olanaklar sağlayan Kuşak ve Yol Girişimi temelinde bütün dünyanın, özellikle de gelişmekte olan dünyanın entelektüel birikimini bir araya getirecek bir platform olma iddiasındadır.</p>
            </div>
            <div className="principle-subsection" id="kamucu-ekonomi">
              <h3>Kamucu ekonomi ve adil dünya düzeni</h3>
              <p>Dergi, bireysel kâr ve çıkar sistemine karşı halkın yararının temel ilke olarak benimsendiği kamucu ekonomilerin dönüştürücü gücünü ortaya koyan entelektüel katkıların yayımlanmasına adanmıştır. Özellikle Kuşak ve Yol Girişimi’nin kamucu ekonomi modelinin uygulanmasındaki rolünü ve bu girişimin gelecekteki ortaklarının mevcut dönüştürücü potansiyele katkılarını anlamak derginin öncelikleri arasındadır.</p>
              <p>BRIQ, adil bir uluslararası dünya düzeni altında insanlığın birliğini savunmaktadır. Dolayısıyla dergi, Avrasya, Afrika ve Amerika başta olmak üzere tüm dünyadan seçkin akademisyen ve aydınların buluştuğu bir yayın organı olacaktır. Barış, kardeşlik, işbirliği, refah, toplumsal fayda ve ortak kalkınma ilkeleri temelinde yeni bir uygarlığın savunucuları BRIQ çatısı altında buluşacaklardır.</p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function BoardPage({ title, people, intro }: { title: string; people: string[][]; intro: string }) {
  return <><PageHero kicker="Dergi" title={title} intro={intro} /><div className="site-shell page-section board-page-section"><PeopleDirectory title={title} people={people} compact /></div></>;
}

function PublicationBoardPage() {
  const editorInChief = editorialBoard.filter(([name]) => name === "Fikret Akfırat");
  const boardMembers = editorialBoard.filter(([name]) => name !== "Fikret Akfırat");
  const languageEditors = editors.filter(([, affiliation]) => affiliation === "İngilizce Dil Editörü");
  const editorialStaff = editors.filter(([, affiliation]) => affiliation !== "İngilizce Dil Editörü");
  return (
    <>
      <PageHero
        kicker="Dergi"
        title="Yayın Kurulu"
        intro="BRIQ’in editoryal sorumlulukları, yayın kurulu ve editör kadrosu akademik dergi künyesi düzeninde sunulur."
      />
      <div className="site-shell page-section board-page-section editorial-info-page">
        <PeopleDirectory title="Genel Yayın Yönetmeni" people={editorInChief} />
        <PeopleDirectory title="Yayın Kurulu" people={boardMembers} />
        <PeopleDirectory title="Editörler" people={editorialStaff} />
        <PeopleDirectory title="Dil Editörleri" people={languageEditors} />
      </div>
    </>
  );
}
function AdvisoryBoardPage() { return <BoardPage title="Danışma Kurulu" people={advisoryBoard} intro="Farklı ülkelerden ve disiplinlerden uzmanlarla BRIQ’e bilimsel danışmanlık sağlayan kurul." />; }
function EditorialTeamPage() { return <BoardPage title="Editörlük Ekibi" people={editors} intro="Dosya takibi, dil, çeviri, redaksiyon ve yayına hazırlık çalışmalarını yürüten ekip." />; }

function AimScope() {
  return (
    <>
      <PageHero
        kicker="Dergi"
        title="Yayın ilkeleri"
        intro="BRIQ, çok kutuplulaşmanın yarattığı yeni olanakları gelişen ülkelerin deneyimleri üzerinden inceleyen, doğrudan bilgi ve görüş alışverişini güçlendirmeyi amaçlayan bir akademik platformdur."
      />
      <div className="site-shell reading-layout">
        <aside className="reading-nav">
          <b>Bu sayfada</b>
          <a href="#amac">Amaç</a>
          <a href="#kapsam">Kapsam</a>
          <a href="#yonelim">Yayın yaklaşımı</a>
          <a href="#diller">Yayın dilleri</a>
        </aside>
        <div className="reading-content">
          <section id="amac">
            <h2>Amaç</h2>
            <p>
              BRIQ, Türkiye, Çin ve gelişen dünyanın akademisyenleri, aydınları
              ve karar vericileri arasında Batı merkezli ikincil kaynaklara
              bağımlı olmayan doğrudan bir bilgi alışverişi kurmayı amaçlar.
              Kuşak ve Yol Girişimi’nin ortak kalkınma, bağlantısallık ve
              uluslararası işbirliği bakımından açtığı imkânları eleştirel ve
              bilimsel biçimde tartışmaya açar.
            </p>
            <p>
              Dergi, barış, karşılıklı yarar, toplumsal fayda ve adil bir
              uluslararası düzen doğrultusunda özgün araştırmalar için kalıcı bir
              yayın ortamı sunmayı hedefler.
            </p>
          </section>
          <section id="kapsam">
            <h2>Kapsam</h2>
            <div className="topic-grid">
              {[
                "Uluslararası ilişkiler ve çok kutupluluk",
                "Politik ekonomi ve kalkınma",
                "Kuşak ve Yol Girişimi",
                "Türkiye–Çin ilişkileri",
                "Asya, Afrika ve Latin Amerika çalışmaları",
                "Bilim, teknoloji ve üretici güçler",
                "Kültür, tarih ve uygarlıklar arası ilişkiler",
                "Kamu politikası, çevre ve ortak refah",
              ].map((topic) => <span key={topic}>{topic}</span>)}
            </div>
          </section>
          <section id="yonelim">
            <h2>Yayın yaklaşımı</h2>
            <p>
              BRIQ, gelişmekte olan ülkeleri yalnızca inceleme nesnesi olarak
              değil, dünya siyasetini ve düşüncesini kuran failler olarak ele
              alan çalışmalara öncelik verir. Kamucu ekonomi, ortak kalkınma ve
              küresel eşitlik konularındaki araştırmalar derginin karakteristik
              ilgi alanları arasındadır.
            </p>
            <p>
              Bu yönelim, hakemli makalelerde bilimsel yöntem, kaynak kullanımı,
              eleştiriye açıklık ve araştırma etiği ölçütlerinin yerine geçmez;
              editoryal kapsam ile bilimsel değerlendirme birbirinden ayrı
              aşamalar olarak yürütülür.
            </p>
          </section>
          <section id="diller">
            <h2>Yayın dilleri ve içerik türleri</h2>
            <p>
              Gönderiler Türkçe veya İngilizce kabul edilir. Hakemli araştırma
              makalelerinin yanında kitap incelemesi, röportaj, araştırma-
              inceleme yazısı ve editoryal içerik yayımlanabilir. Her içerik,
              türü ve hakemlik statüsü açıkça belirtilerek sunulur.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}

function Organization() {
  const roles = [
    ["Genel Yayın Yönetmeni", "Yayın Kurulu’na başkanlık eder; akademik ve editoryal süreçlerin bütününü yönetir ve dergiyi temsil eder."],
    ["Yayın Kurulu", "Derginin yayın çizgisini ve içerik önceliklerini belirler; gönderilerin kapsam ve bilimsel hazırlık bakımından değerlendirilmesine katkı verir."],
    ["Yayın Kurulu Koordinatörü", "Ön incelemeden sayı onayına kadar editoryal aşamalar arasındaki eşgüdümü sağlar."],
    ["Yazıişleri Müdürü", "Dosya takibi, hakemlik, revizyon, dil çalışması, çeviri, yayına hazırlık ve arşiv süreçlerini düzenler."],
    ["Danışma Kurulu", "Konu, uzman, yazar ve bilimsel yönelim önerileriyle dergiye danışmanlık sağlar."],
    ["Editörler", "Biçimsel inceleme, kaynak kontrolü, dil, çeviri, redaksiyon ve yayına hazırlık görevlerini yürütür."],
    ["Genel Müdür", "Derginin idari yönetimi, basım, dağıtım, tanıtım ve yayın operasyonlarından sorumludur; akademik karar organlarından ayrı çalışır."],
  ];
  return (
    <>
      <PageHero
        kicker="Dergi"
        title="Kurullar ve editoryal ekip"
        intro="Akademik karar, bilimsel danışma, editoryal üretim ve yayıncı yönetimi birbirinden ayrılmış görev alanları olarak gösterilir."
      />
      <div className="site-shell page-section">
        <section className="role-grid">
          {roles.map(([title, text], index) => (
            <article key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h2>{title}</h2>
              <p>{text}</p>
            </article>
          ))}
        </section>
        <PeopleDirectory title="Yayın Kurulu" people={editorialBoard} />
        <PeopleDirectory title="Danışma Kurulu" people={advisoryBoard} />
        <PeopleDirectory title="Editörler" people={editors} />
      </div>
    </>
  );
}

function Publisher() {
  return (
    <>
      <PageHero
        kicker="Dergi"
        title="Yayıncı ve editoryal bağımsızlık"
        intro="BRIQ’in yayıncı tüzel kişiliği, akademik karar mekanizması ve idari sorumlulukları açık biçimde ayrıştırılır."
      />
      <div className="site-shell page-section">
        <div className="publisher-card">
          <span>Yayıncı</span>
          <h2><a href="https://www.cinisder.com/tr">Çin İş Geliştirme ve Dostluk Derneği ↗︎</a></h2>
          <p>Türk-Çin İş Der · İstanbul, Türkiye</p>
          <dl>
            <div><dt>Yayın türü</dt><dd>Süreli bilimsel dergi</dd></div>
            <div><dt>Sahibi</dt><dd>Dernek adına Emine Sağlam</dd></div>
            <div><dt>Genel Yayın Yönetmeni</dt><dd>Fikret Akfırat</dd></div>
            <div><dt>Genel Müdür</dt><dd>Elif Nisa Kılavuz</dd></div>
          </dl>
        </div>
        <ProseSections
          sections={[
            {
              title: "Editoryal bağımsızlık",
              paragraphs: [
                "Yayıncı; derginin kurumsal, mali ve idari sürdürülebilirliğini sağlar. Bir makalenin hakeme gönderilmesi, kabulü, revizyonu veya reddine ilişkin bilimsel kararlar Genel Yayın Yönetmeni ve yetkili akademik editörler tarafından verilir.",
                "Yayıncı, sponsor, reklamveren, destekçi veya dış paydaşlar tekil makalelerin akademik değerlendirme sonucuna müdahale edemez.",
              ],
            },
            {
              title: "DergiPark’ın rolü",
              paragraphs: [
                "DergiPark, BRIQ’in başvuru ve editoryal iş akışını yürüttüğü akademik altyapı hizmetidir. Platform kullanımı derginin yayıncı kimliğini veya editoryal bağımsızlığını değiştirmez.",
              ],
            },
            {
              title: "Gelir modeli ve ücretler",
              paragraphs: [
                "BRIQ’in finansmanı bağışlar ve sponsorluklardan sağlanır. Dergi yazarlardan başvuru, değerlendirme, makale işlem, sayfa, renkli görsel, çeviri veya yayın ücreti almaz.",
                "Bağışçı ve sponsorlar; yazı seçimi, hakem ataması, değerlendirme, kabul, ret veya yayın sıralaması kararlarına müdahale edemez. Finansman ve idari faaliyetler, yayın kararları üzerinde hak doğurmaz.",
              ],
            },
          ]}
        />
      </div>
    </>
  );
}

function Indexes() {
  return (
    <>
      <PageHero
        kicker="Dergi"
        title="Dizinler ve Arşivler"
        intro="BRIQ’in doğrulanmış dizin ve akademik arşiv kayıtları, işlevleri açıkça ayrılarak gösterilir."
      />
      <div className="site-shell page-section">
        <IndexDirectory />
      </div>
    </>
  );
}

function Contact() {
  return (
    <div className="contact-page">
      <PageHero
        kicker="İletişim"
        title="İletişim"
        intro="Editoryal sorular, yayın süreçleri ve kurumsal iletişim için BRIQ’e aşağıdaki kanallardan ulaşabilirsiniz."
      />
      <div className="site-shell page-section contact-grid contact-grid-compact">
        <article>
          <span>E-posta</span>
          <h2><a href="mailto:briq@briqjournal.com">briq@briqjournal.com</a></h2>
          <p>Başvuru dosyaları DergiPark üzerinden gönderilmelidir.</p>
        </article>
        <article>
          <span>Yönetim yeri</span>
          <h2>Üsküdar · İstanbul</h2>
          <p>Ünalan Mahallesi, Libadiye Caddesi No:84, Üsküdar / İstanbul</p>
        </article>
        <article>
          <span>Dergi iletişim sorumlusu</span>
          <h2>İbrahim Fikret Akfırat</h2>
          <p><a href="mailto:fikretakfirat@briqjournal.com">fikretakfirat@briqjournal.com</a></p>
        </article>
        <article>
          <span>Makale gönderimi</span>
          <h2 className="dergipark-heading"><DergiParkLogo /></h2>
          <a className="underlined-link" href="https://dergipark.org.tr/tr/journal/4696/submission/step/manuscript/new">Gönderim ekranını aç ↗︎</a>
        </article>
      </div>
      <div className="site-shell contact-form-wrap contact-form-wrap-compact"><ContactForm /></div>
    </div>
  );
}

function PolicyHub() {
  return (
    <>
      <PageHero
        kicker="Politikalar"
        title="Şeffaf yayıncılık ilkeleri"
        intro="BRIQ’in değerlendirme, araştırma etiği, açık erişim ve yayın sonrası sorumlulukları dört anlaşılır politika grubu altında toplanır."
      />
      <div className="site-shell page-section">
        <LinkCards
          items={[
            { number: "01", title: "Yazım Kuralları", text: "İçerik türleri, uzunluklar, biçim ve başvuru koşulları.", href: "/tr/yazarlar/yazim-kurallari" },
            { number: "02", title: "Yayın Değerlendirme Süreci", text: "Ön inceleme, hakemlik, revizyon ve son onay.", href: "/tr/yazarlar/yayin-degerlendirme-sureci" },
            { number: "03", title: "Yayın Etiği", text: "Yazar, hakem ve editörlerin etik sorumlulukları.", href: "/tr/yazarlar/yayin-etigi" },
            { number: "04", title: "Telif Hakkı Şartları ve Lisans", text: "Yazar taahhütleri, telif ve CC BY 4.0.", href: "/tr/yazarlar/telif-hakki-sartlari-ve-lisans" },
          ]}
        />
      </div>
    </>
  );
}

function EvaluationPolicy() {
  const steps = [
    ["Başvuru", "Yazar dosyayı DergiPark üzerinden Türkçe veya İngilizce gönderir."],
    ["Ön inceleme", "Kapsam, tür, anonimleştirme, biçim, özgünlük ve temel etik şartlar kontrol edilir."],
    ["Benzerlik kontrolü", "Benzerlik raporu bağlamı içinde editoryal olarak değerlendirilir; tek bir yüzde otomatik karar ölçütü değildir."],
    ["Editör ataması", "Alan uygunluğu ve çıkar çatışması gözetilerek sorumlu editör belirlenir."],
    ["Çift kör hakemlik", "Hakemli araştırma makaleleri, yazar ve hakem kimlikleri karşılıklı gizlenerek en az iki bağımsız dış hakeme gönderilir."],
    ["Karar", "Kabul, küçük düzeltme, büyük düzeltme veya ret kararlarından biri gerekçeli olarak bildirilir."],
    ["Revizyon", "Yazar değişiklikleri ve hakemlere yanıtını sunar; gerekli görülürse dosya yeniden hakeme gider."],
    ["Yayına hazırlık", "Dil, kaynak, çeviri, redaksiyon, mizanpaj ve yazar son onayından sonra yayınlanır."],
  ];
  return (
    <>
      <PageHero
        kicker="Politikalar"
        title="Yayın ve değerlendirme"
        intro="Editör ön incelemesi ile bilimsel hakem değerlendirmesi ayrılır; kararlar gerekçeli, kayıtlı ve çıkar çatışmasından uzak biçimde yürütülür."
      />
      <div className="site-shell page-section">
        <div className="process-grid">
          {steps.map(([title, text], index) => (
            <article key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h2>{title}</h2>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <ProseSections
          sections={[
            {
              title: "Hakem seçimi ve bağımsızlık",
              bullets: [
                "Hakemler makalenin konusu, yöntemi ve literatürü bakımından uzman kişiler arasından seçilir.",
                "Hakemlerin yazarlardan bağımsız ve tercihen farklı kurumlardan olması gözetilir.",
                "Çıkar çatışması bulunan editör veya hakem dosyadan çekilir.",
                "Hakem görüşleri belirgin biçimde ayrışırsa üçüncü hakeme başvurulabilir veya editör gerekçeli karar verebilir.",
                "Hakem raporları değerlendirme sürecine temel oluşturur; kabul, revizyon veya ret konusunda nihai karar mercii Yayın Kurulu’dur.",
              ],
            },
            {
              title: "İçerik türleri ve hakemlik statüsü",
              paragraphs: [
                "Özgün araştırma makaleleri çift kör dış hakemlikten geçer. Kitap incelemesi, röportaj, editoryal, haber bülteni ve davetli içeriklerin hakemlik durumu içerik sayfasında açıkça belirtilir.",
              ],
            },
            {
              title: "Özel sayılar",
              paragraphs: [
                "Özel sayılar ve konuk editörlü dosyalar BRIQ’in genel etik ve değerlendirme ilkelerine tabidir. Konuk editörün kendi yazısı veya yakın işbirliği bulunan bir çalışma bağımsız bir editör tarafından yönetilir.",
              ],
            },
            {
              title: "Editoryal kayıt",
              paragraphs: [
                "Başvuru, inceleme, hakem daveti, rapor, karar, revizyon ve son onay aşamaları tarih ve sorumlu kullanıcı bilgisiyle kaydedilir. Ret edilen dosyalar dahil editoryal kanıt dosyaları güvenli biçimde saklanır.",
              ],
            },
          ]}
        />
      </div>
    </>
  );
}

function EthicsPolicy() {
  return (
    <>
      <PageHero
        kicker="Yazarlar İçin"
        title="Yayın Etiği"
        intro="BRIQ’in yayın etiği ilkeleri ile editörlerin, eser sahiplerinin ve hakemlerin sorumlulukları."
      />
      <EditorialLongform
        navigationTitle="Bu sayfada"
        className="for-authors-longform ethics-page"
        sections={[
          {
            id: "etik-ilkeler",
            title: "Etik İlkeler",
            subsections: [
              { id: "dergi-yayin-etigi", title: "Dergi Yayın Etiği", content: <><p>Kuşak ve Yol Girişimi Dergisi, ulusal ve uluslararası akademik ilke ve etik değerlere bağlı bir yayın politikası izler. Bu bağlamda, uluslararası geçerliğe sahip COPE (Committee on Publication Ethics) Directory of Open Access Journals (DOAJ), Open Access Scholarly Publishers Association (OASPA) tarafından ortaya konulan standartları da kapsayan yayın etiği ilkelerine sahiptir.</p><p>Kuşak ve Yol Girişimi Dergisi bünyesinde gerçekleşen yayın değerlendirme süreci öncesinde, sırasında veya sonunda, Kuşak ve Yol Girişimi Dergisi Yayın İlkeleri’nin yanı sıra yukarıda sıralanan etik ilkelerle ilgili esaslara ve standartlara aykırı olduğu objektif olarak tespit edilen eserlerin yayın talepleri reddedilir. Kuşak ve Yol Girişimi Dergisi’nde yayımlanmış eserler bakımından böylesi bir tespitin yapılması halinde, ilgili eser yayından kaldırılır.</p></> },
            ],
          },
          {
            id: "gorev-ve-sorumluluklar",
            title: "Görev ve sorumluluklar",
            subsections: [
              { id: "editorlerin-sorumluluklari", title: "Editörlerin Görev ve Sorumlulukları", content: <><p>Kuşak ve Yol Girişimi Dergisi bünyesindeki görevli editörler ve editör yardımcıları, her türlü önyargıdan uzak, objektif ve tarafsız bir şekilde görevlerini yerine getirmekle yükümlüdür.</p><p>Kuşak ve Yol Girişimi Dergisi bünyesindeki görevli editörler ve editör yardımcıları, görevlerinin gerektirdiği ölçüde gizlilik içerisinde hareket etmelidir.</p><p>Kuşak ve Yol Girişimi Dergisi bünyesinde görevli editörler ve editör yardımcıları, yayın sürecine ilişkin her türlü etkinlikte iş birliği içerisinde hareket etmelidir. Dergi bünyesinde adil görev dağılımı yapılması iş birliğinin özünü oluşturmaktadır.</p></> },
              { id: "eser-sahiplerinin-sorumluluklari", title: "Eser Sahiplerinin Etik Sorumlulukları", content: <><p>Eserlerinin Kuşak ve Yol Girişimi Dergisi’nde yayımlanmasını isteyen eser sahipleri, 5846 sayılı Fikir ve Sanat Eserleri Kanunu hükümlerine, YÖK tarafından Bilimsel Araştırma ve Yayın Etiği Yönergesi’nde belirlenen esaslara, COPE tarafından ortaya konulan standartlara ve Kuşak ve Yol Girişimi Dergisi tarafından benimsenen diğer esaslara ve standartlara uymakla yükümlüdür.</p><p>Eser sahipleri, yayımlanması için Kuşak ve Yol Girişimi Dergisi’ne gönderdikleri eserlerini, ilgili esaslara ve standartlara uygun olarak hazırladıklarını taahhüt etmiş kabul edilirler.</p></> },
              { id: "hakemlerin-sorumluluklari", title: "Hakemlerin Etik Sorumlulukları", content: <><p>Hakemler, Dergi veya Derginin yetkili kıldığı birimler tarafından kendilerine gönderilen eserlerin eser incelemesini dikkatli bir şekilde yerine getirmelidir; eser değerlendirmesini uzmanlık alanlarına uygun olarak, tarafsız ve adil bir şekilde yapmalıdır.</p><p>Hakemler, değerlendirdikleri eserlerde akademik ilke ve etik değerlere, ulusal veya uluslararası esas veya standartlara aykırılık tespit ettiği takdirde, Dergi editör kurulunu derhal bilgilendirmekle yükümlüdür.</p><p>Hakemler, değerlendirmeyi yapıcı ve nazik bir dille yapmalıdır. Düşmanlık, iftira ve hakaret içeren aşağılayıcı kişisel yorumlar yapılmamalıdır.</p><a className="editorial-next-link" href="/tr/yazarlar/telif-hakki-sartlari-ve-lisans">Telif Hakkı Şartları ve Lisans →︎</a></> },
            ],
          },
        ]}
      />
    </>
  );
}

function AccessPolicy() {
  return (
    <>
      <PageHero
        kicker="Yazarlar İçin"
        title="Telif Hakkı Şartları ve Lisans"
        intro="Telif devri anlaşmasının hükümleri, yazar sorumlulukları ve Creative Commons lisansı."
      />
      <EditorialLongform
        navigationTitle="Bu sayfada"
        className="for-authors-longform copyright-page"
        before={<div className="license-lead"><img src="/assets/cc-by.png" alt="Creative Commons BY 4.0" loading="lazy" decoding="async" /><div><span>Lisans</span><h2>Creative Commons Atıf 4.0 Uluslararası</h2><p>CC BY 4.0</p></div></div>}
        sections={[
          {
            id: "haklarin-devri",
            title: "Hakların devri",
            subsections: [
              { id: "anlasmanin-kapsami", title: "Anlaşmanın kapsamı", content: <><p>İlgili yazar ve tüm diğer yazarlar bir bütün olarak “Yazarlar” ve tek tek “Yazar” olarak kabul edilmektedir. Yazarlar, Dergi sahibine (bundan sonra “Yayın Sahibi” olarak anılacak) telif hakkının tam süresini, uzatmalarını ve ilgili yenilemelerini, telif hakkıyla ilgili tüm hakları, ismi ve menfaatleri ile yasaların tanıdığı tüm hakları ve dava yollarını; tüm dünyada başkalarına ait telif hakkı olan herhangi bir materyal (metin ya da grafik) ve yazarlar tarafından hazırlanan ve gönderilen herhangi bir revizyon hariç olmak üzere Yayın Sahibinin adına makaleye telif hakkı kaydetme hakkı da dahil ve bununla sınırlı olmamak kaydıyla; ve tek başına ya da derlemeler içinde tüm biçimleriyle ve medya ya da herhangi bir yöntem, araç ya da işlemle ve herhangi bir mevcut ya da daha sonra oluşturulan ya da geliştirilen kanal aracılığıyla çoğaltmak, basmak, yeniden basmak, tüm yabancı dillere çevirisini yapmak ve diğer türev çalışmaların, dağıtım, satış, lisans, devir, nakil ve açıkça kopyalarını teşhir etmek ve makalenin bütün ya da bir bölümünün diğer kullanımlarının münhasır hakkını; ve lisans verme ve yukarıda sayılanların yapılmasında başkalarını yetkilendirme ve bu belgede tanınan hakları nakil ve devir etmeye ilişkin münhasır hakkını devretmeyi kabul ederler. Şu anda veya gelecekte telif hakkı kapsamında mevcut olan herhangi bir hakkın, bu Anlaşmanın hükümleri uyarınca Yayın Sahibine özel olarak verilmediği hallerde, bu hakkın aşağıda verildiği varsayılır.</p><p>Yazarlar tarafından sağlanan Anlaşma Hükümlerinin 2. Bölümünde tanımlandığı şekilde Makalenin özeti (“Özet”) ve herhangi Tamamlayıcı Materyallerle ilgili olarak, Yazarlar işbu belge ile gayrımünhasır olarak Makale ile ilgili yukarıda sayılan tüm haklarını ve lisanslarını Yayın Sahibine devreder. Bu belgede, Makale, Özet ve Tamamlayıcı Materyaller bütün bir şekilde “Makale” olarak kabul edilir.</p></> },
            ],
          },
          {
            id: "anlasma-hukumleri",
            title: "Anlaşma hükümleri",
            subsections: [
              { id: "taahhutler-zarar-giderim", title: "1. Taahhütler; Zarar Giderim", content: <p>Yazarlar, müştereken ve müteselsilen, şunları taahhüt ve beyan ederler: (a) tüm Yazarlar bu Anlaşmayı imzalamak ve yürütmek ve de burada sunulan hakları taahhüt etmek konusunda tam yetkiye sahiptir ve bu haklar artık devretme, kopya etme ya da diğer yükümlülükler için öncelik sağlamamaktadır; (b) Makale Yazarların orijinal çalışmasıdır (yazılı izin alınmış üçüncü kişiler tarafından telif hakkı olan materyaller hariç), herhangi bir biçimde daha önceden yayımlanmamıştır (Makalenin daha önce umuma dağıtımı yapıldığı bilgisi Editöre iletilenler hariç) ve yalnızca Dergi’ye gönderilmiştir; (c) Makale telif haklarını ihlal edemez veya herhangi bir mülkiyet hakkını, gizlilik hakkını veya reklam hakkını veyahut üçüncü taraflarla ilgili herhangi bir hakkı çiğneyemez, ve hakaret içeren veya hukuk dışı herhangi bir materyal içeremez; (d) Makalede yer alan gerçek olduğu ileri sürülen tüm beyanlar ve veri açıklamaları doğru veya genel olarak doğru kabul edilen profesyonel araştırma deneyimlerine dayanmaktadır, ve bu kapsama giren hiçbir formül ya da yöntem Makalede yer alan talimatlara ve uyarılara uygun şekilde kullanılırsa zarara yol açmaz. Yukarıda sayılan taahhütler ve beyanlar çiğnendiği takdirde Yazarlar, müştereken ve müteselsilen, zararı gidermeli ve Yayın Sahibinin, Dergi Editörlerinin ve Yayın Sahibi’nin bağlı kuruluşlarının, devirlerinin ve lisanslarının (özellikle BRIQ, eğer Yayın Sahibi BRIQ değilse) bu tür ihlallerle ilgili iddia ya da taleplerden meydana gelen veya bunlardan kaynaklanan herhangi kayıplarını, yükümlülüklerini, zararlarını, maliyetlerini ve harcamalarını (yasal maliyet ve giderleri dahil) giderecektir.</p> },
              { id: "tamamlayici-materyaller", title: "2. Tamamlayıcı Materyaller", content: <p>Bu Anlaşmada kullanılan Tamamlayıcı Materyaller, Makale ile ilgili fakat Dergi’de yayımlanan Makale şekliyle sınırlı olmayan Yazarlar ve Yayın Sahibi tarafından sağlanan tüm materyalleri ifade eder. Tamamlayıcı Materyaller, aşağıda sayılanlarla sınırlı olmayacak şekilde şunları içerir: veri setleri, sözel-görsel röportajlar, podcastler (yalnızca işitsel) ve vodcatler (işitsel ve görsel), ekler, ilave metinler, çizelgeler, resimler, çizimler, fotoğraflar, bilgisayar grafikleri ve film görüntüleri. Yazarların bu materyaller için Yayın Sahibine verdiği münhasır olmayan hakları ve lisansları, Yazarların veya Yazarların yetkilendirdiği kişilerin Tamamlayıcı Materyalleri yeniden yayımlamasını hiçbir şekilde kısıtlamaz.</p> },
              { id: "duzeltme-redaksiyon", title: "3. Düzeltme; Redaksiyon; Renkli Görüntüler", content: <p>Editör ve/veya Yayın Sahibi (ve/veya BRIQ, eğer Yayın Sahibi farklıysa) Makaleyi ve Tamamlayıcı Materyalleri, eğer varsa açıklık, kısalık, doğruluk, dilbilgisi, kelime kullanımı, stil uygunluğu ve sunumu bakımından Editörün ve/veya Yayın Sahibinin Dergiye uygulanması ve Dergide yayımlanması için uygun gördüğü şekilde kontrol edip düzenleyebilir. İlgili Yazar, Makalenin düzeltmelerini redakte etmeli ve önerilen düzeltmeleri ve diğer değişiklikleri zamanında dönüş yapılabilmesi için talimat verildiği şekilde Yayın Sahibine süresi içinde belirtmelidir.</p> },
              { id: "yayin-etigi-yasal-baglilik", title: "4. Yayın Etiği & Yasal Bağlılık", content: <p>İşbu Anlaşmayı ihlal ettiği tespit edilen Makaleler yayımlanmadan çekilebilir (aşağıdaki Sona Erme bölümüne bakınız) ve/veya düzeltmeye tabi tutulabilir. Yayın Sahibi (ve/veya BRIQ, eğer Yayın Sahibi BRIQ değilse) sınırlı olmayacak şekilde şu haklarını saklı tutar: bir baskı hatası ya da bir düzeltme yayımlamak; Makaleyi geri çekmek; sorunu bölüm başkanı ya da yazarın kurumunun dekanıyla ve/veya ilgili akademik kuruluş ya da topluluklarla yürütmek; veyahut uygun yasal yollara başvurmak.</p> },
              { id: "sona-erme", title: "5. Sona Erme", content: <p>İşbu Anlaşma, Makalenin tüm telif hakkı sahipleri tarafından ya da onlar adına yayımlama şartı olarak imzalanmak zorundadır. Yayın Sahibi, Makalenin Dergide yayımlanacağını garanti etmemektedir. Herhangi bir sebeple Makale Dergide yayımlanmazsa Yayın Sahibine sunulan Makalenin tüm hakları Yazarlara intikal edecektir ve bu Anlaşma artık uygulanmayacak ve ne Yayın Sahibi (ne de BRIQ, eğer Yayın Sahibi BRIQ değilse) ne de Yazarlar, Makale ile ilgili diğer yükümlülüklerden sorumlu olmayacaktır.</p> },
              { id: "genel-hukumler", title: "6. Genel Hükümler", content: <><p>Bu Anlaşmadan doğan ya da bu Anlaşmayla ilgili bir anlaşmazlık ortaya çıktığında, taraflar ilk olarak bu anlaşmazlığı çözme yönünde bir iyi niyet göstermeyi kabul ederler. Taraflar, başarısız olduklarında, taraflarca karşılıklı olarak üzerinde anlaşmaya varılacak bir arabulucu ile bağlayıcı olmayan arabuluculuk yapacaklardır. Tarafların kendi kendilerine veya arabuluculuk yoluyla çözemedikleri Anlaşmadan doğan ya da bu Anlaşmayla ilgili herhangi bir tartışma veya talep veyahut bunlarla ilgili ihlal tahkim yoluyla çözülecektir. Taraflar arasındaki herhangi bir yasal işlemde veya diğer yargılama işlemlerinde (tahkim yargılamaları dahil), davada kazanan taraf, kaybeden taraftan sınırlı olmaksızın makul avukat ücretleri ve maliyetleri dahil olmak üzere, bu tür işlem veya işlemlerde maruz kalınan tüm makul masraf ve harcamaları geri alma hakkına sahiptir.</p><p>İşbu Anlaşma&apos;nın herhangi bir hükmünde yapılacak değişiklik veya düzenleme, tüm taraflarca yazılı olarak imzalanmadıkça geçerli veya bağlayıcı olmayacaktır. Bu Anlaşma, konuyla ilgili olarak taraflar arasındaki tüm anlaşmayı oluşturur ve önceki ve çağdaş tüm anlaşmaların, anlayışların ve beyanların yerine geçer. Bu Anlaşmanın herhangi bir özel hükmünün geçersizliği veya uygulanamazlığı diğer hükümleri etkilemez ve bu Anlaşma bakımdan geçersiz veya uygulanamaz bir hüküm yazılmamış sayılır. Bu Anlaşma, her biri orijinal olarak kabul edilecek, hepsi birlikte bir ve aynı belgeyi oluşturacak benzerlerinde yürütülebilir. Bu Anlaşmanın faks edilmiş bir kopyası veya başka bir elektronik kopyası orijinal kabul edilecektir. Taraflar, elektronik imzalarının bu Anlaşmanın yasal imzaları yerine geçmesine izin vermektedir.</p></> },
              { id: "menfaat-catismasi", title: "7. Menfaatlerin Çatışması Beyanı", content: <p>Yazarlar, mali ve ticari desteklerin tüm biçimleri dahil ve bunlarla sınırlı olmamak üzere, Makale ile ilgili menfaat çatışması gündeme getirebilecek her türlü ticari veya mali katılımlar ve Derginin makale gönderim kılavuzunda belirtilen diğer olası çatışmalar dahil Makaledeki tüm olası menfaat çatışmalarının ve Makaleyle birlikte yer alan mektubun kabul edildiğini onaylarlar.</p> },
              { id: "ucuncu-taraf-materyalleri", title: "8. Üçüncü Tarafların Materyalleriyle ilgili Yazarların Sorumlulukları", content: <p>Yazarlar; (i) Makalede orijinal olmayan tüm materyallerin tam atıfı dahil, (ii) tüm kitle iletişim araçlarında ve dünyadaki tüm dillerde kalıcı olarak yayımlanmasına izin veren herhangi bir üçüncü taraf materyali için Makale yazılı izinlerini güvence altına almak ve sunmak, (iii) bu izinler için gerekli ödemeleri yapmakla yükümlüdür.</p> },
            ],
          },
          {
            id: "yazar-onayi-ve-lisans",
            title: "Yazar onayı ve lisans",
            subsections: [
              { id: "uygulama-ve-imzalar", title: "Uygulama ve imzalar", content: <><p>• BRIQ, Makalenin İlgili Yazarına Makalenin elektronik bir kopyasını sağlayacaktır.</p><p>Eğer Makale için birden fazla telif hakkı sahipliği mevcutsa, her bir Yazar bu sözleşmenin basılı bir kopyasını imzalamalıdır.</p><p>Sorularınız veya bu Anlaşmanın basılı bir kopyasını almak için lütfen <a href="mailto:briq@briqjournal.com">briq@briqjournal.com</a> ile iletişime geçiniz.</p><p>Çalışmanın telif hakkı Yazarlar&apos;a aittir. Yazar, Makaleye ilişkin telif hakkının Yazarlar’a ait olduğunu beyan ve taahhüt eder.</p><p>İmzacı Yazar, bu Anlaşmayı tüm Yazarlar adına imzalayarak her bir Yazardan bu Anlaşmayı kendi adına imzalamak ve burada belirtilen hakları devretmek için yazılı izin aldığını beyan ve taahhüt etmiş olur. Yazarlar, her biri tarafından imzalanması ve doğrudan Yayın Ofisine geri gönderilmesine ilişkin bu Anlaşmanın bir sürümü için Yayın Ofisi ile iletişime geçerek her bir Yazarın bu Anlaşmanın ayrı bir kopyasını imzalama seçeneğine sahip olduğunu anlarlar.</p></> },
              { id: "cc-by-lisansi", title: "Creative Commons Atıf 4.0", content: <p>BRIQ, yalnızca uygun atıf verilerek metinlerin kopyalanmasına, indirilmesine, yeniden dağıtımına ve paylaşılmasına izin veren Creative Commons Atıf 4.0 Uluslararası Lisansı ( CC BY 4.0 ) kullanır.</p> },
            ],
          },
        ]}
      />
    </>
  );
}

function PostPublicationPolicy() {
  return (
    <>
      <PageHero
        kicker="Politikalar"
        title="Yayın sonrası süreçler"
        intro="Bilimsel kaydın güvenilirliği, yayımdan sonra ortaya çıkan hata ve etik iddiaların görünür, orantılı ve kalıcı biçimde ele alınmasını gerektirir."
      />
      <div className="site-shell page-section">
        <ProseSections
          sections={[
            {
              title: "Şikâyet ve itiraz",
              paragraphs: [
                "Yazarlar editoryal karara, süreç ihlaline veya etik meseleye ilişkin gerekçeli şikâyet ve itirazlarını briq@briqjournal.com adresine iletebilir.",
                "İtiraz hakem değerlendirmesine ilişkinse Editör Kurulu dosyaya yeni bir hakem atar. Yeni rapor ve önceki süreç kayıtları birlikte değerlendirilir; nihai karar Yayın Kurulu tarafından verilir.",
              ],
            },
            {
              title: "Düzeltme",
              paragraphs: [
                "Makalenin ana bulgularını geçersiz kılmayan fakat bilimsel kaydı etkileyen hata için DOI ile bağlantılı, tarihli ve açık bir düzeltme metni yayımlanır. Asıl makale kaydı düzeltmeye çift yönlü bağlanır.",
              ],
            },
            {
              title: "Geri çekme ve ifade-i endişe",
              paragraphs: [
                "Veri uydurma, ciddi intihal, etik dışı araştırma veya bulguları güvenilmez kılan temel hata halinde geri çekme değerlendirilir. İnceleme sürerken okurun korunması gerekiyorsa geçici bir ifade-i endişe yayımlanabilir.",
              ],
            },
            {
              title: "Sürüm ve kalıcılık",
              paragraphs: [
                "Yayımlanan kayıt sessizce değiştirilmez. Düzeltme tarihi, kapsamı ve önceki sürümle ilişkisi görünür tutulur; DOI kalıcıdır.",
              ],
            },
            {
              title: "Dijital koruma",
              paragraphs: [
                "Yayımlanan sayı ve makale dosyalarının yedek kopyaları, editoryal erişim kontrollü Yandex çevrimiçi depolamasında saklanır. Editoryal kanıt dosyaları kamuya kapalı ve yetki kontrollü tutulur.",
                "Bu düzen çevrimiçi yedekleme sağlar; BRIQ hâlen LOCKSS, PKP Preservation Network veya Portico gibi bağımsız bir uzun dönem dijital koruma hizmeti kullanmamaktadır.",
              ],
            },
          ]}
        />
      </div>
    </>
  );
}

function AuthorsHub() {
  return (
    <>
      <PageHero
        kicker="Yazarlar İçin"
        title="Yazarlar İçin"
        intro="Gönderim koşulları, değerlendirme süreci, yayın etiği ve telif şartları tek bir yol haritasında."
      />
      <div className="site-shell page-section authors-hub-page">
        <div className="fact-strip">
          <div><span>Yayın dilleri</span><b>Türkçe · English</b></div>
          <div><span>Başvuru ücreti</span><b>Ücretsiz</b></div>
          <div><span>Akademik makale</span><b>5000–9000 kelime</b></div>
          <div><span>Değerlendirme</span><b>Çift kör hakemlik</b></div>
        </div>
        <div className="submission-lead">
          <div>
            <span>Başvuru kanalı</span>
            <h2 className="dergipark-heading"><DergiParkLogo /></h2>
            <p>Türkçe ve İngilizce gönderiler kabul edilir. Başvuru ve yayın ücretsizdir.</p>
          </div>
          <a className="button button-dark" href="https://dergipark.org.tr/tr/journal/4696/submission/step/manuscript/new">Yeni başvuru ↗︎</a>
        </div>
        <LinkCards
          items={[
            { number: "01", title: "Yazım Kuralları", text: "İçerik türleri, uzunluklar, anonimleştirme, özet ve APA 7 kuralları.", href: "/tr/yazarlar/yazim-kurallari" },
            { number: "02", title: "Yayın Değerlendirme Süreci", text: "Ön inceleme, hakemlik, revizyon, çeviri ve son onay aşamaları.", href: "/tr/yazarlar/yayin-degerlendirme-sureci" },
            { number: "03", title: "Yayın Etiği", text: "Yazar, hakem ve editörlerin etik görev ve sorumlulukları.", href: "/tr/yazarlar/yayin-etigi" },
            { number: "04", title: "Telif Hakkı Şartları ve Lisans", text: "Yazar taahhütleri, telif devri, tamamlayıcı materyaller ve CC BY 4.0.", href: "/tr/yazarlar/telif-hakki-sartlari-ve-lisans" },
          ]}
        />
        <section className="authors-process-module">
          <p className="section-kicker">Süreç özeti</p>
          <h2>Gönderimden yayına</h2>
          <div className="process-overview">
            {[["01", "Kuralları inceleyin"], ["02", "Dosyayı gönderin"], ["03", "Hakemlik"], ["04", "Revizyon"], ["05", "Son onay"]].map(([number, label]) => <div key={number}><span>{number}</span><b>{label}</b></div>)}
          </div>
        </section>
      </div>
    </>
  );
}

function WritingRules() {
  return (
    <>
      <PageHero
        kicker="Yazarlar İçin"
        title="Yazım Kuralları"
        intro="BRIQ’e gönderilecek çalışmaların kapsamı, biçimi, uzunluğu ve değerlendirme koşulları."
      />
      <EditorialLongform
        navigationTitle="Bu sayfada"
        className="for-authors-longform"
        sections={[
          {
            id: "icerik-turleri-ve-kelime-sayilari",
            title: "İçerik türleri ve kelime sayıları",
            content: (
              <div className="format-table">
                <div className="format-row format-head"><b>İçerik türü</b><b>Uzunluk</b><b>Değerlendirme</b></div>
                <div className="format-row"><span>Akademik makale</span><span>5000–9000 kelime</span><span>Çift kör hakemlik</span></div>
                <div className="format-row"><span>Kitap incelemesi</span><span>En çok 1000 kelime</span><span>Editoryal inceleme</span></div>
                <div className="format-row"><span>Araştırma / inceleme</span><span>En çok 3000 kelime</span><span>Editoryal inceleme</span></div>
                <div className="format-row"><span>Haber bülteni</span><span>En çok 1500 kelime</span><span>Editoryal inceleme</span></div>
                <div className="format-row"><span>Ana makale</span><span>En çok 3500 kelime</span><span>Editoryal inceleme</span></div>
              </div>
            ),
          },
          {
            id: "dergi-ve-kapsam",
            title: "Dergi ve yayın kapsamı",
            subsections: [
              { id: "briq-ve-icerik", title: "BRIQ ve içerik türleri", content: <><p>BRIQ (Belt &amp; Road Initiative Quarterly) Türkçe-İngilizce, açık erişimli, üç aylık uluslararası siyaset, ekonomi ve kültür dergisidir.</p><p>BRIQ Dergisi, akademik makalelerden kitap incelemelerine, araştırma/inceleme yazılarına, röportajlara, haber bültenlerine ve ana makalelere uzanan geniş bir içerik dizisini yayınlar.</p><p>Yayın Kurulu, özel konular için bildiri çağrısı yayınlayabilir; yazılara katkı sağlaması için yazarları davet edebilir. Ayrıca talep edilmemiş gönderileri de memnuniyetle karşılar.</p></> },
              { id: "ucret-politikasi", title: "Ücret politikası", content: <p>Makalelerin gönderimi ya da basılması için herhangi bir ücret talep edilmemektedir.</p> },
            ],
          },
          {
            id: "gonderim-kosullari",
            title: "Gönderim koşulları",
            subsections: [
              { id: "dil-dosya-ozgunluk", title: "Dil, dosya ve özgünlük", content: <><p>Gönderiler İngilizce ya da Türkçe kabul edilir. Tüm gönderiler kısa bir biyografi (en fazla 150 kelime) içermeli ve <a href="mailto:briq@briqjournal.com">briq@briqjournal.com</a> adresine Microsoft Word dosya eki olarak gönderilmelidir. Daha önceden yayımlanmış olan ya da başka dergiler tarafından incelenmekte olan makaleler ve diğer içerikler yayımlama için dikkate alınmayacaktır.</p><p>BRIQ, American Psychological Association (APA, 7th edition, <a href="https://apastyle.apa.org/">www.apastyle.org</a>) yöntemini izler ve İngilizce makalelerde Amerikan İngilizcesi yazımını kullanır.</p></> },
              { id: "akademik-makaleler", title: "Akademik makaleler", content: <p>BRIQ, tüm “akademik makaleler” için çift kör hakem değerlendirme sürecini uygular. Akademik makaleler özetler, notlar, referanslar ve diğer tüm içerikler dahil 5000 ila 9000 kelime aralığında olmalıdır. Bir özet (en fazla 200 kelime) ve 5 anahtar kelime içeren tamamen isimsizleştirilmiş yazının ve tam yazar bilgisinin dahil olduğu bir kapak sayfası da dergiye ulaştırılmalıdır.</p> },
              { id: "diger-icerikler", title: "Diğer içerik türleri", content: <><p>Kitap incelemeleri 1000 kelimeden uzun olmamalıdır. İki ya da daha fazla çalışmayı içeren araştırma/inceleme yazıları en fazla 3000 kelime olabilir.</p><p>Haber gelişmelerinin kısa analizini içeren haber bültenleri, 1500 kelimeden uzun olmamalıdır. Rapor ve analizi birleştiren ana makaleler en fazla 3500 kelime olabilir.</p><p>Röportaj önerileri için lütfen Yayın Kurulu ile iletişime geçiniz.</p><a className="editorial-next-link" href="/tr/yazarlar/yayin-degerlendirme-sureci">Yayın Değerlendirme Süreci →︎</a></> },
            ],
          },
        ]}
      />
    </>
  );
}

function Checklist() {
  const groups = [
    ["Ana dosya", ["Başlık, özet ve beş anahtar kelime bulunuyor.", "Metin APA 7 kurallarına göre düzenlendi.", "Yazar kimliğini açığa çıkaran bütün bilgiler kaldırıldı.", "Tablo, şekil ve kaynaklar numaralı ve eksiksiz."]],
    ["Yazar dosyası", ["Tüm yazarların adları, kurumları ve e-posta bilgileri yer alıyor.", "ORCID numaraları eklendi.", "Sorumlu yazar belirtildi.", "En çok 150 kelimelik kısa özgeçmiş eklendi."]],
    ["Etik beyanlar", ["Çıkar çatışması beyanı eklendi.", "Fon ve destek bilgisi açıklandı.", "Gerekliyse etik kurul/onam bilgisi verildi.", "Veri erişilebilirliği ve yapay zekâ kullanım beyanları hazırlandı."]],
    ["Son kontroller", ["Çalışma daha önce yayımlanmadı ve başka yerde değerlendirmede değil.", "Üçüncü taraf görselleri için izinler alındı.", "Dosya adı yazar kimliğini açığa çıkarmıyor.", "Başvuru DergiPark’taki bütün zorunlu alanlar doldurularak tamamlandı."]],
  ];
  return (
    <>
      <PageHero
        kicker="Yazarlar İçin"
        title="Gönderim kontrol listesi"
        intro="Başvurunuzu tamamlamadan önce aşağıdaki dört gruptaki maddeleri doğrulayın."
      />
      <div className="site-shell page-section checklist-grid">
        {groups.map(([title, rawItems], groupIndex) => {
          const items = rawItems as string[];
          return (
            <section key={title as string}>
              <span>{String(groupIndex + 1).padStart(2, "0")}</span>
              <h2>{title as string}</h2>
              {items.map((item) => (
                <label key={item}><i aria-hidden="true">✓</i><span>{item}</span></label>
              ))}
            </section>
          );
        })}
      </div>
    </>
  );
}

function ReviewFlow() {
  return (
    <>
      <PageHero
        kicker="Yazarlar İçin"
        title="Yayın Değerlendirme Süreci"
        intro="Hakemli gönderilerin ön incelemeden baskıya kadar izlediği on aşamalı süreç."
      />
      <EditorialLongform
        navigationTitle="Bu sayfada"
        className="for-authors-longform review-process-page"
        before={
          <div className="process-overview" aria-label="Değerlendirme sürecinin özeti">
            {[["01", "Ön inceleme"], ["02", "Editoryal uyum"], ["03", "Uzman hakemlik"], ["04", "Revizyon"], ["05", "Yayına hazırlık"]].map(([number, label]) => <div key={number}><span>{number}</span><b>{label}</b></div>)}
          </div>
        }
        sections={[
          {
            id: "on-inceleme",
            title: "Ön inceleme",
            subsections: [
              { id: "basvuru-ve-kapsam", title: "Başvuru ve kapsam", content: <><p>BRIQ Kuşak ve Yol Girişimi Dergisi, İngilizce ve Türkçe makaleleri kabul eder. Tüm makaleler her iki dilde de yayımlanır.</p><p>Makalelerin kabulü aşağıda belirtilen aşamalardan oluşur:</p><p>a)Dergiye ulaşan makaleler, öncelikle Genel Yayın Yönetmeni, Yayın Kurulu Koordinatörü ve Yazıişleri Müdürü’nün yönetiminde editörler tarafından BRIQ Yayın İlkeleri, özgünlük, ilan edilen kapak dosyasına uygunluk, güncellik ve intihal dahil etik kriterler bakımından incelenir.</p><p>b)Makalenin ön inceleme değerlendirmesinin ek uzmanlık gerektirdiği hallerde Yayın veya Danışma Kurulu’ndaki alanın uzmanına başvurulabilir.</p><p>c)Eğer gönderi bir özel sayı için gönderilmişse, ilgili yazı BRIQ Yayın İlkelerine, araştırma etiğine ve özel konuya uygunluk bakımından ayrıca özel sayı editörüne iletilir.</p><p>d)İlgili yazarın gönderileri BRIQ Yazım Kurallarına uygun olmalıdır. Yazım kurallarına göre düzenlenmemiş ise BRIQ Yazıişleri, ilgili yazarla iletişime geçerek verilen süre içinde istenen değişikliklerin uygulanmasını ister. Bu aşamada yazarlardan fotoğraf, grafik vb. görsel içerik önerileri talep edilebilir.</p></> },
              { id: "editoryal-duzenlemeler", title: "Editoryal düzenlemeler", content: <><p>Editoryal düzenlemeler ilk incelemede şunları içerir:</p><ol><li>Makalenin derginin yazım kurallarına uygunluğu</li><li>Atıf ve kaynakça bilgilerinin eşleştirilmesi</li><li>İntihal raporu sonucu gerekli düzenlemelerin belirtilmesi</li><li>Başlık ve ara başlık ihtiyacı varsa tespit edilmesi</li><li>Kaynak bilgisi gereken yerlerin belirlenmesi</li></ol></> },
            ],
          },
          {
            id: "hakemlik-ve-revizyon",
            title: "Hakemlik ve revizyon",
            subsections: [
              { id: "uzman-degerlendirmesi", title: "Uzman değerlendirmesi", content: <><p>e) Ön incelemeyi geçen her araştırma makalesi, çift kör hakemlik ilkesi doğrultusunda, ilgili alanda uzman en az iki bağımsız hakeme gönderilir. Hakemlerin mümkün olduğunca farklı kurumlardan seçilmesine özen gösterilir.</p><p>Hakem görüşlerinin esaslı biçimde ayrışması halinde editör değerlendirmesiyle karar verilebilir veya üçüncü bir hakem görüşüne başvurulabilir.</p><p>f)Hakem raporları yazara yollanır ve verilen süre içinde düzeltme isteklerini uygulayıp makaleyi yollaması istenir.</p><p>g)Hakem raporunun kapsamlı değişiklikler yapılmasını önermesi durumunda, yazar tarafından gözden geçirilen gönderiler yeniden hakem onayına sunulur. Eğer hakem raporu yalnızca biçimsel değişiklikler öneriyorsa ilgili gönderi hakem önerilerine uygunluk bakımından incelenmek üzere Yazıişleri Müdürü’ne gönderilir.</p></> },
            ],
          },
          {
            id: "yayina-hazirlik",
            title: "Yayına hazırlık",
            subsections: [
              { id: "ceviri-ve-son-onay", title: "Çeviri ve son onay", content: <><p>h)Gözden geçirilen makale çeviriye yollanır. Çeviriden gelen metin, Yazıişleri Müdürü’nün görevlendireceği editör tarafından kontrol edilir ve son şekli verilerek Yazıişleri’ne ulaştırılır.</p><p>i) Çeviri metinle birlikte son şekli verilen gönderiler ilgili yazarın onayına sunulur ve Telif Hakkı Şartlarını kabul etmesi istenir. Bu aşamada, ilgili yazar yalnızca sınırlı değişiklikler yapabilir. Yazarların değişiklik önerileri Yazıişleri’nin uygun bulduğu ölçüde metne yansıtılır.</p><p>j) Yazar tarafından onaylanan gönderilerin son hali Yazıişleri’nin kontrolünden geçerek baskıya gönderilir.</p><a className="editorial-next-link" href="/tr/yazarlar/yayin-etigi">Yayın Etiği →︎</a></> },
            ],
          },
        ]}
      />
    </>
  );
}

function Archive() {
  return (
    <div className="archive-page">
      <PageHero
        title="Tüm sayılar"
        breadcrumbLabel="Arşiv"
      />
      <div className="site-shell page-section">
        <div className="archive-tools"><p><b>{archiveIssues.length} sayı</b> · 7 cilt · 2019–2026</p><a className="underlined-link" href="/tr/guncel-sayi">Güncel sayıya git →︎</a></div>
        <ArchiveExplorer issues={archiveIssueListings} />
      </div>
    </div>
  );
}

function Articles() {
  return (
    <>
      <PageHero
        kicker="Yayınlar"
        title="Makale Arama"
        intro="BRIQ arşivindeki makale, röportaj, kitap incelemesi ve diğer katkıları başlık, yazar, özet, DOI, yıl ve cilt bilgisiyle arayın."
      />
      <div className="site-shell page-section">
        <ArticleExplorer articles={archiveArticleListings} />
      </div>
    </>
  );
}

function AuthorProfilePage({ id }: { id: string }) {
  const profile = findAuthorProfile(id);
  if (!profile) return null;
  return (
    <>
      <section className="author-page-hero">
        <div className="site-shell author-page-hero-inner">
          <div className="page-breadcrumb"><a href="/tr">Ana Sayfa</a><span>/</span><span>Yazar</span></div>
          <div className="author-page-identity">
            {profile.photo ? <img className="author-page-photo" src={profile.photo} alt={`${profile.name} portresi`} loading="lazy" decoding="async" /> : <span className="author-page-monogram" aria-hidden="true">{profile.name.slice(0, 1)}</span>}
            <div><p className="section-kicker">{profile.rolesTr.length ? profile.rolesTr.join(" · ") : "Yazar"}</p><h1>{profile.name}</h1><p>{profile.affiliationTr}</p></div>
          </div>
          <AuthorProfileActions authorName={profile.name} email={profile.email} scholarUrl={profile.scholarUrl} orcids={profile.orcids} institutionUrl={profile.institutionUrl} />
        </div>
      </section>
      <div className="site-shell author-page-layout">
        <aside><span>BRIQ yayınları</span><b>{profile.articles.length}</b><p>Bu sayfa, yazarın BRIQ arşivindeki bütün çalışmalarını bir araya getirir.</p></aside>
        <div className="author-page-main">
          <section className={`author-transparency ${profile.briqAppointments.length ? "" : "biography-only"}`} aria-label="Kısa biyografi ve BRIQ görevleri">
              <article className="author-profile-panel">
                <p className="section-kicker">Profil</p>
                <h2>Kısa biyografi</h2>
                <p>{profile.biographyTr}</p>
              </article>
              {profile.briqAppointments.length > 0 && <article className="author-profile-panel author-role-panel">
                <p className="section-kicker">BRIQ</p>
                <h2>Görevler ve dönemler</h2>
                <dl className="author-role-list">
                  {profile.briqAppointments.map((appointment) => (
                    <div key={`${appointment.roleTr}-${appointment.termTr}`}><dt>{appointment.roleTr}</dt><dd>{appointment.termTr}</dd></div>
                  ))}
                </dl>
                <small>Görev dönemleri yayımlanmış güncel 2026 kurul kaydını esas alır.</small>
              </article>}
            </section>
          <section className="author-page-publications">
            <div><p className="section-kicker">Arşiv</p><h2>BRIQ’te yayımlanan çalışmalar</h2></div>
            <div className="author-work-list">
              {profile.articles.map((article) => (
                <a href={`/tr/makaleler/${article.slug}`} key={`${article.volume}-${article.issue}-${article.slug}`}>
                  <span className="author-work-issue" style={{ backgroundColor: issueAccent(article.volume, article.issue) }}>Cilt {article.volume} · Sayı {article.issue} · {article.year}</span>
                  <h3>{article.title_tr}</h3>
                  <p>{article.pages ? `ss. ${article.pages}` : article.season_tr}{article.doi ? ` · DOI: ${article.doi}` : ""}</p>
                  <b aria-hidden="true">→︎</b>
                </a>
              ))}
              {profile.articles.length === 0 && <p className="author-work-empty">Bu kurul üyesinin BRIQ arşivinde imzalı bir çalışması henüz bulunmuyor.</p>}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function CurrentIssue() {
  const record = findArchiveIssue(7, 4);
  if (!record) return null;
  const heading = getIssueCopy(7, 4, "tr");
  return (
    <IssuePlatform
      record={record}
      locale="tr"
      current
      coverSrc="/assets/current-issue-tr.jpg"
      periodLabel="Eylül 2026"
      title={heading.title}
      subtitle={heading.subtitle}
      description="Batı Asya’daki yeni güç dengesini; Suudi Arabistan’ın kültürel dengeleme stratejisinden Türkiye–Çin ilişkilerine, Dijital İpek Yolu’ndan Çin’in küresel altyapı yaklaşımına uzanan çalışmalarla ele alan yeni sayı."
      facts={[["Yayın tarihi", "Eylül 2026"], ["Sayfa", "131"], ["Yayın dili", "Türkçe · English"], ["Erişim", "Açık erişim · CC BY 4.0"]]}
      contentsDescription=""
      editorialHref="/tr/guncel-sayi/sunus"
      additionalContents={[
        { typeTr: "Şiir", typeEn: "Poem", author: "Attilâ İlhan", titleTr: "Yalnızlığı Denemek", titleEn: "Trying Loneliness", pages: "501–502", pdfPage: 131 },
        { typeTr: "Şiir", typeEn: "Poem", author: "Salah Abdel Sabour · Çeviren: Latif Bolat", titleTr: "Hüzün", titleEn: "Sorrow", pages: "503–504", pdfPage: 133 },
        { typeTr: "Fotoğraf", typeEn: "Photograph", author: "Philippe Halsman", titleTr: "Dalí Atomicus (1948)", titleEn: "Dalí Atomicus (1948)", pages: "505", pdfPage: 135 },
        { typeTr: "Resim", typeEn: "Painting", author: "Pablo Picasso", titleTr: "Saltimbanques Ailesi (1905)", titleEn: "Family of Saltimbanques (1905)", pages: "506", pdfPage: 136 },
        { typeTr: "Karikatür", typeEn: "Cartoon", author: "Y. Çerepanov", titleTr: "Kendi Uçak Gemisini Denize Sürüyor (1979)", titleEn: "Launching His Own Aircraft Carrier (1979)", pages: "507", pdfPage: 137 },
      ]}
    />
  );
}

function CallsPage() {
  return (
    <>
      <PageHero
        title="Makale Çağrıları"
        intro="BRIQ’in tematik sayıları, özel dosyaları ve sürekli açık kitap incelemesi çağrısı."
      />
      <div className="site-shell page-section">
        <h2 className="page-section-title" id="aktif">Aktif çağrılar</h2>
        <div className="calls-page-grid">
          {calls.map((call) => (
            <a href={call.url} key={call.title}>
              {call.image ? <img src={call.image} alt="" loading="lazy" decoding="async" /> : <div className="call-fallback">BRIQ</div>}
              <div>
                <span>{call.status} · {call.deadlineLabel}: {call.deadline}</span>
                <h2>{call.title}</h2>
                <p>{call.summary}</p>
                <b>Çağrıyı incele ↗︎</b>
              </div>
            </a>
          ))}
        </div>
        <CallsExplorer calls={pastCalls} />
      </div>
    </>
  );
}

function Reports() {
  return (
    <>
      <PageHero
        kicker="Dergi"
        title="Yıllık raporlar"
        intro="BRIQ’in yayın faaliyetlerini, uluslararası erişimini ve kurumsal gelişimini belgeleyen yıllık raporlar."
      />
      <div className="site-shell page-section report-list">
        {annualReports.map((report) => (
          <a href={`/tr/yillik-raporlar/${report.number}`} key={report.number}>
            <span>{String(report.number).padStart(2, "0")}</span>
            <div><small>{report.dateTr}</small><h2>BRIQ {report.titleTr}</h2></div>
            <b>PDF ↗︎</b>
          </a>
        ))}
      </div>
    </>
  );
}

function ArchiveIssue({ volume, issue }: { volume: number; issue: number }) {
  const record = findArchiveIssue(volume, issue);
  if (!record) return null;
  const heading = getIssueCopy(volume, issue, "tr");
  const supplementary = issueSupplementaryContents(volume, issue);
  const contributionCount = issueContributionCount(record, supplementary);
  return (
    <IssuePlatform
      record={record}
      locale="tr"
      title={heading.title}
      subtitle={heading.subtitle}
      description={`${record.season_tr} ${record.year} döneminde yayımlanan bu sayı, ${contributionCount} çalışmayı BRIQ arşivinde açık erişimle bir araya getiriyor.`}
      editorialHref={archiveEditorialHref(volume, issue, "tr")}
      additionalContents={supplementary}
    />
  );
}

function ArchiveArticleDetail({ slug }: { slug: string }) {
  const article = findArticleByRouteSlug(slug);
  if (!article) return null;
  return <ArticlePlatform article={article} locale="tr" routeSlug={slug} />;
}

function ArticleDetail({ slug }: { slug: string }) {
  const listed = articles.find((item) => item.url.endsWith(`/${slug}`));
  const article = findArticleByRouteSlug(slug) || archiveArticles.find((item) => listed && item.volume === 7 && item.issue === 3 && item.title_tr === listed.title);
  if (!article) return null;
  if (slug !== article.slug && slug === articleRouteSlug(article, "en")) redirect(`/tr/makaleler/${article.slug}`);
  const legacySlug = Object.entries(currentIssueArticleAliases).find(([, canonical]) => canonical === slug)?.[0];
  return <ArticlePlatform article={article} locale="tr" routeSlug={slug} details={articleDetails[slug] || (legacySlug ? articleDetails[legacySlug] : undefined)} />;
}

function ArticlePdfDetail({ slug }: { slug: string }) {
  const direct = findArticleByRouteSlug(slug);
  const listed = articles.find((item) => item.url.endsWith(`/${slug}`));
  const article = direct || archiveArticles.find((item) => listed && item.volume === 7 && item.issue === 3 && item.title_tr === listed.title);
  if (article && slug !== article.slug && slug === articleRouteSlug(article, "en")) redirect(`/tr/makaleler/${article.slug}/pdf`);
  return article ? <ArticlePdfPage article={article} locale="tr" routeSlug={slug} /> : null;
}

const callEditorialCopy: Record<string, { paragraphs: string[]; topics?: [string, string[]][]; note?: string }> = {
  "transatlantik-iliskilerin-yeniden-yapilanmasi": {
    paragraphs: [
      "Günümüz uluslararası sistemi; iç içe geçmiş krizler, değişen güç dengeleri ve yerleşik kurumsal yapıların aşınmasıyla derin bir dönüşümden geçmektedir. Ukrayna savaşı, ABD’deki siyasal değişim ve İran’la yaşanan çatışma süreci transatlantik ilişkilerin yeniden şekillenmesini hızlandırmıştır.",
      "BRIQ, ABD–Avrupa ilişkileri ile NATO’nun dönüşen rolünü küresel sistemdeki yapısal değişimlerle birlikte ele alan, eleştirel ve disiplinler arası çalışmaları bu özel sayıya davet etmektedir.",
    ],
    topics: [
      ["Transatlantik ilişkilerde dönüşüm", ["Ukrayna savaşı sonrasında ABD–Avrupa ilişkileri", "Washington ile Avrupa aktörleri arasındaki stratejik ayrışmalar", "ABD iç siyasetindeki değişimlerin ittifak ilişkilerine etkisi"]],
      ["Değişen güvenlik ortamı", ["Çok cepheli çatışma ortamında NATO’nun rolü", "Yük paylaşımı, caydırıcılık ve stratejik özerklik", "Avrupa’da alternatif güvenlik mimarileri"]],
      ["Çok kutupluluk ve Batı ittifakının krizi", ["Alternatif jeopolitik platformların yükselişi", "BRICS, ŞİÖ ve Küresel Güney’in rolü", "Küresel yönetişim yapılarının dönüşümü"]],
    ],
    note: "Özgün ve başka bir yerde değerlendirmede olmayan 5.000–9.000 kelimelik çalışmalar kabul edilir. Atıf sistemi APA’dır ve akademik makaleler çift kör hakemlikten geçer.",
  },
  "yapay-zeka-uretici-gucler-ortak-refah": {
    paragraphs: [
      "İnsanlık, sanayi devrimlerinden dijital dönüşüme uzanan her büyük değişimde üretici güçlerle toplumsal örgütlenme arasındaki ilişkiyi yeniden ele almıştır. Yapay zekâ bugün bu ilişkinin en önemli başlıklarından biridir.",
      "BRIQ; yapay zekânın üretici güçler, işgücü, bilimsel üretim, kamusal planlama, uluslararası eşitsizlikler ve etik yönetişim üzerindeki etkilerini ele alan eleştirel, karşılaştırmalı, kuramsal ve ampirik çalışmalar beklemektedir.",
    ],
    topics: [
      ["Emek ve üretim", ["Robotlaşma, emek süreci ve verimlilik", "Beyaz yakalı bilişsel emeğin dönüşümü", "Yeniden vasıflanma ve üretkenlik artışının bölüşümü"]],
      ["Kamusal yarar ve teknolojik egemenlik", ["Sağlık, eğitim, tarım, enerji ve afet yönetiminde yapay zekâ", "Veri egemenliği, hesaplama altyapısı ve açık kaynak", "Gelişmekte olan ülkelerde kamucu uygulamalar"]],
      ["Bilim ve etik", ["Bilimsel keşif ve doğrulama süreçleri", "Akademik yazarlık, özgünlük ve kaynak gösterme", "Açıklanabilirlik, hesap verebilirlik, mahremiyet ve güvenlik"]],
    ],
    note: "Türkçe ve İngilizce, özgün ve başka bir yerde değerlendirmede olmayan 5.000–9.000 kelimelik makaleler kabul edilir. Atıf sistemi APA 7’dir; çalışmalar çift kör hakemlikten geçer.",
  },
  "kitap-incelemesi": {
    paragraphs: [
      "BRIQ, uluslararası siyaset, ekonomi, kültür, Asya, Kuşak ve Yol Girişimi ve gelişen dünya üzerine yayımlanan güncel bilimsel kitaplar için eleştirel inceleme önerilerini sürekli olarak kabul eder.",
      "Önerisi kabul edilen yazarlardan, kitabın temel konularını ve bakış açısını özlü biçimde tanıtan; eserin güçlü ve zayıf yönlerini, bilimselliğini ve alana katkısını değerlendiren bir inceleme beklenir.",
    ],
    topics: [["İnceleme dosyası", ["En fazla 1.000 kelime", "Kitabın APA biçimindeki künyesi", "İnceleyen yazarın en fazla 150 kelimelik kısa özgeçmişi", "Eleştirel, gerekçeli ve kaynaklı değerlendirme"]]],
    note: "Kitap önerileri ve başvuru soruları için BRIQ Yayın Kurulu’na briq@briqjournal.com adresinden ulaşılabilir.",
  },
};

function SearchPage() {
  return <><PageHero kicker="Arama" title="BRIQ’te Ara" intro="Makaleleri, yazarları, sayıları, kapak başlıklarını, DOI kayıtlarını ve makale çağrılarını tek alanda arayın." /><div className="site-shell page-section"><SearchExplorer articles={archiveArticleListings} issues={archiveIssueListings} calls={[...calls, ...pastCalls]} /></div></>;
}

function CallDetail({ slug }: { slug: string }) {
  const active = calls.find((item) => item.url.endsWith(`/${slug}`));
  const past = pastCalls.find((item) => item.slug === slug);
  const title = active?.title || past?.title;
  if (!title) return null;
  const deadline = active?.deadline || past?.deadline || "";
  const copy = completeCallCopyTr[slug] || callEditorialCopy[slug];
  return (
    <>
      <CallHero locale="tr" slug={slug} title={title} deadline={deadline} deadlineLabel={active?.deadlineLabel} active={Boolean(active)} image={active?.image} />
      <div className="site-shell call-detail-page">
        <div className="reading-content">
          <section><h2>Çağrının kapsamı</h2>{copy ? copy.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>) : <p>{active?.summary || "Bu tematik çağrı, BRIQ’in ilgili sayısı için uluslararası akademik katkıları bir araya getirmek üzere yayımlanmıştır."}</p>}</section>
          {copy?.topics?.length ? (
            <section className="call-topics-section">
              <h2>{copy.topics.length === 1 ? copy.topics[0][0] : "Önerilen Konu Başlıkları"}</h2>
              {copy.topicIntro && <p className="call-section-intro">{copy.topicIntro}</p>}
              <div className={`call-topic-groups ${copy.topics.length === 1 ? "is-single" : ""}`}>
                {copy.topics.map(([heading, topics]) => (
                  <div className="call-topic-group" key={heading}>
                    {copy.topics!.length > 1 && <h3>{heading}</h3>}
                    <ul>{topics.map((topic) => <li key={topic}>{topic}</li>)}</ul>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
          {copy?.guidelines?.length ? (
            <section className="call-guidelines-section">
              <h2>Yazım Kuralları</h2>
              <ul>{copy.guidelines.map((item) => <li key={item}>{item}</li>)}</ul>
              {copy.guidelineHref && <a className="underlined-link" href={copy.guidelineHref}>Ayrıntılı yazım kurallarını incele →︎</a>}
            </section>
          ) : copy?.note ? <section><h2>Yazım ve başvuru</h2><p>{copy.note}</p></section> : null}
          {copy?.deadline && <section className="call-important-date"><h2>Önemli Tarihler</h2><p>{copy.deadline}</p></section>}
          {copy?.contact && (
            <section className="call-contact-section">
              <h2>Başvuru ve İletişim</h2>
              <p><a className="inline-link" href={`mailto:${copy.contact}`}>{copy.contact}</a></p>
              {active && <a className="button button-dark dergipark-button" href="https://dergipark.org.tr/tr/journal/4696/submission/step/manuscript/new"><DergiParkLogo suffix="’tan gönder" /><span>↗︎</span></a>}
            </section>
          )}
          {past && <section><h2>Çağrı sonucu</h2><p>{past.issueHref ? <>Bu çağrı sonucunda yayımlanan sayı: <a className="inline-link" href={past.issueHref}>{past.issue}</a>.</> : past.issue}</p></section>}
          {active && !copy?.contact && <section><h2>Gönderim</h2><p>Çalışmalar Türkçe veya İngilizce hazırlanabilir. Başvuru öncesinde yazım kuralları ve gönderim kontrol listesi incelenmelidir.</p><a className="button button-dark dergipark-button" href="https://dergipark.org.tr/tr/journal/4696/submission/step/manuscript/new"><DergiParkLogo suffix="’tan gönder" /><span>↗︎</span></a></section>}
          <a className="underlined-link" href="/tr/makale-cagrilari">Tüm çağrılara dön →︎</a>
        </div>
      </div>
    </>
  );
}

function ReportDetail({ number }: { number: string }) {
  const report = annualReports.find((item) => item.number === Number(number));
  if (!report) return null;
  return (
    <>
      <PageHero kicker="Yıllık Rapor" title={`BRIQ ${report.titleTr}`} intro={`${report.dateTr} tarihli yayın faaliyeti, uluslararası erişim ve kurumsal gelişim kaydı.`} />
      <div className="site-shell reading-layout"><aside className="issue-record-number"><span>RAPOR</span><b>{String(report.number).padStart(2, "0")}</b></aside><div className="reading-content"><section><h2>Doğrulanmış rapor kaydı</h2><p>Türkçe ve İngilizce özgün rapor dosyaları BRIQ’in kaynak arşivindeki kayıtlarla eşleştirilmiş ve site içi okuyucuya bağlanmıştır.</p></section><a className="underlined-link" href="/tr/yillik-raporlar">Tüm raporlara dön →︎</a></div></div>
      <div className="site-shell issue-pdf-section">
        <PdfViewer title={`BRIQ ${report.titleTr}`} turkishSrc={report.pdfTrLocal} englishSrc={report.pdfEnLocal} />
      </div>
    </>
  );
}

const pages: Record<string, () => ReactNode> = {
  dergi: AboutBriq,
  "dergi/briq-hakkinda": AboutBriq,
  "dergi/yayin-ilkeleri": PublicationPrinciples,
  "dergi/yayin-kurulu": PublicationBoardPage,
  "dergi/danisma-kurulu": AdvisoryBoardPage,
  "dergi/endeksler": Indexes,
  iletisim: Contact,
  arama: SearchPage,
  yazarlar: AuthorsHub,
  "yazarlar/yazim-kurallari": WritingRules,
  "yazarlar/yayin-degerlendirme-sureci": ReviewFlow,
  "yazarlar/telif-hakki-sartlari-ve-lisans": AccessPolicy,
  "yazarlar/yayin-etigi": EthicsPolicy,
  arsiv: Archive,
  makaleler: Articles,
  "guncel-sayi": CurrentIssue,
  "guncel-sayi/sunus": () => <CurrentIssueEditorial />,
  "makale-cagrilari": CallsPage,
  "yillik-raporlar": Reports,
};

const pageMetadata: Record<string, [string, string]> = {
  dergi: ["BRIQ Hakkında", "BRIQ’in yayın profili, amacı, tarihçesi ve kurumsal yapısı."],
  "dergi/briq-hakkinda": ["BRIQ Hakkında", "BRIQ’in yayın profili, amacı, tarihçesi ve kurumsal yapısı."],
  "dergi/yayin-ilkeleri": ["Yayın İlkeleri", "BRIQ’in yayın ilkeleri ve gelişen dünya perspektifi."],
  "dergi/yayin-kurulu": ["Yayın Kurulu", "BRIQ’in editoryal yapısı, Yayın Kurulu ve editör kadrosu."],
  "dergi/danisma-kurulu": ["Danışma Kurulu", "BRIQ Danışma Kurulu üyeleri."],
  "dergi/endeksler": ["Dizinler ve Arşivler", "BRIQ’in doğrulanmış akademik dizin ve açık arşiv kayıtları."],
  iletisim: ["İletişim", "BRIQ iletişim bilgileri ve mesaj formu."],
  arama: ["BRIQ’te Ara", "BRIQ makale, sayı ve çağrı araması."],
  yazarlar: ["Yazarlar için", "BRIQ’e gönderim, yazım kuralları ve değerlendirme adımları."],
  "yazarlar/yazim-kurallari": ["Yazım kuralları", "BRIQ araştırma makalesi ve diğer katkı türleri için yazım kuralları."],
  "yazarlar/yayin-degerlendirme-sureci": ["Yayın Değerlendirme Süreci", "Başvurudan yayıma BRIQ değerlendirme ve hakemlik iş akışı."],
  "yazarlar/telif-hakki-sartlari-ve-lisans": ["Telif Hakkı Şartları ve Lisans", "BRIQ telif devri ve CC BY 4.0 lisans koşulları."],
  "yazarlar/yayin-etigi": ["Yayın Etiği", "Yazar, hakem ve editörlerin etik görevleri."],
  "guncel-sayi": ["Güncel sayı — Cilt 7, Sayı 4", "Batı Asya’da Yeni Dönem: tam sayı, içindekiler ve PDF."],
  "guncel-sayi/sunus": ["Batı Asya’da Yeni Dönem — Sunuş", "Fikret Akfırat’ın BRIQ Cilt 7, Sayı 4 için sunuş yazısı."],
  arsiv: ["Tüm sayılar", "BRIQ’in 27 sayılık doğrulanmış Türkçe ve İngilizce arşivi."],
  makaleler: ["Makale Arama", "BRIQ arşivindeki 279 tekil yayın kaydında gelişmiş arama ve filtreleme."],
  "makale-cagrilari": ["Makale çağrıları", "Aktif ve geçmiş BRIQ makale çağrıları ile son tarihler."],
  "yillik-raporlar": ["Yıllık raporlar", "BRIQ’in doğrulanmış Türkçe ve İngilizce yıllık faaliyet raporları."],
};

const pageEnglishPaths: Record<string, string> = {
  dergi: "/en/journal",
  "dergi/briq-hakkinda": "/en/journal/about-briq",
  "dergi/yayin-ilkeleri": "/en/journal/publication-principles",
  "dergi/yayin-kurulu": "/en/journal/publication-board",
  "dergi/danisma-kurulu": "/en/journal/advisory-board",
  "dergi/endeksler": "/en/journal/indexes",
  iletisim: "/en/contact",
  arama: "/en/search",
  yazarlar: "/en/for-authors",
  "yazarlar/yazim-kurallari": "/en/for-authors/guidelines",
  "yazarlar/yayin-degerlendirme-sureci": "/en/for-authors/review-process",
  "yazarlar/telif-hakki-sartlari-ve-lisans": "/en/for-authors/copyright-and-licence",
  "yazarlar/yayin-etigi": "/en/for-authors/publication-ethics",
  "guncel-sayi": "/en/current-issue",
  "guncel-sayi/sunus": "/en/current-issue/editorial",
  arsiv: "/en/archive",
  makaleler: "/en/articles",
  "makale-cagrilari": "/en/calls-for-papers",
  "yillik-raporlar": "/en/annual-reports",
};

export function generateStaticParams() {
  const paths = new Set(Object.keys(pages));

  for (const issue of archiveIssues) {
    paths.add(`arsiv/cilt-${issue.volume}-sayi-${issue.issue}`);
    if (issue.volume === 7 && issue.issue <= 3) paths.add(`arsiv/cilt-${issue.volume}-sayi-${issue.issue}/sunus`);
  }
  for (const article of archiveArticles) {
    paths.add(`makaleler/${article.slug}`);
    paths.add(`makaleler/${article.slug}/pdf`);
  }
  for (const routeSlug of Object.keys(currentIssueArticleAliases)) {
    paths.add(`makaleler/${routeSlug}`);
    paths.add(`makaleler/${routeSlug}/pdf`);
  }
  for (const article of articles) {
    const routeSlug = article.url.split("/").filter(Boolean).pop();
    if (routeSlug) paths.add(`makaleler/${routeSlug}`);
  }
  for (const profile of authorProfiles) paths.add(`yazar/${profile.id}`);
  for (const call of calls) paths.add(call.url.replace(/^\/tr\//, ""));
  for (const call of pastCalls) paths.add(`makale-cagrilari/${call.slug}`);
  for (const report of annualReports) paths.add(`yillik-raporlar/${report.number}`);

  return [...paths].map((path) => ({ slug: path.split("/") }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const key = slug.join("/");
  const editorialMatch = key.match(/^arsiv\/cilt-(\d+)-sayi-(\d+)\/sunus$/);
  const articlePdfMatch = key.match(/^makaleler\/(.+)\/pdf$/);
  if (articlePdfMatch) {
    const listed = articles.find((item) => item.url.endsWith(`/${articlePdfMatch[1]}`));
    const article = findArticleByRouteSlug(articlePdfMatch[1]) || archiveArticles.find(
      (item) => listed && item.volume === 7 && item.issue === 3 && item.title_tr === listed.title,
    );
    if (article) return {
      title: `${article.title_tr} — PDF | BRIQ`,
      description: `${article.title_tr} doğrulanmış PDF görüntüleyicisi.`,
      alternates: {
        canonical: `/tr/makaleler/${article.slug}/pdf`,
        languages: { "tr-TR": `/tr/makaleler/${article.slug}/pdf`, "en-US": `/en/articles/${articleRouteSlug(article, "en")}/pdf` },
      },
    };
  }
  const articleMatch = key.match(/^makaleler\/(.+)$/);
  if (articleMatch) {
    const listedArticle = articles.find((item) => item.url.endsWith(`/${articleMatch[1]}`));
    const article = findArticleByRouteSlug(articleMatch[1]) || archiveArticles.find(
      (item) => listedArticle && item.volume === 7 && item.issue === 3 && item.title_tr === listedArticle.title,
    );
    if (article) {
      const description = article.abstract_tr?.split("\n").find(Boolean)?.slice(0, 300)
        || `${article.author} tarafından BRIQ Cilt ${article.volume}, Sayı ${article.issue} içinde yayımlanan çalışma.`;
      const firstPage = article.pages?.split(/[-–]/)[0];
      const lastPage = article.pages?.split(/[-–]/)[1];
      return {
        title: `${article.title_tr} | BRIQ`,
        description,
        alternates: {
          canonical: `/tr/makaleler/${article.slug}`,
          languages: {
            "tr-TR": `/tr/makaleler/${article.slug}`,
            "en-US": `/en/articles/${articleRouteSlug(article, "en")}`,
          },
        },
        other: {
          citation_title: article.title_tr,
          citation_author: article.author,
          citation_journal_title: "BRIQ Kuşak ve Yol Girişimi Dergisi",
          citation_volume: String(article.volume),
          citation_issue: String(article.issue),
          citation_publication_date: article.year,
          citation_language: "tr",
          ...(firstPage ? { citation_firstpage: firstPage } : {}),
          ...(lastPage ? { citation_lastpage: lastPage } : {}),
          ...(article.doi ? { citation_doi: article.doi } : {}),
          ...(articlePdfUrl(article, "tr") ? { citation_pdf_url: absoluteSiteUrl(articlePdfUrl(article, "tr")!) } : {}),
        },
      };
    }
  }

  const authorMatch = key.match(/^yazar\/(.+)$/);
  if (authorMatch) {
    const profile = findAuthorProfile(authorMatch[1]);
    if (profile) {
      return {
        title: `${profile.name} | BRIQ`,
        description: `${profile.name}: ${profile.affiliationTr}. BRIQ’te yayımlanan ${profile.articles.length} çalışma.`,
        alternates: {
          canonical: `/tr/yazar/${profile.id}`,
          languages: { "tr-TR": `/tr/yazar/${profile.id}`, "en-US": `/en/authors/${profile.id}` },
        },
      };
    }
  }

  const issueMatch = key.match(/^arsiv\/cilt-(\d+)-sayi-(\d+)$/);
  if (editorialMatch) {
    const issue = findArchiveIssue(Number(editorialMatch[1]), Number(editorialMatch[2]));
    if (issue) {
      return {
        title: `${issueLabel(issue, "tr")} — Sunuş | BRIQ`,
        description: `Fikret Akfırat’ın ${issueLabel(issue, "tr")} için sunuş yazısı.`,
        alternates: {
          canonical: `/tr/arsiv/cilt-${issue.volume}-sayi-${issue.issue}/sunus`,
          languages: {
            "tr-TR": `/tr/arsiv/cilt-${issue.volume}-sayi-${issue.issue}/sunus`,
            "en-US": `/en/archive/volume-${issue.volume}-issue-${issue.issue}/editorial`,
          },
        },
      };
    }
  }
  if (issueMatch) {
    const issue = findArchiveIssue(Number(issueMatch[1]), Number(issueMatch[2]));
    if (issue) {
      return {
        title: `${issueLabel(issue, "tr")} | BRIQ`,
        description: `${issueLabel(issue, "tr")} içindekiler ve iki dilli tam sayı PDF arşivi.`,
        alternates: {
          canonical: `/tr/arsiv/cilt-${issue.volume}-sayi-${issue.issue}`,
          languages: {
            "tr-TR": `/tr/arsiv/cilt-${issue.volume}-sayi-${issue.issue}`,
            "en-US": `/en/archive/volume-${issue.volume}-issue-${issue.issue}`,
          },
        },
      };
    }
  }

  const reportMatch = key.match(/^yillik-raporlar\/(\d+)$/);
  if (reportMatch) {
    const report = annualReports.find((item) => item.number === Number(reportMatch[1]));
    if (report) {
      return {
        title: `BRIQ ${report.titleTr} | BRIQ`,
        description: `${report.dateTr} tarihli doğrulanmış BRIQ yıllık raporu.`,
        alternates: {
          canonical: `/tr/yillik-raporlar/${report.number}`,
          languages: { "tr-TR": `/tr/yillik-raporlar/${report.number}`, "en-US": `/en/annual-reports/${report.number}` },
        },
      };
    }
  }

  const callMatch = key.match(/^makale-cagrilari\/(.+)$/);
  if (callMatch) {
    const callSlug = callMatch[1];
    const active = calls.find((item) => item.url.endsWith(`/${callSlug}`));
    const past = pastCalls.find((item) => item.slug === callSlug);
    const title = active?.title || past?.title;
    if (title) {
      const englishSlug = callSlug === "transatlantik-iliskilerin-yeniden-yapilanmasi"
        ? "transatlantic-relations"
        : callSlug === "yapay-zeka-uretici-gucler-ortak-refah"
          ? "artificial-intelligence-productive-forces"
          : callSlug === "kitap-incelemesi" ? "book-reviews" : callSlug;
      return {
        title: `${title} | BRIQ`,
        description: active?.summary || `Geçmiş BRIQ makale çağrısı. Son tarih: ${past?.deadline}.`,
        alternates: {
          canonical: `/tr/makale-cagrilari/${callSlug}`,
          languages: { "tr-TR": `/tr/makale-cagrilari/${callSlug}`, "en-US": `/en/calls-for-papers/${englishSlug}` },
        },
      };
    }
  }

  const staticPage = pageMetadata[key];
  if (staticPage) {
    return {
      title: `${staticPage[0]} | BRIQ`,
      description: staticPage[1],
      alternates: {
        canonical: `/tr/${key}`,
        languages: { "tr-TR": `/tr/${key}`, "en-US": pageEnglishPaths[key] },
      },
    };
  }

  return { title: "BRIQ | Kuşak ve Yol Girişimi Dergisi" };
}

export default async function ContentPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const key = slug.join("/");
  const Page = pages[key];
  const editorialMatch = key.match(/^arsiv\/cilt-(\d+)-sayi-(\d+)\/sunus$/);
  const issueMatch = key.match(/^arsiv\/cilt-(\d+)-sayi-(\d+)$/);
  const articlePdfMatch = key.match(/^makaleler\/(.+)\/pdf$/);
  const articleMatch = key.match(/^makaleler\/(.+)$/);
  const authorMatch = key.match(/^yazar\/(.+)$/);
  const callMatch = key.match(/^makale-cagrilari\/(.+)$/);
  const reportMatch = key.match(/^yillik-raporlar\/(\d+)$/);
  if (!Page && !editorialMatch && !issueMatch && !articlePdfMatch && !articleMatch && !authorMatch && !callMatch && !reportMatch) {
    const directArticle = archiveArticles.find((article) => article.slug === key);
    if (directArticle) {
      redirect(`/tr/makaleler/${directArticle.slug}`);
    }
    if (key === "biz-kimiz" || key === "hakkimizda") {
      redirect("/tr/dergi/briq-hakkinda");
    }
    notFound();
  }

  let content: ReactNode;
  if (Page) content = <Page />;
  else if (editorialMatch) content = <CurrentIssueEditorial volume={Number(editorialMatch[1])} issueNumber={Number(editorialMatch[2])} />;
  else if (issueMatch) content = <ArchiveIssue volume={Number(issueMatch[1])} issue={Number(issueMatch[2])} />;
  else if (articlePdfMatch) content = <ArticlePdfDetail slug={articlePdfMatch[1]} />;
  else if (articleMatch) content = <ArticleDetail slug={articleMatch[1]} />;
  else if (authorMatch) content = <AuthorProfilePage id={authorMatch[1]} />;
  else if (callMatch) content = <CallDetail slug={callMatch[1]} />;
  else content = <ReportDetail number={reportMatch![1]} />;

  if (content === null) notFound();

  const alternateArticleSlug = articlePdfMatch?.[1] || articleMatch?.[1];
  const alternateListedArticle = alternateArticleSlug
    ? articles.find((item) => item.url.endsWith(`/${alternateArticleSlug}`))
    : undefined;
  const alternateArticle = alternateArticleSlug
    ? findArticleByRouteSlug(alternateArticleSlug) || archiveArticles.find(
      (item) => alternateListedArticle && item.volume === 7 && item.issue === 3 && item.title_tr === alternateListedArticle.title,
    )
    : undefined;
  const alternateHref = alternateArticle
    ? `/en/articles/${articleRouteSlug(alternateArticle, "en")}${articlePdfMatch ? "/pdf" : ""}`
    : editorialMatch
      ? `/en/archive/volume-${editorialMatch[1]}-issue-${editorialMatch[2]}/editorial`
      : undefined;

  return (
    <main>
      <SiteHeader alternateHref={alternateHref} />
      {content}
      <SiteFooter />
    </main>
  );
}
