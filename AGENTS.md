# BRIQ Website

Use this file as the repository-level operating guide. Read only the task-relevant docs below; do not begin with a recursive repository review.

## Source of truth

- Previous Project chats provide context; current repository files determine implementation state.
- Modify canonical sources, not generated aggregates or runtime output.
- Preserve correct existing data. Never invent bibliographic, editorial, translation, or date information.
- Do not solve content/data problems with article-specific runtime hacks.

## Task docs

Read only what the current task needs:

- Metadata → `docs/METADATA-SCHEMA.md`
- Full text → `docs/FULLTEXT-SCHEMA.md`
- Editorial/content conventions → `docs/EDITORIAL-RULES.md`
- Unfinished work / recovery → `docs/WORKLOG.md`

## Execution

- Resume interrupted work from repository state, not from an assistant progress message.
- For large tasks, work in durable batches: write and validate completed changes before continuing.
- Do not redo records already completed correctly.
- Use official BRIQ PDFs and verified project sources when canonical data needs external evidence.
- Keep diffs narrow and avoid unrelated cleanup.

## Validation

Run the smallest relevant validation for the changed source, then broader tests only when the change affects shared rendering, routing, build, Worker, or generated outputs. Do not claim completion from source inspection alone.

During staging, narrow data/docs fixes may go directly to `main`; structural changes should use a branch/PR.
