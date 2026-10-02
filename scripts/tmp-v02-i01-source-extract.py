#!/usr/bin/env python3
import json, re, shutil, subprocess, tempfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
slugs=json.loads((ROOT/"content/issues/v02-i01.json").read_text())["articles"]

def image_rows(pdf):
    out=subprocess.check_output(["pdfimages","-list",str(pdf)],text=True)
    rows=[]
    for line in out.splitlines():
        m=re.match(r"\s*(\d+)\s+(\d+)\s+(image|smask)\s+(\d+)\s+(\d+)\s+",line)
        if m:
            page,num,kind,w,h=map(int,(m.group(1),m.group(2),0,m.group(4),m.group(5))) if False else (int(m.group(1)),int(m.group(2)),m.group(3),int(m.group(4)),int(m.group(5)))
            rows.append((page,num,kind,w,h))
    return rows

for slug in slugs:
    meta=json.loads((ROOT/"content/articles"/slug/"metadata.json").read_text())
    for loc,key in (("en","pdfEnLocal"),("tr","pdfTrLocal")):
        rel=(meta.get("urls") or {}).get(key)
        if not rel: continue
        pdf=ROOT/"public"/rel.lstrip("/")
        if not pdf.exists(): raise SystemExit(f"missing archived PDF {pdf}")
        rows=[r for r in image_rows(pdf) if r[2]=="image" and r[3]>=100 and r[4]>=100]
        if slug=="fotograf-omer-burhanoglu":
            rows=rows[:1]
        outdir=ROOT/"public/assets/article-figures"/slug
        outdir.mkdir(parents=True,exist_ok=True)
        with tempfile.TemporaryDirectory() as td:
            prefix=Path(td)/"img"
            subprocess.run(["pdfimages","-j",str(pdf),str(prefix)],check=True)
            for idx,(_,num,_,_,_) in enumerate(rows,1):
                matches=sorted(Path(td).glob(f"img-{num:03d}.*"))
                if not matches: raise SystemExit(f"missing extracted image {slug}/{loc}/{num}")
                src=matches[0]
                ext=src.suffix.lower()
                dst=outdir/f"figure-{idx:02d}-{loc}{ext}"
                shutil.copyfile(src,dst)
                print(dst.relative_to(ROOT))
