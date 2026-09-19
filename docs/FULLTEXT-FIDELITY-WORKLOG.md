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
- Reusable audit helper: `scripts/audit-fulltext-fidelity.py`.

**Next unit:** `v07-i01`.
