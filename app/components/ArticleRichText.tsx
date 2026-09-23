"use client";

import { Fragment, type MouseEvent, type ReactNode } from "react";
import { ReferenceText } from "./ReferenceText";

export type FullTextSection = {
  id: string;
  title: string;
  paragraphs: string[];
  level?: "section" | "subsection";
  toc?: boolean;
};

export type FullTextTable = {
  id: string;
  caption: string;
  headers: string[];
  rows: string[][];
  note?: string;
  imageSrc?: string;
  placement: {
    sectionId: string;
    afterParagraph: number;
  };
};

export type FullTextNote = { id: string; text: string };
export type FullTextReference = { id: string; text: string };

const openingAcronyms = new Set(["ABD", "AB", "BM", "BRI", "KYG", "YKYG", "ÇKP", "CPC", "ASEAN", "NATO", "DTÖ", "WTO", "IMF", "AIIB", "AAYB", "BRICS", "ŞİÖ", "SCO", "G7", "G20", "GDO", "GMO", "CBAM", "SKDM", "EU", "UN", "U.S.", "US"]);

function sentenceCasePdfOpening(value: string, locale: "tr" | "en") {
  const language = locale === "tr" ? "tr-TR" : "en-US";
  const parts = value.split(/(\s+)/);
  let firstWord = true;
  for (let index = 0; index < parts.length; index += 1) {
    if (/^\s+$/.test(parts[index])) continue;
    const token = parts[index].replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}.’']+$/gu, "");
    if (!token || !/\p{L}/u.test(token)) continue;
    if (/\p{Ll}/u.test(token)) break;
    const possessive = token.match(/^([\p{L}.]+)([’'][\p{L}]+)$/u);
    const base = possessive ? possessive[1] : token;
    let normalized = openingAcronyms.has(base) || /^[IVXLCDM]+$/u.test(base)
      ? base
      : base.toLocaleLowerCase(language);
    if (firstWord && !openingAcronyms.has(base) && !/^[IVXLCDM]+$/u.test(base)) {
      normalized = normalized.replace(/\p{L}/u, (letter) => letter.toLocaleUpperCase(language));
    }
    if (possessive) normalized += possessive[2].toLocaleLowerCase(language);
    parts[index] = parts[index].replace(token, normalized);
    firstWord = false;
  }
  return parts.join("")
    .replace(/^Kuşak ve yol girişimi/u, "Kuşak ve Yol Girişimi")
    .replace(/^The belt and road initiative/u, "The Belt and Road Initiative")
    .replace(/^Çin komünist partisi/u, "Çin Komünist Partisi")
    .replace(/^The rapid rise of china/u, "The rapid rise of China")
    .replace(/^Mao zedong/u, "Mao Zedong")
    .replace(/^Suudi arabistan/u, "Suudi Arabistan")
    .replace(/^On december/u, "On December")
    .replace(/^The shanghai five, comprising china/u, "The Shanghai Five, comprising China");
}

const dateTokenPattern = /(?:19|20)\d{2}[a-z]?|t\.\s*y\.|n\.\s*d\./giu;
const citationStopWords = new Set([
  "al", "and", "aktaran", "bakiniz", "bkz", "cited", "ed", "eds", "et", "in", "p", "pp", "s", "ss", "trans", "ve", "vd",
]);

function normalizedWords(value: string) {
  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("en-US")
    .replace(/[’'‐‑–—-]/g, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 1 && !citationStopWords.has(word));
}

function dateTokens(value: string) {
  return [...value.matchAll(dateTokenPattern)].map((match) => {
    const token = match[0].toLocaleLowerCase("en-US").replace(/\s+/g, "");
    return token.startsWith("t.") || token.startsWith("n.") ? "nd" : token;
  });
}

function referenceAuthorWords(reference: FullTextReference) {
  const dateIndex = reference.text.search(dateTokenPattern);
  const authorBlock = (dateIndex >= 0 ? reference.text.slice(0, dateIndex) : reference.text)
    .replace(/\([^)]*(?:ed|eds|editor|trans)[^)]*\)/giu, " ");
  return new Set(normalizedWords(authorBlock));
}

function citationAuthorWords(value: string, contextBefore: string) {
  const dateIndex = value.search(dateTokenPattern);
  let authorBlock = dateIndex >= 0 ? value.slice(0, dateIndex) : value;
  if (!/\p{L}/u.test(authorBlock)) {
    authorBlock = contextBefore.split(/[.!?;:\n]/).pop()?.trim() || "";
    authorBlock = authorBlock.split(/\s+/).slice(-9).join(" ");
  }
  return new Set(normalizedWords(authorBlock));
}

function linkedCitations(value: string, references: FullTextReference[], contextBefore: string) {
  const citedDates = [...new Set(dateTokens(value))];
  const citedAuthors = citationAuthorWords(value, contextBefore);
  if (!citedDates.length || !citedAuthors.size) return [];

  return citedDates.flatMap((date) => {
    const candidates = references
      .filter((reference) => dateTokens(reference.text).some((candidate) => candidate === date || candidate.replace(/[a-z]$/, "") === date.replace(/[a-z]$/, "")))
      .map((reference) => {
        const authors = referenceAuthorWords(reference);
        const shared = [...citedAuthors].filter((word) => authors.has(word));
        return { reference, score: shared.reduce((total, word) => total + Math.min(word.length, 12), 0) };
      })
      .filter((candidate) => candidate.score > 0)
      .sort((left, right) => right.score - left.score);
    return candidates[0] ? [{ date, reference: candidates[0].reference }] : [];
  });
}

function revealTarget(event: MouseEvent<HTMLAnchorElement>, id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  event.preventDefault();
  const disclosure = target.closest("details");
  if (disclosure) disclosure.open = true;
  document.querySelectorAll(".is-citation-target").forEach((item) => item.classList.remove("is-citation-target"));
  target.classList.add("is-citation-target");
  target.dataset.returnAnchor = event.currentTarget.id;
  requestAnimationFrame(() => {
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    window.history.replaceState(null, "", `#${id}`);
  });
}

function citationAnchor(reference: FullTextReference, label: string, key: string) {
  const anchorId = `citation-${reference.id}-${key.replace(/[^a-z0-9_-]+/gi, "-")}`;
  return (
    <a
      id={anchorId}
      className="inline-citation"
      data-return-target={reference.id}
      href={`#${reference.id}`}
      onClick={(event) => revealTarget(event, reference.id)}
      key={key}
    >
      {label}
      <span className="citation-tooltip" role="tooltip"><ReferenceText text={reference.text} omitLinks /></span>
    </a>
  );
}

function renderCitationGroup(group: string, references: FullTextReference[], contextBefore: string, keyBase: string) {
  const content = group.slice(1, -1);
  const parts = content.split(/(\s*;\s*)/);
  const rendered: ReactNode[] = ["("];
  parts.forEach((part, index) => {
    if (/^\s*;\s*$/.test(part)) {
      rendered.push(part);
      return;
    }
    const matches = linkedCitations(part, references, contextBefore);
    if (matches.length === 1) {
      rendered.push(citationAnchor(matches[0].reference, part, `${keyBase}-${index}-${matches[0].reference.id}`));
      return;
    }
    if (matches.length > 1) {
      const byDate = new Map(matches.map((match) => [match.date, match.reference]));
      let cursor = 0;
      for (const match of part.matchAll(dateTokenPattern)) {
        if (match.index! > cursor) rendered.push(part.slice(cursor, match.index));
        const token = dateTokens(match[0])[0];
        const reference = byDate.get(token);
        rendered.push(reference ? citationAnchor(reference, match[0], `${keyBase}-${index}-${match.index}-${reference.id}`) : match[0]);
        cursor = match.index! + match[0].length;
      }
      if (cursor < part.length) rendered.push(part.slice(cursor));
      return;
    }
    rendered.push(part);
  });
  rendered.push(")");
  return rendered;
}

function renderText(text: string, references: FullTextReference[], notes: FullTextNote[], anchorScope: string): ReactNode[] {
  const noteIds = new Set(notes.map((note) => note.id));
  const pattern = /(\([^()\n]*(?:(?:19|20)\d{2}|t\.y\.|n\.d\.)[^()\n]*\))|([\p{L}”’)])(\d{1,2})(?=[\s.,;:!?])/gu;
  const output: ReactNode[] = [];
  let cursor = 0;
  let match;
  while ((match = pattern.exec(text))) {
    if (match.index > cursor) output.push(text.slice(cursor, match.index));
    if (match[1]) {
      output.push(...renderCitationGroup(match[1], references, text.slice(Math.max(0, match.index - 120), match.index), `${anchorScope}-${match.index}`));
    } else {
      output.push(match[2]);
      output.push(noteIds.has(match[3]) ? (
        <a
          id={`citation-footnote-${match[3]}-${anchorScope}-${match.index}`}
          className="inline-footnote"
          data-tooltip={notes.find((note) => note.id === match[3])?.text}
          data-return-target={`footnote-${match[3]}`}
          href={`#footnote-${match[3]}`}
          onClick={(event) => revealTarget(event, `footnote-${match[3]}`)}
          key={`${match.index}-note-${match[3]}`}
        >
          {match[3]}
        </a>
      ) : match[3]);
    }
    cursor = pattern.lastIndex;
  }
  if (cursor < text.length) output.push(text.slice(cursor));
  return output;
}

function renderFormattedText(text: string, references: FullTextReference[], notes: FullTextNote[], anchorScope: string) {
  return text.split(/(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean).map((part, index) => {
    const strongEmphasis = part.startsWith("***") && part.endsWith("***");
    const strong = !strongEmphasis && part.startsWith("**") && part.endsWith("**");
    const emphasis = !strongEmphasis && !strong && part.startsWith("*") && part.endsWith("*");
    const content = strongEmphasis ? part.slice(3, -3) : (strong ? part.slice(2, -2) : (emphasis ? part.slice(1, -1) : part));
    const rendered = renderText(content, references, notes, `${anchorScope}-${index}`);
    return strongEmphasis
      ? <strong key={`${anchorScope}-strong-em-${index}`}><em>{rendered.map((item, itemIndex) => <Fragment key={itemIndex}>{item}</Fragment>)}</em></strong>
      : strong
      ? <strong key={`${anchorScope}-strong-${index}`}>{rendered.map((item, itemIndex) => <Fragment key={itemIndex}>{item}</Fragment>)}</strong>
      : emphasis
      ? <em key={`${anchorScope}-em-${index}`}>{rendered.map((item, itemIndex) => <Fragment key={itemIndex}>{item}</Fragment>)}</em>
      : <Fragment key={`${anchorScope}-text-${index}`}>{rendered.map((item, itemIndex) => <Fragment key={itemIndex}>{item}</Fragment>)}</Fragment>;
  });
}

function InlineArticleTable({
  table,
  references,
  notes,
}: {
  table: FullTextTable;
  references: FullTextReference[];
  notes: FullTextNote[];
}) {
  if (table.imageSrc) {
    return (
      <figure className="article-inline-table article-inline-table-image" id={table.id}>
        <img src={table.imageSrc} alt={table.caption} loading="lazy" decoding="async" />
      </figure>
    );
  }

  return (
    <figure className="article-inline-table" id={table.id}>
      <figcaption>{table.caption}</figcaption>
      <div className="article-inline-table-scroll">
        <table>
          <thead>
            <tr>
              {table.headers.map((header, index) => (
                <th scope="col" key={`${table.id}-header-${index}`}>
                  {renderFormattedText(header, references, notes, `${table.id}-header-${index}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIndex) => (
              <tr key={`${table.id}-row-${rowIndex}`}>
                {row.map((cell, cellIndex) => cellIndex === 0 ? (
                  <th scope="row" key={`${table.id}-cell-${rowIndex}-${cellIndex}`}>
                    {renderFormattedText(cell, references, notes, `${table.id}-cell-${rowIndex}-${cellIndex}`)}
                  </th>
                ) : (
                  <td key={`${table.id}-cell-${rowIndex}-${cellIndex}`}>
                    {renderFormattedText(cell, references, notes, `${table.id}-cell-${rowIndex}-${cellIndex}`)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {table.note ? <p className="article-inline-table-note">{table.note}</p> : null}
    </figure>
  );
}

export function ArticleRichText({
  sections,
  references,
  notes,
  tables = [],
  locale,
}: {
  sections: FullTextSection[];
  references: FullTextReference[];
  notes: FullTextNote[];
  tables?: FullTextTable[];
  locale: "tr" | "en";
}) {
  const genericSectionTitles = new Set(["tam metin", "full text"]);
  return (
    <section className="article-fulltext" id={locale === "tr" ? "tam-metin" : "full-text-body"}>
      <h2>{locale === "tr" ? "Tam Metin" : "Full Text"}</h2>
      <div className="article-fulltext-sections">
        {sections.map((section, sectionIndex) => (
          <section className={`article-body-section${section.level === "subsection" ? " article-body-subsection" : ""}`} id={section.id} key={section.id}>
            {!genericSectionTitles.has(section.title.trim().toLocaleLowerCase(locale === "tr" ? "tr-TR" : "en-US")) && (
              section.level === "subsection" ? <h4>{section.title}</h4> : <h3>{section.title}</h3>
            )}
            {tables
              .filter((table) => table.placement.sectionId === section.id && table.placement.afterParagraph === 0)
              .map((table) => <InlineArticleTable table={table} references={references} notes={notes} key={table.id} />)}
            {section.paragraphs.map((paragraph, index) => (
              <Fragment key={`${section.id}-${index}`}>
                <p>
                  {renderFormattedText(sectionIndex === 0 && index === 0 ? sentenceCasePdfOpening(paragraph, locale) : paragraph, references, notes, `${section.id}-${index}`)}
                </p>
                {tables
                  .filter((table) => table.placement.sectionId === section.id && table.placement.afterParagraph === index + 1)
                  .map((table) => <InlineArticleTable table={table} references={references} notes={notes} key={table.id} />)}
              </Fragment>
            ))}
          </section>
        ))}
      </div>
    </section>
  );
}
