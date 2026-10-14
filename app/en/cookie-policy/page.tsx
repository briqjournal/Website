import type { Metadata } from "next";
import { LegalPage } from "../../components/LegalPage";

export const metadata: Metadata = {
  title: "Cookie Policy | BRIQ",
  description: "BRIQ cookie and browser storage practices.",
  alternates: {
    canonical: "/en/cookie-policy",
    languages: { "tr-TR": "/tr/cerez-politikasi", "en-US": "/en/cookie-policy" },
  },
};

export default function Page() {
  return <LegalPage locale="en" kind="cookies" />;
}
