export type SearchKind = "all" | "article" | "issue" | "call";
export type SearchState = {
  query: string;
  kind: SearchKind;
  year: string;
  volume: string;
  types: string[];
  pageSize: number;
  page: number;
};

export function readSearchState(search: string, defaultKind: SearchKind): SearchState {
  const params = new URLSearchParams(search);
  const kind = params.get("kind") as SearchKind | null;
  const page = Number(params.get("page") || 1);
  const size = Number(params.get("size") || 20);
  return {
    query: params.get("q") || "",
    kind: kind && ["all", "article", "issue", "call"].includes(kind) ? kind : defaultKind,
    year: /^\d{4}$/.test(params.get("year") || "") ? params.get("year")! : "all",
    volume: /^[1-7]$/.test(params.get("volume") || "") ? params.get("volume")! : "all",
    types: [...new Set(params.getAll("type"))].filter(Boolean),
    pageSize: [10, 20, 50].includes(size) ? size : 20,
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
  };
}

export function writeSearchState(search: string, state: SearchState, defaultKind: SearchKind) {
  const params = new URLSearchParams(search);
  for (const key of ["q", "kind", "year", "volume", "type", "size", "page"]) params.delete(key);
  if (state.query) params.set("q", state.query);
  if (state.kind !== defaultKind) params.set("kind", state.kind);
  if (state.year !== "all") params.set("year", state.year);
  if (state.volume !== "all") params.set("volume", state.volume);
  for (const type of state.types) params.append("type", type);
  if (state.pageSize !== 20) params.set("size", String(state.pageSize));
  if (state.page > 1) params.set("page", String(state.page));
  return params.toString();
}

export function searchScopeHref(locale: "tr" | "en", kind: SearchKind, query: string) {
  const root = locale === "en" ? "/en" : "/tr";
  const path = kind === "article"
    ? `${root}/${locale === "en" ? "articles" : "makaleler"}/`
    : `${root}/${locale === "en" ? "search" : "arama"}/`;
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (kind !== "all" && kind !== "article") params.set("kind", kind);
  return `${path}${params.size ? `?${params}` : ""}`;
}

export function searchExcerpt(text: string, query: string, locale: "tr" | "en") {
  const normalized = query.trim().toLocaleLowerCase(locale === "tr" ? "tr-TR" : "en-US");
  if (normalized.length < 2) return "";
  const index = text.toLocaleLowerCase(locale === "tr" ? "tr-TR" : "en-US").indexOf(normalized);
  if (index < 0) return "";
  const start = Math.max(0, text.lastIndexOf(" ", Math.max(0, index - 65)) + 1);
  const end = Math.min(text.length, index + normalized.length + 150);
  return `${start > 0 ? "…" : ""}${text.slice(start, end).trim()}${end < text.length ? "…" : ""}`;
}
