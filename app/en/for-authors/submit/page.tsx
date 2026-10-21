import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../../../components/SiteChrome";
import { EnglishSubmissionGuide } from "../../../components/EnglishSubmissionGuide";

export const metadata: Metadata = {
  title: "Submit to BRIQ | BRIQ",
  description: "A step-by-step guide to preparing and submitting a manuscript to BRIQ through DergiPark.",
  alternates: {
    canonical: "/en/for-authors/submit",
    languages: {
      "tr-TR": "/tr/yazarlar/yazi-gonder",
      "en-US": "/en/for-authors/submit",
    },
  },
};

export default function EnglishSubmissionPage() {
  return (
    <main>
      <SiteHeader locale="en" alternateHref="/tr/yazarlar/yazi-gonder" />
      <section className="page-hero">
        <div className="page-hero-rule" />
        <div className="site-shell page-hero-inner">
          <div className="page-breadcrumb">
            <a href="/en">Home</a>
            <span>/</span>
            <a href="/en/for-authors">For Authors</a>
            <span>/</span>
            <span>Submit to BRIQ</span>
          </div>
          <p className="section-kicker light">For Authors</p>
          <h1>Submit to BRIQ</h1>
          <p>Follow this guide to prepare your files, submit through DergiPark, and get help if you need it.</p>
        </div>
      </section>
      <EnglishSubmissionGuide />
      <a className="submission-mobile-help" href="mailto:briq@briqjournal.com"><span>Need help with DergiPark?</span><b>Email us →︎</b></a>
      <SiteFooter locale="en" />
    </main>
  );
}
