const ORCID_PREFIX = "https://orcid.org/";

function localizedStatement(value, locale) {
  if (value == null) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object") return value[locale] ?? null;
  return null;
}

function authorDisplayName(author) {
  if (author?.displayName?.trim()) return author.displayName.trim();
  return [author?.givenName, author?.familyName].filter(Boolean).join(" ").trim();
}

function normalizeOrcid(value) {
  if (!value) return null;
  return String(value).trim().replace(ORCID_PREFIX, "");
}

function pageRange(pages) {
  if (!pages) return null;
  if (typeof pages === "string") return pages;
  if (pages.first && pages.last) return `${pages.first}-${pages.last}`;
  return pages.first || pages.last || null;
}

function legacyStatement(value) {
  if (value == null) return undefined;
  return {
    statement_tr: localizedStatement(value, "tr"),
    statement_en: localizedStatement(value, "en"),
  };
}

function legacyFunding(funding) {
  if (!funding) return undefined;
  const funders = Array.isArray(funding.funders)
    ? funding.funders.map((funder) => {
        if (typeof funder === "string") return { name_tr: funder, name_en: funder };
        return {
          name_tr: localizedStatement(funder?.name, "tr") ?? funder?.nameTr ?? funder?.name ?? null,
          name_en: localizedStatement(funder?.name, "en") ?? funder?.nameEn ?? funder?.name ?? null,
          grant_or_project_number: funder?.awardNumbers?.join(", ") ?? funder?.awardNumber ?? null,
        };
      })
    : [];

  return {
    statement_tr: localizedStatement(funding.statement, "tr"),
    statement_en: localizedStatement(funding.statement, "en"),
    funders,
  };
}

function legacyAuthorContributions(value) {
  if (!value) return undefined;
  if (typeof value === "string" || value.tr || value.en) return legacyStatement(value);
  return {
    statement_tr: localizedStatement(value.statement, "tr"),
    statement_en: localizedStatement(value.statement, "en"),
    credit_roles: Array.isArray(value.creditRoles)
      ? value.creditRoles.map((entry) => ({ role: entry.role, authors: entry.authors || [] }))
      : undefined,
  };
}

function legacyEthics(value) {
  if (!value) return undefined;
  if (typeof value === "string" || value.tr || value.en) return legacyStatement(value);
  return {
    statement_tr: localizedStatement(value.statement, "tr"),
    statement_en: localizedStatement(value.statement, "en"),
    committee_name_tr: localizedStatement(value.committeeName, "tr"),
    committee_name_en: localizedStatement(value.committeeName, "en"),
    approval_date: value.approvalDate ?? null,
    decision_number: value.decisionNumber ?? null,
  };
}

function legacyDataAvailability(value) {
  if (!value) return undefined;
  if (typeof value === "string" || value.tr || value.en) return legacyStatement(value);
  return {
    statement_tr: localizedStatement(value.statement, "tr"),
    statement_en: localizedStatement(value.statement, "en"),
    repository_name: value.repositoryName ?? null,
    data_doi: value.doi ?? null,
    url: value.url ?? null,
  };
}

export function isArticleMetadataV2(record) {
  return Boolean(
    record &&
      (record.schemaVersion === 2 ||
        (record.id && record.articleType && record.title && Array.isArray(record.authors) && record.dates && record.journal)),
  );
}

/**
 * Convert canonical article metadata v2 into the legacy ArchiveArticle shape used
 * by the current renderer. Legacy metadata is returned unchanged, which lets the
 * repository migrate article-by-article without a flag day.
 */
export function toArchiveArticle(record, issueRecord = null) {
  if (!isArticleMetadataV2(record)) return record;

  const authors = record.authors || [];
  const authorNames = authors.map(authorDisplayName).filter(Boolean);
  const affiliations = authors.flatMap((author) => {
    const name = authorDisplayName(author);
    return (author.affiliations || []).map((affiliation) => ({
      name,
      tr: affiliation.nameTr ?? affiliation.name ?? null,
      en: affiliation.nameEn ?? affiliation.name ?? null,
    }));
  });
  const orcids = authors.map((author) => normalizeOrcid(author.orcid)).filter(Boolean);
  const published = record.dates?.published ?? null;
  const volume = Number(record.journal?.volume ?? issueRecord?.volume);
  const issue = Number(record.journal?.issue ?? issueRecord?.issue);

  return {
    slug: record.id,
    volume,
    issue,
    season_tr: record.journal?.season?.tr ?? issueRecord?.season_tr ?? "",
    season_en: record.journal?.season?.en ?? issueRecord?.season_en ?? "",
    year: String(record.journal?.year ?? issueRecord?.year ?? published?.slice(0, 4) ?? ""),
    author: authorNames.join(" - "),
    title_tr: record.title?.tr ?? null,
    title_en: record.title?.en ?? null,
    abstract_tr: record.abstract?.tr ?? null,
    abstract_en: record.abstract?.en ?? null,
    citation_tr: record.citation?.tr ?? null,
    citation_en: record.citation?.en ?? null,
    pages: pageRange(record.pages),
    doi: record.doi ?? undefined,
    orcids: orcids.length ? orcids : undefined,
    author_affiliations: affiliations.length ? affiliations : undefined,
    received_date: record.dates?.received ?? null,
    revised_date: record.dates?.revised ?? null,
    accepted_date: record.dates?.accepted ?? null,
    published_online_date: published,
    publication_type_tr: record.articleType?.tr ?? null,
    publication_type_en: record.articleType?.en ?? null,
    source_tr: record.urls?.tr ?? "",
    source_en: record.urls?.en ?? null,
    pdf_tr_source: record.urls?.pdfTr ?? null,
    pdf_en_source: record.urls?.pdfEn ?? null,
    pdf_tr_local: record.urls?.pdfTrLocal,
    pdf_en_local: record.urls?.pdfEnLocal,
    shared_bilingual_pdf: Boolean(record.urls?.sharedBilingualPdf),
    funding: legacyFunding(record.funding),
    conflict_of_interest: legacyStatement(record.conflictOfInterest),
    author_contributions: legacyAuthorContributions(record.authorContributions),
    ethics_approval_and_informed_consent: legacyEthics(record.ethicsApproval),
    data_availability: legacyDataAvailability(record.dataAvailability),
    ai_use_statement: legacyStatement(record.aiUse),
    acknowledgements: legacyStatement(record.acknowledgements),
  };
}
