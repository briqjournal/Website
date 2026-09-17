#!/usr/bin/env python3
import json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
ISSUE=json.loads((ROOT/'content/issues/v06-i03.json').read_text())
IRATNI='cezayir-devrimci-diplomasisi-bandung-temel-girisiminden-yeni-bir-baglantisizlar-konseptine'
INTERVIEW='70-yilinda-bandung-baglantisizliktan-hegemonyaciliga-karsi-milli-devletlerin-ortak-kalkinma-ve'
ZHANG='endonezya-dis-politikasinda-bandung-mirasina-yeniden-bakis-tarihsel-bir-inceleme-ve-guncel'
AKALIN='bandung-ruhu-70-yasinda'
FANG='bandung-konferansi-oncesi-ve-sonrasinda-yeni-cinin-dis-politikasi-bandung-konferansini-yeniden'
GAS='yeni-bir-enerji-kaynagi-olarak-gaz-hidratlar'
HEADINGS={
(IRATNI,'en'):[('Introduction','section'),('The “Mecca” of the Revolutionaries','section'),('Diplomatic support','subsection'),('Arms and military training for African freedom fighters','subsection'),('The Arduous Quest for a Militant Non-Aligned Movement','section'),('Adapting the Non-Aligned Movement to an Evolving Global Landscape','section'),('Conclusion','section')],
(IRATNI,'tr'):[('Giriş','section'),('Devrimcilerin “Mekke’si”','section'),('Diplomatik destek','subsection'),('Afrika özgürlük savaşçıları için silah ve askeri eğitim','subsection'),('Militan Bağlantısızlar Hareketi için Zorlu Arayış','section'),('Bağlantısızlar Hareketi’ni Değişen Uluslararası Bağlama Uyarlama','section'),('Sonuç','section')],
(INTERVIEW,'en'):[('Interview','section'),('The Path of National States against Imperialism','section'),('The Dynamics of Multipolarity: How Today Differs from Yesterday','section'),('The Strategy Turkey Needs','section')],
(INTERVIEW,'tr'):[('Röportaj','section'),('Emperyalizme Karşı Milli Devletlerin Önündeki Yol','section'),('Çok Kutupluluğun Dinamikleri ve Bugünün Dünden Farkı','section'),('Türkiye’nin İhtiyacı Olan Strateji','section')],
(ZHANG,'en'):[('Introduction','section'),('Why did Indonesia Initiate the Bandung Conference?','section'),('Reconfiguration of Global Powers Necessitates Third World Nations Uniting for Mutual Support','subsection'),('The Recently Liberated Indonesia was in Urgent Need of Asserting its Sovereignty and Independence','subsection'),('Sukarno’s Firm Anti-Imperialist and Anti-Colonialist Stance','subsection'),('Bandung Conference and Indonesia’s Domestic Diplomacy','section'),('Indonesia’s Inheritance or Divergence from the Bandung Legacy','section'),('The Transformation of Indonesian Diplomacy and its Contribution to Fostering the Bandung Spirit','section'),('Conclusion','section')],
(ZHANG,'tr'):[('Giriş','section'),('Endonezya Neden Bandung Konferansı’na Öncülük Etmiştir?','section'),('Küresel Güçlerin Yeniden Yapılandırılması Üçüncü Dünya Ülkelerinin Karşılıklı Destek İçin Birleşmesini Gerektiriyor','subsection'),('Yakın Zamanda Özgürlüğüne Kavuşan Endonezya’nın, Egemenliğini ve Bağımsızlığını Savunmaya Acil İhtiyacı Vardı','subsection'),('Sukarno’nun Kararlı Anti-Emperyalist ve Anti-Sömürgeci Duruşu','subsection'),('Bandung Konferansı ve Endonezya’nın İç Diplomasisi','section'),('Endonezya’nın Bandung Mirasını Devralması ve Ondan Uzaklaşması','section'),('Endonezya Diplomasisinin Dönüşümü ve Bandung Ruhunun Geliştirilmesine Katkısı','section'),('Sonuç','section')],
(AKALIN,'en'):[('Introduction','section'),('The Global Landscape Prior to the Bandung Conference','section'),('Asian Relations Conference in Delhi','section'),('China’s Contributions','subsection'),('Indonesia’s Contributions','subsection'),('Bandung-Asia-Africa Conference','section'),('Nehru-Zorlu conflict during the conference','subsection'),('Bandung Conference in Turkish Press','section'),('Western Positions on Bandung','section'),('Non-Alignement Movement After Bandung','section'),('Conclusion','section')],
(AKALIN,'tr'):[('Giriş','section'),('Bandung Öncesi Uluslararası Ortam','section'),('Delhi Asya İlişkileri Konferansı','section'),('Çin’in Katkıları','subsection'),('Endonezya’nın Katkıları','subsection'),('Bandung’daki Asya-Afrika Konferansı','section'),('Konferansta Nehru-Zorlu çatışması','subsection'),('Türk Basınında Bandung Konferansı','section'),('Bandung hakkında Batılıların Tavrı','section'),('Bandung Sonrası Bağlantısızlar Hareketi','section'),('Sonuç','section')],
(FANG,'en'):[('Introduction','section'),('Before the Bandung Conference: From “Leaning to One Side” to peaceful coexistence','section'),('The historical logic of the “one-sided” diplomatic strategy','subsection'),('One of the important manifestations of “Leaning to One Side”: The Korean War','subsection'),('The Proposal of the Five Principles of Peaceful Coexistence','subsection'),('In the Bandung Conference: Exploration of New Diplomatic Routes','section'),('Preparation for the Conference: The Indonesian Initiative and the Bogor Conference','subsection'),('Conference process: Zhou Enlai’s diplomatic practice','subsection'),('Outcome of the Conference: The Ten Principles of Bandung','subsection'),('After the Bandung Conference: The evolution of Chinese Foreign policy','section'),('Conclusion','section')],
(FANG,'tr'):[('Giriş','section'),("Bandung Konferansı'ndan önce: “Tek Tarafa Yaslanmaktan” Barış İçinde Bir Arada Yaşamaya",'section'),('“Tek taraflı” diplomatik stratejinin tarihsel mantığı','subsection'),('“Tek Tarafa Yaslanma”nın Önemli Örneklerinden Biri: Kore Savaşı','subsection'),('Barış İçinde Bir Arada Yaşamanın Beş İlkesi Önerisi','subsection'),('Bandung Konferansı: Yeni Diplomatik Yolların Keşfi','section'),('Konferans için Hazırlık: Endonezya Girişimi ve Bogor Konferansı','subsection'),('Konferans süreci: Zhou Enlai’nin diplomatik pratiği','subsection'),('Konferansın Sonucu: Bandung’un On İlkesi','subsection'),('Bandung Konferansı Sonrası: Çin Dış Politikasının Evrimi','section'),('Sonuç','section')],
}

def norm(s):
 s=s.replace('\u00ad','').replace('AntiColonialist','Anti-Colonialist').replace('AntiSömürgeci','Anti-Sömürgeci')
 s=re.sub(r'[-‐‑]\s+','',s)
 s=re.sub(r'\s+',' ',s).strip(' .:–—-').casefold()
 return s

def clean_paras(paras, captions):
 out=[]; seen=set()
 for p in paras:
  p=re.sub(r'\s+',' ',p).strip()
  if re.fullmatch(r'(\d{2,4})\1',p): continue
  if norm(p) in captions: continue
  if out and re.search(r'[A-Za-zÇĞİÖŞÜçğıöşü]-$',out[-1]) and re.match(r'^[a-zçğıöşü]',p):
   out[-1]=out[-1][:-1]+p; continue
  k=norm(p)
  if len(p)>80 and k in seen: continue
  if k: seen.add(k); out.append(p)
 return out

def flatten(data):
 stream=[]
 for s in data.get('sections',[]):
  stream.append(s.get('title',''))
  stream.extend(s.get('paragraphs',[]))
 return [x for x in stream if x and x.strip()]

def rebuild(data, expected, locale):
 stream=flatten(data)
 # captions are represented separately as figures; do not duplicate them in prose.
 captions={norm(f.get('caption','')) for f in data.get('figures',[]) if f.get('caption')}
 # Clean all tokens first, while retaining source order.
 cleaned=[]
 for t in stream:
  t=re.sub(r'\s+',' ',t).strip()
  if re.fullmatch(r'(\d{2,4})\1',t): continue
  if norm(t) in captions: continue
  if cleaned and re.search(r'[A-Za-zÇĞİÖŞÜçğıöşü]-$',cleaned[-1]) and re.match(r'^[a-zçğıöşü]',t):
   cleaned[-1]=cleaned[-1][:-1]+t
  else: cleaned.append(t)
 stream=cleaned
 positions=[]; cursor=0
 for title,level in expected:
  target=norm(title); found=None
  for i in range(cursor,len(stream)):
   for w in (1,2,3):
    if i+w<=len(stream) and norm(' '.join(stream[i:i+w]))==target:
     found=(i,i+w); break
   if found: break
  positions.append((title,level,found))
  if found: cursor=found[1]
 # Parents occasionally disappeared from markdown extraction although PDF typography verifies them.
 # Anchor missing headings immediately before the next verified descendant heading.
 sections=[]
 for idx,(title,level,pos) in enumerate(positions):
  if pos:
   start=pos[1]
  else:
   start=None
  next_start=len(stream)
  for _,_,nxt in positions[idx+1:]:
   if nxt:
    next_start=nxt[0]; break
  if start is None: paras=[]
  else: paras=stream[start:next_start]
  # Demote any false markdown headings inside this span to ordinary prose, remove duplicates/captions.
  paras=clean_paras(paras,captions)
  sections.append({'id':f'{locale}-section-{idx+1}','title':title,'paragraphs':paras,'level':level})
 # Preserve leading interview question/answer material before first structural heading.
 if expected and expected[0][0] in ('Interview','Röportaj'):
  first_real=positions[1][2][0] if len(positions)>1 and positions[1][2] else len(stream)
  lead=clean_paras(stream[:first_real],captions)
  # remove title-like front matter/noise
  lead=[p for p in lead if norm(p) not in {'interview','röportaj'} and not re.search(r'BRIQ|B R I',p,re.I)]
  sections[0]['paragraphs']=lead
 # Drop false heading strings that are known design pull-quotes/citations.
 bad={'(feng & jin, 2003: 590)','(déclaration, 1962).','spirit','involved states,'}
 for s in sections:
  s['paragraphs']=[p for p in s['paragraphs'] if norm(p) not in bad]
 data['sections']=sections
 return data

for slug in ISSUE['articles']:
 for loc in ('en','tr'):
  p=ROOT/'content/articles'/slug/'fulltext'/f'{loc}.json'
  if not p.exists(): continue
  d=json.loads(p.read_text())
  if (slug,loc) in HEADINGS:
   d=rebuild(d,HEADINGS[(slug,loc)],loc)
  else:
   captions={norm(f.get('caption','')) for f in d.get('figures',[]) if f.get('caption')}
   for s in d.get('sections',[]): s['paragraphs']=clean_paras(s.get('paragraphs',[]),captions)
  # References: normalize PDF line-wrap whitespace inside URLs only.
  for r in d.get('references',[]):
   txt=r.get('text','')
   txt=re.sub(r'(https?://\S*?)\s+(?=[A-Za-z0-9/?#._=&%-])',lambda m:m.group(1),txt)
   r['text']=txt
  p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
print('Postprocessed V6I3 canonical full text')
