/**
 * Match internal navigation links to the final published page URLs.
 * Cloudflare serves /en/.../ and /tr/.../ directly; their slashless
 * counterparts require an avoidable redirect.
 *
 * Do not rewrite external URLs, downloads, DOI links, mailto:, hash links,
 * query-only links, or real file extensions.
 */
export function canonicalPageHref(href: string | undefined): string | undefined {
  if (!href || !href.startsWith("/") || href.startsWith("//")) return href;
  const suffixStart = href.search(/[?#]/);
  const path = suffixStart < 0 ? href : href.slice(0, suffixStart);
  const suffix = suffixStart < 0 ? "" : href.slice(suffixStart);
  if (!/^\/(?:en|tr)(?:\/|$)/.test(path)) return href;
  if (path.endsWith("/") || /\.[a-z0-9]{1,8}$/i.test(path)) return href;
  return path + "/" + suffix;
}
