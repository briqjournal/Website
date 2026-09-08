import { Fragment } from "react";
import {
  authorEmail,
  authorProfileHref,
  isPersonByline,
  splitAuthorNames,
  type Locale,
} from "../authors";

function MailIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18">
      <path d="M3.75 5.75h16.5v12.5H3.75z" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="m4.5 6.6 7.5 6 7.5-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

export function AuthorLinks({ byline, locale }: { byline: string; locale: Locale }) {
  const names = splitAuthorNames(byline);
  if (!names.some(isPersonByline)) return <>{byline}</>;

  return (
    <span className="author-links">
      {names.map((name, index) => {
        const email = authorEmail(name);
        const profileHref = authorProfileHref(name, locale);
        return (
          <Fragment key={`${name}-${index}`}>
            {index > 0 && <span className="author-separator" aria-hidden="true"> · </span>}
            {isPersonByline(name) ? (
              <span className="author-link-item">
                <a className="author-profile-link" href={profileHref}>{name}</a>
                {email && (
                  <a className="author-mail-link" href={`mailto:${email}`} aria-label={locale === "tr" ? `${name} adlı yazara e-posta gönder` : `Email ${name}`} title={email}>
                    <MailIcon />
                  </a>
                )}
              </span>
            ) : name}
          </Fragment>
        );
      })}
    </span>
  );
}
