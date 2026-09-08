import { authorProfileHref, boardAffiliation, type Locale } from "../authors";

type ImprintGroup = {
  title: string;
  href: string;
  people: string[][];
};

export function ImprintRoster({
  groups,
  locale = "tr",
}: {
  groups: ImprintGroup[];
  locale?: Locale;
}) {
  const isEnglish = locale === "en";

  return (
    <div className="imprint-rosters">
      {groups.map((group) => (
        <section className="imprint-roster-group" key={group.title}>
          <div className="imprint-roster-heading">
            <div>
              <p>{isEnglish ? "Journal structure" : "Kurumsal yapı"}</p>
              <h2>{group.title}</h2>
            </div>
            <a href={group.href}>{isEnglish ? "Profile cards" : "Profil kartları"} →︎</a>
          </div>
          <ul>
            {group.people.map(([name, affiliation]) => (
              <li key={`${name}-${affiliation}`}>
                <a href={authorProfileHref(name, locale)}>{name}</a>
                <span>{boardAffiliation(affiliation, locale)}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
