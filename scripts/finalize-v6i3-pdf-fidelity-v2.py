#!/usr/bin/env python3
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

PAGE_DUP = re.compile(r"^(\d{3})\1$")
BROKEN_END = re.compile(r"[A-Za-zÇĞİÖŞÜçğıöşü]-$")
LOWER_START = re.compile(r"^[a-zçğıöşü]")


def path_for(slug: str, locale: str) -> Path:
    return ARTICLES / slug / "fulltext" / f"{locale}.json"


def load(slug: str, locale: str) -> dict:
    return json.loads(path_for(slug, locale).read_text(encoding="utf-8"))


def save(slug: str, locale: str, data: dict) -> None:
    path_for(slug, locale).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def space(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def join_boundary(left: str, right: str) -> str:
    left, right = space(left), space(right)
    if BROKEN_END.search(left) and LOWER_START.match(right):
        return left[:-1] + right
    return f"{left} {right}".strip()


def clean_paragraphs(paragraphs: list[str]) -> list[str]:
    out: list[str] = []
    for raw in paragraphs:
        text = space(raw)
        if not text or PAGE_DUP.fullmatch(text) or text == "EK FOTO B":
            continue
        if out and BROKEN_END.search(out[-1]) and LOWER_START.match(text):
            out[-1] = join_boundary(out[-1], text)
        else:
            out.append(text)
    return out


def exact_dedupe(sections: list[dict]) -> None:
    seen: set[str] = set()
    for section in sections:
        kept: list[str] = []
        for raw in section.get("paragraphs", []):
            text = space(raw)
            if len(text) >= 80 and text in seen:
                continue
            kept.append(text)
            if len(text) >= 80:
                seen.add(text)
        section["paragraphs"] = kept


def remove_exact_figure_caption_duplicates(data: dict) -> None:
    captions = {
        space(fig.get("caption", ""))
        for fig in data.get("figures", [])
        if len(space(fig.get("caption", ""))) >= 20
    }
    if not captions:
        return
    for section in data.get("sections", []):
        section["paragraphs"] = [p for p in section.get("paragraphs", []) if space(p) not in captions]


def reindex(data: dict, locale: str) -> None:
    for index, section in enumerate(data.get("sections", []), 1):
        section["id"] = f"{locale}-section-{index}"
        section.setdefault("level", "section")
        section["paragraphs"] = clean_paragraphs(section.get("paragraphs", []))
    exact_dedupe(data.get("sections", []))


def one(sections: list[dict], title: str) -> dict:
    found = [section for section in sections if section.get("title") == title]
    if len(found) != 1:
        raise RuntimeError(f"Expected one section {title!r}, found {len(found)}")
    return found[0]


def parent(title: str) -> dict:
    return {"id": "pending", "title": title, "paragraphs": [], "level": "section"}


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
    approved = set(allowed)
    corpus = "\n".join(p for s in data["sections"] for p in s.get("paragraphs", []))
    out: list[dict] = []
    for source in data["sections"]:
        section = deepcopy(source)
        title = space(section["title"])
        section["title"] = title
        if title in approved:
            out.append(section)
            continue
        if not out:
            raise RuntimeError(f"Iratni {locale}: false heading before first real section: {title}")
        if title.startswith("(") and title.endswith(").") and out[-1].get("paragraphs"):
            out[-1]["paragraphs"][-1] = space(out[-1]["paragraphs"][-1] + " " + title)
        elif title and title not in corpus:
            out[-1]["paragraphs"].append(title)
        out[-1]["paragraphs"].extend(section.get("paragraphs", []))
    if [s["title"] for s in out] != allowed:
        raise RuntimeError(f"Iratni {locale}: final headings do not match printed PDF")
    data["sections"] = out


def fix_zhang_du(data: dict, locale: str) -> None:
    if locale == "en":
        one(data["sections"], "Spirit")["title"] = (
            "The Transformation of Indonesian Diplomacy and its Contribution to Fostering the Bandung Spirit"
        )
        for section in data["sections"]:
            if section["title"] == "Sukarno’s Firm Anti-Imperialist and AntiColonialist Stance":
                section["title"] = "Sukarno’s Firm Anti-Imperialist and Anti-Colonialist Stance"
    else:
        for section in data["sections"]:
            if section["title"] == "Sukarno’nun Kararlı Anti-Emperyalist ve AntiSömürgeci Duruşu":
                section["title"] = "Sukarno’nun Kararlı Anti-Emperyalist ve Anti-Sömürgeci Duruşu"


def fix_akalin_en(data: dict) -> None:
    sections = deepcopy(data["sections"])
    asian = one(sections, "Asian Relations Conference in Delhi")
    china_misnamed = one(sections, "Indonesia’s Contributions")
    false_pullquote = one(
        sections,
        "China’s international political circumstances progressively enhanced following the Bandung meeting.",
    )
    zhou_tail = next((p for p in asian["paragraphs"] if p.startswith("2001). Zhou evaded")), None)
    china_context = next((p for p in asian["paragraphs"] if p.startswith("China’s international political circumstances")), None)
    if not zhou_tail or not china_context or len(china_misnamed["paragraphs"]) < 2 or not false_pullquote["paragraphs"]:
        raise RuntimeError("Akalın EN: verified China fragments not found")
    asian["paragraphs"] = [p for p in asian["paragraphs"] if p not in {zhou_tail, china_context}]
    zhou = join_boundary(china_misnamed["paragraphs"][1], false_pullquote["paragraphs"][0])
    zhou = join_boundary(zhou, zhou_tail)
    china = {
        "id": "pending",
        "title": "China’s Contributions",
        "paragraphs": [china_misnamed["paragraphs"][0], zhou, china_context],
        "level": "section",
    }
    indonesia_paras = false_pullquote["paragraphs"][1:]
    if not indonesia_paras or not indonesia_paras[0].startswith("Ahmet Sukarno"):
        raise RuntimeError("Akalın EN: verified Indonesia boundary not found")
    indonesia = {
        "id": "pending",
        "title": "Indonesia’s Contributions",
        "paragraphs": indonesia_paras,
        "level": "section",
    }
    out: list[dict] = []
    for section in sections:
        if section is china_misnamed:
            out.extend([china, indonesia])
            continue
        if section is false_pullquote:
            continue
        if section.get("title") == "Involved States,":
            if not out or out[-1].get("title") != "Non-Alignement Movement After Bandung":
                raise RuntimeError("Akalın EN: Involved States fragment out of place")
            out[-1]["paragraphs"].append("Involved States,")
            out[-1]["paragraphs"].extend(section.get("paragraphs", []))
            continue
        out.append(section)
    data["sections"] = out


def fix_akalin_tr(data: dict) -> None:
    sections = deepcopy(data["sections"])
    china = one(sections, "Çin’in  Katkıları")
    false_pullquote = one(sections, "Bandung konferansından sonra Çin’in uluslararası siyasi durumu giderek iyileşti.")
    china["title"] = "Çin’in Katkıları"
    china["paragraphs"].extend(false_pullquote.get("paragraphs", []))
    out = []
    for section in sections:
        if section is false_pullquote:
            continue
        if section["title"] == "Bandung  Öncesi Uluslararası Ortam":
            section["title"] = "Bandung Öncesi Uluslararası Ortam"
        if section["title"] == "Bandung  hakkında  Batılıların  Tavrı":
            section["title"] = "Bandung hakkında Batılıların Tavrı"
        out.append(section)
    data["sections"] = out


def fix_akalin(data: dict, locale: str) -> None:
    fix_akalin_en(data) if locale == "en" else fix_akalin_tr(data)


def fix_fang_en(data: dict) -> None:
    sections = deepcopy(data["sections"])
    prep = one(sections, "Preparation for the Conference: The Indonesian Initiative and the Bogor Conference")
    citation = one(sections, "(Feng & Jin, 2003: 590).")
    outcome = one(sections, "Outcome of the Conference: The Ten Principles of Bandung")
    pullquote = one(
        sections,
        "The Bandung Conference represented an effort by New China to transition from “revolutionary diplomacy” to “national diplomacy” in its diplomatic strategic shift.",
    )
    if prep["paragraphs"]:
        prep["paragraphs"][-1] = space(prep["paragraphs"][-1] + " (Feng & Jin, 2003: 590).")
    prep["paragraphs"].extend(citation.get("paragraphs", []))
    outcome["paragraphs"].extend(pullquote.get("paragraphs", []))

    out: list[dict] = []
    before_added = during_added = False
    for section in sections:
        if section is citation or section is pullquote:
            continue
        title = section["title"]
        if title == "The historical logic of the “one-sided” diplomatic strategy":
            out.append(parent("Before the Bandung Conference: From “Leaning to One Side” to peaceful coexistence"))
            section["level"] = "subsection"
            before_added = True
        elif title in {
            "One of the important manifestations of “Leaning to One Side”: The Korean War",
            "The Proposal of the Five Principles of Peaceful Coexistence",
        }:
            section["level"] = "subsection"
        if section is prep:
            out.append(parent("In the Bandung Conference: Exploration of New Diplomatic Routes"))
            section["level"] = "subsection"
            during_added = True
        elif title in {"Conference process: Zhou Enlai’s diplomatic practice", "Outcome of the Conference: The Ten Principles of Bandung"}:
            section["level"] = "subsection"
        out.append(section)
    if not before_added or not during_added:
        raise RuntimeError("Fang EN: parent heading placement failed")
    data["sections"] = out


def fix_fang_tr(data: dict) -> None:
    sections = deepcopy(data["sections"])
    merged = one(
        sections,
        "Bandung Konferansı: Yeni Diplomatik Yolların Keşfi Konferans için Hazırlık: Endonezya Girişimi ve Bogor Konferansı",
    )
    merged["title"] = "Konferans için Hazırlık: Endonezya Girişimi ve Bogor Konferansı"
    merged["level"] = "subsection"
    out: list[dict] = []
    before_added = during_added = False
    for section in sections:
        title = section["title"]
        if title == "“Tek taraflı” diplomatik stratejinin tarihsel mantığı":
            out.append(parent("Bandung Konferansı'ndan önce: “Tek Tarafa Yaslanmaktan” Barış İçinde Bir Arada Yaşamaya"))
            section["level"] = "subsection"
            before_added = True
        elif title in {
            "“Tek Tarafa Yaslanma”nın Önemli Örneklerinden Biri: Kore Savaşı",
            "Barış İçinde Bir Arada Yaşamanın Beş İlkesi Önerisi",
        }:
            section["level"] = "subsection"
        if section is merged:
            out.append(parent("Bandung Konferansı: Yeni Diplomatik Yolların Keşfi"))
            during_added = True
        elif title in {"Konferans süreci: Zhou Enlai’nin diplomatik pratiği", "Konferansın Sonucu: Bandung’un On İlkesi"}:
            section["level"] = "subsection"
        out.append(section)
    if not before_added or not during_added:
        raise RuntimeError("Fang TR: parent heading placement failed")
    data["sections"] = out


def fix_fang(data: dict, locale: str) -> None:
    fix_fang_en(data) if locale == "en" else fix_fang_tr(data)


def fix_interview_en(data: dict) -> None:
    sections = data["sections"]
    first = one(sections, "What was the role of the Bandung Conference and the Non-Aligned Movement for the developing world in the post-World War II world geopolitical alignment?")
    path = one(sections, "The Path of National States against Imperialism")
    final = one(sections, "What role should Turkey play in cooperation with developing countries?")
    split = next((i for i, p in enumerate(path["paragraphs"]) if p == "The Dynamics of Multipolarity: How Today Differs from Yesterday"), -1)
    if split < 2 or split + 2 >= len(path["paragraphs"]):
        raise RuntimeError("Interview EN: Dynamics marker missing")
    q_path = path["paragraphs"][0]
    q_dyn = path["paragraphs"][split + 1]
    if not q_path.endswith("?") or not q_dyn.endswith("?"):
        raise RuntimeError("Interview EN: verified questions missing")
    data["sections"] = [
        {"id": "pending", "title": first["title"], "paragraphs": first["paragraphs"], "level": "section"},
        parent("The Path of National States against Imperialism"),
        {"id": "pending", "title": q_path, "paragraphs": path["paragraphs"][1:split], "level": "subsection"},
        parent("The Dynamics of Multipolarity: How Today Differs from Yesterday"),
        {"id": "pending", "title": q_dyn, "paragraphs": path["paragraphs"][split + 2:], "level": "subsection"},
        parent("The Strategy Turkey Needs"),
        {"id": "pending", "title": final["title"], "paragraphs": final["paragraphs"], "level": "subsection"},
    ]


def fix_interview_tr(data: dict) -> None:
    sections = data["sections"]
    first = one(sections, "Bandung Konferansı ve Bağlantısızlar Hareketi’nin, İkinci Dünya savaşı sonrasındaki dünya jeopolitik saflaşmasında gelişen dünya açısından rolü ne olmuştur?")
    pullquote = one(sections, "Bağlantısızlar Hareketi, milliyetçilik ve halkçılık ilkelerini birleştirmeyi amaçlayan bir yaklaşıma sahiptir.")
    path = one(sections, "Emperyalizme Karşı Milli Devletlerin Önündeki Yol")
    dynamics = one(sections, "Çok Kutupluluğun Dinamikleri ve Bugünün Dünden Farkı")
    final = one(sections, "Gelişen dünya ülkelerinin işbirliğinde Türkiye’nin rolü ne olmalı?")
    if not path["paragraphs"] or not path["paragraphs"][0].endswith("?"):
        raise RuntimeError("Interview TR: Path question missing")
    if not dynamics["paragraphs"] or not dynamics["paragraphs"][0].endswith("?"):
        raise RuntimeError("Interview TR: Dynamics question missing")
    first_paras = list(first["paragraphs"]) + list(pullquote.get("paragraphs", []))
    data["sections"] = [
        {"id": "pending", "title": first["title"], "paragraphs": first_paras, "level": "section"},
        parent("Emperyalizme Karşı Milli Devletlerin Önündeki Yol"),
        {"id": "pending", "title": path["paragraphs"][0], "paragraphs": path["paragraphs"][1:], "level": "subsection"},
        parent("Çok Kutupluluğun Dinamikleri ve Bugünün Dünden Farkı"),
        {"id": "pending", "title": dynamics["paragraphs"][0], "paragraphs": dynamics["paragraphs"][1:], "level": "subsection"},
        parent("Türkiye’nin İhtiyacı Olan Strateji"),
        {"id": "pending", "title": final["title"], "paragraphs": final["paragraphs"], "level": "subsection"},
    ]


def fix_interview(data: dict, locale: str) -> None:
    fix_interview_en(data) if locale == "en" else fix_interview_tr(data)


def final_cleanup(data: dict, locale: str) -> None:
    remove_exact_figure_caption_duplicates(data)
    reindex(data, locale)
    paragraphs = [p for s in data.get("sections", []) for p in s.get("paragraphs", [])]
    if any(PAGE_DUP.fullmatch(p) for p in paragraphs):
        raise RuntimeError(f"{locale}: repeated page number remains")
    if "EK FOTO B" in paragraphs:
        raise RuntimeError(f"{locale}: EK FOTO B remains")
    for section in data.get("sections", []):
        for left, right in zip(section.get("paragraphs", []), section.get("paragraphs", [])[1:]):
            if BROKEN_END.search(left) and LOWER_START.match(right):
                raise RuntimeError(f"{locale}: broken word boundary remains: {left[-30:]} | {right[:30]}")


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
            # Gas hydrate headings already match the printed PDF; only conservative cleanup.
            final_cleanup(data, locale)
            save(slug, locale, data)
            print(
                slug,
                locale,
                "sections=", len(data.get("sections", [])),
                "paragraphs=", sum(len(s.get("paragraphs", [])) for s in data.get("sections", [])),
            )


if __name__ == "__main__":
    main()
