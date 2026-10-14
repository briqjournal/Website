import type { Metadata } from "next";
import { LegalPage } from "../../components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy and Personal Data Protection | BRIQ",
  description: "BRIQ privacy notice and personal data processing information.",
  alternates: {
    canonical: "/en/privacy-policy",
    languages: { "tr-TR": "/tr/gizlilik-politikasi", "en-US": "/en/privacy-policy" },
  },
};

export default function Page() {
  return <LegalPage locale="en" kind="privacy" />;
}
