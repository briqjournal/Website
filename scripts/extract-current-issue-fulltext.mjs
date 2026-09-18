import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { extname, join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const issueKey = process.argv[2] || "7-3";

const issueOneRecords = [
  {
    slug: "uluslararasi-ticarette-dusuk-karbon-kurallarinda-ortaya-cikan-egilimler-ve-kusak-yol-girisimi",
    pages: [7, 28],
    body: { tr: 9, en: 8 },
    start: { tr: "Giriş", en: "Introduction" },
    metadata: { received: "2025-07-15", accepted: "2025-10-11" },
  },
  {
    slug: "iklim-degisikligi-baglaminda-su-kitligi-ve-kuresel-gida-krizi",
    pages: [29, 52],
    body: { tr: 31, en: 30 },
    start: { tr: "Giriş", en: "Introduction" },
    metadata: { received: "2025-09-17", accepted: "2025-11-01" },
  },
  {
    slug: "dunyanin-yeniden-duzenlenisi-bolgesel-bloklar-ve-cok-kutuplu-kuresel-yonetisimin-yukselisi",
    pages: [53, 90],
    body: { tr: 55, en: 54 },
    start: { tr: "Giriş", en: "Introduction" },
    metadata: { received: "2025-07-28", accepted: "2025-09-30" },
  },
  {
    slug: "islami-sistem-ve-uluslararasi-iliskilerin-demokratiklesmesi-uzerine-bir-arastirma",
    pages: [91, 120],
    body: { tr: 93, en: 92 },
    start: { tr: "Giriş", en: "Introduction" },
    metadata: { received: "2025-04-26", accepted: "2025-10-30" },
  },
  {
    slug: "cin-abd-iliskilerinin-gelecegi",
    pages: [121, 127],
    body: { tr: 121, en: 121 },
  },
];

const issueTwoRecords = [
  {
    slug: "sovyet-reformunun-tarihi-trajedisinden-bizi-kurtaran-ne-oldu-cinin-ekonomik-cagdaslasmasina-yon-0",
    pages: [7, 20],
    body: { tr: 9, en: 8 },
    start: { tr: "Giri", en: "Introduction" },
    metadata: { received: "2025-12-30", accepted: "2026-01-19" },
    sectionTitleReplacements: { "Giri ş": "Giriş" },
    publicationNote: {
      tr: "Bu makalenin Çincesi 《政治经济学研究》 (Politik Ekonomi Araştırmaları), Sayı 3 (2024)’te yayımlanmıştır. Öz ve anahtar kelimeler BRIQ tarafından hazırlanmıştır.",
      en: "The Chinese original of this article was published in 《政治经济学研究》 (Political Economy Research), Issue 3 (2024). The abstract and keywords were prepared by BRIQ.",
    },
    dropParagraphStarts: {
      tr: ["Bu makalenin Çincesi", "Öz ve anahtar kelimeler"],
      en: ["The abstract and keywords were provided by BRIQ"],
    },
  },
  {
    slug: "cine-ozgu-sosyalist-politik-ekonomiye-genel-bakis",
    pages: [21, 44],
    body: { tr: 23, en: 22 },
    start: { tr: "Giriş", en: "Introduction" },
    metadata: { received: "2026-01-13", accepted: "2026-02-08" },
    publicationNote: {
      tr: "Bu makale, Xinhua Jian’ın 2018’de yayımlanan 《中国特色社会主义政治经济学重大疑难问题研究》 (Çin’e Özgü Sosyalist Politik Ekonomide Başlıca ve Zor Sorunlar Üzerine İnceleme) adlı Çince kitabının 1–24. sayfalarında yer alan Giriş bölümünün çevirisidir. Öz ve anahtar kelimeler BRIQ tarafından hazırlanmıştır.",
      en: "This article is a translation of the Introduction on pages 1–24 of Xinhua Jian’s 2018 Chinese-language book 《中国特色社会主义政治经济学重大疑难问题研究》 (A Study of Major and Difficult Problems in Socialist Political Economy with Chinese Characteristics). The abstract and keywords were prepared by BRIQ.",
    },
    dropParagraphStarts: {
      tr: ["Bu makale, “Xinhua Jian’ın 2018’de yayımlanan"],
      en: ["This article is a translation of the Introduction section on pages 1-24"],
    },
  },
  {
    slug: "afrikada-yabanci-guclerin-mudahaleleri-elestirel-bir-degerlendirme",
    pages: [45, 70],
    body: { tr: 47, en: 46 },
    start: { tr: "Giriş", en: "Introduction" },
    metadata: { received: "2025-11-16", accepted: "2026-01-24" },
  },
  {
    slug: "uluslararasi-kalkinma-isbirliginin-ic-siyasal-mantigi-guneydogu-asyada-kusak-ve-yol-girisiminin",
    pages: [71, 98],
    body: { tr: 73, en: 72 },
    start: { tr: "Giriş", en: "Introduction" },
    metadata: { received: "2025-11-25", accepted: "2026-01-27" },
    sectionTitleReplacements: {
      "Teorik Çerçeve Hedef Ülkelerde Uluslararası Kalkınma İşbirliğinin Siyasallaşması: Kavramsal Tanım": "Teorik Çerçeve: Hedef Ülkelerde Uluslararası Kalkınma İşbirliğinin Siyasallaşması",
      "Siyasal Sorunların Devamlılığı (Issue Conti-": "Siyasal Sorunların Devamlılığı (Issue Continuation)",
      "Araçsal Siyasallaşma (Instrumental Politici-": "Araçsal Siyasallaşma (Instrumental Politicization)",
      "İdeolojik Siyasallaşma (Ideological Politi-": "İdeolojik Siyasallaşma (Ideological Politicization)",
      "“İşbirliği–Çatışma” Modeli ve Uluslararası": "“İşbirliği–Çatışma” Modeli ve Uluslararası Kalkınma İşbirliğinin İmkânsız Üçlemesi",
      "Düzenli Demokrasi ve Araçsal Siyasallaş-": "Düzenli Demokrasi ve Araçsal Siyasallaştırma: Kurumsal Siyasal Oyunlar",
      "Competitive Behaviour of External Major": "Competitive Behaviour of External Major Powers",
      "“Cooperation-Confrontation” Model and the Impossible Trinity of International Devel-": "“Cooperation-Confrontation” Model and the Impossible Trinity of International Development Cooperation",
      "Orderly Democracy and Instrumental Polit-": "Orderly Democracy and Instrumental Politicization: Institutional Political Games",
    },
    inlineSectionTitles: {
      tr: [
        "Siyasal Sorunların Devamlılığı (Issue Continuation)",
        "Araçsal Siyasallaşma (Instrumental Politicization)",
        "İdeolojik Siyasallaşma (Ideological Politicization)",
      ],
      en: ["Competitive Behaviour of External Major Powers"],
    },
    inlineParagraphLabels: {
      tr: ["Kamusal Siyaset Sürecinin Açıklığı", "İç Siyasal Bölünme", "Büyük Dış Güçlerin Rekabetçi Davranışı"],
      en: ["Instrumental Politicization", "Ideological Politicization", "Openness of Public Policy Process", "Domestic Political Division"],
    },
    leadingParagraphFragments: {
      tr: ["nuation): ", "zation): ", "cization): ", "Kalkınma İşbirliğinin İmkânsız Üçlemesi: ", "tırma: Kurumsal Siyasal Oyunlar: "],
      en: ["Powers: ", "opment Cooperation: ", "icization: Institutional Political Games: "],
    },
    paragraphTextReplacements: {
      en: {
        "First is Issue continuation. ": "**Issue Continuation:** ",
        "Specifically: Issue Continuation: ": "Specifically: **Issue Continuation:** ",
      },
    },
    dropSectionTitles: [",", "/"],
  },
  {
    slug: "hitlerin-sovyetler-birligine-karsi-savasi-ayni-zamanda-abd-icin-bir-vekalet-savasiydi",
    pages: [99, 116],
    body: { tr: 101, en: 100 },
    start: { tr: "Giriş", en: "Introduction" },
    metadata: { received: "2025-11-07", accepted: "2026-01-31" },
  },
  {
    slug: "japonyadaki-abd-isgaline-karsi-sag-ve-sol-arasinda-olasi-ittifak",
    pages: [117, 124],
    body: { tr: 119, en: 118 },
    start: { tr: "Giriş", en: "Introduction" },
    metadata: { received: "2025-09-22", accepted: "2026-01-15" },
    dropSectionTitles: ["Figure: JCP’s Strategic Shift from the A-B bloc to the A-C bloc"],
  },
];

const issueThreeRecords = [
  {
    slug: "kulturel-silinmeden-tarihsel-kurtarmaya-nishio-kanji-ve-amerikan-isgali-altindaki-japonyanin",
    pages: [7, 22],
    body: { tr: 9, en: 8 },
    start: { tr: "Giriş", en: "Introduction" },
  },
  {
    slug: "turkiyenin-kulturel-varliklari-geri-kazanma-mucadelesi",
    pages: [23, 28],
    body: { tr: 25, en: 24 },
    skipFirstPortrait: true,
  },
  {
    slug: "kultur-varliklarinin-yasadisi-ithalatinin-onlenmesi-ve-iadesine-iliskin-turkiye-ile-isvicre",
    pages: [29, 54],
    body: { tr: 31, en: 30 },
    start: { tr: "Giriş", en: "Introduction" },
  },
  {
    slug: "cinde-somut-olmayan-kulturel-mirasin-korunmasi-yirmi-yillik-deneyim-suregelen-zorluklar-ve-gelecege",
    pages: [55, 78],
    body: { tr: 57, en: 56 },
    start: { tr: "Giriş", en: "Introduction" },
    metadata: {
      received: "2026-01-15",
      accepted: "2026-04-15",
      correspondingAuthor: "Yang Xuyan",
    },
  },
  {
    slug: "anadolunun-kulturel-mirasini-koruma-ve-gelecege-aktarma-sorumlulugu",
    pages: [79, 84],
    body: { tr: 81, en: 80 },
    skipFirstPortrait: true,
  },
  {
    slug: "yagmalanan-iskit-altinlarinin-mirasi",
    pages: [85, 90],
    body: { tr: 87, en: 86 },
    skipFirstPortrait: true,
  },
  {
    slug: "mogolistanin-ucuncu-komsu-diplomasisinde-kurumsal-dengeleme-sanghay-isbirligi-orgutu-ile-etkilesim",
    pages: [91, 118],
    body: { tr: 93, en: 92 },
    start: { tr: "Giriş", en: "Introduction" },
    metadata: { received: "2026-02-06", accepted: "2026-04-20" },
  },
  {
    slug: "kusak-ve-yolun-guvenligi-ozel-guvenlik-risk-ve-cinin-kuresel-genislemesi",
    pages: [119, 122],
    body: { tr: 119, en: 119 },
    startContains: {
      tr: "ÇIN’IN ÖNCÜLÜĞÜNDE ORTAYA ATILAN",
      en: "As China’s Belt and Road Initiative",
    },
  },
];

const issueFourRecords = [
  {
    slug: "suudi-arabistanin-abd-ile-cin-arasinda-cok-boyutlu-kulturel-dengeleme-stratejisi",
    pages: [7, 36],
    body: { tr: 9 },
    start: { tr: "Giriş" },
    sectionTitleReplacements: {
      "Literatür Taraması Hedging Teorisi ve Orta Güçler": "Literatür Taraması: Hedging Teorisi ve Orta Güçler",
    },
    captions: [
      "Suudi Arabistan’ın Vizyon 2030 ile ekonomik ve toplumsal dönüşüm hedefi (Fotoğraf: Soul of Saudi, 2025).",
      "Çin Devlet Başkanı Xi Jinping ve Suudi Arabistan Veliaht Prensi Muhammed bin Salman El Suud, Pekin, 22 Şubat 2019 (Fotoğraf: Xinhua, 2019).",
      "Yumuşak gücün kültür, medya, eğitim ve diğer bileşenleri.",
      "Suudi-Amerikan Yükseköğretim Ortaklıkları Forumu’nun açılışı, Riyad, 20 Kasım 2024 (Fotoğraf: Suudi Arabistan Eğitim Bakanlığı, 2024).",
      "Suudi-Çin Kültür Yılı 2025 yürütme programının imza töreni, Pekin, 17 Ekim 2024 (Fotoğraf: Saudi Press Agency, 2024).",
      "Cidde Wisdom House Çin Eğitim Enstitüsü’nde Çince dersi, 20 Ekim 2024 (Fotoğraf: Su Yunhua/Nanfang+, 2024).",
      "Tablo 1: Suudi Arabistan’da Dilsel ve Akademik Angajman Göstergeleri: ABD ve Çin",
      "Tablo 2: Suudi Arabistan’da ABD ve Çin’in Oyun Stratejileri",
      "Tablo 3: Suudi Arabistan’ın Film ve Animasyona Yönelik İki Kanallı Yaklaşımı",
      "Şekil 1: Yemek Diplomasisinin Karşılaştırmalı Ölçeği: Suudi Arabistan’da ABD QSR Zincirleri ve Çin Restoranları (2025)",
      "Tablo 4: Suudi Arabistan’da Çin ve ABD’nin Karşılaştırmalı Medya Görünürlüğü",
      "Tablo 5: Suudi Hükümet Medyasının Anlatıları",
      "Şekil 2: Suudi Arabistan’ın Çin ve ABD’yle Tahminî Haftalık İşletilen Uçuşlarının Karşılaştırılması",
      "Şekil 3: 2022–2025 Döneminde Çinli ve ABD’li Ziyaretçilerin Karşılaştırmalı Çizgi Grafiği",
      "Tablo 6: Suudi Arabistan’ın Eğitim ve Kültür Değişimlerine İlişkin Karşılaştırmalı Göstergeler: ABD ve Çin (2025)",
      "Tablo 7: Karşılaştırmalı Kültürel ve Bilimsel İşbirlikleri (2020–2025)",
      "Tablo 8: Birincil Veri Kaynakları ve Yöntemsel Notlar (1/2)",
      "Tablo 8: Birincil Veri Kaynakları ve Yöntemsel Notlar (2/2)",
    ],
  },
  {
    slug: "turkiye-cin-diplomatik-iliskilerinin-55-yilinda-avrasyada-guc-gecisi-ve-jeoekonomik-baglantisallik",
    pages: [37, 56],
    body: { tr: 39 },
    start: { tr: "Giriş" },
    captions: [
      "Orta Koridor’un Orta Asya ve Türkiye üzerinden Çin ile Avrupa arasındaki bağlantısı (Harita: Valdai Club, 2023).",
      "Cumhurbaşkanı Recep Tayyip Erdoğan ve Çin Devlet Başkanı Xi Jinping, Astana, 4 Temmuz 2024 (Fotoğraf: CGTN, 2024).",
      "Tablo 1: Transit ülke ile ortak üretim merkezi ayrımında kullanılan göstergeler",
      "Tablo 2: Araştırma sorusuna ilişkin gösterge temelli değerlendirme",
      "Avrasya ulaştırma koridorları: Türkiye’nin Avrupa, Orta Asya, Çin, Orta Doğu ve Afrika ile bağlantıları (Harita: BRIQ, 2026).",
      "Türkiye-Çin ilişkilerinde ekonomik karşılıklılık, kurumsallaşmış bağlantısallık ve sürekli diplomatik diyalog (Çizim: The Daily CPEC, 2025).",
    ],
  },
  {
    slug: "dijital-ipek-yolu-cercevesinde-cin-arap-isbirligi-urdun-ornegi",
    pages: [57, 76],
    body: { tr: 59 },
    start: { tr: "Giriş" },
    captions: [
      "Dijital İpek Yolu ve dijital bağlantısallık (Fotoğraf: CGTN, 2021).",
      "BeiDou Uydu Navigasyon Sistemi’nin küresel kapsama alanı (Fotoğraf: Xinhua, 2024).",
      "Ürdün’ün dijital dönüşümünün politika aşamaları (Çizim: mozon-tech, t.y.).",
      "Ürdün’de bilgi ve iletişim teknolojileri sektörü (Çizim: Jordan News Agency, 2026).",
      "Çin Dışişleri Bakanı Wang Yi ve Ürdün Kralı II. Abdullah, Amman, 15 Aralık 2025 (Fotoğraf: China Daily, 2025).",
      "Ürdün Yatırım Bakanı Tareq Abughazaleh, Çin Uluslararası Tedarik Zinciri Fuarı, 23 Haziran 2026 (Fotoğraf: Jordan News Agency, 2026).",
      "2026 Ürdün Endüstriyel İşletim Sistemleri Güvenlik Forumu (Fotoğraf: Jordan News Agency, 2026).",
      "Ürdün’ün ulusal dijital dönüşüm stratejisi ve dijital kapsayıcılık hedefi (Fotoğraf: TechAfricanews, 2026).",
    ],
  },
  {
    slug: "filistinciligin-zirve-paradoksu-transatlantik-kamuoyu-stratejik-realizm-ve-iki-devletli-cozumun",
    pages: [77, 106],
    body: { tr: 79 },
    start: { tr: "Giriş" },
    sectionTitleReplacements: {
      "SuudiArabistan-İsrail İlişkilerinin Seyri": "Suudi Arabistan-İsrail İlişkilerinin Seyri",
      "JST Argümanının Geliştirilmesi": "İki Devletli Çözümün Sonu: JST Argümanının Geliştirilmesi",
    },
    captions: [
      "Filistin Devleti’ni tanıyan ülkeler, 22 Eylül 2025 (Harita: IMEMC, 2025).",
      "Gazze şehrine yönelik saldırılar nedeniyle Nasr’dan ayrılan Filistinli aileler, 21 Eylül 2025 (Fotoğraf: VCG, 2025).",
      "Tablo 1: İsrail-Filistin’e ilişkin başlıca transatlantik kamuoyu araştırmaları, Ekim 2023–2026",
      "Tablo 1’in devamı",
      "Filistin yanlısı protesto gösterisi, Roma, 22 Eylül 2025 (Fotoğraf: Li Jing/Xinhua, 2025).",
      "Gazze şehrinin Zeitoun mahallesinde enkaz arasında yürüyen halk, 27 Kasım 2025 (Fotoğraf: China Daily, 2025).",
      "Seyyed Hasan Nasrallah’ın fotoğraflarını taşıyan destekçileri, Saida, 28 Eylül 2024 (Fotoğraf: CGTN, 2024).",
      "Hindistan-Orta Doğu-Avrupa Koridoru (Harita: IMEC, t.y.).",
      "Batı Şeria’daki yerleşim yayılımı (Grafik: Arab News, 2026).",
    ],
  },
  {
    slug: "mao-zedungun-diyalektik-anlayisi-ekonomik-determinizm-elestirisi-siyasal-ozne-ve-cin-dusunce",
    pages: [107, 126],
    body: { tr: 109 },
    start: { tr: "Giriş" },
    captions: [
      "Çin’in Parti ve Devlet liderleri Mao Zedung Anıt Salonu’nda, Pekin (Fotoğraf: Ju Peng/China Daily, 2023).",
      "Yijing’de Luoshu ve Hetu diyagramları.",
      "Mao Zedung’un Yan’an’da Yangjialing köylüleriyle görüşmesi (Fotoğraf: CPC News, 2025).",
      "Mao Zedung’un Kızıl Muhafızlar ile devrimci öğretmen ve öğrenci temsilcilerini kabulü, 18 Ağustos 1966 (Fotoğraf: Mao Zedong Database, 1966).",
      "Büyük İleri Atılım sırasında kitlesel emek seferberliği, Hubei, 1958 (Fotoğraf: China Photographers Association, 2021).",
      "Mao Zedung ve Josef Stalin, Moskova, 21 Aralık 1949 (Fotoğraf: Russian State Central Museum of Cinema and Photography, 2021).",
    ],
  },
  {
    slug: "cinin-kuresel-altyapi-stratejisi",
    pages: [127, 130],
    body: { tr: 127 },
    startContains: { tr: "KUŞAK VE YOL GİRİŞİMİ (KYG) LİTERATÜRÜNÜN" },
    captions: [
      "Austin Strange, Chinese Global Infrastructure (Cambridge University Press, 2024).",
      "Çin, Kuşak ve Yol Girişimi altyapısını geliştirmeyi sürdürüyor (Çizim: Tang Tengfei/Global Times, 2023).",
    ],
  },
];

const issueSixTwoRecords = [
  {
    slug: "modernist-milliyetci-olarak-sun-yat-sen-ve-siyasal-mirasi",
    pages: [7, 28],
    body: { tr: 9, en: 8 },
    start: { tr: "Giriş", en: "Introduction" },
  },
  {
    slug: "cinin-erken-modernizasyonuna-sun-yat-senin-katkisi",
    pages: [29, 44],
    body: { tr: 31, en: 30 },
    start: { tr: "Giriş", en: "Introduction" },
  },
  {
    slug: "cinli-devrimcilerin-sun-yat-sen-ve-mustafa-kemal-arasindaki-benzerlikler-uzerine-gorusleri",
    pages: [45, 58],
    body: { tr: 47, en: 46 },
    start: { tr: "Giriş", en: "Introduction" },
  },
  {
    slug: "sun-yat-senin-olumunun-13-yildonumu-ve-japonyaya-karsi-savasta-hayatini-kaybeden-askerler-icin",
    pages: [59, 64],
    body: { tr: 59, en: 59 },
    autoHeadings: false,
  },
  {
    slug: "osaka-mainichi-shimbun-gazetesinin-sun-yat-sen-ile-roportaji-23-kasim-1924-dogu-asyali-bir-ulke",
    pages: [65, 70],
    body: { tr: 65, en: 65 },
  },
  {
    slug: "yukselen-orta-guclerin-denge-diplomasisi-kavramlar-saikler-ve-cikarimlar",
    pages: [71, 84],
    body: { tr: 73, en: 72 },
    start: { tr: "Giriş", en: "Introduction" },
  },
  {
    slug: "alter-kuresellesme-baglaminda-cin-fransiz-iliskileri",
    pages: [85, 107],
    body: { tr: 87, en: 86 },
    start: { tr: "Giriş", en: "Introduction" },
  },
  {
    slug: "kamu-diplomasisi-ozbekistanin-yabanci-ulkelerle-iliskilerini-guclendirmenin-bir-yolu",
    pages: [109, 112],
    body: { tr: 109, en: 109 },
  },
  {
    slug: "hikaye-siir",
    pages: [113, 114],
    body: { tr: 114, en: 114 },
  },
  {
    slug: "olu-su-siir",
    pages: [115, 116],
    body: { tr: 116, en: 116 },
  },
  {
    slug: "ogonyok",
    pages: [117, 117],
    body: { tr: 117, en: 117 },
  },
  {
    slug: "qi-baishi",
    pages: [118, 118],
    body: { tr: 118, en: 118 },
  },
  {
    slug: "t-miyano-renkli-tasbaski",
    pages: [119, 119],
    body: { tr: 119, en: 119 },
  },
];

const issueConfigs = {
  "6-2": {
    pdfs: {
      tr: join(root, "tmp/pdfs/v6i2-tr.pdf"),
      en: join(root, "tmp/pdfs/v6i2-en.pdf"),
    },
    records: issueSixTwoRecords,
    sourceLocale: { tr: "tr", en: "en" },
  },
  "7-1": {
    pdfs: {
      tr: join(root, "tmp/pdfs/v7i1-tr.pdf"),
      en: join(root, "tmp/pdfs/v7i1-en.pdf"),
    },
    records: issueOneRecords,
    sourceLocale: { tr: "tr", en: "en" },
    extractImages: false,
  },
  "7-2": {
    pdfs: {
      tr: join(root, "tmp/pdfs/v7i2-tr.pdf"),
      en: join(root, "tmp/pdfs/v7i2-en.pdf"),
    },
    records: issueTwoRecords,
    sourceLocale: { tr: "tr", en: "en" },
    extractImages: false,
  },
  "7-3": {
    pdfs: {
      tr: join(root, "public/assets/issues/briq-cilt-7-sayi-3-yaz-2026-tr.pdf"),
      en: join(root, "public/assets/issues/briq-cilt-7-sayi-3-yaz-2026.pdf"),
    },
    records: issueThreeRecords,
    sourceLocale: { tr: "tr", en: "en" },
  },
  "7-4": {
    pdfs: {
      tr: join(root, "public/assets/issues/briq-cilt-7-sayi-4-sonbahar-2026.pdf"),
      en: join(root, "public/assets/issues/briq-cilt-7-sayi-4-sonbahar-2026.pdf"),
    },
    records: issueFourRecords,
    sourceLocale: { tr: "tr", en: "tr" },
  },
};

const issueConfig = issueConfigs[issueKey];
if (!issueConfig) throw new Error(`Unknown issue ${issueKey}. Use 6-2, 7-1, 7-2, 7-3, or 7-4.`);
const { pdfs, records } = issueConfig;

const exactHeadings = new Set([
  "Giriş", "Giri ş", "Introduction", "Sonuç", "Conclusion", "Conclusions", "Kaynakça", "References",
  "Notlar", "Notes", "Teşekkür", "Acknowledgements", "Acknowledgments",
]);

function decodeEntities(value) {
  return value
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replace(/\s+/g, " ")
    .trim();
}

function parseXml(xml) {
  const pages = [];
  const fonts = new Map();
  for (const match of xml.matchAll(/<fontspec\b[^>]*id="(\d+)"[^>]*size="([\d.]+)"[^>]*family="([^"]*)"[^>]*color="([^"]*)"\s*\/>/g)) {
    fonts.set(match[1], { size: Number(match[2]), family: match[3], color: match[4] });
  }
  for (const pageMatch of xml.matchAll(/<page\b[^>]*number="(\d+)"[^>]*>([\s\S]*?)<\/page>/g)) {
    const pageNumber = Number(pageMatch[1]);
    const body = pageMatch[2];
    const nodes = [];
    for (const match of body.matchAll(/<text\b[^>]*top="([\d.]+)"[^>]*left="([\d.]+)"[^>]*width="([\d.]+)"[^>]*height="([\d.]+)"[^>]*font="(\d+)"[^>]*>([\s\S]*?)<\/text>/g)) {
      const text = decodeEntities(match[6]);
      if (!text) continue;
      nodes.push({
        page: pageNumber,
        top: Number(match[1]),
        left: Number(match[2]),
        width: Number(match[3]),
        height: Number(match[4]),
        font: fonts.get(match[5]) || { size: 0, family: "", color: "" },
        text,
        bold: /<(?:b|strong)>/i.test(match[6]),
      });
    }
    pages.push({ number: pageNumber, nodes });
  }
  return pages;
}

function dehyphenatedJoin(left, right) {
  if (/[-‐‑]$/u.test(left) && /^[a-zçğıöşü]/u.test(right)) return `${left.slice(0, -1)}${right}`;
  return `${left} ${right}`;
}

function isNoise(node) {
  const { text, top, font } = node;
  if (top < 108 || top > 1055) return true;
  if (/^\d{1,4}$/.test(text)) return true;
  if (/^B\s*R\s*I\s*[Qq]/.test(text)) return true;
  if (/^(RÖPORTAJ|INTERVIEW|KİTAP İNCELEME|BOOK REVIEW)$/.test(text)) return true;
  if (/Gotham|Bebas/i.test(font.family)) return true;
  if (/MyriadPro-Semibold|CronosPro/i.test(font.family)) return true;
  return false;
}

function looksLikeCaption(node) {
  if (/^(?:Tablo|Table|Şekil|Figure)\s+\d+\s*[:.]/iu.test(node.text)) return true;
  if (/^(?:Tablo|Table|Şekil|Figure).*(?:hazırlanmıştır|oluşturulmuştur|prepared by)/iu.test(node.text)) return true;
  return node.font.size <= 13 && /(Fotoğraf|Photo|Harita|Map|Kaynak|Source):/i.test(node.text);
}

function looksLikeCanonicalSectionHeading(node) {
  return node.bold
    && node.font.size >= 16
    && node.font.size <= 17
    && /MyriadPro-Semibold/i.test(node.font.family)
    && /^#(?:bc2628|d11f27)$/i.test(node.font.color)
    && !/^(?:ABSTRACT|ÖZ|Keywords:|Anahtar Kelimeler:)$/iu.test(node.text);
}

function looksLikeHeading(node) {
  if (exactHeadings.has(node.text)) return true;
  if (node.text.length > 105) return false;
  if (node.bold && /\?$/.test(node.text)) return true;
  if (/[.!:;]$/.test(node.text)) return false;
  if (node.font.size < 15 || node.font.size > 19) return false;
  const color = node.font.color.match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  if (color) {
    const channels = color.slice(1).map((value) => Number.parseInt(value, 16));
    if (Math.max(...channels) > 80 && Math.max(...channels) - Math.min(...channels) > 35) return true;
  }
  if (node.bold && node.text.split(/\s+/).length <= 12) return true;
  return false;
}

function extractBlocks(pages, config, locale) {
  const selected = pages.filter((page) => page.number >= config.body[locale] && page.number <= config.pages[1]);
  const blocks = [];
  const captions = [];
  let paragraph = "";
  let heading = "";
  let started = !config.start?.[locale] && !config.startContains?.[locale];
  let mode = "body";
  let captionTail = null;

  const flushParagraph = () => {
    const value = paragraph.replace(/\s+/g, " ").trim();
    if (value.length > 1) blocks.push({ kind: "paragraph", text: value });
    paragraph = "";
  };
  const flushHeading = () => {
    const value = heading.replace(/\s+/g, " ").trim();
    if (value) blocks.push({ kind: "heading", text: value });
    heading = "";
  };

  for (const page of selected) {
    for (const node of page.nodes) {
      const canonicalSectionHeading = looksLikeCanonicalSectionHeading(node);
      if (isNoise(node) && !exactHeadings.has(node.text) && !canonicalSectionHeading) continue;
      if (captionTail && node.page === captionTail.page && node.top > captionTail.top && node.top - captionTail.top <= 42 && node.font.size <= 18) {
        captions[captions.length - 1] = dehyphenatedJoin(captions[captions.length - 1], node.text);
        captionTail = { page: node.page, top: node.top };
        continue;
      }
      captionTail = null;
      if (looksLikeCaption(node)) {
        captions.push(node.text);
        captionTail = { page: node.page, top: node.top };
        continue;
      }
      const explicitHeading = exactHeadings.has(node.text);
      const minimumFontSize = mode === "body" ? 14 : 10;
      if (!explicitHeading && (node.font.size < minimumFontSize || node.font.size > 19)) continue;
      if (/^(Jason Morgan|Nuray Ekşi|Li Ning|Wang Jiani).+ - /i.test(node.text)) continue;

      if (!started) {
        const exact = config.start?.[locale];
        const contains = config.startContains?.[locale];
        if ((exact && node.text === exact) || (contains && node.text.includes(contains))) started = true;
        else continue;
      }

      if (canonicalSectionHeading || (config.autoHeadings !== false && looksLikeHeading(node))) {
        flushParagraph();
        if (heading) heading = dehyphenatedJoin(heading, node.text);
        else heading = node.text;
        if (node.text === "Kaynakça" || node.text === "References") mode = "references";
        else if (node.text === "Notlar" || node.text === "Notes") mode = "notes";
        else if (/^(Teşekkür|Acknowledg(?:e)?ments?)$/.test(node.text)) mode = "acknowledgements";
        continue;
      }
      flushHeading();

      const columnBase = node.left > 420 ? 433 : 105;
      const isIndented = node.left - columnBase >= 13 && node.left - columnBase <= 30;
      const isAtColumnBase = Math.abs(node.left - columnBase) <= 7;
      if (mode === "references" && isAtColumnBase && paragraph) flushParagraph();
      else if (mode !== "references" && isIndented && paragraph && /[.!?…”’)]$/.test(paragraph)) flushParagraph();
      paragraph = paragraph ? dehyphenatedJoin(paragraph, node.text) : node.text;
    }
  }
  flushParagraph();
  flushHeading();

  return { blocks, captions };
}

function splitSpecialSections(blocks, locale) {
  const labels = locale === "tr"
    ? { notes: "Notlar", refs: "Kaynakça", ack: "Teşekkür" }
    : { notes: "Notes", refs: "References", ack: /Acknowledg(?:e)?ments?/ };
  const positions = { notes: -1, refs: -1, ack: -1 };
  blocks.forEach((block, index) => {
    if (block.kind !== "heading") return;
    if (block.text === labels.notes) positions.notes = index;
    if (block.text === labels.refs) positions.refs = index;
    if (typeof labels.ack === "string" ? block.text === labels.ack : labels.ack.test(block.text)) positions.ack = index;
  });
  const special = Object.values(positions).filter((value) => value >= 0).sort((a, b) => a - b);
  const bodyEnd = special[0] ?? blocks.length;
  const body = blocks.slice(0, bodyEnd);
  const sliceAfter = (key) => {
    const start = positions[key];
    if (start < 0) return [];
    const next = special.find((value) => value > start) ?? blocks.length;
    return blocks.slice(start + 1, next);
  };
  return { body, notes: sliceAfter("notes"), references: sliceAfter("refs"), acknowledgements: sliceAfter("ack") };
}

function blocksToSections(blocks, locale) {
  const untitled = locale === "tr" ? "Tam metin" : "Full text";
  const sections = [];
  let current = { title: untitled, paragraphs: [] };
  for (const block of blocks) {
    if (block.kind === "heading") {
      if (current.paragraphs.length) sections.push(current);
      current = { title: block.text, paragraphs: [] };
    } else if (block.text.length > 40) {
      current.paragraphs.push(block.text);
    }
  }
  if (current.paragraphs.length) sections.push(current);
  return sections.map((section, index) => ({
    id: `${locale}-section-${index + 1}`,
    title: section.title,
    paragraphs: section.paragraphs,
  }));
}

function normalizeParagraph(value, record, locale) {
  let normalized = value;
  for (const fragment of record.leadingParagraphFragments?.[locale] || []) {
    if (normalized.startsWith(fragment)) normalized = normalized.slice(fragment.length);
  }
  for (const [from, to] of Object.entries(record.paragraphTextReplacements?.[locale] || {})) {
    normalized = normalized.replaceAll(from, to);
  }
  for (const label of record.inlineParagraphLabels?.[locale] || []) {
    normalized = normalized.replaceAll(`${label}:`, `**${label}:**`);
  }
  return normalized.trim();
}

function normalizeSectionTitles(sections, record, locale) {
  const replacements = record.sectionTitleReplacements || {};
  const normalized = sections.map((section) => ({
    ...section,
    title: replacements[section.title] || section.title,
    paragraphs: section.paragraphs
      .map((paragraph) => normalizeParagraph(paragraph, record, locale))
      .filter((paragraph) => !(record.dropParagraphStarts?.[locale] || []).some((prefix) => paragraph.startsWith(prefix))),
  }));
  const dropped = new Set(record.dropSectionTitles || []);
  const inline = new Set(record.inlineSectionTitles?.[locale] || []);
  return normalized.reduce((result, section) => {
    if (inline.has(section.title) && result.length) {
      const [first = "", ...rest] = section.paragraphs;
      result[result.length - 1].paragraphs.push(`**${section.title}:** ${first}`.trim(), ...rest);
    } else if (dropped.has(section.title) && result.length) {
      result[result.length - 1].paragraphs.push(...section.paragraphs);
    } else {
      result.push(section);
    }
    return result;
  }, []);
}

function parseNumberedNotes(blocks) {
  const text = blocks.map((block) => block.text).join(" ").replace(/\s+/g, " ").trim();
  if (!text) return [];
  const starts = [...text.matchAll(/(?:^|\s)(\d{1,2})\s+(?=[A-ZÇĞİÖŞÜ])/g)];
  if (!starts.length) return [];
  return starts.map((match, index) => ({
    id: match[1],
    text: text.slice(match.index + match[0].length - 1, starts[index + 1]?.index ?? text.length).replace(/^\d{1,2}\s+/, "").trim(),
  }));
}

function parseReferences(blocks) {
  return blocks
    .filter((block) => block.kind === "paragraph" && block.text.length > 8)
    .map((block, index) => ({ id: `ref-${index + 1}`, text: block.text.replace(/\s+/g, " ").trim() }));
}

function extractImages(record) {
  const temp = mkdtempSync(join(tmpdir(), "briq-images-"));
  const outputDir = join(root, "public/assets/article-figures", record.slug);
  rmSync(outputDir, { recursive: true, force: true });
  mkdirSync(outputDir, { recursive: true });
  execFileSync("pdfimages", ["-f", String(record.pages[0]), "-l", String(record.pages[1]), "-png", pdfs.tr, join(temp, "image")]);
  const candidates = readdirSync(temp).filter((name) => extname(name) === ".png").sort();
  const usable = [];
  for (const name of candidates) {
    const path = join(temp, name);
    const dimensions = execFileSync("identify", ["-format", "%w %h", path], { encoding: "utf8" }).trim().split(" ").map(Number);
    const colorspace = execFileSync("identify", ["-format", "%[colorspace]", path], { encoding: "utf8" }).trim();
    if (dimensions[0] >= 400 && dimensions[1] >= 250 && !/^gray/i.test(colorspace)) usable.push(path);
  }
  if (record.skipFirstPortrait) usable.shift();
  const results = [];
  usable.forEach((path, index) => {
    const filename = `figure-${String(index + 1).padStart(2, "0")}.jpg`;
    execFileSync("convert", [path, "-strip", "-quality", "86", join(outputDir, filename)]);
    results.push(`/assets/article-figures/${record.slug}/${filename}`);
  });
  rmSync(temp, { recursive: true });
  return results;
}

function extractKeywords(record, locale) {
  const raw = execFileSync("pdftotext", ["-raw", "-f", String(record.pages[0]), "-l", String(Math.min(record.pages[0] + 2, record.pages[1])), pdfs[locale], "-"], { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
  const marker = locale === "tr" ? /Anahtar\s+Kelimeler\s*:/iu : /Keywords\s*:/iu;
  const match = marker.exec(raw);
  if (!match) return [];
  const value = raw
    .slice(match.index + match[0].length, match.index + match[0].length + 500)
    .split(/\.\s*(?:\n|\f)/)[0]
    .replace(/-\s*\n\s*(?=[a-zçğıöşü])/giu, "")
    .replace(/\s*\n\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return value.split(/,\s*/).map((keyword) => keyword.trim()).filter((keyword) => keyword.length > 1 && keyword.length < 90);
}

const temp = mkdtempSync(join(tmpdir(), "briq-fulltext-"));
const parsed = {};
for (const locale of ["tr", "en"]) {
  const xmlPath = join(temp, `${locale}.xml`);
  execFileSync("pdftohtml", ["-xml", "-hidden", pdfs[locale], xmlPath], { stdio: "ignore" });
  parsed[locale] = parseXml(readFileSync(xmlPath, "utf8"));
}

const result = {};
for (const record of records) {
  const imagePaths = issueConfig.extractImages === false ? [] : extractImages(record);
  result[record.slug] = { metadata: record.metadata || {}, tr: null, en: null };
  for (const locale of ["tr", "en"]) {
    const sourceLocale = issueConfig.sourceLocale[locale];
    const extracted = extractBlocks(parsed[sourceLocale], record, sourceLocale);
    const special = splitSpecialSections(extracted.blocks, sourceLocale);
    result[record.slug][locale] = {
      sections: normalizeSectionTitles(blocksToSections(special.body, locale), record, locale),
      keywords: extractKeywords(record, locale),
      publicationNote: record.publicationNote?.[locale],
      footnotes: parseNumberedNotes(special.notes),
      references: parseReferences(special.references),
      acknowledgements: special.acknowledgements.map((block) => block.text).join(" ").trim(),
      figures: imagePaths.map((src, index) => ({
        id: `figure-${index + 1}`,
        src,
        caption: record.captions?.[index] || extracted.captions[index] || (locale === "tr" ? `Görsel ${index + 1}` : `Visual ${index + 1}`),
      })),
    };
  }
}

const catalogPath = join(root, "content/catalog.json");
const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
for (const [slug, value] of Object.entries(result)) {
  const outputPath = join(root, "content/articles", slug, "fulltext/current.json");
  mkdirSync(resolve(outputPath, ".."), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(value, null, 2)}\n`);
  if (!catalog.fulltext.current.includes(slug)) catalog.fulltext.current.push(slug);
}
writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
rmSync(temp, { recursive: true });
console.log(`Generated modular HTML full text for ${records.length} articles from issue ${issueKey}.`);
