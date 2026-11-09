import type { Metadata } from "next";

/**
 * Published BRIQ page URLs resolve with a terminal slash in production.
 * Keep canonical and hreflang hints on that final 200 URL, not on the
 * slashless URL that redirects there.
 *
 * Apply only to page metadata; PDF assets, citation links and DOI URLs
 * must retain their published filenames.
 */
export function terminalSlashPagePath(href: string): string {
  if (!href.startsWith("/") || href === "/" || href.endsWith("/")) return href;
  return `${href}/`;
}

export function alignPageSeoAlternates(metadata: Metadata): Metadata {
  const alternates = metadata.alternates;
  if (!alternates) return metadata;
  return {
    ...metadata,
    alternates: {
      ...alternates,
      canonical: typeof alternates.canonical === "string"
        ? terminalSlashPagePath(alternates.canonical)
        : alternates.canonical,
      languages: alternates.languages
        ? Object.fromEntries(
          Object.entries(alternates.languages).map(([locale, href]) => [
            locale,
            typeof href === "string" ? terminalSlashPagePath(href) : href,
          ]),
        )
        : alternates.languages,
    },
  };
}

/**
 * Winter issues are labelled with two calendar years (e.g. 2025-2026).
 * For Highwire citation_publication_date, use the January-side year (2026),
 * without changing the printed issue-year label or dated source records.
 */
export function citationPublicationYear(issueYear: string): string {
  const label = issueYear.trim();
  const winterRange = label.match(/^\d{4}\s*[-–—/]\s*(\d{4})$/);
  return winterRange ? winterRange[1] : label;
}
