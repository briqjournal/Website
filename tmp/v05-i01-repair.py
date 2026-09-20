import json, pathlib, re

ROOT = pathlib.Path("tmp/v05-i01-candidates")

SLUG_GLOBAL = "kuresel-finansallasma-sistemi-altinda-dolarizasyon-ve-de-dolarizasyon-mekanizmasi-uzerine-bir"
SLUG_INTERVIEW = "cozumun-anahtari-alternatif-finansal-isbirliginin-sistematik-hale-getirilmesi"
SLUG_MULTI = "cok-kutupluluk-meydan-okumasi-dolarin-sarsilan-ustunlugu-ve-abd-hegemonyasinin-degisen"
SLUG_WORLD = "dunya-ekonomisinin-dolardan-arindirilmasi"
SLUG_USD = "abd-dolarinin-kirilan-egemenligi-ve-yeni-finansal-sistemin-kurulusu"

def load(slug, locale):
    p = ROOT/slug/f"{locale}.json"
    return p, json.loads(p.read_text())

def save(p, data):
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2)+"\n")

def clean_ref_text(text):
    text = re.sub(r"\s+", " ", text).strip()
    idx = text.find("http")
    if idx >= 0:
        prefix, url = text[:idx], text[idx:]
        url = re.sub(r"\s+", "", url)
        text = prefix + url
    return text

def clean_refs(data):
    for i, ref in enumerate(data.get("references", []), 1):
        ref["id"] = f"ref-{i}"
        ref["text"] = clean_ref_text(ref["text"])

# Canonical metadata keywords (already verified against the published issue).
keywords = {
    SLUG_GLOBAL: {
        "en": ["Global financialization system","Dollarization","De-dollarization","Financial Theory of Political Economy","LPM Mechanism"],
        "tr": ["de-dolarizasyon","dolarizasyon","Ekonomi Politik Finans Teorisi","küresel finansallaşma sistemi","LPM mekanizması"],
    },
    SLUG_MULTI: {
        "en": ["de-dollarization","dollar dominance","geopolitical analysis grid","multipolarization","US hegemony"],
        "tr": ["ABD hegemonyası","çok kutuplulaşma","de-dolarizasyon","dolar hâkimiyeti","jeopolitik analiz sistemi"],
    },
    SLUG_USD: {
        "en": ["BRICS","digitalization","dollarization","5R","New Financial System"],
        "tr": ["BRICS","dolarizasyon","dijitalleşme","5R","Yeni Finansal Sistem"],
    },
}

captions = {
    SLUG_GLOBAL: {
        "en": [
            "Dollarization is believed to lead to financial instability in a country, thus increasing the likelihood of a financial crisis (Photo: CGTN, 2022).",
            "In his testimony to the US Congress in 1960, economist Robert Triffin identified a fundamental problem in the international monetary system. This problem, known as the Triffin Dilemma, is the contradiction between printing dollars to cover the current account deficit and maintaining confidence in the dollar (Photo: IMF, 2023).",
            "UN Global Crisis Response Group calculations, based on (April 2023) IMF World Economic Outlook (Graph: UNCATD, 2023). Figure 1. Public Debt is Growing Faster in The Developing World.",
            "The advancement of modern communication technology can effectively reduce information asymmetry, alleviate corporate financing difficulties and improve the efficiency of financial resource allocation (Photo: CGTN, 2017).",
            "The shift towards financialisation led to the rapid domination of financial monopoly capital in the global economy (Photo: Monthly Review, 2018).",
            "Figure 2. The Progression of International Market Dollar Circulation (Cheng & Lu, 2023).",
        ],
        "tr": [
            "Dolarizasyonun, bir ülkede finansal istikrarsızlığa yol açtığına ve dolayısıyla bir finansal kriz olasılığını artırdığına inanılmaktadır (Fotoğraf: CGTN, 2022).",
            "Ekonomist Robert Triffin 1960 yılında ABD Kongresi önünde verdiği ifadede uluslararası para sistemindeki temel bir sorunu ortaya koymuştur. Triffin ikilemi olarak adlandırılan bu sorun, cari açığı kapatmak üzere dolar basmakla dolara güven sağlamak arasında oluşan çelişkidir (Fotoğraf: IMF, 2023).",
            "BM Küresel Kriz Müdahale Grubu hesaplamaları, IMF Dünya Ekonomik Görünümü'ne (Nisan 2023) dayanmaktadır (Grafik: UNCTAD, 2023). Şekil 1. Gelişmekte olan ülkelerde kamu borcu daha hızlı artmaktadır.",
            "Modern iletişim teknolojisinin ilerlemesi bilgi asimetrisini etkili bir şekilde azaltabilir, kurumsal finansman zorluklarını hafifletebilir ve finansal kaynak dağılımının verimliliğini artırabilir (Fotoğraf: CGTN, 2017).",
            "Finansallaşmaya doğru kayış, finansal tekelci sermayenin küresel ekonomide hızla egemen olmasına yol açtı (Fotoğraf: Monthly Review, 2018).",
            "Şekil 2. Uluslararası Piyasada Dolar Sirkülasyonunun Gelişimi (Cheng & Lu, 2023).",
        ],
    },
    SLUG_INTERVIEW: {
        "en": [
            "The existence of this financial system tends to draw money away from productive investment and towards financial investment. Inevitably, it leads do asset bubbles, increases in the prices of assets, whether they are stocks and bonds, real estate, fine wines or pictures (Photo: China Daily, 2021).",
            "President of Brazil Luiz Inacio Lula da Silva, President of China Xi Jinping, President of South Africa Cyril Ramaphosa, Prime Minister of India Narendra Modi and Foreign Minister of Russia Sergei Lavrov are at the 15th BRICS Summit (Photo: Xinhua, 2023).",
        ],
        "tr": [
            "Bu finansal sistemin varlığı, parayı üretken yatırımlardan uzaklaştırıp finansal yatırımlara yöneltme eğilimindedir. Bu da kaçınılmaz olarak varlık balonlarına, hisse senedi, tahvil, gayrimenkul, kaliteli şaraplar ya da resimler gibi varlıkların fiyatlarında artışlara neden olur (Fotoğraf: China Daily, 2021).",
            "Brezilya Devlet Başkanı Luiz Inacio Lula da Silva, Çin Devlet Başkanı Xi Jinping, Güney Afrika Devlet Başkanı Cyril Ramaphosa, Hindistan Başbakanı Narendra Modi ve Rusya Dışişleri Bakanı Sergei Lavrov 15. BRICS Zirvesi'nde (Fotoğraf: Xinhua, 2023).",
        ],
    },
    SLUG_WORLD: {
        "en": [
            "Illustrative comparison of the average JPM EMBI Global Diversified USD bond yields per region with the 10-year bond yields of Germany, and the United States from January 2022 to May 2023. UN Global Crisis Response Group calculations based on (April 2023) IMF World Economic Outlook (Photo: UNCTAD, 2023). Retrieved November 1, 2023 from https://unctad.org/publication/world-of-debt. Figure 1. Developing countries pay much more for their borrowing Bond Yields (2022-2023)."
        ],
        "tr": [
            "Ocak 2022'den Mayıs 2023'e kadar JPM EMBI Küresel Çeşitlendirilmiş ABD Doları tahvil faizlerinin bölge başına ortalaması ile Almanya ve ABD'nin 10 yıllık tahvil faizlerinin karşılaştırması. BM Küresel Kriz Müdahale Grubu'nun IMF Dünya Ekonomik Görünümü'ne (Nisan 2023) dayalı hesaplamaları (Grafik: UNCTAD, 2023). 1 Kasım 2023'te şu adresten alındı: https://unctad.org/publication/world-of-debt. Şekil 1. Gelişen ülkeler borçları için çok daha fazla ödüyor Tahvil Faizleri (2022-2023)."
        ],
    },
    SLUG_USD: {
        "en": [
            "In 2022, central bank purchases were the highest in history (Graph: Goldhub, 2023). Figure 1. Net change in gold buying/selling by world central banks.",
            "The currencies in the 5R basket have separate volatilities (Graph: V-Lab, 2023). Figure 2. 2021-2023 yuan GARCH volatility.",
            "IMF data were used for the graphic (Graph: BRIQ, 2023). Figure 3. World Foreign Exchange Reserves.",
            "Figure 4. Swap Cycle at the End of 2009. Chart showing end-2009 bilateral swap agreements (Graph: Perks et.al., 2021).",
            "Figure 5. Swap Cycle at the End of 2020. Chart showing end-2020 bilateral swap agreements (Graph: Perks et.al., 2021).",
            "Figure 6. Distribution of foreign exchange reserves of the Bank of Russia in 2021. The chart showing the distribution of the Central Bank of Russia's foreign exchange reserves in 2021 (Graph: Bank of Russia, 2022).",
            "In 2015, 90 percent of Sino-Russian trade was conducted in US dollars, while in 2022, it had fallen to 30 percent (Photo: CGTN, 2023).",
        ],
        "tr": [
            "2022’de merkez bankası alımları, tarihteki en yüksek alım oldu (Grafik: Goldhub, 2023). Şekil 1. Dünya Merkez Bankalarının Altın Alım/Satımlarının Net Değişimi.",
            "5R sepetin içinde bulunan 5 para biriminin ayrı ayrı volatilitesi bulunmaktadır (Grafik: V-Lab, 2023). Şekil 2. 2022-2023 5R GARCH Volatilitesi.",
            "Grafik için IMF verileri kullanılmıştır (Grafik: BRIQ, 2023). Şekil 3. Dünya Döviz Rezervleri.",
            "Şekil 4. 2009 Sonu Swap Döngüsü. 2009 sonu ikili swap anlaşmalarını gösteren grafik (Grafik: Perks vd., 2021).",
            "Şekil 5. 2020 Sonu Swap Döngüsü. 2020 sonu ikili swap anlaşmalarını gösteren grafik (Grafik: Perks vd., 2021).",
            "Şekil 6. Rusya Merkez Bankası’nın Döviz Rezervlerinin 2021 Dağılımı. Rusya Merkez Bankası’nın Döviz Rezervlerinin 2021 Dağılımı (Grafik: Bank of Russia, 2022).",
            "Çin-Rusya arasındaki ABD doları ile yapılan ticaret yüzdesi 2015'te %90’ı bulurken, bu oran 2022'de %30’lara kadar gerilemişti (Fotoğraf: CGTN, 2023).",
        ],
    },
}

# Repair the interview into the four published questions, preserving extracted paragraph order.
questions = {
    "en": [
        "What has been the global economic impact of US financial dominance?",
        "How is the phenomenon of “de-dollarization” currently unfolding? What factors are propelling this ongoing shift, and what is its driving force?",
        "Are there feasible options to counterbalance US financial dominance? What key opportunities and obstacles arise with the emergence of these new alternatives?",
        "How does multipolarity influence international financial cooperation? What role does China play in providing alternative solutions in this context?",
    ],
    "tr": [
        "ABD’nin finansal hegemonyasının küresel ekonomik etkisi ne olmuştur?",
        "“Dolarsızlaştırma” (dedolarizasyon) olgusu şu anda nasıl gelişiyor? Devam etmekte olan bu değişimi hangi faktörler tetikliyor ve bunun itici gücü nedir?",
        "ABD’nin finansal hakimiyetini dengelemek için uygulanabilir seçenekler var mı? Bu yeni alternatiflerin ortaya çıkmasıyla birlikte hangi önemli fırsatlar ve zorluklar ortaya çıkmaktadır?",
        "Çok kutupluluk uluslararası finansal işbirliğini nasıl etkiliyor? Çin bu bağlamda alternatif çözümler sağlamada nasıl bir rol oynuyor?",
    ],
}
for locale in ("en","tr"):
    p, d = load(SLUG_INTERVIEW, locale)
    old = d["sections"]
    groups = ([1],[3],[5],[7]) if locale=="en" else ([0],[2],[4],[6])
    # Paragraphs live in the question-fragment section after the leading fragment/subheading section.
    if locale=="en":
        para_groups = [old[1]["paragraphs"], old[3]["paragraphs"], old[5]["paragraphs"], old[7]["paragraphs"]]
    else:
        para_groups = [old[0]["paragraphs"], old[2]["paragraphs"], old[4]["paragraphs"], old[6]["paragraphs"]]
    d["sections"] = [
        {"id": f"{locale}-section-{i+1}", "title": questions[locale][i], "paragraphs": list(para_groups[i])}
        for i in range(4)
    ]
    for fig, cap in zip(d.get("figures",[]), captions[SLUG_INTERVIEW][locale]):
        fig["caption"] = cap
    save(p,d)

# Split merged notes 3-6 and normalize note ids.
for locale in ("en","tr"):
    p,d=load(SLUG_GLOBAL,locale)
    fs=d.get("footnotes",[])
    if locale=="en":
        n1,n2=fs[0]["text"],fs[1]["text"]
        merged=fs[2]["text"]
        parts=re.split(r"\s+[⁴⁵⁶]\s*", merged)
        # parts: note3, note4, note5, note6
        if len(parts)!=4:
            raise SystemExit(f"Unexpected EN merged-note split: {len(parts)}")
        texts=[n1,n2]+parts
    else:
        n1=fs[0]["text"]
        merged=fs[1]["text"]
        # marker 3 was extracted as the leading '3' before 1974; later notes retain superscripts.
        m=re.search(r"\s+3(?=1974)", merged)
        if not m:
            raise SystemExit("TR note 3 marker not found")
        n2=merged[:m.start()].strip()
        rest=merged[m.end():].strip()
        parts=re.split(r"\s*[⁴⁵⁶]\s*", rest)
        if len(parts)!=4:
            raise SystemExit(f"Unexpected TR merged-note split: {len(parts)}")
        texts=[n1,n2]+parts
    d["footnotes"]=[{"id":f"note-{i+1}","text":t.strip()} for i,t in enumerate(texts)]
    save(p,d)

# Apply metadata keywords, explicit published captions, reference cleanup, canonical IDs.
for slug_dir in sorted(p for p in ROOT.iterdir() if p.is_dir()):
    slug=slug_dir.name
    for locale in ("en","tr"):
        p,d=load(slug,locale)
        if slug in keywords:
            d["keywords"]=keywords[slug][locale]
        if slug in captions:
            expected=captions[slug][locale]
            figs=d.get("figures",[])
            if len(figs)!=len(expected):
                raise SystemExit(f"{slug} {locale}: figure count {len(figs)} != caption count {len(expected)}")
            for i,(fig,cap) in enumerate(zip(figs,expected),1):
                fig["id"]=f"figure-{i}"
                fig["caption"]=cap
        for i,note in enumerate(d.get("footnotes",[]),1):
            note["id"]=f"note-{i}"
        clean_refs(d)
        save(p,d)

# Rebuild compact summary used for inspection.
summary=[]
for d in sorted(p for p in ROOT.iterdir() if p.is_dir()):
    for locale in ("en","tr"):
        j=json.loads((d/f"{locale}.json").read_text())
        summary.append({
            "slug":d.name,"locale":locale,
            "sections":[{"title":s.get("title"),"paragraphs":len(s.get("paragraphs",[]))} for s in j.get("sections",[])],
            "keywords":j.get("keywords",[]),
            "footnotes":len(j.get("footnotes",[])),
            "references":len(j.get("references",[])),
            "figures":len(j.get("figures",[])),
            "captions":[f.get("caption") for f in j.get("figures",[])],
        })
(ROOT/"summary.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2)+"\n")
print("Repaired v05-i01 prose candidates.")
