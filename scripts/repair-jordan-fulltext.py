import copy
import json
import re
from pathlib import Path

SLUG = "dijital-ipek-yolu-cercevesinde-cin-arap-isbirligi-urdun-ornegi"
ROOT = Path.cwd()
DIR = ROOT / "content" / "articles" / SLUG / "fulltext"
FLOW = Path("/tmp/jordan-en-flow.txt").read_text(encoding="utf-8").splitlines()
CURRENT = json.loads((DIR / "current.json").read_text(encoding="utf-8"))


def paragraph(*ranges):
    parts = []
    for start, end in ranges:
        for number in range(start, end + 1):
            value = FLOW[number - 1].strip()
            if value:
                parts.append(value)
    text = ""
    for value in parts:
        if not text:
            text = value
        elif text.endswith("-") and value[0].islower():
            text = text[:-1] + value
        else:
            text += " " + value
    for old, new in {
        "eco429 nomic": "economic",
        "chal433 lenging": "challenging",
        "re435 gional": "regional",
        "understand437 ing": "understanding",
        "con441 nections": "connections",
    }.items():
        text = text.replace(old, new)
    return re.sub(r"\s+", " ", text).strip()


HEADINGS = [
    "Introduction",
    "Methodology",
    "The Digital Silk Road Initiative and China-Jordan Cooperation",
    "The Evolving Concept of the Digital Silk Road and Its Global Context",
    "The Iterative Upgrading of Jordan’s Digital Transformation Strategy",
    "Jordan’s National Characteristics and Demand for Digital Partners",
    "Consolidation and Institutionalization of the China-Jordan Digital Cooperation Framework",
    "Recent Developments in Chinese Enterprises’ Participation in Jordan’s Digital Construction",
    "Opportunities and Challenges",
    "Opportunities",
    "Challenges",
    "Conclusion",
]

PARAGRAPHS = [
    [paragraph((70, 97)), paragraph((102, 114)), paragraph((131, 149)), paragraph((150, 160), (163, 171)), paragraph((172, 175)), paragraph((177, 186), (195, 201))],
    [paragraph((203, 208)), paragraph((209, 217))],
    [paragraph((221, 232))],
    [paragraph((235, 244)), paragraph((245, 247), (250, 267)), paragraph((268, 275), (284, 285)), paragraph((299, 313), (315, 319))],
    [paragraph((322, 340)), paragraph((341, 369), (378, 380)), paragraph((395, 406), (408, 437))],
    [paragraph((443, 452)), paragraph((453, 465), (474, 479)), paragraph((480, 488))],
    [paragraph((491, 499)), paragraph((500, 500), (502, 517)), paragraph((518, 526)), paragraph((530, 535))],
    [paragraph((538, 548)), paragraph((549, 551), (561, 569)), paragraph((578, 588), (591, 599)), paragraph((600, 617))],
    [paragraph((625, 632))],
    [paragraph((634, 645)), paragraph((646, 652), (658, 661)), paragraph((672, 681)), paragraph((682, 684), (686, 694)), paragraph((695, 703))],
    [
        paragraph((705, 709), (716, 725)),
        paragraph((726, 736)),
        "Debt sustainability and financial transparency. Large-scale digital infrastructure projects related to the DSR often involve substantial investment. Although China’s loan terms are often more flexible than those of Western financial institutions, Jordan still needs to carefully assess the long-term financial burden of each project. Ensuring transparency in financing arrangements and properly designing repayment schedules are crucial to preventing the accumulation of sovereign debt risks. Jordan’s current public debt as a share of GDP remains relatively high. While expanding digital infrastructure investment, it should adhere to the principles of living within its means and phased implementation.",
        "Domestic digital divide and inclusive development. Although the DSR aims to promote digital connectivity, significant disparities in digital access persist across regions, income groups, and between urban and rural areas in Jordan. Without targeted policy interventions, improvements in digital infrastructure may first benefit urban and developed areas, thereby widening existing inequalities. Some large cities have already taken the lead in deploying next-generation mobile communication trial networks, while broadband coverage in remote rural areas remains low. Jordan’s national digital transformation strategy has listed “digital inclusion” as one of its core pillars and has set universal service targets. Achieving truly inclusive development will require comprehensive measures, including educational outreach, terminal subsidies, and the decentralization of public services.",
        "Addressing the above challenges requires proactive, forward-looking policies, transparent and efficient governance mechanisms, and a balanced approach to international partnerships on Jordan’s part. By carefully managing opportunities and risks, Jordan can fully realize its digital transformation goals under the DSR framework while effectively safeguarding its national interests and digital sovereignty.",
    ],
    [
        "The China-Arab Digital Silk Road cooperation, as exemplified by Jordan, constitutes an important and evolving dimension of bilateral relations. This study shows that the DSR offers substantial opportunities for Jordan to accelerate its digital transformation, promote economic growth, and enhance human capital. Chinese enterprises, particularly leading telecommunications companies such as Huawei and ZTE, have played a key role in upgrading Jordan’s digital infrastructure and advancing talent development. These cooperative efforts are well aligned with Jordan’s national digital strategy and have made tangible contributions to its vision of becoming a regional digital hub.",
        "At the same time, the analysis reveals several challenges that need to be actively addressed to ensure the long‑term success and sustainability of China-Jordan DSR cooperation. Issues such as data security, regulatory coordination, geopolitical sensitivities, and debt sustainability must be carefully managed through sound governance frameworks. The potential risk of widening domestic digital divides also deserves close attention.",
        "In summary, the China-Arab Digital Silk Road cooperation, with Jordan as a case study, holds considerable potential for mutual benefit. By strategically seizing opportunities and proactively responding to challenges, China and Jordan can build a more resilient, sustainable, and mutually beneficial digital partnership. Such a partnership will not only promote economic and social progress on both sides but also contribute to regional stability and the diversification of global digital governance. Future research could further examine the micro-level impacts of DSR cooperation in Jordan, including its actual effects on empowering small and medium-sized enterprises in their digital transformation, and conduct cross-period comparative analyses to provide more refined empirical evidence for deepening China-Arab digital cooperation.",
    ],
]

PARAGRAPHS[0][0] = PARAGRAPHS[0][0].replace("THE RAPID ADVANCEMENT OF DIGITAL", "The rapid advancement of digital", 1)
PARAGRAPHS[0][0] = PARAGRAPHS[0][0].replace("the advancement of an “Information Silk Road ”. (National Development and Reform Commission et al., 2015) The concept", "the advancement of an “Information Silk Road” (National Development and Reform Commission et al., 2015). The concept")
PARAGRAPHS[0][3] = PARAGRAPHS[0][3].replace("smart city solutions in North Africa. (El Kadi, 2024) Taking Egypt", "smart city solutions in North Africa (El Kadi, 2024). Taking Egypt")

sections = []
for index, (title, paragraphs) in enumerate(zip(HEADINGS, PARAGRAPHS), 1):
    section = {"id": f"en-section-{index}", "title": title, "paragraphs": paragraphs}
    if index in (10, 11):
        section["level"] = "subsection"
        section["toc"] = False
    sections.append(section)

reference_texts = [
    "Al-Ahliyya Amman University. (2025, July 7). Memorandum of cooperation between AAU and Huawei Technologies-Jordan. https://www.ammanu.edu.jo/news/memorandum-of-cooperation-between-aau-and-huawei-technologies-jordan/",
    "Al-Jaghoub, S., & Westrup, C. (2003). Jordan and ICT-led development: Towards a competitive state? Information Technology & People, 16(1), 93–110. https://doi.org/10.1108/09593840310463032",
    "Almajali, H., Thuneibat, N., & Qatawneh, N. (2025). Investigation of the antecedents of digital transformation and their effects on operational performance in the Jordanian manufacturing sector. Journal of Risk and Financial Management, 18(8), Article 446. https://doi.org/10.3390/jrfm18080446",
    "Arsentyeva, I. I. (2024). China’s Digital Silk Road: Challenges and opportunities for Latin America and the Caribbean. Vestnik RUDN. International Relations, 24(1), 51–64. https://doi.org/10.22363/2313-0660-2024-24-1-51-64",
    "Brown, K., & Burjanadze, A. (2020). The Digital Silk Road: Upgrading the “16+1” cooperation? In H. Pechlaner, G. Erschbamer, H. Thees, & M. Gruber (Eds.), China and the new Silk Road (pp. 137–145). Springer.",
    "Cai, F., Nolan, P., & Wang, L. (Eds.). (2025). The Routledge handbook of the Belt and Road (3rd ed.). Routledge. https://doi.org/10.4324/9781003660750",
    "Chaziza, M., & Lutmar, C. (2026). Jordan’s niche diplomacy: Reframing middle-power agency in the 21st-century Middle East. World, 7(2), Article 25. https://doi.org/10.3390/world7020025",
    "Chosun Ilbo. (2026, April 13). Alibaba’s Qwen dominates the global open-source AI market. https://www.chosun.com/english/industry-en/2026/04/13/LVNIQOTWGFEUTH4DHZ3PFHGSZ4/",
    "CRI Online. (2025, November 22). From ‘cultural bonds’ to ‘Digital Silk Road’: China and Arab states jointly depict a new vision of cooperation in digital era. https://city.cri.cn/20251121/78247831-0525-4161-b48d-7d09a791e563.html",
    "Dahdal, A. M., & Abdel Ghafar, A. (2025). The Digital Silk Road: “Tech-diplomacy” as a paradigm for understanding technological adoption and emerging digital regulations in MENA. Asian Journal of Law and Society, 12(Special Issue 2), 163–188. https://doi.org/10.1017/als.2024.30",
    "Digital Watch Observatory. (2025). Jordan. https://dig.watch/countries/jordan",
    "El Kadi, T. (2024). Learning along the Digital Silk Road? Technology transfer, power, and Chinese ICT corporations in North Africa. The Information Society, 40(2), 136–153. https://doi.org/10.1080/01972243.2024.2317060",
    "Feng, Z. (2025). 美欧学界对”数字丝绸之路”的认知评析 [An analysis of American and European academic perceptions of the Digital Silk Road]. 云南社会科学 [Yunnan Social Sciences], (4), 42–52.",
    "Gordon, D., & Nouwens, M. (Eds.). (2022). The Digital Silk Road: China’s technological rise and the geopolitics of cyberspace. Routledge.",
    "He, Z. P., & Zhou, M. (2024). 共建”数字丝绸之路”的中国角色、挑战及应对 [China’s role, challenges, and responses in building the Digital Silk Road]. 东北亚论坛 [Northeast Asia Forum], (6), 110–124.",
    "Heeks, R., Ospina, A. V., Foster, C., Gao, P., Han, X., Jepson, N., Schindler, S., & Zhou, Q. (2024). China’s digital expansion in the Global South: Systematic literature review and future research agenda. The Information Society, 40(2), 69–95. https://doi.org/10.1080/01972243.2024.2315875",
    "Hussain, F., Hussain, Z., Khan, M. I., & Imran, A. (2024). The digital rise and its economic implications for China through the Digital Silk Road under the Belt and Road Initiative. Asian Journal of Comparative Politics, 9(2), 238–253. https://doi.org/10.1177/20578911231174731",
    "Khaberni. (2025, November 23). Ratification of the Jordanian strategy for digital transformation for the years 2026–2028. https://www.khaberni.com/news/754388-ratification-of-the-jordanian-strategy-for-digital-transformation-for-the-years-2026-–-2028",
    "Ministry of Digital Economy and Entrepreneurship. (2025). Jordanian digital transformation strategy and the implementation plan 2026–2028. https://www.modee.gov.jo/ebv4.0/root_storage/en/eb_list_page/jordanian_digital_transformation_strategy_and_the_implementation_plan_2026-2028.pdf",
    "National Development and Reform Commission, Ministry of Foreign Affairs, & Ministry of Commerce of the People’s Republic of China. (2015). Vision and actions on jointly building Silk Road Economic Belt and 21st-Century Maritime Silk Road. https://policy.asiapacificenergy.org/sites/default/files/Vision%20and%20Actions%20on%20Jointly%20Building%20Silk%20Road%20Economic%20Belt%20and%2021st-Century%20Maritime%20Silk%20Road%20%28EN%29.pdf",
    "Oreglia, E., & Zheng, W. (2024). The Digital Silk Road between national rhetoric and provincial ambitions. The China Quarterly, 261, 183–195. https://doi.org/10.1017/S0305741024000936",
    "Senate of Jordan. (2026, January 11). Jordan, China explore deeper strategic partnership. https://senate.jo/En/NewsDetails/Pr11012026En",
    "Shaanxi Provincial People’s Government. (2026, April 26). 2026 World Mayor Dialogue·Xi’an event to open on the 27th: “Roots of civilization and smart governance” as one of the core themes, aiming to transform national-level strategic consensus into practical city-level cooperation. https://www.shaanxi.gov.cn/xw/ldx/ds/202604/t20260426_3633251.html",
    "Shen, H. (2018). Building a digital silk road? Situating the internet in China’s Belt and Road Initiative. International Journal of Communication, 12, 2683–2701.",
    "Stanford HAI. (2025, December 16). Beyond DeepSeek: China’s diverse open-weight AI ecosystem and its policy implications.",
    "The Jordan Times. (2019, June 27). Huawei to launch first ICT academy in Jordan. https://www.jordantimes.com/news/local/huawei-launch-first-ict-academy-jordan",
    "The Jordan Times. (2021, December 1). ICT talent will accelerate Jordan’s future digital economy. https://jordantimes.com/opinion/ethan-wang/ict-talent-will-accelerate-jordans-future-digital-economy",
    "The Jordan Times. (2026, January 12). Gov’t launches new executive program to advance economic, administrative, and social reforms. https://jordantimes.com/news/local/govt-launches-new-executive-programme-to-advance-economic-administrative-social-reforms",
    "The White House. (2025, July 23). Winning the AI race: America’s AI action plan. https://www.whitehouse.gov/wp-content/uploads/2025/07/Americas-AI-Action-Plan.pdf",
    "Wang, E., & Wang, M. (2023, July 18). China signs over 200 BRI cooperation documents with 152 countries, 32 int’l organizations. China News Service. https://www.chinanews.com.cn/gn/2023/07-18/10045260.shtml",
    "Xi, J. (2017, May 14). 携手推进“一带一路”建设 [Work together to build the Belt and Road] [Keynote address]. Belt and Road Forum for International Cooperation. http://2017.beltandroadforum.org/n100/2017/0514/c24-407.html",
    "Yarmouk University. (2024, September 19). Yarmouk signs MoU with Huawei to promote ICT education. https://www.yu.edu.jo/index.php/en/newsen/5950-yarmouk-signs-mou-with-huawei-to-promote-ict-education",
    "Yin, R. K. (2018). Case study research and applications: Design and methods (6th ed.). SAGE.",
    "驻约旦使馆经商处. (2019). 约旦劳动力市场与人才流失情况 [Labor migration and talent loss in Jordan]. http://211.88.33.68/article/zwjg/zwdy/zwdyxyf/201904/20190402858373.shtml",
]
references = [{"id": f"ref-{index}", "text": text} for index, text in enumerate(reference_texts, 1)]

figure_captions = [
    "The DSR aims to promote digital connectivity, technological cooperation, and innovation-driven development among partner countries (Photo: CGTN, 2021).",
    "Within the DSR framework, China’s Bei-Dou Navigation Satellite System has achieved extensive global coverage (Photo: Xinhua, 2024).",
    "Jordan’s digital transformation has evolved through successive policy phases, each building upon prior frameworks (Illustration: mozon-tech, n.d.).",
    "The information and communications technology sector accounts for about 12 percent of Jordan’s GDP (Illustration: Jordan News Agency, 2026).",
    "In the memorandum of understanding signed by China and Jordan in 2019 to jointly build the Belt and Road Initiative, the digital economy was identified as a priority area of cooperation. Chinese Foreign Minister Wang Yi meets with King Abdullah II of Jordan in Amman, Jordan, Dec 15, 2025 (Photo: China Daily, 2025).",
    "Jordan Investment Minister Tareq Abughazaleh participated in the opening of the China International Supply Chain Expo (CISCE) in Beijing on June 23, 2026, highlighting Jordan's investment opportunities (Photo: Jordan News Agency, 2026).",
    "The Jordan Industrial Operating Systems Security Forum 2026 brought together policymakers, regulators, and industry experts to strengthen cybersecurity across the Kingdom’s critical infrastructure (Photo: Jordan News Agency, 2026).",
    "Jordan’s national digital transformation strategy has listed “digital inclusion” as one of its core pillars and has set universal service targets (Photo: TechAfricanews, 2026).",
]
figures = []
for source, caption in zip(CURRENT["en"]["figures"], figure_captions):
    figure = copy.deepcopy(source)
    figure["caption"] = caption
    figures.append(figure)

funding_en = "This thesis is the result of the stage research of 2026 Special Project for High-Quality Development of Humanities and Social Sciences Research at Northwestern Polytechnical University: Power, Technology, and Norms: Cyberspace Governance in GCC Countries and the Reshaping of the Middle East International Order under the Global Governance Initiative (Project No. D5000260296)"
english = {
    "sections": sections,
    "keywords": ["China-Arab cooperation", "digital infrastructure", "Digital Silk Road", "digital transformation", "Jordan"],
    "footnotes": [],
    "references": references,
    "acknowledgements": "",
    "figures": figures,
    "declarations": {"funding": funding_en},
}

turkish = copy.deepcopy(CURRENT["tr"])
marker = " Bu çalışma, Kuzeybatı Politeknik Üniversitesi bünyesinde yürütülen 2026 Beşeri ve Sosyal Bilimler Araştırmalarının Yüksek Nitelikli Gelişimi Özel Projesi kapsamında gerçekleştirilen"
last_paragraph = turkish["sections"][-1]["paragraphs"][-1]
if marker not in last_paragraph:
    raise RuntimeError("Turkish funding statement marker not found")
turkish["sections"][-1]["paragraphs"][-1] = last_paragraph.split(marker, 1)[0].rstrip()
turkish["declarations"] = {
    "funding": "Bu çalışma, Kuzeybatı Politeknik Üniversitesi bünyesinde yürütülen 2026 Beşeri ve Sosyal Bilimler Araştırmalarının Yüksek Nitelikli Gelişimi Özel Projesi kapsamında gerçekleştirilen “Güç, Teknoloji ve Normlar: Küresel Yönetişim Girişimi Çerçevesinde KİK Ülkelerinde Siber Uzay Yönetişimi ve Ortadoğu Uluslararası Düzeninin Yeniden Şekillendirilmesi” başlıklı aşama araştırmasının sonucudur (Proje No. D5000260296)."
}

assert [len(section["paragraphs"]) for section in english["sections"]] == [6, 2, 1, 4, 3, 3, 4, 4, 1, 5, 5, 3]
assert len(english["references"]) == 34
assert len(english["figures"]) == 8
assert english["sections"][9]["level"] == "subsection" and english["sections"][9]["toc"] is False
assert english["sections"][10]["level"] == "subsection" and english["sections"][10]["toc"] is False
english_blob = json.dumps(english, ensure_ascii=False)
for artifact in ["Giriş", "Yöntem", "THE RAPID ADVANCEMENT OF DIGITAL Forum", "eco429", "chal433", "re435", "understand437", "con441", "Makale 446", "7 Temmuz", "13 Nisan", "23 Kasım", "6. baskı"]:
    assert artifact not in english_blob, artifact

(DIR / "en.json").write_text(json.dumps(english, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
(DIR / "tr.json").write_text(json.dumps(turkish, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
(DIR / "current.json").unlink()
(DIR / "en-archive.json").unlink()

catalog_path = ROOT / "content" / "catalog.json"
catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
fulltext = catalog["fulltext"]
fulltext["current"] = [slug for slug in fulltext.get("current", []) if slug != SLUG]
fulltext["en_archive"] = [slug for slug in fulltext.get("en_archive", []) if slug != SLUG]
localized = fulltext.setdefault("localized", [])
if SLUG not in localized:
    localized.append(SLUG)
catalog_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("Rebuilt Jordan English full text from the official PDF and migrated both locales.")
