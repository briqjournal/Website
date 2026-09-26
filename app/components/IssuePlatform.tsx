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
export type IssueSupplementaryContent = {
  sourceSlug?: string;
  typeTr: string;
  typeEn: string;
  author: string;
  authorEn?: string;
  titleTr: string;
  titleEn: string;
  pages: string;
  pdfPage: number;
};

const volume7PublicationDates: Record<number, Record<Locale, string>> = {
  1: { tr: "1 Aralık 2025", en: "1 December 2025" },
  2: { tr: "1 Mart 2026", en: "1 March 2026" },
  3: { tr: "1 Haziran 2026", en: "1 June 2026" },
  4: { tr: "1 Eylül 2026", en: "1 September 2026" },
};

export function issueContributionCount(
  record: ArchiveIssue,
  additionalContents: readonly IssueSupplementaryContent[] = [],
) {
  const supplementalSlugs = new Set(additionalContents.map((content) => content.sourceSlug).filter(Boolean));
  return record.articles.filter((slug) => !supplementalSlugs.has(slug)).length + additionalContents.length;
}

type IssuePlatformProps = {
  record: ArchiveIssue;
  locale: Locale;
  title: string;
  subtitle: string;
  trailingSubtitle?: string;
  description: string;
  current?: boolean;
  subtitleFirst?: boolean;
  subtitleScale75?: boolean;
  coverSrc?: string;
  periodLabel?: string;
  facts?: readonly IssueFact[];
  contentsDescription?: string;
  editorialHref?: string;
  additionalContents?: readonly IssueSupplementaryContent[];
};

const padIssueNumber = (value: number) => String(value).padStart(2, "0");

export function IssuePlatform({
  record,
  locale,
  title,
  subtitle,
  trailingSubtitle,
  description,
  current = false,
  subtitleFirst = false,
  subtitleScale75 = false,
  coverSrc,
  periodLabel,
  facts,
  contentsDescription,
  editorialHref,
  additionalContents = [],
}: IssuePlatformProps) {
  const isEnglish = locale === "en";
  const supplementalSlugs = new Set(additionalContents.map((content) => content.sourceSlug).filter(Boolean));
  const publications = record.articles
    .filter((slug) => !supplementalSlugs.has(slug))
    .map(findArchiveArticle)
    .filter((publication) => publication !== undefined);
  const turkishPdf = issuePdfUrl(record, "tr");
  const englishPdf = issuePdfUrl(record, "en");
  const readingPdf = (isEnglish ? englishPdf : turkishPdf) || turkishPdf || englishPdf;
  const cover = coverSrc || (isEnglish ? record.cover_en : record.cover_tr);
  const exactPublicationDate = record.volume === 7
    ? volume7PublicationDates[record.issue]?.[locale]
    : undefined;
  const period = exactPublicationDate || periodLabel || `${isEnglish ? record.season_en : record.season_tr} ${record.year}`;
  const publicationDateLabel = isEnglish ? "Publication Date" : "Yayın Tarihi";
  const contributionCount = issueContributionCount(record, additionalContents);
  const issueLanguageValue = isEnglish ? "English · Turkish" : "Türkçe · İngilizce";
  const defaultIssueFacts: readonly IssueFact[] = isEnglish
    ? [
        [publicationDateLabel, period],
        ["Contributions", String(contributionCount)],
        ["Languages", issueLanguageValue],
        ["Access", "Open access"],
      ]
    : [
        [publicationDateLabel, period],
        ["İçerik", String(contributionCount)],
        ["Yayın dili", issueLanguageValue],
        ["Erişim", "Açık erişim"],
      ];
  const issueFacts: readonly IssueFact[] = facts
    ? facts.map(([label, value]) => {
        const isPublicationDateFact = /^(Yayın tarihi|Yayın dönemi|Publication date|Publication period)$/i.test(label);
        const isLanguageFact = /^(Yayın dili|Yayın dilleri|Language|Languages)$/i.test(label);
        if (isPublicationDateFact) return [publicationDateLabel, exactPublicationDate || value] as const;
        if (isLanguageFact) return [label, issueLanguageValue] as const;
        return [label, value] as const;
      })
    : defaultIssueFacts;
  const homeHref = isEnglish ? "/en" : "/tr";
  const archiveHref = isEnglish ? "/en/archive" : "/tr/arsiv";
  const issueName = isEnglish
    ? `Volume ${record.volume} · Issue ${record.issue}`
    : `Cilt ${record.volume} · Sayı ${record.issue}`;
  const coverAlt = isEnglish
    ? `BRIQ Volume ${record.volume} Issue ${record.issue} cover`
    : `BRIQ Cilt ${record.volume} Sayı ${record.issue} kapağı`;

  return (
    <div
      className={`issue-page-themed${record.volume === 7 && record.issue === 4 ? " issue-v74" : ""}`}
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
              <span>{publicationDateLabel} · {period}</span>
            </div>
            <h1 className={[subtitleFirst ? "issue-title-subtitle-first" : "", subtitleScale75 ? "issue-title-subtitle-75" : ""].filter(Boolean).join(" ") || undefined}>
              {subtitleFirst ? (
                <>
                  {subtitle && <em>{subtitle}</em>}
                  <span>{title}</span>
                  {trailingSubtitle && <em className="issue-title-trailing-subtitle">{trailingSubtitle}</em>}
                </>
              ) : (
                <>
                  {title}
                  {subtitle && <em>{subtitle}</em>}
                </>
              )}
            </h1>
            <p className="issue-deck">{description}</p>
            {(readingPdf || editorialHref) && (
              <div className="issue-actions">
                {readingPdf && <a className="button button-light" href="#pdf-viewer">
                  {isEnglish ? "Read PDF on site" : "PDF’yi sitede oku"} <span>↓︎</span>
                </a>}
                {readingPdf && <a href={readingPdf} download>
                  {isEnglish ? "Download Full Issue PDF" : "Tam Sayı PDF İndir"} <span>↓︎</span>
                </a>}
                {editorialHref && <a href={editorialHref}>
                  {isEnglish ? "Read the editorial" : "Sunuş yazısını oku"} <span>→︎</span>
                </a>}
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
          {contentsDescription !== "" && <p>{contentsDescription ?? (isEnglish
            ? "All contributions published in this issue are presented with their article type, author, and page range."
            : "Bu sayıda yayımlanan tüm çalışmalar; yayın türü, yazar ve sayfa aralığıyla birlikte sunulmaktadır.")}</p>}
        </div>
        <div className="issue-toc">
          {publications.map((publication, index) => (
            <a
              href={isEnglish ? `/en/articles/${articleRouteSlug(publication, "en")}` : `/tr/makaleler/${publication.slug}`}
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
          {additionalContents.map((content, index) => (
            <a href={`${readingPdf}#page=${content.pdfPage}`} key={`${content.author}-${content.titleTr}`}>
              <span className="issue-toc-number">{padIssueNumber(publications.length + index + 1)}</span>
              <span className="issue-toc-meta">
                <small>{isEnglish ? content.typeEn : content.typeTr}</small>
                <b>{isEnglish ? (content.authorEn || content.author) : content.author}</b>
              </span>
              <span className="issue-toc-title">{isEnglish ? content.titleEn : content.titleTr}</span>
              <span className="issue-toc-pages">{content.pages}</span>
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
