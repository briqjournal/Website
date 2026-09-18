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

The English and Turkish files do **not** need identical paragraph, note, figure, or reference counts.

## Rules

- English comes first in repository conventions: `en.json`, then `tr.json`.
- Never fall back from an English article page to Turkish full text.
- Preserve the published language and structure; rebuild corrupted text from the official locale PDF rather than copying a bad archive payload.
- Keep locale-specific references in the corresponding full-text file.
- Do not reintroduce legacy variants such as `current.json`, `en-archive.json`, `saudi-en.json`, or slug/issue-specific runtime exceptions after migration.
- Generated full-text/runtime aggregates are outputs, not canonical sources.

When a locale is genuinely unavailable, represent that absence explicitly instead of substituting the other language.
