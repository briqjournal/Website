import { searchScopeHref, type SearchKind } from "../search-state";

export function SearchScopeNav({ locale, kind, query }: { locale: "tr" | "en"; kind: SearchKind; query: string }) {
  const labels = locale === "en"
    ? { all: "All", article: "Articles", issue: "Issues", call: "Calls" }
    : { all: "Tümü", article: "Makaleler", issue: "Sayılar", call: "Çağrılar" };
  return <nav className="search-kind-tabs" aria-label={locale === "en" ? "Search scope" : "Arama kapsamı"}>
    {Object.entries(labels).map(([value, label]) => <a
      href={searchScopeHref(locale, value as SearchKind, query)}
      aria-current={kind === value ? "page" : undefined}
      className={kind === value ? "is-active" : undefined}
      key={value}
    >{label}</a>)}
  </nav>;
}
