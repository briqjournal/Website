#!/usr/bin/env python3
import argparse, json, re, subprocess, unicodedata, urllib.request
from collections import Counter
from pathlib import Path

TOKEN_RE = re.compile(r"[\w’'-]+", re.UNICODE)
TR_WORDS = {"ve","bir","bu","ile","için","olarak","olan","çok","daha","ancak","çünkü","gibi","sonra","göre","üzerine","arasında","tarafından"}

def norm(s):
    s = unicodedata.normalize("NFKC", str(s or "")).lower().replace("’", "'")
    return " ".join(TOKEN_RE.findall(s))

def tokens(s): return norm(s).split()

def grams(ts, n=4):
    if len(ts) < n: return set()
    return {tuple(ts[i:i+n]) for i in range(len(ts)-n+1)}

def score_text(a, b):
    at, bt = tokens(a), tokens(b)
    if not at or not bt: return 0.0
    n = 4 if min(len(at),len(bt)) >= 8 else 2
    ag, bg = grams(at,n), grams(bt,n)
    if not ag or not bg: return 0.0
    return len(ag & bg) / max(1, min(len(ag), len(bg)))

def best_page(text, page_texts):
    best=(0,0.0)
    for i,p in enumerate(page_texts,1):
        s=score_text(text,p)
        if s>best[1]: best=(i,s)
    return best

def text_of(x):
    if isinstance(x,str): return x
    if isinstance(x,dict):
        for k in ("text","caption","title","content","value"):
            if isinstance(x.get(k),str): return x[k]
    return ""

def run(cmd):
    p=subprocess.run(cmd,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
    if p.returncode:
        raise RuntimeError(f"command failed {cmd}: {p.stderr[-2000:]}")
    return p.stdout

def download(url,dest):
    dest.parent.mkdir(parents=True,exist_ok=True)
    req=urllib.request.Request(url,headers={"User-Agent":"BRIQ-fulltext-fidelity-audit/1.0"})
    with urllib.request.urlopen(req,timeout=90) as r, open(dest,"wb") as f:
        while True:
            c=r.read(1024*1024)
            if not c: break
            f.write(c)

def pdf_pages(pdf):
    out=run(["pdfinfo",str(pdf)])
    m=re.search(r"^Pages:\s+(\d+)",out,re.M)
    if not m: raise RuntimeError(f"Could not determine page count for {pdf}")
    return int(m.group(1))

def extract_pages(pdf,out_dir):
    out_dir.mkdir(parents=True,exist_ok=True)
    n=pdf_pages(pdf); pages=[]
    for p in range(1,n+1):
        txt=run(["pdftotext","-layout","-f",str(p),"-l",str(p),str(pdf),"-"])
        (out_dir/f"p{p:03}.txt").write_text(txt,encoding="utf-8")
        pages.append(txt)
    return pages

def render_pages(pdf,pages,out_dir,prefix):
    out_dir.mkdir(parents=True,exist_ok=True)
    for p in sorted(set(x for x in pages if x and x>0)):
        base=out_dir/f"{prefix}-p{p:03}"
        subprocess.run(["pdftoppm","-f",str(p),"-singlefile","-png","-r","110",str(pdf),str(base)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)

def flatten_canonical(j):
    paras=[]; headings=[]
    for si,s in enumerate(j.get("sections") or []):
        headings.append(str(s.get("title") or ""))
        for pi,p in enumerate(s.get("paragraphs") or []):
            paras.append({"section":si,"paragraph":pi,"text":text_of(p)})
    refs=[text_of(x) for x in (j.get("references") or []) if text_of(x)]
    notes=[text_of(x) for x in (j.get("footnotes") or []) if text_of(x)]
    figs=[text_of(x) for x in (j.get("figures") or []) if text_of(x)]
    return headings,paras,refs,notes,figs

def audit_locale(root,slug,loc,meta,other_titles,out_root):
    ft_path=root/"content"/"articles"/slug/"fulltext"/f"{loc}.json"
    j=json.loads(ft_path.read_text(encoding="utf-8"))
    url=(meta.get("urls") or {}).get("pdfEn" if loc=="en" else "pdfTr")
    if not url: raise RuntimeError(f"Missing official PDF URL for {slug} {loc}")
    work=out_root/slug/loc; pdf=work/f"{slug}-{loc}.pdf"
    download(url,pdf)
    page_texts=extract_pages(pdf,work/"pages")
    headings,paras,refs,notes,figs=flatten_canonical(j)
    assignments=[]; unmatched=[]
    for x in paras:
        p,s=best_page(x["text"],page_texts)
        row={**x,"page":p,"score":round(s,3),"sample":x["text"][:180]}
        assignments.append(row)
        if len(tokens(x["text"]))>=12 and s<0.28: unmatched.append(row)
    heading_rows=[]
    for h in headings:
        p,s=best_page(h,page_texts)
        heading_rows.append({"title":h,"page":p,"score":round(s,3)})
    ref_rows=[]
    for r in refs:
        p,s=best_page(r,page_texts)
        ref_rows.append({"page":p,"score":round(s,3),"sample":r[:180]})
    fig_rows=[]
    for f in figs:
        p,s=best_page(f,page_texts)
        fig_rows.append({"page":p,"score":round(s,3),"caption":f[:220]})
    monotonic=[]
    prev=None
    for a in assignments:
        if a["score"]<0.28: continue
        if prev and a["page"]+1<prev["page"]:
            monotonic.append({"previous":prev,"current":a})
        prev=a
    norm_paras=[norm(x["text"]) for x in paras if len(tokens(x["text"]))>=8]
    dup=[{"count":c,"sample":k[:220]} for k,c in Counter(norm_paras).items() if c>1]
    tr_contam=[]
    if loc=="en":
        for x in paras:
            ts=tokens(x["text"]); hits=[w for w in ts if w in TR_WORDS]
            if len(hits)>=5:
                tr_contam.append({"section":x["section"],"paragraph":x["paragraph"],"hits":hits[:15],"sample":x["text"][:240]})
    flat=norm(" ".join(x["text"] for x in paras))
    cross=[]
    for other_slug,title in other_titles.items():
        if other_slug==slug: continue
        anchor=" ".join(tokens(title)[:8])
        if len(anchor.split())>=4 and anchor in flat:
            cross.append({"slug":other_slug,"title_anchor":anchor})
    first=assignments[0] if assignments else None; last=assignments[-1] if assignments else None
    ref_good=sum(1 for x in ref_rows if x["score"]>=0.24)
    heading_good=sum(1 for x in heading_rows if x["score"]>=0.45)
    para_good=sum(1 for x in assignments if len(tokens(x["text"]))<12 or x["score"]>=0.28)
    canonical_tokens=sum(len(tokens(x["text"])) for x in paras)+sum(len(tokens(x)) for x in refs)
    pdf_tokens=sum(len(tokens(x)) for x in page_texts)
    suspicious_pages={1,len(page_texts)}
    for x in unmatched[:30]: suspicious_pages.add(x["page"])
    for x in monotonic[:20]: suspicious_pages.update([x["previous"]["page"],x["current"]["page"]])
    if ref_rows:
        suspicious_pages.update([x["page"] for x in ref_rows if x["score"]<0.24][:10])
        suspicious_pages.add(max(x["page"] for x in ref_rows))
    render_pages(pdf,suspicious_pages,work/"renders",f"{slug}-{loc}")
    missing_assets=[]
    for f in j.get("figures") or []:
        src=f.get("src") if isinstance(f,dict) else None
        if src and src.startswith("/") and not (root/"public"/src.lstrip("/")).exists(): missing_assets.append(src)
    return {
      "slug":slug,"locale":loc,"pdf_url":url,"pdf_pages":len(page_texts),
      "canonical_paragraphs":len(paras),"canonical_references":len(refs),"canonical_figures":len(figs),
      "canonical_tokens":canonical_tokens,"pdf_extracted_tokens":pdf_tokens,
      "paragraph_match_ratio":round(para_good/max(1,len(assignments)),3),
      "heading_match_ratio":round(heading_good/max(1,len(heading_rows)),3),
      "reference_match_ratio":round(ref_good/max(1,len(ref_rows)),3) if refs else 1.0,
      "first_anchor":first,"last_anchor":last,"headings":heading_rows,
      "unmatched_paragraphs":unmatched,"nonmonotonic_assignments":monotonic,"duplicate_paragraphs":dup,
      "turkish_contamination_candidates":tr_contam,"cross_record_title_candidates":cross,
      "references_low_match":[x for x in ref_rows if x["score"]<0.24],
      "figure_caption_matches":fig_rows,"missing_figure_assets":missing_assets,
      "rendered_pages":sorted(suspicious_pages)
    }

def main():
    ap=argparse.ArgumentParser(); ap.add_argument("issue"); ap.add_argument("--root",default="."); ap.add_argument("--out",default=".audit/fulltext-fidelity")
    a=ap.parse_args(); root=Path(a.root).resolve(); out=Path(a.out).resolve()/a.issue; out.mkdir(parents=True,exist_ok=True)
    issue=json.loads((root/"content"/"issues"/f"{a.issue}.json").read_text(encoding="utf-8"))
    metas={}; titles={}
    for slug in issue["articles"]:
        m=json.loads((root/"content"/"articles"/slug/"metadata.json").read_text(encoding="utf-8")); metas[slug]=m; titles[slug]=(m.get("title") or {}).get("en") or slug
    results=[]
    for slug in issue["articles"]:
        for loc in ("en","tr"):
            print(f"AUDIT {slug} {loc}",flush=True)
            results.append(audit_locale(root,slug,loc,metas[slug],titles,out))
    report={"issue":a.issue,"records":len(issue["articles"]),"locales":results}
    (out/"report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    lines=[f"# Full-text fidelity audit: {a.issue}",""]
    for r in results:
        lines += [f"## {r['slug']} [{r['locale']}]",f"- PDF pages: {r['pdf_pages']}",f"- Paragraph match ratio: {r['paragraph_match_ratio']}",f"- Heading match ratio: {r['heading_match_ratio']}",f"- Reference match ratio: {r['reference_match_ratio']}",f"- Unmatched paragraphs: {len(r['unmatched_paragraphs'])}",f"- Non-monotonic paragraph assignments: {len(r['nonmonotonic_assignments'])}",f"- Duplicate canonical paragraphs: {len(r['duplicate_paragraphs'])}",f"- Turkish contamination candidates: {len(r['turkish_contamination_candidates'])}",f"- Cross-record title candidates: {len(r['cross_record_title_candidates'])}",f"- Missing figure assets: {len(r['missing_figure_assets'])}",f"- Rendered pages: {', '.join(map(str,r['rendered_pages']))}",""]
    (out/"report.md").write_text("\n".join(lines),encoding="utf-8")
    print((out/"report.md").read_text(encoding="utf-8"))

if __name__=="__main__": main()
