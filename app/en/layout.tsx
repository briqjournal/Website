import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BRIQ | Belt & Road Initiative Quarterly",
  description: "BRIQ is a quarterly, peer-reviewed scholarly journal of international politics, economics, and culture, published in Turkish and English.",
  alternates: {
    canonical: "/en",
    languages: { "tr-TR": "/tr", "en-US": "/en", "x-default": "/" },
  },
};

export default function EnglishLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
