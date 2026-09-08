import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://briq-academic-journal.iakfiratt.chatgpt.site"),
  title: "BRIQ | Kuşak ve Yol Girişimi Dergisi",
  description:
    "BRIQ, uluslararası siyaset, ekonomi ve kültür alanlarında Türkçe ve İngilizce yayımlanan üç aylık hakemli akademik dergidir.",
  other: {
    "codex-preview": "development",
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
