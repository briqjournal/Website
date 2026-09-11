import { Fragment, type ReactNode } from "react";

type TextRange = { start: number; end: number };
type LinkRange = TextRange & { href: string };

const DOI_PATTERN = /10\.\d{4,9}\/[-._;()/:A-Z0-9]+/gi;
const LINK_PATTERN = /https?:\/\/[^\s<>\[\]{}]+|10\.\d{4,9}\/[-._;()/:A-Z0-9]+/gi;

function canonicalDoi(value: string) {
  return value
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, "")
    .replace(/^doi\s*:\s*/i, "")
    .trim()
    .replace(/[.,;:]$/, "");
}

function compactUrlHosts(value: string) {
  return value.replace(
    /https?:\/\/(?:[a-z0-9-]+\s*\.\s*)+[a-z]{2,63}/gi,
    (match) => match.replace(/\s+/g, ""),
  );
}

export function normalizeReferenceText(value: string) {
  let text = value
    .replace(/\u00a0/g, " ")
    .replace(/[\t\r\n]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  text = text.replace(/\b(https?)\s*:\s*\/\s*\//gi, (_match, protocol: string) => `${protocol.toLowerCase()}://`);
  text = compactUrlHosts(text);
  text = text
    .replace(/https?:\/\/(?:dx\.)?doi\.org\s*\/\s*/gi, "https://doi.org/")
    .replace(/\bdoi\s*:\s*10\s*\.\s*(\d{4,9})\s*\/\s*/gi, "https://doi.org/10.$1/")
    .replace(/\b10\s*\.\s*(\d{4,9})\s*\/\s*/gi, "10.$1/");

  // Repair spaces introduced by PDF line wrapping around URL punctuation and
  // within DOI suffixes. The DOI rules are deliberately constrained to strong
  // continuation signals so normal prose after a DOI is never concatenated.
  for (let pass = 0; pass < 4; pass += 1) {
    text = text
      .replace(/(https?:\/\/[^\s<>\[\]{}]+)\s+([/?#&=:%])\s*/gi, "$1$2")
      .replace(/(10\.\d{4,9}\/[^\s<>"']*[-/_:;])\s+(?=[A-Z0-9])/gi, "$1")
      .replace(/(10\.\d{4,9}\/[^\s<>"']*\.)\s+(?=(?:\d|cnki\b|issn\b))/gi, "$1");
  }

  // APA 7 uses the DOI resolver form rather than a bare "doi:" label.
  text = text.replace(/\bdoi\s*:\s*(10\.\d{4,9}\/[-._;()/:A-Z0-9]+)/gi, "https://doi.org/$1");

  // Common extraction artefacts around punctuation and journal issue numbers.
  text = text
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/,\s*(\d{1,3})\s+\(([^)]+)\)(?=\s*[,.:])/g, ", $1($2)")
    .replace(/(https?:\/\/[^\s<>]+)[.,;:]$/i, "$1");

  return text;
}

export function referenceDoi(value: string) {
  const text = normalizeReferenceText(value);
  const match = text.match(DOI_PATTERN)?.[0];
  return match ? canonicalDoi(match) : undefined;
}

function pushRange(ranges: TextRange[], start: number, end: number) {
  if (start >= 0 && end > start) ranges.push({ start, end });
}

function apaItalicRanges(text: string) {
  const ranges: TextRange[] = [];
  const date = /\((?:19|20)\d{2}[a-z]?(?:,\s*[^)]*)?\)\.\s*/i.exec(text);
  if (!date || date.index == null) return ranges;

  const workStart = date.index + date[0].length;
  const work = text.slice(workStart);

  // Journal article: journal title and volume are italicized; issue is not.
  const volumePattern = /,\s*(\d{1,3})(?:\s*\([^)]+\))?\s*,/g;
  let volumeMatch: RegExpExecArray | null;
  while ((volumeMatch = volumePattern.exec(work))) {
    if (volumeMatch.index == null) continue;
    const beforeVolume = work.slice(0, volumeMatch.index);
    const titleBoundary = beforeVolume.lastIndexOf(". ");
    if (titleBoundary < 0) continue;
    const containerStart = workStart + titleBoundary + 2;
    const containerEnd = workStart + volumeMatch.index;
    const container = text.slice(containerStart, containerEnd).trim();
    if (!container || container.length > 180 || /^https?:\/\//i.test(container)) continue;

    const leading = text.slice(containerStart, containerEnd).search(/\S/);
    const trailing = text.slice(containerStart, containerEnd).match(/\s*$/)?.[0].length || 0;
    pushRange(ranges, containerStart + Math.max(0, leading), containerEnd - trailing);

    const volumeOffset = volumeMatch[0].indexOf(volumeMatch[1]);
    const volumeStart = workStart + volumeMatch.index + volumeOffset;
    pushRange(ranges, volumeStart, volumeStart + volumeMatch[1].length);
    return ranges;
  }

  // Chapter in an edited book: the containing book title is italicized.
  const chapter = /\bIn\s+.+?\((?:Ed|Eds)\.?\),\s*/i.exec(work);
  if (chapter?.index != null) {
    const start = workStart + chapter.index + chapter[0].length;
    const tail = text.slice(start);
    const endMarker = /\s*(?:\((?:pp?|Vol\.?|Chapter)\b|\.\s+(?=[A-ZÇĞİÖŞÜ]))/i.exec(tail);
    const end = endMarker?.index != null ? start + endMarker.index : start + tail.length;
    pushRange(ranges, start, end);
    return ranges;
  }

  // Books, reports, theses/dissertations and webpages: italicize the standalone
  // work title. Bracketed descriptive information remains roman in APA 7.
  const firstSentenceEnd = work.search(/\.\s+(?=[A-ZÇĞİÖŞÜ0-9\[])/u);
  let end = firstSentenceEnd >= 0 ? workStart + firstSentenceEnd : text.length;
  const bracket = text.indexOf(" [", workStart);
  if (bracket >= workStart && bracket < end) end = bracket;
  const url = text.search(/https?:\/\//i);
  if (url >= workStart && url < end) end = url;
  pushRange(ranges, workStart, end);
  return ranges;
}

function linkRanges(text: string) {
  const ranges: LinkRange[] = [];
  for (const match of text.matchAll(LINK_PATTERN)) {
    if (match.index == null) continue;
    const raw = match[0];
    const trailing = raw.match(/[.,;:]+$/)?.[0] || "";
    const target = trailing ? raw.slice(0, -trailing.length) : raw;
    if (!target) continue;
    const href = /^https?:\/\//i.test(target) ? target : `https://doi.org/${canonicalDoi(target)}`;
    ranges.push({ start: match.index, end: match.index + target.length, href });
  }
  return ranges;
}

function contains(index: number, range: TextRange) {
  return index >= range.start && index < range.end;
}

function renderReference(text: string, briqHref?: string) {
  const italics = apaItalicRanges(text);
  const links = linkRanges(text);
  const points = new Set<number>([0, text.length]);
  italics.forEach(({ start, end }) => { points.add(start); points.add(end); });
  links.forEach(({ start, end }) => { points.add(start); points.add(end); });
  const sorted = [...points].filter((point) => point >= 0 && point <= text.length).sort((a, b) => a - b);
  const output: ReactNode[] = [];

  for (let index = 0; index < sorted.length - 1; index += 1) {
    const start = sorted[index];
    const end = sorted[index + 1];
    if (end <= start) continue;
    const segment = text.slice(start, end);
    const italic = italics.some((range) => contains(start, range));
    const link = links.find((range) => contains(start, range));
    let node: ReactNode = italic ? <em>{segment}</em> : segment;

    if (link) {
      node = <a className="reference-inline-link" href={link.href} target="_blank" rel="noreferrer">{node}</a>;
    } else if (briqHref) {
      node = <a className="reference-inline-link reference-briq-link" href={briqHref}>{node}</a>;
    }
    output.push(<Fragment key={`${start}-${end}`}>{node}</Fragment>);
  }
  return output;
}

export function ReferenceText({ text, doi, briqHref }: { text: string; doi?: string; briqHref?: string }) {
  const normalized = normalizeReferenceText(text);
  const detectedDoi = referenceDoi(normalized);
  const canonical = doi ? canonicalDoi(doi) : detectedDoi;
  const output = renderReference(normalized, briqHref);

  if (canonical && !detectedDoi) {
    const href = `https://doi.org/${canonical}`;
    output.push(<Fragment key="appended-doi"> · <a className="reference-inline-link" href={href} target="_blank" rel="noreferrer">{href}</a></Fragment>);
  }
  return <>{output}</>;
}
