import json, pathlib, re, shutil

root=pathlib.Path(".")
issue=json.loads((root/"content/issues/v05-i02.json").read_text())
prose=issue["articles"][:9]
cand=root/"tmp/v05-i02-candidates"
evidence=root/"tmp/v05-i02-evidence"

def load(slug,loc):
    return json.loads((cand/slug/f"{loc}.json").read_text())

def write(slug,loc,d):
    p=root/"content/articles"/slug/"fulltext"
    p.mkdir(parents=True,exist_ok=True)
    (p/f"{loc}.json").write_text(json.dumps(d,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")

def reindex(d,loc):
    for i,s in enumerate(d["sections"],1): s["id"]=f"{loc}-section-{i}"
    for i,r in enumerate(d["references"],1): r["id"]=f"ref-{i}"
    for i,n in enumerate(d["footnotes"],1): n["id"]=f"note-{i}"
    for i,f in enumerate(d["figures"],1): f["id"]=f"figure-{i}"
    return d

def clean_line(s):
    s=s.replace("\f","").strip()
    if not s or s.isdigit(): return ""
    if re.match(r"^B\s*R\s*I\s*[Qq]\s*•",s): return ""
    return s

def join_parts(parts):
    out=""
    for x in parts:
        x=x.strip()
        if not x: continue
        if out and out.endswith("-") and x[0:1].islower():
            out=out[:-1]+x
        else:
            out=(out+" "+x).strip()
    out=re.sub(r"\s+"," ",out).strip()
    out=out.replace("https:// ","https://").replace("http:// ","http://")
    out=re.sub(r"(?<=/)\s+(?=[A-Za-z0-9%])","",out)
    return out

def parse_refs(slug,loc):
    raw=(evidence/slug/f"{loc}-raw.txt").read_text()
    markers=["Bibliography","References"] if loc=="en" else ["Kaynakça"]
    hits=[(raw.rfind(m),m) for m in markers if raw.rfind(m)>=0]
    if not hits: return []
    idx,marker=max(hits)
    tail=raw[idx+len(marker):]
    lines=[clean_line(x) for x in tail.splitlines()]
    lines=[x for x in lines if x]
    # remove recurring article/page headers
    filtered=[]
    for x in lines:
        if re.match(r"^\d{2,3}$",x): continue
        if x.startswith("BRIQ ") or x.startswith("B R I q"): continue
        filtered.append(x)
    start_rx=re.compile(r"^[\u200cA-Za-zÇĞİÖŞÜçğıöşü0-9\[\]ÁÉÖÜŞİ].{0,190}\((?:18|19|20)\d{2}[a-z]?\)\.")
    nd_rx=re.compile(r"^[\u200cA-Za-zÇĞİÖŞÜçğıöşü0-9\[\]].{0,190}\((?:n\.d\.|t\.y\.)\)\.")
    entries=[]; cur=[]
    for x in filtered:
        is_start=bool(start_rx.match(x) or nd_rx.match(x))
        if is_start and cur:
            entries.append(join_parts(cur)); cur=[x]
        else:
            cur.append(x)
    if cur: entries.append(join_parts(cur))
    # Discard obvious page-header debris and split rare fused references at an in-line new author/year.
    cleaned=[]
    inner=re.compile(r"(?<=\.)\s+(?=[A-ZÇĞİÖŞÜ\[][A-Za-zÇĞİÖŞÜçğıöşü0-9 .,'’&|–—-]{1,100}\((?:18|19|20)\d{2}[a-z]?\)\.)")
    for e in entries:
        for part in inner.split(e):
            part=part.strip()
            if len(part)>8 and ("(" in part or "doi" in part.lower()): cleaned.append(part)
    return [{"id":f"ref-{i}","text":t} for i,t in enumerate(cleaned,1)]

def shift_assets(slug,keep_indices):
    d=root/"public/assets/article-figures"/slug
    blobs=[]
    for idx in keep_indices:
        p=d/f"figure-{idx:02d}.jpg"
        if not p.exists(): p=d/f"figure-{idx}.jpg"
        if not p.exists(): raise SystemExit(f"missing source figure {slug} {idx}")
        blobs.append(p.read_bytes())
    if d.exists(): shutil.rmtree(d)
    d.mkdir(parents=True,exist_ok=True)
    for i,b in enumerate(blobs,1):
        (d/f"figure-{i:02d}.jpg").write_bytes(b)

def set_figures(d,slug,captions):
    d["figures"]=[{"id":f"figure-{i}","src":f"/assets/article-figures/{slug}/figure-{i:02d}.jpg","caption":cap} for i,cap in enumerate(captions,1)]

# 1 Africa at Dawn — first extracted image is the author portrait; preserve 11 published content visuals.
slug=prose[0]
shift_assets(slug,range(2,13))
caps={
"en":[
"At the Berlin Conference, borders were drawn with a ruler. In 1913, almost all of Africa was colonised by Europe (Photo: NDLA, 2024).",
"De Gaulle giving a speech at the Brazzaville Conference (1944). On stage, from left to right, Rene Pleven, General De Gaulle, Felix Eboue (Photo: Musee Alexandre-Franconie, 2024). This photo is taken from the website of the Alexandre-Franconie Museum - Guyana Regional Collective.",
"On 8 May 1945, the occupying French forces in Algeria carried out a terrible genocide in Setif and Guelma. 45,000 Algerians lost their lives (Photo: hawzahnews, 2022).",
"1958, soldiers of the National Liberation Army in the Algerian War of Independence (Photo: Museum of African Art Belgrade, 1958).",
"Huvvari Bumedyen was the second President of Algeria from 19 June 1965 to 27 December 1978 (Photo: AfricaSis, 2019).",
"Ahmed Sékou Touré was Guinea's first president from 1958 to 1984 (Photo: AfricaSis, 2018).",
"Thomas Sankara, President of Burkina Faso from 1983 to 1987, was a Burkinabé military captain, Marxist revolutionarist, pan-Africanist theorist (Photo: AfricaSis, 2018).",
"(left to right) Egyptian leader Gamal Abdel Nasser, Ethiopian delegate Yilma Deressa, Kojo Botsio of the Gold Coast and Indian Prime Minister Jawaharlal Nehru at the Bandung Conference (Photo: Picryl, 1955).",
"Africa and China promote a more just and equitable international order in the framework of win-win cooperation. 6 September 1963. Members of the Kenya African National Union (KANU) delegations were visiting Mao Zedong (Photo: Liu Qingrui, Xinhua, 1963).",
"Captain Ibrahim Traore seized power in Burkina Faso in 2022 and became the world's youngest leader (Photo: ISS, 2022).",
"Liptako-Gourma where the borders of Mali, Burkina Faso and Niger intersect and where terrorist attacks are intense (Map: ISS, 2020).",
],
"tr":[
"Berlin Konferansı sırasında sınırlar cetvelle çizilmişti. 1913'te Afrika'nın neredeyse tamamı Avrupa tarafından sömürgeleştirildi (Fotoğraf: NDLA, 2024).",
"Brazzaville Konferansı’nda (1944) De Gaulle konuşma yaparken. Sahnedekiler soldan sağa Rene Pleven, General De Gaulle, Felix Eboue (Fotoğraf: Musee Alexandre-Franconie, 2024). Bu fotoğraf Alexandre-Franconie Müzesi - Guyana Bölgesel Kolektivitesi web sitesinden alınmıştır.",
"8 Mayıs 1945'te Cezayir'deki işgalci Fransız kuvvetleri, Setif ve Guelma'da korkunç bir soykırım gerçekleştirdi. 45 bin Cezayirli hayatını kaybetti (Fotoğraf: hawzahnews, 2022).",
"1958, Cezayir Bağımsızlık Savaşı’nda Ulusal Kurtuluş Ordusu askerleri (Fotoğraf: Museum of African Art Belgrade, 1958).",
"Huari Bumedyen, 19 Haziran 1965'ten 27 Aralık 1978'e dek Cezayir ikinci Cumhurbaşkanıydı (Fotoğraf: AfricaSis, 2019).",
"Ahmed Sékou Touré Gine'nin 1958 - 1984 yıllarındaki ilk devlet başkanıdır (Fotoğraf: AfricaSis, 2018).",
"1983'ten 1987'ye kadar Burkina Faso'nun Başkanı olan Thomas Sankara, Burkinabé askeri kaptanı, Marksist devrimci, pan-Afrikancı teorisyendi (Fotoğraf: AfricaSis, 2018).",
"(soldan sağa) Mısırlı lider Cemal Abdül Nasır, Etiyopyalı delege Yilma Deressa, Gold Coast'tan Kojo Botsio ve Hindistan Başbakanı Jawaharlal Nehru Bandung Konferansı'nda (Fotoğraf: Picryl, 1955).",
"Afrika ile Çin kazan-kazan işbirliği çerçevesinde daha adil ve eşitlikçi bir uluslararası düzeni teşvik etmektedir. 6 Eylül 1963. Kenya Afrika Ulusal Birliği (KANU) heyetinin üyelerinin Başkan Mao Zedong'u ziyareti (Fotoğraf: Liu Qingrui, Xinhua).",
"Yüzbaşı İbrahim Traore, 2022'de Burkina Faso'da yönetime el koydu ve dünyanın en genç lideri oldu (Fotoğraf: ISS, 2022).",
"Mali, Burkina Faso ve Nijer sınırlarının birleştiği yer olan ve yoğun terör saldırılarının yaşandığı Liptako-Gourma (Harita: ISS, 2020).",
]}
for loc in ("en","tr"):
    d=load(slug,loc); d["references"]=parse_refs(slug,loc); set_figures(d,slug,caps[loc]); write(slug,loc,reindex(d,loc))

# 2 African-Asian geopolitical nexus — eight published visuals.
slug=prose[1]
caps={
"en":[
"Figure 1. Numerical Comparison of Maritime Piracy Incidents in Global Seas and Yemen/Somali seas (Figure: Özsaraç, 2023).",
"Figure 2. Pirate Threat in the Northwest Indian Ocean (2005-2010). Map showing the incidents of maritime banditry in the Indian Ocean during the period 2005-2010 (Figure: Venter, 2018).",
"Countries on the route from Bab el-Mandeb Strait to the Red Sea (Figure: BRIQ, 2024).",
"French Naval Base in Djibouti (Photo: SSI, 2017).",
"Map of the World showing the Locations of AFRICOM and CENTCOM (Photo: USNI, 2013).",
"Evacuation of Chinese Nationals from Yemen to Djibouti (Photo: People’s Daily, 2019).",
"Container Terminal (Photo: BRIQ, 2024).",
"Figure 3. Port Visits of the Barbaros Turkish Naval Task Group in 24 African Countries in 2014. Barbaros TGDD travelled the entire continent in 102 days (Figure: Bilgen, 2023).",
],
"tr":[
"Şekil 1. 2003-2010 Döneminde Dünya Denizleri ile Yemen/Somali Sularındaki Deniz Haydutluğu Olaylarının Sayısal Karşılaştırması (Şekil: Özsaraç, 2023).",
"Şekil 2. Kuzeybatı Hint Okyanusu’nda Korsan Tehidi (2005-2010). 2005-2010 döneminde Hint Okyanusu’ndaki deniz haydutluğu olaylarını gösteren harita (Şekil: Venter, 2018).",
"Bab el-Mandeb Boğazı’ndan Kızıldeniz'e açılan rotadaki ülkeler (Şekil: BRIQ, 2024).",
"Cibuti’de Fransız Deniz Üssü (Fotoğraf: SSI, 2017).",
"Dünya haritasında AFRICOM ve CENTCOM’un yeri (Fotoğraf: USNI, 2013).",
"Yemen’deki Çinlilerin Cibuti’ye Tahliyeleri (Fotoğraf: People’s Daily, 2019).",
"Uydu Haritası (Fotoğraf: BRIQ, 2024).",
"Şekil 3. Barbaros TDGG’nin 2014’te Liman Ziyareti Yaptığı 24 Afrika Ülkesi. Barbaros TDGG 102 günde tüm kıtayı dolaşmıştır (Şekil: Bilgen, 2023).",
]}
for loc in ("en","tr"):
    d=load(slug,loc); d["references"]=parse_refs(slug,loc); set_figures(d,slug,caps[loc]); write(slug,loc,reindex(d,loc))

# 3 China/Africa public goods — remove abstract, restore the published Global Public Goods subheading.
slug=prose[2]
caps={
"en":[
"Figure 1. China’s Direct Investments in Africa. China’s direct investment in Africa between 2018-2021 in billion dollars (Figure: CGTN, 2023).",
"Figure 2. Chinese Infrastructure Projects in Africa. China’s infrastructure projects in Africa between 2018-2021, in billion dollars (Figure: CGTN, 2023).",
"Figure 3. 2013-2022 China-Africa Trade. Total trade between China and African countries exceeded $2 trillion in 10 years (Figure: CGTN, 2023).",
"In 1976, Chinese and Tanzanian workers lay track on the Tanzania-Zambia Railway. The 1860.5 km railway is a milestone in China-Africa friendship (Photo: FOCAC, 2016).",
"The Beijing Summit of the Forum on China-Africa Cooperation (FOCAC) was held on 3 September 2018 at the Great Hall of the People in Beijing, capital of China (Photo: Wang Ye, Xinhua, 2018).",
"3 September 2018, Great Hall of the People, Beijing, China (Photo: Liu Weibing, Xinhua, 2018).",
"Chinese instructor Jiang Liping (right) and trainee Horace Owiti walk past a train carriage with a printed slogan reading “Connecting nations, prospering people” on the Mombasa-Nairobi Railway in Nairobi, Kenya, 23 May 2023 (Photo: Wang Guansen, Xinhua, 2023).",
"At the 2009 Beijing Summit Gala Night, Chinese and African dancers performed together (Photo: FOCAC, 2009).",
],
"tr":[
"Şekil 1. Afrika’da Çin’in Doğrudan Yatırımları. 2018-2021 yıllarında milyar dolar olarak Çin’in Afrika’ya doğrudan yatırımı (Şekil: CGTN, 2023).",
"Şekil 2. Afrika’daki Çin Altyapı Projeleri. 2018-2021 yılları arasında, milyar dolar olarak Çin’in Afrika’daki altyapı projeleri (Şekil: CGTN, 2023).",
"Şekil 3. 2013-2022 Çin-Afrika Ticareti. Çin ve Afrika ülkeleri arasındaki toplam ticaret 10 yılda 2 trilyon doları aştı (Şekil: CGTN, 2023).",
"1976 yılında Çinli ve Tanzanyalı işçiler Tanzanya-Zambiya Demiryolunda ray döşüyor. 1860.5 km’lik demiryolu, Çin-Afrika dostluğunda bir dönüm noktasıdır (Fotoğraf: FOCAC, 2016).",
"Çin-Afrika İşbirliği Forumu (FOCAC) Pekin Zirvesi, 3 Eylül 2018 tarihinde Çin’in başkenti Pekin’deki Büyük Halk Salonu’nda düzenlendi (Fotoğraf: Wang Ye, Xinhua, 2018).",
"3 Eylül 2018, Büyük Halk Salonu, Pekin, Çin (Fotoğraf: Liu Weibing, Xinhua, 2018).",
"Çinli eğitmen Jiang Liping (sağda) ve stajyer Horace Owiti, 23 Mayıs 2023'te Nairobi, Kenya'da Mombasa-Nairobi Demiryolu üzerinde “Ulusları birbirine bağlıyor, halkı zenginleştiriyor.” yazılı bir tren vagonunun yanından geçerken (Fotoğraf: Wang Guansen, Xinhua, 2023).",
"2009 Pekin Zirvesi Gala Gecesinde Çinli ve Afrikalı dansçılar birlikte gösteri yaptı (Fotoğraf: FOCAC, 2009).",
]}
for loc in ("en","tr"):
    d=load(slug,loc)
    if loc=="en":
        s=d["sections"][0]; p=s["paragraphs"]
        marker="FOR DECADES, CHINA HAS LONG HAD"
        first=p[0][p[0].index(marker):]
        concept=next(i for i,x in enumerate(p) if x.startswith("Conceptually, global public goods"))
        sections=[
            {"id":"en-section-1","title":"Full text","paragraphs":[first]+p[1:concept]},
            {"id":"en-section-2","title":"Global Public Goods","paragraphs":p[concept:]},
        ]+d["sections"][1:]
    else:
        sections=d["sections"][1:]
        intro=sections[0]
        concept=next(i for i,x in enumerate(intro["paragraphs"]) if x.startswith("Kavramsal olarak"))
        sections=[
            {"id":"tr-section-1","title":"Giriş","paragraphs":intro["paragraphs"][:concept]},
            {"id":"tr-section-2","title":"Küresel Kamu Malları","paragraphs":intro["paragraphs"][concept:]},
        ]+sections[1:]
    d["sections"]=sections; d["references"]=parse_refs(slug,loc); set_figures(d,slug,caps[loc]); write(slug,loc,reindex(d,loc))

# 4 Western Sahara — discard bio/abstract leakage, keep locale body and BRIQ subheading note.
slug=prose[3]
for loc,marker,note in [
("en","THE CONFLICT IN WESTERN SAHARA","Sub-headings added by BRIQ."),
("tr","BATI SAHRA’DAKİ ÇATIŞMA","Ara başlıklar BRIQ tarafından konulmuştur."),
]:
    d=load(slug,loc); sec=d["sections"][0]
    joined=" ".join(sec["paragraphs"])
    pos=joined.find(marker)
    if pos<0:
        # tolerate PDF's straight apostrophe/casing
        marker2="BATI SAHRA'DAKİ ÇATIŞMA" if loc=="tr" else marker
        pos=joined.find(marker2)
    if pos<0: raise SystemExit(f"body marker missing {slug} {loc}")
    sec["paragraphs"]=[joined[pos:]]
    sec["title"]="Full text" if loc=="en" else "Tam metin"
    d["footnotes"]=[{"id":"note-1","text":note}]
    write(slug,loc,reindex(d,loc))

# Interview helper: merge paragraphs beneath pull-quote pseudo-headings, discarding duplicated pull-quote titles.
def interview_sections(d, desired):
    idx=[next(i for i,s in enumerate(d["sections"]) if s["title"]==t) for t in desired]
    out=[]
    for n,start in enumerate(idx):
        end=idx[n+1] if n+1<len(idx) else len(d["sections"])
        paras=[]
        for s in d["sections"][start:end]: paras.extend(s["paragraphs"])
        out.append({"id":"","title":desired[n],"paragraphs":paras})
    return out

# 5 Ahmet Kavas — four actual interview questions, two published figures; author portrait excluded.
slug=prose[4]
shift_assets(slug,[2,3])
qs={
"en":[
"What is the current state of relations between Türkiye and African countries? How many countries are we in relation with, and at what level? Are there any particularly prominent countries or sub-regions?",
"How would you describe the main axis of Türkiye’s Africa policy? What are the priorities for Türkiye, and what issues are being focused on?",
"What are the opportunities for economic cooperation and joint projects between Türkiye and African countries, particularly in industry, agriculture, and mining?",
"In recent times, many African countries seem to be moving away from Western influence and dominance. What does this mean for Türkiye, and what advantages or disadvantages does it create for Türkiye?",
],
"tr":[
"Türkiye ile Afrika ülkeleri arasındaki ilişkilerin mevcut durumu nedir? Kaç ülkeyle, hangi düzeyde ilişkilerimiz var? Özellikle öne çıkan ülke ya da bölgeler var mı?",
"Türkiye’nin Afrika politikasındaki temel ekseni nasıl tanımlarsınız? Türkiye için öncelikler nelerdir ve ne gibi konulara yoğunlaşılmaktadır?",
"Türkiye ile Afrika ülkeleri arasında, sanayi, tarım ve madencilik başta olmak üzere ekonomik işbirliği ve ortak proje imkânları nelerdir?",
"Son dönemde Afrika’nın birçok ülkesinde Batı etkisi ve tahakkümünden uzaklaşması süreci yaşandığı görülüyor. Bu durum, Türkiye için nasıl bir anlam ifade diyor, Türkiye için ne gibi avantaj ya da dezavantajlar yaratıyor?",
]}
caps={
"en":["Figure 1. 2009-2023 Türkiye-Africa exports and imports (Billion USD). In 2022, 52.3% of the 23.6 billion USD African exports is to Egypt, Morocco, Libya and Algeria (Figure: DEIK, Afrika Bilgi Notu, August 2023).","Figure 2. Map showing Türkiye’s exports to African countries in 2022 (Million USD). Türkiye’s exports to Africa in 2022 increased by 11% compared to 2021 (Figure: DEIK, Afrika Bilgi Notu, August 2023)."],
"tr":["Şekil 1. 2009-2023 Türkiye-Afrika ihracat ve ithalatını gösteren grafik (Milyar USD). 2022 yılında 23,6 milyar USD tutarındaki Afrika ihracatının %52,3’ü Mısır, Fas, Libya ve Cezayir’e yapılmıştır (Şekil: DEIK, Afrika Bilgi Notu, Ağustos 2023).","Şekil 2. Türkiye’nin 2022’de Afrika ülkelerine ihracatını gösteren harita (Milyon USD). Türkiye’nin 2022 Afrika ihracatı 2021’e göre %11 artmıştır (Şekil: DEIK, Afrika Bilgi Notu, Ağustos 2023)."]}
for loc in ("en","tr"):
    d=load(slug,loc)
    # first 3 questions are exact candidate headings. Final question spans a pull-quote heading + question fragment.
    exact=qs[loc][:3]
    starts=[next(i for i,s in enumerate(d["sections"]) if s["title"]==t) for t in exact]
    final_start=next(i for i,s in enumerate(d["sections"]) if ("Africa prefers Türkiye" in s["title"] if loc=="en" else "Afrika, Türkiye’yi" in s["title"]))
    bounds=starts+[final_start,len(d["sections"])]
    out=[]
    for n in range(4):
        paras=[]
        for s in d["sections"][bounds[n]:bounds[n+1]]: paras.extend(s["paragraphs"])
        out.append({"id":"","title":qs[loc][n],"paragraphs":paras})
    d["sections"]=out; d["keywords"]=[]; d["references"]=[]; d["footnotes"]=[]; set_figures(d,slug,caps[loc]); write(slug,loc,reindex(d,loc))

# 6 Bovdunov interview — four real questions; sole extracted image is front portrait, not a body figure.
slug=prose[5]
asset=root/"public/assets/article-figures"/slug
if asset.exists(): shutil.rmtree(asset)
qs={
"en":["What is the overall framework of Russia’s strategy in Africa, and how does it distinguish itself from Western states?","What were the significant results of the recent Russia-Africa Summit hosted by Russian President Vladimir Putin?","What role do you think the African continent will play in the construction of a multipolar world?","How can Türkiye, Russia and other Eurasian countries cooperate on their relations with Africa?"],
"tr":["Rusya’nın Afrika’daki stratejisinin ana hatları ve Batılı devletlerden farkı nedir?","Rusya Devlet Başkanı Vladimir Putin’in ev sahipliğinde düzenlenen son Rusya-Afrika Zirvesi’nin öne çıkan sonuçları neler oldu?","Afrika kıtasının çok kutuplu bir dünyanın inşasında nasıl bir rol oynayacağını düşünüyorsunuz?","Türkiye, Rusya ve diğer Avrasya ülkeleri Afrika ile ilişkiler konusunda nasıl işbirliği yapabilir?"],
}
for loc in ("en","tr"):
    d=load(slug,loc); d["sections"]=interview_sections(d,qs[loc]); d["keywords"]=[]; d["references"]=[]; d["figures"]=[]
    if loc=="tr": d["footnotes"]=[{"id":"note-1","text":"İngilizce yapılan röportaj BRIQ tarafından Türkçe’ye çevrilmiştir."}]
    else: d["footnotes"]=[]
    write(slug,loc,reindex(d,loc))

# 7 Nigeria BRI — seven body visuals and bibliography.
slug=prose[6]
caps={
"en":["Figure 1. Population and Poverty Projection, 2050. By 2050, 86 percent of the world's extremely poor people are expected to live in Sub-Saharan Africa (Figure: CGTN, 2018).","Along the Belt and Road there are mega infrastructure projects such as railways, airports, sea ports and light rail (Figure: Shen Shiwei and Huang Ruiqi, CGTN, 2023).","Figure 2. 2003-2019 China and U.S. Direct Investments in Africa (Billion USD). Chart comparing China's direct investment rate in Africa with the U.S. direct investment rate in Africa (Figure: China Africa Research Initiative (CARI) analysis, April 2023).","The deepest sea port in West Africa, built by China Harbour Engineering Company Ltd (CHEC) in Lagos, Nigeria (Photo: CGTN, 2023).","West Africa's first light rail network built by CCECC, a Chinese company, was opened in Lagos, Nigeria (Photo: China Daily, 2023).","The Zungeru Hydroelectric Power Plant was built by Chinese companies. This plant produces the electricity needs of about 10 percent of Nigeria (Photo: Xinhua, 2023).","19 September 2023, Abuja, Nigeria. Local workers at the Nigerian Agricultural Technology Demonstration Centre displaying the rice seedlings they harvested (Photo: Xinhua, 2023)."],
"tr":["Şekil 1. Nüfus ve Yoksulluk Tahmini, 2050. 2050 yılına gelindiğinde dünyadaki aşırı yoksul insanların %86’sının Sahra Altı Afrika'da yaşaması beklenmektedir (Şekil: CGTN, 2018).","Kuşak ve Yol boyunca demiryolları, havalimanları, deniz limanları ve hafif raylı sistem gibi mega altyapı projeleri bulunmaktadır (Şekil: Shen Shiwei and Huang Ruiqi, CGTN, 2023).","Şekil 2. 2003-2019 Çin ve ABD’nin Afrika’ya Yönelik Doğrudan Yatırımları (Milyar USD). Çin’in Afrika’ya doğrudan yatırım oranını ile ABD’nin Afrika’ya doğrudan yatırım oranının karşılaştırıldığı grafik (Şekil: China Africa Research Initiative (CARI) analizi, Nisan 2023).","Nijerya’nın Lagos kentinde China Harbour Engineering Company Ltd (CHEC) tarafından inşa edilen Batı Afrika’nın en derin deniz limanı (Fotoğraf: CGTN, 2023).","Çinli bir şirket olan CCECC’nin inşa ettiği Batı Afrika'nın ilk hafif raylı sistem ağı Nijerya’nın Lagos kentinde açıldı (Fotoğraf: China Daily, 2023).","Zungeru Hidroelektrik Santrali Çinli şirketler tarafından inşa edildi. Bu santral Nijerya'nın elektrik ihtiyacının yaklaşık yüzde 10’unu karşılamaktadır (Fotoğraf: Xinhua, 2023).","19 Eylül 2023, Nijerya-Abuja. Nijerya Tarım Teknolojisi Gösteri Merkezi’nde yerel çalışanlar topladıkları pirinç fidelerini sergiliyor (Fotoğraf: Xinhua, 2023)."]}
for loc in ("en","tr"):
    d=load(slug,loc); d["references"]=parse_refs(slug,loc); set_figures(d,slug,caps[loc]); write(slug,loc,reindex(d,loc))

# 8 Türkiye in Africa's future — author bio/front section excluded; bibliography retained.
slug=prose[7]
caps={
"en":["Figure 1: Observed and Projected Population Size of Africa (1950-2102). The ratio of African population to world population, with United Nations data and projections to 2100 (Figure: IMF, 2024).","Figure 2: Observed and Projected Real Economic Growth in Africa (2020-2024). 2020-2024 Growth ratio by region in Africa (Figure: AFDB, 2023).","Background information about 3rd Türkiye-Africa Partnership Summit (Figure: Twitter.com/MFATurkiye, 2021)."],
"tr":["Şekil 1. Afrika’nın Gözlemlenen ve Tahmin Edilen Nüfus Büyüklüğü (1950-2100). Birleşmiş Milletler veri ve tahmilerine göre 2100 yılına kadar Afrika nüfusunun dünya nüfusuna oranı (Şekil: IMF, 2024).","Şekil 2. Afrika’da Gözlemlenen Ekonomik Büyüme (2020-2024). 2020-2024 Afrika’da bölgelere göre büyüme oranı (Şekil: AFDB, 2023).","III. Türkiye-Afrika Ortaklık Zirvesi öncesindeki durum hakkında bilgi (Şekil: Twitter.com/MFATurkiye, 2021)."]}
for loc in ("en","tr"):
    d=load(slug,loc); d["sections"]=d["sections"][1:]; d["references"]=parse_refs(slug,loc); set_figures(d,slug,caps[loc]); write(slug,loc,reindex(d,loc))

# 9 Egypt history — remove abstract/author leakage, retain the actual opening body, two archival body images; author portrait excluded.
slug=prose[8]
shift_assets(slug,[2,3])
caps={
"en":["In 1925, while Türkiye was dealing with revolutions and rebellions, it did not forget its Egyptian brothers and a sports competition was organized to support them against the British domination in the region. Despite those painful years, Egyptian artists visited Türkiye due to sincere relations. Cumhurbaşkanlığı Devlet Arşivi (CDA), 180. 09\\3.19.1, 1925.","The Turkish announcer described this match as follows: The game could not rise above the average. There are very few admirable elements in the Turkish game. If the Turks faced any Dutch team, they would most likely be defeated. While talking about the second half, which started with four goals scored by the Egyptians, the informant mentions that there was a remarkable movement among the public; The audience, which was initially limited to 2000, has now reached 5000. Aladdin scored a goal and saved the honor of the Turks. The Egyptians played football the English way, and the Turks played their games slowly. The Turkish team's reserves did so little work that there was no harm in leaving them in Istanbul. Cumhurbaşkanlığı Devlet Arşivi (CDA), 180. 09\\3.19.1, 1925."],
"tr":["1925 yılında Türkiye devrimlerle, isyanlarla uğraşırken Mısırlı kardeşlerini unutmamış bölgedeki İngiliz tahakkümüne karşı destek için spor müsabakası düzenlenmişti. O sancılı yıllara rağmen samimi münasebetlerden ötürü Mısırlı sanatçılar Türkiye’yi ziyaret ettiler. Cumhurbaşkanlığı Devlet Arşivi (CDA), 180. 09\\3.19.1, 1925.","Türk spiker bu maçı şöyle anlatmıştı: Oyun ortalamanın üzerine çıkamadı. Türk oyununda hayranlık uyandıran unsurlar çok azdır. Türkler herhangi bir Hollanda takımıyla karşılaşsaydı büyük ihtimalle mağlup olurdu. Mısırlıların attığı dört golle başlayan ikinci yarıdan bahsederken, muhbir halk arasında dikkat çekici bir hareketlilik yaşandığını belirtiyor; Başlangıçta 2000 kişiyle sınırlı olan seyirci sayısı artık 5000'e ulaştı. Alaaddin bir gol attı ve Türklerin şerefini kurtardı. Mısırlılar İngiliz usulü futbol oynadı, Türkler ise ağır oynadı. Türk takımının yedekleri o kadar az iş yaptı ki onları İstanbul'da bırakmanın hiçbir sakıncası yoktu. Cumhurbaşkanlığı Devlet Arşivi (CDA), 180. 09\\3.19.1, 1925."]}
for loc in ("en","tr"):
    d=load(slug,loc)
    p=d["sections"][0]["paragraphs"][0]
    start="AFTER DECADES OF BRITISH OCCUPATION" if loc=="en" else "ONLARCA YIL SÜREN İNGİLİZ İŞGALİNİN"
    a=p.find(start)
    if a<0 and loc=="tr": a=p.find("ONLARCA YIL SÜREN İNGILIZ IŞGALININ")
    if a<0: raise SystemExit(f"history start missing {loc}")
    stop=p.find("This paper explores",a) if loc=="en" else p.find("Bu makale,",a)
    opening=p[a:stop if stop>a else len(p)].strip()
    d["sections"][0]={"id":"","title":"Full text" if loc=="en" else "Tam metin","paragraphs":[opening]}
    d["references"]=parse_refs(slug,loc)
    note="The text was written by Halim Gençoglu in Turkish and English." if loc=="en" else "Metin Halim Gençoğlu tarafından Türkçe ve İngilizce olarak kaleme alınmıştır."
    d["footnotes"]=[{"id":"note-1","text":note}]
    set_figures(d,slug,caps[loc]); write(slug,loc,reindex(d,loc))

summary={}
for slug in prose:
    summary[slug]={}
    for loc in ("en","tr"):
        d=json.loads((root/"content/articles"/slug/"fulltext"/f"{loc}.json").read_text())
        body=" ".join(x for s in d["sections"] for x in s["paragraphs"])
        assert d["sections"] and len(body)>500
        assert "How to cite:" not in body and "Atıf:" not in body
        assert not body.startswith("*")
        for f in d["figures"]:
            p=root/"public"/f["src"].lstrip("/")
            assert p.is_file() and p.stat().st_size>1000, (slug,loc,f)
            assert f["caption"].strip()
        summary[slug][loc]={"sections":[s["title"] for s in d["sections"]],"paragraphs":sum(len(s["paragraphs"]) for s in d["sections"]),"references":len(d["references"]),"footnotes":len(d["footnotes"]),"figures":len(d["figures"]),"opening":d["sections"][0]["paragraphs"][0][:100],"closing":d["sections"][-1]["paragraphs"][-1][-100:]}
(root/"tmp/v05-i02-promotion-summary.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2)+"\n")
print(json.dumps(summary,ensure_ascii=False,indent=2))
