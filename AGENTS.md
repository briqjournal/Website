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

## Request classes

- **Micro:** exact copy, metadata, deadline, link, or one isolated selector. Touch only the target data/component and a focused regression assertion when useful. Direct `main` is acceptable during staging.
- **Routine batch:** the same rule across one issue, one page family, or a defined slug list. Prefer a deterministic script or data transformation over many manual edits. Commit as one unit.
- **Structural:** routes, shared article/issue rendering, global navigation, OAI-PMH, Worker/R2, build tooling, data migration, or broad responsive behavior. Use a branch/PR and full validation.

## File routing map

| Change | Start here |
|---|---|
| Article/issue metadata, dates, DOI, type, PDF paths | `app/archive-data.json` |
| Current-issue and Turkish full text | `app/article-fulltext-current.json` |
| Archived English full text | `app/article-fulltext-en-archive.json` |
| Saudi English supplement | `app/article-fulltext-saudi-en.json` |
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
- Treat `app/generated-fulltext/`, `app/generated-runtime/`, and `public/assets/data/article-search-index.json` as generated outputs.
- Do not manually deploy a source state that differs from the Git commit intended for production.
- Do not use uploaded editorial/organizational documents unless the requested site change actually depends on them.

## Validation

- Data-only edit: parse the changed JSON and run the focused test if one exists.
- Component/style/routing edit: `npm test` and `npm run lint`.
- Worker, build, OAI, or data-generation edit: `npm test`, `npm run lint`, and inspect the generated deploy configuration/artifact.
- Never claim success from source inspection alone; confirm CI or the relevant live/preview URL when available.

## Planned maintenance refactor

The runtime already generates per-article modules, but the canonical sources remain large monoliths. The next architecture task is to make per-article/per-issue files canonical and generate aggregate indexes from them. After that, split the Turkish and English catch-all pages by page family and move page-family styles out of `app/globals.css`. Do these as explicit migrations with compatibility tests, not during routine content fixes.

## User-facing handoff

Lead with the result. Keep the handoff compact: changed pages, validation status, commit or PR link/SHA, and any genuine unresolved risk.
