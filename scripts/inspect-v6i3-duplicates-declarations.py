#!/usr/bin/env python3
import json,re,urllib.request
from pathlib import Path
from difflib import SequenceMatcher
import pymupdf
ROOT=Path(__file__).resolve().parents[1]
ISSUE=json.loads((ROOT/'content/issues/v06-i03.json').read_text())

def norm(s): return re.sub(r'\s+',' ',s.replace('\u00ad','')).strip().lower()
def short(s,n=180):
 s=re.sub(r'\s+',' ',s).strip(); return s if len(s)<=n else s[:n]+'…'
def pdf_spans(url):
 req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
 with urllib.request.urlopen(req,timeout=40) as r:data=r.read()
 doc=pymupdf.open(stream=data,filetype='pdf'); out=[]
 for pi,p in enumerate(doc):
  for b in p.get_text('dict')['blocks']:
   if 'lines' not in b:continue
   txt=[]; sizes=[]
   for line in b['lines']:
    for sp in line['spans']:
     txt.append(sp['text']); sizes.append(sp['size'])
   out.append((pi+1,' '.join(txt),max(sizes or [0]),b['bbox']))
 return out

for slug in ISSUE['articles']:
 meta=json.loads((ROOT/'content/articles'/slug/'metadata.json').read_text())
 print(f'ARTICLE\t{slug}\tmetaFunding={bool(meta.get("funding"))}\tmetaAck={bool(meta.get("acknowledgements"))}')
 for loc in ('en','tr'):
  p=ROOT/'content/articles'/slug/'fulltext'/f'{loc}.json'
  if not p.exists():continue
  d=json.loads(p.read_text())
  print(f'DECL\t{slug}\t{loc}\tfullAck={repr(d.get("acknowledgements"))[:260]}')
  dup=[]
  for sec in d.get('sections',[]):
   ps=sec.get('paragraphs') or []
   for i in range(len(ps)-1):
    a,b=ps[i],ps[i+1]; na,nb=norm(a),norm(b)
    if min(len(na),len(nb))<80:continue
    ratio=SequenceMatcher(None,na,nb).ratio()
    sameprefix=na[:90]==nb[:90]
    if ratio>=.70 or sameprefix:dup.append((sec.get('title',''),i,a,b,ratio))
  if not dup:continue
  url=meta.get('urls',{}).get('pdfEn' if loc=='en' else 'pdfTr')
  spans=[]
  try:spans=pdf_spans(url) if url else []
  except Exception as e:print('PDFERR',slug,loc,e)
  for title,i,a,b,ratio in dup:
   print(f'DUPFULL\t{slug}\t{loc}\t{title}\t{i}\tratio={ratio:.3f}\n A={short(a,500)}\n B={short(b,500)}')
   for label,text in [('A',a),('B',b)]:
    key=' '.join(norm(text).split()[:10]); hits=[]
    for pg,bt,size,bbox in spans:
     if all(w in norm(bt) for w in key.split()[:8]): hits.append((pg,round(size,1),tuple(round(x,1) for x in bbox),short(bt,150)))
    print(f' PDFHITS-{label}={hits[:8]}')
