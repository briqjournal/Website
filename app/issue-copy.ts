export type IssueLocale = "tr" | "en";

type IssueHeading = {
  title: string;
  subtitle: string;
  trailingSubtitle?: string;
};

type IssueCopy = Record<IssueLocale, IssueHeading>;

export const issueCopy: Record<string, IssueCopy> = {
  "7-4": {
    tr: { title: "Hegemonyacılık Geriliyor, Bölgesel İrade Güçleniyor", subtitle: "Batı Asya’da Yeni Dönem" },
    en: { title: "The Erosion of Hegemony and the Rise of Regional Agency", subtitle: "A New Era in West Asia" },
  },
  "7-3": {
    tr: { title: "Kültürel Miras Yağması", subtitle: "Emperyalist Hegemonya ve İade Mücadelesi" },
    en: { title: "Cultural Heritage Plunder", subtitle: "Imperialist Hegemony and the Struggle for Restitution" },
  },
  "7-2": {
    tr: { title: "Çin’e Özgü Sosyalizmin Ekonomi Politiği", subtitle: "" },
    en: { title: "The Political Economy of Socialism with Chinese Characteristics", subtitle: "" },
  },
  "7-1": {
    tr: { title: "Çözüm Yükselen Güney’de", subtitle: "İklim-Su-Gıda Krizi" },
    en: { title: "The Solution Lies in the Global South", subtitle: "The Climate-Water-Food Crisis" },
  },
  "6-4": {
    tr: { title: "Birlikte Kalkınmak İçin Ortak Güvenlik", subtitle: "" },
    en: { title: "Common Security for Shared Development", subtitle: "" },
  },
  "6-3": {
    tr: { title: "Bandung’dan BRICS’e", subtitle: "70. Yıldönümünde", trailingSubtitle: "Hegemonyacılığa Karşı Küresel Güney’in Yükselişi" },
    en: { title: "From Bandung to BRICS", subtitle: "On its 70th Anniversary", trailingSubtitle: "The Emergence of the Global South Against Hegemonism" },
  },
  "6-2": {
    tr: { title: "Sun Yat-sen’in Yaşayan Mirası", subtitle: "Ölümünün 100. Yıldönümünde" },
    en: { title: "The Enduring Legacy of Sun Yat-sen", subtitle: "On the Centenary of His Demise" },
  },
  "6-1": {
    tr: { title: "Kuşak-Yol’da Bilimsel Teknolojik İşbirliği", subtitle: "Gelişen Dünya İçin Kalkınma Yolu" },
    en: { title: "Scientific and Technological Cooperation Along the Belt & Road", subtitle: "The Development Pathway for the Developing World" },
  },
  "5-4": {
    tr: { title: "Kuşak-Yol Ve Türk Devletleri Teşkilatı", subtitle: "" },
    en: { title: "Belt & Road and Organization of Turkic States", subtitle: "" },
  },
  "5-3": {
    tr: { title: "Medeniyetlerin Kaynaşma Yolu", subtitle: "Kuşak-Yol Ve İslam Dünyası" },
    en: { title: "Bridging Civilizations", subtitle: "BRI and the Islamic World" },
  },
  "5-2": {
    tr: { title: "Çok Kutuplu Dünyada", subtitle: "Yükselen Afrika" },
    en: { title: "Africa Rising", subtitle: "in a Multipolar World" },
  },
  "5-1": {
    tr: { title: "Hegemonyacılığa Karşı Dolarsızlaşma", subtitle: "Gelişen Dünyada Yükselen Finansal İşbirliği" },
    en: { title: "De-Dollarization Against Hegemonism", subtitle: "Emerging Financial Cooperation in the Developing World" },
  },
  "4-4": {
    tr: { title: "Gelişen Dünya İçin", subtitle: "Kemalist Devrim’in Yüz Yıllık Mirası" },
    en: { title: "Centennial Legacy of the Kemalist Revolution", subtitle: "for the Developing World" },
  },
  "4-3": {
    tr: { title: "Çok Kutuplu Dünyada NATO’nun Genişlemesi Ve Güvenlik İşbirliğinin Geleceği", subtitle: "" },
    en: { title: "NATO’s Enlargement and the Future of Security Cooperation in a Multipolar World", subtitle: "" },
  },
  "4-2": {
    tr: { title: "Kuşak Ve Yol Girişimi Fırsatı", subtitle: "Akdeniz’i Barış Ve Kalkınma Denizi Yapmak İçin" },
    en: { title: "The Belt & Road Alternative", subtitle: "Transforming the Mediterranean into a Sea of Peace and Development" },
  },
  "4-1": {
    tr: { title: "Doğu Akdeniz", subtitle: "NATO’nun Yeni Savaş Cephesi" },
    en: { title: "The Eastern Mediterranean", subtitle: "NATO’s New Frontline" },
  },
  "3-4": {
    tr: { title: "Uygarlığın İpek Yolu", subtitle: "Sanatın Ve Kültürün Köklerine Yolculuk" },
    en: { title: "The Silk Road of Civilization", subtitle: "Journey to the Roots of Art and Culture" },
  },
  "3-3": {
    tr: { title: "Yeşil Hidrojen", subtitle: "Ekolojik Uygarlığın Enerjisi" },
    en: { title: "Green Hydrogen", subtitle: "The Energy of Ecological Civilization" },
  },
  "3-2": {
    tr: { title: "Gelişen Dünyanın Alternatif Kalkınma Programı", subtitle: "" },
    en: { title: "Alternative Models of Development for Developing Countries", subtitle: "" },
  },
  "3-1": {
    tr: { title: "Ortak Kader Ortak Gelecek", subtitle: "Türkiye Cumhuriyeti İle Çin Halk Cumhuriyeti Arasında Diplomatik İlişkilerin 50. Yılı" },
    en: { title: "Common Destiny Shared Future", subtitle: "50th Anniversary of Diplomatic Relations Between the Republic of Turkey and the People’s Republic of China" },
  },
  "2-4": {
    tr: { title: "Kuşak Yolu’nda Gönül Köprüsü", subtitle: "Yunus Emre Ve Kültürel İşbirliği" },
    en: { title: "Building a Bridge of Hearts", subtitle: "Yunus Emre and Cultural Cooperation in the Belt & Road" },
  },
  "2-3": {
    tr: { title: "Ekolojik Uygarlık", subtitle: "Asya Çağının Habercisi" },
    en: { title: "Ecological Civilization", subtitle: "The Herald of the Asian Age" },
  },
  "2-2": {
    tr: { title: "Ortak Geleceğin İnşası İçin Bilim Ve Teknolojide İşbirliği", subtitle: "" },
    en: { title: "Cooperation in Science and Technology for Building a Shared Future", subtitle: "" },
  },
  "2-1": {
    tr: { title: "Deniz İpek Yolu’nda “Mavi Vatan” Buluşması", subtitle: "" },
    en: { title: "Reclaiming the 'Blue Homeland' Through the Maritime Silkroad.", subtitle: "" },
  },
  "1-4": {
    tr: { title: "Deniz İpek Yolu’nda Ortak Rota", subtitle: "" },
    en: { title: "The Common Course Towards the Maritime Silk Road", subtitle: "" },
  },
  "1-3": {
    tr: { title: "Paylaşarak Gelişme Çağı", subtitle: "COVID-19 Sonrası Yeni Dünya" },
    en: { title: "Towards an Era of Shared Development", subtitle: "The New World After COVID-19" },
  },
  "1-2": {
    tr: { title: "Uluslararası Güvenliğin Yolu", subtitle: "" },
    en: { title: "The Road to International Security", subtitle: "" },
  },
  "1-1": {
    tr: { title: "Uluslararası", subtitle: "Adil Düzenin Yolu" },
    en: { title: "The Road to a Fair International Order", subtitle: "" },
  },
};

const subtitleFirstIssues = new Set([
  "7-4",
  "7-1",
  "6-3",
  "6-2",
  "6-1",
  "5-3",
  "5-1",
  "4-2",
  "4-1",
  "3-4",
  "3-3",
  "3-1",
  "2-3",
  "1-3",
]);

const subtitleScale75Issues = new Set([
  "7-4",
  "7-1",
  "6-3",
]);

export function getIssueCopy(volume: number, issue: number, locale: IssueLocale): IssueHeading {
  const copy = issueCopy[`${volume}-${issue}`]?.[locale];
  if (!copy) throw new Error(`Missing ${locale} issue copy for volume ${volume}, issue ${issue}`);
  return copy;
}

export function getIssueHeadingLayout(volume: number, issue: number) {
  const key = `${volume}-${issue}`;
  return {
    subtitleFirst: subtitleFirstIssues.has(key),
    subtitleScale75: subtitleScale75Issues.has(key),
  };
}
