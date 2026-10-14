import type { Metadata } from "next";
import { LegalPage } from "../../components/LegalPage";

export const metadata: Metadata = {
  title: "Gizlilik ve Kişisel Verilerin Korunması | BRIQ",
  description: "BRIQ web sitesinin kişisel verilerin korunmasına ilişkin bilgilendirmesi.",
  alternates: {
    canonical: "/tr/gizlilik-politikasi",
    languages: { "tr-TR": "/tr/gizlilik-politikasi", "en-US": "/en/privacy-policy" },
  },
};

export default function Page() {
  return <LegalPage locale="tr" kind="privacy" />;
}
