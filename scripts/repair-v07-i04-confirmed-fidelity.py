#!/usr/bin/env python3
"""Temporary, evidence-based repair helper for the confirmed v07-i04 English fidelity defects.

This script is intentionally scoped to the two confirmed defective English records. It reconstructs
body paragraphs from the official PDFs using stable two-column typography, fixes confirmed English
reference discrepancies, and restores the published figure inventory. It must not survive the PR.
"""
import json
import re
import sys
import tempfile
import urllib.request
from pathlib import Path

import fitz

ROOT = Path(__file__).resolve().parents[1]
SAUDI = "suudi-arabistanin-abd-ile-cin-arasinda-cok-boyutlu-kulturel-dengeleme-stratejisi"
TC = "turkiye-cin-diplomatik-iliskilerinin-55-yilinda-avrasyada-guc-gecisi-ve-jeoekonomik-baglantisallik"
BASES = (70.9, 289.5)
INDENTS = (82.2, 300.8)


def _norm(s):
    return re.sub(r"\s+", " ", s.replace("’", "'").replace("–", "-")).strip().lower()


def _lines(pdf):
    doc = fitz.open(pdf)
    out = []
    for page_no, page in enumerate(doc, 1):
        cols = [[], []]
        for block in page.get_text("dict")["blocks"]:
            if block.get("type") != 0:
                continue
            for line in block["lines"]:
                text = "".join(span["text"] for span in line["spans"]).strip()
                if not text:
                    continue
                x0, y0, x1, y1 = line["bbox"]
                cx = (x0 + x1) / 2
                col = 0 if cx < 285 else 1
                weights = [(span["size"], max(1, len(span["text"].strip()))) for span in line["spans"] if span["text"].strip()]
                size = sum(sz * wt for sz, wt in weights) / sum(wt for _, wt in weights)
                cols[col].append({"page": page_no, "col": col, "x0": x0, "y0": y0, "size": size, "text": text})
        for col in range(2):
            out.extend(sorted(cols[col], key=lambda z: (z["y0"], z["x0"])))
    return out


def _heading_spans(lines, headings):
    spans = []
    start = 0
    for heading in headings:
        target = _norm(heading)
        found = None
        for i in range(start, len(lines)):
            first = lines[i]
            combo = ""
            for j in range(i, min(i + 4, len(lines))):
                line = lines[j]
                if line["page"] != first["page"] or line["col"] != first["col"]:
                    break
                combo = (combo + " " + line["text"]).strip()
                value = _norm(combo)
                if value == target:
                    found = (i, j)
                    break
                if not target.startswith(value):
                    break
            if found:
                break
        if not found:
            raise RuntimeError(f"Heading not found in PDF: {heading}")
        spans.append(found)
        start = found[1] + 1
    return spans


def _join(parts):
    text = ""
    for part in parts:
        part = part.strip()
        if not text:
            text = part
        elif text.endswith("-") and part and part[0].islower():
            text = text[:-1] + part
        else:
            text += " " + part
    return re.sub(r"\s+", " ", text).strip()


def _extract_sections(pdf, headings):
    lines = _lines(pdf)
    spans = _heading_spans(lines, headings)
    sections = []
    for index in range(len(headings) - 1):
        lo = spans[index][1] + 1
        hi = spans[index + 1][0]
        paragraphs = []
        current = []
        for line in lines[lo:hi]:
            if not (80 < line["y0"] < 705 and 9.8 <= line["size"] <= 10.9):
                continue
            base = BASES[line["col"]]
            indent = INDENTS[line["col"]]
            if min(abs(line["x0"] - base), abs(line["x0"] - indent)) > 2.0:
                continue
            is_indent = abs(line["x0"] - indent) <= 2.0
            lower = line["text"].lower()
            if lower.startswith(("table ", "figure ", "photo:", "source:", "map:", "compiled by")):
                continue
            if current and is_indent:
                paragraphs.append(_join(current))
                current = []
            current.append(line["text"])
        if current:
            paragraphs.append(_join(current))
        sections.append(paragraphs)
    return sections


def _replace_all(sections, replacements):
    for paragraphs in sections:
        for i, paragraph in enumerate(paragraphs):
            for old, new in replacements.items():
                paragraph = paragraph.replace(old, new)
            paragraphs[i] = paragraph


def build_saudi_sections(pdf):
    extract_headings = [
        "Introduction",
        "Literature Review Hedging Theory and Middle Powers",
        "Soft Power, Cultural Diplomacy and Constructivist Identity",
        "Saudi Arabia’s Foreign Policy in the Literature",
        "Conceptualizing Cultural Hedging",
        "Methodology and Conceptual Framework",
        "Analysis and Findings",
        "Research Findings and Discussion",
        "Conclusion",
        "References",
    ]
    titles = [
        "Introduction",
        "Literature Review: Hedging Theory and Middle Powers",
        "Soft Power, Cultural Diplomacy and Constructivist Identity",
        "Saudi Arabia’s Foreign Policy in the Literature",
        "Conceptualizing Cultural Hedging",
        "Methodology and Conceptual Framework",
        "Analysis and Findings",
        "Research Findings and Discussion",
        "Conclusion",
    ]
    ids = [
        "introduction", "hedging-theory-and-middle-powers", "soft-power-cultural-diplomacy-and-constructivist-identity",
        "saudi-arabia-in-the-literature", "conceptualizing-cultural-hedging", "methodology-and-conceptual-framework",
        "analysis-and-findings", "research-findings-and-discussion", "conclusion",
    ]
    sections = _extract_sections(pdf, extract_headings)
    sections[0][0] = sections[0][0].replace("SAUDI ARABIA’S PLEDGE TO ACHIEVE", "Saudi Arabia’s pledge to achieve", 1)

    analysis = sections[6]
    analysis[2] = analysis[2].split(" soft-power tools in Saudi education, detailing")[0]
    analysis.insert(3, "Table 1 compares American and Chinese soft-power tools in Saudi education, detailing key programs, student numbers, and strategic goals for language learning and academic exchange as of 2025.")
    for i, paragraph in enumerate(analysis):
        if paragraph.startswith("Data from 2020–2025"):
            analysis[i] = paragraph.split(" fast-food chains (e.g.,")[0]
            analysis.insert(i + 1, "Figure 1 contrasts the presence of American fast-food chains (e.g., McDonald’s with 214 outlets) against Chinese restaurants (e.g., 64 in Riyadh), illustrating asymmetric growth in cultural food influences under Vision 2030.")
            break
    for i, paragraph in enumerate(analysis):
        if paragraph.startswith("The collaboration is centered on scientific cooperation"):
            analysis[i] = paragraph.split(" of Saudi cooperation with China")[0]
            analysis.insert(i + 1, "Table 7 highlights the distinct primary areas of Saudi cooperation with China (cultural heritage, soft power) and with the U.S. (advanced science and technology), including key institutional forms and strategic objectives.")
            break

    _replace_all(sections, {
        "massscale": "mass-scale", "PIFbacked": "PIF-backed", "coproduction": "co-production",
        "nonalignment": "non-alignment", "riskmanagement": "risk-management", "statealigned": "state-aligned",
        "peopletopeople": "people-to-people", "highvalue": "high-value", "resultsoriented": "results-oriented",
        "knowledgebased": "knowledge-based", "governmentaffiliated": "government-affiliated", "ArabIslamic": "Arab-Islamic",
        "longterm": "long-term", "middlepower": "middle-power", "zero sum": "zero-sum", "softpower": "soft-power",
        "winwin": "win-win", "Englishlanguage": "English-language", "fastfood": "fast-food",
    })
    counts = [5, 6, 5, 5, 3, 4, 29, 8, 1]
    got = [len(x) for x in sections]
    if got != counts:
        raise RuntimeError(f"Saudi paragraph counts changed: expected {counts}, got {got}")
    return [{"id": ids[i], "title": titles[i], "paragraphs": sections[i]} for i in range(9)]


def build_tc_sections(pdf):
    headings = [
        "Introduction",
        "Theoretical Framework and Position in the Literature",
        "Method, Data Sources, and Analytical Criteria",
        "Historical Trajectory of Relations",
        "Power Transition and Geoeconomic Connectivity: The Belt and Road Initiative and the Middle Corridor",
        "Structural Asymmetries and the Transition from a Transit Country to a Joint Production Hub",
        "Türkiye’s Strategic Balancing Role and Its Limits",
        "A New Peace Perspective and Sustainable Cooperation",
        "Conclusion",
        "References",
    ]
    sections = _extract_sections(pdf, headings)
    sections[0][0] = sections[0][0].replace("THE INTERNATIONAL SYSTEM IS UNDERGOING", "The international system is undergoing", 1)
    _replace_all(sections, {"TURK- STAT": "TURKSTAT", "longterm": "long-term"})
    counts = [5, 7, 6, 5, 7, 10, 5, 8, 4]
    got = [len(x) for x in sections]
    if got != counts:
        raise RuntimeError(f"Türkiye-China paragraph counts changed: expected {counts}, got {got}")
    return [{"id": f"en-section-{i+1}", "title": headings[i], "paragraphs": sections[i]} for i in range(9)]


def _asset(slug, n):
    return f"/assets/article-figures/{slug}/figure-{n:02d}.jpg"


def saudi_figures():
    captions = [
        "Saudi Arabia’s Vision 2030 agenda for economic and social transformation is reshaping the country’s traditionally US-aligned orientation, while providing the basis for its hedging strategy between China and the United States (Photo: Soul of Saudi, 2025).",
        "President Xi Jinping meets with Mohammed bin Salman Al Saud, Saudi Arabia's crown prince, at the Great Hall of the People in Beijing, capital of China, Feb 22, 2019 (Photo: Xinhua, 2019).",
        "Cultural diplomacy is one of the most important instruments of soft power (Image: Created by BRIQ, 2026).",
        "Academic cooperation between Saudi and American universities constitutes an important dimension of the cultural ties between the two countries. Saudi Minister of Education Yousef bin Abdullah Al-Benyan and U.S. Ambassador to Saudi Arabia Michael Ratney at the opening of the Saudi-US Higher Education Partnerships Forum, Riyadh, November 20, 2024 (Photo: Saudi Ministry of Education, 2024).",
        "Saudi Arabia and China are developing cultural exchange as a strategic dimension of their bilateral relations. Saudi Minister of Culture Prince Badr bin Abdullah bin Farhan Al Saud and Chinese Minister of Culture and Tourism Sun Yeli at the signing ceremony of the executive program for the Saudi-China Cultural Year 2025, Beijing, October 17, 2024 (Photo: Saudi Press Agency [SPA], 2024).",
        "Chinese language education constitute a growing dimension of linguistic and cultural exchange between Saudi Arabia and China. A Chinese language class for Saudi students at the Wisdom House Chinese Education Institute in Jeddah, October 20, 2024 (Photo: Su Yunhua/Nanfang+, 2024).",
        "Table 1: Indicators of Linguistic and Academic Engagement in Saudi Arabia: U.S. vs. China",
        "Table 2: US and Chinese Game Strategies in Saudi Arabia",
        "Table 3: Saudi Arabia’s dual approach to film and animation",
        "Figure 1: Comparative Scale of Food Diplomacy: U.S. QSR Chains vs. Chinese Restaurants in Saudi Arabia (2025)",
        "Table 4: Comparative Media Presence for China and the United States in Saudi Arabia",
        "Table 5: Saudi Government Media Narratives",
        "Figure 2: Comparison of estimated weekly operational flights between Saudi Arabia and both China and the United States",
        "Figure 3: A comparative line graph for Chinese and U.S. visitors between 2022 and 2025",
        "Table 6: Comparative Indicators of Saudi Arabia’s Educational and Cultural Exchanges: U.S. vs. China (2025)",
        "Table 7: Comparative Cultural and Scientific Collaborations (2020–2025)",
        "Table 8: Primary Data Sources and Methodological Notes",
        "Table 8: Primary Data Sources and Methodological Notes",
    ]
    return [{"id": f"figure-{i}", "src": _asset(SAUDI, i), "caption": caption} for i, caption in enumerate(captions, 1)]


def tc_figures():
    captions = [
        "The Middle Corridor connects China and Europe through Central Asia and Türkiye and integrates with the Belt and Road Initiative (BRI) (Map: Valdai Club, 2023).",
        "Turkish President Recep Tayyip Erdoğan met with Chinese President Xi Jinping on July 4, 2024, on the sidelines of the Shanghai Cooperation Organization summit held in Astana, Kazakhstan (Photo: CGTN, 2024).",
        "Table 1. Indicators Used to Distinguish a Transit Country from a Joint Production Hub",
        "Table 2. Indicator-Based Assessment of the Research Question",
        "Eurasian transport corridors: Türkiye’s connections with Europe, Central Asia, China, the Middle East, and Africa (Map: Prepared by BRIQ based on data from the Republic of Türkiye Ministry of Foreign Affairs and the Republic of Türkiye Ministry of Transport and Infrastructure on Türkiye’s connectivity and international transport corridors, 2026).",
        "In Türkiye-China relations, the combination of economic reciprocity, institutionalized connectivity, and sustained diplomatic dialogue may enable interdependence to become a mechanism for reducing the risk of conflict (Illustration: The Daily CPEC, 2025).",
    ]
    return [{"id": f"figure-{i}", "src": _asset(TC, i), "caption": caption} for i, caption in enumerate(captions, 1)]


def _download(url, dest):
    req = urllib.request.Request(url, headers={"User-Agent": "BRIQ-v07-i04-fidelity-repair/1.0"})
    with urllib.request.urlopen(req, timeout=120) as response, open(dest, "wb") as handle:
        handle.write(response.read())


def _load(slug, name):
    return json.loads((ROOT / "content" / "articles" / slug / name).read_text(encoding="utf-8"))


def _write(slug, data):
    path = ROOT / "content" / "articles" / slug / "fulltext" / "en.json"
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def _replace_refs(refs, replacements, remove_ids=()):
    out = []
    for ref in refs:
        if ref.get("id") in remove_ids:
            continue
        if ref.get("id") in replacements:
            ref = {**ref, "text": replacements[ref["id"]]}
        out.append(ref)
    return out


def repair_saudi(pdf):
    data = _load(SAUDI, "fulltext/en.json")
    data["sections"] = build_saudi_sections(pdf)
    data["references"] = _replace_refs(data.get("references", []), {
        "ref-39": "Saudi Gazette. (2025, June 29). Saudi Arabia and China sign executive program to strengthen cultural collaboration. https://saudigazette.com.sa/article/653060",
        "ref-40": "Saudi Press Agency. (2025, May 14). Saudi Space Agency signs agreement with NASA to launch Saudi satellite on Artemis II mission. https://www.spa.gov.sa/N2318158",
    })
    data["figures"] = saudi_figures()
    _write(SAUDI, data)


def repair_tc(pdf):
    data = _load(TC, "fulltext/en.json")
    data["sections"] = build_tc_sections(pdf)
    data["references"] = _replace_refs(data.get("references", []), {
        "ref-1": "Atlı, A. (2013). 12 Mart Muhtırası ve Türkiye’nin Çin Halk Cumhuriyeti’ni tanıması [The March 12 Memorandum and Türkiye’s recognition of the People’s Republic of China]. In S. Esenbel, İ. Togan & A. Atlı (Eds.), Türkiye’de Çin’i düşünmek: Ekonomik, siyasi ve kültürel ilişkilere yeni yaklaşımlar [Thinking about China in Türkiye: New approaches to economic, political, and cultural relations] (pp. 147-169). Boğaziçi University Press.",
        "ref-2": "Atlı, A. (2018, November 26). Making sense of Turkey’s rapprochement with China. German Marshall Fund of the United States. https://www.gmfus.org/news/making-sense-turkeys-rapprochement-china",
        "ref-6": "Dilek, Ş., Özdemir, B. Z., & İstikbal, D. (2019). Asya yüzyılında Türkiye-Çin ekonomik ilişkileri [Türkiye-China economic relations in the Asian century]. SETA Publications. https://media.setav.org/tr/dosya/2019/07/rapor-asya-yuzyilinda-turkiye-cin-ekonomik-iliskileri.pdf",
        "ref-12": "Investment Office of the Presidency of the Republic of Türkiye. (2024, July 9). BYD announces landmark USD 1 billion EV plant investment in Türkiye. https://www.invest.gov.tr/en/news/news-from-turkey/pages/byd-announces-landmark-usd-1-billion-ev-plant-investment-turkiye.aspx",
        "ref-17": "Ministry of Foreign Affairs of the People’s Republic of China. (2023, March 16). Xi Jinping attends the CPC in dialogue with world political parties’ high-level meeting and delivers a keynote speech. https://www.mfa.gov.cn/eng/wjb/zzjg_663340/xws_665282/xgxw_665284/202303/t20230317_11043656.html",
        "ref-21": "Republic of Türkiye Ministry of Foreign Affairs. (n.d.-a). Türkiye-Çin Halk Cumhuriyeti ekonomik ilişkileri [Türkiye-People’s Republic of China economic relations]. Retrieved July 27, 2026, from https://www.mfa.gov.tr/turkiye-cin-halk-cumhuriyeti-ekonomik-iliskileri.tr.mfa",
        "ref-22": "Republic of Türkiye Ministry of Foreign Affairs. (n.d.-b). Türkiye-Çin Halk Cumhuriyeti siyasi ilişkileri [Türkiye-People’s Republic of China political relations]. Retrieved July 27, 2026, from https://www.mfa.gov.tr/turkiye-cin-halk-cumhuriyeti-siyasi-iliskileri.tr.mfa",
        "ref-23": "Republic of Türkiye Ministry of Foreign Affairs. (2016). 2016 yılı başında dış politikamız [Our foreign policy at the beginning of 2016]. https://www.mfa.gov.tr/site_media/html/2016-yili-basinda-dis-politikamiz.pdf",
        "ref-24": "Republic of Türkiye Ministry of Foreign Affairs. (2022, March 9). 8. İstanbul Arabuluculuk Konferansı hakkında [On the 8th Istanbul Mediation Conference] [Press release No. 80]. https://www.mfa.gov.tr/no_-80_-8-istanbul-arabuluculuk-konferansi-hk.tr.mfa",
        "ref-26": "Ülgen, S., & Umarov, T. (2024, October 17). Transatlantic policies on China: Is there a role for Türkiye? Carnegie Endowment for International Peace. https://carnegieendowment.org/russia-eurasia/research/2024/10/transatlantic-policies-on-china-is-there-a-role-for-turkiye",
        "ref-30": "World Bank. (2024, December 5). World Bank approves $660 million for Türkiye to expand low-carbon rail network to boost growth and jobs. https://www.worldbank.org/en/news/press-release/2024/12/05/world-bank-approves-660-million-for-turkiye-to-expand-low-carbon-rail-network-to-boost-growth-and-jobs",
    }, remove_ids={"ref-25a"})
    data["figures"] = tc_figures()
    _write(TC, data)


def verify_assets():
    for slug, count in ((SAUDI, 18), (TC, 6)):
        for i in range(1, count + 1):
            path = ROOT / "public" / _asset(slug, i).lstrip("/")
            if not path.exists():
                raise RuntimeError(f"Missing figure asset: {path}")


def main():
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        pdfs = {}
        for slug in (SAUDI, TC):
            metadata = _load(slug, "metadata.json")
            url = metadata["urls"]["pdfEn"]
            dest = tmp / f"{slug}-en.pdf"
            _download(url, dest)
            pdfs[slug] = dest
        repair_saudi(pdfs[SAUDI])
        repair_tc(pdfs[TC])
        verify_assets()
    print("Repaired v07-i04 Saudi EN and Türkiye-China EN from official PDFs.")


if __name__ == "__main__":
    main()
