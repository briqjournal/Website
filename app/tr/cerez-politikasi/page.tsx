import type { Metadata } from "next";
import { LegalPage } from "../../components/LegalPage";

export const metadata: Metadata = {
  title: "Çerez Politikası | BRIQ",
  description: "BRIQ web sitesinin çerez ve benzer teknolojileri kullanımı.",
  alternates: {
    canonical: "/tr/cerez-politikasi",
    languages: { "tr-TR": "/tr/cerez-politikasi", "en-US": "/en/cookie-policy" },
  },
};

export default function Page() {
  return <LegalPage locale="tr" kind="cookies" />;
}
