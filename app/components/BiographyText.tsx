import { Fragment, type ReactNode } from "react";

// Author biographies are plain editorial strings. The only inline markup they
// support is <em>...</em> for APA 7 italics (book and periodical titles).
// Everything else renders as literal text: React escapes it, so no raw HTML
// ever reaches the page.
const EMPHASIS_PATTERN = /<em>([\s\S]*?)<\/em>/g;

export function biographyNodes(value: string): ReactNode[] {
  const output: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  for (const match of value.matchAll(EMPHASIS_PATTERN)) {
    if (match.index == null) continue;
    if (match.index > lastIndex) {
      output.push(<Fragment key={key++}>{value.slice(lastIndex, match.index)}</Fragment>);
    }
    if (match[1]) {
      output.push(<em key={key++}>{match[1]}</em>);
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < value.length) {
    output.push(<Fragment key={key++}>{value.slice(lastIndex)}</Fragment>);
  }
  return output;
}

export function BiographyText({ text }: { text: string }) {
  return <>{biographyNodes(text)}</>;
}
