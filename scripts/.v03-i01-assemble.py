#!/usr/bin/env python3
from __future__ import annotations
import ast
import hashlib
import html
import json
import re
import shutil
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

REPO = Path(sys.argv[1]).resolve()
EVIDENCE = REPO / ".migration" / "v03-i01-evidence"
IMG_EN = Path(sys.argv[2]).resolve()
IMG_TR = Path(sys.argv[3]).resolve()

RECORDS = [
    {"slug":"karsilikli-saygi-ve-dostluga-dayali-turk-cin-iliskilerinin-son-yarim-yuzyili-ve-gelecegi","pages":(8,11)},
    {"slug":"cin-ve-turkiyenin-diplomatik-iliskilerinin-kurulusunun-50-yildonumunde-kusak-ve-yol-isbirligi-yeni","pages":(14,16)},
    {"slug":"cin-ve-turkiye-imajlarinin-karsilikli-insasi-algilar-sorunlar-ve-politika-onerileri","pages":(18,26)},
    {"slug":"iki-cumhuriyet-arasinda-etkilesim-turkiye-cumhuriyeti-ile-cin-cumhuriyeti-iliskileri-1923-1949","pages":(28,40)},
    {"slug":"mustafa-kemal-ataturkun-halkcilik-ve-devletcilik-ilkesi-sun-yat-senin-siyasi-dusuncesiyle","pages":(42,50)},
    {"slug":"turkiye-cumhuriyeti-ile-cin-halk-cumhuriyeti-arasinda-diplomatik-iliskilerin-kurulmasi-1960-1971","pages":(52,74)},
    {"slug":"sinoloji-ve-cin-arastirmalari-sempozyumu-turkiyede-cin-arastirmalarinin-yeni-birlestirici","pages":(77,83)},
    {"slug":"insanligin-ortak-gelecegini-sporla-kurmak-2022-kis-olimpiyatlarina-dogru","pages":(84,86)},
    {"slug":"bin-okur-bin-hamlet-bir-cinli-akademisyenin-kusak-ve-yol-girisimi-hakkindaki-10-onemli-soruya","pages":(87,90)},
]
EDITORIAL = "diplomatik-iliskilerin-50-yilinda-ortaya-cikan-gercek-cin-ve-turkiye-birlikte-yukselecek"
POEM = "beklenen-cagri-bir-kusak-bir-yol-senfonisi"
VISUALS = [
    ("resim-kayihan-keskinok", 94),
    ("fotograf-sitki-rifat", 95),
    ("rifat-mutlu-tek-disi-kalmis-canavar", 96),
]
ALL_SLUGS = [EDITORIAL] + [r["slug"] for r in RECORDS[:6]] + [POEM] + [r["slug"] for r in RECORDS[6:]] + [v[0] for v in VISUALS]

# Exact embedded image-object numbers from pdfimages -list on the authoritative issue PDFs.
FIGURES = {
 "en": {
   RECORDS[2]["slug"]:[(19,27),(21,28),(23,29)],
   RECORDS[3]["slug"]:[(29,31),(31,32),(33,33),(35,34),(38,35)],
   RECORDS[4]["slug"]:[(43,37),(43,38),(45,39),(47,40)],
   RECORDS[5]["slug"]:[(53,42),(55,43),(59,44),(63,45),(69,46)],
   RECORDS[6]["slug"]:[(78,50),(79,51),(80,52),(81,53)],
   RECORDS[7]["slug"]:[(85,55)],
   RECORDS[8]["slug"]:[(87,57)],
   VISUALS[0][0]:[(94,67)],
   VISUALS[1][0]:[(95,69)],
   VISUALS[2][0]:[(96,71)],
 },
 "tr": {
   RECORDS[2]["slug"]:[(19,26),(21,27),(23,28)],
   RECORDS[3]["slug"]:[(29,30),(31,31),(33,32),(35,33)],
   RECORDS[4]["slug"]:[(43,35),(43,36),(45,37),(47,38)],
   RECORDS[5]["slug"]:[(53,40),(55,41),(59,42),(64,43),(69,44)],
   RECORDS[6]["slug"]:[(78,47),(79,48),(80,49),(81,50)],
   RECORDS[7]["slug"]:[(85,52)],
   RECORDS[8]["slug"]:[(87,53)],
   VISUALS[0][0]:[(94,63)],
   VISUALS[1][0]:[(95,66)],
   VISUALS[2][0]:[(96,67)],
 }
}

PREFIX_KEEP = {
 "state","people","well","self","long","short","middle","multi","non","post","pre","pro","anti","co",
 "socio","geo","nation","cross","inter","intra","one","two","three","four","five","six","seven","eight",
 "nine","ten","twenty","twenty-first","twentieth","world","high","low","full","part","sub","semi","quasi",
 "foreign","people-to","face-to","country","market","value","policy","decision","peace","human","Chinese",
 "Turkish","Sino","national","social","economic","political","cultural","Belt","Road"
}

def normspace(s):
    return re.sub(r"\s+", " ", html.unescape(s or "")).strip()

def join_piece(a, b, lang, refs=False):
    a, b = a.rstrip(), b.lstrip()
    if not a: return b
    if not b: return a
    if a.endswith("-"):
        tok = re.split(r"\s+", a[:-1])[-1].strip("“”‘’'\"()[]{}.,;:").lower()
        if refs or (b and b[0].isupper()) or tok in {x.lower() for x in PREFIX_KEEP}:
            return a + b
        return a[:-1] + b
    if a.endswith(("–","—","/","(")) or b.startswith((",",".",";",":",")","]","}","%","’s","'s")):
        return a + b
    return a + " " + b

def dehyphenated_raw(s):
    s = re.sub(r"(?<=\w)-\s*\n\s*(?=\w)", "", s)
    return normspace(s)

def normalized_cmp(s):
    s = dehyphenated_raw(s).lower().replace("ı","i")
    return re.sub(r"[^0-9a-zçğıöşüâîû]+", "", s)

def load_xml(lang):
    root = ET.parse(EVIDENCE / f"{lang}.xml").getroot()
    spec = {}
    for p in root.findall("page"):
        for fs in p.findall("fontspec"):
            spec[fs.attrib["id"]] = {
                "size": int(fs.attrib.get("size","0")),
                "family": fs.attrib.get("family",""),
                "color": fs.attrib.get("color","").lower(),
            }
    pages = {}
    for p in root.findall("page"):
        pn = int(p.attrib["number"])
        nodes = []
        for t in p.findall("text"):
            fs = spec.get(t.attrib.get("font"), {})
            text = normspace("".join(t.itertext()))
            if not text: continue
            nodes.append({
                "page":pn,
                "top":int(t.attrib.get("top","0")),
                "left":int(t.attrib.get("left","0")),
                "font":t.attrib.get("font",""),
                "size":fs.get("size",0),
                "family":fs.get("family",""),
                "color":fs.get("color",""),
                "text":text,
            })
        pages[pn] = nodes
    return pages

PAGES = {"en":load_xml("en"), "tr":load_xml("tr")}

def col_of(left):
    return 0 if left < 430 else 1

def make_lines(lang, p1, p2):
    lines=[]
    for pn in range(p1,p2+1):
        by_col={0:[],1:[]}
        for n in PAGES[lang].get(pn,[]):
            by_col[col_of(n["left"])].append(n)
        for col in (0,1):
            ns=sorted(by_col[col], key=lambda n:(n["top"],n["left"]))
            groups=[]
            for n in ns:
                if groups and abs(groups[-1][0]["top"]-n["top"])<=2:
                    groups[-1].append(n)
                else:
                    groups.append([n])
            for g in groups:
                g=sorted(g,key=lambda n:n["left"])
                text=""
                for n in g:
                    text = join_piece(text,n["text"],lang)
                lines.append({
                    "page":pn,"col":col,"top":min(n["top"] for n in g),
                    "left":min(n["left"] for n in g),"text":text,
                    "nodes":g
                })
    return sorted(lines,key=lambda x:(x["page"],x["col"],x["top"],x["left"]))

def is_heading(line):
    for n in line["nodes"]:
        fam=n["family"]; size=n["size"]; color=n["color"]
        if ("MyriadPro-Semibold" in fam or "FrutigerTr-Normal" in fam) and size in (16,17) and color in ("#bc2628","#bd2628","#231f20","#000000"):
            return True
    return False

def is_body(line, lang, slug):
    # Main running copy throughout this issue is Minion Pro 16; the symposium report
    # is 17 in EN and 16 in TR. Inline CJK/superscript fragments are retained because
    # line classification requires only one main-copy fragment.
    allowed={16}
    if slug == RECORDS[6]["slug"] and lang=="en": allowed.add(17)
    for n in line["nodes"]:
        if "MinionPro" in n["family"] and n["size"] in allowed:
            return True
    return False

def is_reference(line):
    for n in line["nodes"]:
        if ("MinionPro" in n["family"] or "KozMinPro" in n["family"] or "AdobeSong" in n["family"]) and 11 <= n["size"] <= 14:
            return True
    return False

def flush_para(section, buf):
    if buf["text"].strip():
        section["paragraphs"].append(normspace(buf["text"]))
    buf["text"]=""; buf["prev"]=None

def append_body_line(section, buf, line, lang):
    t=line["text"].strip()
    if not t: return
    prev=buf["prev"]
    new=False
    if prev is not None:
        if line["page"]==prev["page"] and line["col"]==prev["col"]:
            gap=line["top"]-prev["top"]
            base=106 if line["col"]==0 else 434
            if gap > 34 or line["left"] >= base+14:
                new=True
        elif line["page"]==prev["page"] and line["col"]!=prev["col"]:
            base=434
            if line["left"] >= base+14:
                new=True
        elif line["page"]!=prev["page"]:
            base=106 if line["col"]==0 else 434
            if line["left"] >= base+14:
                new=True
    if new:
        flush_para(section,buf)
    buf["text"]=join_piece(buf["text"],t,lang)
    buf["prev"]=line

def collect_footnotes(lang, p1, p2):
    out=[]
    marker_re=re.compile(r"^(\*{1,2}|\d{1,2})\s+")
    trigger_re=re.compile(r"(translation\s*:|çeviri\s*:|editor.?s note|editör.?ün notu|see for |see \(|detaylı bilgi|çevrim içi)",re.I)
    for pn in range(p1,p2+1):
        candidates=[]
        for line in make_lines(lang,pn,pn):
            if line["top"] < 950: continue
            sizes=[n["size"] for n in line["nodes"]]
            fams=" ".join(n["family"] for n in line["nodes"])
            if not sizes or min(sizes)>12: continue
            if "MinionPro" in fams and max(sizes)>=12: continue
            txt=line["text"].strip()
            if re.search(r"How to cite|Atıf:|Belt & Road Initiative Quarterly|Kuşak ve Yol Girişimi Dergisi",txt,re.I): continue
            candidates.append(line)
        i=0
        while i<len(candidates):
            line=candidates[i]; txt=line["text"].strip()
            if marker_re.match(txt) or trigger_re.search(txt):
                acc=txt
                j=i+1
                while j<len(candidates):
                    nxt=candidates[j]
                    if marker_re.match(nxt["text"].strip()) or trigger_re.search(nxt["text"]):
                        break
                    if nxt["top"]-candidates[j-1]["top"]>20: break
                    acc=join_piece(acc,nxt["text"],lang)
                    j+=1
                acc=re.sub(r"^(\*{1,2}|\d{1,2})\s+","",acc).strip()
                if acc and len(acc)>5: out.append(acc)
                i=j
            else:
                i+=1
    ded=[]
    for x in out:
        if x not in ded: ded.append(x)
    return [{"id":f"note-{i+1}","text":x} for i,x in enumerate(ded)]

def ref_append(refs, state, line, lang):
    txt=line["text"].strip()
    if not txt: return
    base=106 if line["col"]==0 else 434
    prev=state.get("prev")
    starts_new = line["left"] <= base+5
    if prev and (line["page"]!=prev["page"] or line["col"]!=prev["col"]):
        # A new page/column starts a new item only if it looks bibliographically complete.
        starts_new = bool(re.match(r"^[A-ZÇĞİÖŞÜ][^,]{1,80},|^[A-ZÇĞİÖŞÜ][A-Za-zÇĞİÖŞÜçğıöşü.\- ]+\.\s*\(",txt))
    if not refs or starts_new:
        refs.append(txt)
    else:
        refs[-1]=join_piece(refs[-1],txt,lang,refs=True)
    state["prev"]=line

def extract_article(slug, lang, p1, p2):
    title_default="Full Text" if lang=="en" else "Tam Metin"
    sections=[]
    current={"id":f"{lang}-section-1","title":title_default,"paragraphs":[]}
    sections.append(current)
    buf={"text":"","prev":None}
    refs=[]
    refstate={}
    acks=[]
    ackbuf={"text":"","prev":None}
    mode="body"
    pending_heading=None
    pending_meta=None

    def flush_heading():
        nonlocal pending_heading,pending_meta,current,mode
        if not pending_heading: return
        h=normspace(pending_heading).strip()
        pending_heading=None; pending_meta=None
        key=h.rstrip(":").strip().lower()
        if key in ("abstract","öz"):
            mode="skip"
            return
        if key in ("references","kaynakça"):
            flush_para(current,buf); flush_para({"paragraphs":acks},ackbuf)
            mode="refs"; return
        if key in ("acknowledgements","acknowledgments","teşekkür"):
            flush_para(current,buf); mode="acks"; return
        if mode=="refs":
            refs.append(h); return
        if mode=="acks":
            flush_para({"paragraphs":acks},ackbuf)
        flush_para(current,buf)
        mode="body"
        if not (len(sections)==1 and not sections[0]["paragraphs"] and sections[0]["title"]==title_default):
            current={"id":f"{lang}-section-{len(sections)+1}","title":h,"paragraphs":[]}
            sections.append(current)
        else:
            current["title"]=h

    for line in make_lines(lang,p1,p2):
        # Ignore running heads/page numbers and bottom matter here; footnotes are extracted separately.
        if line["top"] < 120 or line["top"] > 1040: continue
        if is_heading(line):
            if pending_heading and pending_meta and line["page"]==pending_meta["page"] and line["col"]==pending_meta["col"] and line["top"]-pending_meta["top"] < 35:
                pending_heading=join_piece(pending_heading,line["text"],lang)
                pending_meta=line
            else:
                flush_heading()
                pending_heading=line["text"]; pending_meta=line
            continue
        flush_heading()
        if mode=="refs":
            if is_reference(line): ref_append(refs,refstate,line,lang)
            continue
        if mode=="acks":
            if is_body(line,lang,slug):
                append_body_line({"paragraphs":acks},ackbuf,line,lang)
            continue
        if is_body(line,lang,slug):
            if mode=="skip": mode="body"
            append_body_line(current,buf,line,lang)

    flush_heading()
    flush_para(current,buf)
    flush_para({"paragraphs":acks},ackbuf)
    sections=[s for s in sections if s["paragraphs"]]
    if not sections:
        raise RuntimeError(f"{slug} {lang}: no body sections extracted")
    meta=json.loads((REPO/"content"/"articles"/slug/"metadata.json").read_text())
    kws=meta.get("keywords",{}).get(lang,[]) if isinstance(meta.get("keywords"),dict) else []
    return {
      "sections":sections,
      "keywords":kws or [],
      "footnotes":collect_footnotes(lang,p1,p2),
      "references":[{"id":f"ref-{i+1}","text":x} for i,x in enumerate(refs) if x.strip()],
      "acknowledgements":" ".join(acks).strip(),
      "figures":[]
    }

def parse_editorial(lang):
    src=(REPO/"app"/"editorials.ts").read_text()
    block=src.split('"3-1":',1)[1].split('"3-2":',1)[0]
    lm=re.search(rf"\b{lang}:\s*\{{([\s\S]*?)(?=\n\s*\}},\n\s*(?:en|tr):|\n\s*\}},\n\s*\}},)",block)
    if not lm: raise RuntimeError(f"editorial locale block missing: {lang}")
    m=re.search(r"paragraphs:\s*\[([\s\S]*?)\]\s*,",lm.group(1))
    if not m: raise RuntimeError(f"editorial paragraphs missing: {lang}")
    vals=[]
    for q in re.findall(r'"(?:\\.|[^"\\])*"',m.group(1)):
        vals.append(ast.literal_eval(q))
    if len(vals)<8: raise RuntimeError(f"editorial paragraph count suspicious: {lang} {len(vals)}")
    raw=(EVIDENCE/f"{lang}.raw.txt").read_text().split("\f")[3]
    rawcmp=normalized_cmp(raw)
    misses=[]
    for p in vals:
        if p=="***": continue
        pc=normalized_cmp(p)
        if pc not in rawcmp:
            # Require a long leading fingerprint so harmless extraction punctuation does not block.
            words=re.findall(r"[0-9A-Za-zÇĞİÖŞÜçğıöşüâîû]+",p)
            fp=normalized_cmp(" ".join(words[:18]))
            if fp not in rawcmp: misses.append(p[:80])
    if misses: raise RuntimeError(f"editorial {lang} did not verify against p4 PDF: {misses}")
    return {
      "sections":[{"id":f"{lang}-section-1","title":"Full Text" if lang=="en" else "Tam Metin","paragraphs":vals}],
      "keywords":[],"footnotes":[],"references":[],"acknowledgements":"","figures":[]
    }

def extract_poem(lang):
    lines=[]
    for line in make_lines(lang,75,75):
        if line["top"]<300 or line["top"]>900: continue
        if any("MinionPro" in n["family"] and n["size"]==15 for n in line["nodes"]):
            lines.append(line)
    if len(lines)<20: raise RuntimeError(f"poem {lang}: too few lines {len(lines)}")
    text=""
    prev=None
    for line in lines:
        if prev and line["col"]==prev["col"] and line["top"]-prev["top"]>28:
            text += "  \n"
        if text and not text.endswith("\n"): text += "  \n"
        text += line["text"]
        prev=line
    meta=json.loads((REPO/"content"/"articles"/POEM/"metadata.json").read_text())
    stitle=meta.get("title",{}).get(lang) or ("The Awaited Call" if lang=="en" else "Beklenen Çağrı")
    return {
      "sections":[{"id":f"{lang}-section-1","title":stitle,"paragraphs":[text]}],
      "keywords":[],"footnotes":collect_footnotes(lang,75,75),"references":[],"acknowledgements":"","figures":[]
    }

def extract_visual(slug,lang,page):
    lines=[]
    for line in make_lines(lang,page,page):
        if line["top"]<180 or line["top"]>1035: continue
        if any("MinionPro" in n["family"] and n["size"] in (15,16) for n in line["nodes"]):
            lines.append(line)
    # Visual biographies are single full-width paragraphs; preserve printed wording.
    txt=""
    for line in lines:
        if re.search(r"How to cite|Atıf:",line["text"],re.I): continue
        txt=join_piece(txt,line["text"],lang)
    if len(txt)<250: raise RuntimeError(f"visual bio {slug} {lang} too short: {len(txt)}")
    return {
      "sections":[{"id":f"{lang}-section-1","title":"Full Text" if lang=="en" else "Tam Metin","paragraphs":[txt]}],
      "keywords":[],"footnotes":[],"references":[],"acknowledgements":"","figures":[]
    }

def caption_clusters(lang,page):
    ls=[]
    for line in make_lines(lang,page,page):
        if line["top"]<120 or line["top"]>1045: continue
        if re.search(r"How to cite|Atıf:|Volume 3|Cilt 3|Email:|E-posta:",line["text"],re.I): continue
        if any(("Swiss721BT" in n["family"] or "HelveticaNeueLTPro-Lt" in n["family"]) and 10<=n["size"]<=12 for n in line["nodes"]):
            if len(line["text"])>=12: ls.append(line)
    clusters=[]
    for line in ls:
        if not clusters or line["page"]!=clusters[-1][-1]["page"] or line["col"]!=clusters[-1][-1]["col"] or line["top"]-clusters[-1][-1]["top"]>22:
            clusters.append([line])
        else: clusters[-1].append(line)
    return [normspace(" ".join(x["text"] for x in c)) for c in clusters if normspace(" ".join(x["text"] for x in c))]

def locate_image(imgdir,num):
    hits=sorted(imgdir.glob(f"image-{num:03d}.*"))
    if len(hits)!=1:
        raise RuntimeError(f"embedded image object {num}: expected 1 file, got {hits}")
    return hits[0]

def attach_figures(slug,lang,record):
    specs=FIGURES.get(lang,{}).get(slug,[])
    if not specs: return
    target=REPO/"public"/"assets"/"article-figures"/slug
    target.mkdir(parents=True,exist_ok=True)
    page_caps={}
    for page,_ in specs: page_caps.setdefault(page,caption_clusters(lang,page))
    per_page={}
    meta=json.loads((REPO/"content"/"articles"/slug/"metadata.json").read_text())
    is_visual=slug in {x[0] for x in VISUALS}
    for i,(page,num) in enumerate(specs,1):
        src=locate_image(IMG_EN if lang=="en" else IMG_TR,num)
        ext=src.suffix.lower()
        # Locale suffix prevents false deduplication when the official EN/TR PDFs embed different production objects.
        out=target/f"figure-{i:02d}-{lang}{ext}"
        shutil.copyfile(src,out)
        idx=per_page.get(page,0); per_page[page]=idx+1
        caps=page_caps.get(page,[])
        caption=caps[idx] if idx<len(caps) else ""
        if is_visual:
            caption=meta.get("title",{}).get(lang,"")
        record["figures"].append({
          "id":f"figure-{i}",
          "src":"/"+out.relative_to(REPO/"public").as_posix(),
          "caption":caption
        })

def write_record(slug,lang,data):
    d=REPO/"content"/"articles"/slug/"fulltext"
    d.mkdir(parents=True,exist_ok=True)
    (d/f"{lang}.json").write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n")

def main():
    results={}
    for lang in ("en","tr"):
        data=parse_editorial(lang); write_record(EDITORIAL,lang,data); results[(EDITORIAL,lang)]=data
        for r in RECORDS[:6]:
            data=extract_article(r["slug"],lang,*r["pages"])
            attach_figures(r["slug"],lang,data)
            write_record(r["slug"],lang,data); results[(r["slug"],lang)]=data
        data=extract_poem(lang); write_record(POEM,lang,data); results[(POEM,lang)]=data
        for r in RECORDS[6:]:
            data=extract_article(r["slug"],lang,*r["pages"])
            attach_figures(r["slug"],lang,data)
            write_record(r["slug"],lang,data); results[(r["slug"],lang)]=data
        for slug,page in VISUALS:
            data=extract_visual(slug,lang,page)
            attach_figures(slug,lang,data)
            write_record(slug,lang,data); results[(slug,lang)]=data

    # Register all 14 as localized, preserving all unrelated catalog state.
    catp=REPO/"content"/"catalog.json"
    cat=json.loads(catp.read_text())
    loc=cat.setdefault("fulltext",{}).setdefault("localized",[])
    for slug in ALL_SLUGS:
        if slug not in loc: loc.append(slug)
    catp.write_text(json.dumps(cat,ensure_ascii=False,indent=2)+"\n")

    # Strong assembly invariants.
    assert len(ALL_SLUGS)==14 and len(set(ALL_SLUGS))==14
    for slug in ALL_SLUGS:
        for lang in ("en","tr"):
            p=REPO/"content"/"articles"/slug/"fulltext"/f"{lang}.json"
            obj=json.loads(p.read_text())
            assert obj["sections"], (slug,lang,"sections")
            assert any(s.get("paragraphs") for s in obj["sections"]), (slug,lang,"paragraphs")
    summary=[]
    for slug in ALL_SLUGS:
        row={"slug":slug}
        for lang in ("en","tr"):
            o=results[(slug,lang)]
            row[lang]={
              "sections":len(o["sections"]),
              "paragraphs":sum(len(s["paragraphs"]) for s in o["sections"]),
              "body_chars":sum(len(p) for s in o["sections"] for p in s["paragraphs"]),
              "references":len(o["references"]),
              "footnotes":len(o["footnotes"]),
              "figures":len(o["figures"]),
              "acks_chars":len(o["acknowledgements"]),
            }
        summary.append(row)
    (EVIDENCE/"assembly-summary.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2)+"\n")
    print(json.dumps(summary,ensure_ascii=False,indent=2))

if __name__=="__main__":
    main()
