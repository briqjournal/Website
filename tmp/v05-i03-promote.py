#!/usr/bin/env python3
import json
import re
import shutil
from pathlib import Path

ROOT = Path(".")
ART = ROOT / "content/articles"
CAND = ROOT / "tmp/v05-i03-candidates"
EVID = ROOT / "tmp/v05-i03-evidence"
FIGE = ROOT / "tmp/v05-i03-figure-evidence"

SLUGS = [
    "cinin-uc-kuresel-girisimi-baglaminda-ortadogu-politikasinin-seyri",
    "cinin-sistemi-ve-dunya-gorusu-ile-islam-arasinda-celiski-yoktur",
    "modernlesmeye-giden-yolda-el-ele-verelim",
    "turkiyenin-islamofobi-ile-mucadele-cabalari-yanitlar-motivasyonlar-ve-zorluklar",
    "cinin-afrika-ile-stratejik-iliskisi-ve-yeni-uluslararasi-donusumler-eski-politikalar-yeni-zorluklar",
    "kusak-ve-yol-girisimine-karsi-ekonomik-soguk-savas-dusuncesinin-yarattigi-zorluklar-ve-karsi",
    "ortak-gelecek-ve-paylasmanin-kokleri-eski-medeniyetlerimizde",
    "cinde-marksizmin-yenilenmesi",
]

ARTICLE1 = SLUGS[0]
SAYED = SLUGS[1]
ISLAMOPHOBIA = SLUGS[3]
AFRICA = SLUGS[4]
COLDWAR = SLUGS[5]
AKRAM = SLUGS[6]

def load_candidate(slug, locale):
    return json.loads((CAND / slug / f"{locale}.json").read_text(encoding="utf-8"))

def raw_text(slug, locale):
    return (EVID / slug / f"{locale}-raw.txt").read_text(encoding="utf-8")

def dehyphenated_join(left, right):
    left = left.rstrip()
    right = right.lstrip()
    if not left:
        return right
    if not right:
        return left
    if right[0] in ".,;:!?)]}":
        return left + right
    if left.endswith(("-", "‐")) and right[0].islower():
        return left[:-1] + right
    if left.endswith(("-", "‐")) and right[0].isdigit():
        if re.search(r"\d{4}-\d{2}-$", left):
            return left + right
        return left[:-1] + right
    return left + " " + right

def false_section_to_paragraphs(section):
    paras = list(section.get("paragraphs", []))
    if not paras:
        return [section["title"].strip()]
    first = dehyphenated_join(section["title"], paras[0])
    return [first] + paras[1:]

def reindex_sections(data, locale):
    for i, section in enumerate(data["sections"], 1):
        section["id"] = f"{locale}-section-{i}"

def normalize_ref_text(text):
    text = re.sub(r"\s+", " ", text).strip()
    # Repair URL wrapping introduced by PDF line layout. URLs in these published
    # bibliographies occur at the tail of each reference.
    pos = text.find("http")
    if pos >= 0:
        prefix, tail = text[:pos], text[pos:]
        suffix = ""
        m = re.search(r"\s+adresinden alındı\.?\s*$", tail, flags=re.I)
        if m:
            suffix = tail[m.start():]
            tail = tail[:m.start()]
        tail = re.sub(r"\s+", "", tail)
        text = prefix + tail + suffix
    return text

def join_reference_parts(parts):
    out = ""
    for part in parts:
        p = part.strip()
        if not p:
            continue
        out = dehyphenated_join(out, p) if out else p
    return normalize_ref_text(out)

def parse_reference_segments(segments):
    refs = []
    cur = []
    for seg in segments:
        if not seg.strip():
            continue
        stripped = seg.strip()
        if stripped in {"References", "Kaynakça"} or stripped.isdigit() or "B R I q" in stripped:
            continue
        leading = len(seg) - len(seg.lstrip(" "))
        is_new = leading <= 1
        if is_new and cur:
            refs.append(join_reference_parts(cur))
            cur = []
        cur.append(seg)
    if cur:
        refs.append(join_reference_parts(cur))
    return [r for r in refs if len(r) > 12]

def column(page, start, end=None):
    return [line[start:end] for line in page.splitlines()]

def after_marker(segments, marker):
    out = []
    active = False
    for seg in segments:
        if marker in seg:
            active = True
            # keep text after marker only if meaningful; reference headings themselves are discarded
            rest = seg.split(marker, 1)[1]
            if rest.strip():
                out.append(rest)
            continue
        if active:
            out.append(seg)
    return out

def parse_article1_tr_refs():
    page = raw_text(ARTICLE1, "tr").split("\f")[17]
    left = column(page, 0, 100)
    right = column(page, 100, None)
    left_refs = parse_reference_segments(after_marker(left, "Kaynakça"))
    right_refs = parse_reference_segments(right)
    refs = left_refs + right_refs
    refs = [r for r in refs if not r.startswith("Küresel Girişimi Bağlamında")]
    return [{"id": f"ref-{i+1}", "text": r} for i, r in enumerate(refs)]

def parse_islamophobia_refs(locale):
    page = raw_text(ISLAMOPHOBIA, locale).split("\f")[15]
    split = 96 if locale == "en" else 95
    lines = page.splitlines()
    marker = "References" if locale == "en" else "Kaynakça"
    marker_index = next(i for i, line in enumerate(lines) if marker in line)
    scoped = "\n".join(lines[marker_index:])
    left = column(scoped, 0, split)
    right = column(scoped, split, None)
    left_refs = parse_reference_segments(after_marker(left, marker))
    right_refs = parse_reference_segments(right)
    refs = left_refs + right_refs
    return [{"id": f"ref-{i+1}", "text": r} for i, r in enumerate(refs)]

def parse_africa_refs(locale):
    pages = raw_text(AFRICA, locale).split("\f")
    p21 = pages[20]
    p22 = pages[21]
    split21 = 63
    split22 = 90 if locale == "en" else 85
    marker = "References" if locale == "en" else "Kaynakça"
    right21 = parse_reference_segments(after_marker(column(p21, split21, None), marker))
    lines22 = p22.splitlines()
    first = next((i for i, line in enumerate(lines22) if line.strip()), 0)
    start = first + 1
    while start < len(lines22) and lines22[start].strip():
        start += 1
    while start < len(lines22) and not lines22[start].strip():
        start += 1
    scoped22 = "\n".join(lines22[start:])
    left22 = parse_reference_segments(column(scoped22, 0, split22))
    right22 = parse_reference_segments(column(scoped22, split22, None))
    refs = right21 + left22 + right22
    return [{"id": f"ref-{i+1}", "text": r} for i, r in enumerate(refs)]

def normalize_existing_refs(data):
    data["references"] = [
        {"id": f"ref-{i+1}", "text": normalize_ref_text(ref.get("text", ""))}
        for i, ref in enumerate(data.get("references", []))
        if ref.get("text", "").strip()
    ]

def repair_article1(data, locale):
    s = data["sections"]
    assert len(s) == 15
    major1 = s[3]
    major1["paragraphs"] = (
        list(major1["paragraphs"])
        + false_section_to_paragraphs(s[4])
        + false_section_to_paragraphs(s[5])
        + false_section_to_paragraphs(s[6])
    )
    major2 = s[7]
    merged = list(major2["paragraphs"])
    for idx in range(8, 14):
        merged += false_section_to_paragraphs(s[idx])
    major2["paragraphs"] = merged
    conclusion = s[14]
    data["sections"] = s[:3] + [major1, major2, conclusion]
    if locale == "tr":
        note_prefix = "Bu makale Çin Eğitim Bakanlığı"
        retained = []
        note = ""
        for p in conclusion["paragraphs"]:
            if p.startswith(note_prefix):
                note = p
            else:
                retained.append(p)
        conclusion["paragraphs"] = retained
        data["acknowledgements"] = note
        data["references"] = parse_article1_tr_refs()
    else:
        normalize_existing_refs(data)
    reindex_sections(data, locale)

def repair_sayed(data, locale):
    if locale == "en":
        first = data["sections"][0]
        first["title"] = (
            "How does/how do you Pakistan view China’s growing engagement with the Islamic world, "
            "especially in terms of enhancing strategic autonomy and altering regional cooperations?"
        )
        opening = (
            "Mushahid Hussain Sayed: Pakistan views China’s engagement with the Islamic world in a very "
            "positive light and Pakistan itself has played a very key role in promoting China’s engagement "
            "with the Islamic world. If you would remember that at the Islamic foreign minister’s conference, "
            "which was held on 24 March 2022 in Islamabad, Pakistan was hosting the Organization of Islamic "
            "Cooperation (OIC) foreign ministers and we specially invited, and this happened for the first time, "
            "the foreign minister of China, his Excellency Wang Yi, to be the keynote speaker at this Islamic "
            "foreign minister’s conference in Islamabad in March 2022."
        )
        first["paragraphs"] = [opening] + first["paragraphs"]
    reindex_sections(data, locale)

def repair_akram(data, locale):
    s = data["sections"]
    if locale == "en":
        assert len(s) == 9
        intro_second = s[1]["paragraphs"][1]
        marker = " “China’s progress is noteworthy."
        if marker in intro_second:
            intro_second = intro_second.split(marker, 1)[0].rstrip()
        first_title = (
            "We really appreciate you taking the time to share your insights with us on the occasion of the "
            "10th Anniversary of the Belt and Road Initiative (BRI). Mr. Khalid, as far as I know, you have "
            "visited China more than 20 times for work reasons. In 2006, you visited China for the first time "
            "with a delegation, visiting Beijing, Hangzhou and Shanghai, and have been to dozens of Chinese "
            "cities since then. In the past decade, each visit to China may have offered a unique experience. "
            "Could you share some of those experiences with us?"
        )
        first_paras = [
            s[1]["paragraphs"][0],
            intro_second,
            *s[3]["paragraphs"],
        ]
        second_title = (
            "China, Pioneer of the Green Industrial Revolution — At the 20th CPC National Congress held in "
            "October 2022, President Xi Jinping stressed that the central task of the CPC is to unite and lead "
            "the Chinese people of all ethnic groups in building a great modern socialist country in all respects, "
            "realizing the second centenary goal, and comprehensively promoting the great rejuvenation of the "
            "Chinese nation through Chinese-style modernization. What do you think of the path of modernization "
            "pursued by the Chinese people under the leadership of the Communist Party of China since the founding "
            "of New China, especially since the reform and opening up?"
        )
        fifth_title = dehyphenated_join(s[7]["title"], s[7]["paragraphs"][0])
        fifth_title = dehyphenated_join(fifth_title, s[8]["title"])
        data["sections"] = [
            {"id": "", "title": first_title, "paragraphs": first_paras},
            {"id": "", "title": second_title, "paragraphs": list(s[4]["paragraphs"])},
            {"id": "", "title": s[5]["title"], "paragraphs": list(s[5]["paragraphs"])},
            {"id": "", "title": s[6]["title"], "paragraphs": list(s[6]["paragraphs"])},
            {"id": "", "title": fifth_title, "paragraphs": list(s[8]["paragraphs"])},
        ]
        data["footnotes"] = [{
            "id": "note-1",
            "text": (
                "Zhao Di is a graduate student at the School of Marxism, Communication University of China. "
                "His research interests include Sinicization of Marxism, political communication and "
                "international communication."
            ),
        }]
    else:
        assert len(s) == 15
        first_title = (
            "Kuşak ve Yol Girişimi’nin (KYG) 10. Yıldönümü vesilesiyle bilgilerinizi bizimle paylaşmak için "
            "zaman ayırdığınız için minnettarız. Sayın Khalid, bildiğim kadarıyla iş sebebiyle Çin’i 20’den "
            "fazla kez ziyaret ettiniz. İlk olarak 2006 yılında bir heyet ile Çin’e giderek Pekin, Hangzhou ve "
            "Şanghay ziyaret ettiniz. O zamandan beri onlarca Çin şehrinde bulundunuz. Geçen on yıl içinde, "
            "her Çin ziyaretiniz muhtemelen size benzersiz deneyimler sunmuştur. Bu deneyimlerden bazılarını "
            "bizimle paylaşabilir misiniz?"
        )
        second_title = dehyphenated_join(s[8]["title"], s[8]["paragraphs"][0])
        second_title = dehyphenated_join(second_title, s[9]["title"])
        fourth_title = dehyphenated_join(s[11]["title"], s[11]["paragraphs"][0])
        fourth_title = dehyphenated_join(fourth_title, s[12]["title"])
        fourth_title = dehyphenated_join(fourth_title, s[12]["paragraphs"][0])
        fourth_title = dehyphenated_join(fourth_title, s[13]["title"])
        data["sections"] = [
            {"id": "", "title": first_title, "paragraphs": list(s[7]["paragraphs"])},
            {"id": "", "title": second_title, "paragraphs": list(s[9]["paragraphs"])},
            {"id": "", "title": s[10]["title"], "paragraphs": list(s[10]["paragraphs"])},
            {"id": "", "title": fourth_title, "paragraphs": list(s[13]["paragraphs"])},
            {"id": "", "title": s[14]["title"], "paragraphs": list(s[14]["paragraphs"])},
        ]
        data["footnotes"] = [{
            "id": "note-1",
            "text": (
                "Zhao Di, Çin İletişim Üniversitesi Marksizm Okulu'nda lisansüstü öğrencisidir. "
                "Araştırma alanları arasında Çinlileştirilmiş Marksist kuram, siyasal iletişim ve "
                "uluslararası iletişim yer almaktadır."
            ),
        }]
    reindex_sections(data, locale)

FIGURE_FILES = {
    ARTICLE1: [
        "p04-n001.jpg", "p06-n002.jpg", "p07-n003.jpg", "p08-n004.jpg", "p09-n005.jpg",
        "p11-n006.jpg", "p12-n007.jpg", "p14-composite.jpg", "p16-n010.jpg",
    ],
    SAYED: ["p04-n002.jpg", "p05-n003.jpg", "p06-n004.jpg", "p08-n005.jpg", "p09-n006.jpg"],
    SLUGS[2]: ["p02-n001.jpg", "p04-n002.jpg", "p06-n003.jpg"],
    ISLAMOPHOBIA: ["p04-n001.jpg", "p06-n002.jpg", "p07-n003.jpg", "p09-n004.jpg", "p11-n005.jpg", "p14-n006.jpg"],
    AFRICA: [
        "p04-n001.jpg", "p05-n002.jpg", "p06-n003.jpg", "p08-n004.jpg", "p09-n005.jpg", "p10-n006.jpg",
        "p12-n007.jpg", "p13-n008.jpg", "p14-n009.jpg", "p16-n010.jpg", "p18-n011.jpg", "p20-n012.jpg",
    ],
    COLDWAR: [
        "p03-n001.jpg", "p05-n002.jpg", "p07-n003.jpg", "p09-n004.jpg", "p11-n005.jpg", "p12-n006.jpg",
        "p13-n007.jpg", "p16-n008.jpg", "p20-n009.jpg", "p22-n010.jpg", "p24-n011.jpg",
    ],
    AKRAM: ["p03-n002.jpg", "p04-n003.jpg", "p05-n004.jpg", "p07-n005.jpg"],
    SLUGS[7]: ["p03-n003.jpg", "p04-n004.jpg"],
}

CAPTION_OVERRIDES = {
    (AKRAM, "en", 3): (
        "Khalid Taimur Akram, Executive Director, Pakistan Research Center for a Community with Shared Future "
        "(PRCCSF) and Zhao Di, a graduate student at the School of Marxism, Communication University of China."
    ),
    (AKRAM, "tr", 3): (
        "İslamabad Küresel ve Stratejik Çalışmalar Merkezi İcra Müdürü Khalid Taimur Akram Akram (solda) ve "
        "Çin İletişim Üniversitesi Marksizm Okulu’nda lisansüstü öğrencisi Zhao Di."
    ),
}

def caption_block(slug, locale, page_no):
    override = CAPTION_OVERRIDES.get((slug, locale, page_no))
    if override:
        return override
    page = raw_text(slug, locale).split("\f")[page_no - 1]
    lines = page.splitlines()
    marker = re.compile(r"\((?:Photo|Photograph|Figure|Map):", re.I) if locale == "en" else re.compile(r"\((?:Fotoğraf|Şekil|Harita):", re.I)
    candidates = []
    for i, line in enumerate(lines):
        if not marker.search(line):
            continue
        lo = i
        hi = i
        while lo > 0 and lines[lo - 1].strip():
            lo -= 1
        while hi + 1 < len(lines) and lines[hi + 1].strip():
            hi += 1
        block_lines = [x.strip() for x in lines[lo:hi + 1] if x.strip()]
        block = " ".join(block_lines)
        block = re.sub(r"\s+", " ", block).strip()
        if 20 <= len(block) <= 1200:
            candidates.append(block)
    if not candidates:
        raise RuntimeError(f"no caption block: {slug} {locale} p{page_no}")
    # Published caption blocks are separated from body copy and are therefore
    # much shorter than ordinary two-column body runs.
    caption = min(candidates, key=len)
    title_rx = re.compile(r"^(?:Figure|Şekil)\s+\d+\s*[.:].*", re.I)
    title = next((x.strip() for x in lines if title_rx.match(x.strip())), "")
    if title and title not in caption:
        caption = f"{title} — {caption}"
    return caption

def attach_figures(slug, data, locale):
    files = FIGURE_FILES[slug]
    srcdir = FIGE / slug / "images"
    outdir = ROOT / "public/assets/article-figures" / slug
    shutil.rmtree(outdir, ignore_errors=True)
    outdir.mkdir(parents=True, exist_ok=True)
    figures = []
    for i, name in enumerate(files, 1):
        src = srcdir / name
        if not src.exists():
            raise FileNotFoundError(src)
        dstname = f"figure-{i:02d}.jpg"
        shutil.copy2(src, outdir / dstname)
        m = re.match(r"p(\d+)-", name)
        if not m:
            raise RuntimeError(name)
        page_no = int(m.group(1))
        figures.append({
            "id": f"figure-{i}",
            "src": f"/assets/article-figures/{slug}/{dstname}",
            "caption": caption_block(slug, locale, page_no),
        })
    data["figures"] = figures

def body_text(data):
    return " ".join(p for s in data["sections"] for p in s.get("paragraphs", []))

def validate_record(slug, locale, data):
    required = {"sections", "keywords", "footnotes", "references", "acknowledgements", "figures"}
    missing = required - set(data)
    assert not missing, (slug, locale, missing)
    assert data["sections"], (slug, locale, "empty sections")
    ids = [s["id"] for s in data["sections"]]
    assert ids == [f"{locale}-section-{i}" for i in range(1, len(ids) + 1)], (slug, locale, ids)
    body = body_text(data)
    assert len(body) > 1200, (slug, locale, len(body))
    forbidden = ["How to cite:", "Atıf:", "B R I q", "Volume 5 Issue 3", "Cilt 5 Sayı 3"]
    assert not any(x in body for x in forbidden), (slug, locale, "front matter leakage")
    paras = [p.strip() for s in data["sections"] for p in s.get("paragraphs", []) if len(p.strip()) > 80]
    assert len(paras) == len(set(paras)), (slug, locale, "duplicate paragraph")
    for ref in data["references"]:
        assert "\n" not in ref["text"], (slug, locale, ref)
        if "http" in ref["text"]:
            tail = ref["text"].split("http", 1)[1]
            urlpart = tail.split(" adresinden alındı", 1)[0]
            assert " " not in urlpart, (slug, locale, ref["text"])

def main():
    all_data = {}
    for slug in SLUGS:
        all_data[slug] = {}
        for locale in ("en", "tr"):
            data = load_candidate(slug, locale)
            if slug == ARTICLE1:
                repair_article1(data, locale)
            elif slug == SAYED:
                repair_sayed(data, locale)
            elif slug == ISLAMOPHOBIA:
                data["references"] = parse_islamophobia_refs(locale)
                reindex_sections(data, locale)
            elif slug == AFRICA:
                data["references"] = parse_africa_refs(locale)
                reindex_sections(data, locale)
            elif slug == COLDWAR:
                normalize_existing_refs(data)
                reindex_sections(data, locale)
            elif slug == AKRAM:
                repair_akram(data, locale)
            else:
                reindex_sections(data, locale)
            attach_figures(slug, data, locale)
            validate_record(slug, locale, data)
            all_data[slug][locale] = data

    expected_refs = {
        (ARTICLE1, "en"): 32,
        (ARTICLE1, "tr"): 32,
        (AFRICA, "en"): 59,
        (AFRICA, "tr"): 59,
        (COLDWAR, "en"): 41,
        (COLDWAR, "tr"): 42,
    }
    for key, count in expected_refs.items():
        slug, locale = key
        actual = len(all_data[slug][locale]["references"])
        assert actual == count, (slug, locale, actual, count)
    for locale in ("en", "tr"):
        assert len(all_data[ISLAMOPHOBIA][locale]["references"]) >= 30, (locale, len(all_data[ISLAMOPHOBIA][locale]["references"]))

    for slug in SLUGS:
        outdir = ART / slug / "fulltext"
        outdir.mkdir(parents=True, exist_ok=True)
        for locale in ("en", "tr"):
            (outdir / f"{locale}.json").write_text(
                json.dumps(all_data[slug][locale], ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )

    summary = {
        slug: {
            locale: {
                "sections": len(all_data[slug][locale]["sections"]),
                "paragraphs": sum(len(s["paragraphs"]) for s in all_data[slug][locale]["sections"]),
                "references": len(all_data[slug][locale]["references"]),
                "footnotes": len(all_data[slug][locale]["footnotes"]),
                "figures": len(all_data[slug][locale]["figures"]),
                "opening": all_data[slug][locale]["sections"][0]["paragraphs"][0][:180],
                "closing": all_data[slug][locale]["sections"][-1]["paragraphs"][-1][-180:],
            }
            for locale in ("en", "tr")
        }
        for slug in SLUGS
    }
    (ROOT / "tmp/v05-i03-promotion-summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(summary, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
