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
- Completed unit: `v06-i03`. All 11 records / 22 EN-TR locale records were checked against the official locale PDFs.
  - Algeria EN: restored the eight published photograph/caption entries using the already-verified shared production assets; the Turkish eight-photo inventory was preserved.
  - Bandung interview EN/TR: removed the front-matter author portrait from the body figure inventory and restored the published “The Strategy Turkey Needs” / “Türkiye’nin İhtiyacı Olan Strateji” section boundary. TR-only archive leakage (“Tam metin” and two English paragraphs) was removed.
  - Bandung Spirit EN: repaired two-column extraction corruption around “China’s Contributions” and “Indonesia’s Contributions”, rejoining the split Zhou Enlai paragraph, removing the duplicated pull-quote text, and restoring the published section order. Indonesian foreign-policy EN: restored the post-Suharto material to “The Transformation of Indonesian Diplomacy and its Contribution to Fostering the Bandung Spirit”.
  - Sahte Şiir and 39 Harbi EN/TR: restored the published line structure, separated translator/source notes from verse, removed front-matter portraits from body figures, and preserved legitimate locale-specific note/reference differences.
  - Gas Hydrates EN/TR: verified the table assets against embedded PDF images and repaired the Table 2 / Table 3 caption mapping for the split production assets.
  - Post-repair issue-wide regression and reusable PDF audit found no duplicate canonical paragraphs, duplicate footnote IDs, metadata leakage, cross-record title contamination, low-match repaired figure captions, or missing figure assets; remaining low-match/non-monotonic signals were confirmed as two-column layout, pull-quote, hyphenation, or extraction noise.
- Completed unit: `v06-i02`. All 13 records / 26 EN-TR locale records were checked against the official locale publication evidence.
  - Hikaye / Tale and Ölü Su / Dead Water EN/TR: removed author-biography front matter from canonical poem bodies, preserved the published stanza/line structure, removed front-matter author portraits from body figures, and kept translator/source material in note/reference data.
  - Alter-globalization EN/TR: restored the complete published Figure 2 caption and Eurostat source, repaired the corrupted Gürcan-Gedik bibliography entry, and visually verified that the apparent second page-12 photo label was embedded image text rather than a missing canonical figure.
  - Sun Yat-sen political-legacy EN/TR, Chinese-revolutionaries EN/TR, and emerging-middle-powers TR: repaired confirmed PDF-extraction corruption in bibliography entries, including split Turkish characters, broken URLs, omitted BRIQ journal/volume details, and the published Edström spelling. Legitimate locale-specific bibliography differences, including the 2019a/2019b entry, were preserved.
  - Osaka interview EN and Qi Baishi EN were not rewritten from Turkish: their metadata-designated English PDF source points to the Turkish/shared PDF, so the English canonical records were preserved rather than using a Turkish fallback.
  - Post-repair focused regression and the reusable issue-wide PDF audit found no duplicate canonical paragraphs, duplicate footnote IDs, metadata leakage, cross-record title contamination, missing figure assets, or unresolved repaired-caption defects. Remaining low-match/non-monotonic signals were attributable to documented wrong-locale source links, two-column layout, hyphenation, or visually verified embedded-image/extraction noise.
- Reusable audit helper: `scripts/audit-fulltext-fidelity.py`.

**Next unit:** `v06-i01`.
