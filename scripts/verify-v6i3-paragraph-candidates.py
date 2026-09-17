#!/usr/bin/env python3
import json, re, urllib.request, tempfile
from pathlib import Path
import pymupdf

ROOT=Path(__file__).resolve().parents[1]
ISSUE=json.loads((ROOT/'content/issues/v06-i03.json').read_text())
TERMINAL=tuple('.?!…:;”’\")]}')

def clean(s): return re.sub(r'\s+',' ',s.replace('\u00ad','')).strip()
def norm(s): return clean(s).lower()
def words_tail(s,n=9): return ' '.join(clean(s).split()[-n:])
def words_head(s,n=9): return ' '.join(clean(s).split()[:n])
def contscore(a,b):
    a=a.strip(); b=b.strip(); score=0
    if not a or not b:return 0
    if not a.endswith(TERMINAL):score+=3
    if b[:1].islower():score+=3
    if re.match(r'^(of|and|or|but|to|in|on|at|for|from|with|as|by|than|that|which|who|whose|where|when|while|after|before|because|therefore|thus|however|also|the|a|an|ve|veya|ama|ancak|ile|için|bu|bir|de|da|sonra|önce|olarak|ise|olan|olduğu|kadar|gibi)\b',b,re.I):score+=2
    if re.search(r'\b(and|or|but|to|of|in|on|at|for|from|with|as|by|the|a|an|ve|veya|ile|için|bir)$',a,re.I):score+=3
    if len(a)<55 or len(b)<55:score+=1
    return score

def locate(blocks, phrase):
    q=norm(phrase)
    if not q:return []
    # tolerate PDF line-break hyphens and curly quotes by word-subsequence fallback
    qw=q.split()
    out=[]
    for x in blocks:
        t=norm(x['text'])
        if q in t or (len(qw)>=5 and all(w in t for w in qw[-5:])):
            out.append(x)
    return out

def pdf_blocks(url):
    req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
    with urllib.request.urlopen(req,timeout=40) as r: data=r.read()
    doc=pymupdf.open(stream=data,filetype='pdf'); out=[]
    for pi,page in enumerate(doc):
        h,w=page.rect.height,page.rect.width
        for bi,b in enumerate(page.get_text('blocks')):
            if len(b)<7 or b[6]!=0: continue
            out.append({'page':pi+1,'block':bi,'x0':b[0],'y0':b[1],'x1':b[2],'y1':b[3],'w':w,'h':h,'text':b[4]})
    return out

def rel(a,b):
    if a['page']==b['page'] and a['block']==b['block']: return 'SAME_BLOCK'
    if a['page']==b['page']:
        # left-column bottom -> right-column top, or vertically adjacent blocks
        if a['x0'] < a['w']*.48 and b['x0'] > a['w']*.45 and a['y1'] > a['h']*.55 and b['y0'] < b['h']*.50:
            return 'COLUMN_WRAP'
        overlap=max(0,min(a['x1'],b['x1'])-max(a['x0'],b['x0']))
        if overlap > min(a['x1']-a['x0'],b['x1']-b['x0'])*.5 and 0 <= b['y0']-a['y1'] < 28:
            return 'VERTICAL_NEAR'
        return 'SAME_PAGE_OTHER'
    if b['page']==a['page']+1 and a['y1']>a['h']*.62 and b['y0']<b['h']*.40:
        return 'PAGE_WRAP'
    return 'OTHER'

print('=== V6I3 PDF LAYOUT VERIFICATION ===')
for slug in ISSUE['articles']:
    meta=json.loads((ROOT/'content/articles'/slug/'metadata.json').read_text())
    for locale in ('en','tr'):
        p=ROOT/'content/articles'/slug/'fulltext'/f'{locale}.json'
        if not p.exists():continue
        d=json.loads(p.read_text()); url=meta.get('urls',{}).get('pdfEn' if locale=='en' else 'pdfTr')
        if not url:continue
        try: blocks=pdf_blocks(url)
        except Exception as e:
            print(f'PDFERR\t{slug}\t{locale}\t{e}'); continue
        for sec in d.get('sections',[]):
            paras=sec.get('paragraphs') or []
            for i in range(len(paras)-1):
                a,b=paras[i],paras[i+1]; sc=contscore(a,b)
                if sc<5:continue
                # bullets/list items are deliberately separate unless the first is clearly sentence-fragment prose
                if b.lstrip().startswith(('-', '•', '–')) or a.lstrip().startswith(('-', '•', '–')):
                    continue
                aa=locate(blocks,words_tail(a)); bb=locate(blocks,words_head(b))
                relations=[]
                for x in aa:
                    for y in bb:
                        r=rel(x,y)
                        if r!='OTHER':relations.append((r,x,y))
                priority={'SAME_BLOCK':5,'COLUMN_WRAP':4,'PAGE_WRAP':4,'VERTICAL_NEAR':3,'SAME_PAGE_OTHER':1}
                relations.sort(key=lambda z:priority.get(z[0],0),reverse=True)
                if relations:
                    r,x,y=relations[0]
                    high = r in {'SAME_BLOCK','COLUMN_WRAP','PAGE_WRAP','VERTICAL_NEAR'} and sc>=6
                    tag='HIGH' if high else 'REVIEW'
                    print(f'{tag}\t{slug}\t{locale}\t{sec.get("title","")}\t{i}\tscore={sc}\t{r}\tp{x["page"]}b{x["block"]}->p{y["page"]}b{y["block"]}\t{words_tail(a,7)} || {words_head(b,7)}')
                else:
                    print(f'UNLOCATED\t{slug}\t{locale}\t{sec.get("title","")}\t{i}\tscore={sc}\t{words_tail(a,7)} || {words_head(b,7)}')
