import copy
import json
import re
from pathlib import Path

ROOT = Path.cwd()
SLUG = "filistinciligin-zirve-paradoksu-transatlantik-kamuoyu-stratejik-realizm-ve-iki-devletli-cozumun"
DIR = ROOT / "content" / "articles" / SLUG / "fulltext"
CURRENT = json.loads((DIR / "current.json").read_text(encoding="utf-8"))
LINES = Path("/tmp/iqbal-flow.txt").read_text(encoding="utf-8").splitlines()


def para(*ranges):
    parts = []
    for start, end in ranges:
        for n in range(start, end + 1):
            value = LINES[n - 1].strip()
            if not value:
                continue
            if re.fullmatch(r"\d{3}", value):
                continue
            if value.startswith("B R I q •"):
                continue
            if value.startswith("Iqbal Akhtar - The Paradox of Peak Palestinianism:"):
                continue
            parts.append(value)
    text = ""
    for value in parts:
        if not text:
            text = value
        elif text.endswith("-") and value[0].isalpha():
            text = text[:-1] + value
        else:
            text += " " + value
    text = re.sub(r"\s+", " ", text).strip()
    text = text.replace("Amer463 ican", "American")
    text = text.replace("po469 litical", "political")
    return text


sections = [
    {"id": "en-section-1", "title": "Introduction", "paragraphs": [
        para((56, 75)),
        para((79, 90)),
        para((104, 119)),
        para((120, 130)),
        para((131, 143)),
        para((144, 160)),
    ]},
    {"id": "en-section-2", "title": "Research Design, Analytical Approach, and Sources", "paragraphs": [
        para((171, 185)),
        para((186, 196)),
        para((199, 218)),
    ]},
    {"id": "en-section-3", "title": "Palestinianism as a Transatlantic Political-Rhetorical Phenomenon", "paragraphs": [
        para((221, 241)),
        para((242, 248), (257, 268)),
        para((280, 302)),
        para((303, 315)),
        para((316, 334)),
        para((335, 349)),
        para((350, 368)),
    ]},
    {"id": "en-section-4", "title": "The Transatlantic Public Opinion Shift", "paragraphs": [
        para((374, 379)),
        para((381, 385), (397, 403)),
    ]},
    {"id": "en-section-5", "title": "The American Trajectory", "paragraphs": [
        para((405, 417)),
        para((418, 431)),
        para((432, 446)),
        para((447, 452)),
    ]},
    {"id": "en-section-6", "title": "The European Trajectory", "paragraphs": [
        para((454, 471)),
        para((472, 483)),
        para((484, 491)),
    ]},
    {"id": "en-section-7", "title": "Generational and Institutional Dimensions", "paragraphs": [
        para((495, 506)),
        para((507, 521)),
        para((528, 541)),
        para((543, 556)),
    ]},
    {"id": "en-section-8", "title": "Strategic Realism: The U.S.–Gulf–Israel–Iran Convergence", "paragraphs": [
        para((563, 580)),
    ]},
    {"id": "en-section-9", "title": "The Twelve-Day War and the Striking of Iranian Nuclear Infrastructure", "paragraphs": [
        para((583, 597)),
        para((598, 610)),
        para((611, 617), (624, 627)),
        para((628, 647)),
    ]},
    {"id": "en-section-10", "title": "The Degradation of the Axis of Resistance", "paragraphs": [
        para((653, 668)),
        para((669, 675)),
        para((676, 688)),
        para((689, 702)),
    ]},
    {"id": "en-section-11", "title": "The Resilience and Quiet Expansion of the Abraham Accords", "paragraphs": [
        para((705, 709), (718, 728)),
        para((729, 755)),
        para((765, 781)),
        para((782, 787)),
    ]},
    {"id": "en-section-12", "title": "The Saudi-Israeli Trajectory", "paragraphs": [
        para((789, 797)),
        para((798, 810)),
        para((811, 822)),
    ]},
    {"id": "en-section-13", "title": "The Trump Administration and the Architecture of Regional Hegemony", "paragraphs": [
        para((825, 840)),
        para((841, 857)),
        para((862, 873)),
        para((874, 900)),
    ]},
    {"id": "en-section-14", "title": "The End of the Two-State Solution: Extending the JST Argument", "paragraphs": [
        para((903, 930)),
        para((931, 950)),
        para((960, 987)),
        para((990, 1006)),
        para((1017, 1031)),
        para((1032, 1044), (1053, 1057)),
        para((1058, 1073)),
        para((1074, 1087)),
        para((1088, 1104)),
    ]},
    {"id": "en-section-15", "title": "Conclusion: Strategic Divergence and the Future of the Western Alliance", "paragraphs": [
        para((1110, 1124)),
        para((1125, 1142)),
        para((1143, 1166), (1171, 1183)),
        para((1195, 1207)),
        para((1208, 1222)),
        para((1223, 1240)),
        para((1241, 1257)),
    ]},
]

figure_captions = [
    "As of September 22, 2025, the State of Palestine is formally recognized by at least 155 of the 193 United Nations member states (Photo: IMEMC, 2025).",
    "Palestinian families are forced to flee from Nasr due to the ongoing Israeli attacks in Gaza City, Gaza on September 21, 2025 (Photo: VCG, 2025).",
    "Table 1: Principal transatlantic public-opinion surveys on Israel-Palestine, October 2023–2026.",
    "Table 1 (continued).",
    "People participate in a pro-Palestinian protest in Rome, Italy, on Sept. 22, 2025 (Photo: Li Jing/Xinhua, 2025).",
    "People walk among the rubble in the Zeitoun neighborhood of Gaza City on November 27, 2025 (Photo: China Daily, 2025).",
    "Supporters of Lebanon’s Hezbollah leader Sayyed Hassan Nasrallah carry his pictures, following his killing in an Israeli airstrike in Beirut’s southern suburbs, in Saida, southern Lebanon on September 28, 2024 (Photo: CGTN, 2024).",
    "IMEC is an example of an architecture aimed at strengthening the U.S.-Israel-Gulf strategic bloc against Iran, integrating this bloc into a broader connectivity infrastructure linking Asia and Europe, and institutionalizing bilateral security relations with the Gulf monarchies that operate independently of the Israeli-Palestinian conflict (Map: IMEC, n.d.).",
    "In 2024, the Israeli government declared approximately 24,258 dunams as state land, equivalent to roughly half of all such declarations since the Oslo Accords (Graphic: Arab News, 2026).",
]
figures = []
for source, caption in zip(CURRENT["en"]["figures"], figure_captions):
    item = copy.deepcopy(source)
    item["caption"] = caption
    figures.append(item)

english = {
    "sections": sections,
    "keywords": CURRENT["en"]["keywords"],
    "footnotes": CURRENT["en"].get("footnotes", []),
    "references": CURRENT["en"]["references"],
    "acknowledgements": CURRENT["en"].get("acknowledgements", ""),
    "figures": figures,
}
if CURRENT["en"].get("declarations"):
    english["declarations"] = CURRENT["en"]["declarations"]

expected_counts = [6, 3, 7, 2, 4, 3, 4, 1, 4, 4, 4, 3, 4, 9, 7]
assert [len(section["paragraphs"]) for section in sections] == expected_counts
assert len(english["references"]) == 70
assert len(english["figures"]) == 9
body = json.dumps(english, ensure_ascii=False)
for bad in [
    "Giriş",
    "Araştırma Tasarımı",
    "Transatlantik Kamuoyundaki Dönüşüm",
    "Amer463",
    "po469",
    "B R I q •",
    "Iqbal Akhtar - The Paradox of Peak Palestinianism:",
]:
    assert bad not in body, bad
assert "In the final week of September 2025" in body
assert "The U.S.–Gulf–Israel–Iran Convergence" in body
assert "The End of the Two-State Solution: Extending the JST Argument" in body
assert "Conclusion: Strategic Divergence and the Future of the Western Alliance" in body

(DIR / "en.json").write_text(json.dumps(english, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
(DIR / "tr.json").write_text(json.dumps(CURRENT["tr"], ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
(DIR / "current.json").unlink()
(DIR / "en-archive.json").unlink()

catalog_path = ROOT / "content" / "catalog.json"
catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
catalog["fulltext"]["current"] = [s for s in catalog["fulltext"].get("current", []) if s != SLUG]
catalog["fulltext"]["en_archive"] = [s for s in catalog["fulltext"].get("en_archive", []) if s != SLUG]
catalog["fulltext"].setdefault("localized", [])
if SLUG not in catalog["fulltext"]["localized"]:
    catalog["fulltext"]["localized"].append(SLUG)
catalog_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("Rebuilt Iqbal Akhtar English full text from the official PDF and migrated both locales.")
