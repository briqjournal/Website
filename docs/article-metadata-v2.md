# Article Metadata v2

BRIQ article records are being migrated to a single structured metadata contract while bilingual full text remains locale-specific.

## Canonical article layout

```text
content/articles/<slug>/
├── metadata.json
└── fulltext/
    ├── en.json
    └── tr.json
```

`metadata.json` is the canonical shared bibliographic record. `fulltext/en.json` and `fulltext/tr.json` contain locale-specific article bodies, notes, figures, and reference lists.

## Identity and schema version

- Every v2 record has `schemaVersion: 2`.
- `id` must exactly match the article directory slug.
- The directory slug remains the stable internal article identifier even when Turkish and English public route slugs differ.

## Article type

Article type and peer-review status are separate data points:

```json
{
  "articleType": {
    "id": "research-article",
    "tr": "Araştırma Makalesi",
    "en": "Research Article",
    "peerReviewed": true
  }
}
```

Do not create display types such as `Hakemli Araştırma Makalesi`. Peer review belongs in `peerReviewed`.

Recommended type identifiers include `research-article`, `review-article`, `book-review`, `editorial`, `commentary`, `interview`, and other explicitly documented BRIQ content types.

## Authors

Authors are stored individually. `displayName` preserves the published form and is required. `givenName` and `familyName` are separate indexing fields and must not be guessed when the source is ambiguous. ORCID is stored as its canonical `https://orcid.org/...` URI. Affiliations belong to the author they describe and may include country and ROR identifiers.

## Localized metadata

Shared bilingual fields use explicit `en` and `tr` keys. This applies to title, abstract, keywords, season labels, citations, and author declarations where translations exist.

Do not invent a translation merely to satisfy parity. Missing legacy information should be represented as `null` until it is verified from the published article, editorial records, or another authoritative source.

## Dates

Dates use ISO `YYYY-MM-DD` format:

- `received`
- `revised`
- `accepted`
- `published`

A missing revision must remain `null`; absence of a recorded revision is not evidence that no revision occurred.

## Declarations

The v2 contract supports:

- funding, including structured funders and award/project numbers
- conflict of interest
- author contributions and optional CRediT roles
- ethics approval and informed consent information
- data availability
- AI use
- acknowledgements

Unknown historical declarations should remain `null` rather than being backfilled with a generic statement.

## References

The localized reference lists remain canonical in `fulltext/en.json` and `fulltext/tr.json`. The optional `references` field in metadata is reserved for structured citation-export data when it is intentionally generated. Do not duplicate the raw locale-specific reference lists into `metadata.json` merely to satisfy the schema.

## Compatibility during migration

`scripts/article-metadata.mjs` converts a v2 record to the current `ArchiveArticle` runtime contract. Legacy metadata is passed through unchanged. `scripts/archive-store.mjs` uses this adapter when generating `app/archive-data.json`.

This compatibility boundary allows article-by-article migration without requiring a flag-day conversion of the full archive.

## Migration order

1. Volume 7 Issue 4 is the pilot issue because its bilingual full text already uses `fulltext/en.json` and `fulltext/tr.json`.
2. Validate generated archive data, rendered Turkish and English article pages, OAI-PMH, citations, author profiles, PDF links, sitemap/search outputs, and metadata regressions.
3. Migrate the remaining Volume 7 issues.
4. Continue volume by volume through the archive.
5. Remove the legacy adapter only after every canonical `metadata.json` record is v2 and no generated/runtime consumer depends on the flat legacy fields.

## Source-of-truth rule

Never edit generated aggregate/runtime files as the source of a metadata correction. Edit `content/articles/<slug>/metadata.json` (and, when relevant, the localized full-text files), then regenerate outputs.
