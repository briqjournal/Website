# Editorial Rules

This file contains stable content conventions only. Article-specific facts must come from the published article, official PDF, editorial records, or another authoritative BRIQ source.

## Fidelity

- Preserve meaning over stylistic smoothing in BRIQ translations.
- Do not soften, strengthen, modernize, or silently reinterpret an author's claim.
- Do not invent a translation only to force bilingual parity.

## Article identity

- Keep article type separate from peer-review status.
- Use structured metadata for bibliographic facts; do not encode presentation labels inside semantic fields.
- Book reviews must identify the reviewed book separately from the review article itself.

## Author biographies

- Author biographies are plain editorial strings; the only inline markup they support is `<em>...</em>`.
- Book titles in biographies use `<em>` per APA 7 italics. Role labels (`Ed.`), translator credits, and publisher/year parentheticals stay roman.
- The biography renderer outputs only `<em>` elements and escapes everything else, so no other HTML may be stored in these fields.

## Dates and declarations

- Record received, revised, accepted, and published dates only when supported by evidence.
- A missing revision date is `null`; it does not mean that no revision occurred.
- Funding belongs under funding, not acknowledgements, when it describes financial/project support.
- Funding declarations must remain evidence-backed; an absent funding statement must never be converted into a claim that no funding was received.
- For historical research articles with no recorded conflict-of-interest statement, the public article page uses the editorial wording “No conflict of interest was declared by the author(s).” / “Yazar(lar) tarafından herhangi bir çıkar çatışması beyan edilmemiştir.” This reports the absence of a recorded declaration; it is not a claim that no conflict existed.
- Author Contributions and Data Availability are currently not displayed on article pages. Preserve any supported canonical values for future use rather than inventing or deleting evidence.

## Sources and corrections

For factual verification, prefer the official BRIQ article/PDF and verified editorial records. Use the current repository to determine implementation state, not as automatic proof that an existing fact is correct. Use authoritative external sources only when the necessary information is not available from BRIQ sources.

Correct the canonical article source first. Regenerate derived site data afterwards.
