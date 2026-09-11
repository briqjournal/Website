import type { Metadata } from "next";
import "./globals.css";
import { SITE_URL } from "./site-url";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "BRIQ | Kuşak ve Yol Girişimi Dergisi",
  description:
    "BRIQ, uluslararası siyaset, ekonomi ve kültür alanlarında Türkçe ve İngilizce yayımlanan üç aylık hakemli akademik dergidir.",
  alternates: {
    canonical: "/",
    languages: { "tr-TR": "/", "en-US": "/en" },
  },
  icons: {
    icon: "/assets/briq-logo.png",
    shortcut: "/assets/briq-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
