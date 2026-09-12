import type { CSSProperties } from "react";
import type { ArchiveIssue } from "../archive";
import {
  articleRouteSlug,
  findArchiveArticle,
  issuePdfUrl,
  publicationType,
} from "../archive";
import { issueAccent, issueSurface } from "../issue-themes";
import { CoverLightbox } from "./CoverLightbox";
import { PdfViewer } from "./PdfViewer";

type Locale = "tr" | "en";
type IssueFact = readonly [label: string, value: string];

type IssuePlatformProps = {
  record: ArchiveIssue;
  locale: Locale;
  title: string;
  subtitle: string;
  description: string;
  current?: boolean;
  coverSrc?: string;
  periodLabel?: string;
  facts?: readonly IssueFact[];
  contentsDescription?: string;
};

const padIssueNumber = (value: number) => String(value).padStart(2, "0");

export function IssuePlatform({
  record,
  locale,
  title,
  subtitle,
  description,
  current = false,
  coverSrc,
  periodLabel,
  facts,
  contentsDescription,
}: IssuePlatformProps) {
  const isEnglish = locale === "en";
  const publications = record.articles
    .map(findArchiveArticle)
    .filter((publication) => publication !== undefined);
  const turkishPdf = issuePdfUrl(record, "tr");
  const englishPdf = issuePdfUrl(record, "en");
  const readingPdf = (isEnglish ? englishPdf : turkishPdf) || turkishPdf || englishPdf;
  const cover = coverSrc || (isEnglish ? record.cover_en : record.cover_tr);
  const period = periodLabel || `${isEnglish ? record.season_en : record.season_tr} ${record.year}`;
  const issueFacts: readonly IssueFact[] = facts || (isEnglish
    ? [
        ["Publication period", period],
        ["Contributions", String(publications.length)],
        ["Languages", "Turkish · English"],
        ["Access", "Open access"],
      ]
    : [
        ["Yayın dönemi", period],
        ["İçerik", String(publications.length)],
        ["Yayın dili", "Türkçe · English"],
        ["Erişim", "Açık erişim"],
      ]);
  const homeHref = isEnglish ? "/en" : "/";
  const archiveHref = isEnglish ? "/en/archive" : "/arsiv";
  const issueName = isEnglish
    ? `Volume ${record.volume} · Issue ${record.issue}`
    : `Cilt ${record.volume} · Sayı ${record.issue}`;
  const coverAlt = isEnglish
    ? `BRIQ Volume ${record.volume} Issue ${record.issue} cover`
    : `BRIQ Cilt ${record.volume} Sayı ${record.issue} kapağı`;

  return (
    <div
      className="issue-page-themed"
      style={{
        "--issue-tone": issueSurface(record.volume, record.issue),
        "--issue-accent": issueAccent(record.volume, record.issue),
      } as CSSProperties}
    >
      <section className="issue-masthead" data-issue={`${padIssueNumber(record.volume)} / ${padIssueNumber(record.issue)}`}>
        <div className="issue-masthead-rule" />
        <div className="site-shell issue-masthead-grid">
          <div className="issue-cover-column">
            <div className="issue-cover-frame">
              <img src={cover} alt={coverAlt} loading="lazy" decoding="async" />
            </div>
            <CoverLightbox src={cover} alt={coverAlt} locale={locale} />
          </div>
          <div className="issue-masthead-copy">
            <div className="page-breadcrumb issue-breadcrumb">
              <a href={homeHref}>{isEnglish ? "Home" : "Ana Sayfa"}</a>
              <span>/</span>
              {current ? (
                <span>{isEnglish ? "Current Issue" : "Güncel Sayı"}</span>
              ) : (
                <><a href={archiveHref}>{isEnglish ? "Archive" : "Arşiv"}</a><span>/</span><span>{issueName}</span></>
              )}
            </div>
            <div className="issue-superline">
              <span>{issueName}</span>
              <span>{isEnglish ? "Publication Period" : "Yayın Dönemi"} · {period}</span>
            </div>
            <h1>{title}</h1>
            <h2>{subtitle}</h2>
            <p className="issue-deck">{description}</p>
            {readingPdf && (
              <div className="issue-actions">
                <a className="button button-light" href="#pdf-viewer">
                  {isEnglish ? "Read PDF on site" : "PDF’yi sitede oku"} <span>↓︎</span>
                </a>
                <a href={readingPdf} download>
                  {isEnglish ? "Download full issue" : "Tam sayı PDF"} <span>↓︎</span>
                </a>
              </div>
            )}
            <dl className="issue-identity-row">
              <div><dt>{isEnglish ? "Volume" : "Cilt"}</dt><dd>{record.volume}</dd></div>
              <div><dt>{isEnglish ? "Issue" : "Sayı"}</dt><dd>{record.issue} <span>({isEnglish ? record.season_en : record.season_tr})</span></dd></div>
            </dl>
            <dl className="issue-facts">
              {issueFacts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
            </dl>
          </div>
        </div>
      </section>

      <section className="site-shell issue-contents-section" id={isEnglish ? "contents" : "icerikler"}>
        <div className="issue-section-heading">
          <div>
            <p className="section-kicker">{isEnglish ? "Contents" : "İçindekiler"}</p>
            <h2>{isEnglish ? "In this issue" : "Bu sayıdaki içerikler"}</h2>
          </div>
          <p>{contentsDescription || (isEnglish
            ? "All contributions published in this issue are presented with their article type, author, and page range."
            : "Bu sayıda yayımlanan tüm çalışmalar; yayın türü, yazar ve sayfa aralığıyla birlikte sunulmaktadır.")}</p>
        </div>
        <div className="issue-toc">
          {publications.map((publication, index) => (
            <a
              href={isEnglish ? `/en/articles/${articleRouteSlug(publication, "en")}` : `/makaleler/${publication.slug}`}
              key={publication.slug}
            >
              <span className="issue-toc-number">{padIssueNumber(index + 1)}</span>
              <span className="issue-toc-meta">
                <small>{publicationType(publication, locale)}</small>
                <b>{publication.author}</b>
              </span>
              <span className="issue-toc-title">{isEnglish ? (publication.title_en || publication.title_tr) : publication.title_tr}</span>
              <span className="issue-toc-pages">{publication.pages || ""}</span>
              <span className="issue-toc-arrow">↗︎</span>
            </a>
          ))}
        </div>
      </section>

      {(turkishPdf || englishPdf) && (
        <div className="site-shell issue-pdf-section">
          <PdfViewer title={`BRIQ ${issueName}`} turkishSrc={turkishPdf} englishSrc={englishPdf} locale={locale} />
        </div>
      )}
    </div>
  );
}
