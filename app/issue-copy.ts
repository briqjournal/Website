export type IssueLocale = "tr" | "en";

type IssueHeading = {
  title: string;
  subtitle: string;
};

type IssueCopy = Record<IssueLocale, IssueHeading>;

export const issueCopy: Record<string, IssueCopy> = {
  "7-4": {
    tr: { title: "Batı Asya’da Yeni Dönem", subtitle: "Hegemonyacılık Geriliyor, Bölgesel İrade Güçleniyor" },
    en: { title: "A New Era in West Asia", subtitle: "Hegemonism Recedes, Regional Agency Grows" },
  },
  "7-3": {
    tr: { title: "Kültürel Miras Yağması", subtitle: "Emperyalist Hegemonya Ve İade Mücadelesi" },
    en: { title: "Cultural Heritage Plunder", subtitle: "Imperialist Hegemony and the Struggle for Restitution" },
  },
  "7-2": {
    tr: { title: "Çin’e Özgü Sosyalizmin", subtitle: "Ekonomi Politiği" },
    en: { title: "The Political Economy of", subtitle: "Socialism with Chinese Characteristics" },
  },
  "7-1": {
    tr: { title: "İklim-Su-Gıda Krizi", subtitle: "Çözüm Yükselen Güney’de" },
    en: { title: "The Climate-Water-Food Crisis", subtitle: "The Solution Lies in the Global South" },
  },
  "6-4": {
    tr: { title: "Birlikte Kalkınmak İçin", subtitle: "Ortak Güvenlik" },
    en: { title: "Common Security for", subtitle: "Shared Development" },
  },
  "6-3": {
    tr: { title: "70. Yıldönümünde Bandung’dan BRICS’e", subtitle: "Hegemonyacılığa Karşı Küresel Güney’in Yükselişi" },
    en: { title: "From Bandung to BRICS", subtitle: "The Forthcoming Challenge for the Global South" },
  },
  "6-2": {
    tr: { title: "Ölümünün 100. Yıldönümünde", subtitle: "Sun Yat-sen’in Yaşayan Mirası" },
    en: { title: "On the Centenary of His Demise", subtitle: "The Enduring Legacy of Sun Yat-sen" },
  },
  "6-1": {
    tr: { title: "Gelişen Dünya İçin Kalkınma Yolu", subtitle: "Kuşak-Yol’da Bilimsel Teknolojik İşbirliği" },
    en: { title: "The Development Pathway for the Developing World", subtitle: "Scientific and Technological Cooperation Along the Belt & Road" },
  },
  "5-4": {
    tr: { title: "Kuşak-Yol Ve", subtitle: "Türk Devletleri Teşkilatı" },
    en: { title: "Belt & Road and", subtitle: "Organization of Turkic States" },
  },
  "5-3": {
    tr: { title: "Kuşak-Yol Ve İslam Dünyası", subtitle: "Medeniyetlerin Kaynaşma Yolu" },
    en: { title: "BRI and the Islamic World", subtitle: "Bridging Civilizations" },
  },
  "5-2": {
    tr: { title: "Çok Kutuplu Dünyada", subtitle: "Yükselen Afrika" },
    en: { title: "Africa Rising", subtitle: "in a Multipolar World" },
  },
  "5-1": {
    tr: { title: "Gelişen Dünyada Yükselen Finansal İşbirliği", subtitle: "Hegemonyacılığa Karşı Dolarsızlaşma" },
    en: { title: "Emerging Financial Cooperation in the Developing World", subtitle: "De-Dollarization Against Hegemonism" },
  },
  "4-4": {
    tr: { title: "Gelişen Dünya İçin", subtitle: "Kemalist Devrim’in Yüz Yıllık Mirası" },
    en: { title: "Centennial Legacy of the Kemalist Revolution", subtitle: "for the Developing World" },
  },
  "4-3": {
    tr: { title: "Çok Kutuplu Dünyada", subtitle: "NATO’nun Genişlemesi Ve Güvenlik İşbirliğinin Geleceği" },
    en: { title: "NATO’s Enlargement", subtitle: "and the Future of Security Cooperation in a Multipolar World" },
  },
  "4-2": {
    tr: { title: "Akdeniz’i Barış Ve Kalkınma Denizi Yapmak İçin", subtitle: "Kuşak Ve Yol Girişimi Fırsatı" },
    en: { title: "Transforming the Mediterranean into a Sea of Peace and Development", subtitle: "The Belt & Road Alternative" },
  },
  "4-1": {
    tr: { title: "NATO’nun Yeni Savaş Cephesi", subtitle: "Doğu Akdeniz" },
    en: { title: "NATO’s New Frontline", subtitle: "The Eastern Mediterranean" },
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
    en: { title: "The Road to a Fair", subtitle: "International Order" },
  },
};

export function getIssueCopy(volume: number, issue: number, locale: IssueLocale): IssueHeading {
  const copy = issueCopy[`${volume}-${issue}`]?.[locale];
  if (!copy) throw new Error(`Missing ${locale} issue copy for volume ${volume}, issue ${issue}`);
  return copy;
}
