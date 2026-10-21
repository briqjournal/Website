"use client";

import { useEffect, useRef, useState } from "react";
import { canonicalPageHref } from "../seo-links";

const submissionUrl = "https://dergipark.org.tr/en/journal/4696/submission/step/manuscript/new";
const loginUrl = "https://dergipark.org.tr/en/login";
const mail = "briq@briqjournal.com";

const steps = [
  {
    title: "Sign in or create an account",
    intro: "Open your DergiPark account or create a new one.",
    text: "After verifying your email address, open the submission screen for Belt and Road Initiative Quarterly (BRIQ). If this is your first submission, create an author account.",
    check: "Make sure you have selected BRIQ and that the email address on your account is current.",
    href: loginUrl,
    link: "Sign in to DergiPark",
  },
  {
    title: "Enter manuscript details",
    intro: "Complete the title, abstract, keywords, and other bibliographic fields.",
    text: "Copy the information from the final version of your manuscript. If the system requests English and Turkish titles, abstracts, and keywords, complete both versions and select the correct contribution type and language.",
    check: "Complete every required field and check that the information matches your manuscript.",
  },
  {
    title: "Add author information",
    intro: "List all authors in the correct order and identify the corresponding author.",
    text: "Enter authors’ names, affiliations, email addresses, and ORCID iDs where available. For co-authored work, keep the author order consistent with the manuscript.",
    check: "Keep author-identifying information in a separate author file, not in the manuscript sent to reviewers.",
  },
  {
    title: "Upload files and declarations",
    intro: "Upload the anonymised manuscript, author file, and any required supplements.",
    text: "For academic articles, upload the author information page separately from the anonymised Word manuscript. Add ethics approval or consent information, funding and conflict-of-interest statements, image permissions, and other required declarations in the relevant fields.",
    check: "Check the file names and uploaded versions. Remove author names and tracked changes from the anonymised manuscript.",
  },
  {
    title: "Review and complete your submission",
    intro: "Check the final preview, complete required confirmations, and submit.",
    text: "Review the manuscript details, authors, and every uploaded file in the submission preview. Complete the required declarations and confirmations, then confirm the final submission step.",
    check: "Uploading files alone does not complete a submission. Make sure DergiPark confirms receipt and shows the submission in your account.",
  },
];

function Icon({ type }: { type: "mail" | "file" | "author" | "check" }) {
  const path = {
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></>,
    file: <><path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10zM13 3v7h7M8 14h8M8 17h6"/></>,
    author: <><circle cx="9" cy="8" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 6a3 3 0 0 1 0 6M17 14a5 5 0 0 1 3.5 5"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
  }[type];
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{path}</svg>;
}

export function EnglishSubmissionGuide() {
  const [allOpen, setAllOpen] = useState(false);
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    stepsRef.current?.querySelectorAll("details").forEach((item) => { item.open = allOpen; });
  }, [allOpen]);

  return (
    <div className="site-shell submission-guide">
      <aside className="submission-side">
        <nav aria-label="On this page">
          <b>On this page</b>
          <a href="#start">Start your submission</a>
          <a href="#prepare">Prepare your files</a>
          <a href="#dergipark">Submit through DergiPark</a>
          <a href="#email">Email support</a>
          <a href="#after-submission">After submission</a>
        </nav>
        <div className="submission-side-help"><Icon type="mail"/><h2>Need help with a step?</h2><p>We are happy to help. Send us an email.</p><a href={`mailto:${mail}`}>{mail}</a></div>
      </aside>
      <article className="submission-content">
        <section className="submission-section" id="start">
          <span className="submission-kicker">Submission channel</span>
          <h2>Start your submission</h2>
          <p>You may submit work to BRIQ in English or Turkish. Submission and publication are free of charge. Use DergiPark to submit your work and follow its review status.</p>
          <div className="submission-entry"><div><span>Online submission through DergiPark</span><p>Start your submission and follow its status through DergiPark.</p></div><a className="button button-dark" href={submissionUrl} target="_blank" rel="noreferrer">Start on DergiPark <span>↗︎</span></a></div>
          <p className="submission-alternative">If you cannot proceed on DergiPark, contact us at <a href={`mailto:${mail}`}>{mail}</a>.</p>
        </section>
        <section className="submission-section" id="prepare">
          <span className="submission-kicker">Before you submit</span><h2>Prepare your files</h2>
          <p>Prepare your manuscript according to BRIQ’s <a href={canonicalPageHref("/en/for-authors/guidelines")}>submission guidelines</a>. For academic articles, prepare the manuscript and author information as separate files.</p>
          <div className="submission-file-grid">
            <div><Icon type="file"/><h3>Anonymised manuscript</h3><p>A Word file with an abstract of up to 200 words, five keywords, and APA 7 references. Remove information that could identify the authors.</p></div>
            <div><Icon type="author"/><h3>Author information file</h3><p>Names, affiliations, email addresses, ORCID iDs where available, the corresponding author, and biographies of up to 150 words.</p></div>
            <div><Icon type="check"/><h3>Required supplements and declarations</h3><p>Where applicable, include ethics approval or consent, funding and conflict-of-interest statements, data availability information, and image permissions.</p></div>
          </div>
          <p className="submission-note">Academic articles should be 5,000–9,000 words, including abstracts, notes, and references. See the <a href={canonicalPageHref("/en/for-authors/guidelines")}>submission guidelines</a> for other contribution types.</p>
        </section>
        <section className="submission-section" id="dergipark">
          <span className="submission-kicker">Step-by-step guide</span><h2>Submit through DergiPark</h2>
          <p>Sign in to your account and open BRIQ’s submission screen. Follow these steps to complete your application.</p>
          <div className="submission-flow-tools"><span>Submission steps</span><button type="button" onClick={() => setAllOpen((open) => !open)}>{allOpen ? "Collapse all steps −" : "Expand all steps +"}</button></div>
          <div className="submission-steps" ref={stepsRef}>{steps.map((step, i) => <details key={step.title} className="submission-step">
            <summary><span className="submission-step-number">{String(i + 1).padStart(2, "0")}</span><Icon type={i === 0 ? "author" : i === 3 ? "file" : "check"}/><span><b>{step.title}</b><small>{step.intro}</small></span></summary>
            <div className="submission-step-body"><p>{step.text}</p><div className="submission-check"><Icon type="check"/><p><b>Before continuing</b>{step.check}</p></div>{step.href && <a href={step.href} target="_blank" rel="noreferrer">{step.link} ↗︎</a>}</div>
          </details>)}</div>
          <a className="button button-dark submission-main-link" href={submissionUrl} target="_blank" rel="noreferrer">Open the DergiPark submission screen <span>↗︎</span></a>
          <p className="submission-small">DergiPark opens in a new tab so this guide stays available. You can also consult the <a href="https://dergipark.org.tr/en/pub/page/egitim-dokumanlari" target="_blank" rel="noreferrer">DergiPark author guide</a>.</p>
        </section>
        <section className="submission-section" id="email">
          <span className="submission-kicker">Alternative support</span><h2>Email support</h2>
          <p>If you cannot complete your submission through DergiPark, you may email your work to <a href={`mailto:${mail}`}>{mail}</a>. If you encountered a technical issue, tell us which step caused the problem.</p>
          <div className="submission-mail-panel"><Icon type="mail"/><div><span>Recipient</span><a href={`mailto:${mail}`}>{mail}</a><span>Subject</span><p>Submission — [Your manuscript title]</p><span>Files to attach</span><p>Manuscript, author information file, and any required supplements.</p><span>For technical support</span><p>Include the error message and your DergiPark submission number, if available.</p></div></div>
          <a className="button button-outline" href={`mailto:${mail}?subject=${encodeURIComponent("Submission — [Your manuscript title]")}`}>Draft an email <span>→︎</span></a>
          <p className="submission-small">If your email app does not open, copy the address into your email service and remember to attach your files.</p>
        </section>
        <section className="submission-section" id="after-submission"><span className="submission-kicker">After submission</span><h2>What happens next?</h2><p>Your work first goes through an editorial screening. Academic articles found suitable are sent for double-blind peer review. Please follow revision requests and updates about the process.</p><a className="editorial-next-link" href={canonicalPageHref("/en/for-authors/review-process")}>Read about the publication review process →︎</a></section>
      </article>
    </div>
  );
}
