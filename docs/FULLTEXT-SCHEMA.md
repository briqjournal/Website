# Full Text

## Canonical layout

```text
content/articles/<slug>/
├── metadata.json
└── fulltext/
    ├── en.json
    └── tr.json
```

`metadata.json` is shared bibliographic data. `fulltext/en.json` and `fulltext/tr.json` are locale-specific article bodies.

## Current full-text shape

Locale files use the same general structure:

- `sections[]` with `id`, `title`, and `paragraphs[]`
- `keywords[]`
- `footnotes[]`
- `references[]`
- `acknowledgements`
- `figures[]`
- optional `tables[]` for semantic tables embedded in the article body

The English and Turkish files do **not** need identical paragraph, note, figure, table, or reference counts.

### Semantic tables

When a published table can be reconstructed faithfully as structured data, store it in optional `tables[]` instead of duplicating it as a raster figure.

Each table uses:

- `id`
- `caption`
- `headers[]`
- `rows[][]`
- optional `note`
- `placement.sectionId`
- `placement.afterParagraph`, a **1-based** paragraph number; use `0` to place the table before the first paragraph in that section

Semantic tables are rendered as accessible HTML `<table>` elements inside the full text. Do not keep the same table in `figures[]` once the semantic version is canonical. Use `figures[]` for genuinely visual material, or for tables whose structure cannot be reconstructed reliably from authoritative evidence.

## Rules

- English comes first in repository conventions: `en.json`, then `tr.json`.
- Never fall back from an English article page to Turkish full text.
- Preserve the published language and structure; rebuild corrupted text from the official locale PDF rather than copying a bad archive payload.
- Keep locale-specific references in the corresponding full-text file.
- Do not reintroduce legacy variants such as `current.json`, `en-archive.json`, `saudi-en.json`, or slug/issue-specific runtime exceptions after migration.
- Generated full-text/runtime aggregates are outputs, not canonical sources.

When a locale is genuinely unavailable, represent that absence explicitly instead of substituting the other language.
