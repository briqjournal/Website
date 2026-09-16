import copy
import json
import re
from pathlib import Path

ROOT = Path.cwd()
SLUG = "mao-zedungun-diyalektik-anlayisi-ekonomik-determinizm-elestirisi-siyasal-ozne-ve-cin-dusunce"
DIR = ROOT / "content" / "articles" / SLUG / "fulltext"
CURRENT = json.loads((DIR / "current.json").read_text(encoding="utf-8"))
LINES = Path("/tmp/mao-flow.txt").read_text(encoding="utf-8").splitlines()


def para(*ranges):
    parts = []
    for start, end in ranges:
        for n in range(start, end + 1):
            value = LINES[n - 1].strip()
            if value:
                parts.append(value)
    text = ""
    for value in parts:
        if not text:
            text = value
        elif text.endswith("-") and value[0].isalpha():
            text = text[:-1] + value
        elif text.endswith("-") and value[0].isdigit():
            text += value
        else:
            text += " " + value
    return re.sub(r"\s+", " ", text).strip()


sections = [
    {
        "id": "en-section-1",
        "title": "Introduction",
        "paragraphs": [
            para((52, 71)).replace("MAO ZEDONG’S UNDERSTANDING OF dialectics", "Mao Zedong’s understanding of dialectics", 1),
            para((77, 82)),
            para((94, 102)),
            para((103, 111)),
            para((112, 124)),
            para((125, 136), (140, 154)),
        ],
    },
    {
        "id": "en-section-2",
        "title": "Methodology",
        "paragraphs": [para((157, 164))],
    },
    {
        "id": "en-section-3",
        "title": "Sources of Mao’s Dialectical Thought",
        "paragraphs": [
            para((175, 193)),
            para((194, 203), (206, 227)),
            para((228, 233), (239, 240)),
            para((241, 245)),
            para((246, 257)),
            para((258, 264)),
            para((269, 282)),
            para((291, 297), (300, 304)),
            para((305, 323)),
            para((324, 347)),
            para((348, 367)),
            para((377, 386)),
            para((387, 395)),
            para((396, 402), (405, 410)),
        ],
    },
    {
        "id": "en-section-4",
        "title": "The Fundamental Principles of Dialectics in Mao",
        "paragraphs": [
            para((413, 422)),
            para((423, 432), (436, 440)),
            para((441, 465)),
            para((474, 479)),
            para((490, 498), (501, 523)),
            para((524, 528)),
            para((529, 532), (539, 562)),
            para((567, 578)),
            para((579, 587)),
            para((588, 597)),
            para((600, 612)),
            para((613, 629)),
            para((630, 632), (638, 664)),
            para((669, 699), (701, 704)),
            para((720, 730)),
            para((737, 755), (757, 766)),
            para((767, 771), (776, 779)),
            para((791, 802), (805, 813)),
            para((814, 836), (840, 841)),
            para((842, 850)),
            para((851, 858)),
            para((859, 874)),
            para((875, 886)),
            para((887, 893), (898, 905)),
        ],
    },
    {
        "id": "en-section-5",
        "title": "Conclusion",
        "paragraphs": [
            para((908, 912)),
            para((913, 921)),
            para((922, 926), (929, 932)),
            para((933, 946)),
            para((947, 960)),
            para((964, 973)),
        ],
    },
]

figure_captions = [
    "Xi Jinping, general secretary of the Communist Party of China Central Committee, Chinese president and chairman of the Central Military Commission, and other Party and State leaders pay tribute to Comrade Mao Zedong at the Chairman Mao Memorial Hall in Beijing on the 130th anniversary of the birth of Mao (Photo: China Daily, 2023).",
    "The Luoshu (洛書) and Hetu (河圖) diagrams (Image: KKNews, 2020).",
    "Mao Zedong talking with peasants in Yangjialing, Yan’an, about their production and living conditions (Photo: CPC News, 2025).",
    "On August 18, 1966, Chairman Mao received Red Guards and representatives of revolutionary teachers and students at the Tiananmen Gate Tower (Photo: Mao Zedong Database [毛泽东博览], 1966).",
    "Mass labor mobilization during the Great Leap Forward: building a pontoon bridge to transport earth, Jingmen, Hubei, 1958 (Photo provided by Chen Feng/China Photographers Association, 2021).",
    "Mao Zedong and Joseph Stalin at the ceremonial meeting marking Stalin’s 70th birthday, Bolshoi Theatre, Moscow, December 21, 1949 (Photo: Russian State Central Museum of Cinema and Photography [ЦСДФ], 2021).",
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

assert [len(s["paragraphs"]) for s in sections] == [6, 1, 14, 24, 6]
assert len(english["references"]) == 35
assert len(english["figures"]) == 6
body = json.dumps(english, ensure_ascii=False)
for bad in ["Giriş", "Yöntem", "Mao’nun Diyalektik", "Mao’da Diyalektiğin", "Sonuç", "B R I q •", "Can Ulusoy- Mao Zedong"]:
    assert bad not in body, bad
assert "Mao Zedong’s understanding of dialectics was shaped" in body
assert "The Fundamental Principles of Dialectics in Mao" in body
assert "from the masses, to the masses" in body

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
print("Rebuilt Mao English full text from the official PDF and migrated both locales.")
