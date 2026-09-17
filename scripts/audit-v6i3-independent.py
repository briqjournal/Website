#!/usr/bin/env python3
import json, re, sys, unicodedata, urllib.request
from pathlib import Path
import fitz

ROOT=Path('.')
ISSUE=json.loads((ROOT/'content/issues/v06-i03.json').read_text())
SLUGS=ISSUE['articles']
HARD=[]; WARN=[]; INFO=[]
PDF_CACHE={}

def norm(s):
    s=unicodedata.normalize('NFKC', s or '').casefold()
    s=s.replace('\u00ad','').replace('\x02','')
    s=re.sub(r'[‐‑‒–—-]\s*\n\s*','',s)
    s=re.sub(r'[^\w]+',' ',s,flags=re.UNICODE)
    return re.sub(r'\s+',' ',s).strip()

def date_forms(iso):
    if not iso: return []
    y,m,d=iso.split('-')
    return [iso, f'{d}.{m}.{y}', f'{d}/{m}/{y}', f'{d}-{m}-{y}', f'{d} {m} {y}']

def get_pdf(url):
    if url in PDF_CACHE: return PDF_CACHE[url]
    req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 BRIQ-audit'})
    with urllib.request.urlopen(req,timeout=60) as r: data=r.read()
    if not data.startswith(b'%PDF'): raise ValueError('not PDF')
    doc=fitz.open(stream=data,filetype='pdf')
    pages=[p.get_text('text') for p in doc]
    PDF_CACHE[url]=(pages,doc.page_count)
    return PDF_CACHE[url]

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
            if score>=2: flags.append((sec.get('title'),i,a[-90:],b[:90]))
    return flags

def significant_prefix(p,n=7):
    toks=[w for w in norm(p).split() if len(w)>2]
    return ' '.join(toks[:n])

def heading_positions(sections,ntext):
    out=[]
    cursor=0
    for i,s in enumerate(sections):
        t=norm(s.get('title') or '')
        pos=-1
        if t:
            pos=ntext.find(t,cursor)
            if pos<0: pos=ntext.find(t)
        out.append(pos)
        if pos>=0: cursor=pos+len(t)
    return out

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
        seen=[]
        for si,s in enumerate(d.get('sections',[])):
            for pi,p in enumerate(s.get('paragraphs',[])):
                n=norm(p)
                if len(n)>120:
                    for osi,opi,on in seen:
                        if n==on:
                            WARN.append(f'{slug}/{loc}: exact duplicate paragraph {(osi,opi)} and {(si,pi)}')
                        elif min(len(n),len(on))>150 and (n in on or on in n):
                            WARN.append(f'{slug}/{loc}: nested/near-duplicate paragraph {(osi,opi)} and {(si,pi)}')
                    seen.append((si,pi,n))
        cf=continuation_flags(d.get('sections',[]))
        for sec,i,a,b in cf[:20]: WARN.append(f'{slug}/{loc}: likely false paragraph split [{sec}] ...{a} || {b}...')
        if len(cf)>20: WARN.append(f'{slug}/{loc}: +{len(cf)-20} more likely false paragraph splits')
        ack=d.get('acknowledgements') or ''
        if ack:
            if re.search(r'\b\d{3}\s+[A-ZÇĞİÖŞÜ].{0,80}(Volume|Cilt|BRIQ|BRIq)',ack):
                WARN.append(f'{slug}/{loc}: acknowledgements contains page/header residue')
            if not meta.get('acknowledgements'):
                WARN.append(f'{slug}/{loc}: fulltext acknowledgements exists but metadata acknowledgements is null')
        refs=d.get('references',[]) or []
        refnorm=[]
        for ri,r in enumerate(refs):
            rt=ref_text(r); nr=norm(rt)
            if nr in refnorm and len(nr)>40: WARN.append(f'{slug}/{loc}: duplicate reference at {ri+1}')
            refnorm.append(nr)
            title=norm((meta.get('title') or {}).get(loc) or '')
            if title and len(title)>20 and title in nr and not re.search(r'\(20\d\d\)',rt):
                WARN.append(f'{slug}/{loc}: reference {ri+1} looks like running header, not bibliography')
            if re.search(r'\bIn\s+[A-Z]\.?\s*$',rt): WARN.append(f'{slug}/{loc}: reference {ri+1} appears truncated at column/page break: {rt[-80:]}')

    urls=meta.get('urls') or {}
    for loc,key in [('en','pdfEn'),('tr','pdfTr')]:
        url=urls.get(key)
        if not url:
            INFO.append(f'{slug}/{loc}: no separate PDF URL')
            continue
        try:
            pages,pc=get_pdf(url); text='\n'.join(pages); ntext=norm(text)
        except Exception as e:
            HARD.append(f'{slug}/{loc}: PDF fetch/read failed: {e}')
            continue
        title=(meta.get('title') or {}).get(loc) or ''
        nt=norm(title)
        if nt and nt not in ntext[:max(5000,len(ntext)//3)]:
            sig=[w for w in nt.split() if len(w)>2]
            first=norm('\n'.join(pages[:3])); hit=sum(w in first.split() for w in sig)
            if sig and hit/len(sig)<0.8: HARD.append(f'{slug}/{loc}: title weak/missing in PDF ({hit}/{len(sig)} tokens)')
            else: WARN.append(f'{slug}/{loc}: title not exact-normalized in PDF; token coverage {hit}/{len(sig)}')
        first4=norm('\n'.join(pages[:4]))
        for a in meta.get('authors',[]):
            dn=norm(a.get('displayName','')); toks=[w for w in dn.split() if len(w)>1]
            if toks and sum(w in first4.split() for w in toks)/len(toks)<0.75:
                HARD.append(f"{slug}/{loc}: author weak/missing in PDF: {a.get('displayName')}")
            oid=(a.get('orcid') or '').split('/')[-1]
            if oid and oid not in text: WARN.append(f'{slug}/{loc}: metadata ORCID {oid} not printed in PDF')
        dates=meta.get('dates') or {}
        for fld in ('received','accepted'):
            iso=dates.get(fld)
            if iso and not any(x in text for x in date_forms(iso)):
                HARD.append(f'{slug}/{loc}: {fld} {iso} not found in PDF')
        iso=dates.get('revised')
        if iso and not any(x in text for x in date_forms(iso)):
            INFO.append(f'{slug}/{loc}: revised {iso} not printed in PDF (may be external correspondence)')
        for kw in ((meta.get('keywords') or {}).get(loc,[]) or []):
            nkw=norm(kw)
            if nkw and nkw not in ntext:
                WARN.append(f'{slug}/{loc}: keyword not found verbatim-normalized in PDF: {kw}')
        sections=locdocs[loc].get('sections',[])
        hpos=heading_positions(sections,ntext)
        for si,s in enumerate(sections):
            t=s.get('title')
            if t and len(norm(t))>2 and hpos[si]<0:
                WARN.append(f'{slug}/{loc}: canonical heading not found in PDF text: {t}')
        # Paragraph-to-section placement check. If a paragraph prefix is found only outside its heading range, section assignment is suspect.
        found=[(i,p) for i,p in enumerate(hpos) if p>=0]
        for si,s in enumerate(sections):
            if hpos[si]<0: continue
            start=hpos[si]
            next_positions=[p for j,p in found if j>si and p>start]
            end=min(next_positions) if next_positions else len(ntext)
            for pi,p in enumerate(s.get('paragraphs',[])):
                if len(norm(p))<100: continue
                pref=significant_prefix(p,7)
                if not pref: continue
                positions=[]; st=0
                while True:
                    q=ntext.find(pref,st)
                    if q<0: break
                    positions.append(q); st=q+1
                if positions and not any(start<=q<end for q in positions):
                    WARN.append(f'{slug}/{loc}: paragraph {(si,pi)} appears outside canonical section [{t}]; source positions={positions[:3]} range={start}:{end}')
        refs=locdocs[loc].get('references',[]) or []
        if refs:
            tail=norm('\n'.join(pages[max(0,pc-8):])); misses=0
            for r in refs:
                rt=norm(ref_text(r)); toks=[w for w in rt.split() if len(w)>4][:8]
                if toks and sum(w in tail.split() for w in toks)<min(3,len(toks)): misses+=1
            if misses>max(3,len(refs)//8): WARN.append(f'{slug}/{loc}: {misses}/{len(refs)} references have weak PDF-tail overlap')
        # Strong acknowledgement marker only: heading, not generic support wording.
        has_ack_heading=bool(re.search(r'(?im)^\s*(acknowledg(?:e)?ments?|teşekkür)\s*$',text))
        if has_ack_heading and not (meta.get('acknowledgements') or locdocs[loc].get('acknowledgements')):
            WARN.append(f'{slug}/{loc}: PDF has explicit acknowledgements heading but canonical data lacks it')

print('=== V6I3 INDEPENDENT PDF AUDIT ===')
print(f'articles={len(SLUGS)} hard={len(HARD)} warnings={len(WARN)} info={len(INFO)}')
for x in HARD: print('HARD:',x)
for x in WARN: print('WARN:',x)
for x in INFO: print('INFO:',x)
if HARD: sys.exit(2)
