import type { ReactNode } from "react";
import { ScrollSpyNav, type ScrollSpyItem } from "./ScrollSpyNav";

export type EditorialSubsection = {
  id: string;
  title: string;
  content: ReactNode;
};

export type EditorialSection = {
  id: string;
  title: string;
  content?: ReactNode;
  subsections?: EditorialSubsection[];
};

export function EditorialLongform({
  navigationTitle,
  sections,
  before,
  className = "",
}: {
  navigationTitle: string;
  sections: EditorialSection[];
  before?: ReactNode;
  className?: string;
}) {
  const navigation = sections.flatMap<ScrollSpyItem>((section) => [
    { id: section.id, label: section.title, level: 2 },
    ...(section.subsections || []).map((subsection) => ({
      id: subsection.id,
      label: subsection.title,
      level: 3 as const,
      parentId: section.id,
    })),
  ]);

  return (
    <div className={`site-shell editorial-page ${className}`.trim()}>
      {before && <div className="editorial-page-module">{before}</div>}
      <div className="reading-layout publication-principles-layout editorial-longform-layout">
        <ScrollSpyNav title={navigationTitle} items={navigation} />
        <article className="reading-content publication-principles editorial-longform">
          {sections.map((section) => (
            <section className="principle-section" id={section.id} key={section.id}>
              <h2>{section.title}</h2>
              {section.content && <div className="editorial-section-content">{section.content}</div>}
              {section.subsections?.map((subsection) => (
                <div className="principle-subsection" id={subsection.id} key={subsection.id}>
                  <h3>{subsection.title}</h3>
                  {subsection.content}
                </div>
              ))}
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}
