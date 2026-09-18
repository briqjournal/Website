# Metadata

## Canonical source

Per-article bibliographic metadata lives at:

`content/articles/<slug>/metadata.json`

For v2 records, the machine-readable authority is:

`content/schemas/article-metadata-v2.schema.json`

Detailed migration notes remain in:

`docs/article-metadata-v2.md`

Do not duplicate raw locale-specific full-text reference lists into metadata merely for parity.

## Core rules

- New structured records use `schemaVersion: 2`.
- `id` must match the article directory slug.
- Article type and peer-review status are separate fields.
- Bilingual semantic fields use explicit `en` / `tr` values.
- Dates use ISO `YYYY-MM-DD`; unknown dates remain `null`.
- Never manufacture missing translations, author-name parts, ORCIDs, affiliations, dates, declarations, or bibliographic facts.
- Correct canonical metadata, then regenerate derived outputs. Do not edit generated aggregates as the source fix.

## Book reviews

For v2 book reviews:

```json
"reviewedBook": {
  "authorsApa": "...",
  "year": 2024,
  "title": "...",
  "publisher": "...",
  "isbn": null
}
```

Verify these fields from the official BRIQ PDF/citation or another authoritative publication source.

Legacy records may use `reviewed_book` where required by the current renderer. Do not convert a legacy record to v2 merely to make a small bibliographic correction unless the task explicitly includes migration.

## Declarations

Structured v2 metadata supports funding, conflict of interest, author contributions/CRediT, ethics approval, data availability, AI use, and acknowledgements. Unknown historical declarations remain `null`.
