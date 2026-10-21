import type { Metadata } from "next";
import { AuthorDirectoryPage } from "../../components/AuthorDirectoryPage";

export const metadata: Metadata = {
  title: "Yazar Dizini | BRIQ",
  description: "BRIQ yazarlarını ve akademik katkıda bulunanları isim veya kuruma göre inceleyin; yayınlarına ve yazar profillerine ulaşın.",
  alternates: {
    canonical: "/tr/yazar-dizini/",
    languages: {
      "tr-TR": "/tr/yazar-dizini/",
      "en-US": "/en/author-directory/",
    },
  },
};

export default function TurkishAuthorDirectory() {
  return <AuthorDirectoryPage locale="tr" />;
}
