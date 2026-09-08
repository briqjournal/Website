const themes: Record<string, { tr: string; en: string }> = {
  "1-1": { tr: "Uluslararası Adil Düzenin Yolu", en: "The Road to a Just International Order" },
  "1-2": { tr: "Uluslararası Güvenliğin Yolu", en: "The Road to International Security" },
  "1-3": { tr: "COVID-19 Sonrası Yeni Dünya: Paylaşarak Gelişme Çağı", en: "The Post-COVID-19 World: An Era of Development Through Sharing" },
  "1-4": { tr: "Deniz İpek Yolu’nda Ortak Rota", en: "A Common Route on the Maritime Silk Road" },
  "2-1": { tr: "Deniz İpek Yolu’nda ‘Mavi Vatan’ Buluşması", en: "The ‘Blue Homeland’ Meeting on the Maritime Silk Road" },
  "2-2": { tr: "Ortak Geleceğin İnşası İçin Bilim ve Teknolojide İşbirliği", en: "Science and Technology Cooperation for a Shared Future" },
  "2-3": { tr: "Asya Çağının Müjdesi: Ekolojik Uygarlık", en: "The Promise of the Asian Century: Ecological Civilisation" },
  "2-4": { tr: "Kuşak Yol’da Gönül Köprüsü: Yunus Emre ve Kültürel İşbirliği", en: "A Bridge of Hearts on the Belt and Road: Yunus Emre and Cultural Cooperation" },
  "3-1": { tr: "Ortak Kader, Ortak Gelecek", en: "A Shared Destiny, A Shared Future" },
  "3-2": { tr: "Gelişen Dünyanın Alternatif Kalkınma Programı", en: "An Alternative Development Programme for the Developing World" },
  "3-3": { tr: "Ekolojik Uygarlığın Enerjisi: Yeşil Hidrojen", en: "The Energy of Ecological Civilisation: Green Hydrogen" },
  "3-4": { tr: "Sanatın ve Kültürün Köklerine Yolculuk: Uygarlığın İpek Yolu", en: "A Journey to the Roots of Art and Culture: The Silk Road of Civilisation" },
  "4-1": { tr: "NATO’nun Yeni Savaş Cephesi: Doğu Akdeniz", en: "NATO’s New War Front: The Eastern Mediterranean" },
  "4-2": { tr: "Akdeniz’i Barış ve Kalkınma Denizi Yapmak İçin Kuşak ve Yol Girişimi Fırsatı", en: "The Belt and Road Opportunity for a Mediterranean of Peace and Development" },
  "4-3": { tr: "Çok Kutuplu Dünyada NATO’nun Genişlemesi ve Güvenlik İşbirliğinin Geleceği", en: "NATO Expansion and the Future of Security Cooperation in a Multipolar World" },
  "4-4": { tr: "Gelişen Dünya İçin Kemalist Devrim’in Yüz Yıllık Mirası", en: "The Centennial Legacy of the Kemalist Revolution for the Developing World" },
  "5-1": { tr: "Gelişen Dünyada Yükselen Finansal İşbirliği: Hegemonyacılığa Karşı Dolarsızlaşma", en: "Rising Financial Cooperation in the Developing World: De-dollarisation Against Hegemony" },
  "5-2": { tr: "Çok Kutuplu Dünyada Yükselen Afrika", en: "Africa Rising in a Multipolar World" },
  "5-3": { tr: "Kuşak-Yol ve İslam Dünyası: Medeniyetlerin Kaynaşma Yolu", en: "The Belt and Road and the Islamic World: A Path for Civilisations to Meet" },
  "5-4": { tr: "Kuşak-Yol ve Türk Devletleri Teşkilatı", en: "The Belt and Road and the Organization of Turkic States" },
  "6-1": { tr: "Gelişen Dünya İçin Kalkınma Yolu: Kuşak-Yol’da Bilimsel Teknolojik İşbirliği", en: "A Development Path for the Developing World: Scientific and Technological Cooperation on the Belt and Road" },
  "6-2": { tr: "Ölümünün 100. Yıldönümünde Sun Yat-sen’in Yaşayan Mirası", en: "Sun Yat-sen’s Living Legacy on the Centenary of His Death" },
  "6-3": { tr: "Bandung’dan BRICS’e: Hegemonyacılığa Karşı Küresel Güney’in Yükselişi", en: "From Bandung to BRICS: The Rise of the Global South Against Hegemony" },
  "6-4": { tr: "Birlikte Kalkınmak İçin Ortak Güvenlik", en: "Shared Security for Development Together" },
  "7-1": { tr: "İklim–Su–Gıda Krizi: Çözüm Yükselen Güney’de", en: "The Climate–Water–Food Crisis: Solutions from the Rising South" },
  "7-2": { tr: "Çin’e Özgü Sosyalizmin Ekonomi Politiği", en: "The Political Economy of Socialism with Chinese Characteristics" },
  "7-3": { tr: "Kültürel Miras Yağması: Emperyalist Hegemonya ve İade Mücadelesi", en: "Cultural Heritage Plunder: Imperialist Hegemony and the Struggle for Restitution" },
  "7-4": { tr: "Batı Asya’da Yeni Dönem: Hegemonyacılık Geriliyor, Bölgesel İrade Güçleniyor", en: "A New Era in West Asia: Hegemonism Recedes, Regional Agency Grows" },
};

export function issueTheme(volume: number, issue: number, locale: "tr" | "en") {
  return themes[`${volume}-${issue}`]?.[locale] || "";
}

const coverAccents = ["#a53e2f", "#23465f", "#8b6734", "#476756", "#70495d", "#b65a27", "#3f4b73"];

export function issueAccent(volume: number, issue: number) {
  if (volume === 7 && issue === 4) return "#4d1b2a";
  if (volume === 7 && issue === 3) return "#b95524";
  return coverAccents[(volume * 3 + issue - 1) % coverAccents.length];
}

const badgeAccents = ["#7f3025", "#315c79", "#74552c", "#385746", "#84596d", "#8f431f", "#59658f"];

export function issueBadgeAccent(volume: number, issue: number) {
  if (volume === 7 && issue === 4) return "#713349";
  if (volume === 7 && issue === 3) return "#8f431f";
  return badgeAccents[(volume * 3 + issue - 1) % badgeAccents.length];
}

const issueSurfaces = ["#63271f", "#19384d", "#594321", "#29483c", "#533747", "#6b351f", "#343e62"];

export function issueSurface(volume: number, issue: number) {
  if (volume === 7 && issue === 4) return "#35131f";
  if (volume === 7 && issue === 3) return "#4b281d";
  return issueSurfaces[(volume * 3 + issue - 1) % issueSurfaces.length];
}
