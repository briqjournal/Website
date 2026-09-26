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
    tr: { title: "Sanatın Ve Kültürün Köklerine Yolculuk", subtitle: "Uygarlığın İpek Yolu" },
    en: { title: "Journey to the Roots of Art and Culture", subtitle: "The Silk Road of Civilization" },
  },
  "3-3": {
    tr: { title: "Ekolojik Uygarlığın Enerjisi", subtitle: "Yeşil Hidrojen" },
    en: { title: "The Energy of Ecological Civilization", subtitle: "Green Hydrogen" },
  },
  "3-2": {
    tr: { title: "Gelişen Dünyanın", subtitle: "Alternatif Kalkınma Programı" },
    en: { title: "Alternative Models of Development", subtitle: "for Developing Countries" },
  },
  "3-1": {
    tr: { title: "Türkiye Cumhuriyeti İle Çin Halk Cumhuriyeti Arasında Diplomatik İlişkilerin 50. Yılı", subtitle: "Ortak Kader Ortak Gelecek" },
    en: { title: "50th Anniversary of Diplomatic Relations Between the Republic of Turkey and the People’s Republic of China", subtitle: "Common Destiny, Shared Future" },
  },
  "2-4": {
    tr: { title: "Kuşak Yolu’nda Gönül Köprüsü", subtitle: "Yunus Emre Ve Kültürel İşbirliği" },
    en: { title: "Building a Bridge of Hearts", subtitle: "Yunus Emre and Cultural Cooperation in the Belt & Road" },
  },
  "2-3": {
    tr: { title: "Asya Çağının Habercisi", subtitle: "Ekolojik Uygarlık" },
    en: { title: "The Herald of the Asian Age", subtitle: "Ecological Civilization" },
  },
  "2-2": {
    tr: { title: "Ortak Geleceğin İnşası İçin", subtitle: "Bilim Ve Teknolojide İşbirliği" },
    en: { title: "Cooperation in Science and Technology", subtitle: "for Building a Shared Future" },
  },
  "2-1": {
    tr: { title: "Deniz İpek Yolu’nda", subtitle: "“Mavi Vatan” Buluşması" },
    en: { title: "“Blue Homeland” Meets", subtitle: "The Maritime Silk Road" },
  },
  "1-4": {
    tr: { title: "Deniz İpek Yolu’nda", subtitle: "Ortak Rota" },
    en: { title: "The Common Course", subtitle: "Towards the Maritime Silk Road" },
  },
  "1-3": {
    tr: { title: "COVID-19 Sonrası Yeni Dünya", subtitle: "Paylaşarak Gelişme Çağı" },
    en: { title: "The New World After COVID-19", subtitle: "Towards an Era of Shared Development" },
  },
  "1-2": {
    tr: { title: "Uluslararası", subtitle: "Güvenliğin Yolu" },
    en: { title: "The Road to", subtitle: "International Security" },
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
