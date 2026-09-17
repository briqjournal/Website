#!/usr/bin/env python3
import json, re, sys, unicodedata, urllib.request, tempfile
from pathlib import Path
import fitz

ROOT=Path('.')
ISSUE=json.loads((ROOT/'content/issues/v06-i03.json').read_text())
SLUGS=ISSUE['articles']
HARD=[]; WARN=[]; INFO=[]

def norm(s):
    s=unicodedata.normalize('NFKC', s or '').casefold().replace('\u00ad','')
    s=re.sub(r'[‐‑‒–—-]\s*\n\s*','',s)
    s=re.sub(r'[^\w]+',' ',s,flags=re.UNICODE)
    return re.sub(r'\s+',' ',s).strip()

def date_forms(iso):
    if not iso: return []
    y,m,d=iso.split('-')
    return [iso, f'{d}.{m}.{y}', f'{d}/{m}/{y}', f'{d}-{m}-{y}', f'{d} {m} {y}']

def download_pdf(url):
    req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 BRIQ-audit'})
    with urllib.request.urlopen(req,timeout=60) as r: data=r.read()
    if not data.startswith(b'%PDF'): raise ValueError('not PDF')
    return data

def pdf_text(data):
    doc=fitz.open(stream=data,filetype='pdf')
    pages=[p.get_text('text') for p in doc]
    return pages, doc.page_count

def ref_text(r): return r if isinstance(r,str) else r.get('text','')

def continuation_flags(sections):
    flags=[]
    function_end=re.compile(r'\b(a|an|the|of|in|on|for|to|with|and|or|by|from|into|as|its|their|this|that|these|those|is|are|was|were|be|been|being|at|which|who|whose|within|through|between|among|our|both|such)$',re.I)
    for sec in sections:
        ps=sec.get('paragraphs',[])
        for i in range(len(ps)-1):
            a=ps[i].strip(); b=ps[i+1].strip()
            if not a or not b: continue
            if re.search(r'[.!?;:][”’\"\)]?$',a): continue
            if b.startswith(('•','- ','– ','— ')): continue
            score=0
            if function_end.search(a): score+=2
            if len(a.split())<=5: score+=1
            if b[:1].islower() or b.startswith('('): score+=1
            if score>=2: flags.append((sec.get('title'),i,a[-80:],b[:80]))
    return flags

# Issue-level publication date and file layout
for slug in SLUGS:
    base=ROOT/'content/articles'/slug
    meta=json.loads((base/'metadata.json').read_text())
    if meta.get('schemaVersion')!=2: HARD.append(f'{slug}: schemaVersion != 2')
    j=meta.get('journal',{})
    if (j.get('volume'),j.get('issue'))!=(6,3): HARD.append(f'{slug}: wrong volume/issue')
    if meta.get('dates',{}).get('published')!='2025-06-01': HARD.append(f'{slug}: published != 2025-06-01')
    ft=base/'fulltext'
    files=sorted(p.name for p in ft.glob('*.json'))
    if files!=['en.json','tr.json']: HARD.append(f'{slug}: fulltext files {files}')

    locdocs={}
    for loc in ('en','tr'):
        d=json.loads((ft/f'{loc}.json').read_text()); locdocs[loc]=d
        kws=(meta.get('keywords') or {}).get(loc,[]) or []
        if kws != (d.get('keywords') or []): HARD.append(f'{slug}/{loc}: metadata/fulltext keyword mismatch')
        ids=[s.get('id') for s in d.get('sections',[])]
        if len(ids)!=len(set(ids)): HARD.append(f'{slug}/{loc}: duplicate section ids')
        # duplicate long paragraphs
        seen={}
        for si,s in enumerate(d.get('sections',[])):
            for pi,p in enumerate(s.get('paragraphs',[])):
                n=norm(p)
                if len(n)>140:
                    if n in seen: WARN.append(f'{slug}/{loc}: duplicate paragraph {seen[n]} and {(si,pi)}')
                    seen[n]=(si,pi)
        cf=continuation_flags(d.get('sections',[]))
        for sec,i,a,b in cf[:12]: WARN.append(f'{slug}/{loc}: likely false paragraph split [{sec}] ...{a} || {b}...')
        if len(cf)>12: WARN.append(f'{slug}/{loc}: +{len(cf)-12} more likely false paragraph splits')

    urls=meta.get('urls') or {}
    for loc,key in [('en','pdfEn'),('tr','pdfTr')]:
        url=urls.get(key)
        if not url:
            INFO.append(f'{slug}/{loc}: no separate PDF URL')
            continue
        try:
            data=download_pdf(url); pages,pc=pdf_text(data); text='\n'.join(pages); ntext=norm(text)
        except Exception as e:
            HARD.append(f'{slug}/{loc}: PDF fetch/read failed: {e}')
            continue
        title=(meta.get('title') or {}).get(loc) or ''
        nt=norm(title)
        if nt and nt not in ntext[:max(5000,len(ntext)//3)]:
            # fallback: require 80% significant title words present in first 3 pages
            sig=[w for w in nt.split() if len(w)>2]
            first=norm('\n'.join(pages[:3])); hit=sum(w in first.split() for w in sig)
            if sig and hit/len(sig)<0.8: HARD.append(f'{slug}/{loc}: title weak/missing in PDF ({hit}/{len(sig)} tokens)')
            else: WARN.append(f'{slug}/{loc}: title not exact-normalized in PDF; token coverage {hit}/{len(sig)}')
        # author names / ORCID
        first4=norm('\n'.join(pages[:4]))
        for a in meta.get('authors',[]):
            dn=norm(a.get('displayName',''))
            toks=[w for w in dn.split() if len(w)>1]
            if toks and sum(w in first4.split() for w in toks)/len(toks)<0.75:
                HARD.append(f"{slug}/{loc}: author weak/missing in PDF: {a.get('displayName')}")
            oid=(a.get('orcid') or '').split('/')[-1]
            if oid and oid not in text: WARN.append(f'{slug}/{loc}: metadata ORCID {oid} not printed in PDF')
        # printed history: received/accepted must agree if field present; revised only warning
        dates=meta.get('dates') or {}
        for fld in ('received','accepted'):
            iso=dates.get(fld)
            if iso and not any(x in text for x in date_forms(iso)):
                HARD.append(f'{slug}/{loc}: {fld} {iso} not found in PDF')
        iso=dates.get('revised')
        if iso and not any(x in text for x in date_forms(iso)):
            INFO.append(f'{slug}/{loc}: revised {iso} not printed in PDF (may be external correspondence)')
        # keyword presence
        for kw in ((meta.get('keywords') or {}).get(loc,[]) or []):
            nkw=norm(kw)
            if nkw and nkw not in ntext:
                WARN.append(f'{slug}/{loc}: keyword not found verbatim-normalized in PDF: {kw}')
        # heading presence
        for s in locdocs[loc].get('sections',[]):
            t=s.get('title')
            if t and len(norm(t))>2 and norm(t) not in ntext:
                WARN.append(f'{slug}/{loc}: canonical heading not found in PDF text: {t}')
        # reference sanity: references should have substantial overlap with PDF tail
        refs=locdocs[loc].get('references',[]) or []
        if refs:
            tail=norm('\n'.join(pages[max(0,pc-8):]))
            misses=0
            for r in refs:
                rt=norm(ref_text(r)); toks=[w for w in rt.split() if len(w)>4][:8]
                if toks and sum(w in tail.split() for w in toks)<min(3,len(toks)):
                    misses+=1
            if misses>max(3,len(refs)//8): WARN.append(f'{slug}/{loc}: {misses}/{len(refs)} references have weak PDF-tail overlap')

    # declaration signals
    for loc,key in [('en','pdfEn'),('tr','pdfTr')]:
        url=urls.get(key)
        if not url: continue
        try:
            text='\n'.join(pdf_text(download_pdf(url))[0]); low=norm(text)
        except Exception: continue
        signal= any(x in low for x in ['acknowledgment','acknowledgement','teşekkür','funding','finansman','supported by','desteklenmektedir'])
        has_decl=bool(meta.get('funding') or meta.get('acknowledgements'))
        if signal and not has_decl: WARN.append(f'{slug}: PDF has funding/acknowledgment signal but metadata has neither')

print('=== V6I3 INDEPENDENT PDF AUDIT ===')
print(f'articles={len(SLUGS)} hard={len(HARD)} warnings={len(WARN)} info={len(INFO)}')
for x in HARD: print('HARD:',x)
for x in WARN: print('WARN:',x)
for x in INFO: print('INFO:',x)
if HARD: sys.exit(2)
