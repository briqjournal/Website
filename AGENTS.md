# BRIQ Website Maintenance

This repository powers the bilingual BRIQ journal site on Cloudflare Workers. Optimize every maintenance task for a small context window, a narrow diff, and a reversible deployment.

## Current operating stage

- Repository: `briqjournal/Website`; default branch: `main`.
- Staging URL: `https://briq.briq.workers.dev/`.
- Until the final `briqjournal.com` cutover, narrow routine fixes may be committed directly to `main` after validation.
- Use a branch and pull request for structural work, deployment changes, migrations, or any edit spanning unrelated page families.
- After the production-domain cutover, default all non-trivial work to pull requests with preview verification.

## Minimal-context procedure

1. Read this file; do not begin with a recursive repository review.
2. Extract the locale, page family, and slug from the supplied URL.
3. Search for the exact slug, visible phrase, component name, or CSS selector.
4. Fetch only the matching source file, the relevant test excerpt, and direct imports needed to understand the change.
5. Reuse an existing component or selector before adding a parallel implementation.
6. Keep one user batch in one coherent commit. Do not mix opportunistic cleanup into a routine fix.
7. For shared interface copy or behavior, check both Turkish and English. Do not invent translations for article content.
8. Run the smallest relevant check locally; let CI run the full suite. Report the commit SHA and the URLs affected.

## Interrupted task recovery

If a task is interrupted or the user says “continue”, first inspect the current repository state and relevant files to determine what is already complete. Preserve completed work and continue from the first incomplete point. Do not restart the task from the beginning.

## Request classes

- **Micro:** exact copy, metadata, deadline, link, or one isolated selector. Touch only the target data/component and a focused regression assertion when useful. Direct `main` is acceptable during staging.
- **Routine batch:** the same rule across one issue, one page family, or a defined slug list. Prefer a deterministic script or data transformation over many manual edits. Commit as one unit.
- **Structural:** routes, shared article/issue rendering, global navigation, OAI-PMH, Worker/R2, build tooling, data migration, or broad responsive behavior. Use a branch/PR and full validation.

## Canonical article architecture

The target per-article layout is:

```text
content/articles/<slug>/
├── metadata.json
└── fulltext/
    ├── en.json
    └── tr.json
```

- `metadata.json` is the shared bibliographic source of truth. New structured records use Article Metadata v2 (`schemaVersion: 2`); see `docs/article-metadata-v2.md` and `content/schemas/article-metadata-v2.schema.json`.
- `fulltext/en.json` and `fulltext/tr.json` are the canonical locale-specific full texts. They use the same general full-text model but are not required to have identical paragraph, note, figure, or reference counts.
- Do not reintroduce `current.json`, `en-archive.json`, `saudi-en.json`, or other slug/issue-specific full-text variants for articles migrated to the canonical layout.
- Never fall back from an English article page to Turkish full text. If an official English full text is unavailable, represent that absence explicitly rather than substituting another language.
- Localized reference lists remain with their corresponding full-text file. `metadata.json` may contain intentionally structured reference-export data, but must not duplicate raw locale-specific reference lists merely for parity.
- During the gradual metadata migration, legacy flat metadata and v2 metadata may coexist. Do not downgrade an article already migrated to v2 back to flat fields.

## File routing map

| Change | Start here |
|---|---|
| Article metadata, dates, DOI, type, authors, declarations, PDF paths | `content/articles/<slug>/metadata.json` |
| Article Metadata v2 contract | `docs/article-metadata-v2.md`, `content/schemas/article-metadata-v2.schema.json` |
| English article full text | `content/articles/<slug>/fulltext/en.json` |
| Turkish article full text | `content/articles/<slug>/fulltext/tr.json` |
| Issue metadata and article ordering | `content/issues/vNN-iNN.json` |
| Article layout, declarations, citations, PDF page | `app/components/ArticlePlatform.tsx`, `ArticleRichText.tsx`, `PdfViewer.tsx` |
| Issue layout and issue editorial | `app/components/IssuePlatform.tsx`, `CurrentIssueEditorial.tsx`, `app/editorials.ts` |
| Calls for papers | `app/site-data.ts`, `app/call-content.ts`, call components |
| Boards, navigation, homepage records | `app/site-data.ts` and the relevant component |
| Turkish page family | `app/tr/[...slug]/page.tsx` |
| English page family | `app/en/[...slug]/page.tsx` |
| Shared styling | `app/globals.css`; search the existing selector first |
| OAI-PMH | `app/oai/route.ts`, `tests/oai-pmh.test.mjs` |
| Redirects, R2 PDFs, image handling | `worker/index.ts`, `vite.config.ts`, `ops/pdf-archive-manifest.json` |
| Rendered regressions | `tests/rendered-html.test.mjs` |

## Guardrails

- PDFs belong in Cloudflare R2, not Git. Preserve the `BRIQ_PDF -> briq-pdf` binding.
- Do not add D1 unless a documented feature and schema genuinely require it.
- Preserve canonical `/tr` and `/en` trees, locale routing, metadata, sitemap, and OAI-PMH alignment.
- Treat `app/archive-data.json`, `app/article-fulltext-*.json`, `app/generated-fulltext/`, `app/generated-runtime/`, and `public/assets/data/article-search-index.json` as generated outputs.
- Do not edit generated aggregates to fix article data. Correct the canonical per-article metadata/full-text source, then regenerate.
- Do not manually deploy a source state that differs from the Git commit intended for production.
- Do not use uploaded editorial/organizational documents unless the requested site change actually depends on them.

## Validation

- Data-only edit: parse the changed JSON and run the focused test if one exists.
- Metadata-v2 migration: verify the v2 adapter/build, rendered TR/EN article pages, OAI-PMH, citations, author data, PDF links, sitemap/search outputs, and relevant regression tests.
- Component/style/routing edit: `npm test` and `npm run lint`.
- Worker, build, OAI, or data-generation edit: `npm test`, `npm run lint`, and inspect the generated deploy configuration/artifact.
- Never claim success from source inspection alone; confirm CI or the relevant live/preview URL when available.

## Planned maintenance refactor

Per-article and per-issue JSON files under `content/` are canonical; aggregate JSON and runtime modules are generated. Continue migrating legacy article full text and flat metadata article-by-article into the canonical architecture instead of adding runtime slug, issue, or volume exceptions. A later, separate architecture task may split the Turkish and English catch-all pages by page family and move page-family styles out of `app/globals.css`. Do not combine that work with routine content fixes.

## User-facing handoff

Lead with the result. Keep the handoff compact: changed pages, validation status, commit or PR link/SHA, and any genuine unresolved risk.
