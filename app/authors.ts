import { archiveArticles, type ArchiveArticle } from "./archive";
import { advisoryBoard, editorialBoard, editors } from "./site-data";

export type Locale = "tr" | "en";

export type BriqAppointment = {
  roleTr: string;
  roleEn: string;
  termTr: string;
  termEn: string;
};

export type AuthorProfile = {
  id: string;
  name: string;
  affiliationTr: string;
  affiliationEn: string;
  email?: string;
  orcids: string[];
  institutionUrl?: string;
  scholarUrl: string;
  photo?: string;
  rolesTr: string[];
  rolesEn: string[];
  biographyTr: string;
  biographyEn: string;
  briqAppointments: BriqAppointment[];
  articles: ArchiveArticle[];
};

type AuthorMetadata = {
  tr?: string;
  en?: string;
  email?: string;
  orcids?: string[];
  institutionUrl?: string;
  appointmentTermTr?: string;
  appointmentTermEn?: string;
  biographyTr?: string;
  biographyEn?: string;
};

const genericBylines = new Set(["admin", "briq", "briqjournal", "Pekin Bildirgesi", "Beijing Declaration"]);

const profilePhotos: Record<string, string> = {
  "Fikret Akfırat": "/assets/people/fikret-akfirat.jpg",
  "Mehmet Adnan Akfırat": "/assets/people/mehmet-adnan-akfirat.jpg",
  "Rafet Ballı": "/assets/people/rafet-balli.jpg",
  "Latif Bolat": "/assets/people/latif-bolat.jpg",
  "Necati Demircan": "/assets/people/necati-demircan.jpg",
  "Salih Ertan": "/assets/people/salih-ertan.jpg",
  "Hande Günözü": "/assets/people/hande-gunozu.jpg",
  "Hüseyin Haydar": "/assets/people/huseyin-haydar.jpg",
  "Ceyhun İlsever": "/assets/people/ceyhun-ilsever.jpg",
  "Şiir Kılkış": "/assets/people/siir-kilkis.jpg",
  "Serhat Latifoğlu": "/assets/people/serhat-latifoglu.jpg",
  "Uğur Murat Leloğlu": "/assets/people/ugur-murat-leloglu.jpg",
  "Ebru Şahin": "/assets/people/ebru-sahin.jpg",
  "Tülin Uygur": "/assets/people/tulin-uygur.jpg",
  "Yang Chen": "/assets/people/yang-chen.png",
  "Cankut Bagana": "/assets/people/cankut-bagana.jpg",
  "Keith Bennett": "/assets/people/keith-bennett.jpg",
  "Cheng Enfu": "/assets/people/cheng-enfu.jpg",
  "Radhika Desai": "/assets/people/radhika-desai.webp",
  "Ding Xiaoqin": "/assets/people/ding-xiaoqin.jpeg",
  "Francisco Dominguez": "/assets/people/francisco-dominguez.png",
  "Guo Changgang": "/assets/people/guo-changgang.jpg",
  "Efe Can Gürcan": "/assets/people/efe-can-gurcan.jpg",
  "Emin Gürses": "/assets/people/emin-gurses.jpg",
  "Han Zhimin": "/assets/people/han-zhimin.jpeg",
  "Faik Işık": "/assets/people/faik-isik.jpg",
  "Birol Kılkış": "/assets/people/birol-kilkis.jpg",
  "Murat Kolbaşı": "/assets/people/murat-kolbasi.jpg",
  "Semih Koray": "/assets/people/semih-koray.jpg",
  "David Laibman": "/assets/people/david-laibman.jpg",
  "Euclides Mance": "/assets/people/euclides-mance.jpg",
  "Ethem Sancak": "/assets/people/ethem-sancak.jpg",
  "Sun Degang": "/assets/people/sun-degang.jpg",
  "Wu Keming": "/assets/people/wu-keming.jpg",
  "Li Xi": "/assets/people/li-xi.jpg",
  "Ardan Zentürk": "/assets/people/ardan-zenturk.jpg",
  "Mustafa Altınkaya": "/assets/people/mustafa-altinkaya.jpg",
  "Tolga Dişçi": "/assets/people/tolga-disci.jpg",
  "Jessica Durdu": "/assets/people/jessica-durdu.jpg",
  "Elif Erkeç": "/assets/people/elif-erkec.jpg",
  "Sean Thomas McKenna": "/assets/people/sean-thomas-mckenna.jpg",
  "Ece Kırbaş Perinçek": "/assets/people/ece-kirbas-perincek.jpg",
  "Şafak Terzi": "/assets/people/safak-terzi.jpg",
  "Arda Tunçel": "/assets/people/arda-tuncel.jpg",
  "Ye Zhangxu": "/assets/people/ye-zhangxu.jpg",
};

const boardAffiliationsEn: Record<string, string> = {
  "Genel Yayın Yönetmeni": "Editor-in-Chief",
  "Türk-Çin İş Der Genel Başkanı": "President, China Business Development and Friendship Association",
  "Gazeteci-Yazar": "Journalist and author",
  "Müzisyen, besteci ve folklor uzmanı": "Musician, composer, and folklore specialist",
  "Şanghay Üniversitesi": "Shanghai University",
  "Elektrik Mühendisi": "Electrical engineer",
  "İstanbul Üniversitesi Konservatuvarı": "Istanbul University Conservatory",
  "Şair": "Poet",
  "Okan Üniversitesi": "Okan University",
  "ODTÜ · TÜBİTAK": "Middle East Technical University · TÜBİTAK",
  "Serbest Fon Yöneticisi": "Independent fund manager",
  "Türk Hava Kurumu Üniversitesi": "University of Turkish Aeronautical Association",
  "Dokuz Eylül Üniversitesi": "Dokuz Eylül University",
  "Onur Air Yönetim Kurulu Başkanı": "Chairman of the Board, Onur Air",
  "Friends of Socialist China": "Friends of Socialist China",
  "Çin Sosyal Bilimler Akademisi": "Chinese Academy of Social Sciences",
  "Manitoba Üniversitesi": "University of Manitoba",
  "Dünya Politik Ekonomi Derneği": "World Association for Political Economy",
  "Venezuela Dayanışma Kampanyası": "Venezuela Solidarity Campaign",
  "Şanghay Sosyal Bilimler Akademisi": "Shanghai Academy of Social Sciences",
  "London School of Economics": "London School of Economics",
  "Yeditepe Üniversitesi": "Yeditepe University",
  "Şanghay Uluslararası Çalışmalar Üniversitesi": "Shanghai International Studies University",
  "Avukat": "Lawyer",
  "OSTİM Teknik Üniversitesi": "OSTİM Technical University",
  "DEİK Asya Pasifik İş Konseyleri": "DEİK Asia-Pacific Business Councils",
  "Bilkent Üniversitesi": "Bilkent University",
  "Brooklyn College": "Brooklyn College",
  "Kurtuluş Felsefesi Enstitüsü": "Institute for the Philosophy of Liberation",
  "ES Yatırım": "ES Investment",
  "Fudan Üniversitesi": "Fudan University",
  "Emekli Büyükelçi": "Retired ambassador",
  "Kuzeybatı Politeknik Üniversitesi": "Northwestern Polytechnical University",
  "İTÜ TMDK": "ITU Turkish Music State Conservatory",
  "Hacettepe Üniversitesi": "Hacettepe University",
  "Çin Dışişleri Üniversitesi": "China Foreign Affairs University",
  "İngilizce Dil Editörü": "English-language editor",
  "Sanat Tarihçisi-Ressam": "Art historian and painter",
  "Gazeteci": "Journalist",
};

export function boardAffiliation(affiliation: string, locale: Locale) {
  return locale === "tr" ? affiliation : (boardAffiliationsEn[affiliation] || affiliation);
}

const authorMetadata: Record<string, AuthorMetadata> = {
  "Efe Can Gürcan": {
    tr: "Uluslararası İlişkiler Bölümü, İstinye Üniversitesi",
    en: "Department of International Relations, İstinye University",
    email: "efe.gurcan@istinye.edu.tr",
    orcids: ["0000-0002-5415-3163"],
    appointmentTermTr: "2019–Günümüz",
    appointmentTermEn: "2019–Present",
    biographyTr: "Efe Can Gürcan, uluslararası ilişkiler alanında doçenttir. İstinye Üniversitesi İktisadi, İdari ve Sosyal Bilimler Fakültesi’nde araştırma ve geliştirmeden sorumlu dekan yardımcılığı yapmış, Kuşak ve Yol Çalışmaları Merkezi Direktörlüğünü yürütmüş ve Manitoba Üniversitesi Jeopolitik Ekonomi Araştırma Grubu’nda araştırmacı olarak görev almıştır. Koç Üniversitesi Uluslararası İlişkiler Bölümü’nden mezun olmuş; Montréal Üniversitesi’nde Uluslararası Çalışmalar yüksek lisansını ve Simon Fraser Üniversitesi’nde Sosyoloji doktorasını tamamlamıştır. Çalışmaları uluslararası kalkınma, uluslararası çatışma ve işbirliği ile siyaset sosyolojisine odaklanmaktadır.",
    biographyEn: "Efe Can Gürcan (Assoc. Prof., International Relations) has served as Vice Dean of Research and Development for the Faculty of Economics, Administrative and Social Sciences at İstinye University, Director of the Center for Belt and Road Studies at İstinye University, and Research Associate at the University of Manitoba’s Geopolitical Economy Research Group. He studied International Relations at Koç University, completed an MA in International Studies at the University of Montréal, and earned a PhD in Sociology from Simon Fraser University. His research focuses on international development, international conflict and cooperation, and political sociology.",
  },
  "Kolosovskiy Yan": {
  tr: "Shandong Üniversitesi, Uluslararası Politika Yüksek Lisans Programı, Çin",
  en: "MA in International Politics, Shandong University, China",
  email: "kolosovskiy98@gmail.com",
  orcids: ["0009-0002-4054-1103"],
  biographyTr: "Kolosovskiy Yan, Taşkent'te 1998'de doğdu. Zhejiang Finans ve Ekonomi Üniversitesi Uluslararası Ekonomi ve Ticaret Bölümü'nden lisans derecesiyle mezun oldu. 2024'te Tayland'daki Thammasat Üniversitesi'nde Asya-Pasifik Çalışmaları yüksek lisansını tamamladı; Shandong Üniversitesi'nde Çin-Rusya-Orta Asya ilişkilerine odaklanan Uluslararası Politika yüksek lisans eğitimini sürdürmektedir.",
  biographyEn: "Kolosovskiy Yan was born in Tashkent in 1998. He graduated from Zhejiang University of Finance and Economics with a BA in International Economics and Trade. After completing an MA in Asia-Pacific Studies at Thammasat University in 2024, he is completing an MA in International Politics at Shandong University, focusing on Sino-Russian-Central Asian relations.",
},
"Song Shuli": {
  tr: "Zhejiang Uluslararası Çalışmalar Üniversitesi, Uluslararası İşletme Okulu, Çin",
  en: "International Business School, Zhejiang International Studies University, China",
  email: "songshuli2012@126.com",
  orcids: ["0009-0003-2248-2645"],
  biographyTr: "Song Shuli, Zhejiang Uluslararası Çalışmalar Üniversitesi Uluslararası İşletme Okulu'nda profesördür; ekonomi doktorasına sahiptir ve yüksek lisans danışmanıdır.",
  biographyEn: "Song Shuli is a professor at the International Business School of Zhejiang International Studies University, holds a Doctor of Economics degree, and is a master's supervisor.",
},
"Cheng Enfu": {
  tr: "Çin Sosyal Bilimler Akademisi · Dünya Politik Ekonomi Derneği (WAPE) Başkanı",
  en: "Chinese Academy of Social Sciences · President, World Association for Political Economy (WAPE)",
  email: "65344718@vip.163.com",
  orcids: ["0000-0002-9236-1916"],
  appointmentTermTr: "2019–Günümüz",
  appointmentTermEn: "2019–Present",
  biographyTr: "Prof. Cheng Enfu (d. 1950 Şanghay), Çin Sosyal Bilimler Akademisi (CASS) Öğretim Üyesi, CASS Üniversite Akademik Komitesi Direktör Yardımcısı ve Ekonomik ve Sosyal Kalkınma Araştırma Merkezi Direktörüdür. Dünya Politik Ekonomi Derneği (WAPE) Başkanı, Çin Politik Ekonomi Derneği Başkanı ve 13. Ulusal Halk Meclisi Komite Üyesidir. Çin'in dördüncü kuşak iktisatçıları arasında önde gelen isimlerden biri olarak 30'dan fazla kitap ve 600'den fazla makale yayımlamıştır.",
  biographyEn: "Prof. Cheng Enfu (b. 1950, Shanghai) is a Member of the Chinese Academy of Social Sciences (CASS), Vice Director of the CASS University Academic Committee, and Director of the Research Center for Economic and Social Development. He serves as President of the World Association for Political Economy (WAPE) and President of the Chinese Association of Political Economy. Regarded as one of the foremost Chinese political economists of the fourth generation, he has published over 30 books and 600 research papers.",
},
"Füruğ Ferruhzad": {
  tr: "Şair",
  en: "Poet",
},
"Hasan İzzettin Dinamo": {
  tr: "Şair",
  en: "Poet",
},
  "Wenbo Zhang": {
    tr: "Şanghay Sosyal Bilimler Akademisi, Ekoloji ve Sürdürülebilir Kalkınma Enstitüsü, Çin",
    en: "Institute of Ecology and Sustainable Development, Shanghai Academy of Social Sciences, China",
    email: "wenboz00@sass.org.cn",
    orcids: ["0009-0002-0162-2234"],
    biographyTr: "Wenbo Zhang, Şanghay Sosyal Bilimler Akademisi Ekoloji ve Sürdürülebilir Kalkınma Enstitüsü’nde Sürdürülebilir Kalkınma İçin Uluslararası Karşılaştırmalı Çalışmalar Araştırma Ofisi Direktörüdür. Çalışmaları uluslararası çevre politikası araçları, düşük karbon politikaları ve ekolojik uygarlığa odaklanmaktadır.",
    biographyEn: "Wenbo Zhang directs the Research Office for International Comparative Studies of Sustainable Development at the Institute of Ecology and Sustainable Development, Shanghai Academy of Social Sciences. His research focuses on international environmental policy instruments, low-carbon policy, and ecological civilisation.",
  },
  "Quan Heng": {
    tr: "Şanghay Sosyal Bilimler Akademisi, Çin",
    en: "Shanghai Academy of Social Sciences, China",
    biographyTr: "Quan Heng, Şanghay Sosyal Bilimler Akademisi Parti Komitesi Sekreteridir. Çalışmaları Çin’e özgü politik ekonomi, dünya ekonomisi, kalkınma ekonomisi, Çin’in ekonomik kalkınması ve gelir dağılımı üzerine yoğunlaşmaktadır.",
    biographyEn: "Quan Heng is Secretary of the Party Committee of the Shanghai Academy of Social Sciences. His research focuses on political economy with Chinese characteristics, the world economy, development economics, China’s economic development, and income distribution.",
  },
  "Muzaffer Salih Ertan": {
    tr: "Elektrik Mühendisi ve Yenilenebilir Enerji Uzmanı, Türkiye",
    en: "Electrical Engineer and Renewable Energy Expert, Türkiye",
    email: "salih.ertan@gmail.com",
    orcids: ["0009-0008-8659-7165"],
    biographyTr: "Muzaffer Salih Ertan, biyokütleden enerji ve biyoyakıt alanlarında çalışan elektrik mühendisi ve yenilenebilir enerji uzmanıdır. Enerji, çevre, su ve gıda güvenliği konularında araştırma ve sivil toplum çalışmaları yürütmektedir.",
    biographyEn: "Muzaffer Salih Ertan is an electrical engineer and renewable-energy expert working on energy from biomass and biofuels. His research and civil-society work address energy, the environment, water, and food security.",
  },
  "Shangtao Gao": {
    tr: "Çin Dışişleri Üniversitesi, Uluslararası İlişkiler Enstitüsü, Çin",
    en: "Institute of International Relations, China Foreign Affairs University, China",
    email: "gaostao613@163.com",
    orcids: ["0009-0000-2031-9869"],
    biographyTr: "Shangtao Gao, Çin Dışişleri Üniversitesi Uluslararası İlişkiler Enstitüsü’nde profesör ve yüksek lisans danışmanı, aynı üniversitenin Ortadoğu Çalışmaları Merkezi Direktörüdür. Uluslararası ilişkiler teorisi, Çin dış politikası ve Ortadoğu üzerine çalışmaktadır.",
    biographyEn: "Shangtao Gao is a professor and master’s supervisor at the Institute of International Relations, China Foreign Affairs University, and directs its Center for Middle East Studies. He works on international-relations theory, China’s foreign policy, and the Middle East.",
  },
  "Jessica Durdu": {
    tr: "Çin Dışişleri Üniversitesi, Uluslararası İlişkiler, Çin",
    en: "International Relations, China Foreign Affairs University, China",
    email: "jessicadurdu@gmail.com",
    orcids: ["0009-0000-2315-9661"],
    biographyTr: "Jessica Durdu, Çin Dışişleri Üniversitesi’nde uluslararası ilişkiler doktora adayı ve Türkiye-Çin ilişkileri ile uluslararası diplomasi alanlarında çalışan dış ilişkiler uzmanıdır. Araştırmaları diplomatik strateji ve küresel siyasi işbirliğine odaklanmaktadır.",
    biographyEn: "Jessica Durdu is a PhD candidate in International Relations at China Foreign Affairs University and a foreign-affairs specialist in Türkiye-China relations and international diplomacy. Her research focuses on diplomatic strategy and global political cooperation.",
  },
  "Zhang Yan Jun": {
    tr: "Xi’an Uluslararası Çalışmalar Üniversitesi, Uluslararası İlişkiler Okulu, Çin",
    en: "School of International Relations, Xi’an International Studies University, China",
    email: "zilizhangyanjun@qq.com",
    orcids: ["0000-0002-7444-3432"],
    biographyTr: "Zhang Yan Jun, Xi’an Uluslararası Çalışmalar Üniversitesi Uluslararası İlişkiler Okulu’nda doçenttir. Araştırmaları Ortadoğu’daki silahlanma yarışı, silah kontrolü ve askerî-endüstriyel kompleks üzerine odaklanmaktadır.",
    biographyEn: "Zhang Yan Jun is an associate professor at the School of International Relations, Xi’an International Studies University. His research focuses on the arms race, arms control, and the military-industrial complex in the Middle East.",
  },
  "Liu Yu Jun": {
    tr: "Xi’an Uluslararası Çalışmalar Üniversitesi, Uluslararası İlişkiler Okulu, Çin",
    en: "School of International Relations, Xi’an International Studies University, China",
    email: "15955469652@163.com",
    orcids: ["0009-0007-6549-432X"],
    biographyTr: "Liu Yu Jun, Xi’an Uluslararası Çalışmalar Üniversitesi Uluslararası İlişkiler Okulu’nda yüksek lisans adayıdır. Araştırmaları Asya’daki güvenlik meselelerine odaklanmaktadır.",
    biographyEn: "Liu Yu Jun is a master’s candidate at the School of International Relations, Xi’an International Studies University. His research focuses on security issues in Asia.",
  },
  "Yang Chen": {
    tr: "Şanghay Üniversitesi, Tarih Bölümü ve Türkiye Çalışmaları Merkezi, Çin",
    en: "Department of History and Center for Turkish Studies, Shanghai University, China",
    email: "ycwf2008@163.com",
    orcids: ["0000-0002-4840-6427"],
    institutionUrl: "https://en.shu.edu.cn/",
    appointmentTermTr: "2019–Günümüz",
    appointmentTermEn: "2019–Present",
    biographyTr: "Yang Chen, Şanghay Üniversitesi Sosyal Bilimler Fakültesi Tarih Bölümü’nde doçent ve Şanghay Üniversitesi Türkiye Çalışmaları Merkezi Direktörüdür. Türkiye’de siyasal İslamcı hareketler, parti siyaseti, dış politika ve Çin-Türkiye ilişkileri üzerine çalışmaktadır.",
    biographyEn: "Yang Chen is an associate professor in the Department of History, College of Liberal Arts, Shanghai University, and Executive Director of the university’s Center for Turkish Studies. His research focuses on political Islamic movements, party politics, foreign policy, and China-Türkiye relations.",
  },
  "He Ganqiang": {
    tr: "Nanjing Finans ve Ekonomi Üniversitesi, Ekonomi Fakültesi, Çin",
    en: "Faculty of Economics, Nanjing University of Finance and Economics, China",
    email: "heganqiang6229@sina.com",
    orcids: ["0009-0006-2002-874X"],
    biographyTr: "He Ganqiang, Nanjing Finans ve Ekonomi Üniversitesi Ekonomi Fakültesi’nde profesör ve Çin Politik Ekonomi Derneği danışmanıdır. Çalışmaları sermaye ve çağdaş Çin ekonomisi üzerine yoğunlaşmaktadır.",
    biographyEn: "He Ganqiang is a professor in the Faculty of Economics at Nanjing University of Finance and Economics and an advisor to the Chinese Political Economy Association. His research focuses on capital and the contemporary Chinese economy.",
  },
  "Xinhua Jian": {
    tr: "Wuhan Üniversitesi, Ekonomi ve İşletme Fakültesi, Çin",
    en: "School of Economics and Management, Wuhan University, China",
    email: "xhjian@whu.edu.cn",
    orcids: ["0009-0000-3432-9363"],
    biographyTr: "Xinhua Jian, Nanchang Üniversitesi ile Wuhan Üniversitesi’nin Ekonomi ve İşletme Fakültelerinde öğretim üyesidir. Çalışmaları Marksist politik ekonominin incelenmesi ve uygulanması ile Çin ekonomisindeki sorunlara odaklanmaktadır.",
    biographyEn: "Xinhua Jian teaches at the schools of Economics and Management of Nanchang University and Wuhan University. His work focuses on the study and application of Marxist political economy and on issues in China’s economy.",
  },
  "Belkacem Iratni": {
    tr: "Cezayir Üniversitesi, Siyaset ve Uluslararası İlişkiler Fakültesi, Cezayir",
    en: "Faculty of Politics and International Relations, University of Algiers, Algeria",
    email: "kiratni54@gmail.com",
    orcids: ["0009-0007-4747-8836"],
    biographyTr: "Belkacem Iratni, Cezayir Üniversitesi Siyaset ve Uluslararası İlişkiler Fakültesi’nde sözleşmeli profesördür. Çalışmaları Cezayir’in iç ve dış politikası ile Sahel-Sahra bölgesindeki güvenlik sorunlarına odaklanmaktadır.",
    biographyEn: "Belkacem Iratni is a contractual professor in the Faculty of Politics and International Relations at the University of Algiers. His research addresses Algeria’s domestic and foreign policy and security issues in the Sahel-Saharan region.",
  },
  "Fang Chenyu": {
    tr: "Fudan Üniversitesi, Uluslararası İlişkiler ve Kamu Yönetimi Fakültesi, Çin",
    en: "School of International Relations and Public Affairs, Fudan University, China",
    email: "cyfang22@m.fudan.edu.cn",
    orcids: ["0009-0004-8432-712X"],
    biographyTr: "Fang Chenyu, Fudan Üniversitesi Uluslararası İlişkiler ve Kamu Yönetimi Fakültesi’nde doktora öğrencisidir. Araştırmaları Kuşak ve Yol Girişimi ve güç rekabeti üzerine yoğunlaşmaktadır.",
    biographyEn: "Fang Chenyu is a PhD candidate at the School of International Relations and Public Affairs, Fudan University. His research focuses on the Belt and Road Initiative and power competition.",
  },
  "Wang Weibin": {
    tr: "Pekin Yabancı Diller Üniversitesi, Uluslararası İlişkiler Okulu, Çin",
    en: "School of International Relations, Beijing Foreign Studies University, China",
    email: "wangweibin@bfsu.edu.cn",
    orcids: ["0009-0005-9719-4378"],
    biographyTr: "Wang Weibin, Pekin Yabancı Diller Üniversitesi Uluslararası İlişkiler Okulu’nda doktora öğrencisidir. Araştırmaları Avrupa siyaseti ve diplomasisi üzerine odaklanmaktadır.",
    biographyEn: "Wang Weibin is a PhD candidate at the School of International Relations, Beijing Foreign Studies University. His research focuses on European politics and diplomacy.",
  },
  "Werner Rügemer": {
    tr: "Yazar, Köln, Almanya",
    en: "Author, Cologne, Germany",
    email: "werner.ruegemer@posteo.de",
    orcids: ["0000-0001-2848-0017"],
    biographyTr: "Werner Rügemer, Köln’de yaşayan yazar ve düşünürdür. Dilbilim, ekonomi ve felsefe eğitimi almış; Köln Üniversitesi’nde öğretim üyeliği yapmıştır. Dünya Politik Ekonomi Derneği Konsey üyesidir.",
    biographyEn: "Werner Rügemer is an author and philosopher based in Cologne. He studied linguistics, economics, and philosophy, taught at the University of Cologne, and serves on the Council of the World Association for Political Economy.",
  },
  "Hiroshi Onishi": {
    tr: "Keio Üniversitesi ve Kyoto Üniversitesi, Emeritus Profesör, Japonya",
    en: "Professor Emeritus, Keio University and Kyoto University, Japan",
    email: "ohnishi@f6.dion.ne.jp",
    orcids: ["0009-0009-0475-3193"],
    biographyTr: "Hiroshi Onishi, Keio Üniversitesi ve Kyoto Üniversitesi emeritus profesörüdür. Dünya Politik Ekonomi Derneği başkan yardımcısıdır; temel araştırma alanı Marksist formal ekonomidir.",
    biographyEn: "Hiroshi Onishi is Professor Emeritus at Keio University and Kyoto University and Vice Chair of the World Association for Political Economy. His principal research field is Marxian formal economics.",
  },
  "Jason Morgan": {
    tr: "Reitaku Üniversitesi, Küresel Çalışmalar Fakültesi, Japonya",
    en: "Faculty of Global Studies, Reitaku University, Japan",
    email: "jmorgan@reitaku-u.ac.jp",
    orcids: ["0000-0002-2969-3010"],
    institutionUrl: "https://www.reitaku-u.ac.jp/en/faculty/global/",
  },
  "Zeynep Boz": {
    tr: "T.C. Kültür ve Turizm Bakanlığı Kaçakçılıkla Mücadele Dairesi Başkanı",
    en: "Head of the Anti-Smuggling Department, Ministry of Culture and Tourism of the Republic of Türkiye",
    institutionUrl: "https://kvmgm.ktb.gov.tr/TR-44454/kacakciligin-onlenmesi-ile-ilgili-faaliyetler.html",
  },
  "Nuray Ekşi": {
    tr: "Marmara Üniversitesi Hukuk Fakültesi (E)",
    en: "Faculty of Law, Marmara University (Emerita)",
    email: "nurayeksi@gmail.com",
    orcids: ["0000-0002-9713-777X"],
    institutionUrl: "https://hukuk.marmara.edu.tr/en",
  },
  "Li Ning": {
    tr: "Zunyi Normal Üniversitesi, Tarih Bölümü, Çin",
    en: "Department of History, Zunyi Normal University, China",
    email: "Shuln188@126.com",
    orcids: ["0009-0005-5419-6998"],
  },
  "Yang Xuyan": {
    tr: "Zunyi Normal Üniversitesi, Tarih Bölümü, Çin",
    en: "Department of History, Zunyi Normal University, China",
    email: "846543290@qq.com",
    orcids: ["0009-0001-7804-1772"],
  },
  "Mehmet Celal Özdoğan": {
    tr: "İstanbul Üniversitesi Prehistorya Anabilim Dalı (E)",
    en: "Department of Prehistory, Istanbul University (Emeritus)",
    institutionUrl: "https://tanitimedebiyat.istanbul.edu.tr/en/content/archaeology/prehistory",
  },
  "Pavel Zarifullin": {
    tr: "Lev Gumilev Moskova Merkezi Direktörü",
    en: "Director, Lev Gumilev Moscow Centre",
    institutionUrl: "https://af.gumilev-center.ru/en/about",
  },
  "Wang Jiani": {
    tr: "Şanghay Üniversitesi Tarih Bölümü, Çin",
    en: "Department of History, Shanghai University, China",
    email: "jiani88254@hotmail.com",
    orcids: ["0009-0000-0543-3719"],
  },
  "Bilguunzaya Luvsandandar": {
    tr: "Şanghay Üniversitesi Liberal Sanatlar Fakültesi, Çin",
    en: "College of Liberal Arts, Shanghai University, China",
    email: "bilguunzaya.luvsandandar@gmail.com",
    orcids: ["0009-0005-8843-6013"],
  },
  "Nora Maher": {
    tr: "Kahire Mayıs Üniversitesi Siyaset Bilimi Bölümü, Mısır",
    en: "Department of Political Science, May University in Cairo, Egypt",
    email: "nora-maher@hotmail.com",
    orcids: ["0000-0002-9858-8548"],
  },
  "Fikret Akfırat": {
    tr: "BRIQ Genel Yayın Yönetmeni",
    en: "Editor-in-Chief, BRIQ",
    email: "fikretakfirat@briqjournal.com",
    institutionUrl: "https://briqjournal.com/yayin-kurulu",
  },
  "Salman K. Al-Dhafeeire": {
    tr: "Fudan Üniversitesi, Uluslararası İlişkiler ve Kamu İşleri Fakültesi, Şanghay, Çin",
    en: "School of International Relations and Public Affairs, Fudan University, Shanghai, China",
    email: "saldhafeeire@ksu.edu.sa",
    orcids: ["0009-0004-3857-0364"],
    institutionUrl: "https://sirpa.fudan.edu.cn/",
  },
  "Sun Degang": {
    tr: "Fudan Üniversitesi, Uluslararası Çalışmalar Enstitüsü",
    en: "Institute of International Studies, Fudan University",
    email: "sundegang@fudan.edu.cn",
    orcids: ["0009-0003-3418-8558"],
    institutionUrl: "https://iis.fudan.edu.cn/",
    appointmentTermTr: "2019–Günümüz",
    appointmentTermEn: "2019–Present",
    biographyTr: "Prof. Dr. Sun Degang, Şanghay Fudan Üniversitesi Uluslararası Çalışmalar Enstitüsü'nde Siyaset Bilimi profesörü ve Asian Journal of Middle Eastern and Islamic Studies baş editörüdür. Daha önce Şanghay Uluslararası Çalışmalar Üniversitesi Ortadoğu Araştırmaları Enstitüsü Müdür Yardımcılığı görevinde bulunmuştur. Harvard Üniversitesi Ortadoğu Araştırmaları Merkezi'nde, Oxford Üniversitesi St. Antony's College'da ve Denver Üniversitesi'nde misafir araştırmacı olarak bulunmuştur. Araştırma alanları Ortadoğu siyaseti, uluslararası ilişkiler, büyük güçlerin Ortadoğu stratejileri ve Çin'in Ortadoğu diplomasisidir.",
    biographyEn: "Prof. Dr. Degang Sun is Professor of Political Science at the Institute of International Studies, Fudan University, and Editor-in-Chief of Asian Journal of Middle Eastern and Islamic Studies. He previously served as Deputy Director of the Middle East Studies Institute at Shanghai International Studies University. He was a visiting scholar at Harvard University's Center for Middle Eastern Studies, a Senior Associate Member at St Antony's College, Oxford University, and a visiting researcher at Denver University. His research focuses on Middle Eastern politics, international relations, great power strategies in the Middle East, and China's Middle East diplomacy.",
  },
  "Hasret Çomak": {
    tr: "İstanbul Kent Üniversitesi, İktisadi, İdari ve Sosyal Bilimler Fakültesi, Türkiye",
    en: "Faculty of Economics, Administrative and Social Sciences, Istanbul Kent University, Türkiye",
    email: "hasret.comak@kent.edu.tr",
    orcids: ["0000-0001-5162-5260"],
    institutionUrl: "https://www.kent.edu.tr/",
  },
  "Ege Furkan Toker": {
    tr: "İstanbul Kent Üniversitesi, Uluslararası İlişkiler Bölümü, Türkiye",
    en: "Department of International Relations, Istanbul Kent University, Türkiye",
    email: "egefurkan.toker@kent.edu.tr",
    orcids: ["0000-0002-4879-1687"],
    institutionUrl: "https://www.kent.edu.tr/",
  },
  "Oğuzhan Manioğlu": {
    tr: "İstanbul Kent Üniversitesi, Siyaset Bilimi ve Kamu Yönetimi Bölümü, Türkiye",
    en: "Department of Political Science and Public Administration, Istanbul Kent University, Türkiye",
    email: "oguzhan.manioglu@kent.edu.tr",
    orcids: ["0000-0001-9475-2307"],
    institutionUrl: "https://www.kent.edu.tr/",
  },
  "Li Sainan": {
    tr: "Kuzeybatı Politeknik Üniversitesi, Yabancı Diller Fakültesi, Xian, Çin",
    en: "School of Foreign Studies, Northwestern Polytechnical University, Xi’an, China",
    email: "saiyida206@163.com",
    orcids: ["0009-0007-8171-3289"],
    institutionUrl: "https://en.nwpu.edu.cn/",
  },
  "Li Xi": {
    tr: "Kuzeybatı Politeknik Üniversitesi, Ürdün Araştırmaları Merkezi, Xian, Çin",
    en: "Jordan Research Center, Northwestern Polytechnical University, Xi’an, China",
    email: "lixi7021@163.com",
    orcids: ["0009-0006-3256-1197"],
    institutionUrl: "https://en.nwpu.edu.cn/",
  },
  "Iqbal Akhtar": {
    tr: "Florida Uluslararası Üniversitesi, Steven J. Green Uluslararası ve Kamusal İlişkiler Okulu, ABD",
    en: "Steven J. Green School of International and Public Affairs, Florida International University, USA",
    email: "iakhtar@fiu.edu",
    orcids: ["0000-0001-6840-8377"],
    institutionUrl: "https://sipa.fiu.edu/",
  },
  "Can Ulusoy": {
    tr: "Kapadokya Üniversitesi, İktisadi, İdari ve Sosyal Bilimler Fakültesi, Siyaset Bilimi ve Uluslararası İlişkiler Bölümü, Türkiye",
    en: "Faculty of Economics, Administrative and Social Sciences, Department of Political Science and International Relations, Cappadocia University, Türkiye",
    email: "can.ulusoy@kapadokya.edu.tr",
    orcids: ["0000-0002-4465-3201"],
    institutionUrl: "https://kapadokya.edu.tr/",
  },
  "Sanoop Sajan Koshy": {
    tr: "Hindistan Teknoloji Enstitüsü Madras, Hindistan",
    en: "Indian Institute of Technology Madras, India",
    email: "sanoopsajan@gmail.com",
    orcids: ["0000-0002-9000-4456"],
    institutionUrl: "https://www.iitm.ac.in/",
  },
  "Semih Koray": {
    tr: "Bilkent Üniversitesi, İktisat Bölümü",
    en: "Department of Economics, Bilkent University",
    orcids: ["0000-0001-7498-6499"],
    institutionUrl: "https://www.bilkent.edu.tr/",
    appointmentTermTr: "2019–Günümüz",
    appointmentTermEn: "2019–Present",
    biographyTr: "Prof. Dr. Semih Koray, 1980 yılında Boğaziçi Üniversitesi'nden Matematik alanında doktora derecesini almıştır. Social Choice and Welfare, Review of Economic Design, Journal of Economic Theory, Econometrica ve Semigroup Forum gibi dergilerde çok sayıda makalesi yayımlanmıştır. Review of Economic Design dergisinin eş baş editörlüğünü ve yardımcı editörlüğünü, Güney Avrupa İktisat Teorisyenleri Derneği'nin başkanlığını ve genel sekreterliğini, Türkiye Matematik Olimpiyatları Komitesi başkanlığını, Uluslararası Matematik Olimpiyatları Danışma Kurulu üyeliğini ve Ekonomik Tasarım Vakfı başkanlığını yürütmüştür. Araştırma alanları ekonomik ve sosyal tasarım, oyun teorisi ve sosyal seçim teorisi üzerine yoğunlaşmaktadır. Vatan Partisi Uluslararası İlişkiler Bürosu'ndan Sorumlu Genel Başkan Yardımcısıdır. Teori ve Bilim ve Ütopya dergilerinde siyasi ve sosyal konularda makaleleri yayımlanmış olup Aydınlık gazetesinde Avrasya Alternatifi konulu haftalık köşe yazarlığı yapmıştır.",
    biographyEn: "Prof. Dr. Semih Koray received his Ph.D. in Mathematics from Boğaziçi University in 1980. He has published articles in journals such as Social Choice and Welfare, Review of Economic Design, Journal of Economic Theory, Econometrica, and Semigroup Forum. He served as coordinating editor-in-chief and associate editor of Review of Economic Design, President and Secretary General of the Association of Southern European Economic Theorists, Chair of the Turkish Mathematical Olympiad Committee, member of the International Mathematical Olympiad Advisory Board, and President of the Foundation for Economic Design. His research interests focus on economic and social design, game theory, and social choice theory. He is the Deputy President of the Patriotic Party (Vatan Partisi) in charge of the International Relations Bureau. He has also published articles on political and social issues in the periodicals Teori and Bilim ve Ütopya, and wrote a weekly column on the Eurasian Alternative in the daily newspaper Aydınlık.",
  },
  "Wang Yi": {
    tr: "Çin Halk Cumhuriyeti Dışişleri Bakanı",
    en: "Minister of Foreign Affairs of the People's Republic of China",
    biographyTr: "Wang Yi, 1953 yılında Pekin'de doğmuştur. Pekin'de kurulu İkinci Yabancı Dil Enstitüsü'nün Asya ve Afrika Dilleri bölümünden mezun olmuş, ekonomi alanında yüksek lisans derecesi almıştır. 1981 yılında Çin Komünist Partisi'ne (ÇKP) üye olan Wang Yi, 1982-1989 yılları arasında Çin Halk Cumhuriyeti Dışişleri Bakanlığı'nda ataşe, müdür yardımcısı ve müdür konumlarında görev yapmıştır. Bakanlıkta muhtelif üst düzey konumlarda hizmet verdikten sonra 2004-2007 yıllarında Japonya Büyükelçiliği görevini üstlenmiştir. 2013-2018 yıllarında Dışişleri Bakanlığı ÇKP Sekreter Yardımcılığının ardından 2018 yılında Dışişleri Bakanı konumuna terfi etmiştir. 17. Halk Kongresi'nden bu yana ÇKP Merkez Komitesi üyesidir.",
    biographyEn: "Wang Yi was born in 1953 in Beijing. He graduated from the Institute of Asian and African Languages affiliated to the Second Foreign Languages Institute in Beijing and holds a master's degree in Economics. In 1981, Wang Yi became a member of the Chinese Communist Party (CCP). Between 1982 and 1989, he worked at the Ministry of Foreign Affairs of the People's Republic of China (MFA) as an attaché, assistant manager, and manager consecutively. After serving in various senior positions at the MFA, he served as Ambassador to Japan between 2004 and 2007. He continued his work at the MFA as Deputy Secretary of the CPC Committee from 2013 until 2018, when he was promoted to the position of Minister of Foreign Affairs. Since the 17th People's Congress, he has also been a member of the CCP Central Committee.",
  },
  "Ufuk Tutan": {
    tr: "Antalya Bilim Üniversitesi, İktisadi, İdari ve Sosyal Bilimler Fakültesi, Ekonomi Bölümü",
    en: "Department of Economics, Faculty of Economics, Administrative and Social Sciences, Antalya Bilim University",
    email: "ufuk.tutan@antalya.edu.tr",
    orcids: ["0000-0002-8492-1979"],
    institutionUrl: "https://antalya.edu.tr/",
    biographyTr: "Prof. Dr. Ufuk Tutan, Bornova Anadolu Lisesi’nden mezun olduktan sonra Ortadoğu Teknik Üniversitesi’nin Ekonomi Bölümü’nü ve Uluslararası İlişkiler Bölümü’nün Avrupa Çalışmaları Programı’nı tamamlamıştır. Lisans eğitiminin hemen ardından yüksek lisans derecelerini Bilkent Üniversitesi’nden (Uluslararası İlişkiler Bölümü), ODTÜ’den (Bilim ve Teknoloji Politikaları Bölümü) ve University of Utah’tan (Ekonomi Bölümü) almıştır. British Council Chevening-TÜBİTAK ortak bursu ile University of Sussex, Science and Policy Research Unit’te araştırmalar yapmış ve bu enstitüden diploma almıştır. University of Utah’ta ekonomi alanında doktorasını tamamlamıştır. Akademik çalışmaları ekonomik krizler, politik ekonomi, gelişmiş ülkelerin ekonomileri, ekonomi tarihi, teknoloji ve aile işletmeleri üzerine yoğunlaşmıştır.",
    biographyEn: "Prof. Dr. Ufuk Tutan holds a B.A. in Economics and a B.A. in International Relations from Middle East Technical University (METU). He earned three master’s degrees: in International Relations from Bilkent University, in Science and Technology Policy Studies from METU, and in Economics from the University of Utah. He completed his Ph.D. in Economics at the University of Utah. He made research visits to the University of Sussex’s Science Policy Research Unit with the support of the British Council Chevening-TÜBİTAK Fellowship. Professor Tutan specializes in several areas of political economy: economic crises, developing countries, economic history, technology, and family-owned businesses.",
  },
  "Şerif Emre Gökçay": {
    tr: "İstanbul Üniversitesi, İktisat Fakültesi, Maliye Bölümü",
    en: "Department of Finance, Faculty of Economics, Istanbul University",
    email: "emre.gokcay@istanbul.edu.tr",
    orcids: ["0000-0002-1361-6598"],
    institutionUrl: "https://www.istanbul.edu.tr/",
    biographyTr: "Dr. Öğr. Üyesi Şerif Emre Gökçay, 2009 yılında İstanbul Üniversitesi İktisat Fakültesi İktisat ve Maliye (çift anadal) lisans programlarından mezun oldu. 2012 yılında İstanbul Üniversitesi Sosyal Bilimler Enstitüsü Mali Hukuk yüksek lisans programını tamamladı. 2017 yılında aynı enstitüde Maliye doktora programını bitirdi. 2012-2018 yılları arasında araştırma görevlisi olarak çalışan Gökçay, 2018 yılından itibaren İstanbul Üniversitesi İktisat Fakültesi Maliye Bölümü Mali Hukuk Anabilim Dalında Doktor Öğretim Üyesi ve Sosyal Bilimler Enstitüsü Müdür Yardımcısı olarak görev yapmaktadır.",
    biographyEn: "Dr. Şerif Emre Gökçay graduated from the Faculty of Economics of Istanbul University with a double major in Economics and Finance in 2009. In 2012, he completed his master's in Financial Law, and in 2017 earned his Ph.D. in Finance from Istanbul University's Institute of Social Sciences. Having worked as a research assistant between 2012 and 2018, he serves as an Assistant Professor in the Department of Finance at Istanbul University and Assistant Director of the Institute of Social Sciences.",
  },
  "Hüseyin Haydar": {
    tr: "Şair · Ulusal Bilim Strateji Merkezi (UBSMER)",
    en: "Poet · National Science Strategy Center (UBSMER)",
    appointmentTermTr: "2019–Günümüz",
    appointmentTermEn: "2019–Present",
    biographyTr: "Şair Hüseyin Haydar, 1956 yılında Trabzon'da doğdu. Yüksek öğrenimini ekonomi ve maliye üzerine yaptı. Yazarlar ve Çevirmenler Kooperatifi YAZKO’da Edebiyat ve Çeviri dergilerinde yazı kurulu üyeliği ve teknik yönetmenlik yaptı. İlk şiir kitabı Acı Türkücü ile 1981 Akademi Şiir Birincilik Ödülünü kazandı. Daha sonra yayımlanan kitaplarıyla TROYA Şiir Ödülü (2012), Ahmet Necdet Şiir Ödülü (2012), Yunus Nadi Şiir Ödülü (2012) ve Enver Gökçe Şiir Ödülü (2013) gibi pek çok ödül kazandı. Ulusal Kanal Yayın Kurulu üyeliği ve görsel yönetmenliği görevlerini yürüttü, Türkiye Yazarlar Sendikası (TYS) Yönetim Kurulu üyeliği yaptı. Ulusal Kanal’da Edebiyat Cephesi programını hazırlayıp sundu. Vatan Partisi Merkez Karar Kurulu ve Ulusal Bilim Strateji Merkezi (UBSMER) üyesidir. Şiirlerini Aydınlık gazetesindeki Şairin Emeği köşesinde yayımlamaktadır.",
    biographyEn: "Poet Hüseyin Haydar was born in 1956 in Trabzon. He studied economics and finance. He worked as an editorial board member and technical director for YAZKO's Literature and Translation magazines. His first poetry collection, Acı Türkücü, won the 1981 Academy Poetry First Prize. He received numerous awards for his books: TROYA Poetry Award (2012), Ahmet Necdet Poetry Award (2012), Yunus Nadi Poetry Award (2012), and Enver Gökçe Poetry Award (2013). He served on the Ulusal Kanal Broadcasting Board and the Writers' Syndicate of Turkey (TYS) Board. He presented the program Literature Front on Ulusal Kanal. He is a member of the Patriotic Party Central Decision Board and the National Science Strategy Center (UBSMER). He publishes poems in his column Poet's Toil in Aydınlık newspaper.",
  },
  "Hend ElMahly Mahmoud Sultan": {
    tr: "Kahire Üniversitesi, Ekonomi ve Siyaset Bilimi Fakültesi",
    en: "Faculty of Economics and Political Science, Cairo University",
    biographyTr: "Hend ElMahly Mahmoud Sultan, Şanghay Uluslararası Çalışmalar Üniversitesi Ortadoğu Araştırmaları Enstitüsü'nde doktora adayı ve Kahire Üniversitesi Ekonomi ve Siyaset Bilimi Fakültesi'nde asistan öğretim görevlisidir. Araştırmaları Çin-Afrika ilişkileri, Çin'in Afrika Boynuzu'ndaki barış misyonları ve Körfez güvenliğine odaklanmaktadır. Çinceden Arapçaya altı kitap çevirip yayımlamıştır.",
    biographyEn: "Hend ElMahly Mahmoud Sultan is a Ph.D. candidate at the Middle East Studies Institute of Shanghai International Studies University and an Assistant Lecturer at the Faculty of Economics and Political Science, Cairo University. Her research focuses on China-Africa relations, China's peace mission in the Horn of Africa, and Gulf security. She has translated and published six books from Chinese into Arabic.",
  },
  "Ebru Şahin": {
    tr: "Dokuz Eylül Üniversitesi · BRIQ Editörü",
    en: "Dokuz Eylül University · BRIQ Editor",
    appointmentTermTr: "2019–Günümüz",
    appointmentTermEn: "2019–Present",
    biographyTr: "Ebru Şahin, Ankara Üniversitesi Siyasal Bilgiler Fakültesi Uluslararası İlişkiler Bölümü’nden 2015 yılında mezun olmuştur. 2019 yılında Aydın Adnan Menderes Üniversitesi Sosyal Bilimler Enstitüsü Uluslararası İlişkiler Anabilim Dalı’nda “Çin’in Küresel Güç Olma Sürecinde Uluslararası İşbirliklerinin Rolü” başlıklı teziyle yüksek lisansını tamamlamıştır. BRIQ Yazıişleri Müdürlüğü ve editörlüğü görevlerini yürütmüştür.",
    biographyEn: "Ebru Şahin graduated from Ankara University's Faculty of Political Science, Department of International Relations in 2015. In 2019, she completed her master's degree in International Relations at Aydın Adnan Menderes University with a thesis entitled 'The Role of International Cooperation in China's Rise As a Global Power'. She has served as managing editor and editor for BRIQ.",
  },
  "Emin Gürses": {
    tr: "Sakarya Üniversitesi ve Yeditepe Üniversitesi, Uluslararası İlişkiler Bölümü",
    en: "Department of International Relations, Sakarya University and Yeditepe University",
    institutionUrl: "https://www.sakarya.edu.tr/",
    appointmentTermTr: "2019–Günümüz",
    appointmentTermEn: "2019–Present",
    biographyTr: "Prof. Dr. Emin Gürses, Marmara Üniversitesi'ni tamamladıktan sonra Londra Üniversitesi'nde (SOAS, Birkbeck College, LSE) ve Boğaziçi Üniversitesi'nde siyaset bilimi, gelişme ekonomisi ve uluslararası ilişkiler alanlarında yüksek lisans ve doktora öğrenimi gördü. İstanbul Üniversitesi SBF'de doktora dersleri veren Gürses, Sakarya Üniversitesi Uluslararası İlişkiler Bölümü ve Yeditepe Üniversitesi'nde öğretim üyeliği yapmaktadır. Milliyetçi Hareketler ve Uluslararası Sistem, Ayrılıkçı Terörün Anatomisi, İnsan Hakları Diplomasisi, Yeni Ortadoğu Haritası gibi çok sayıda kitabın yazarıdır.",
    biographyEn: "Prof. Dr. Emin Gürses completed his B.Sc. at Marmara University, followed by postgraduate studies in politics, economic development, and international relations at the University of London (SOAS, Birkbeck, LSE) and Boğaziçi University (Ph.D.). He has taught at Istanbul University, Sakarya University, and Yeditepe University. He is the author of numerous books including Nationalist Movements and the International System, Anatomy of Separatist Terror, Human Rights Diplomacy, and New Middle Eastern Map.",
  },
  "Cem Gürdeniz": {
    tr: "Emekli Tümamiral · Koç Üniversitesi Denizcilik Forumu (KUDENFOR) Kurucu Direktörü",
    en: "Retired Rear Admiral (RADM) · Founding Director of Koç University Maritime Forum",
    biographyTr: "Emekli Tümamiral Cem Gürdeniz, 1979 yılında Deniz Harp Okulu'ndan mezun oldu. ABD Deniz Kuvvetleri Yüksek Lisans Okulu'nda eğitim gördü ve Brüksel Serbest Üniversitesi'nde (ULB) Uluslararası Politika yüksek lisansı yaptı. Deniz Kuvvetleri Komutanlığı'nda Strateji Şube Müdürlüğü, Plan Prensipler Başkanlığı, Çıkarma Gemileri Komutanlığı ve Mayın Filosu Komutanlığı görevlerinde bulundu. 'Mavi Vatan' kavramının kuramcılarındandır. Cumhuriyet Donanması, Hedefteki Donanma, Mavi Vatan Yazıları gibi çok sayıda eserin yazarı olup Koç Üniversitesi Denizcilik Forumu (KUDENFOR) Kurucu Direktörüdür. Aydınlık gazetesinde köşe yazarlığı yapmaktadır.",
    biographyEn: "Retired Rear Admiral Cem Gürdeniz graduated from the Turkish Naval Academy in 1979. He completed postgraduate studies at the US Naval Postgraduate School and earned a master's degree in International Politics from the Université Libre de Bruxelles (ULB). He served in senior roles at the Turkish Naval Forces Headquarters, including Head of Strategy, Head of Plans and Policy, and Commander of the Mine Fleet. He is the conceptualizer of the 'Blue Homeland' (Mavi Vatan) maritime doctrine, author of numerous books on maritime strategy, and Founding Director of the Koç University Maritime Forum (KUDENFOR).",
  },
  "Gong Jianhua": {
    tr: "Şanghay Üniversitesi, Hukuk Fakültesi",
    en: "Law School, Shanghai University",
    email: "gongjianhuajin@163.com",
    institutionUrl: "https://en.shu.edu.cn/",
    biographyTr: "Gong Jianhua, Şanghay Üniversitesi Hukuk Fakültesi'nde Araştırma Görevlisi ve Şanghay Belediyesi bünyesinde Psikolojik Danışmandır. Teori ve Legal System and Society gibi dergilerde makaleleri yayımlanmıştır. Başlıca araştırma alanları ideolojik ve siyasi eğitim ile kamuoyu araştırmalarıdır.",
    biographyEn: "Gong Jianhua is a Research Assistant at Shanghai University’s Law School and a Psychological Consultant for the Shanghai Municipality. Her articles have appeared in journals including Teori (Turkey) and Legal System and Society (China). She specializes in ideological and political education and public opinion research.",
  },
  "Ethem Sancak": {
    tr: "BMC Yönetim Kurulu Başkanı",
    en: "Chairman of BMC Executive Board",
    appointmentTermTr: "2019–Günümüz",
    appointmentTermEn: "2019–Present",
    biographyTr: "Ethem Sancak, İstanbul Üniversitesi İşletme Fakültesi 1976 yılı mezunudur. 1976-1978 yılları arasında gazetecilik yapmış, üniversite yıllarında katıldığı Türkiye İşçi Köylü Partisi'nin (TİKP) güneydoğu ve doğu sorumluluğu ile Diyarbakır İl Başkanlığını yürütmüştür. Ticarete atılarak Es Ecza Deposu (1987), Esko Itriyat (1989) ve Hedef Ecza Deposu'nu (1993) kurmuş, daha sonra kamyon, otobüs ve zırhlı araç üreticisi BMC'yi bünyesine katmıştır. 2001'de 'Yılın İşletmecisi', 2005'te 'Yılın Girişimcisi' seçilmiş, 2007'de TBMM 'Milli Egemenlik Üstün Hizmet ve Onur Ödülü'ne layık görülmüştür. Türkiye Ecza Depocuları Derneği Yönetim Kurulu Başkanlığı, İstanbul Modern Sanat Müzesi Yönetim Kurulu Başkan Yardımcılığı, İKSV Yönetim Kurulu Üyeliği ve Okan Üniversitesi Danışma Kurulu üyeliği yapmıştır.",
    biographyEn: "Ethem Sancak graduated from Istanbul University Faculty of Business in 1976 and worked as a journalist between 1976 and 1978. He served as the representative for southeastern and eastern regions of the Workers' and Peasants' Party of Turkey (TİKP) and as its Diyarbakır Provincial Chair. Entering the healthcare and automotive industries, he founded Es Pharmaceutical Warehouse (1987), Esko Perfumery (1989), Hedef Pharmaceutical Warehouse (1993), and later acquired commercial and military vehicle manufacturer BMC. He was named 'Business Manager of the Year' (2001), 'Entrepreneur of the Year' (2005), and received the Grand National Assembly of Turkey's 'National Sovereignty Outstanding Service and Honor Award' (2007). He has served on the boards of Istanbul Modern, İKSV, and Okan University Advisory Board.",
  },
  "Cankut Bagana": {
    tr: "Onur Air Yönetim Kurulu Başkanı",
    en: "Chairman of the Board of Directors of Onur Air",
    appointmentTermTr: "2019–Günümüz",
    appointmentTermEn: "2019–Present",
    biographyTr: "Cankut Bagana, İstanbul Üniversitesi Hukuk Fakültesi mezunudur. 1965 yılında turist rehberi olarak mesleğe başlamış, 1975'e kadar turizm sektöründe yöneticilik yapmıştır. 1975 yılında Incoming Tour acentesini, 1980 yılında Ten Tour'u kurucu ortak olarak hayata geçirmiştir. 1994 yılında Onur Air'in Ten Tour bünyesine katılmasının ardından Onur Air Yönetim Kurulu Başkanlığı ve Genel Müdürlüğü görevlerini yürütmüştür. Fransızca, Almanca, İngilizce ve İtalyanca bilmektedir.",
    biographyEn: "Cankut Bagana graduated from Istanbul University Faculty of Law. He began his career as a tour guide in 1965 and managed tourism enterprises before establishing Incoming Travel Agency in 1975 and co-founding Ten Tour in 1980. Following Onur Air's incorporation with Ten Tour in 1994, he served as President and General Manager of Onur Air. He speaks French, German, English, and Italian.",
  },
  "Dominik Pietzcker": {
    tr: "Uygulamalı Bilimler Makromedya Üniversitesi, Halkla İlişkiler ve İletişim Yönetimi",
    en: "Macromedia University of Applied Sciences, Public Relations and Communication's Management",
    email: "d.pietzcker@macromedia.de",
    orcids: ["0000-0002-1420-9396"],
    institutionUrl: "https://www.macromedia-fachhochschule.de/",
    biographyTr: "Prof. Dr. Dominik Pietzcker, 2012'den bu yana Uygulamalı Bilimler Makromedya Üniversitesi Hamburg ve Berlin kampüslerinde Medya Fakültesi profesörüdür. Freiburg Üniversitesi, Trinity College Dublin ve Viyana'da karşılaştırmalı Alman edebiyatı, felsefe ve tarih öğrenimi görmüştür. 1996–2010 arasında Avrupa Birliği ve Alman Federal Hükümeti Basın Dairesi gibi kurumlarda kreatif direktör olarak çalışmış; Berlin Sanat Üniversitesi (UdK), HTW Berlin ve TU Dresden'de ders vermiştir. 2014'ten bu yana Alman Girişimciler Vakfı (SDW) onur jürisindedir. 2017'den beri Çin'de Zhejiang Üniversitesi Şehir Koleji ve Tongji Üniversitesi'nde ders vermektedir.",
    biographyEn: "Prof. Dr. Dominik Pietzcker has been a full-time professor at Macromedia University of Applied Sciences (Hamburg and Berlin Campuses) in the Media Faculty since 2012. He studied comparative German literature, philosophy, and history at the University of Freiburg, Trinity College Dublin, and Vienna. From 1996 to 2010, he worked as a creative director for political institutions including the European Union and the German Federal Government Press Office, and taught at UdK Berlin, HTW Berlin, and TU Dresden. Since 2017, he has held lectures at Zhejiang University City College and Tongji University in China, publishing on intercultural and Sino-German topics.",
  },
  "Ömer Ersin Kahraman": {
    tr: "İstinye Üniversitesi, Sosyoloji Bölümü",
    en: "Istinye University, Department of Sociology",
    email: "omer.kahraman@istinye.edu.tr",
    orcids: ["0000-0002-3744-5965"],
    institutionUrl: "https://www.istinye.edu.tr/",
    biographyTr: "Dr. Öğr. Üyesi Ömer Ersin Kahraman, ODTÜ Endüstri Mühendisliği Bölümü'nden mezun olmuş ve Bilim ve Mantık Felsefesi yan dalını tamamlamıştır. Yüksek lisansını ODTÜ Bilim ve Teknoloji Politikası Çalışmaları'nda bölüm birincisi olarak bitirmiştir. Doktora derecesini Fransa'daki Rennes 1 Üniversitesi'nden rasyonalizm ve aşırı tüketim olgusu üzerine teziyle üstün başarı ('Très Honorable') derecesiyle almıştır. Fransa Poitiers Akademisi'nde felsefe öğretmenliğinin ardından İstinye Üniversitesi Sosyoloji Bölümü'nde öğretim üyeliği ve bölüm başkanlığı yapmıştır. Tüketim sosyolojisi, ideoloji, siyaset felsefesi ve Frankfurt Okulu alanlarında uzmandır.",
    biographyEn: "Dr. Ömer Ersin Kahraman holds a B.S. in Industrial Engineering and a Minor in Philosophy of Science and Logic from Middle East Technical University (METU), where he also earned his M.S. in Science and Technology Policy Studies (valedictorian). He completed his Ph.D. in Philosophy at the University of Rennes 1 with highest honors ('Très Honorable'). After teaching philosophy at Académie de Poitiers in France, he joined Istinye University, serving as chair of the Sociology Department. He specializes in the sociology of consumption, ideology, political philosophy, political economy, and the Frankfurt School.",
  },
  "Binoy Kampmark": {
    tr: "RMIT Üniversitesi, Küresel, Kentsel ve Sosyal Çalışmalar Bölümü",
    en: "RMIT University, Department of Global, Urban and Social Studies",
    email: "bkampmark@gmail.com",
    orcids: ["0000-0002-4171-0645"],
    institutionUrl: "https://www.rmit.edu.au/",
    biographyTr: "Dr. Binoy Kampmark, Cambridge Üniversitesi Selwyn College'da İngiliz Milletler Topluluğu Bursiyeri (Commonwealth Scholar) olarak öğrenim görmüştür. Melbourne RMIT Üniversitesi Küresel, Kentsel ve Sosyal Çalışmalar Bölümü'nde öğretim üyesidir ve Counterpunch dergisi yardımcı editörüdür. San Francisco Nautilus Güvenlik ve Sürdürülebilirlik Enstitüsü araştırmacısı ve Kanada Royal Roads Üniversitesi İnsan Güvenliği Programı üyesidir. Uluslararası hukuk, diplomasi tarihi, hukuk harbi (lawfare) ve jeopolitik güvenlik alanlarında uzmandır.",
    biographyEn: "Dr. Binoy Kampmark was a Commonwealth Scholar at Selwyn College, Cambridge. He is a Senior Lecturer in the Department of Global, Urban and Social Studies at RMIT University, Melbourne, and a contributing editor to Counterpunch. He is an associate of the Nautilus Institute for Security and Sustainability in San Francisco and a member of the human securities program at Royal Roads University, Canada, specializing in international law, diplomatic history, lawfare, and geopolitics.",
  },
  "Luis Kato Maldonado": {
    tr: "Metropolitan Autonomous University - Azcapotzalco (UAM-A), Ekonomi Bölümü",
    en: "Metropolitan Autonomous University - Azcapotzalco (UAM-A), Department of Economy",
    email: "katomaldonado@gmail.com",
    orcids: ["0000-0003-1257-9382"],
    biographyTr: "Dr. Luis Kato Maldonado, Meksika Özerk Metropolitan Üniversitesi Azcapotzalco Kampüsü (UAM-A) Ekonomi Bölümü'nde Kıdemli Profesör Araştırmacıdır. Lisansını UAM-A'da tamamlamış, Meksika Ulusal Özerk Üniversitesi'nde (UNAM) Bilim ve Teknoloji Politik İktisadı uzmanlığıyla iktisat yüksek lisans ve doktora derecelerini almıştır. Finansallaşma, iktisat politikaları, kalkınma ve neoliberalizmin yapısal krizleri üzerine araştırmalar yürütmektedir.",
    biographyEn: "Dr. Luis Kato Maldonado is Senior Professor Researcher in the Department of Economics at Metropolitan Autonomous University - Azcapotzalco (UAM-A). He earned his B.A. from UAM-A and his master's and Ph.D. in Economics from the National Autonomous University of Mexico (UNAM). His research focuses on financialization, macroeconomics, industrial organization, science and technology policy, and structural crises of neoliberal capitalism.",
  },
  "Guadalupe Huerta Moreno": {
    tr: "Metropolitan Autonomous University - Azcapotzalco (UAM-A), İşletme Yönetimi Bölümü",
    en: "Metropolitan Autonomous University - Azcapotzalco (UAM-A), Department of Business Administration",
    email: "mghmoreno@yahoo.com.mx",
    orcids: ["0000-0003-0854-3686"],
    biographyTr: "Dr. Guadalupe Huerta Moreno, Meksika Özerk Metropolitan Üniversitesi Azcapotzalco Kampüsü (UAM-A) İşletme Bölümü'nde Profesör Araştırmacıdır. Lisansını UAM-A İşletme Bölümü'nde tamamlamış, doktorasını Meksika Ulusal Özerk Üniversitesi'nde (UNAM) İktisat alanında almıştır. Meksika Ulusal Araştırmacılar Sistemi (SNI) bünyesinde ulusal araştırmacı adayıdır ve UNAM PAPIIT araştırma projesi üyesidir.",
    biographyEn: "Dr. Guadalupe Huerta Moreno is Professor Researcher in the Department of Business Administration at Metropolitan Autonomous University - Azcapotzalco (UAM-A). She earned her degree in Business Administration from UAM-A and her Ph.D. in Economics from the National Autonomous University of Mexico (UNAM). She is an active member of the PAPIIT research project at UNAM and a recognized researcher in Mexico's National System of Researchers (SNI).",
  },
  "Victor Manuel Isidro Luna": {
    tr: "Meksika Ulusal Özerk Üniversitesi (UNAM), Ekonomi Bölümü",
    en: "National Autonomous University of Mexico (UNAM), School of Economics",
    email: "u0559410@uofutah.onmicrosoft.com",
    orcids: ["0000-0003-1571-9387"],
    biographyTr: "Victor Manuel Isidro Luna, Meksika Ulusal Özerk Üniversitesi (UNAM) Ekonomi Bölümü'nde öğretim görevlisidir. 2013 yılında University of Utah'tan iktisat alanında doktora derecesi almıştır. Journal of Economic Issues, World Review of Political Economy ve Ecos de Economía gibi dergilerde makaleleri yayımlanmıştır. Araştırma alanları kalkınma bankaları, BRICS, para teorisi ve uluslararası kalkınmadır.",
    biographyEn: "Victor Manuel Isidro Luna is an instructor in the School of Economics at the National Autonomous University of Mexico (UNAM). He earned his Ph.D. in Economics from the University of Utah in 2013. His work has appeared in journals such as Journal of Economic Issues, World Review of Political Economy, and Ecos de Economía, focusing on development banks, BRICS, monetary economics, and development finance.",
  },
  "Gao Junyu": {
    tr: "Pekin Üniversitesi · ÇKP Tarihsel Önderi (1896–1925)",
    en: "Peking University · CPC Historical Leader (1896–1925)",
    biographyTr: "Gao Junyu 高君宇 (1896–1925), Marksist kuramcı ve öğrenci önderidir. 4 Mayıs 1919 gençlik hareketi sırasında Pekin Üniversitesi Öğrenci Birliği Başkanlığı'nı yürütmüştür. 1920'de Deng Zhongfu ile Birleşik Marksist Teori Araştırmaları Birliği'ni kurmuş, 1921'de Çin Komünist Partisi'nin (ÇKP) kurucu kadrosunda yer almıştır. Çin Sosyalist Gençlik Birliği Merkez Komitesi ile ÇKP 2. ve 3. Kongrelerinde Merkez Komite üyesi seçilmiştir. Genç yaşta vefat etmesine karşın, Türk Milli Kurtuluş Savaşı ve emperyalizme karşı Asya devrimleri üzerine kaleme aldığı tahlilleri Çin devrim tarihinin önemli tarihsel belgeleri arasında yer almıştır.",
    biographyEn: "Gao Junyu 高君宇 (1896–1925) was a Chinese Marxist theorist and early Communist leader. He was President of the Peking University Student Union during the May Fourth Movement in 1919. In 1920, he co-founded the Society for the Study of Marxist Theory and joined the Communist Party of China in 1921. He served on the Central Committee of the Socialist Youth League of China and was elected to the CPC Central Committee at its 2nd and 3rd National Congresses. His historical analyses evaluating Turkey's War of Independence and anti-imperialist revolutions in the East remain seminal historical documents.",
  },
  "Emrah Alan": {
    tr: "Pekin Üniversitesi, Tarih Bölümü Eski Çin Araştırmaları Merkezi",
    en: "Peking University, Department of History Center for Ancient Chinese Studies",
    email: "alanemrah@gmail.com",
    institutionUrl: "https://www.pku.edu.cn/",
    biographyTr: "Emrah Alan, Marmara Üniversitesi Tarih Bölümü mezunudur. Pekin Üniversitesi Tarih Bölümü Eski Çin Araştırmaları Merkezi'nde yüksek lisans eğitimi almış olup Eski Çin-Yabancı İlişkileri üzerine yoğunlaşmıştır.",
    biographyEn: "Emrah Alan graduated from Marmara University Department of History. He conducted graduate studies at Peking University Department of History Center for Ancient Chinese Studies, specializing in ancient Chinese-foreign relations.",
  },
  "Şeref Ateş": {
    tr: "Yunus Emre Enstitüsü Başkanı · Sakarya Üniversitesi",
    en: "President of Yunus Emre Institute · Sakarya University",
    orcids: ["0000-0001-5803-3989"],
    institutionUrl: "https://www.yee.org.tr/",
    biographyTr: "Prof. Dr. Şeref Ateş, 1964 Malatya doğumludur. Selçuk Üniversitesi'ndeki lisans eğitiminin ardından Ankara Üniversitesi DTCF Batı Dilleri ve Edebiyatları Bölümü'nde yüksek lisans ve doktora yapmış, ikinci doktorasını Almanya Marburg Üniversitesi Siyaset Bilimi Anabilim Dalı'nda tamamlamıştır. 2011'de profesör unvanı alarak Sakarya Üniversitesi Fen Edebiyat Fakültesi'nde görev yapmıştır. 2016 yılında Yunus Emre Enstitüsü Başkanlığı görevine atanmıştır. Kültür diplomasisi, kamu diplomasisi, bilim diplomasisi ve çokkültürlülük alanlarında çalışmaları bulunmaktadır.",
    biographyEn: "Prof. Dr. Şeref Ateş was born in Malatya in 1964. After graduating from Selçuk University, he earned an M.A. and Ph.D. in Western Languages and Literatures at Ankara University, and a second Ph.D. in Political Science at the University of Marburg, Germany. Appointed professor at Sakarya University in 2011, he has served as the President of Yunus Emre Institute since 2016. His research focuses on cultural diplomacy, public diplomacy, science diplomacy, intercultural dialogue, and international relations.",
  },
  "Dilek Uyar": {
    tr: "Avukat ve Uluslararası Fotoğraf Sanatçısı",
    en: "Attorney and International Award-Winning Photographer",
    biographyTr: "Dilek Uyar, 1976 Çanakkale doğumludur. Lisansını Gazi Üniversitesi Hukuk Fakültesi'nde, yüksek lisansını İş ve Sosyal Güvenlik Hukuku alanında tamamlamıştır. 2000 yılından beri Ankara Barosu'na kayıtlı avukat olarak görev yapmaktadır. 2017 National Geographic Yılın Seyahat Fotoğrafı Yarışması'nda dünya birinciliği kazanarak bu başarıyı Türkiye'ye getiren ilk kadın fotoğrafçı olmuştur. Sony Dünya Fotoğraf Ödülleri, SIENA Uluslararası Fotoğraf Ödülleri ve Birleşmiş Milletler sergilerinde eserleriyle yer almıştır.",
    biographyEn: "Dilek Uyar was born in 1976 in Çanakkale. She holds a law degree and master's in Labor and Social Security Law from Gazi University and has practiced as an attorney with the Ankara Bar Association since 2000. In 2017, she won first place in the National Geographic Travel Photographer of the Year competition, becoming the first Turkish female photographer to achieve this honor. Her photography has received worldwide recognition from Sony World Photography Awards, SIENA International Photo Awards, and United Nations exhibits.",
  },
  "Alexander Dugin": {
    tr: "Rus Jeopolitik Okulu ve Avrasya Hareketi Kurucusu",
    en: "Founder of the Russian Geopolitical School and International Eurasian Movement",
    email: "dugin@rossia3.ru",
    orcids: ["0000-0001-7611-5152"],
    biographyTr: "Dr. Alexander Dugin (d. 1962), Rus düşünür, sosyolog ve siyaset bilimcidir. Rus Jeopolitik Okulu ve Uluslararası Avrasya Hareketi'nin kurucusudur. 2008–2014 yılları arasında Moskova Devlet Üniversitesi Sosyoloji Fakültesi Uluslararası İlişkiler Sosyolojisi Bölüm Başkanlığı görevini yürütmüştür. Jeopolitiğin Temelleri, Dördüncü Siyasi Teori, Çok Kutuplu Dünya Teorisi ve Noomakhia gibi altmıştan fazla kitabın yazarıdır.",
    biographyEn: "Dr. Alexander Dugin (b. 1962) is a Russian philosopher, political scientist, and sociologist. He is the founder of the Russian Geopolitical School and the International Eurasian Movement. Between 2008 and 2014, he served as Head of the Department of Sociology of International Relations at Moscow State University. He is the author of over sixty books, including Foundations of Geopolitics, The Fourth Political Theory, Theory of a Multipolar World, and Noomakhia.",
  },
  "Li Jing": {
    tr: "Çin Sosyal Bilimler Akademisi (CASS)",
    en: "Chinese Academy of Social Sciences (CASS)",
    email: "lijingruc2014@163.com",
    biographyTr: "Dr. Li Jing, Çin Sosyal Bilimler Akademisi'nde (CASS) öğretim görevlisidir. 2017 yılında Renmin Üniversitesi Uluslararası Çalışmalar Fakültesi Uluslararası Politik Ekonomi alanında doktorasını tamamlamıştır. Küresel yönetişim, Avrupa Birliği, Çin-Rusya enerji işbirlikleri ve Kuşak ve Yol deniz işbirlikleri üzerine akademik çalışmaları bulunmaktadır.",
    biographyEn: "Dr. Li Jing is a researcher and lecturer at the Chinese Academy of Social Sciences (CASS). She completed her Ph.D. in International Political Economy at Renmin University's School of International Studies in 2017. Her research focuses on global governance, EU studies, Sino-Russian energy cooperation, and maritime cooperation under the Belt and Road Initiative.",
  },
  "Ersel Zafer Oral": {
    tr: "Margen Deniz ve Kara Araştırmaları · TÜRKLİM Danışmanı",
    en: "Margen Marine and Land Research · Consultant to TÜRKLİM",
    email: "ersel.oral@margenproje.com",
    biographyTr: "Dr. Ersel Zafer Oral, 1984 yılında Yıldız Teknik Üniversitesi'nden mezun olmuş, Dokuz Eylül Üniversitesi Deniz Bilimleri ve Teknolojisi Enstitüsü'nde yüksek lisans (1988) ve doktora (1999) yapmıştır. Japonya PHRI'de liman mühendisliği eğitimi almıştır. Enerji ve Tabii Kaynaklar Bakanlığı ile Ulaştırma Bakanlığı DLH bünyesinde görev almış; 2001–2012 yılları arasında DEÜ Denizcilik Fakültesi'nde öğretim üyeliği yapmıştır. Margen Danışmanlık kurucusu olup TÜRKLİM ve İMEAK DTO İzmir Şubesi danışmanlığını yürütmektedir.",
    biographyEn: "Dr. Ersel Zafer Oral graduated from Yıldız Technical University in 1984, completing his M.S. (1988) and Ph.D. (1999) at Dokuz Eylül University (DEU). He received port engineering training at Japan's Port and Harbour Research Institute. He served in the Ministry of Energy and Natural Resources and Ministry of Transport DLH, lecturing at DEU Maritime Faculty (2001–2012). Founder of Margen Consultancy, he serves as chief advisor to TÜRKLİM and Turkish Chamber of Shipping Izmir Branch.",
  },
  "Assadollah Athari": {
    tr: "Takestan İslami Azad Üniversitesi, Siyaset Bilimi Bölümü",
    en: "Islamic Azad University of Takestan, Department of Political Science",
    email: "athary.asadolah@yahoo.com",
    biographyTr: "Dr. Öğr. Üyesi Assadollah Athari, Tahran Üniversitesi'nde Siyaset Bilimi doktorasını tamamlamıştır. İslami Azad Üniversitesi Takestan Kampüsü'nde Siyaset Bilimi öğretim üyesidir. Tahran Stratejik Araştırmalar Merkezi ve Ortadoğu Stratejik Araştırmalar Merkezi'nde kıdemli araştırmacı olarak görev yapmıştır. İran Uluslararası Çalışmalar Derneği kurucularındandır; Türkiye'nin iç ve dış politikası ile Ortadoğu jeopolitiği üzerine çok sayıda yayını vardır.",
    biographyEn: "Asst. Prof. Dr. Assadollah Athari earned his Ph.D. in Political Science from the University of Tehran. He is Professor of Political Science at Islamic Azad University of Takestan. He previously served as a senior researcher at the Center for Strategic Research and Middle East Strategic Studies Center in Tehran. A co-founder of the Iranian International Studies Association, he is an expert on Turkish foreign policy and Middle Eastern politics.",
  },
  "Ehsan Ejazi": {
    tr: "Gilan Üniversitesi, Uluslararası İlişkiler Bölümü",
    en: "University of Guilan, Department of International Relations",
    email: "ehsan.ejazi@gmail.com",
    orcids: ["0000-0003-3686-1913"],
    biographyTr: "Dr. Ehsan Ejazi, Gilan Üniversitesi Uluslararası İlişkiler Bölümü'nde doktorasını tamamlamış ve aynı üniversitede öğretim görevlisi olarak ders vermektedir. 2016'dan bu yana Tahran Ortadoğu Stratejik Araştırmalar Merkezi'nde araştırmacıdır. Çalışma alanları Ortadoğu siyaseti, İran dış politikası, İran-ABD ilişkileri ve Filistin-İsrail meselesidir.",
    biographyEn: "Dr. Ehsan Ejazi earned his Ph.D. in International Relations at the University of Guilan, where he currently lectures. Since 2016, he has been a fellow researcher at the Middle East Strategic Studies Center in Tehran, specializing in Middle Eastern politics, Iranian foreign policy, US-Iran relations, and the Israeli-Palestinian conflict.",
  },
  "Mehmet Perinçek": {
    tr: "Moskova Devlet Üniversitesi, Asya ve Afrika Ülkeleri Enstitüsü",
    en: "Moscow State University, Institute of Asian and African Countries",
    email: "mperincek@hotmail.com",
    biographyTr: "Dr. Mehmet Perinçek, 1978 İstanbul doğumludur. İstanbul Üniversitesi Hukuk Fakültesi mezunudur. İstanbul Üniversitesi Atatürk İlkeleri ve İnkılâp Tarihi Enstitüsü'nde araştırma görevliliği yapmış; Moskova Devlet Uluslararası İlişkiler Enstitüsü (MGİMO) ve Moskova Devlet Üniversitesi Asya ve Afrika Ülkeleri Enstitüsü'nde misafir araştırmacı olarak bulunmuştur. 2017'den beri Moskova Devlet Üniversitesi'nde misafir profesördür. Yirmi yılı aşkın süredir Rus-Sovyet arşivlerinde Türk-Sovyet ilişkileri, Kafkasya, Doğu Akdeniz ve Ermeni meselesi üzerine çalışmaktadır.",
    biographyEn: "Dr. Mehmet Perinçek was born in Istanbul in 1978. He graduated from Istanbul University Faculty of Law. He conducted research at MGIMO (2005–2006) and Moscow State University's Institute of Asian and African Countries (2010–2011), where he has served as visiting professor since 2017. He has conducted research in Russian and Soviet state archives for over two decades, authoring multiple books on Turkish-Soviet relations, the Eastern Mediterranean, and regional geopolitics.",
  },
  "Serhat Latifoğlu": {
    tr: "Serbest Fon Yöneticisi · Versum Wealth",
    en: "Hedge Fund Manager · Versum Wealth",
    email: "serhat@versumwealth.com",
    orcids: ["0009-0000-6214-7786"],
    appointmentTermTr: "2019–Günümüz",
    appointmentTermEn: "2019–Present",
    biographyTr: "Serhat Latifoğlu, serbest fon yöneticisi ve finans danışmanıdır. Marmara Üniversitesi İİBF Maliye Bölümü mezunudur ve Yale Üniversitesi Davranışsal Ekonomi Sertifikası sahibidir. Finans kariyerinde Türkiye'nin önde gelen yatırım bankaları ve aracı kurumlarında türev piyasalar bölümlerini kurmuş ve yönetmiştir. İsviçre'de ilk Türk türev arbitraj fonunu kurmuş, Londra merkezli Versum Wealth özel varlık fonunun kurucu ortaklığını üstlenmiştir. Davranışsal finans ve yapay zeka odaklı fon yönetimi yapmaktadır. BRIQ Danışma Kurulu üyesidir.",
    biographyEn: "Serhat Latifoğlu is a hedge fund manager and financial strategist. He graduated in Public Finance from Marmara University and holds a Behavioral Finance Certificate from Yale University. Throughout his career, he established and directed derivatives desks for major Turkish investment banks and brokerages. He founded Turkey's first derivative arbitrage fund in Switzerland and co-founded London-based boutique wealth management firm Versum Wealth, specializing in behavioral finance and AI-driven asset management.",
  },
  "Mesud Sadrmohammadi": {
    tr: "Hacettepe Üniversitesi, Tarih Bölümü",
    en: "Hacettepe University, Department of History",
    email: "m.sadrmohammadi@gmail.com",
    biographyTr: "Mesud Sadrmohammadi, Tebriz doğumlu araştırmacı ve gazetecidir. Tahran Üniversitesi Kafkasya ve Orta Asya Araştırmaları Bölümü'nde yüksek lisansını tamamlamış, Hacettepe Üniversitesi Tarih Bölümü'nde doktora çalışmalarını sürdürmüştür. İran ve Türk basınında Türkiye, Avrasya, son dönem Osmanlı siyaseti ve Ortadoğu kültürel ilişkileri üzerine çok sayıda haber, araştırma ve kitap yayımlamıştır.",
    biographyEn: "Mesud Sadrmohammadi is an Iranian researcher and journalist born in Tabriz. He completed his master's in Caucasian and Central Asian Studies at the University of Tehran and pursued his Ph.D. in History at Hacettepe University in Ankara. He has contributed extensive analyses to Iranian and Turkish media focusing on late Ottoman history, Turkish-Iranian relations, and Eurasian cultural diplomacy.",
  },
  "Serdar Yurtçiçek": {
    tr: "Uluslararası İşletme ve Ekonomi Üniversitesi (UIBE Pekin) · Gazeteci",
    en: "University of International Business and Economics (UIBE Beijing) · Journalist",
    email: "serdaryurtcicek@gmail.com",
    biographyTr: "Serdar Yurtçiçek, 1985 Diyarbakır doğumludur. Dokuz Eylül Üniversitesi İşletme ve Anadolu Üniversitesi Uluslararası İlişkiler bölümlerini bitirmiştir. Beykent Üniversitesi İşletme Bölümü ile Çin Zhejiang Üniversitesi Uluslararası Meseleler ve Küresel Yönetişim Bölümü'nde yüksek lisans dereceleri almıştır. 2014–2016 yılları arasında Aydınlık Gazetesi Genel Müdür Yardımcılığı yapmıştır. Pekin'de Uluslararası İşletme ve Ekonomi Üniversitesi (UIBE) Uluslararası Politikalar Bölümü'nde doktora yapmıştır.",
    biographyEn: "Serdar Yurtçiçek was born in 1985 in Diyarbakır. He graduated in Business Administration from Dokuz Eylül University and International Relations from Anadolu University. He holds master's degrees from Beykent University and Zhejiang University. He served as Deputy Director General of Aydınlık Daily (2014–2016) and conducted doctoral studies in International Politics at the University of International Business and Economics (UIBE) in Beijing.",
  },
  "Ni Min": {
    tr: "Fotoğraf Sanatçısı",
    en: "Photography Artist",
    biographyTr: "Ni Min, Çinli fotoğraf sanatçısıdır. Eserlerinde Güney Çin Fujian eyaleti Huidong Yarımadası sahilinde yaşayan Hui'an kadınlarının geleneksel halk kıyafetleri, kültürel dokusu ve çalışma pratikleri üzerine belgesel fotoğraflar üretmektedir.",
    biographyEn: "Ni Min is a Chinese photographer whose documentary work captures the distinctive folk customs, daily labor, and traditional attire of the Hui'an women on the coast of the Huidong Peninsula in Fujian Province, Southern China.",
  },
  "Bassam Abu Abdullah": {
    tr: "Baas Partisi Merkez Parti Okulu Başkanı",
    en: "Head of the Ba'ath Party's Central Party School",
    email: "DCSSI@live.com",
    orcids: [],
    biographyTr: "Bassam Abu Abdullah, Özbekistan Üniversitesi Bilimler Akademisi Uluslararası İlişkiler alanında doktora derecesine sahiptir (1993). Türkiye'deki Suriye Büyükelçiliği'nde diplomat olarak görev yapmıştır (2004–2008). Yazar ve siyaset uzmanı olan Abdullah, üniversitelerde dersler vermektedir. Şam Stratejik Araştırmalar Merkezi'nin (2012–2014) çalışma ekibini yönetmiştir. Dr. Ziad Ayoub Arbache ve Malaz Moukada ile birlikte Çin üzerine Arapça bir kitap yayımlamıştır (Çin: Yeni Bir Dünya Düzeninin Kurucu Eylemi, Orient Printing & Publishing, Şam, Eylül 2019). Şangay Uluslararası Araştırmalar Üniversitesi Ortadoğu Araştırmaları Enstitüsü misafir araştırmacısıdır. Arapça, İngilizce, Rusça ve Türkçe bilmektedir.",
    biographyEn: "Bassam Abu Abdullah holds a PhD in International Relations from the Academy of Sciences of Uzbekistan University (1993). He was a Diplomat in the Syrian embassy in Turkey (2004–2008). He is a writer and political expert who teaches at universities. He served as a team leader at the Damascus Strategic Studies Center (2012–2014). He recently published a book with Dr. Ziad Ayoub Arbache and Malaz Moukada on China in Arabic (China: The Founding Act of a New World Order, Orient Printing & Publishing, Damascus, 2019). He is a visiting researcher at the Institute of Middle Eastern Studies, Shanghai University of International Studies. He speaks Arabic, English, Russian, and Turkish.",
  },
  "Ziad Ayoub Arbache": {
    tr: "İktisat Fakültesi, Şam Üniversitesi",
    en: "Faculty of Economics, Damascus University",
    email: "ziad-ay@scs-net.org",
    orcids: ["0009-0008-5626-4255"],
    biographyTr: "Ziad Ayoub Arbache, Enerji Ekonomisi ve Politikası Enstitüsü'nden (IEPE-INPG, Grenoble, Fransa) doktora derecesine sahiptir (1998). Suriye'de çeşitli bakanlıklara ve uluslararası kalkınma örgütlerine danışmanlık yapmıştır. Suriye Başbakanlığı'nın danışma kurulu üyesidir. Birçok lisansüstü öğrenim merkezinde öğretim görevlisi olarak görev yapmaktadır. Temel araştırma alanları; jeo-ekonomi ve stratejik öngörü çalışmaları, barış inşası ve iyileştirme stratejileri, bölgesel planlama ve enerji jeopolitiğidir. Arapça, Fransızca ve İngilizce bilmektedir.",
    biographyEn: "Ziad Ayoub Arbache holds a PhD from the Institute of Energy Economics and Policy (IEPE-INPG), Grenoble, France (1998). He worked as an advisor to several ministries in Syria and as a consultant for international development organizations. He is a member of the Advisory Board of the Syrian Prime Minister and a lecturer in several postgraduate centers. His research covers geo-economics, strategic prospective studies, peacebuilding and recovery strategies, regional planning, and geopolitics of energy. He speaks Arabic, French, and English.",
  },
  "Tevfik Kadan": {
    tr: "Gazeteci",
    en: "Journalist",
    email: "tevfikkadan@gmail.com",
    orcids: ["0009-0007-7935-5857"],
    biographyTr: "Tevfik Kadan, 27 Nisan 1990'da Isparta'da doğdu. Nazmiye Demirel İlköğretim Okulu'nda ilk ve ortaöğrenimini tamamladıktan sonra 2004 yılında Heybeliada Deniz Lisesi'ne girdi. Üç yıllık Bilgisayar Mühendisliği eğitiminin ardından Selçuk Üniversitesi'nde Elektrik-Elektronik Mühendisliği okudu; 2014 yılında mezun oldu. 2018'de Anadolu Üniversitesi'nde Uluslararası İlişkiler'de ikinci lisans eğitimine başladı. 2010'dan itibaren gazetecilik alanında çalışan Kadan, iki yıl Vatan Partisi Basın Bürosu Başkanlığı ve iki yıl Aydınlık Gazetesi Haber Müdürlüğü yaptı. Aydınlık.com.tr internet sitesinde Genel Yayın Yönetmeni olarak görev yapmaktadır. Deniz jeopolitiği üzerine çok sayıda haber ve röportajı bulunmaktadır.",
    biographyEn: "Tevfik Kadan was born on April 27, 1990, in Isparta, Turkey. After completing elementary and secondary school at Nazmiye Demirel Elementary School, he entered Heybeliada Naval High School in 2004. After studying Computer Engineering at the Naval Academy for three years, he transferred to Selçuk University to study Electrical and Electronic Engineering, graduating in 2014. He has been pursuing a second BA in International Relations at Anadolu University since 2018. Working in journalism since 2010, he served as Head of the Patriotic Party Press Bureau and news manager at Aydınlık Daily. He currently serves as Editor-in-Chief of Aydınlık.com.tr and has written extensively on maritime geopolitics.",
  },
  "Günay Çifci": {
    tr: "Jeofizik Bölümü, Dokuz Eylül Üniversitesi",
    en: "Department of Geophysics, Dokuz Eylül University",
    email: "gunay.cifci@deu.edu.tr",
    orcids: ["0000-0002-4380-8056"],
    biographyTr: "Prof. Dr. Günay Çifci, lisans eğitimini Yıldız Üniversitesi Jeofizik Bölümü'nde, yüksek lisansını Dokuz Eylül Üniversitesi (DEÜ) Deniz Bilimleri ve Teknolojisi Enstitüsü'nde (DBTE), doktora çalışmasını ise Trieste Üniversitesi / İtalya ile DEÜ Fen Bilimleri Enstitüsü'nde tamamlamıştır. 1991, 1995, 1996, 2000 ve 2001 yıllarında UNESCO destekli Kayan Üniversite (TTR) programlarına katılmıştır. 2001'de Virginia Tech Üniversitesi Yer Bilimleri Bölümü'nde doktora sonrası araştırmacı olarak bulunmuştur. 2003 yılında DEÜ DBTE'ye tam zamanlı profesör olarak atanmıştır. DPT desteğiyle kurulan Jeofizik Sismik Laboratuvarı'nın (SeisLab) koordinatörlüğünü yürüterek 2005–2018 yılları arasında gaz hidrat ve deniz jeolojisi araştırmalarını yönetmiştir. Çeşitli AB ve Ufuk 2020 projelerinde proje ortağı koordinatörü olarak yer almıştır.",
    biographyEn: "Prof. Dr. Günay Çifci completed his undergraduate studies at Yıldız University Department of Geophysics, his master's degree at Dokuz Eylül University (DEU) Institute of Marine Sciences and Technology (DBTE), and his doctorate at Trieste University, Italy and DEU Graduate School of Natural and Applied Sciences. He participated in UNESCO-supported Floating University Training through Research (TTR) cruises in 1991, 1995, 1996, 2000, and 2001. In 2001, he was a visiting researcher at Virginia Tech University's Department of Earth Sciences. Appointed full-time professor at DEU DBTE in 2003, he coordinated the Geophysics Seismic Laboratory (SeisLab) conducting gas hydrate and marine geology research between 2005–2018. He has served as a project partner coordinator in several EU and Horizon 2020 projects.",
  },
  "Arif Acaloğlu": {
    tr: null,
    en: null,
    email: "arifacal@gmail.com",
    orcids: ["0000-0002-9873-3979"],
    biographyTr: "Arif Acaloğlu, 1956'da Kepenekçi/Borçalı/Gürcistan'da doğdu. Bakü Devlet Üniversitesi Filoloji Fakültesi'ni bitirdi. 1982'de Edebiyat Enstitüsü Mitoloji Bölümü'nde araştırma görevlisi olarak çalışmaya başladı. 1983–1986 yıllarında Tartu Üniversitesi'nde (Estonya) Semiyoloji dalında doktora eğitimi gördü. 1987–1990 yıllarında Halkbilim Bölümü'nde uzman, 1990 itibarıyla Bakü Devlet Üniversitesi'nde öğretim görevlisi oldu. 1992–1993 yıllarında Azerbaycan Cumhurbaşkanlığı'nda danışmanlık görevinde bulundu. Uzun süre Bilgi Üniversitesi Rus Dili Programı'nda, 2008–2019 arasında ise Yeditepe Üniversitesi Antropoloji Bölümü'nde öğretim üyeliği yaptı. Akademik çalışmaları mitoloji, halk edebiyatı ve Avrasya halklarının kültürel mirası alanlarını kapsamaktadır. İki kitabı ve 40 civarında makalesi yayımlanmıştır.",
    biographyEn: "Arif Acaloğlu was born in 1956 in Kepenekçi/Borchali, Georgia. He completed the philology program at Baku State University. In 1982, he began working as a research associate at the Mythology Department of the Literature Institute. From 1983 to 1986, he pursued his Ph.D. studies in semiology at Tartu University, Estonia. He worked as a specialist in the Folklore Department and then as a lecturer at Baku State University from 1990. He served as an advisor at the Azerbaijani Presidency in 1992–1993. He taught at Istanbul Bilgi University's Russian Language Program and at the Department of Anthropology, Yeditepe University (2008–2019). His academic work covers mythology, folk literature, and the cultural heritage of Eurasian peoples. He has published two books and approximately 40 articles.",
  },
  "Ömer Burhanoğlu": {
    tr: "Fotoğraf Sanatçısı",
    en: "Photography Artist",
    orcids: [],
    biographyTr: "1960 yılında Trabzon'da doğan Ömer Burhanoğlu, Boğaziçi Üniversitesi Makine Mühendisliği lisans ve İstanbul Teknik Üniversitesi Sistem Analizi yüksek lisans öğrenimi görmüş, İşletme Mühendisliği alanında doktora çalışmasında bulunmuştur. 37 yılı aşan deneyimiyle otomotiv sanayisinin lider isimleri arasında yer almaktadır. 1983'ten bu yana Farplas'ı sektörün önde gelen şirketlerinden biri hâline getirmiş; hâlen Farplas CEO ve Yönetim Kurulu Üyesi olarak görev yapmaktadır. Fotoğraf sanatçısı olan Burhanoğlu, eserlerini 'AYNI AYRI' adlı kitabında yayımlamıştır; kitabın tüm geliri Trabzon'daki Ömer Burhanoğlu Hastanesi'ne bağışlanmaktadır.",
    biographyEn: "Born in 1960 in Trabzon, Ömer Burhanoğlu graduated from Boğaziçi University in Mechanical Engineering, earned a master's degree in System Analysis from Istanbul Technical University, and pursued a Ph.D. in Management Engineering. With more than 37 years of experience, he is one of the leaders of the automotive industry, having transformed Farplas into one of the sector's leading companies since 1983. He currently serves as CEO and member of the Executive Board of Farplas. As a photography artist, his work is published in the book 'AYNI AYRI', with all proceeds donated to Ömer Burhanoğlu Hospital in Trabzon.",
  },
  "Jinghua Cao": {
    tr: "Uluslararası Bilim Kuruluşları Birliği (ANSO) İcra Direktörü",
    en: "Executive Director, Alliance of International Science Organizations (ANSO)",
    biographyTr: "Prof. Jinghua Cao, Uluslararası Bilim Kuruluşları Birliği (ANSO) Sekreterliği İcra Direktörü'dür. Bu görevinden önce Çin Bilimler Akademisi'nin (CAS) Uluslararası İşbirliği Bürosu Genel Müdürü olarak görev yapmıştır. New York Şehir Koleji'nde işletme ve uluslararası politikalar üzerine yüksek lisans yapmış; 1995–1997 yılları arasında Çin'in Washington Büyükelçiliği'nde Bilim ve Teknoloji Ataşesi olarak bulunmuştur.",
    biographyEn: "Prof. Jinghua Cao is Executive Director of the Secretariat of the Alliance of International Science Organizations (ANSO). Previously, he served as Director-General of the Bureau of International Cooperation at the Chinese Academy of Sciences (CAS). He holds a master's degree from the City College of New York and served as Science and Technology Attaché at the Chinese Embassy in Washington from 1995 to 1997.",
  },
  "Şiir Kılkış": {
    tr: "TÜBİTAK · ODTÜ Yer Sistem Bilimleri",
    en: "Earth System Science, TÜBİTAK and METU",
    email: "siir.kilkis@tubitak.gov.tr",
    orcids: ["0000-0003-3466-3593"],
    biographyTr: "Doç. Dr. Şiir Kılkış, doktora derecesini KTH Kraliyet Teknoloji Enstitüsü'nden (İsveç) almıştır. Georgetown Üniversitesi Bilim, Teknoloji ve Uluslararası İlişkiler programından altın madalya ve yüksek onur derecesiyle mezun olmuştur. Hükümetlerarası İklim Değişikliği Paneli (IPCC) Altıncı Değerlendirme Raporu'nda Başyazar olarak görev yapmıştır. TÜBİTAK'ta Başuzman ve Danışman, ODTÜ Yer Sistem Bilimleri'nde öğretim üyesidir.",
    biographyEn: "Assoc. Prof. Dr. Şiir Kılkış earned her PhD from KTH Royal Institute of Technology and graduated magna cum laude with a gold medal in Science, Technology, and International Affairs from Georgetown University. She serves as a Lead Author for the Intergovernmental Panel on Climate Change (IPCC) Sixth Assessment Report. She is a Senior Researcher and Advisor at TÜBİTAK and teaches at METU Earth System Science.",
  },
  "Xi Jinping": {
    tr: "Çin Halk Cumhuriyeti Cumhurbaşkanı",
    en: "President of the People's Republic of China",
    biographyTr: "Xi Jinping, Çin Komünist Partisi Genel Sekreteri ve Çin Halk Cumhuriyeti Cumhurbaşkanıdır.",
    biographyEn: "Xi Jinping is the General Secretary of the Chinese Communist Party and President of the People's Republic of China.",
  },
  "Uğur Murat Leloğlu": {
    tr: "Orta Doğu Teknik Üniversitesi, Jeodezi ve Coğrafi Bilgi Teknolojileri Bölümü",
    en: "Department of Geodetic and Geographic Information Technologies, Middle East Technical University",
    email: "leloglu.um@gmail.com",
    orcids: ["0000-0002-8584-7301"],
    institutionUrl: "https://metu.edu.tr/",
    biographyTr: "Doç. Dr. Uğur Murat Leloğlu, lisans, yüksek lisans ve doktora derecelerini ODTÜ Elektrik-Elektronik Mühendisliği Bölümü'nden almıştır. TÜBİTAK UZAY'da araştırmacı olarak çalışmış; ODTÜ Jeodezi ve Coğrafi Bilgi Teknolojileri Bölümü'nde yer gözlemi ve uzaktan algılama alanında öğretim üyeliği yapmaktadır.",
    biographyEn: "Assoc. Prof. Dr. Uğur Murat Leloğlu obtained his BSc, MSc, and PhD degrees from the Department of Electrical and Electronics Engineering at Middle East Technical University. He worked at TÜBİTAK UZAY and is currently an associate professor in the Department of Geodetic and Geographic Information Technologies at METU focusing on earth observation and remote sensing.",
  },
  "Birol Kılkış": {
    tr: "OSTİM Teknik Üniversitesi",
    en: "OSTIM Technical University",
    email: "birolkilkis@hotmail.com",
    orcids: ["0000-0003-2580-3910"],
    institutionUrl: "https://ostimteknik.edu.tr/",
    biographyTr: "Prof. Dr. Birol Kılkış, ODTÜ Makina Mühendisliği Bölümü'nden lisans, yüksek lisans ve doktora derecelerini almıştır. ASHRAE Fellow üyesi olan Kılkış, enerji, ekserji, ısı pompaları ve kojenerasyon konularında 500'den fazla yayına ve çok sayıda patente sahiptir. OSTİM Teknik Üniversitesi'nde öğretim üyeliği yapmaktadır.",
    biographyEn: "Prof. Dr. Birol Kılkış earned his BSc, MSc, and PhD in Mechanical Engineering from Middle East Technical University. An ASHRAE Fellow, Dr. Kılkış has authored over 500 papers and holds numerous patents on energy, exergy, heat pump cogeneration, and HVAC systems. He is a professor at OSTIM Technical University.",
  },
  "Ali Şahin": {
    tr: "İstanbul Üniversitesi, Atatürk İlkeleri ve İnkılap Tarihi Enstitüsü",
    en: "Institute of Atatürk's Principles and Revolution History, Istanbul University",
    email: "alisahin@istanbul.edu.tr",
    orcids: ["0000-0002-4701-9695"],
    institutionUrl: "https://istanbul.edu.tr/",
    biographyTr: "Dr. Ali Şahin, lisans öğrenimini İstanbul Üniversitesi Antropoloji Bölümü'nde, yüksek lisans ve doktorasını İstanbul Üniversitesi Atatürk İlkeleri ve İnkılap Tarihi Enstitüsü'nde tamamlamıştır. Türkiye'nin yakın tarihi, siyasal düşünce tarihi ve Türk devrimi üzerine çalışmalar yürütmektedir.",
    biographyEn: "Dr. Ali Şahin completed his undergraduate studies in Anthropology and his master's and PhD at the Institute of Atatürk's Principles and Revolution History, Istanbul University. His research focuses on Turkey's recent political history, intellectual history, and the Turkish Revolution.",
  },
  "Sevtap İnal": {
    tr: "Mersin Fotoğraf Derneği Yönetim Kurulu Üyesi, Fotoğraf Sanatçısı",
    en: "Board Member of Mersin Photography Association, Photography Artist",
    biographyTr: "Sevtap İnal, 2010'dan bu yana fotoğraf sanatıyla ilgilenmekte olup Uluslararası Fotoğraf Sanatı Federasyonu (FIAP) tarafından EFIAP unvanına layık görülmüştür. Birçok ulusal ve uluslararası ödülün sahibidir. Mersin Fotoğraf Derneği Yönetim Kurulu üyesidir.",
    biographyEn: "Sevtap İnal has been practicing photography since 2010 and was awarded the EFIAP distinction by the International Federation of Photographic Art (FIAP). Winner of numerous national and international awards, she is a board member of the Mersin Photography Association.",
  },
  "Uğur Durak": {
    tr: "Ressam ve İllüstratör",
    en: "Painter and Illustrator",
    biographyTr: "Uğur Durak, 1959'da Karabük'te doğmuştur. Doğan Kardeş ve Gırgır dergilerinde çizerlik yapmış, Almanya Fachhochschule Köln Serbest Resim Bölümü'nden mezun olmuştur. Yurt dışında 40 kadar sergi açmış, 22 kitap resimlemiştir.",
    biographyEn: "Uğur Durak was born in 1959 in Karabük. He worked as an illustrator for Doğan Kardeş and Gırgır magazines and graduated from Fachhochschule Köln Department of Painting in Germany. He has held around 40 international exhibitions and illustrated 22 books.",
  },
  "Turhan Selçuk": {
    tr: "Karikatürist",
    en: "Cartoonist",
    biographyTr: "Turhan Selçuk (1922–2010), Türk mizah ve karikatür sanatının öncülerindendir. 1957'de yarattığı Abdülcanbaz karakteriyle tanınan usta çizer, Türkiye Karikatürcüler Derneği'nin kurucularındandır.",
    biographyEn: "Turhan Selçuk (1922–2010) was a pioneering Turkish cartoonist and satirist. Renowned for creating the iconic comic character Abdülcanbaz in 1957, he co-founded the Turkish Cartoonists Association and held exhibitions worldwide.",
  },
};

const displayCorrections: Record<string, string> = {
  "Barış Adıbellİ": "Barış Adıbelli",
  "Mevlânâ Celâleddİn Rûmî": "Mevlânâ Celâleddin Rûmî",
  "Degang Sun": "Sun Degang",
  "Hend ElMahly Mahhoud Sultan": "Hend ElMahly Mahmoud Sultan",
  "VIctor Manuel Isidro Luna": "Victor Manuel Isidro Luna",
  "Ömer Ersİn Kahraman": "Ömer Ersin Kahraman",
  "gao junyu": "Gao Junyu",
  "emrah alan": "Emrah Alan",
  "mehmet perİNÇEK": "Mehmet Perinçek",
  "serhat latİfoğlu": "Serhat Latifoğlu",
  "Mesud Sadrmohammadİ": "Mesud Sadrmohammadi",
  "Serdar Yurtçİçek": "Serdar Yurtçiçek",
  "Alexander DUGIN": "Alexander Dugin",
  "Ersel Zafer ORAL": "Ersel Zafer Oral",
  "Zıad Ayoub Arbache": "Ziad Ayoub Arbache",
  "Turhan Selcuk": "Turhan Selçuk",
  "Ugur Durak": "Uğur Durak",
  "Sevtap Inal": "Sevtap İnal",
  "Siir Kilkis": "Şiir Kılkış",
  "Ugur Murat Leloglu": "Uğur Murat Leloğlu",
  "Birol Kilkis": "Birol Kılkış",
  "Ali Sahin": "Ali Şahin",
};

function withoutAcademicTitle(value: string) {
  let name = value.trim();
  const prefixes = [
    /^Assoc\.?\s+Prof\.?\s+Dr\.?\s*/iu,
    /^Asst\.?\s+Prof\.?\s+Dr\.?\s*/iu,
    /^Asst\.?\s+Prof\.?\s*/iu,
    /^Doç\.?\s+Dr\.?\s*/iu,
    /^Dr\.?\s+Öğr\.?\s+Üyesi\s*/iu,
    /^Prof\.?\s+Dr\.?\s*/iu,
    /^Prof\s+Dr\.?\s*/iu,
    /^Prof\.?\s*/iu,
    /^Dr\.?\s*/iu,
  ];
  for (const prefix of prefixes) name = name.replace(prefix, "");
  return displayCorrections[name] || name;
}

export function splitAuthorNames(byline: string) {
  if (/\s+ve\s+Ekibi$/iu.test(byline)) return [withoutAcademicTitle(byline)];
  return byline
    .split(/\s*[·]\s*|\s+-\s+|-\s+(?=[A-ZÇĞİÖŞÜ])|\s+(?:ve|and|&)\s+/iu)
    .map(withoutAcademicTitle)
    .filter(Boolean);
}

export function isPersonByline(name: string) {
  return !genericBylines.has(name.trim().toLocaleLowerCase("tr-TR"));
}

export function authorId(name: string) {
  return withoutAcademicTitle(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

export function authorProfileHref(name: string, locale: Locale) {
  return `${locale === "tr" ? "/tr/yazar" : "/en/authors"}/${authorId(name)}`;
}

export function authorAffiliation(name: string, locale: Locale) {
  const canonical = withoutAcademicTitle(name);
  const metadata = authorMetadata[canonical];
  if (metadata?.[locale]) return metadata[locale];
  return locale === "tr" ? "Bağımsız Araştırmacı" : "Independent Researcher";
}

export function authorEmail(name: string) {
  return authorMetadata[withoutAcademicTitle(name)]?.email;
}

export function bylineAffiliation(byline: string, locale: Locale) {
  const affiliations = splitAuthorNames(byline)
    .filter(isPersonByline)
    .map((name) => authorAffiliation(name, locale));
  return [...new Set(affiliations)].join(" · ") || authorAffiliation(byline, locale);
}

export const authorProfiles: AuthorProfile[] = (() => {
  const profiles = new Map<string, AuthorProfile>();

  for (const article of archiveArticles) {
    const names = splitAuthorNames(article.author);
    for (const [index, name] of names.entries()) {
      if (!isPersonByline(name)) continue;
      const id = authorId(name);
      const metadata = authorMetadata[name] || {};
      const articleOrcid = article.orcids?.[index];
      const discoveredOrcids = [...new Set([...(metadata.orcids || []), ...(articleOrcid ? [articleOrcid] : [])])];
      const existing = profiles.get(id);
      if (existing) {
        if (!existing.articles.some((item) => item.slug === article.slug)) existing.articles.push(article);
        for (const orcid of discoveredOrcids) {
          if (!existing.orcids.includes(orcid)) existing.orcids.push(orcid);
        }
        continue;
      }

      profiles.set(id, {
        id,
        name,
        affiliationTr: authorAffiliation(name, "tr"),
        affiliationEn: authorAffiliation(name, "en"),
        email: metadata.email,
        orcids: discoveredOrcids,
        institutionUrl: metadata.institutionUrl,
        scholarUrl: `https://scholar.google.com/scholar?q=${encodeURIComponent(`"${name}"`)}`,
        photo: profilePhotos[name],
        rolesTr: [],
        rolesEn: [],
        biographyTr: metadata.biographyTr || "",
        biographyEn: metadata.biographyEn || "",
        briqAppointments: [],
        articles: [article],
      });
    }
  }

  const boardGroups = [
    { people: editorialBoard, tr: "Yayın Kurulu", en: "Editorial Board", roleTr: "Yayın Kurulu Üyesi", roleEn: "Editorial Board Member" },
    { people: advisoryBoard, tr: "Danışma Kurulu", en: "Advisory Board", roleTr: "Danışma Kurulu Üyesi", roleEn: "Advisory Board Member" },
    { people: editors, tr: "Editörlük Ekibi", en: "Editorial Team", roleTr: "Editörlük Ekibi Üyesi", roleEn: "Editorial Team Member" },
  ];

  for (const group of boardGroups) {
    for (const [listedName, affiliation] of group.people) {
      const canonicalName = withoutAcademicTitle(listedName);
      const id = authorId(canonicalName);
      const metadata = authorMetadata[canonicalName] || {};
      const appointment: BriqAppointment = {
        roleTr: canonicalName === "Fikret Akfırat" && group.tr === "Yayın Kurulu" ? "Genel Yayın Yönetmeni" : group.roleTr,
        roleEn: canonicalName === "Fikret Akfırat" && group.en === "Editorial Board" ? "Editor-in-Chief" : group.roleEn,
        termTr: metadata.appointmentTermTr || "2026–Günümüz",
        termEn: metadata.appointmentTermEn || "2026–Present",
      };
      const existing = profiles.get(id);
      if (existing) {
        existing.photo ||= profilePhotos[canonicalName];
        if (!existing.rolesTr.includes(group.tr)) existing.rolesTr.push(group.tr);
        if (!existing.rolesEn.includes(group.en)) existing.rolesEn.push(group.en);
        if (!existing.briqAppointments.some((item) => item.roleTr === appointment.roleTr)) existing.briqAppointments.push(appointment);
        if (existing.affiliationTr === "Bağımsız Araştırmacı") existing.affiliationTr = affiliation;
        if (existing.affiliationEn === "Independent Researcher") existing.affiliationEn = boardAffiliation(affiliation, "en");
        continue;
      }

      profiles.set(id, {
        id,
        name: listedName,
        affiliationTr: metadata.tr || affiliation,
        affiliationEn: metadata.en || boardAffiliation(affiliation, "en"),
        email: metadata.email,
        orcids: metadata.orcids || [],
        institutionUrl: metadata.institutionUrl,
        scholarUrl: `https://scholar.google.com/scholar?q=${encodeURIComponent(`"${canonicalName}"`)}`,
        photo: profilePhotos[canonicalName],
        rolesTr: [group.tr],
        rolesEn: [group.en],
        biographyTr: metadata.biographyTr || "",
        biographyEn: metadata.biographyEn || "",
        briqAppointments: [appointment],
        articles: [],
      });
    }
  }

  return [...profiles.values()]
    .map((profile) => ({
      ...profile,
      biographyTr: profile.biographyTr || (profile.briqAppointments.length
        ? `${profile.name}, BRIQ bünyesinde ${profile.briqAppointments.map((item) => item.roleTr).join(" · ")} olarak görev yapmaktadır. Kayıtlı güncel mesleki veya kurumsal bilgi: ${profile.affiliationTr}.`
        : `${profile.name}, BRIQ arşivinde ${profile.articles.length} ${profile.articles.length === 1 ? "çalışması" : "çalışması"} bulunan bir yazardır.${profile.affiliationTr !== "Bağımsız Araştırmacı" ? ` Kayıtlı güncel kurum bilgisi: ${profile.affiliationTr}.` : ""}`),
      biographyEn: profile.biographyEn || (profile.briqAppointments.length
        ? `${profile.name} serves BRIQ as ${profile.briqAppointments.map((item) => item.roleEn).join(" · ")}. Current professional or institutional information: ${profile.affiliationEn}.`
        : `${profile.name} is an author with ${profile.articles.length} ${profile.articles.length === 1 ? "work" : "works"} in the BRIQ archive.${profile.affiliationEn !== "Independent Researcher" ? ` Current institutional information: ${profile.affiliationEn}.` : ""}`),
      articles: profile.articles.sort(
        (a, b) => b.volume - a.volume || b.issue - a.issue || a.title_tr.localeCompare(b.title_tr, "tr"),
      ),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "tr"));
})();

export function findAuthorProfile(id: string) {
  return authorProfiles.find((profile) => profile.id === id);
}
