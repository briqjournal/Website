#!/usr/bin/env python3
from pathlib import Path

root = Path(__file__).resolve().parents[1]
article_path = root / "app/components/ArticlePlatform.tsx"
css_path = root / "app/globals.css"

article = article_path.read_text(encoding="utf-8")
import_old = 'import { ReferenceBackLink } from "./ReferenceBackLink";\n'
import_new = import_old + 'import { ReferenceText, referenceDoi } from "./ReferenceText";\n'
if import_new not in article:
    if import_old not in article:
        raise SystemExit("ReferenceBackLink import anchor not found")
    article = article.replace(import_old, import_new, 1)

start_marker = "\nfunction referenceDoi(text: string) {"
end_marker = "\nfunction normalizedReference(value: string) {"
if start_marker in article:
    start = article.index(start_marker)
    end = article.index(end_marker, start)
    article = article[:start] + article[end:]

render_old = '<p>{referenceInlineContent(reference.text, doi, briqHref)}</p>'
render_new = '<p><ReferenceText text={reference.text} doi={doi} briqHref={briqHref} /></p>'
if render_old in article:
    article = article.replace(render_old, render_new, 1)
elif render_new not in article:
    raise SystemExit("Reference rendering anchor not found")

article_path.write_text(article, encoding="utf-8")

css = css_path.read_text(encoding="utf-8")
css_old = '''.article-references li a.reference-inline-link {
  white-space: normal;
  color: var(--rust-dark);
  font-size: inherit;
  font-weight: 700;
  text-decoration: underline;
'''
css_new = '''.article-references li a.reference-inline-link {
  white-space: normal;
  color: var(--rust-dark);
  font-size: inherit;
  font-weight: inherit;
  text-decoration: underline;
'''
if css_old in css:
    css = css.replace(css_old, css_new, 1)
elif css_new not in css:
    raise SystemExit("Reference link CSS anchor not found")

css_path.write_text(css, encoding="utf-8")
print("Applied APA reference renderer and neutral link typography.")
