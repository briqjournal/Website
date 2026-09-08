import type { Locale } from "../authors";

export type PublicationHistory = {
  received?: string | null;
  revised?: string | null;
  accepted?: string | null;
  publishedOnline?: string | null;
};

function formatDate(value: string | null | undefined, locale: Locale) {
  if (!value) return "—";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export function PublicationRecord({
  locale,
  history,
  doi,
}: {
  locale: Locale;
  history?: PublicationHistory;
  doi?: string | null;
}) {
  const labels: [string, string | null | undefined][] = locale === "tr"
    ? [
        ["Geliş", history?.received],
        ["Revizyon", history?.revised],
        ["Kabul", history?.accepted],
        ["Çevrimiçi yayım", history?.publishedOnline],
      ]
    : [
        ["Received", history?.received],
        ["Revised", history?.revised],
        ["Accepted", history?.accepted],
        ["Published online", history?.publishedOnline],
      ];

  return (
    <>
      <div className="publication-record-group">
        <p className="article-sidebar-heading">
          {locale === "tr" ? "Makale geçmişi" : "Article history"}
        </p>
        <dl className="publication-history">
          {labels.map(([label, value]) => (
            <div className={value ? "" : "is-empty"} key={label}>
              <dt>{label}</dt>
              <dd>{formatDate(value, locale)}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className={`publication-doi${doi ? "" : " is-empty"}`}>
        <span>DOI</span>
        <b>{doi ? <a href={`https://doi.org/${doi}`}>{`https://doi.org/${doi}`}</a> : "—"}</b>
      </div>
    </>
  );
}
