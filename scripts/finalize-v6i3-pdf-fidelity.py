#!/usr/bin/env python3
"""Apply narrow, source-verified PDF fidelity fixes to Volume 6 Issue 3.

This intentionally does NOT try to be a generic PDF cleanup engine. Every structural
change below is limited to v06-i03 and is backed by the printed Turkish/English PDFs.
"""

from __future__ import annotations

import json
import re
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ARTICLES = ROOT / "content" / "articles"

IRATNI = "cezayir-devrimci-diplomasisi-bandung-temel-girisiminden-yeni-bir-baglantisizlar-konseptine"
INTERVIEW = "70-yilinda-bandung-baglantisizliktan-hegemonyaciliga-karsi-milli-devletlerin-ortak-kalkinma-ve"
ZHANG_DU = "endonezya-dis-politikasinda-bandung-mirasina-yeniden-bakis-tarihsel-bir-inceleme-ve-guncel"
AKALIN = "bandung-ruhu-70-yasinda"
FANG = "bandung-konferansi-oncesi-ve-sonrasinda-yeni-cinin-dis-politikasi-bandung-konferansini-yeniden"
GAS = "yeni-bir-enerji-kaynagi-olarak-gaz-hidratlar"
SUBSTANTIVE = [IRATNI, INTERVIEW, ZHANG_DU, AKALIN, FANG, GAS]

PAGE_DUP_RE = re.compile(r"^(\d{3})\1$")
BROKEN_END_RE = re.compile(r"[A-Za-zÇĞİÖŞÜçğıöşü]-$")
LOWER_START_RE = re.compile(r"^[a-zçğıöşü]")


def load(slug: str, locale: str) -> dict:
    path = ARTICLES / slug / "fulltext" / f"{locale}.json"
    return json.loads(path.read_text(encoding="utf-8"))


def save(slug: str, locale: str, data: dict) -> None:
    path = ARTICLES / slug / "fulltext" / f"{locale}.json"
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def clean_space(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def join_boundary(left: str, right: str) -> str:
    left = clean_space(left)
    right = clean_space(right)
    if BROKEN_END_RE.search(left) and LOWER_START_RE.match(right):
        return left[:-1] + right
    return f"{left} {right}".strip()


def repair_paragraph_boundaries(paragraphs: list[str]) -> list[str]:
    """Repair only explicit PDF column/page word-break boundaries."""
    out: list[str] = []
    for raw in paragraphs:
        text = clean_space(raw)
        if not text or PAGE_DUP_RE.fullmatch(text) or text == "EK FOTO B":
            continue
        if out and BROKEN_END_RE.search(out[-1]) and LOWER_START_RE.match(text):
            out[-1] = join_boundary(out[-1], text)
        else:
            out.append(text)
    return out


def exact_dedupe(sections: list[dict]) -> list[dict]:
    """Drop only exact repeated long paragraphs introduced by pull-quote/layout duplication."""
    seen: set[str] = set()
    for section in sections:
        kept: list[str] = []
        for paragraph in section.get("paragraphs", []):
            key = clean_space(paragraph)
            if len(key) >= 80 and key in seen:
                continue
            kept.append(key)
            if len(key) >= 80:
                seen.add(key)
        section["paragraphs"] = kept
    return sections


def remove_duplicated_figure_captions(data: dict) -> None:
    captions = {
        clean_space(figure.get("caption", ""))
        for figure in data.get("figures", [])
        if len(clean_space(figure.get("caption", ""))) >= 20
    }
    if not captions:
        return
    for section in data.get("sections", []):
        section["paragraphs"] = [
            p for p in section.get("paragraphs", []) if clean_space(p) not in captions
        ]


def reindex(sections: list[dict], locale: str) -> list[dict]:
    for index, section in enumerate(sections, 1):
        section["id"] = f"{locale}-section-{index}"
        section.setdefault("level", "section")
        section["paragraphs"] = repair_paragraph_boundaries(section.get("paragraphs", []))
    return exact_dedupe(sections)


def section_by_title(sections: list[dict], title: str) -> dict:
    matches = [s for s in sections if s.get("title") == title]
    if len(matches) != 1:
        raise RuntimeError(f"Expected exactly one section {title!r}, found {len(matches)}")
    return matches[0]


def fold_unapproved_sections(data: dict, locale: str, allowed: list[str]) -> None:
    """For Iratni only: fold PDF pull-quotes/citation fragments back into real sections."""
    corpus = "\n".join(
        p for s in data["sections"] for p in s.get("paragraphs", [])
    )
    approved = set(allowed)
    out: list[dict] = []
    for original in data["sections"]:
        section = deepcopy(original)
        title = clean_space(section.get("title", ""))
        section["title"] = title
        if title in approved:
            out.append(section)
            continue
        if not out:
            raise RuntimeError(f"Unexpected leading false heading in {locale}: {title}")
        # A citation-only fragment promoted to a heading belongs at the end of the
        # previous paragraph. Pull-quotes already repeated in body are not re-added.
        if title.startswith("(") and title.endswith(").") and out[-1]["paragraphs"]:
            out[-1]["paragraphs"][-1] = clean_space(out[-1]["paragraphs"][-1] + " " + title)
        elif title and title not in corpus:
            out[-1]["paragraphs"].append(title)
        out[-1]["paragraphs"].extend(section.get("paragraphs", []))
    data["sections"] = reindex(out, locale)


def fix_iratni(data: dict, locale: str) -> None:
    allowed = {
        "en": [
            "Introduction",
            "The “Mecca” of the Revolutionaries",
            "Diplomatic support",
            "Arms and military training for African freedom fighters",
            "The Arduous Quest for a Militant Non-Aligned Movement",
            "Adapting the Non-Aligned Movement to an Evolving Global Landscape",
            "Conclusion",
        ],
        "tr": [
            "Giriş",
            "Devrimcilerin “Mekke’si”",
            "Diplomatik destek",
            "Afrika özgürlük savaşçıları için silah ve askeri eğitim",
            "Militan Bağlantısızlar Hareketi için Zorlu Arayış",
            "Bağlantısızlar Hareketi’ni Değişen Uluslararası Bağlama Uyarlama",
            "Sonuç",
        ],
    }[locale]
    fold_unapproved_sections(data, locale, allowed)


def fix_zhang_du(data: dict, locale: str) -> None:
    sections = data["sections"]
    if locale == "en":
        section_by_title(sections, "Spirit")["title"] = (
            "The Transformation of Indonesian Diplomacy and its Contribution to Fostering the Bandung Spirit"
        )
        # Printed heading uses an explicit hyphen.
        for section in sections:
            if section["title"] == "Sukarno’s Firm Anti-Imperialist and AntiColonialist Stance":
                section["title"] = "Sukarno’s Firm Anti-Imperialist and Anti-Colonialist Stance"
    else:
        for section in sections:
            if section["title"] == "Sukarno’nun Kararlı Anti-Emperyalist ve AntiSömürgeci Duruşu":
                section["title"] = "Sukarno’nun Kararlı Anti-Emperyalist ve Anti-Sömürgeci Duruşu"
    data["sections"] = reindex(sections, locale)


def fix_akalin_en(data: dict) -> None:
    sections = deepcopy(data["sections"])
    asian = section_by_title(sections, "Asian Relations Conference in Delhi")
    misnamed_china = section_by_title(sections, "Indonesia’s Contributions")
    false_quote = section_by_title(
        sections,
        "China’s international political circumstances progressively enhanced following the Bandung meeting.",
    )

    zhou_tail = next((p for p in asian["paragraphs"] if p.startswith("2001). Zhou evaded")), None)
    china_normal = next(
        (p for p in asian["paragraphs"] if p.startswith("China’s international political circumstances")),
        None,
    )
    if not zhou_tail or not china_normal:
        raise RuntimeError("Akalın EN: expected China fragments were not found in Asian Relations section")
    asian["paragraphs"] = [p for p in asian["paragraphs"] if p not in {zhou_tail, china_normal}]

    if len(misnamed_china["paragraphs"]) < 2 or not false_quote["paragraphs"]:
        raise RuntimeError("Akalın EN: unexpected China section shape")
    zhou_full = join_boundary(misnamed_china["paragraphs"][1], false_quote["paragraphs"][0])
    zhou_full = join_boundary(zhou_full, zhou_tail)
    china = {
        "title": "China’s Contributions",
        "paragraphs": [misnamed_china["paragraphs"][0], zhou_full, china_normal],
        "level": "section",
    }
    indonesia_paras = false_quote["paragraphs"][1:]
    if not indonesia_paras or not indonesia_paras[0].startswith("Ahmet Sukarno"):
        raise RuntimeError("Akalın EN: Indonesia body boundary could not be verified")
    indonesia = {"title": "Indonesia’s Contributions", "paragraphs": indonesia_paras, "level": "section"}

    out: list[dict] = []
    for section in sections:
        if section is misnamed_china:
            out.extend([china, indonesia])
        elif section is false_quote:
            continue
        elif section.get("title") == "Involved States,":
            if not out or out[-1]["title"] != "Non-Alignement Movement After Bandung":
                raise RuntimeError("Akalın EN: Involved States fragment is not after NAM section")
            out[-1]["paragraphs"].append("Involved States,")
            out[-1]["paragraphs"].extend(section.get("paragraphs", []))
        else:
            out.append(section)

    data["sections"] = reindex(out, "en")


def fix_akalin_tr(data: dict) -> None:
    sections = deepcopy(data["sections"])
    china = section_by_title(sections, "Çin’in  Katkıları")
    false_quote = section_by_title(
        sections, "Bandung konferansından sonra Çin’in uluslararası siyasi durumu giderek iyileşti."
    )
    china["title"] = "Çin’in Katkıları"
    # The promoted pull-quote is already present as normal prose in this false section.
    china["paragraphs"].extend(false_quote.get("paragraphs", []))

    out: list[dict] = []
    for section in sections:
        if section is false_quote:
            continue
        if section.get("title") == "Bandung  Öncesi Uluslararası Ortam":
            section["title"] = "Bandung Öncesi Uluslararası Ortam"
        if section.get("title") == "Bandung  hakkında  Batılıların  Tavrı":
            section["title"] = "Bandung hakkında Batılıların Tavrı"
        out.append(section)
    data["sections"] = reindex(out, "tr")


def fix_akalin(data: dict, locale: str) -> None:
    if locale == "en":
        fix_akalin_en(data)
    else:
        fix_akalin_tr(data)


def make_parent(title: str) -> dict:
    return {"title": title, "paragraphs": [], "level": "section"}


def fix_fang(data: dict, locale: str) -> None:
    sections = deepcopy(data["sections"])
    if locale == "en":
        prep = section_by_title(sections, "Preparation for the Conference: The Indonesian Initiative and the Bogor Conference")
        citation = section_by_title(sections, "(Feng & Jin, 2003: 590).")
        outcome = section_by_title(sections, "Outcome of the Conference: The Ten Principles of Bandung")
        quote = section_by_title(
            sections,
            "The Bandung Conference represented an effort by New China to transition from “revolutionary diplomacy” to “national diplomacy” in its diplomatic strategic shift.",
        )
        # Citation fragment belongs to the final paragraph before it; the rest of that false
        # section is continuous preparation text.
        if prep["paragraphs"]:
            prep["paragraphs"][-1] = clean_space(prep["paragraphs"][-1] + " (Feng & Jin, 2003: 590).")
        prep["paragraphs"].extend(citation.get("paragraphs", []))
        # Pull-quote is duplicated by the ordinary body text inside the false section; only
        # its paragraphs belong under the Outcome section.
        outcome["paragraphs"].extend(quote.get("paragraphs", []))

        out: list[dict] = []
        inserted_before = False
        inserted_during = False
        for section in sections:
            if section in {citation, quote}:
                continue
            if section["title"] == "The historical logic of the “one-sided” diplomatic strategy" and not inserted_before:
                out.append(make_parent("Before the Bandung Conference: From “Leaning to One Side” to peaceful coexistence"))
                section["level"] = "subsection"
                inserted_before = True
            elif section["title"] == "One of the important manifestations of “Leaning to One Side”: The Korean War":
                section["level"] = "subsection"
            elif section["title"] == "The Proposal of the Five Principles of Peaceful Coexistence":
                section["level"] = "subsection"
            if section is prep and not inserted_during:
                out.append(make_parent("In the Bandung Conference: Exploration of New Diplomatic Routes"))
                section["level"] = "subsection"
                inserted_during = True
            elif section["title"] in {
                "Conference process: Zhou Enlai’s diplomatic practice",
                "Outcome of the Conference: The Ten Principles of Bandung",
            }:
                section["level"] = "subsection"
            out.append(section)
        if not inserted_before or not inserted_during:
            raise RuntimeError("Fang EN: failed to place verified parent headings")
    else:
        merged = section_by_title(
            sections,
            "Bandung Konferansı: Yeni Diplomatik Yolların Keşfi Konferans için Hazırlık: Endonezya Girişimi ve Bogor Konferansı",
        )
        merged["title"] = "Konferans için Hazırlık: Endonezya Girişimi ve Bogor Konferansı"
        merged["level"] = "subsection"
        out = []
        inserted_before = False
        for section in sections:
            if section["title"] == "“Tek taraflı” diplomatik stratejinin tarihsel mantığı" and not inserted_before:
                out.append(make_parent("Bandung Konferansı'ndan önce: “Tek Tarafa Yaslanmaktan” Barış İçinde Bir Arada Yaşamaya"))
                section["level"] = "subsection"
                inserted_before = True
            elif section["title"] in {
                "“Tek Tarafa Yaslanma”nın Önemli Örneklerinden Biri: Kore Savaşı",
                "Barış İçinde Bir Arada Yaşamanın Beş İlkesi Önerisi",
            }:
                section["level"] = "subsection"
            if section is merged:
                out.append(make_parent("Bandung Konferansı: Yeni Diplomatik Yolların Keşfi"))
            elif section["title"] in {
                "Konferans süreci: Zhou Enlai’nin diplomatik pratiği",
                "Konferansın Sonucu: Bandung’un On İlkesi",
            }:
                section["level"] = "subsection"
            out.append(section)
        if not inserted_before:
            raise RuntimeError("Fang TR: failed to place pre-Bandung parent heading")
    data["sections"] = reindex(out, locale)


def split_interview_en(data: dict) -> None:
    sections = data["sections"]
    first = section_by_title(
        sections,
        "What was the role of the Bandung Conference and the Non-Aligned Movement for the developing world in the post-World War II world geopolitical alignment?",
    )
    path = section_by_title(sections, "The Path of National States against Imperialism")
    final_question = section_by_title(sections, "What role should Turkey play in cooperation with developing countries?")

    dyn_index = next((i for i, p in enumerate(path["paragraphs"]) if p == "The Dynamics of Multipolarity: How Today Differs from Yesterday"), -1)
    if dyn_index < 2 or dyn_index + 2 >= len(path["paragraphs"]):
        raise RuntimeError("Interview EN: Dynamics boundary not found")
    path_question = path["paragraphs"][0]
    path_answer = path["paragraphs"][1:dyn_index]
    dyn_question = path["paragraphs"][dyn_index + 1]
    dyn_answer = path["paragraphs"][dyn_index + 2:]
    if not path_question.endswith("?") or not dyn_question.endswith("?"):
        raise RuntimeError("Interview EN: expected question text at verified boundaries")

    out = [
        {"title": first["title"], "paragraphs": first["paragraphs"], "level": "section"},
        make_parent("The Path of National States against Imperialism"),
        {"title": path_question, "paragraphs": path_answer, "level": "subsection"},
        make_parent("The Dynamics of Multipolarity: How Today Differs from Yesterday"),
        {"title": dyn_question, "paragraphs": dyn_answer, "level": "subsection"},
        make_parent("The Strategy Turkey Needs"),
        {"title": final_question["title"], "paragraphs": final_question["paragraphs"], "level": "subsection"},
    ]
    data["sections"] = reindex(out, "en")


def split_interview_tr(data: dict) -> None:
    sections = data["sections"]
    first = section_by_title(
        sections,
        "Bandung Konferansı ve Bağlantısızlar Hareketi’nin, İkinci Dünya savaşı sonrasındaki dünya jeopolitik saflaşmasında gelişen dünya açısından rolü ne olmuştur?",
    )
    pullquote = section_by_title(
        sections, "Bağlantısızlar Hareketi, milliyetçilik ve halkçılık ilkelerini birleştirmeyi amaçlayan bir yaklaşıma sahiptir."
    )
    path = section_by_title(sections, "Emperyalizme Karşı Milli Devletlerin Önündeki Yol")
    dynamics = section_by_title(sections, "Çok Kutupluluğun Dinamikleri ve Bugünün Dünden Farkı")
    final_question = section_by_title(sections, "Gelişen dünya ülkelerinin işbirliğinde Türkiye’nin rolü ne olmalı?")

    first_paras = list(first["paragraphs"])
    first_paras.extend(pullquote.get("paragraphs", []))
    if not path["paragraphs"] or not path["paragraphs"][0].endswith("?"):
        raise RuntimeError("Interview TR: Path question missing")
    if not dynamics["paragraphs"] or not dynamics["paragraphs"][0].endswith("?"):
        raise RuntimeError("Interview TR: Dynamics question missing")

    out = [
        {"title": first["title"], "paragraphs": first_paras, "level": "section"},
        make_parent("Emperyalizme Karşı Milli Devletlerin Önündeki Yol"),
        {"title": path["paragraphs"][0], "paragraphs": path["paragraphs"][1:], "level": "subsection"},
        make_parent("Çok Kutupluluğun Dinamikleri ve Bugünün Dünden Farkı"),
        {"title": dynamics["paragraphs"][0], "paragraphs": dynamics["paragraphs"][1:], "level": "subsection"},
        make_parent("Türkiye’nin İhtiyacı Olan Strateji"),
        {"title": final_question["title"], "paragraphs": final_question["paragraphs"], "level": "subsection"},
    ]
    data["sections"] = reindex(out, "tr")


def fix_interview(data: dict, locale: str) -> None:
    if locale == "en":
        split_interview_en(data)
    else:
        split_interview_tr(data)


def common_cleanup(data: dict, locale: str) -> None:
    remove_duplicated_figure_captions(data)
    data["sections"] = reindex(data.get("sections", []), locale)


def assert_no_residual_artifacts(slug: str, locale: str, data: dict) -> None:
    paragraphs = [p for s in data.get("sections", []) for p in s.get("paragraphs", [])]
    for paragraph in paragraphs:
        if PAGE_DUP_RE.fullmatch(paragraph):
            raise RuntimeError(f"{slug} {locale}: duplicated page number remains: {paragraph}")
        if paragraph == "EK FOTO B":
            raise RuntimeError(f"{slug} {locale}: EK FOTO B remains")
    for section in data.get("sections", []):
        paras = section.get("paragraphs", [])
        for left, right in zip(paras, paras[1:]):
            if BROKEN_END_RE.search(left) and LOWER_START_RE.match(right):
                raise RuntimeError(f"{slug} {locale}: broken boundary remains: {left[-40:]} | {right[:40]}")


def main() -> None:
    for slug in SUBSTANTIVE:
        for locale in ("en", "tr"):
            data = load(slug, locale)
            if slug == IRATNI:
                fix_iratni(data, locale)
            elif slug == INTERVIEW:
                fix_interview(data, locale)
            elif slug == ZHANG_DU:
                fix_zhang_du(data, locale)
            elif slug == AKALIN:
                fix_akalin(data, locale)
            elif slug == FANG:
                fix_fang(data, locale)
            # Gas-hydrates section detection is already source-faithful; only narrow
            # common cleanup is applied there.
            common_cleanup(data, locale)
            assert_no_residual_artifacts(slug, locale, data)
            save(slug, locale, data)
            print(slug, locale, "sections=", len(data.get("sections", [])), "paragraphs=", sum(len(s.get("paragraphs", [])) for s in data.get("sections", [])))


if __name__ == "__main__":
    main()
