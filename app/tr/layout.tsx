import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BRIQ | Kuşak ve Yol Girişimi Dergisi",
  description:
    "BRIQ, uluslararası siyaset, ekonomi ve kültür alanlarında Türkçe ve İngilizce yayımlanan üç aylık hakemli akademik dergidir.",
  alternates: {
    canonical: "/tr",
    languages: { "tr-TR": "/tr", "en-US": "/en", "x-default": "/" },
  },
};

export default function TurkishLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
