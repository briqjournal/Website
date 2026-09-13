import { AuthorUpdateForm } from "./AuthorUpdateForm";

type ActionIcon = "email" | "scholar" | "orcid" | "institution";

function ProfileActionIcon({ type }: { type: ActionIcon }) {
  if (type === "email") return <svg className="author-action-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="m4 7 8 6 8-6"/></svg>;
  if (type === "scholar") return <svg className="author-action-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m2.5 9 9.5-5 9.5 5-9.5 5z"/><path d="M6.5 11.2V16c2.8 2.3 8.2 2.3 11 0v-4.8M21.5 9v6"/></svg>;
  if (type === "orcid") return <svg className="author-action-icon author-action-icon-orcid" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8.2 9.7v6.1M8.2 7.2h.01M11.3 15.8V9.7h2.2c2 0 3.4 1.2 3.4 3.1s-1.4 3-3.4 3z"/></svg>;
  return <svg className="author-action-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 20h18M5 18V9h14v9M3.5 9 12 4l8.5 5M8 12v4M12 12v4M16 12v4"/></svg>;
}

export function AuthorProfileActions({
  authorName,
  email,
  scholarUrl,
  orcids,
  institutionUrl,
  locale = "tr",
}: {
  authorName: string;
  email?: string;
  scholarUrl: string;
  orcids: string[];
  institutionUrl?: string;
  locale?: "tr" | "en";
}) {
  const isEnglish = locale === "en";
  return (
    <div className="author-page-links" aria-label={isEnglish ? "Author external links" : "Yazarın dış bağlantıları"}>
      {email && <a href={`mailto:${email}`}><ProfileActionIcon type="email"/><span>{isEnglish ? "Email" : "E-posta"}</span></a>}
      <a href={scholarUrl} target="_blank" rel="noreferrer"><ProfileActionIcon type="scholar"/><span>Google Scholar</span></a>
      {orcids.map((orcid) => <a href={`https://orcid.org/${orcid}`} target="_blank" rel="noreferrer" key={orcid}><ProfileActionIcon type="orcid"/><span>ORCID</span></a>)}
      {institutionUrl && <a href={institutionUrl} target="_blank" rel="noreferrer"><ProfileActionIcon type="institution"/><span>{isEnglish ? "Institution" : "Üniversite"}</span></a>}
      <AuthorUpdateForm authorName={authorName} locale={locale} />
    </div>
  );
}
