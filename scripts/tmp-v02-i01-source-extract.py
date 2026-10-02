#!/usr/bin/env python3
import json, re, shutil, subprocess, tempfile, urllib.request
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
slugs=json.loads((ROOT/"content/issues/v02-i01.json").read_text())["articles"]

def download(url,dest):
    req=urllib.request.Request(url,headers={"User-Agent":"BRIQ-v02-i01-migration/1.0"})
    with urllib.request.urlopen(req,timeout=120) as r, open(dest,"wb") as f:
        shutil.copyfileobj(r,f)

def image_rows(pdf):
    out=subprocess.check_output(["pdfimages","-list",str(pdf)],text=True)
    rows=[]
    for line in out.splitlines():
        m=re.match(r"\s*(\d+)\s+(\d+)\s+(image|smask)\s+(\d+)\s+(\d+)\s+",line)
        if m:
            rows.append((int(m.group(1)),int(m.group(2)),m.group(3),int(m.group(4)),int(m.group(5))))
    return rows

for slug in slugs:
    meta=json.loads((ROOT/"content/articles"/slug/"metadata.json").read_text())
    for loc,key in (("en","pdfEn"),("tr","pdfTr")):
        url=(meta.get("urls") or {}).get(key)
        if not url: continue
        with tempfile.TemporaryDirectory() as td:
            td=Path(td); pdf=td/f"{slug}-{loc}.pdf"; download(url,pdf)
            rows=[r for r in image_rows(pdf) if r[2]=="image" and r[3]>=100 and r[4]>=100]
            if slug=="fotograf-omer-burhanoglu":
                rows=rows[:1]
            prefix=td/"img"
            subprocess.run(["pdfimages","-j",str(pdf),str(prefix)],check=True)
            outdir=ROOT/"public/assets/article-figures"/slug
            outdir.mkdir(parents=True,exist_ok=True)
            for idx,(_,num,_,_,_) in enumerate(rows,1):
                matches=sorted(td.glob(f"img-{num:03d}.*"))
                if not matches: raise SystemExit(f"missing extracted image {slug}/{loc}/{num}")
                src=matches[0]
                ext=src.suffix.lower()
                dst=outdir/f"figure-{idx:02d}-{loc}{ext}"
                shutil.copyfile(src,dst)
                print(dst.relative_to(ROOT))
