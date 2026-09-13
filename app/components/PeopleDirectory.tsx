import {
  authorProfileHref,
  boardAffiliation,
  type Locale,
} from "../authors";

const academicAffiliationMarkers = [
  "üniversite",
  "university",
  "college",
  "akademi",
  "academy",
  "enstitü",
  "institute",
  "konservatuvar",
  "conservatory",
  "school of economics",
  "tübitak",
  "odtü",
  "itü",
];

function visibleAffiliation(affiliation: string, locale: Locale) {
  const normalizedAffiliation = affiliation.normalize("NFKC").toLocaleLowerCase("tr-TR");
  if (!academicAffiliationMarkers.some((marker) => normalizedAffiliation.includes(marker))) return "";
  return boardAffiliation(affiliation, locale);
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
    <section className={`people-section editorial-roster ${compact ? "is-compact" : ""}`}>
      {compact ? (
        <div className="editorial-roster-meta">
          <span>{isEnglish ? "Members" : "Üyeler"}</span>
        </div>
      ) : (
        <div className="editorial-roster-heading">
          <div>
            <p>{isEnglish ? "Journal masthead" : "Dergi künyesi"}</p>
            <h2>{title}</h2>
          </div>
        </div>
      )}
      <ul className="editorial-roster-list">
        {people.map(([name, affiliation]) => {
          const profileHref = authorProfileHref(name, locale);
          const displayedAffiliation = visibleAffiliation(affiliation, locale);
          return (
            <li key={name}>
              <div className="editorial-roster-entry">
                <a className="editorial-roster-name" href={profileHref}>{name}</a>
                {displayedAffiliation && <><span aria-hidden="true">, </span><em>{displayedAffiliation}</em></>}
              </div>
              <a className="editorial-roster-profile" href={profileHref} aria-label={isEnglish ? `View ${name}'s BRIQ profile` : `${name} BRIQ profilini görüntüle`}>↗︎</a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
