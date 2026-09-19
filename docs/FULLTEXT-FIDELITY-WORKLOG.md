# Full-Text Fidelity Worklog

## Issue-by-issue fidelity audit

**Status:** in progress

- Completed unit: `v07-i04`. All 6 records / 12 EN-TR locale records were checked against the official locale PDFs.
  - Confirmed repairs were limited to the two defective English records: Saudi Arabia and Türkiye-China.
  - The other ten locale records were preserved after the issue-wide audit found no confirmed cross-record contamination, duplicate canonical paragraphs, English/Turkish contamination, paragraph-order reversal, or missing referenced figure assets.
- Completed unit: `v07-i03`. All 8 records / 16 EN-TR locale records were checked against the official locale PDFs.
  - Switzerland EN: removed abstract/keyword leakage from the Introduction and restored the published body continuity.
  - China ICH EN: restored missing footnote 1 and rejoined the split footnote 2 with unique note IDs.
  - Mongolia EN: removed a figure caption misclassified as a section and restored those paragraphs to the published section hierarchy.
  - Restored published figure/caption wording across the issue where canonical captions were truncated or generic; verified the corresponding figure assets against the PDFs.
  - Post-repair whole-issue audit found no duplicate canonical paragraphs, duplicate footnote IDs, metadata leakage, cross-record title contamination, English/Turkish contamination, low-match repaired figure captions, or missing figure assets.
- Completed unit: `v07-i02`. The complete 11-record issue was audited against the available official locale publication evidence.
  - Rügemer EN/TR: restored the published section heading “No Bombing of German and US Arms Factories!” / “Alman ve ABD Silah Fabrikalarının Bombalanmaması!”.
  - Africa EN/TR: repaired the confirmed bibliography/reference defects.
  - Restored the published figure/caption inventories for the six prose records and committed the verified corresponding figure assets, preserving legitimate EN/TR differences.
  - Post-repair whole-issue regression found no duplicate canonical paragraphs, duplicate footnote IDs, metadata leakage, cross-record title contamination, English/Turkish contamination, low-match repaired figure captions, or missing figure assets.
- Completed unit: `v07-i01`. All 5 records / 10 EN-TR locale records were checked against the official locale PDFs.
  - Yang Chen EN/TR: restored the published heading hierarchy and paragraph continuity, including the five-phase China-U.S. relations section.
  - Repaired confirmed bibliography/reference corruption, including PDF line-wrap damage in URLs/DOIs and the fragmented Gao bibliography entry; preserved the legitimate Zhang-Liu EN/TR bibliography difference and the TR-only Zhou reference.
  - Restored the published figure/caption inventories for all five records and committed the verified locale-specific production figure assets.
  - Post-repair issue-wide regression found no duplicate canonical paragraphs, duplicate footnote IDs, cross-record paragraph contamination, or missing/undersized referenced figure assets.
- Completed unit: `v06-i04`. All 8 records / 16 EN-TR locale records were checked against the official locale PDFs.
  - Restored the published locale-specific figure/caption inventories and verified production assets for the five illustrated prose records: Russia/CSTO (9 figures per locale), BRICS Counter-Terrorism Strategy (2), World Economic Forum critique (9), Young China (8), and WAPE forum report (4). The SCO declaration and both poem records correctly remain without figures.
  - Hallaç EN/TR: preserved the published six-stanza line structure and moved the translator credit out of the poem body into note data.
  - Ninety-Seventh Sonnet EN: preserved the published four-stanza line structure and moved the translator credit out of the poem body into note data; the Turkish four-stanza body and source reference were preserved.
  - Prose body/order/reference/footnote signals were checked against the PDFs; apparent remaining low-match and non-monotonic cases were attributable to two-column layout, pull-quote repetition, hyphenation, or Cyrillic extraction rather than confirmed canonical defects, so correct content was preserved.
  - Post-repair whole-issue audit found no duplicate canonical paragraphs, duplicate footnote IDs, cross-record title contamination, English/Turkish contamination, low-match repaired figure captions, or missing figure assets.
- Reusable audit helper: `scripts/audit-fulltext-fidelity.py`.

**Next unit:** `v06-i03`.
