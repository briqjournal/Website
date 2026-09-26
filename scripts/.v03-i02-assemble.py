#!/usr/bin/env python3
from pathlib import Path
import xml.etree.ElementTree as ET
from collections import Counter,defaultdict
import json,re,glob,hashlib,sys
ROOT=Path(sys.argv[1]); REPO=Path(sys.argv[2]) if len(sys.argv)>2 else Path('.')
SLUGS=['milli-demokratik-devlet-ve-kalkinma','ortak-refahi-gerceklestirmek-icin-izleyecegimiz-program','cin-sosyalist-bir-kalkinma-modeli-mi','cin-ekonomik-mucizesinin-kodlari-gelisen-dunya-icin-dersler','cinin-ekonomik-diyalektigi-reformun-asil-amaci-uzerine-degerlendirme','kamu-ekonomisinin-hakim-konumu-cin-sosyalizminin-can-damaridir','erken-cumhuriyet-doneminde-kemalizmin-ekonomi-politikasi-1923-1938']
ALL=['gelisen-dunya-ulkeleri-icin-zorunlu-rota-bagimsiz-kamucu-halkci-yonetim',*SLUGS,'sultanahmet-camii-cuma-namazi','anadolu-buyuleri','turhan-selcuk-karikaturu']
KEYWORDS={
'milli-demokratik-devlet-ve-kalkinma':{'en':['China','Developing World','Economy','Revolution','Turkey'],'tr':['Çin','devrim','ekonomi','gelişen dünya','Türkiye']},
'cin-sosyalist-bir-kalkinma-modeli-mi':{'en':['China','development','inequality','productivity','socialism'],'tr':['Çin','eşitsizlik','kalkınma','sosyalizm','üretkenlik']},
'cin-ekonomik-mucizesinin-kodlari-gelisen-dunya-icin-dersler':{'en':['Chinese miracle','economic development','Mao Zedong Thought','socialism with Chinese characteristics','Xi Jinping Thought'],'tr':['Çin mucizesi','Çin’e özgü sosyalizm','ekonomik kalkınma','Mao Zedung Düşüncesi','Xi Jinping Düşüncesi']},
'erken-cumhuriyet-doneminde-kemalizmin-ekonomi-politikasi-1923-1938':{'en':['economic growth','industrialization','Kemalism','nationalization','statism'],'tr':['devletçilik','ekonomik büyüme','Kemalizm','millileşme','sanayileşme']}}
PREFIX={'state','market','long','short','middle','high','low','self','world','post','pre','non','semi','co','cross','well','large','small','value','labor','capital','public','private','five','three','two','one','socio','macro','micro','pro','anti','neo','national','social','year','income','technology','foreign','free','full','all','round','working','decision','policy','profit','growth','cost','resource','science','research','development','government','party','human','people','country','class','welfare','trade','bank','industrial','environment','energy','multi','inter','intra','out','under','over'}
def norm(s): return re.sub(r'\s+',' ',s.replace('\u00ad','').replace('\xa0',' ')).strip()
def join(a,b,lang='en',refs=False):
 a=a.rstrip();b=b.lstrip()
 if not a:return b
 if not b:return a
 if a.endswith('-'):
  if refs:return a+b
  m=re.findall(r"[\w’']+-?$",a); tok=(m[0][:-1] if m else '').lower(); keep=(b[0].isupper() or (lang=='en' and (tok in PREFIX or len(tok)<=2)))
  return a+b if keep else a[:-1]+b
 if b[:1] in '.,;:!?)]}%':return a+b
 if a[-1:] in '([{/':return a+b
 return a+' '+b
def loadxml(path):
 root=ET.parse(path).getroot();spec={fs.attrib['id']:fs.attrib for p in root.findall('page') for fs in p.findall('fontspec')};pages=[]
 for p in root.findall('page'):
  arr=[]
  for t in p.findall('text'):
   x=norm(''.join(t.itertext()))
   if not x:continue
   s=spec.get(t.attrib.get('font'),{});arr.append({'page':int(p.attrib['number']),'top':int(t.attrib['top']),'left':int(t.attrib['left']),'width':int(t.attrib['width']),'size':int(s.get('size','0')),'family':s.get('family',''),'color':s.get('color',''),'text':x})
  pages.append(arr)
 return pages
def heading(n):
 return n['text'].upper() in {'ABSTRACT','ÖZ'} or ('MyriadPro-Semibold' in n['family'] and n['size'] in (16,17) and n['color']=='#bc2628') or ('FrutigerTr-Normal' in n['family'] and n['size']==16 and n['color']=='#bc2628') or ('MyriadPro-Semibold' in n['family'] and n['size']==17 and n['color'] in ('#000000','#231f20'))
def body(n):return 'MinionPro' in n['family'] and n['size']==16 and n['color'] in ('#000000','#231f20')
def small(n):return ('MinionPro' in n['family'] and n['size'] in (13,14) and n['color'] in ('#000000','#231f20')) or ('MicrosoftJhengHeiUIRegular' in n['family'] and n['size']==13)
def grouplines(nodes):
 groups=[]
 for n in sorted(nodes,key=lambda z:(z['page'],0 if z['left']<425 else 1,z['top'],z['left'])):
  col=0 if n['left']<425 else 1
  if groups and groups[-1]['page']==n['page'] and groups[-1]['col']==col and abs(groups[-1]['top']-n['top'])<=2: groups[-1]['parts'].append(n);groups[-1]['left']=min(groups[-1]['left'],n['left'])
  else:groups.append({'page':n['page'],'col':col,'top':n['top'],'left':n['left'],'parts':[n]})
 out=[]
 for g in groups:
  txt='';right=None
  for n in sorted(g['parts'],key=lambda x:x['left']):
   if txt:
    if n['left']-(right or n['left'])>2 and not txt.endswith((' ','-')) and not n['text'].startswith(tuple('.,;:!?)]')):txt+=' '
    txt+=n['text']
   else:txt=n['text']
   right=n['left']+n['width']
  out.append({**{k:g[k] for k in ('page','col','top','left')},'text':norm(txt)})
 return out
def bases(lines):
 d=defaultdict(list)
 for n in lines:d[(n['page'],n['col'])].append(n['left'])
 out={}
 for k,v in d.items():
  c=Counter(v); mx=c.most_common(1)[0][1]; common=[(x,n) for x,n in c.items() if n>=max(2,mx*.3)];out[k]=min(x for x,n in common) if common else c.most_common(1)[0][0]
 return out
def notes_raw(slug,lang):
 lines=(ROOT/'text'/f'{slug}-{lang}.raw.txt').read_text(errors='ignore').splitlines();a='Notes' if lang=='en' else 'Notlar';b='References' if lang=='en' else 'Kaynakça'
 try:i=next(i for i,x in enumerate(lines) if x.strip()==a);j=next(j for j,x in enumerate(lines[i+1:],i+1) if x.strip()==b)
 except StopIteration:return []
 out=[];num=None;txt=''
 def flush():
  nonlocal num,txt
  if num is not None and txt.strip():out.append({'id':f'note-{num}','text':norm(txt)})
  num=None;txt=''
 for x in map(str.strip,lines[i+1:j]):
  if not x:continue
  m=re.match(r'^(\d+)\s+(.*)$',x)
  if m and int(m.group(1))<=20:flush();num=int(m.group(1));txt=m.group(2)
  elif num is not None:txt=join(txt,x,lang,True)
 flush();return out
def extract(slug,lang):
 pages=loadxml(ROOT/'xml'/f'{slug}-{lang}.xml');raw=[]
 for pa in pages:
  for n0 in pa:
   if n0['top']<90 or n0['top']>1045:continue
   n=n0.copy();n['col']=0 if n['left']<425 else 1
   if heading(n):n['kind']='heading'
   elif body(n):n['kind']='body'
   elif small(n):n['kind']='small'
   else:continue
   raw.append(n)
 bg=grouplines([n for n in raw if n['kind']=='body']);sg=grouplines([n for n in raw if n['kind']=='small']);ev=[{**n,'kind':'body'} for n in bg]+[{**n,'kind':'small'} for n in sg]+[{**n,'kind':'heading'} for n in raw if n['kind']=='heading'];ev.sort(key=lambda z:(z['page'],z['col'],z['top'],z['left']))
 col=[];i=0
 while i<len(ev):
  e=ev[i]
  if e['kind']!='heading':col.append(e);i+=1;continue
  parts=[e['text']];j=i+1
  while j<len(ev) and ev[j]['kind']=='heading' and ev[j]['page']==e['page'] and parts[0].upper() not in {'ABSTRACT','ÖZ'} and ev[j]['text'].upper() not in {'ABSTRACT','ÖZ'}:parts.append(ev[j]['text']);j+=1
  t=''
  for p in parts:t=join(t,p,lang) if t else p
  col.append({**e,'text':norm(t)});i=j
 ev=col;bb=bases(bg);sb=bases(sg);sections=[];cur=None;para='';prev=None;mode='body';refs=[];rr=''
 def fpara():
  nonlocal para
  if para.strip():cur['paragraphs'].append(norm(para))
  para=''
 def fref():
  nonlocal rr
  if rr.strip():refs.append({'id':f'ref-{len(refs)+1}','text':norm(rr)})
  rr=''
 for e in ev:
  x=e['text']
  if e['kind']=='heading':
   if x.upper() in {'ABSTRACT','ÖZ'}:continue
   if x in {'References','Kaynakça'}:
    if cur:fpara()
    mode='refs';prev=None;continue
   if x in {'Notes','Notlar'}:
    if cur:fpara()
    mode='notes';prev=None;continue
   if mode!='body':continue
   if cur:fpara()
   cur={'id':f'{lang}-section-{len(sections)+1}','title':x,'paragraphs':[]};sections.append(cur);prev=None;continue
  if mode=='body':
   if e['kind']!='body':continue
   if cur is None:cur={'id':f'{lang}-section-1','title':'Full Text' if lang=='en' else 'Tam Metin','paragraphs':[]};sections.append(cur)
   ind=e['left']-bb.get((e['page'],e['col']),e['left']);new=not para or ind>=12
   if prev and (e['page'],e['col'])!=(prev['page'],prev['col']):new=ind>=12
   if prev and e['page']==prev['page'] and e['col']==prev['col'] and e['top']-prev['top']>34:new=True
   if new and para:fpara()
   para=join(para,x,lang) if para else x;prev=e
  elif mode=='refs' and e['kind']=='small':
   ind=e['left']-sb.get((e['page'],e['col']),e['left'])
   if rr and ind<=4:fref()
   rr=join(rr,x,lang,True) if rr else x
 if cur and para:fpara()
 if rr:fref()
 sections=[s for s in sections if s['paragraphs']]
 notes=notes_raw(slug,lang) if slug=='cin-sosyalist-bir-kalkinma-modeli-mi' else []
 return {'sections':sections,'keywords':KEYWORDS.get(slug,{}).get(lang,[]),'footnotes':notes,'references':refs,'acknowledgements':'','figures':[]}
def image_rows(slug,lang):
 p=ROOT/'info'/f'{slug}-{lang}-images.txt';out=[]
 if not p.exists():return out
 for line in p.read_text(errors='ignore').splitlines():
  m=re.match(r'\s*(\d+)\s+(\d+)\s+(image|smask)\s+(\d+)\s+(\d+)\s+(\w+)\s+.*?\s+(jpeg|image|jp2|jbig2)\s+',line)
  if m:
   pg,num,typ,w,h,cs,enc=m.groups();out.append({'page':int(pg),'num':int(num),'type':typ,'w':int(w),'h':int(h)})
 return out
def imgfile(slug,lang,num):
 x=glob.glob(str(ROOT/'images'/slug/lang/f'image-{num:03d}.*'));return Path(x[0]) if x else None
def caps(slug,lang):
 pages=loadxml(ROOT/'xml'/f'{slug}-{lang}.xml');out=defaultdict(list);rx=re.compile(r'^(Figure|Table|Şekil|Tablo)\s*\d+',re.I)
 for pa in pages:
  arr=sorted(pa,key=lambda n:(n['top'],n['left']))
  for k,n in enumerate(arr):
   if not rx.match(n['text']):continue
   c=n['text'];top=n['top'];left=n['left']
   for m in arr[k+1:k+4]:
    if m['top']-top>50 or re.match(r'^(Source|Kaynak)\s*:',m['text'],re.I):break
    if m['size'] in range(12,19) and abs(m['left']-left)<250 and not rx.match(m['text']) and len(c)<120 and not c.endswith('.'):c=join(c,m['text'],lang)
   out[n['page']].append(norm(c))
 return out
def photo_caps(slug,lang):
 pages=loadxml(ROOT/'xml'/f'{slug}-{lang}.xml');out=defaultdict(list)
 for pa in pages:
  lines=[n for n in pa if 100<=n['top']<=1040 and n['size']==12 and ('Swiss721' in n['family'] or 'MyriadPro' in n['family']) and not re.search(r'How to cite|Atıf:',n['text'],re.I) and len(n['text'])>5];lines.sort(key=lambda n:(n['top'],n['left']));groups=[]
  for n in lines:
   if groups and n['top']-groups[-1][-1]['top']<=20 and abs(n['left']-groups[-1][-1]['left'])<180:groups[-1].append(n)
   else:groups.append([n])
  for g in groups:
   t=norm(' '.join(n['text'] for n in g))
   if len(t)>30:out[g[0]['page']].append(t)
 return out
def figs(slug,lang):
 cr=caps(slug,lang);ph=photo_caps(slug,lang);ci=defaultdict(int);pi=defaultdict(int);out=[]
 for r in image_rows(slug,lang):
  if r['type']!='image' or (r['w']==215 and r['h']==76):continue
  f=imgfile(slug,lang,r['num'])
  if not f:continue
  c=''
  if cr[r['page']]:q=ci[r['page']];c=cr[r['page']][q] if q<len(cr[r['page']]) else '';ci[r['page']]+=1
  elif ph[r['page']]:q=pi[r['page']];c=ph[r['page']][q] if q<len(ph[r['page']]) else '';pi[r['page']]+=1
  out.append({'id':f'figure-{len(out)+1}','src':'','caption':c,'_file':f})
 return out
def write(slug,lang,j):
 d=REPO/'content/articles'/slug/'fulltext';d.mkdir(parents=True,exist_ok=True);(d/f'{lang}.json').write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n')
def parse_editorial():
 s=(REPO/'app/editorials.ts').read_text();block=s[s.index('"3-2":'):s.index('"3-3":')]
 for lang in ('tr','en'):
  lb=block[block.index(f'{lang}: {{'):];pb=lb[lb.index('paragraphs: [')+len('paragraphs: ['):lb.index('],',lb.index('paragraphs: ['))];paras=[json.loads('"'+x+'"') for x in re.findall(r'"((?:[^"\\]|\\.)*)"',pb)];write(ALL[0],lang,{'sections':[{'id':f'{lang}-section-1','title':'Tam Metin' if lang=='tr' else 'Full Text','paragraphs':paras}],'keywords':[],'footnotes':[],'references':[],'acknowledgements':'','figures':[]})
def join_visual(lines,lang):
 t=''
 for x in lines:
  x=x.strip()
  if not x:continue
  t=join(t,x,lang) if t else x
 return norm(t)
def visual_records():
 for lang,start,end,caption in [('en','PHOTOGRAPHY ART','Friday prayers in the Blue Mosque','Friday prayers in the Blue Mosque'),('tr','FOTOĞRAF','Atıf:','Sultanahmet Camii Cuma Namazı')]:
  lines=(ROOT/'text'/f'sultanahmet-camii-cuma-namazi-{lang}.raw.txt').read_text(errors='ignore').splitlines();a=max(i for i,x in enumerate(lines) if x.strip()==start);b=next(i for i,x in enumerate(lines[a+1:],a+1) if end in x);p=join_visual(lines[a+1:b],lang);write('sultanahmet-camii-cuma-namazi',lang,{'sections':[{'id':f'{lang}-section-1','title':'Full Text' if lang=='en' else 'Tam Metin','paragraphs':[p]}],'keywords':[],'footnotes':[],'references':[],'acknowledgements':'','figures':[{'id':'figure-1','src':'/assets/article-figures/sultanahmet-camii-cuma-namazi/figure-01.jpg','caption':caption}]})
 for lang,label,tail,caption in [('en','KAĞAN GÜNER','PAINTING','Anatolian Spells'),('tr','KAĞAN GÜNER','RESiM','Anadolu Büyüleri')]:
  lines=(ROOT/'text'/f'anadolu-buyuleri-{lang}.raw.txt').read_text(errors='ignore').splitlines();a=next(i for i,x in enumerate(lines) if x.strip()==label);star=next(i for i,x in enumerate(lines[a+1:],a+1) if x.strip()=='***');b=next(i for i,x in enumerate(lines[star+1:],star+1) if x.strip()==tail);paras=[join_visual(lines[a+1:star],lang),'***',join_visual(lines[star+1:b],lang)];write('anadolu-buyuleri',lang,{'sections':[{'id':f'{lang}-section-1','title':'Full Text' if lang=='en' else 'Tam Metin','paragraphs':paras}],'keywords':[],'footnotes':[],'references':[],'acknowledgements':'','figures':[{'id':'figure-1','src':'/assets/article-figures/anadolu-buyuleri/figure-01.jpg','caption':caption}]})
 for lang,path,marker,cite,caption in [('tr',ROOT/'text/turhan-selcuk-karikaturu-shared.raw.txt','KARiKATÜR','Atıf:','Özgürlük Heykeli'),('en',ROOT/'text/issue-en-full.raw.txt','CARTOON','How to cite:','Statue of Liberty')]:
  lines=path.read_text(errors='ignore').splitlines();inds=[i for i,x in enumerate(lines) if x.strip()==marker];a=inds[-1];b=next(i for i,x in enumerate(lines[a+1:],a+1) if cite in x);p=join_visual(lines[a+1:b],lang);write('turhan-selcuk-karikaturu',lang,{'sections':[{'id':f'{lang}-section-1','title':'Full Text' if lang=='en' else 'Tam Metin','paragraphs':[p]}],'keywords':[],'footnotes':[],'references':[],'acknowledgements':'','figures':[{'id':'figure-1','src':'/assets/article-figures/turhan-selcuk-karikaturu/figure-01.jpg','caption':caption}]})
def sh(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def build_assets(records):
 copy=[]
 for slug in SLUGS:
  E=records[(slug,'en')]['_figs'];T=records[(slug,'tr')]['_figs'];dest={}
  for i,f in enumerate(E,1):dest[sh(f['_file'])]=f'public/assets/article-figures/{slug}/figure-{i:02d}{f["_file"].suffix.lower()}'
  for i,f in enumerate(T,1):
   h=sh(f['_file'])
   if h in dest:continue
   if i<=len(E):dest[sh(E[i-1]['_file'])]=f'public/assets/article-figures/{slug}/figure-{i:02d}-en{E[i-1]["_file"].suffix.lower()}'
   dest[h]=f'public/assets/article-figures/{slug}/figure-{i:02d}-tr{f["_file"].suffix.lower()}'
  for lang,L in [('en',E),('tr',T)]:
   j=records[(slug,lang)]['json']
   for i,f in enumerate(L):j['figures'][i]['src']='/'+dest[sh(f['_file'])].removeprefix('public/')
   write(slug,lang,j)
  for f in E+T:
   d=dest[sh(f['_file'])]
   if not any(x[1]==d for x in copy):copy.append((f['_file'],d,sh(f['_file'])))
 for slug,src in [('sultanahmet-camii-cuma-namazi',ROOT/'images/sultanahmet-camii-cuma-namazi/en/image-001.jpg'),('anadolu-buyuleri',ROOT/'images/anadolu-buyuleri/en/image-001.jpg'),('turhan-selcuk-karikaturu',ROOT/'images/turhan-selcuk-karikaturu/shared/image-001.jpg')]:copy.append((src,f'public/assets/article-figures/{slug}/figure-01.jpg',sh(src)))
 for src,d,h in copy:
  q=REPO/d;q.parent.mkdir(parents=True,exist_ok=True);q.write_bytes(Path(src).read_bytes());assert sh(q)==h
 print('assets',len(copy),sum(Path(x[0]).stat().st_size for x in copy))
def catalog_test_worklog():
 p=REPO/'content/catalog.json';j=json.loads(p.read_text());legacy=set(SLUGS);j['fulltext']['en_archive']=[x for x in j['fulltext']['en_archive'] if x not in legacy]
 for s in ALL:
  if s not in j['fulltext']['localized']:j['fulltext']['localized'].append(s)
 p.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n')
 tp=REPO/'tests/rendered-html.test.mjs';s=tp.read_text();needle='publishes every Volume 3 Issue 2 canonical record as localized bilingual HTML'
 if needle not in s:
  block='''\n\ntest("publishes every Volume 3 Issue 2 canonical record as localized bilingual HTML", async () => {\n  const issueArticles = archive.articles.filter((article) => article.volume === 3 && article.issue === 2);\n  assert.equal(issueArticles.length, 11);\n  for (const article of issueArticles) {\n    const slug = article.slug;\n    const [trResponse, enResponse] = await Promise.all([renderPath(`/tr/makaleler/${slug}`), renderPath(`/en/articles/${englishArticleSlug(slug)}`)]);\n    assert.equal(trResponse.status, 200, `TR v03-i02 ${slug}`);\n    assert.equal(enResponse.status, 200, `EN v03-i02 ${slug}`);\n    const [trHtml, enHtml] = await Promise.all([trResponse.text(), enResponse.text()]);\n    assert.match(trHtml, /<section class="article-fulltext" id="tam-metin"><h2>Tam Metin<\\/h2>/, `TR full text ${slug}`);\n    assert.match(enHtml, /<section class="article-fulltext" id="full-text-body"><h2>Full Text<\\/h2>/, `EN full text ${slug}`);\n    assert.match(trHtml, /class="article-body-section"/, `TR body ${slug}`);\n    assert.match(enHtml, /class="article-body-section"/, `EN body ${slug}`);\n    assert.doesNotMatch(trHtml, /legacy-fulltext-note/, `TR legacy fallback ${slug}`);\n    assert.doesNotMatch(enHtml, /legacy-fulltext-note/, `EN legacy fallback ${slug}`);\n  }\n});\n''';s+=block;tp.write_text(s)
 wp=REPO/'docs/WORKLOG.md';s=wp.read_text();entry='- 2026-09-26: Migrated v03-i02 to 11 bilingual canonical full-text records (22 locale files) from official locale PDF evidence; registered localized publication routes and exact embedded production assets; issue-wide fidelity audit pending before legacy retirement.\n'
 if entry not in s:s+=('\n' if not s.endswith('\n') else '')+entry
 wp.write_text(s)
def main():
 records={}
 for slug in SLUGS:
  for lang in ('en','tr'):
   j=extract(slug,lang);F=figs(slug,lang);j['figures']=[{k:v for k,v in f.items() if not k.startswith('_')} for f in F];records[(slug,lang)]={'json':j,'_figs':F}
 slug='cin-ekonomik-mucizesinin-kodlari-gelisen-dunya-icin-dersler'
 for lang in ('en','tr'):
  numbered={};rx=re.compile(r'^(?:Figure|Şekil)\s*(\d+)',re.I)
  for pg in sorted(caps(slug,lang)):
   for c in caps(slug,lang)[pg]:
    m=rx.match(c)
    if m:numbered.setdefault(int(m.group(1)),c)
  for n in range(1,23):
   if n in numbered and 3+n<len(records[(slug,lang)]['json']['figures']):records[(slug,lang)]['json']['figures'][3+n]['caption']=numbered[n]
 parse_editorial();visual_records();build_assets(records);catalog_test_worklog()
 for s in ALL:
  for l in ('en','tr'):json.loads((REPO/'content/articles'/s/'fulltext'/f'{l}.json').read_text())
 print('canonical',len(ALL)*2)
if __name__=='__main__':main()
