#!/usr/bin/env python3
import json, re, shutil, urllib.request
from pathlib import Path

import pymupdf
import pymupdf4llm

ROOT = Path(__file__).resolve().parents[1]
ISSUE = json.loads((ROOT / "content/issues/v06-i03.json").read_text())
SLUGS = ISSUE["articles"]
TMP = ROOT / "tmp/v6i3-migration"
TMP.mkdir(parents=True, exist_ok=True)

RESEARCH = {
    "cezayir-devrimci-diplomasisi-bandung-temel-girisiminden-yeni-bir-baglantisizlar-konseptine",
    "endonezya-dis-politikasinda-bandung-mirasina-yeniden-bakis-tarihsel-bir-inceleme-ve-guncel",
    "bandung-ruhu-70-yasinda",
    "bandung-konferansi-oncesi-ve-sonrasinda-yeni-cinin-dis-politikasi-bandung-konferansini-yeniden",
    "yeni-bir-enerji-kaynagi-olarak-gaz-hidratlar",
}
INTERVIEW = "70-yilinda-bandung-baglantisizliktan-hegemonyaciliga-karsi-milli-devletlerin-ortak-kalkinma-ve"
POEMS = {"sahte-siir", "39-harbi"}
VISUALS = {"china-reconstructs", "hendra-gunawan", "endonezya-posta-pulu"}

KNOWN_KEYWORDS = {
    "cezayir-devrimci-diplomasisi-bandung-temel-girisiminden-yeni-bir-baglantisizlar-konseptine": {
        "en": ["Algeria", "liberation movements", "New International Economic Order", "nonalignment", "revolutionary diplomacy"],
        "tr": ["Bağlantısızlar Hareketi", "Cezayir", "devrimci diplomasi", "kurtuluş hareketleri", "Yeni Uluslararası Ekonomik Düzen"],
    },
    "endonezya-dis-politikasinda-bandung-mirasina-yeniden-bakis-tarihsel-bir-inceleme-ve-guncel": {
        "en": ["Anti-Colonial Movement", "Bandung Conference", "Bandung Spirit", "Indonesia", "Southeast Asia"],
        "tr": ["Bandung Konferansı", "Bandung Ruhu", "Endonezya", "Güneydoğu Asya", "Sömürgecilik Karşıtı Hareket"],
    },
    "bandung-ruhu-70-yasinda": {
        "en": ["imperialism", "non-alignment", "Non-Aligned Movement", "right of nation to self-determination", "struggle against colonialism"],
        "tr": ["Bağlantısızlık", "Bağlantısızlar Hareketi", "emperyalizm", "sömürgeciliğe karşı mücadele", "kendi kaderini tayin hakkı"],
    },
    "bandung-konferansi-oncesi-ve-sonrasinda-yeni-cinin-dis-politikasi-bandung-konferansini-yeniden": {
        "en": ["Bandung Conference", "Asian and African countries", "New China’s diplomacy", "Leaning to One Side policy", "Peaceful coexistence", "Third World Theory"],
        "tr": ["Bandung Konferansı", "Asya ve Afrika ülkeleri", "Yeni Çin diplomasisi", "Tek Tarafa Yaslanma politikası", "Barış içinde bir arada yaşama", "Üç Dünya Teorisi"],
    },
}

NOISE = [
    re.compile(r"^\d{1,4}$"), re.compile(r"^B\s*R\s*I\s*[Qq]"),
    re.compile(r"^(?:Peer-Reviewed|Hakemli)\b", re.I),
    re.compile(r"^(?:RÖPORTAJ|INTERVIEW|POEM|ŞİİR|RESİM|PAINTING|AFİŞ|POSTER|FOTOĞRAF|PHOTOGRAPH)$", re.I),
]


def load_meta(slug):
    path = ROOT / "content/articles" / slug / "metadata.json"
    return path, json.loads(path.read_text())


def download(url, path):
    if path.exists() and path.stat().st_size > 1000:
        return
    urllib.request.urlretrieve(url, path)


def strip_markup(value):
    value = re.sub(r"<!--.*?-->", " ", value, flags=re.S)
    value = re.sub(r"<[^>]+>", " ", value)
    value = value.replace("**", "").replace("__", "").replace("~~", "")
    value = re.sub(r"(?<!\*)\*(?!\*)", "", value)
    value = re.sub(r"(?<!_)_(?!_)", "", value)
    value = re.sub(r"!\[[^\]]*\]\([^)]*\)", " ", value)
    value = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", value)
    return value.strip()


def join_lines(lines):
    out = ""
    for raw in lines:
        part = strip_markup(raw).strip()
        if not part:
            continue
        if out and re.search(r"[-‐‑]$", out) and re.match(r"^[a-zçğıöşü]", part):
            out = out[:-1] + part
        else:
            out = f"{out} {part}".strip()
    return re.sub(r"\s+", " ", out).strip()


def norm_heading(value):
    return re.sub(r"\s+", " ", strip_markup(value)).strip(" .:–—-").casefold()


def is_noise(text, title=None):
    t = strip_markup(text).strip()
    if not t:
        return True
    if any(p.search(t) for p in NOISE):
        return True
    if title and len(t) > 24 and (t in title or title in t):
        return True
    if re.search(r"\b(?:Cilt|Volume)\s+6\s+(?:Sayı|Issue)\s+3\b", t, re.I):
        return True
    return False


def markdown_blocks(md):
    blocks, buf = [], []
    def flush():
        nonlocal buf
        if buf:
            txt = join_lines(buf)
            if txt:
                blocks.append(("p", txt))
        buf = []
    for raw in md.splitlines():
        line = raw.rstrip()
        h = re.match(r"^\s*(#{1,6})\s+(.*)$", line)
        if h:
            flush(); blocks.append(("h", strip_markup(h.group(2)))); continue
        if not line.strip():
            flush(); continue
        if line.lstrip().startswith("- "):
            flush(); blocks.append(("li", join_lines([line.lstrip()[2:]]))); continue
        buf.append(line)
    flush()
    return blocks


def extract_abstract(md, locale, slug):
    if slug == INTERVIEW:
        blocks = markdown_blocks(md)
        for kind, text in blocks:
            if kind == "p" and len(text) > 500 and ("Bandung" in text) and not text.startswith(("Atıf:", "How to cite:")):
                return text
        return None
    label = "ÖZ" if locale == "tr" else "ABSTRACT"
    key = "Anahtar Kelimeler" if locale == "tr" else "Keywords"
    pattern = rf"#+\s*\*{{0,2}}{re.escape(label)}\*{{0,2}}\s*(.*?)(?=\*\*{re.escape(key)}\s*:|{re.escape(key)}\s*:|\n#+)"
    m = re.search(pattern, md, re.S | re.I)
    if not m:
        return None
    return join_lines(m.group(1).splitlines())


def extract_keywords(md, locale):
    label = "Anahtar Kelimeler" if locale == "tr" else "Keywords"
    m = re.search(rf"\*\*{re.escape(label)}\s*:\*\*\s*([^\n]+(?:\n(?!\s*#)[^\n]+)?)", md, re.I)
    if not m:
        m = re.search(rf"{re.escape(label)}\s*:\s*([^\n]+)", md, re.I)
    if not m:
        return []
    value = join_lines(m.group(1).splitlines()).rstrip(".")
    return [x.strip() for x in re.split(r",\s*", value) if 1 < len(x.strip()) < 100]


def body_start(blocks, locale, slug):
    if slug in RESEARCH:
        targets = {"giriş", "introduction"}
        for i, (kind, text) in enumerate(blocks):
            if kind == "h" and norm_heading(text) in targets:
                return i
        # Fallback: first plausible section heading after abstract/keywords.
        for i, (kind, text) in enumerate(blocks):
            if kind == "h" and norm_heading(text) not in {"öz", "abstract"} and i > 4:
                if len(text) < 110:
                    return i
    if slug == INTERVIEW:
        for i, (kind, text) in enumerate(blocks):
            if kind == "h" and ("answered the questions" in text.lower() or "sorularını" in text.lower()):
                return i + 1
        return 0
    if slug in POEMS:
        for i, (kind, text) in enumerate(blocks):
            if kind == "h" and norm_heading(text) in {"poem", "şiir"}:
                return i + 1
        return max(0, len(blocks)//2)
    return 0


def parse_fulltext(md, locale, slug, meta):
    if slug in VISUALS:
        return [], [], [], ""
    blocks = markdown_blocks(md)
    start = body_start(blocks, locale, slug)
    end = len(blocks)
    refs_at = ack_at = notes_at = None
    for i in range(start, len(blocks)):
        kind, text = blocks[i]
        if kind != "h": continue
        h = norm_heading(text)
        if h in {"references", "kaynakça"} and refs_at is None:
            refs_at = i; end = min(end, i)
        elif h in {"acknowledgments", "acknowledgements", "teşekkür"} and ack_at is None:
            ack_at = i; end = min(end, i)
        elif h in {"notes", "notlar"} and notes_at is None:
            notes_at = i; end = min(end, i)
    body = blocks[start:end]
    sections, current = [], None
    generic = "Tam metin" if locale == "tr" else "Full text"
    for kind, text in body:
        if is_noise(text, meta["title"].get(locale, "")):
            continue
        # Fully emphasized interview questions often arrive as paragraphs.
        question = slug == INTERVIEW and kind == "p" and text.endswith("?") and len(text) < 280
        if kind == "h" or question:
            if current and current["paragraphs"]:
                sections.append(current)
            current = {"title": text, "paragraphs": []}
        else:
            if text.startswith(("Atıf:", "How to cite:", "Geliş Tarihi:", "Received:")):
                continue
            if current is None:
                current = {"title": generic, "paragraphs": []}
            if len(text) > 1:
                current["paragraphs"].append(text)
    if current and current["paragraphs"]:
        sections.append(current)
    sections = [
        {"id": f"{locale}-section-{i+1}", "title": s["title"], "paragraphs": s["paragraphs"]}
        for i, s in enumerate(sections)
    ]
    refs = []
    if refs_at is not None:
        stop = len(blocks)
        candidates = [x for x in (ack_at, notes_at) if x is not None and x > refs_at]
        if candidates: stop = min(candidates)
        for kind, text in blocks[refs_at+1:stop]:
            if is_noise(text): continue
            if kind in {"li", "p"} and len(text) > 8:
                # Join obvious continuation fragments produced by column/page breaks.
                if refs and (len(text.split()) < 7 and not re.search(r"(?:19|20)\d{2}|n\.d\.|t\.y\.", text, re.I)):
                    refs[-1]["text"] += " " + text
                else:
                    refs.append({"id": f"ref-{len(refs)+1}", "text": text})
    notes = []
    if notes_at is not None:
        stop = min([x for x in (refs_at, ack_at) if x is not None and x > notes_at] or [len(blocks)])
        note_text = " ".join(t for _, t in blocks[notes_at+1:stop])
        starts = list(re.finditer(r"(?:^|\s)(\d{1,2})\s+(?=[A-ZÇĞİÖŞÜ])", note_text))
        for j, m in enumerate(starts):
            txt = note_text[m.end():starts[j+1].start() if j+1 < len(starts) else len(note_text)].strip()
            notes.append({"id": m.group(1), "text": txt})
    ack = ""
    if ack_at is not None and slug != "endonezya-dis-politikasinda-bandung-mirasina-yeniden-bakis-tarihsel-bir-inceleme-ve-guncel":
        stop = min([x for x in (refs_at, notes_at) if x is not None and x > ack_at] or [len(blocks)])
        ack = " ".join(t for k, t in blocks[ack_at+1:stop] if k != "h").strip()
    return sections, refs, notes, ack


def captions_from_md(md, locale):
    candidates = []
    for kind, text in markdown_blocks(md):
        if kind == "h": continue
        t = text.strip()
        if (re.match(r"^(?:Tablo|Table|Şekil|Figure)\s*\d+", t, re.I)
            or re.search(r"\((?:Fotoğraf|Photograph|Photo|Görsel|Visual|Kaynak|Source)\s*:", t, re.I)):
            if 8 < len(t) < 700 and t not in candidates:
                candidates.append(t)
    return candidates


def extract_images(pdf_path, slug):
    doc = pymupdf.open(pdf_path)
    outdir = ROOT / "public/assets/article-figures" / slug
    if outdir.exists(): shutil.rmtree(outdir)
    outdir.mkdir(parents=True, exist_ok=True)
    seen, paths = set(), []
    for page in doc:
        for img in page.get_images(full=True):
            xref = img[0]
            if xref in seen: continue
            seen.add(xref)
            info = doc.extract_image(xref)
            w, h = info["width"], info["height"]
            if w < 380 or h < 240: continue
            pix = pymupdf.Pixmap(doc, xref)
            if pix.n - pix.alpha > 3:
                pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
            filename = f"figure-{len(paths)+1:02d}.jpg"
            target = outdir / filename
            pix.save(target, jpg_quality=88)
            paths.append(f"/assets/article-figures/{slug}/{filename}")
    if not paths:
        shutil.rmtree(outdir, ignore_errors=True)
    return paths


def update_metadata(slug, meta, extracted):
    for locale in ("en", "tr"):
        abstract = extracted[locale].get("abstract")
        if abstract and len(abstract) > 80 and meta.get("abstract") is not None:
            meta.setdefault("abstract", {})[locale] = abstract
        kws = KNOWN_KEYWORDS.get(slug, {}).get(locale) or extracted[locale].get("keywords") or []
        if kws:
            meta.setdefault("keywords", {})[locale] = kws
    if slug == "cezayir-devrimci-diplomasisi-bandung-temel-girisiminden-yeni-bir-baglantisizlar-konseptine":
        meta["authors"][0]["affiliations"] = [{
            "name": "University of Algiers 3", "nameTr": "Cezayir Üniversitesi 3",
            "nameEn": "University of Algiers 3", "country": "Algeria", "ror": None,
        }]
    if slug == "endonezya-dis-politikasinda-bandung-mirasina-yeniden-bakis-tarihsel-bir-inceleme-ve-guncel":
        meta["title"]["en"] = "Revisiting the Bandung Legacy in Indonesian Foreign Policy: A Historical Review and Its Contemporary Implications"
        meta["authors"][0]["orcid"] = "https://orcid.org/0009-0000-8505-0741"
        meta["authors"][1]["orcid"] = "https://orcid.org/0009-0005-8912-1670"
        meta["authors"][0]["affiliations"] = [{
            "name": "Department of Political Science, Shanghai University", "nameTr": "Siyaset Bilimi Bölümü, Şanghay Üniversitesi",
            "nameEn": "Department of Political Science, Shanghai University", "country": "China", "ror": None,
        }]
        meta["authors"][1]["affiliations"] = [{
            "name": "Department of History, Shanghai University", "nameTr": "Tarih Bölümü, Şanghay Üniversitesi",
            "nameEn": "Department of History, Shanghai University", "country": "China", "ror": None,
        }]
        meta["funding"] = {
            "statement": {
                "en": "This article is supported by funding from the “National Social Science Foundation Youth Program” (21CGJ037).",
                "tr": "Bu makale “Ulusal Sosyal Bilimler Vakfı Gençlik Programı” (21CGJ037) tarafından desteklenmektedir.",
            },
            "funders": [{
                "name": "National Social Science Foundation Youth Program",
                "nameTr": "Ulusal Sosyal Bilimler Vakfı Gençlik Programı",
                "nameEn": "National Social Science Foundation Youth Program",
                "ror": None,
                "awardNumbers": ["21CGJ037"],
            }],
        }
        meta["acknowledgements"] = None
    return meta


def main():
    catalog_path = ROOT / "content/catalog.json"
    catalog = json.loads(catalog_path.read_text())
    generated = {}
    for slug in SLUGS:
        meta_path, meta = load_meta(slug)
        extracted = {}
        pdf_paths = {}
        for locale, key in (("en", "pdfEn"), ("tr", "pdfTr")):
            url = meta.get("urls", {}).get(key)
            if not url: raise RuntimeError(f"Missing {key} for {slug}")
            pdf = TMP / f"{slug}-{locale}.pdf"
            download(url, pdf); pdf_paths[locale] = pdf
            md = pymupdf4llm.to_markdown(str(pdf), write_images=False, ignore_images=False)
            abstract = extract_abstract(md, locale, slug)
            keywords = extract_keywords(md, locale)
            sections, refs, notes, ack = parse_fulltext(md, locale, slug, meta)
            extracted[locale] = {
                "md": md, "abstract": abstract, "keywords": keywords,
                "sections": sections, "references": refs, "footnotes": notes,
                "acknowledgements": ack, "captions": captions_from_md(md, locale),
            }
        image_paths = extract_images(pdf_paths["tr"], slug)
        meta = update_metadata(slug, meta, extracted)
        meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n")
        for locale in ("en", "tr"):
            captions = extracted[locale]["captions"]
            figures = []
            for i, src in enumerate(image_paths):
                fallback = meta["title"].get(locale) or ("Görsel" if locale == "tr" else "Visual")
                figures.append({"id": f"figure-{i+1}", "src": src, "caption": captions[i] if i < len(captions) else fallback})
            record = {
                "sections": extracted[locale]["sections"],
                "keywords": meta.get("keywords", {}).get(locale, []),
                "footnotes": extracted[locale]["footnotes"],
                "references": extracted[locale]["references"],
                "acknowledgements": extracted[locale]["acknowledgements"],
                "figures": figures,
            }
            if slug == "endonezya-dis-politikasinda-bandung-mirasina-yeniden-bakis-tarihsel-bir-inceleme-ve-guncel":
                record["declarations"] = {"funding": meta["funding"]["statement"][locale]}
            out = ROOT / "content/articles" / slug / "fulltext" / f"{locale}.json"
            out.write_text(json.dumps(record, ensure_ascii=False, indent=2) + "\n")
        legacy = ROOT / "content/articles" / slug / "fulltext" / "en-archive.json"
        if legacy.exists(): legacy.unlink()
        current = ROOT / "content/articles" / slug / "fulltext" / "current.json"
        if current.exists(): current.unlink()
        generated[slug] = {loc: {k: (len(v) if isinstance(v, list) else bool(v)) for k,v in extracted[loc].items() if k not in {"md","captions"}} for loc in ("en","tr")}
    localized = [x for x in catalog["fulltext"].get("localized", []) if x not in SLUGS]
    localized.extend(SLUGS)
    order = {slug:i for i,slug in enumerate(catalog["article_order"])}
    catalog["fulltext"]["localized"] = sorted(set(localized), key=lambda x: order[x])
    for key in ("current", "en_archive"):
        catalog["fulltext"][key] = [x for x in catalog["fulltext"].get(key, []) if x not in SLUGS]
    catalog_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps(generated, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
