#!/usr/bin/env python3
import json, re, unicodedata
from pathlib import Path
ROOT=Path('.')
slugs=json.loads((ROOT/'content/issues/v06-i03.json').read_text())['articles']

def norm(s):
 s=unicodedata.normalize('NFKC',s or '').casefold().replace('\u00ad','')
 return re.sub(r'\s+',' ',re.sub(r'[^\w]+',' ',s)).strip()

def rtext(r): return r if isinstance(r,str) else r.get('text','')
for slug in slugs:
 print('\n###',slug)
 for loc in ('en','tr'):
  p=ROOT/'content/articles'/slug/'fulltext'/f'{loc}.json'
  d=json.loads(p.read_text())
  print(f'-- {loc} sections={len(d.get("sections",[]))} refs={len(d.get("references",[]))} ack={bool(d.get("acknowledgements"))}')
  # exact/nested within same section
  for si,s in enumerate(d.get('sections',[])):
   ps=s.get('paragraphs',[])
   for i in range(len(ps)):
    ni=norm(ps[i])
    for j in range(i+1,len(ps)):
     nj=norm(ps[j])
     if min(len(ni),len(nj))>120 and (ni==nj or ni in nj or nj in ni):
      print(f'DUP {si}:{s.get("title")} p{i}/p{j}')
      print(' A=',ps[i])
      print(' B=',ps[j])
   for i in range(len(ps)-1):
    a=ps[i].strip(); b=ps[i+1].strip()
    if a and b and not re.search(r'[.!?;:][”’\"\)]?$',a) and (b[:1].islower() or re.search(r'\b(a|an|the|of|in|on|for|to|with|and|or|by|from|into|as|its|their|this|that|these|those|is|are|was|were|be|been|being|at|which|who|whose|within|through|between|among|our|both|such)$',a,re.I)):
     print(f'SPLIT {si}:{s.get("title")} p{i}/p{i+1}')
     print(' A=',a)
     print(' B=',b)
  for ri,r in enumerate(d.get('references',[]) or []):
   txt=rtext(r)
   title=(json.loads((ROOT/'content/articles'/slug/'metadata.json').read_text()).get('title') or {}).get(loc,'')
   if (title and norm(title) in norm(txt)) or re.search(r'\bIn\s+[A-Z]\.?\s*$',txt) or (ri and norm(txt)==norm(rtext(d['references'][ri-1]))):
    print(f'REF? {ri+1}: {txt}')
  ack=d.get('acknowledgements')
  if ack: print('ACK=',ack)
