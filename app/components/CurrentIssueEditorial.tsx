import { findArchiveIssue, issuePdfUrl } from "../archive";
import { archivedEditorials } from "../editorials";

const editorialTr = [
  "ABD ve İsrail’in İran’a yönelik saldırısıyla ortaya çıkan uluslararası tablo, yalnızca Batı Asya’da değil, dünya genelinde güç dengelerindeki köklü dönüşümün en önemli göstergelerinden biri oldu. Saldırının hedefi, İran’ı bölgesel güç olmaktan çıkarmak, ABD-İsrail üstünlüğünü yeniden tesis etmek ve Batı Asya’yı yeniden Washington’un çizdiği güvenlik çerçevesine sokmaktı. Ancak sonuç bunun tersi oldu. ABD’nin doğrudan müdahalesi, sahip olduğu askeri üstünlüğün bölgesel sonuçları belirlemeye yetmediğini ortaya koydu. İsrail’in saldırganlığı ise bölge ülkelerini ABD-İsrail çizgisinde birleştirmek yerine, kendi güvenliklerini ve geleceklerini kendilerinin belirleme eğilimini güçlendirdi.",
  "Bu gelişmeler, dünya güç dengesindeki büyük değişimin Batı Asya’daki yansımalarıdır. ABD’nin Afganistan’dan çekilmesi, Irak’taki etkisinin zayıflaması, Suriye’yi bölme girişiminin sonuç vermemesi ve İsrail’in bölgesel hegemonya planlarının başarısızlığa uğraması aynı sürecin parçasıdır.",
  "Bu değişimin temelinde dünya ekonomisindeki köklü dönüşüm bulunuyor. Dünya ekonomisinin üretim ve birikim merkezleri değişiyor; kapitalist merkezlerin dünya ekonomisi üzerindeki göreli üstünlüğü aşınıyor; bunun siyasal sonucu olarak emperyalist sistemin eski hiyerarşik yapısı sarsılıyor. Emperyalist merkezlerin dünya ekonomisindeki üstünlüklerini koruma mücadelesi, gelişen dünya ile çelişkilerini derinleştirirken kendi aralarındaki rekabeti de keskinleştiriyor.",
  "Bunun bir sonucu da Atlantik cephesinin gelişen dünyaya karşı tutumundaki farklılaşmadır. ABD ile İngiltere, Almanya ve Fransa arasındaki çıkar farklılıkları derinleşiyor. Atlantik sisteminin daha alt kademelerinde yer alan ülkeler de Washington’un çizgisinden farklılaşan tutumlar geliştirebiliyor. Gelişen dünyaya karşı ortak hareket etme zorunluluğu emperyalist merkezler açısından daha yakıcı hale gelirken, kendi aralarındaki rekabet onları ortak tutumdan uzaklaştırıyor ve aralarındaki çelişkileri derinleştiriyor.",
  "Aralarında rekabet ve çıkar farklılıkları bulunan gelişen dünya devletleri ise, bu koşullarda farklı siyasi sistemlere sahip olmalarına rağmen egemen eşitlik temelinde ortak kalkınma, güvenlik ve işbirliği alanlarında giderek daha fazla bir araya geliyor.",
  "Bu koşullar, Batı Asya ülkelerinin kendi güvenlikleri ve bölgesel ilişkileri konusunda daha bağımsız tercihler geliştirmesine imkân sağlıyor. Suudi Arabistan’ın ABD ile ilişkilerini sürdürürken Çin’le stratejik ilişkilerini geliştirmesi ve İran’la normalleşmeyi koruması; Türkiye’nin İran, Irak ve Suriye ile güvenlik işbirliğini geliştirmesi ve aynı zamanda Çin ve Rusya ile ilişkilerini derinleştirmesi, bölge ülkelerinin emperyalist merkezlerden bağımsızlaşma arayışını gösteriyor. Burada söz konusu olan, bir dış gücün başka bir dış gücün yerini alması değil; farklı sistemlere sahip devletlerin, egemen eşitlik temelinde kendi güvenliklerini ve kalkınmalarını ilgilendiren ortak çıkar alanları oluşturabilmesidir.",
  "Batı Asya’da henüz tamamlanmış yeni bir düzen yoktur. ABD’nin askeri ve ekonomik gücü önemini koruyor ve bölge ülkeleri arasındaki çıkar farklılıkları da devam ediyor. Fakat eski düzen artık eskisi gibi işlemiyor. Dünya güç dengesindeki değişim, milli devletlerin emperyalist hegemonyacılığa karşı bağımsızlıklarını güçlendirmelerinin nesnel koşullarını yaratıyor. Batı Asya ülkeleri de kendi güvenliklerini ve geleceklerini belirleme yönünde daha güçlü bir irade ortaya koyuyor. 7 Ağustos 2026’da imzalanan Mekke Anlaşması ise bunun somut bir ifadesidir.",
];

const editorialEn = [
  "The international picture that emerged from the US and Israeli attack on Iran has become one of the clearest signs of the profound transformation in the balance of power, not only in West Asia but across the world. The attack aimed to strip Iran of its status as a regional power, restore US-Israeli supremacy, and bring West Asia back within Washington’s security framework. Yet the result was the opposite. Direct US intervention showed that its military superiority was no longer sufficient to determine regional outcomes. Israeli aggression, instead of uniting regional countries behind the US-Israeli line, strengthened their tendency to determine their own security and future.",
  "These developments are the West Asian expression of the major shift in the global balance of power. The US withdrawal from Afghanistan, the weakening of its influence in Iraq, the failure of the attempt to divide Syria, and the collapse of Israel’s plans for regional hegemony are all parts of the same process.",
  "At the root of this change lies a profound transformation of the world economy. The centres of production and accumulation are shifting; the relative superiority of the capitalist centres in the world economy is eroding; and, as a political consequence, the old hierarchical structure of the imperialist system is being shaken. The imperialist centres’ struggle to preserve their economic supremacy deepens their contradictions with the developing world while sharpening competition among themselves.",
  "One consequence is the growing differentiation within the Atlantic camp in its approach to the developing world. Divergences of interest between the United States and Britain, Germany, and France are deepening. Countries on the lower tiers of the Atlantic system can also develop positions that diverge from Washington’s line. While the need to act jointly against the developing world becomes more urgent for the imperialist centres, competition among them pulls them away from a common position and intensifies their contradictions.",
  "Developing countries, despite rivalries, divergent interests, and different political systems, are meanwhile coming together more frequently on the basis of sovereign equality in the fields of common development, security, and cooperation.",
  "These conditions enable West Asian countries to make more independent choices about their own security and regional relations. Saudi Arabia’s maintenance of relations with the United States while developing strategic ties with China and preserving normalisation with Iran; and Türkiye’s expansion of security cooperation with Iran, Iraq, and Syria while deepening relations with China and Russia, demonstrate the region’s search for greater independence from imperialist centres. What is at issue is not the replacement of one external power by another, but the capacity of states with different systems to establish areas of common interest concerning their security and development on the basis of sovereign equality.",
  "No completed new order yet exists in West Asia. US military and economic power remains significant, and differences of interest among regional countries continue. But the old order no longer functions as it once did. The changing global balance of power is creating the objective conditions for nation-states to strengthen their independence against imperialist hegemonism. West Asian countries are displaying a stronger will to determine their own security and future. The Mecca Agreement signed on 7 August 2026 is a concrete expression of this development.",
];

export function CurrentIssueEditorial({
  locale = "tr",
  volume = 7,
  issueNumber = 4,
}: {
  locale?: "tr" | "en";
  volume?: number;
  issueNumber?: number;
}) {
  const isEnglish = locale === "en";
  const issue = findArchiveIssue(volume, issueNumber);
  const pdf = issue ? issuePdfUrl(issue, locale) || issuePdfUrl(issue, "tr") : undefined;
  const archivedCopy = archivedEditorials[`${volume}-${issueNumber}`]?.[locale];
  const copy = archivedCopy || {
    title: isEnglish ? "A New Era in West Asia" : "Batı Asya’da Yeni Dönem",
    subtitle: isEnglish ? "Hegemonism Recedes, Regional Will Grows Stronger" : "Hegemonyacılık Geriliyor, Bölgesel İrade Güçleniyor",
    paragraphs: isEnglish ? editorialEn : editorialTr,
  };
  const current = volume === 7 && issueNumber === 4;
  const home = isEnglish ? "/en" : "/tr";
  const issueHref = current
    ? (isEnglish ? "/en/current-issue" : "/tr/guncel-sayi")
    : (isEnglish ? `/en/archive/volume-${volume}-issue-${issueNumber}` : `/tr/arsiv/cilt-${volume}-sayi-${issueNumber}`);
  return (
    <article className="current-editorial-page">
      <header className="current-editorial-hero">
        <div className="site-shell">
          <div className="page-breadcrumb"><a href={home}>{isEnglish ? "Home" : "Ana Sayfa"}</a><span>/</span><a href={issueHref}>{current ? (isEnglish ? "Current Issue" : "Güncel Sayı") : (isEnglish ? `Volume ${volume} · Issue ${issueNumber}` : `Cilt ${volume} · Sayı ${issueNumber}`)}</a><span>/</span><span>{isEnglish ? "Editorial" : "Sunuş"}</span></div>
          <p className="section-kicker light">{isEnglish ? "Editorial" : "Editörden"}</p>
          <h1>{copy.title}{copy.subtitle && <em>{copy.subtitle}</em>}</h1>
          <div className="current-editorial-byline"><b>Fikret Akfırat</b><span>{isEnglish ? "Editor-in-Chief" : "Genel Yayın Yönetmeni"}</span></div>
        </div>
      </header>
      <div className="site-shell current-editorial-layout">
        <aside><span>BRIQ</span><b>{volume}.{issueNumber}</b><a href={issueHref}>{isEnglish ? "Back to the issue" : "Sayıya dön"} →︎</a></aside>
        <div className="current-editorial-body">
          {copy.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          {pdf && <div className="current-editorial-actions"><a className="button button-dark" href={`${pdf}#page=4`}>{isEnglish ? "View in Full Issue PDF" : "Tam Sayı PDF’de Gör"} <span>↗︎</span></a><a className="underlined-link" href={issueHref}>{isEnglish ? "Issue contents" : "Sayı içeriği"} →︎</a></div>}
        </div>
      </div>
    </article>
  );
}
