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
          <span className="record-count">{people.length} {isEnglish ? "members" : "kişi"}</span>
        </div>
      ) : (
        <div className="editorial-roster-heading">
          <div>
            <p>{isEnglish ? "Editorial directory" : "Editoryal künye"}</p>
            <h2>{title}</h2>
          </div>
          <span className="record-count">{people.length} {isEnglish ? "members" : "kişi"}</span>
        </div>
      )}
      <ol className="editorial-roster-list">
        {people.map(([name, affiliation], index) => {
          const profileHref = authorProfileHref(name, locale);
          const displayedAffiliation = visibleAffiliation(affiliation, locale);
          return (
            <li key={name}>
              <span className="editorial-roster-number">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <a className="editorial-roster-name" href={profileHref}>{name}</a>
                {displayedAffiliation && <p>{displayedAffiliation}</p>}
              </div>
              <a className="editorial-roster-profile" href={profileHref} aria-label={isEnglish ? `View ${name}'s BRIQ profile` : `${name} BRIQ profilini görüntüle`}>↗︎</a>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
