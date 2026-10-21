import type { Metadata } from "next";
import { AuthorDirectoryPage } from "../../components/AuthorDirectoryPage";

export const metadata: Metadata = {
  title: "Author Directory | BRIQ",
  description: "Browse BRIQ authors and academic contributors by name or institution, with direct links to their published work and author profiles.",
  alternates: {
    canonical: "/en/author-directory/",
    languages: {
      "en-US": "/en/author-directory/",
      "tr-TR": "/tr/yazar-dizini/",
    },
  },
};

export default function EnglishAuthorDirectory() {
  return <AuthorDirectoryPage locale="en" />;
}
