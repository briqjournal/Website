# Active Work

Keep this file short. It is a recovery checkpoint for unfinished work, not a project history. Remove completed items instead of accumulating an archive.

## Volume 2 editorial dates

**Status:** incomplete

- Continue evidence-backed `received`, `revised`, and `accepted` date completion for Volume 2 canonical metadata.
- Research articles require an explicit revision-history check; book reviews require received/accepted verification from the editorial correspondence where the PDF is insufficient.
- Use official PDFs plus verified project email/Drive/Yandex evidence. Leave unresolved dates `null`; never infer them.
- Do not redo the Volume 3 or Volume 4 verified-spreadsheet updates already present in the repository.

## Metadata v2 migration

**Status:** in progress

- Next unit: `v03-i01`. All 14 current records in that issue are still legacy (no `schemaVersion: 2`).
- After `v03-i01`, continue issue-by-issue through Volume 2 and Volume 1.
- Preserve verified bibliographic/editorial data while migrating; do not manufacture missing fields.

## Canonical full-text migration

**Status:** in progress

- Repository checkpoint: 49 canonical `fulltext/en.json` + `fulltext/tr.json` pairs remain alongside 191 legacy `en-archive.json` files; `current.json` and `saudi-en.json` are absent.
- Next unit: `v06-i02` — 13/13 records still use `en-archive.json`, with 0 canonical EN/TR pairs.
- Then continue with `v06-i01` and earlier issues. `v06-i01` currently has 0 canonical pairs; 14/15 records have `en-archive.json` and one visual record has no legacy full-text file.
- Rebuild corrupted English from the official English PDF; never substitute Turkish full text on English pages. Retire legacy files only after the canonical locale files are validated.
