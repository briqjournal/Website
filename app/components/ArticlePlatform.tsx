import {
  loadArchiveEnglishFullText,
  loadCurrentFullText,
  loadSaudiEnglishFullText,
} from "../generated-fulltext/loaders";
import { articleCitation, citationWithDoi } from "../article-citation";
import {
  archiveArticles,
  articlePdfUrl,
  publicationType,
  type ArchiveArticle,
} from "../archive";
import { issueAccent } from "../issue-themes";
import {
  authorAffiliation,
  authorEmail,
  authorId,
  authorProfileHref,
  findAuthorProfile,
  isPersonByline,
  splitAuthorNames,
} from "../authors";
import { ArticleStaticToc } from "./ArticleStaticToc";
import { BackToTop } from "./BackToTop";
import { ArticleFigures, type ArticleFigure } from "./ArticleFigures";
import { ArticleRichText, type FullTextNote, type FullTextReference, type FullTextSection } from "./ArticleRichText";
import { CitationTools } from "./CitationTools";
import { PdfViewer } from "./PdfViewer";
import { PublicationRecord, type PublicationHistory } from "./PublicationRecord";
import { ReferenceBackLink } from "./ReferenceBackLink";
import { ReferenceText, referenceDoi } from "./ReferenceText";

type LocalizedFullText = {
  sections: FullTextSection[];
  keywords?: string[];
  footnotes: FullTextNote[];
  references: FullTextReference[];
  acknowledgements: string;
  figures: ArticleFigure[];
  declarations?: {
    acknowledgements?: string;
    funding?: string;
    competingInterests?: string;
    ethicsApproval?: string;
  };
  supplementary?: { title: string; url: string }[];
};

type CurrentFullTextRecord = {
  metadata?: { received?: string; accepted?: string; correspondingAuthor?: string };
  tr: LocalizedFullText;
  en: LocalizedFullText;
};

function mergeLocalizedFullText(
  primary: LocalizedFullText | undefined,
  fallback: LocalizedFullText | undefined,
) {
  if (!primary) return fallback;
  if (!fallback) return primary;
  return {
    ...fallback,
    ...primary,
    sections: primary.sections?.length ? primary.sections : fallback.sections,
    keywords: primary.keywords?.length ? primary.keywords : fallback.keywords,
    footnotes: primary.footnotes?.length ? primary.footnotes : fallback.footnotes,
    references: primary.references?.length ? primary.references : fallback.references,
    acknowledgements: primary.acknowledgements?.trim() ? primary.acknowledgements : fallback.acknowledgements,
    figures: primary.figures?.length ? primary.figures : fallback.figures,
    declarations: { ...fallback.declarations, ...primary.declarations },
    supplementary: primary.supplementary?.length ? primary.supplementary : fallback.supplementary,
  } satisfies LocalizedFullText;
}

type ArticleDetails = {
  abstract?: string[];
  keywords?: string[];
  citation?: string;
  affiliation?: string;
  orcid?: string;
  received?: string;
  revised?: string;
  accepted?: string;
  publishedOnline?: string;
};

const SAUDI_CULTURAL_HEDGING_SLUG = "suudi-arabistanin-abd-ile-cin-arasinda-cok-boyutlu-kulturel-dengeleme-stratejisi";

function OrcidBadge() {
  return <span className="orcid-badge" aria-hidden="true">iD</span>;
}

function MailIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M3.75 5.75h16.5v12.5H3.75z" fill="none" stroke="currentColor" strokeWidth="1.7"/><path d="m4.5 6.6 7.5 6 7.5-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>;
}

function PdfFileIcon() {
  return <svg className="article-action-icon article-pdf-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M5.5 2.75h8.5l4.5 4.5v14H5.5z" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinejoin="round"/><path d="M14 2.75v4.5h4.5" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinejoin="round"/><text x="7.1" y="17.3" fill="currentColor" fontFamily="Arial, sans-serif" fontSize="5.2" fontWeight="800">PDF</text></svg>;
}

function DownloadIcon() {
  return <svg className="article-action-icon article-download-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M12 4v11m0 0 4-4m-4 4-4-4M5 20h14" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

function ArrowIcon({ direction = "right" }: { direction?: "right" | "down" }) {
  return direction === "right"
    ? <svg className="article-action-icon article-arrow-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14m-5-5 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
    : <svg className="article-action-icon article-arrow-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M12 5v14m-5-5 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

function ArticleAuthors({ article, locale, correspondingAuthor }: { article: ArchiveArticle; locale: "tr" | "en"; correspondingAuthor?: string }) {
  const names = splitAuthorNames(article.author);
  return (
    <div className="article-author-list">
      {names.map((name, index) => {
        const profile = findAuthorProfile(authorId(name));
        const orcid = article.orcids?.[index] || profile?.orcids[0];
        const email = authorEmail(name);
        const person = isPersonByline(name);
        return (
          <div className="article-author-row" key={`${name}-${index}`}>
            <div>
              {person ? <a className="author-profile-link" href={authorProfileHref(name, locale)}><span className="article-author-name">{name}</span></a> : <b>{name}</b>}
              {correspondingAuthor === name && <span className="corresponding-badge">{locale === "tr" ? "Sorumlu yazar" : "Corresponding author"}</span>}
              <small>{authorAffiliation(name, locale)}</small>
            </div>
            <span className="article-author-identifiers">
              {orcid && <a href={`https://orcid.org/${orcid}`} target="_blank" rel="noreferrer" title={`ORCID ${orcid}`}><OrcidBadge /><span>{orcid}</span></a>}
              {email && <a href={`mailto:${email}`} title={email} aria-label={locale === "tr" ? `${name} adlı yazara e-posta gönder` : `Email ${name}`}><MailIcon /></a>}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function normalizedReference(value: string) {
  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("en-US")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function briqReferenceArticle(text: string, doi?: string) {
  if (doi) {
    const byDoi = archiveArticles.find((article) => article.doi?.toLocaleLowerCase("en-US") === doi.toLocaleLowerCase("en-US"));
    if (byDoi) return byDoi;
  }
  const haystack = normalizedReference(text);
  return archiveArticles.find((article) => {
    const titles = [article.title_tr, article.title_en].filter(Boolean).map((title) => normalizedReference(title!));
    return titles.some((title) => title.length >= 28 && haystack.includes(title));
  });
}

function referencesWithUnlistedCitations(
  sections: FullTextSection[],
  references: FullTextReference[],
  locale: "tr" | "en",
) {
  const additions = new Map<string, FullTextReference>();
  const citationGroup = /\([^()\n]*(?:(?:19|20)\d{2}|t\.\s*y\.|n\.\s*d\.)[^()\n]*\)/giu;
  const date = /(?:19|20)\d{2}[a-z]?|t\.\s*y\.|n\.\s*d\./iu;
  const normalizedDate = (value: string) => value.toLocaleLowerCase("en-US").replace(/\s+/g, "").replace(/^t\.y\.$|^n\.d\.$/, "nd");

  for (const paragraph of sections.flatMap((section) => section.paragraphs)) {
    for (const group of paragraph.matchAll(citationGroup)) {
      for (const rawPart of group[0].slice(1, -1).split(/\s*;\s*/)) {
        const foundDate = date.exec(rawPart);
        if (!foundDate?.index) continue;
        const authorPart = rawPart.slice(0, foundDate.index);
        const tail = rawPart.slice(foundDate.index + foundDate[0].length).trim();
        if (!/,\s*$/.test(authorPart) || (tail && !/^,?\s*(?:s{1,2}|p{1,2})\.?\s*\d/iu.test(tail))) continue;
        const authorWords = normalizedReference(authorPart).split(" ").filter((word) => word.length > 1);
        if (!authorWords.length) continue;
        const year = normalizedDate(foundDate[0]);
        const exists = references.some((reference) => {
          const referenceDate = reference.text.match(date)?.[0];
          if (!referenceDate || normalizedDate(referenceDate).replace(/[a-z]$/, "") !== year.replace(/[a-z]$/, "")) return false;
          const referenceWords = new Set(normalizedReference(reference.text.slice(0, reference.text.search(date))).split(" "));
          return authorWords.some((word) => referenceWords.has(word));
        });
        if (exists) continue;
        const citation = `${authorPart.replace(/,\s*$/, "").trim()} (${foundDate[0]})`;
        const key = normalizedReference(citation);
        if (!additions.has(key)) {
          additions.set(key, {
            id: `ref-unlisted-${additions.size + 1}`,
            text: locale === "tr"
              ? `${citation}. Kaynak metnin kaynakça bölümünde bu atıf için ayrı bir tam künye verilmemiştir.`
              : `${citation}. The source article does not provide a separate full bibliographic entry for this citation.`,
          });
        }
      }
    }
  }
  return [...references, ...additions.values()];
}

type StatementItem = { id: string; label: string; value: string };

function researchStatementItems(fullText: LocalizedFullText | undefined, locale: "tr" | "en"): StatementItem[] {
  const ack = fullText?.acknowledgements?.trim();
  const declarations = fullText?.declarations;
  const inferredFunding = ack && /(destek|support|fund|grant|program)/i.test(ack) ? ack : "";
  const inferredAcknowledgement = ack && !inferredFunding ? ack : "";
  const values = {
    acknowledgements: declarations?.acknowledgements?.trim() || inferredAcknowledgement,
    funding: declarations?.funding?.trim() || inferredFunding,
    competingInterests: declarations?.competingInterests?.trim() || "",
    ethicsApproval: declarations?.ethicsApproval?.trim() || "",
  };
  const definitions = locale === "tr" ? [
    ["tesekkur", "Teşekkür", values.acknowledgements],
    ["finansman", "Finansman beyanı", values.funding],
    ["cikar-catismasi", "Çıkar çatışması beyanı", values.competingInterests],
    ["etik-kurul", "Etik kurul beyanı", values.ethicsApproval],
  ] : [
    ["acknowledgements", "Acknowledgements", values.acknowledgements],
    ["funding", "Funding / Financial support", values.funding],
    ["competing-interests", "Competing interests", values.competingInterests],
    ["ethics-approval", "Ethics approval", values.ethicsApproval],
  ];
  return definitions
    .filter(([, , value]) => Boolean(value))
    .map(([id, label, value]) => ({ id, label, value }));
}

function ResearchStatements({ items, locale }: { items: StatementItem[]; locale: "tr" | "en" }) {
  if (!items.length) return null;
  return (
    <div className="article-declaration-list">
      {items.map(({ id, label, value }) => <section className="article-declaration" id={id} key={id}><p className="section-kicker">{locale === "tr" ? "Beyan" : "Statement"}</p><h2>{label}</h2><p>{value}</p></section>)}
    </div>
  );
}

export async function ArticlePlatform({
  article,
  locale,
  routeSlug = article.slug,
  details,
}: {
  article: ArchiveArticle;
  locale: "tr" | "en";
  routeSlug?: string;
  details?: ArticleDetails;
}) {
  const fullRecord = await loadCurrentFullText(article.slug) as CurrentFullTextRecord | undefined;
  const storedFullText = fullRecord?.[locale];
  const archivedEnglishFullText = locale === "en" && article.slug !== SAUDI_CULTURAL_HEDGING_SLUG
    ? await loadArchiveEnglishFullText(article.slug) as LocalizedFullText | undefined
    : undefined;
  const saudiEnglishFullText = locale === "en" && article.slug === SAUDI_CULTURAL_HEDGING_SLUG
    ? await loadSaudiEnglishFullText() as LocalizedFullText
    : undefined;
  const fullText = locale === "en"
    ? mergeLocalizedFullText(saudiEnglishFullText || archivedEnglishFullText, storedFullText)
    : storedFullText;
  const displayReferences = fullText ? referencesWithUnlistedCitations(fullText.sections, fullText.references, locale) : [];
  const metadata = fullRecord?.metadata;
  const title = locale === "tr" ? article.title_tr : (article.title_en || article.title_tr);
  const abstractSource = locale === "tr" ? article.abstract_tr : article.abstract_en;
  const abstract = details?.abstract || abstractSource?.split("\n").filter(Boolean) || [];
  const citation = citationWithDoi(details?.citation || articleCitation(article, locale), article.doi);
  const keywords = details?.keywords || fullText?.keywords || [];
  const articleType = publicationType(article, locale);
  const statements = researchStatementItems(fullText, locale);
  const supplementary = fullText?.supplementary || [];
  const trPdf = articlePdfUrl(article, "tr");
  const enPdf = articlePdfUrl(article, "en");
  const activePdf = locale === "tr" ? trPdf : (enPdf || trPdf);
  const base = locale === "tr" ? `/makaleler/${routeSlug}` : `/en/articles/${routeSlug}`;
  const issueHref = article.volume === 7 && article.issue === 4
    ? (locale === "tr" ? "/guncel-sayi" : "/en/current-issue")
    : (locale === "tr" ? `/arsiv/cilt-${article.volume}-sayi-${article.issue}` : `/en/archive/volume-${article.volume}-issue-${article.issue}`);
  const issueColor = issueAccent(article.volume, article.issue);
  const history: PublicationHistory = {
    received: details?.received || metadata?.received || article.received_date,
    revised: details?.revised || article.revised_date,
    accepted: details?.accepted || metadata?.accepted || article.accepted_date,
    publishedOnline: details?.publishedOnline || article.published_online_date,
  };
  const abstractId = locale === "tr" ? "oz" : "abstract";
  const nav = [
    { id: abstractId, label: locale === "tr" ? "Öz" : "Abstract", level: 1 },
    ...(keywords.length ? [{ id: locale === "tr" ? "anahtar-kelimeler" : "keywords", label: locale === "tr" ? "Anahtar kelimeler" : "Keywords", level: 1 }] : []),
    ...(fullText?.sections.length ? [{ id: locale === "tr" ? "tam-metin" : "full-text-body", label: locale === "tr" ? "Tam Metin" : "Full Text", level: 1 }] : []),
    ...(fullText?.sections || []).map((section) => ({ id: section.id, label: section.title, level: 2 })),
    ...statements.map(({ id, label }) => ({ id, label, level: 1 })),
    ...(fullText?.figures.length ? [{ id: locale === "tr" ? "gorseller" : "visuals", label: locale === "tr" ? "Görsel ve tablolar" : "Visuals and tables", level: 1 }] : []),
    ...(supplementary.length ? [{ id: locale === "tr" ? "ek-materyaller" : "supplementary", label: locale === "tr" ? "Ek materyaller" : "Supplementary information", level: 1 }] : []),
    { id: locale === "tr" ? "atif" : "cite", label: locale === "tr" ? "Kaynak göster" : "Cite this article", level: 1 },
    ...(fullText?.footnotes.length ? [{ id: locale === "tr" ? "dipnotlar" : "footnotes", label: locale === "tr" ? "Dipnotlar" : "Footnotes", level: 1 }] : []),
    ...(displayReferences.length ? [{ id: locale === "tr" ? "kaynakca" : "references", label: locale === "tr" ? "Kaynakça" : "References", level: 1 }] : []),
  ];

  return (
    <>
      <section className="article-masthead article-platform-masthead">
        <div className="article-masthead-rule" />
        <div className="site-shell article-masthead-inner">
          <div className="page-breadcrumb article-breadcrumb"><a href={locale === "tr" ? "/" : "/en"}>{locale === "tr" ? "Ana Sayfa" : "Home"}</a><span>/</span><a href={issueHref}>{locale === "tr" ? `Cilt ${article.volume} · Sayı ${article.issue}` : `Volume ${article.volume} · Issue ${article.issue}`}</a><span>/</span><span>{articleType}</span></div>
          <div className="article-status-row"><span className="article-type-label">{articleType}</span></div>
          <h1>{title}</h1>
          <ArticleAuthors article={article} locale={locale} correspondingAuthor={metadata?.correspondingAuthor} />
        </div>
      </section>

      <div className="article-action-bar article-platform-actions"><div className="site-shell">
        <a className="article-fulltext-action" href="#full-text"><span>{locale === "tr" ? "Tam metin" : "Full text"}</span><ArrowIcon direction="down" /></a>
        <a className="article-issue-action" href={issueHref} style={{ backgroundColor: issueColor }}><span>{locale === "tr" ? "Sayıya git" : "View issue"}</span><ArrowIcon /></a>
        {activePdf && <a className="article-primary-action" href={`${base}/pdf`}><PdfFileIcon /><span>{locale === "tr" ? "PDF’yi görüntüle" : "View PDF"}</span><ArrowIcon direction="right" /></a>}
        {activePdf && <a className="article-download-action" href={activePdf} download><PdfFileIcon /><span>{locale === "tr" ? "PDF’yi indir" : "Download PDF"}</span><DownloadIcon /></a>}
        <span className="article-license">CC BY 4.0</span>
      </div></div>

      <div className="site-shell article-platform-layout" id="full-text">
        <aside className="article-navigation">
          <ArticleStaticToc items={nav} locale={locale} />
          <div className="article-record-compact">
            <div><span>{locale === "tr" ? "Cilt / Sayı" : "Volume / Issue"}</span><b>{article.volume} / {article.issue}</b></div>
            <div><span>{locale === "tr" ? "Sayfa" : "Pages"}</span><b>{article.pages || "—"}</b></div>
            <div><span>{locale === "tr" ? "Yayın" : "Published"}</span><b>{locale === "tr" ? article.season_tr : article.season_en} {article.year}</b></div>
            {article.doi && <div className="publication-doi"><span>DOI</span><b><a href={`https://doi.org/${article.doi}`} target="_blank" rel="noreferrer">{article.doi}</a></b></div>}
          </div>
          <PublicationRecord locale={locale} history={history} />
        </aside>

        <article className="article-platform-content">
          <section className="article-abstract" id={locale === "tr" ? "oz" : "abstract"}>
            <h2>{locale === "tr" ? "Öz" : "Abstract"}</h2>
            {abstract.length ? abstract.map((paragraph) => <p key={paragraph}>{paragraph}</p>) : <p>{locale === "tr" ? "Kaynak arşivinde bu içerik için ayrı bir özet metni bulunmamaktadır." : "The source archive does not contain a separate abstract for this contribution."}</p>}
          </section>

          {keywords.length ? <section className="article-keywords" id={locale === "tr" ? "anahtar-kelimeler" : "keywords"}><h2>{locale === "tr" ? "Anahtar kelimeler" : "Keywords"}</h2><div>{keywords.map((keyword) => <span key={keyword}>{keyword}</span>)}</div></section> : null}

          {fullText?.sections.length ? <ArticleRichText sections={fullText.sections} references={displayReferences} notes={fullText.footnotes} locale={locale} /> : (
            <section className="legacy-fulltext-note"><h2>{locale === "tr" ? "Tam Metin" : "Full Text"}</h2><p>{locale === "tr" ? "Bu arşiv kaydının tam metni dijitalleştirme sırasındadır. Doğrulanmış makale dosyasına üstteki PDF düğmesinden erişebilirsiniz." : "The full text for this archival record is being digitised. Use the PDF button above to access the verified article file."}</p></section>
          )}

          <ResearchStatements items={statements} locale={locale} />
          <div className="article-disclosure-stack">
            {fullText && <ArticleFigures figures={fullText.figures} locale={locale} />}
            {supplementary.length ? <details className="article-accordion" id={locale === "tr" ? "ek-materyaller" : "supplementary"}><summary><span>{locale === "tr" ? "Ek materyaller" : "Supplementary information"}</span><b>{supplementary.length}</b></summary><div className="supplementary-links">{supplementary.map((item) => <a href={item.url} key={`${item.title}-${item.url}`} download>{item.title}<span>↓︎</span></a>)}</div></details> : null}

            <details className="article-accordion article-citation-accordion" id={locale === "tr" ? "atif" : "cite"}><summary><span>{locale === "tr" ? "Bu makaleyi kaynak göster" : "Cite this article"}</span><b>APA 7</b></summary><div className="accordion-copy citation-accordion-copy"><CitationTools citation={citation} slug={article.slug} locale={locale} /></div></details>

            {fullText?.footnotes.length ? <details className="article-accordion article-notes" id={locale === "tr" ? "dipnotlar" : "footnotes"}><summary><span>{locale === "tr" ? "Dipnotlar" : "Footnotes"}</span><b>{fullText.footnotes.length}</b></summary><ol>{fullText.footnotes.map((note) => <li id={`footnote-${note.id}`} key={note.id}><span>{note.id}</span><p>{note.text}</p><ReferenceBackLink targetId={`footnote-${note.id}`} locale={locale} kind="footnote" /></li>)}</ol></details> : null}

            {displayReferences.length ? <details className="article-accordion article-references" id={locale === "tr" ? "kaynakca" : "references"}><summary><span>{locale === "tr" ? "Kaynakça" : "References"}</span><b>{displayReferences.length}</b></summary><ol>{displayReferences.map((reference) => {
              const doi = referenceDoi(reference.text);
              const briqArticle = briqReferenceArticle(reference.text, doi);
              const briqHref = briqArticle ? (locale === "tr" ? `/makaleler/${briqArticle.slug}` : `/en/articles/${briqArticle.slug}`) : undefined;
              return <li id={reference.id} key={reference.id}><p><ReferenceText text={reference.text} doi={doi} briqHref={briqHref} /></p><span className="reference-actions">
                <ReferenceBackLink targetId={reference.id} locale={locale} kind="reference" />
              </span></li>;
            })}</ol></details> : null}
          </div>

          <section className="article-rights"><div><h3>{locale === "tr" ? "Lisans ve telif" : "Licence and copyright"}</h3><p>© BRIQ · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a></p></div><div><h3>{locale === "tr" ? "İzinler ve yeniden kullanım" : "Permissions and reprints"}</h3><p><a href="mailto:briq@briqjournal.com">briq@briqjournal.com</a></p></div></section>
        </article>
      </div>
      <BackToTop locale={locale} />
    </>
  );
}

export function ArticlePdfPage({ article, locale, routeSlug = article.slug }: { article: ArchiveArticle; locale: "tr" | "en"; routeSlug?: string }) {
  const trPdf = articlePdfUrl(article, "tr");
  const enPdf = articlePdfUrl(article, "en");
  const title = locale === "tr" ? article.title_tr : (article.title_en || article.title_tr);
  const articleHref = locale === "tr" ? `/makaleler/${routeSlug}` : `/en/articles/${routeSlug}`;
  return (
    <>
      <section className="pdf-page-heading"><div className="site-shell"><div><span>{locale === "tr" ? "PDF görüntüleyici" : "PDF viewer"}</span><h1>{title}</h1></div><a className="button button-light" href={articleHref}>←︎ {locale === "tr" ? "HTML makaleye dön" : "Back to HTML article"}</a></div></section>
      <div className="site-shell standalone-article-pdf"><PdfViewer title={title} turkishSrc={trPdf} englishSrc={enPdf} locale={locale} compact /></div>
    </>
  );
}
