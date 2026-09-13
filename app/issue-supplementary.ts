import type { IssueSupplementaryContent } from "./components/IssuePlatform";

export const volumeSevenIssueThreeSupplementary: readonly IssueSupplementaryContent[] = [
  { typeTr: "Şiir", typeEn: "Poem", author: "Hafız Şirazi", authorEn: "Hafez Shirazi", titleTr: "Üzülme!", titleEn: "Do Not Be Sad!", pages: "370–371", pdfPage: 123 },
  { typeTr: "Şiir", typeEn: "Poem", author: "Hasan Hüseyin Korkmazgil", titleTr: "Yoksa Yoksun", titleEn: "Otherwise You Will Not Exist", pages: "372–373", pdfPage: 125 },
  { typeTr: "Fotoğraf", typeEn: "Photograph", author: "Louis Daguerre", titleTr: "Boulevard du Temple (1837)", titleEn: "Boulevard du Temple (1837)", pages: "374", pdfPage: 127 },
  { typeTr: "Resim", typeEn: "Painting", author: "Rawan Anani", titleTr: "Kudüs’lü Kadınlar (2026)", titleEn: "Women of Jerusalem (2026)", pages: "375", pdfPage: 128 },
  { typeTr: "Afiş", typeEn: "Poster", author: "Olivio Martinez", titleTr: "Güney Afrika Halkının Mücadelesi ile Dayanışma Günü, 26 Haziran (1974)", titleEn: "Day of World Solidarity within the Struggle of the People of South Africa, June 26 (1974)", pages: "376", pdfPage: 129 },
];

export function archiveEditorialHref(volume: number, issue: number, locale: "tr" | "en") {
  if (volume !== 7 || issue < 1 || issue > 3) return undefined;
  return locale === "tr"
    ? `/tr/arsiv/cilt-${volume}-sayi-${issue}/sunus`
    : `/en/archive/volume-${volume}-issue-${issue}/editorial`;
}

export function issueSupplementaryContents(volume: number, issue: number) {
  return volume === 7 && issue === 3 ? volumeSevenIssueThreeSupplementary : undefined;
}
