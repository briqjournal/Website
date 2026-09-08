import {
  authorId,
  authorProfileHref,
  boardAffiliation,
  findAuthorProfile,
  type Locale,
} from "../authors";

function MailIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 5.5h17v13h-17z"/><path d="m4.5 6.5 7.5 6 7.5-6"/></svg>;
}

function ScholarIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 9 9-5 9 5-9 5z"/><path d="M6.5 11.5V17c2.8 2.1 8.2 2.1 11 0v-5.5"/></svg>;
}

function ProfileIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5.5 20c.8-4 3-6 6.5-6s5.7 2 6.5 6"/></svg>;
}

export function PeopleDirectory({
  title,
  people,
  locale = "tr",
  compact = false,
}: {
  title: string;
  people: string[][];
  locale?: Locale;
  compact?: boolean;
}) {
  const isEnglish = locale === "en";

  return (
    <section className={`people-section board-directory ${compact ? "is-compact" : ""}`}>
      {compact ? (
        <div className="board-directory-meta">
          <span>{isEnglish ? "Members" : "Üyeler"}</span>
          <span className="record-count">{people.length} {isEnglish ? "members" : "kişi"}</span>
        </div>
      ) : (
        <div className="section-heading split-heading">
          <div>
            <p className="section-kicker">{isEnglish ? "Journal structure" : "Kurumsal yapı"}</p>
            <h2>{title}</h2>
          </div>
          <span className="record-count">{people.length} {isEnglish ? "members" : "kişi"}</span>
        </div>
      )}
      <div className="people-grid">
        {people.map(([name, affiliation]) => {
          const profile = findAuthorProfile(authorId(name));
          const profileHref = authorProfileHref(name, locale);
          return (
            <article className="person-card" key={`${name}-${affiliation}`}>
              <a className="person-portrait-link" href={profileHref} aria-label={isEnglish ? `View ${name}'s profile` : `${name} profilini görüntüle`}>
                {profile?.photo ? <img className="person-portrait" src={profile.photo} alt="" /> : <span className="person-mark">{name.replace(/^(Prof\.?|Doç\.?|Dr\.?)\s+/u, "").slice(0, 1)}</span>}
              </a>
              <div className="person-card-copy">
                <a className="person-name-link" href={profileHref}><h3>{name}</h3></a>
                <p>{boardAffiliation(affiliation, locale)}</p>
                <div className="person-card-actions">
                  {profile?.email && <a href={`mailto:${profile.email}`} aria-label={isEnglish ? `Email ${name}` : `${name} kişisine e-posta gönder`} title={profile.email}><MailIcon /></a>}
                  {profile?.scholarUrl && <a href={profile.scholarUrl} target="_blank" rel="noreferrer" aria-label={isEnglish ? `Search ${name} on Google Scholar` : `${name} için Google Scholar'da ara`} title="Google Scholar"><ScholarIcon /></a>}
                  <a href={profileHref} aria-label={isEnglish ? `Open ${name}'s BRIQ profile` : `${name} BRIQ profilini aç`} title={isEnglish ? "BRIQ profile" : "BRIQ profili"}><ProfileIcon /></a>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
