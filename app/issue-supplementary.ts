import type { IssueSupplementaryContent } from "./components/IssuePlatform";
import { archivedEditorials } from "./editorials";

export const volumeSevenIssueOneSupplementary: readonly IssueSupplementaryContent[] = [
  { typeTr: "Fotoğraf", typeEn: "Photograph", author: "Hiroshi Sugimoto", titleTr: "Cro-Magnon, 1994", titleEn: "Cro-Magnon, 1994", pages: "122", pdfPage: 128 },
  { typeTr: "Resim", typeEn: "Painting", author: "Nazmi Ziya Güran", titleTr: "Tavla Oynayanlar", titleEn: "Backgammon Players", pages: "123", pdfPage: 129 },
  { typeTr: "Karikatür", typeEn: "Cartoon", author: "Semih Balcıoğlu", titleTr: "Ünlem Dergisi’nin İlk Sayısı İçin Çizim", titleEn: "Cartoon for the First Issue of Ünlem Magazine", pages: "124", pdfPage: 130 },
  { typeTr: "Şiir", typeEn: "Poem", author: "Cahit Sıtkı Tarancı", titleTr: "Memleket İsterim", titleEn: "I Want a Homeland", pages: "125–126", pdfPage: 131 },
  { typeTr: "Şiir", typeEn: "Poem", author: "Pablo Neruda", titleTr: "Buğdayın Türküsü", titleEn: "Song of the Wheat", pages: "127–128", pdfPage: 133 },
];

export const volumeSevenIssueTwoSupplementary: readonly IssueSupplementaryContent[] = [
  { sourceSlug: "siir-li-bai-zor-yolculuk", typeTr: "Şiir", typeEn: "Poem", author: "Li Bai", titleTr: "Zor Yolculuk", titleEn: "The Hard Road", pages: "247–248", pdfPage: 125 },
  { sourceSlug: "siir-melih-cevdet-anday-telgrafhane", typeTr: "Şiir", typeEn: "Poem", author: "Melih Cevdet Anday", titleTr: "Telgrafhane", titleEn: "The Telegraph Office", pages: "249–250", pdfPage: 127 },
  { sourceSlug: "zhang-yaxin", typeTr: "Fotoğraf", typeEn: "Photograph", author: "Zhang Yaxin", titleTr: "Devrimci Operalar", titleEn: "Revolutionary Operas", pages: "251", pdfPage: 129 },
  { sourceSlug: "liu-chunhua", typeTr: "Resim", typeEn: "Painting", author: "Liu Chunhua", titleTr: "Anyuan’a Giderken Başkan Mao", titleEn: "Chairman Mao en Route to Anyuan", pages: "252", pdfPage: 130 },
  { sourceSlug: "sanghay-halk-guzel-sanatlar-yayinevi-propaganda-afis-grubu", typeTr: "Afiş", typeEn: "Poster", author: "Şanghay Halk Güzel Sanatlar Yayınevi Propaganda Afiş Grubu", authorEn: "Shanghai People’s Fine Arts Publishing House Propaganda Poster Group", titleTr: "On Bin Hane, Bir Aile, Bahar Şehri Doldurur", titleEn: "Ten Thousand Households, One Family, Spring Fills the City", pages: "253", pdfPage: 131 },
];

export const volumeSevenIssueThreeSupplementary: readonly IssueSupplementaryContent[] = [
  { typeTr: "Şiir", typeEn: "Poem", author: "Hafız Şirazi", authorEn: "Hafez Shirazi", titleTr: "Üzülme!", titleEn: "Do Not Be Sad!", pages: "370–371", pdfPage: 123 },
  { typeTr: "Şiir", typeEn: "Poem", author: "Hasan Hüseyin Korkmazgil", titleTr: "Yoksa Yoksun", titleEn: "Otherwise You Will Not Exist", pages: "372–373", pdfPage: 125 },
  { typeTr: "Fotoğraf", typeEn: "Photograph", author: "Louis Daguerre", titleTr: "Boulevard du Temple (1837)", titleEn: "Boulevard du Temple (1837)", pages: "374", pdfPage: 127 },
  { typeTr: "Resim", typeEn: "Painting", author: "Rawan Anani", titleTr: "Kudüs’lü Kadınlar (2026)", titleEn: "Women of Jerusalem (2026)", pages: "375", pdfPage: 128 },
  { typeTr: "Afiş", typeEn: "Poster", author: "Olivio Martinez", titleTr: "Güney Afrika Halkının Mücadelesi ile Dayanışma Günü, 26 Haziran (1974)", titleEn: "Day of World Solidarity within the Struggle of the People of South Africa, June 26 (1974)", pages: "376", pdfPage: 129 },
];

export function archiveEditorialHref(volume: number, issue: number, locale: "tr" | "en") {
  if (!archivedEditorials[`${volume}-${issue}`]) return undefined;
  return locale === "tr"
    ? `/tr/arsiv/cilt-${volume}-sayi-${issue}/sunus`
    : `/en/archive/volume-${volume}-issue-${issue}/editorial`;
}

export function issueSupplementaryContents(volume: number, issue: number) {
  if (volume !== 7) return undefined;
  if (issue === 1) return volumeSevenIssueOneSupplementary;
  if (issue === 2) return volumeSevenIssueTwoSupplementary;
  if (issue === 3) return volumeSevenIssueThreeSupplementary;
  return undefined;
}
