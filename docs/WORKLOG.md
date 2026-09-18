# Active Work

Keep this file short. It is a recovery checkpoint for unfinished work, not a project history. Remove completed items instead of accumulating an archive.

## Book review metadata

**Status:** in progress

**Goal:** ensure every identifiable BRIQ book review exposes validated reviewed-book metadata.

**Persisted baseline**
- v2 `reviewedBook` is supported by the metadata schema and runtime adapter.
- `content/articles/cin-abd-iliskilerinin-gelecegi/metadata.json` is a verified populated example.

**Remaining**
- Detect remaining book reviews, including legacy or historically mislabelled records.
- Verify the reviewed book from the official article PDF/citation or another authoritative BRIQ source.
- v2 records: populate `reviewedBook`.
- legacy records: populate the renderer-compatible `reviewed_book`.
- Leave genuinely unresolved fields unresolved; do not infer missing bibliographic facts.

**Recovery**
Inspect current metadata first and resume from the first incomplete record. Do not repeat repository-wide scans merely because a previous chat was interrupted.
