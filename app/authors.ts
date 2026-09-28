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

const genericBylines = new Set(["admin", "briq", "briqjournal", "Pekin Bildirgesi", "Beijing Declaration", "China Global Television Network, CGTN", "CGTN"]);

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
    biographyTr: "Jason Morgan (Japon tarihi doktoru) Japonya’nın Kashiwa kentindeki Reitaku Üniversitesi Küresel Çalışmalar Fakültesi’nde doçenttir. Kitapları arasında <em>Law and Society in Imperial Japan: Suehiro Izutaro and the Search for Equity</em> (Cambria, 2020), <em>Information Regimes during the Cold War in East Asia</em> (Ed.) (Routledge, 2020), <em>Japan in the 1960s: Ten Years of Turning Points</em> (ed. Robert Eldridge ile birlikte) (Routledge, 2024), <em>Comfort Women and Sex in the Battle Zone</em> (Hata Ikuhiko’nun Ianfu to senjō no sei adlı eserinin çevirisi) (Hamilton Books, 2018) ve <em>The Comfort Women Hoax</em> (J. Mark Ramseyer ile birlikte) (Encounter, 2024) bulunmaktadır. Morgan’ın makaleleri Histories, Kervan, Lo Sguardo, Dao, Strategic Analysis ve East Asian Journal of Philosophy dergilerinde yayımlanmıştır. Japonya ve Doğu Asya’nın hukuk, toplum ve siyaset tarihini araştırmaktadır.",
    biographyEn: "Jason Morgan (PhD, Japanese history) is an Associate Professor in the Faculty of Global Studies at Reitaku University in Kashiwa, Japan. His books include <em>Law and Society in Imperial Japan: Suehiro Izutaro and the Search for Equity</em> (Cambria, 2020), <em>Information Regimes during the Cold War in East Asia</em> (Ed.) (Routledge, 2020), <em>Japan in the 1960s: Ten Years of Turning Points</em> (Ed. with Robert Eldridge) (Routledge, 2024), <em>Comfort Women and Sex in the Battle Zone</em> (trans. of Hata Ikuhiko’s Ianfu to senjō no sei) (Hamilton Books, 2018), and <em>The Comfort Women Hoax</em> (with J. Mark Ramseyer) (Encounter, 2024). Morgan’s essays have appeared in Histories, Kervan, Lo Sguardo, Dao, Strategic Analysis, and East Asian Journal of Philosophy. He studies the legal, social, and political history of Japan and East Asia.",
  },
  "Zeynep Boz": {
    tr: "T.C. Kültür ve Turizm Bakanlığı Kaçakçılıkla Mücadele Dairesi Başkanı",
    en: "Head of the Anti-Smuggling Department, Ministry of Culture and Tourism of the Republic of Türkiye",
    institutionUrl: "https://kvmgm.ktb.gov.tr/TR-44454/kacakciligin-onlenmesi-ile-ilgili-faaliyetler.html",

    biographyTr: "Zeynep Boz, eğitimini arkeoloji alanında tamamlamış olup, 2020 yılından bu yana Türkiye Cumhuriyeti Kültür ve Turizm Bakanlığı Kaçakçılıkla Mücadele Dairesi Başkanlığı görevini yürütmektedir. Bakanlıktaki kariyerine 2007 yılında aynı birimde başlamış; 2014–2017 yılları arasında ise 1970 UNESCO Sözleşmesi Sekretaryası’nda görev yapmıştır. Uzmanlık alanları arasında kültür varlıklarının iadesi, ayrıca kaçakçılıkla mücadele alanında farkındalık artırma ve kapasite geliştirme çalışmaları yer almaktadır. Avrupa’daki kolluk kuvvetleri ve yargı mensupları başta olmak üzere ilgili paydaşlara yönelik olarak hazırlanan UNESCO “<em>Kültür Varlıklarının Yasadışı Ticaretiyle Mücadele Araç Seti</em>”nin de yazarıdır.",
    biographyEn: "Zeynep Boz is an archaeologist by training and has been heading the Department for Combatting Illicit Trafficking at the Ministry of Culture and Tourism of Türkiye since 2020. She began her career at the Ministry in 2007, working in the same department, and from 2014 to 2017 she served at the Secretariat of the 1970 UNESCO Convention. Her expertise includes return and restitution, as well as awareness-raising and capacity-building to strengthen efforts against illicit trafficking. She is also the author of the UNESCO <em>Toolkit on Fighting Illicit Trafficking of Cultural Property</em>, designed primarily for European law enforcement and the judiciary.",
  },
  "Nuray Ekşi": {
    tr: "Marmara Üniversitesi Hukuk Fakültesi (E)",
    en: "Faculty of Law, Marmara University (Emerita)",
    email: "nurayeksi@gmail.com",
    orcids: ["0000-0002-9713-777X"],
    institutionUrl: "https://hukuk.marmara.edu.tr/en",

    biographyTr: "Prof. Dr. Ekşi, Kültür Varlıklarına İlişkin Uyuşmazlıkların Çözüm Mekanizmaları Hakkında Türk ve Slovenya Hukuklarının Karşılaştırılması adlı TÜBİTAK uluslararası projesinin yürütücülüğünü yapmıştır. Kültür ve tabiat varlıklarının korunması alanında birçok ulusal ve uluslararası konferansta tebliğ sunmuş; yurt içinde ve yurt dışında çok sayıda kitabı ve makalesi yayımlanmıştır. Bu bağlamda 2024 yılında <em>Ulusal ve Uluslararası Hukukta Kültür Varlıklarına İlişkin Uyuşmazlıkların Çözüm Mekanizmaları</em> adlı kitabı Beta Yayınevi tarafından yayınlanmıştır. Baş editörü olduğu <em>Farklı Hukuk Disiplinleri Gözüyle Kültür Varlıkları</em> adlı kitap da aynı yıl ve aynı yayınevi tarafından basılmış olup ikinci bası süreci devam etmektedir. Editörlerinden biri olduğu <em>Law, Humanities and Tourism: Interdisciplinary Approaches to the Restitution of Cultural Heritage</em> adlı kitap Cambridge Scholar tarafından yayımlanmıştır. Ayrıca, baş editörü olduğu <em>Protecting Cultural Property Multiple Mechanisms for a Single Objective</em> adlı kitap Springer tarafından 2026 yılında; Private International Law as a Toolkit for Extraterritorial Refuge of Endangered Cultural Property başlıklı makalesi Santander Art and Culture Law Review’da yayımlanmıştır.",
    biographyEn: "Prof. Dr. Ekşi served as the principal investigator for the TÜBİTAK international project titled \"A Comparative Analysis of Turkish and Slovenian Laws on the Mechanisms for the Resolution of Disputes Concerning Cultural Property.” She has presented papers at numerous national and international conferences on the protection of cultural and natural property. Her book <em>Dispute Resolution Mechanisms Concerning Cultural Property in National and International Law</em> was published by Beta Publishing in 2024. She served as chief editor of <em>Cultural Property from the Perspective of Different Legal Disciplines</em>, published by Beta Publishing, with a second edition in progress. She is also among the editors of <em>Law, Humanities and Tourism: Interdisciplinary Approaches to the Restitution of Cultural Heritage</em>, published by Cambridge Scholars Publishing. Additionally, she is the chief editor of <em>Protecting Cultural Property: Multiple Mechanisms for a Single Objective</em>, published by Springer in 2026. Her article Private International Law as a Toolkit for Extraterritorial Refuge of Endangered Cultural Property appeared in the Santander Art and Culture Law Review.",
  },
  "Li Ning": {
    tr: "Zunyi Normal Üniversitesi, Tarih Bölümü, Çin",
    en: "Department of History, Zunyi Normal University, China",
    email: "Shuln188@126.com",
    orcids: ["0009-0005-5419-6998"],

    biographyTr: "Li Ning, Zunyi Normal Üniversitesi Tarih, Kültür ve Turizm Okulu Tarih Bölümü’nde Dr. Öğr. Üyesi ve Şanghay Üniversitesi Türkiye Araştırmaları Merkezi’nde yarı zamanlı araştırmacıdır. 2021 yılında Şanghay Üniversitesi Dünya Tarihi programında, bölgesel ve ulusal tarih ile kent kültür tarihi alanlarında uzmanlaşarak doktorasını tamamlamıştır. History Teaching ve World History Review gibi dergilerde çok sayıda makale yayımlamıştır. Hâlen “İstanbul’un Kentsel Nüfusu ve Gündelik Yaşamı (1856–1923)” başlıklı Ulusal Sosyal Bilimler Fonu projesini yürütmektedir.",
    biographyEn: "Li Ning is an Assistant Professor in the Department of History at the School of History, Culture, and Tourism, Zunyi Normal University, and an Adjunct Researcher at the Turkish Studies Center, Shanghai University. He received his Ph.D. in World History from Shanghai University in 2021, specializing in regional and national history and urban cultural history. He has published multiple papers in journals such as History Teaching and World History Review. Currently, he leads the National Social Science Fund project “Research on Istanbul’s Urban Population and Their Daily Life (1856–1923).”",
  },
  "Yang Xuyan": {
    tr: "Zunyi Normal Üniversitesi, Tarih Bölümü, Çin",
    en: "Department of History, Zunyi Normal University, China",
    email: "846543290@qq.com",
    orcids: ["0009-0001-7804-1772"],

    biographyTr: "Yang Xuyan, Zunyi Normal Üniversitesi Tarih, Kültür ve Turizm Okulu Tarih Bölümü’nde Dr. Öğr. Üyesi ve bu makalenin sorumlu yazarıdır. Araştırmaları Çin etnik gruplarının tarihi ve kültürel miras yönetimi üzerine yoğunlaşmaktadır. Temel akademik dergilerde çok sayıda makale yayımlamış; hazırladığı çeşitli araştırma raporları eyalet ve bakanlık düzeyindeki yöneticiler tarafından onaylanıp benimsenmiştir.",
    biographyEn: "Yang Xuyan is an Assistant Professor in the Department of History at the School of History, Culture, and Tourism, Zunyi Normal University, and the corresponding author of this paper. His research focuses on the history of China’s ethnic groups and cultural heritage management. He has published numerous academic papers in core journals, and several of his research reports have received approvals and been adopted by provincial and ministerial-level leaders.",
  },
  "Mehmet Celal Özdoğan": {
    tr: "İstanbul Üniversitesi Prehistorya Anabilim Dalı (E)",
    en: "Department of Prehistory, Istanbul University (Emeritus)",
    institutionUrl: "https://tanitimedebiyat.istanbul.edu.tr/en/content/archaeology/prehistory",

    biographyTr: "30 Mayıs 1943’te İstanbul’da doğdu. Ortaöğrenimini İngiliz Erkek Lisesi ve ardından Robert Kolej’de 1963 yılında tamamladı ve İstanbul Üniversitesi Edebiyat Fakültesi Prehistorya Kürsüsü’nde yükseköğrenimine başladı. 1970 yılında İstanbul Üniversitesi’nde “fahri asistan” olarak çalışmaya başladı ve bütün akademik yaşamını İstanbul Üniversitesi’nde geçirdi. 1994 yılında profesörlüğe yükselen Özdoğan, 2000 yılında Prehistorya Anabilim Dalı başkanlığını üstlendi, 2010 yılında da emekli oldu. Özdoğan, Türkiye Bilimler Akademisi (TÜBA) asli üyesi (2002-2011), Bilim Akademisi (2011), Amerika Birleşik Devletleri Bilim Akademisi (NAS) yabancı asli üyesi (2005), Amerika Arkeoloji Enstitüsü (AIA), Alman Arkeoloji Enstitüleri (DAI) üyesidir.",
    biographyEn: "He was born in Istanbul on May 30, 1943. He completed his secondary education at the English Boys’ High School and then at Robert College in 1963, and began his higher education at the Department of Prehistory in the Faculty of Letters at Istanbul University. In 1970, he began working as an “honorary assistant” at Istanbul University and spent his entire academic career there. Özdoğan was promoted to professor in 1994, assumed the chairmanship of the Department of Prehistory in 2000, and retired in 2010. Özdoğan is a full member of the Turkish Academy of Sciences (TÜBA) (2002 - 2011), a member of the Academy of Sciences (2011), a foreign full member of the National Academy of Sciences (NAS) of the United States (2005), and a member of the American Institute of Archaeology (AIA) and the German Archaeological Institute (DAI).",
  },
  "Pavel Zarifullin": {
    tr: "Lev Gumilev Moskova Merkezi Direktörü",
    en: "Director, Lev Gumilev Moscow Centre",
    institutionUrl: "https://af.gumilev-center.ru/en/about",

    biographyTr: "Pavel Vyacheslavovich Zarifullin, 1977 yılında Kazan’da doğdu. Eğitimini hukuk ve tarih alanında tamamladı. Yıllar boyunca Kosova, Güney Osetya (savaş sırasında), Transdinyester, Kırım (yarımadanın yeniden birleşmesi sırasında), Afganistan ve Ukrayna’da Avrasya insani yardım misyonlarına liderlik etti. 2010 yılından beri Lev Gumilev Moskova Merkezi Direktörü olan Zarifullin, “Yeni İskitler” Uluslararası Hareketini kurdu. Kutsal coğrafya uzmanı olan Zarifullin, İç Avrasya’daki kutsal “güç merkezlerine” (Yakutistan, Moğolistan, Tuva, Pakistan, Afganistan, İran, Tacikistan, Kafkaslar, Rusya’nın kuzeyi, Sibirya ve Uzak Doğu) pek çok gezi düzenledi. Avrasyacılık ve İskitçilik teorisyeni olan Zarifullin, hem Rus hem de uluslararası medyada yayınlanan birçok kitap ve makalenin yazarıdır. Rusya’nın yurt dışındaki çıkarlarını desteklemesi nedeniyle 2. derece “Vatana Hizmet Nişanı” ile ödüllendirildi. Ayrıca Afganistan, Kazakistan, Azerbaycan ve Saha (Yakutistan) Cumhuriyeti’nin nişan, madalya ve rozetlerine de değer görüldü.",
    biographyEn: "Pavel Vyacheslavovich Zarifullin was born in 1977 in Kazan. He is a lawyer and historian by education. Over the years, he led Eurasian humanitarian missions in Kosovo, South Ossetia (during the war), Transnistria, Crimea (during the peninsula’s reunification), Afghanistan, and Ukraine. Zarifullin, who has been Director of the Lev Gumilev Moscow Center since 2010, founded the International Movement “New Scythians.” He is a specialist in sacred geography; he has led dozens of expeditions to sacred “places of power” in Inner Eurasia: Yakutia, Mongolia, Tuva, Pakistan, Afghanistan, Iran, Tajikistan, the Caucasus, the Russian North, Siberia, and the Far East. Zarifullin, as a theorist of Eurasianism and Scythianism, is an author of many books and essays published in both Russian and international media. He was awarded the Medal of the Order “For Merit to the Fatherland,” 2nd Class, for promoting Russia’s interests abroad, and he was also awarded orders, medals, and commemorative badges of Afghanistan, Kazakhstan, Azerbaijan, and the Republic of Sakha (Yakutia).",
  },
  "Wang Jiani": {
    tr: "Şanghay Üniversitesi Tarih Bölümü, Çin",
    en: "Department of History, Shanghai University, China",
    email: "jiani88254@hotmail.com",
    orcids: ["0009-0000-0543-3719"],

    biographyTr: "Wang Jiani, Şanghay Üniversitesi Tarih Bölümü’nde Dr. Öğr. Üyesi ve Türk Araştırmaları Merkezi’nde araştırmacıdır. Siyasal Bilimler ve Uluslararası İlişkiler doktorasını 2017 yılında Şanghay Uluslararası Çalışmalar Üniversitesi’nde tamamlamıştır. 2017-2019 yılları arasında Fudan Üniversitesi’nde doktora sonrası araştırmacı olarak görev yapmıştır. 2015 ve 2016 yıllarında Duke Üniversitesi’nde misafir araştırmacı, 2012-2013 yıllarında ise Tel Aviv Üniversitesi’nde değişim araştırmacısı olmuştur. Araştırmaları Türkiye çalışmaları, din ve uluslararası ilişkiler alanlarına odaklanmaktadır. Çeşitli dergilerde bir kitap ve çok sayıda akademik makalesi yayımlanmıştır.",
    biographyEn: "Wang Jiani is an Assistant Professor in the Department of History at Shanghai University and a researcher at the Center for Turkish Studies. She earned her Ph.D. in Political Science and International Relations from Shanghai International Studies University in 2017. From 2017 to 2019, she was a postdoctoral fellow at Fudan University. She was a visiting scholar at Duke University in 2015 and 2016, and an exchange fellow at Tel Aviv University from 2012 to 2013. Her research focuses on Turkish Studies, religion, and International Relations. She has published a book and several academic articles in various journals.",
  },
  "Bilguunzaya Luvsandandar": {
    tr: "Şanghay Üniversitesi Liberal Sanatlar Fakültesi, Çin",
    en: "College of Liberal Arts, Shanghai University, China",
    email: "bilguunzaya.luvsandandar@gmail.com",
    orcids: ["0009-0005-8843-6013"],

    biographyTr: "Bilguunzaya Luvsandandar, hâlen Şanghay Üniversitesi Liberal Sanatlar Fakültesi’nde siyaset bilimi yüksek lisansını sürdürmekte ve aynı zamanda Küresel Çalışmalar Enstitüsü’nde araştırma asistanı olarak çalışmaktadır. Ana dili Moğolcadır; çalışma alanı Moğolistan siyaseti ve dış politikasıdır.",
    biographyEn: "Bilguunzaya Luvsandandar is currently pursuing a master’s degree in political science at the College of Liberal Arts while also working as a research assistant at the Institute of Global Studies at Shanghai University. He is a native Mongolian speaker, and his field of study includes Mongolian politics and foreign policy.",
  },
  "Nora Maher": {
    tr: "Kahire Mayıs Üniversitesi Siyaset Bilimi Bölümü, Mısır",
    en: "Department of Political Science, May University in Cairo, Egypt",
    email: "nora-maher@hotmail.com",
    orcids: ["0000-0002-9858-8548"],

    biographyTr: "Nora Maher, Kahire May Üniversitesi'nde Siyaset Bilimi Bölüm Başkanıdır. Kahire Üniversitesi'nden Siyaset Bilimi ve Uluslararası İlişkiler alanında doktora derecesine sahiptir. Dr. Maher, Uluslararası İlişkiler ve Stratejik Çalışmalar alanında uzmanlaşmıştır ve özellikle Ortadoğu siyaseti, Arap-İsrail di- namikleri, güvenlik çalışmaları, dış politika, göç ve sosyal hareketler üzerine yoğunlaşmaktadır. Contemporary Arab Affairs, Policy Perspectives, Review of Economics and Political Science ve Asian Perspectives gibi birçok hakemli dergide makaleleri yayınlanan Dr. Maher, İsrail dış politikası üzerine iki kitap yazmıştır. Dr. Maher, Mısır’daki British University, Kahire’deki American University ve Université Française d’Égypte gibi kurumlarda ders vermiş, birçok uluslararası dergi için hakemlik yapmıştır.",
    biographyEn: "Nora Maher is an Associate Professor of Political Science and Head of the Department of Political Science at May University in Cairo. She holds a Ph.D. in Political Science and International Relations from Cairo University. Dr. Maher specializes in International Relations and Strategic Studies, with a particular focus on Middle East politics, Arab–Israeli dynamics, security studies, foreign policy, migration, and social movements. She has published in several peer-reviewed journals, including Contemporary Arab Affairs, Policy Perspectives, Review of Economics and Political Science, and Asian Perspectives. She is the author of two books on Israeli foreign policy. Dr. Maher has taught at institutions including the British University in Egypt, the American University in Cairo, and Université Française d’Égypte, and serves as a reviewer for multiple international journals.",
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
    biographyTr: "Salman K. Al-Dhafeeire, Çin’in Şanghay kentindeki Fudan Üniversitesi Uluslararası İlişkiler ve Kamu İşleri Fakültesinde Uluslararası Politika alanında doktora adayıdır. Araştırmaları, özellikle Suudi Arabistan, Körfez İşbirliği Konseyi (KİK) ülkeleri ve daha geniş jeopolitik dinamikler üzerinde durarak Çin ile Ortadoğu arasındaki siyasi ilişkilere odaklanmaktadır. Japonya’daki Kyushu Üniversitesi’nden hukuk yüksek lisans derecesi almış; burada Japonya’nın siber güvenlik stratejilerini ve bunların uluslararası ilişkilere etkilerini araştırmıştır. ABD’deki Toledo Üniversitesi’nden Siyaset Bilimi ve Elektrik Mühendisliği alanlarında iki lisans derecesine sahiptir. Hâlen Suudi Arabistan’daki King Saud Üniversitesi Hukuk ve Siyaset Bilimi Bölümünde öğretim asistanı olarak çalışmaktadır. Fudan Üniversitesi’nde Ortadoğu yönetişimi ve güvenlik işbirliği üzerine düzenlenen uluslararası konferanslarda sunumlar yapmıştır.",
    biographyEn: "Salman K. Al-Dhafeeire is a Ph.D. candidate in International Politics at the School of International Relations and Public Affairs, Fudan University, Shanghai, China. His research focuses on political relations between China and the Middle East, with particular emphasis on Saudi Arabia, the GCC countries, and broader geopolitical dynamics. He holds a Master of Laws from Kyushu University, Japan, where he researched Japan’s cybersecurity strategies and their implications for international relations. He holds dual Bachelor’s degrees in Political Science and Electrical Engineering from the University of Toledo in the USA. He currently serves as a Teaching Assistant in the Department of Law and Political Science at King Saud University, Saudi Arabia. He has presented at international conferences on Middle East governance and security cooperation at Fudan University.",
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
    biographyTr: "Prof. Dr. Hasret Çomak; uluslararası kurumlar, uluslararası güvenlik ve uluslararası hukuk alanlarında uzmanlığa sahiptir. Lisans eğitimini sırasıyla Kara Harp Okulu (1976), İstanbul Üniversitesi İktisat Fakültesi Maliye Bölümü (1982), Siyasal Bilgiler Bölümü (1982) ve Hukuk Fakültesi’nde (1988) tamamlamıştır. 1984 yılında İstanbul Üniversitesi Sosyal Bilimler Enstitüsü Uluslararası İlişkiler Anabilim Dalı bünyesinde yüksek lisans derecesini almıştır. Doktora eğitimini de yine aynı enstitü bünyesinde yürüterek 1987 yılında İktisat, 1990 yılında ise Siyaset Bilimi ve Kamu Yönetimi anabilim dallarında iki ayrı doktora unvanını almaya hak kazanmıştır. Diğer temel uzmanlık alanları arasında jeopolitik, jeostrateji, jeoekonomi, deniz hukuku, insan hakları hukuku ile uluslararası insancıl hukuk da yer almaktadır. Son beş yayını arasında <em>Afrika Politikası</em>, <em>Karadeniz Jeopolitiği</em>, ikişer ciltlik <em>Akdeniz Jeopolitiği</em> ile <em>Ege Jeopolitiği</em> ve altı ciltlik <em>Refugee Crises in International Policy</em> eserleri bulunmaktadır. Günümüzde İstanbul Kent Üniversitesi bünyesinde İktisadi, İdari ve Sosyal Bilimler Fakültesi Dekanı olarak görev yapmaktadır.",
    biographyEn: "Hasret Çomak is Professor of International Relations and Dean of the Faculty of Economics, Administrative and Social Sciences at Istanbul Kent University, Türkiye. His areas of expertise include international organizations, international security, and international law, as well as geopolitics, geostrategy, geoeconomics, the law of the sea, human rights law, and international humanitarian law. He graduated from the Turkish Military Academy (1976) and subsequently earned degrees in Public Finance (1982), Political Science (1982), and Law (1988) from Istanbul University. He received his M.A. in International Relations from the Institute of Social Sciences at Istanbul University in 1984. He later completed two Ph.D. degrees at the same institute, earning doctorates in Economics (1987) and Political Science and Public Administration (1990). Among his most recent publications are <em>African Policy</em>, <em>The Geopolitics of the Black Sea</em>, the two-volume <em>The Geopolitics of the Mediterranean</em>, the two-volume <em>The Geopolitics of the Aegean</em>, and the six-volume <em>Refugee Crises in International Policy</em>.",
  },
  "Ege Furkan Toker": {
    tr: "İstanbul Kent Üniversitesi, Uluslararası İlişkiler Bölümü, Türkiye",
    en: "Department of International Relations, Istanbul Kent University, Türkiye",
    email: "egefurkan.toker@kent.edu.tr",
    orcids: ["0000-0002-4879-1687"],
    institutionUrl: "https://www.kent.edu.tr/",
    biographyTr: "Ege Furkan Toker, 2021 yılında Bilkent Üniversitesi Uluslararası İlişkiler Bölümü’nden mezun olmuştur. 2022 yılında Aberdeen Üniversitesi’nde Uluslararası Hukuk, Güvenlik ve Stratejik Araştırmalar alanında yüksek lisans eğitimini tamamlamıştır. 2024 yılında Galatasaray Üniversitesi’nde Uluslararası İlişkiler doktorasına başlamıştır. Aynı yıl İstanbul Kent Üniversitesi Uluslararası İlişkiler Bölümü’nde Araştırma Görevlisi olarak çalışmaya başlamıştır. Akademik kariyerini bu kurumda sürdürmektedir.",
    biographyEn: "Ege Furkan Toker graduated from the Department of International Relations at Bilkent University in 2021. He received his M.A. in International Law, Security and Strategic Studies from the University of Aberdeen in 2022. In 2024, he began his Ph.D. studies in International Relations at Galatasaray University. In the same year, he joined the Department of International Relations at Istanbul Kent University as a Research Assistant, where he continues his academic career.",
  },
  "Oğuzhan Manioğlu": {
    tr: "İstanbul Kent Üniversitesi, Siyaset Bilimi ve Kamu Yönetimi Bölümü, Türkiye",
    en: "Department of Political Science and Public Administration, Istanbul Kent University, Türkiye",
    email: "oguzhan.manioglu@kent.edu.tr",
    orcids: ["0000-0001-9475-2307"],
    institutionUrl: "https://www.kent.edu.tr/",
    biographyTr: "Dr. Oğuzhan Manioğlu, İstanbul Kent Üniversitesi İktisadi, İdari ve Sosyal Bilimler Fakültesi Siyaset Bilimi ve Kamu Yönetimi Bölümünde araştırma görevlisi olarak görev yapmaktadır. Doktora eğitimini İstanbul Üniversitesi’nde tamamlamış; “Küreselleşme ile Gelişen Paradiplomasi Kavramı ve Marka Kent İlişkisi Üzerine Türkiye Açısından Bir İnceleme” başlıklı teziyle Bilim Doktoru unvanını almıştır. Akademik çalışmaları; uluslararası ilişkiler, paradiplomasi, yerel yönetimlerin uluslararasılaşması, marka kent, kamu yönetimi, çok düzeyli yönetişim, dijital ve siber diplomasi, jeoekonomi ile küresel siyaset üzerine yoğunlaşmaktadır. Bu alanlarda, ulusal ve uluslararası hakemli dergilerde yayımlanmış makaleleri ile kitap bölümleri bulunmaktadır. Disiplinlerarası bir yaklaşımla özellikle kentlerin küresel aktör olarak yükselişi, dijital dönüşüm, küresel yönetişim ve uluslararası siyasal ekonomi konularına odaklanarak, teori ile uygulamayı birleştirip literatüre katkı sunmayı amaçlamaktadır.",
    biographyEn: "Oğuzhan Manioğlu is a Research Assistant in the Department of Political Science and Public Administration at the Faculty of Economics, Administrative and Social Sciences, Istanbul Kent University, Türkiye. He received his Ph.D. from Istanbul University with a dissertation titled “An Analysis of the Relationship Between the Concept of Paradiplomacy Developed Through Globalization and City Branding from the Perspective of Türkiye.” His research focuses on international relations, paradiplomacy, the internationalization of local governments, city branding, public administration, multilevel governance, digital and cyber diplomacy, geoeconomics, and global politics. He has published articles in national and international peer-reviewed journals and contributed book chapters in these fields. His research adopts an interdisciplinary approach, with particular emphasis on the rise of cities as global actors, digital transformation, global governance, and international political economy, aiming to bridge theory and practice while contributing to the academic literature.",
  },
  "Li Sainan": {
    tr: "Kuzeybatı Politeknik Üniversitesi, Yabancı Diller Fakültesi, Xian, Çin",
    en: "School of Foreign Studies, Northwestern Polytechnical University, Xi’an, China",
    email: "saiyida206@163.com",
    orcids: ["0009-0007-8171-3289"],
    institutionUrl: "https://en.nwpu.edu.cn/",
    biographyTr: "Li Sainan, Kuzeybatı Politeknik Üniversitesi Yabancı Diller Fakültesinde İngilizce çeviri alanında yüksek lisans öğrencisidir. Bir akademik makalesi yayımlanmıştır. Araştırma alanları Ortadoğu bölge çalışmalarını kapsamaktadır.",
    biographyEn: "Li Sainan is a master’s student majoring in English Translation at the School of Foreign Studies, Northwestern Polytechnical University. She has published one academic paper. Her research interests include Middle Eastern area studies.",
  },
  "Li Xi": {
    tr: "Kuzeybatı Politeknik Üniversitesi, Ürdün Araştırmaları Merkezi, Xian, Çin",
    en: "Jordan Research Center, Northwestern Polytechnical University, Xi’an, China",
    email: "lixi7021@163.com",
    orcids: ["0009-0006-3256-1197"],
    institutionUrl: "https://en.nwpu.edu.cn/",
    biographyTr: "Li Xi, Dünya Tarihi alanında doktora derecesine sahiptir ve Kuzeybatı Politeknik Üniversitesi Yabancı Diller Fakültesi’nde profesör ve doktora danışmanı olarak görev yapmaktadır. Ürdün Araştırmaları Merkezi Müdürü, BRIQ dergisinin Danışma Kurulu üyesi, Çin Asya ve Afrika Araştırmaları Derneği ile Çin Ortadoğu Araştırmaları Derneği konsey üyesidir. Araştırmaları Ortadoğu bölge çalışmalarına odaklanmaktadır. Libya’da (2007–2008), Ürdün’de (2015) ve İsrail’de (2015–2016, CSC ortak doktora öğrencisi olarak) araştırma ve inceleme ziyaretlerinde bulunmuştur. Ulusal Sosyal Bilimler Fonu ve Eğitim Bakanlığı tarafından desteklenen üç projeyi, beş eyalet düzeyinde projeyi ve iki Xi’an yerel hükümet projesini yürütmüştür. Ulusal Sosyal Bilimler Fonu’nun dört büyük projesinde yer almıştır. Bir monografinin yazarıdır ve Studies in World Religions, World Religious Cultures, Arab World Studies ve Ningxia Social Sciences gibi dergilerde otuz akademik makale yayımlamıştır. Kaleme aldığı on altı politika danışmanlığı raporu eyalet ve bakanlık düzeyindeki kamu kurumları tarafından benimsenmiştir.",
    biographyEn: "Li Xi holds a Ph.D. in World History and is a Professor and Doctoral Supervisor at the School of Foreign Studies, Northwestern Polytechnical University. She serves as Director of the Center of Jordanian Studies, Academic Advisor to the academic journal Belt & Road Initiative Quarterly, and a member of the Council of the Chinese Society of Asian and African Studies and the Chinese Society for Middle East Studies. Her research focuses on Middle Eastern area studies. She has conducted research and study visits in Libya (2007–2008), Jordan (2015), and Israel (2015–2016 as a CSC joint Ph.D. student). She has led three projects funded by the National Social Science Fund and the Ministry of Education, five provincial projects, and two Xi‘an municipal projects. She has participated in four major National Social Science Fund projects. She is the author of one monograph and has published thirty academic articles in journals such as Studies in World Religions, World Religious Cultures, Arab World Studies, and Ningxia Social Sciences. Provincial and ministerial government agencies have adopted sixteen policy consultation reports she authored.",
  },
  "Iqbal Akhtar": {
    tr: "Florida Uluslararası Üniversitesi, Steven J. Green Uluslararası ve Kamusal İlişkiler Okulu, ABD",
    en: "Steven J. Green School of International and Public Affairs, Florida International University, USA",
    email: "iakhtar@fiu.edu",
    orcids: ["0000-0001-6840-8377"],
    institutionUrl: "https://sipa.fiu.edu/",
    biographyTr: "Iqbal Akhtar, Florida Uluslararası Üniversitesi Steven J. Green Uluslararası ve Kamusal İlişkiler Okulu’nda Din Araştırmaları ile Siyaset ve Uluslararası İlişkiler alanlarında doçenttir; aynı kurumda Batı Hint Okyanusu Araştırmaları Programı’nın kurucu direktörlüğünü yürütmektedir. Edinburgh Üniversitesi’nden (New College, İlahiyat Fakültesi) doktora derecesine sahiptir ve Tanzanya ile Pakistan’da saha çalışmaları yürütmüş iki kez Fulbright bursiyeridir. İlk monografisi, <em>The Khōjā of Tanzania: Discontinuities of a Postcolonial Religious Identity</em> (Brill, 2016), Batı Hint Okyanusu’ndaki sömürge sonrası dinî kimliği inceler. En son kitabı <em>Covenantal Pluralism: The Geopolitics of Interfaith Religious Freedom</em> (Springer, 2026), İbrani brit’i, Medine mīthāq’ı ve Caynacı anekāntavāda’yı sentezleyen karşılaştırmalı bir çerçeve geliştirir. Arapça, Svahili, Guceratça, Urduca, Farsça ve Sanskritçe dillerinde çalışmaktadır.",
    biographyEn: "Iqbal Akhtar is Associate Professor of Religious Studies and Politics & International Relations at Florida International University’s Steven J. Green School of International & Public Affairs, where he serves as Founding Director of the Western Indian Ocean Studies Program. He holds a PhD from the University of Edinburgh (New College, School of Divinity) and is a two-time Fulbright Scholar, with fieldwork in Tanzania and Pakistan. His first monograph, <em>The Khōjā of Tanzania: Discontinuities of a Postcolonial Religious Identity</em> (Brill, 2016), examines postcolonial religious identity in the Western Indian Ocean. His most recent book, <em>Covenantal Pluralism: The Geopolitics of Interfaith Religious Freedom</em> (Springer, 2026), develops a comparative framework synthesizing the Hebrew brit, the Medinan mīthāq, and Jain anekāntavāda. He works across Arabic, Swahili, Gujarati, Urdu, Persian, and Sanskrit.",
  },
  "Can Ulusoy": {
    tr: "Kapadokya Üniversitesi, İktisadi, İdari ve Sosyal Bilimler Fakültesi, Siyaset Bilimi ve Uluslararası İlişkiler Bölümü, Türkiye",
    en: "Faculty of Economics, Administrative and Social Sciences, Department of Political Science and International Relations, Cappadocia University, Türkiye",
    email: "can.ulusoy@kapadokya.edu.tr",
    orcids: ["0000-0002-4465-3201"],
    institutionUrl: "https://kapadokya.edu.tr/",
    biographyTr: "1983’te Bursa’da doğdu. 2015’te “Taşra’da Kent ve Aydın: Bursa Örneği (1930-1950)” başlıklı çalışmasıyla, Galatasaray Üniversitesi Siyaset Bilimi Bölümü’nden doktora derecesi aldı. Kent tarihi, Türk siyasal kültürü ve tasavvuf tarihi gibi konularda çeşitli makaleler ve sunumlar yaptı. Ayrıca Çin’in siyasal, kültürel ve inanç tarihini, Türkiye ve İran ile mukayeseli bir biçimde tartışan yazılar yazdı. Kapadokya Üniversitesi’nde Siyaset Bilimi ve Uluslararası İlişkiler Bölümü’nde Dr. Öğretim Üyesi olarak görev yapmaktadır. Ayrıca danışmanlığını yaptığı Bursa Mevlevihanesi’nde Mesnevi şerhi, Osmanlı Türkçesi matbu ve el yazmaları okuma dersleri vermektedir.",
    biographyEn: "He was born in Bursa in 1983. In 2015, he obtained his PhD from Galatasaray University, Department of Political Science, with his dissertation titled “City and Intellectual in the Province: Bursa Example (1930- 1950).” He has authored numerous publications and presentations on urban history, Turkish political culture, and the history of Sufism. He has written studies analyzing China’s political, cultural, and religious histories as they relate to Turkey and Iran. He is an assistant professor in the Department of Political Science and International Relations at Cappadocia University. He instructs on Masnavi commentary and the interpretation of written and manuscript Ottoman Turkish at the Bursa Mevlevi Lodge, where he serves as an advisor.",
  },
  "Sanoop Sajan Koshy": {
    tr: "Hindistan Teknoloji Enstitüsü Madras, Hindistan",
    en: "Indian Institute of Technology Madras, India",
    email: "sanoopsajan@gmail.com",
    orcids: ["0000-0002-9000-4456"],
    institutionUrl: "https://www.iitm.ac.in/",
    biographyTr: "Sanoop Sajan Koshy, Hindistan Teknoloji Enstitüsü Madras’ta Uluslararası İlişkiler alanında doktora adayıdır. Doktora araştırması, Çin’in çevre diplomasisine ve Güney Asya’daki Kuşak ve Yol Girişimi’ne (KYG) odaklanmaktadır. Çin Hükümeti Bursu’nu (2024-2025) kazanmış ve Pekin Normal Üniversitesi’nde değişim araştırmacısı olarak bulunmuştur. Daha önce Tsinghua Üniversitesi Kuşak ve Yol Girişimi Öğrenci Derneği’nin (SABRI) Proje ve Araştırma Bölümünün ana kadrosunda görev yapmıştır.",
    biographyEn: "Sanoop Sajan Koshy is a PhD candidate in International Relations at the Indian Institute of Technology Madras. His doctoral research focuses on China’s periphery diplomacy and the Belt and Road Initiative (BRI) in South Asia. He was the recipient of a Chinese Government Scholarship (2024-25) and was an exchange scholar at Beijing Normal University. He previously served as a core member of the Project and Research Department at the Student Association of the Belt and Road Initiative (SABRI), Tsinghua University.",
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
  "Pınar Gökçin Özuyar": {
    tr: "İstinye Üniversitesi, İktisadi, İdari ve Sosyal Bilimler Fakültesi, İşletme Bölümü",
    en: "Department of Business Administration, Faculty of Economics and Administrative Sciences, Istinye University",
    email: "pinar.ozuyar@istinye.edu.tr",
    orcids: ["0000-0002-2505-2216"],
    biographyTr: "Dr. Öğr. Üyesi Pınar Gökçin Özuyar, lisans derecesini Boğaziçi Üniversitesi Çevre Mühendisliği Bölümü'nden, yüksek lisans ve doktora derecelerini Boğaziçi Üniversitesi Çevre Bilimleri Enstitüsü'nden almıştır. RWTH Aachen Üniversitesi ve Thyssen Mühendislik bursuyla Almanya'da doktora araştırmalarını yürütmüştür. İstinye Üniversitesi İşletme Bölümü'nde öğretim üyesidir ve Sürdürülebilirlik Araştırma ve Uygulama Merkezi Müdürlüğü görevini yürütmektedir.",
    biographyEn: "Asst. Prof. Dr. Pınar Gökçin Özuyar earned her BS in Environmental Engineering and MS and PhD degrees from the Institute of Environmental Sciences at Boğaziçi University. She conducted doctoral research in Germany with a joint fellowship from RWTH Aachen University and Thyssen Engineering. She is a faculty member in Business Administration and Director of the Sustainability Research Center at Istinye University.",
  },
  "Esra Bayhantopçu": {
    tr: "İstinye Üniversitesi, Halkla İlişkiler ve Reklamcılık Bölümü",
    en: "Department of Public Relations and Advertising, Istinye University",
    email: "esra.bayhantopcu@istinye.edu.tr",
    orcids: ["0000-0001-6680-8414"],
    biographyTr: "Dr. Öğr. Üyesi Esra Bayhantopçu, Paris 1 Panthéon-Sorbonne Üniversitesi (Siyaset Bilimi) ve Galatasaray Üniversitesi'nden (Medya ve İletişim Çalışmaları) ortak doktora derecesi almıştır (2017). Sürdürülebilirlik, medya, toplumsal cinsiyet ve çocuk hakları alanlarında uzmanlaşmıştır. 2018'den bu yana İstinye Üniversitesi Halkla İlişkiler ve Reklamcılık Bölümü'nde öğretim üyesidir.",
    biographyEn: "Asst. Prof. Dr. Esra Bayhantopçu completed a joint doctoral program at Paris 1 Panthéon-Sorbonne University (Political Science) and Galatasaray University (Media and Communication Studies) in 2017. Specializing in sustainability, media, gender, and children's rights, she has taught in Public Relations and Advertising at Istinye University since 2018.",
  },
  "Salih Ertan": {
    tr: "Türk-Çin İş Derneği Ege Bölgesi Temsilcisi, Elektrik Mühendisi",
    en: "Aegean Region Representative of the Turkish-Chinese Business Association, Electrical Engineer",
    email: "salihertan@qq.com",
    biographyTr: "Salih Ertan, ODTÜ Elektrik Mühendisliği Bölümü'nden mezun olmuştur. Yenilenebilir enerji kaynakları ve hidroelektrik santralleri üzerine uzmanlaşmıştır. Türk-Çin İş Derneği Ege Bölgesi Temsilcisi olarak görev yapmaktadır.",
    biographyEn: "Salih Ertan graduated from the Department of Electrical Engineering at Middle East Technical University. He specializes in renewable energy resources and hydroelectric power plants and serves as the Aegean Region Representative of the Turkish-Chinese Business Association.",
  },
  "Ye Zhangxu": {
    tr: "Şanghay Üniversitesi, Sosyal Bilimler Fakültesi Tarih Bölümü",
    en: "Department of History, College of Liberal Arts, Shanghai University",
    email: "yezx207@163.com",
    biographyTr: "Ye Zhangxu, Şanghay Üniversitesi Sosyal Bilimler Fakültesi Dünya Tarihi Bölümü'nde yüksek lisans araştırmacısı ve Türkiye Araştırmaları Merkezi'nde araştırma görevlisidir. Çağdaş dönem Türk dış politikası ve Türk-Çin ilişkileri üzerine çalışmaktadır.",
    biographyEn: "Ye Zhangxu is a master's candidate in World History at the College of Liberal Arts and a research assistant at the Center for Turkish Studies, Shanghai University. His research focuses on contemporary Turkish foreign policy and Sino-Turkish relations.",
  },
  "Sadık Üçok": {
    tr: "Fotoğraf Sanatçısı ve Karikatürist",
    en: "Photographer and Cartoonist",
    biographyTr: "Sadık Üçok, 1980'de Çarşaf mizah dergisinde karikatüristliğe başlamış; Gırgır ve Fırt dergilerinde çizmiştir. 1992'den bu yana profesyonel fotoğrafçılık yapmakta olup 2013'te Sami Güner Kupası'nı kazanmıştır.",
    biographyEn: "Sadık Üçok began his cartooning career at Çarşaf humor magazine in 1980, also drawing for Gırgır and Fırt. He has been a professional photographer since 1992 and won the prestigious Sami Güner Cup in 2013.",
  },
  "Ekrem Kahraman": {
    tr: "Ressam ve Yazar",
    en: "Painter and Writer",
    biographyTr: "Ekrem Kahraman, yurt içi ve yurt dışında 100'ün üzerinde kişisel sergi açmış usta bir ressamdır. 2016'da UPSD tarafından 'Yılın Onur Sanatçısı' seçilmiştir. Plastik sanatlar kuramı üzerine çok sayıda yazı ve kitap yayımlamıştır.",
    biographyEn: "Ekrem Kahraman has held over 100 solo exhibitions in Turkey and internationally. Named 'Artist of the Year' by UPSD in 2016, he has published extensive theoretical writings and books on contemporary plastic arts.",
  },
  "Aşkın Ayrancıoğlu": {
    tr: "Karikatürist ve Görsel Sanatlar Eğitmeni",
    en: "Cartoonist and Visual Arts Educator",
    biographyTr: "Aşkın Ayrancıoğlu, Ondokuz Mayıs Üniversitesi Resim Bölümü mezunudur. Ulusal ve uluslararası karikatür yarışmalarında jüri üyeliği yapmış ve Çin'de 'En İyi Mizah Sanatçısı' ödülünü kazanmıştır.",
    biographyEn: "Aşkın Ayrancıoğlu graduated from the Department of Painting at Ondokuz Mayıs University. He has served on international cartoon juries and won the 'Best Humor Artist Award' in China in 2017.",
  },
  "Latif Bolat": {
    tr: "Müzisyen, Besteci ve Türk Müziği Araştırmacısı",
    en: "Musician, Composer and Scholar of Turkish Music",
    email: "lbolat@aol.com",
    orcids: ["0000-0003-3609-5614"],
    biographyTr: "Latif Bolat, Ankara Üniversitesi Hukuk Fakültesi ve Gazi Üniversitesi Müzik Eğitimi Bölümü mezunudur. San Francisco Eyalet Üniversitesi'nde işletme yüksek lisansı (MBA) yapmıştır. Türk tasavvuf müziği ve felsefesi üzerine dünya çapında konserler ve seminerler vermiştir. 'Quarreling with God: Mystic Poetry from Turkey' kitabının eşyazarıdır ve dünya genelinde yayımlanmış 5 albümü bulunmaktadır.",
    biographyEn: "Latif Bolat graduated from Ankara University Law School and Gazi University Music Department. He completed an MBA at San Francisco State University. He has presented Turkish mystic Sufi music and philosophy worldwide through lectures and concerts. He co-authored 'Quarreling with God: Mystic Poetry from Turkey' and has released five albums distributed internationally.",
  },
  "Giampiero Bellingeri": {
    tr: "Venedik Ca' Foscari Üniversitesi (Emekli Profesör)",
    en: "Ca' Foscari University of Venice (Professor Emeritus)",
    orcids: ["0000-0002-3015-7522"],
    biographyTr: "Prof. Dr. Giampiero Bellingeri, İtalya Venedik Ca' Foscari Üniversitesi'nden emekli profesördür. Türkoloji, İran ve Transkafkasya dilleri ve edebiyatları alanında uzmandır. Orhan Pamuk, Yahya Kemal ve Yakup Kadri Karaosmanoğlu gibi Türk edebiyatının önde gelen yazarlarının eserlerini İtalyancaya çevirmiştir.",
    biographyEn: "Prof. Dr. Giampiero Bellingeri is Professor Emeritus at Ca' Foscari University of Venice, Italy. His research focuses on Turcology, Iranian and Transcaucasian literatures. He has translated major Turkish literary figures including Orhan Pamuk, Yahya Kemal, and Yakup Kadri into Italian.",
  },
  "Liang Yingying": {
    tr: "Şanghay Üniversitesi, Sosyal Bilimler Fakültesi",
    en: "College of Liberal Arts, Shanghai University",
    email: "LiangYingying39@163.com",
    orcids: ["0000-0002-7739-0356"],
    biographyTr: "Liang Yingying, Şanghay Üniversitesi Sosyal Bilimler Fakültesi Küresel Çalışmalar alanında doktora araştırmacısı ve Şanghay Üniversitesi Türkiye Araştırmaları Merkezi'nde araştırmacıdır. Çin-Ortadoğu ilişkileri ve kültürel diplomasi üzerine çalışmaktadır.",
    biographyEn: "Liang Yingying is a PhD candidate in Global Studies at the College of Liberal Arts and a researcher at the Center for Turkish Studies, Shanghai University. Her research focuses on Sino-Middle Eastern relations and cultural diplomacy.",
  },
  "Aml Ali Abdrabou": {
    tr: "Beeto Arabia Company Ürün Operasyon Müdürü, Mısır",
    en: "Product Operations Manager, Beeto Arabia Company, Egypt",
    email: "1502110336@qq.com",
    biographyTr: "Dr. Aml Ali Abdrabou, sinologdur. Doktorasını 2020 yılında Şanghay Uluslararası Araştırmalar Üniversitesi Ortadoğu Araştırmaları Enstitüsü'nde tamamlamıştır. Araştırma alanları Çin-Arap kültürel ilişkileri ve Kuşak ve Yol Girişimi'dir.",
    biographyEn: "Dr. Aml Ali Abdrabou is a sinologist. She completed her PhD in 2020 at the Middle East Studies Institute of Shanghai International Studies University, focusing on Sino-Arab cultural relations and the Belt and Road Initiative.",
  },
  "İbrahim Balaban": {
    tr: "Ressam ve Yazar",
    en: "Painter and Writer",
    biographyTr: "İbrahim Balaban (1921–2019), Bursa Seçköy'de doğdu. Cezaevinde Nâzım Hikmet ile tanışarak yedi yıl boyunca sanat tarihi, felsefe ve sosyoloji eğitimi aldı. Nâzım Hikmet'in 'Köylü Ressam' ve 'Ressam Yunus Emre' olarak nitelediği Balaban, Anadolu yaşamını ve insanını yansıtan 2.000'den fazla tablo üretti ve 11 kitap yazdı.",
    biographyEn: "İbrahim Balaban (1921–2019) was born in Bursa. While in prison, he met Nâzım Hikmet and studied art history, philosophy, and political economy for seven years. Known as the 'Peasant Painter' and 'Painter Yunus Emre', he created over 2,000 paintings portraying Anatolian folk life and labor, and authored 11 books.",
  },
  "Ahmet Gedik": {
    tr: "İstanbul Üniversitesi",
    en: "Istanbul University",
    email: "gedik.ahmed@gmail.com",
    orcids: ["0000-0002-0371-6528"],
    biographyTr: "Marmara Üniversitesi, Siyasal Bilgiler Fakültesi Kamu Yönetimi (Fransızca) Bölümü’nde 2016 yılında lisans eğitimini tamamlayan Ahmet Gedik, lisans eğitimi sırasında değişim programıyla bir yıl Fransa’nın Lyon şehrin IEP de Lyon’da eğitim gördü. Yüksek lisans eğitimini Galatasaray Üniversitesi Sosyal Bilimler Enstitüsü Siyaset Bilimi programında tamamlamıştır. 2024 yılında, İstanbul Üniversitesi Sosyal Bilimler Enstitüsü Siyaset Bilimi ve Kamu Yönetimi programında doktora eğitimini tamamlamıştır. Fransızca ve İngilizce bilmektedir.",
    biographyEn: "Ahmet Gedik, who completed his undergraduate education at Marmara University, Faculty of Political Sciences, Department of Public Administration (French) in 2016, studied at IEP de Lyon in Lyon, France for one year through the exchange programme during his under-graduate education. He completed his Master’s degree in Political Science at Galatasaray University Institute of Social Sciences. In 2024, he completed his PhD in Political Science and Public Administration programme at Istanbul University Institute of Social Sciences. He speaks French and English.",
  },
  "Ahmet Kavas": {
    tr: "Afrika Araştırmacıları Derneği (AFAM)",
    en: "Association of Researchers on Africa (AFAM)",
    biographyTr: "Türk diplomat, akademisyen ve yazar Ahmet Kavas 1964 yılında doğdu. 1987 yılında Ankara Üniversitesi İlahiyat Fakültesi’nden mezun oldu. 1989-1996 yılları arasında Türkiye Diyanet Vakfı Bursuyla yüksek lisans ve doktora eğitimini Paris’te tamamladı. 2002 yılında doçent unvanı aldı. 2006 yılına kadar İslam Araştırmaları Merkezinde (ISAM) araştırmacı olarak çalıştı. 2009 yılında ise Profesör unvanı aldı. İstanbul Üniversitesi İlahiyat Fakültesinde İslam Tarihi ve İstanbul Medeniyet Üniversitesi Siyasal Bilgiler Fakültesinde Uluslararası İlişkiler Bölümü Siyasi Tarih Anabilim Dalında öğretim üyeliği yaptı. Afrika ile ilgili konularda Başbakanlık Müşavirliği, Çad Cumhuriyeti Büyükelçiliği, Senegal Büyükelçiliği görevlerinde bulundu. Özellikle Afrika üzerine araştırmalar yapmakta olup bu alanda yayınlanmış kitapları, makaleleri ve İslam Ansiklopedisine yazdığı maddeleri bulunmaktadır. Fransızca, Arapça ve İngilizce bilmektedir.",
  },
  "Ahmet Z. Bayburt": {
    tr: "Dokuz Eylül Üniversitesi, Sosyal Bilimler Enstitüsü",
    en: "Dokuz Eylül University, Institute of Social Sciences",
    orcids: ["0000-0002-9453-1683"],
    biographyTr: "Bayburt*** Arkeoloji Doktora Öğrencisi Dokuz Eylül Üniversitesi Sosyal Bilimler Enstitüsü İzmir/Türkiye **Lisans eğitimini Süleyman Demirel Üniversitesi Kamu Yönetimi bölümünde yaptı. İlk yüksek lisansını Akdeniz Üniversitesi Felsefe bölümünde epistemoloji üzerine yaptı ve Tarih Felsefesi ile ilgili İbni Haldun ve Giambattista Vico'nun doğalcı ve tinselci tarih felsefelerinin karşılaştırılması üzerine tezini hazırladı. İkinci yüksek lisansını Dumlupınar Üniversitesinde Arkeoloji bölümünde yaptı ve Mezopotamya silindir mühürlerinde bulunan kutsal ağaç motifi üzerine tezini yazdı. Şu an Dokuz Eylül Üniversitesinde Arkeoloji bölümünde doktora yapmakta ve Lena-Yenisey Neolitik kültürleri üzerine bir tez hazırlamaktadır.",
    biographyEn: "Bayburt*** Archeology PhD Student Dokuz Eylül University Institute of Social Sciences İzmir/Türkiye **He completed his undergraduate education at Süleyman Demirel University, Department of Public Administration. He completed his first master's degree in epistemology at the Department of Philosophy at Akdeniz University and prepared his thesis on the comparison of naturalist and spiritualist philosophies of history by Ibn Khaldun and Giambattista Vico on the Philosophy of History. He completed his second master's degree at Dumlupınar University in the Department of Archeology and wrote his thesis on the sacred tree motif found on Mesopotamian cylinder seals. He is currently doing his doctorate in Archeology at Dokuz Eylul University and is preparing a thesis on Lena-Yenisei Neolithic cultures.",
  },
  "Akmaral Batalova": {
    tr: "Uluslararası İlişkiler Uzmanı",
    en: "International Relations Expert",
    orcids: ["0000-0002-4825-7372"],
    biographyTr: "Akmaral Batalova uluslararası ilişkiler uzmanı, muhabir ve film yapımcısıdır. Aynı zamanda Al Farabi Dünya Mirası Kamu Vakfı’nın kurucusu ve yöneticisidir. Kazakistan’ın Almatı kentinde doğmuştur. Kazak Devlet Üniversitesi Kitle İletişim Fakültesi, Kazakistan Cumhuriyeti Dışişleri Bakanlığı Diplomasi Akademisi, Madrid Diplomasi Okulu’ndan mezun olmuş ve Complutense Üniversitesi’nden (İspanya) Uluslararası İlişkiler alanında yüksek lisans derecesine sahiptir. Akmaral Batalova, Suriye’deki insani krize odaklanarak Ortadoğu’daki durumu gözlemlemekte, makaleler yazmakta, belgeseller çekmekte ve Suriye’de insani yardım çalışmaları yapmaktadır.",
    biographyEn: "Akmaral Batalova is an expert on international relations, reporter and film producer. She is also the founder and Executive Director of the Al Farabi World Heritage Public Foundation. She was born in Almaty, Kazakhstan, graduated from the Mass Media Faculty of Kazakh State University, the Diplomatic Academy of the Ministry of Foreign Affairs of the Republic of Kazakhstan, the Diplomatic School of Madrid and has a Master’s degree in International Relations from the Complutense University (Spain). Akmaral Batalova observes the situation in the Middle East, focusing on the humanitarian crisis in Syria, writes articles and makes documentaries and does humanitarian work in Syria.",
  },
  "Aleksandr Sotniçenko": {
    tr: "Rus Kültür ve Bilim Merkezi (Rus Evi Ankara)",
    en: "Russian Cultural and Scientific Center (Rus Evi Ankara)",
    biographyTr: "Aleksandr Sotniçenko 1 Şubat 1977 doğumludur. 1998 yılında Sankt Petersburg Devlet Üniversitesi Doğu Fakültesini bitirip 2002 yılında “1839-1908 Osmanlı İmparatorluğun Jeopolitik Alanının Gelişimi” adlı doktora tezini savunmuştur. 2000-2017 yılı arasında Sankt Petersburg Devlet Üniversitesi Uluslararası İlişkiler Fakültesinde öğretim üyeliği yapmıştır. Türk tarihi, Rusya- Türkiye ilişkileri, Ortadoğu siyaseti ile ilgili bir çok makale yayımlamıştır. 2017-2021 arasında Rusya Federasyonu Ankara Büyükelçiliği’nde Müsteşar olarak çalışmıştır. 2021 yılından itibaren Rusya Kültür ve Bilim Merkezi (Rus Evi Ankara) başkan görevindedir.",
  },
  "Alexandr Bovdunov": {
    tr: "Rusya Devlet Beşeri Bilimler Üniversitesi, Ivan Ilyin Yüksek Siyaset Okulu Eğitim ve Araştırma Merkezi",
    en: "Russian State University for the Humanities, Ivan Ilyin Higher Political School Educational and Research Center",
    biographyEn: "Alexander Bovdunov is a Russian international scholar and representative of the Eurasian geopolitical school. Born in 1986, he graduated from the Moscow State Institute of International Relations (MGIMO) in 2010. In 2013, he defended his thesis for the degree of PhD in Political Sciences. He has worked as a lecturer at Moscow State University, as a political analyst and international journalist for RT, and on a number of other analytical projects. Since 2022, he has been Deputy Director of the Ivan Ilyin Higher Political School Educational and Research Center at the Russian State University for the Humanities.",
  },
  "Ali Rıza Taşdelen": {
    email: "arizatasdelen@yahoo.fr",
    orcids: ["0009-0001-3901-9046"],
    biographyTr: "Ali Rıza Taşdelen 6 Aralık 1956’da Adana’nın Ceyhan ilçesinde doğdu. Liseyi Adana Teknik Lisesi’nde okudu. 1980 yılında ailesinin yaşadığı Fransa’ya yerleşti. Lyon 2 Lumière Üniversitesi sosyoloji anabilim dalında lisans, Paris 7 Denis Diderot Üniversitesi’nde aynı dalda mastır yaptı. Çalışmalarını, Fransa’da Türk göçmenlerinin toplumsal örgütlenmesi, Türkiye’nin AB’ye üyelik süreci ve Fransa’nın dış politikası üzerine yürüttü. 1987 yılında 2000’e Doğru dergisinde gazeteciliğe başladı. Gökyüzü, 2000’e Doğru, Yüzyıl, haftalık ve günlük Aydınlık ve Teori dergilerinde haber ve araştırma yazıları yayımlandı. Ulusal Kanal ve Aydınlık gazetesinin Fransa temsilciliğini yaptı. 2011 yılından bu yana günlük Aydınlık gazetesinde Paris adlı, haftada bir dış politika üzerine köşe yazısı yazmaktadır. 2020’de Kaynak Yayınlarından çıkan “<em>Paris Komünü’nden Sarı Yeleklilere, Fransız Sosyal Demokrasisi</em>” adlı yayımlanmış bir kitabı vardır.",
    biographyEn: "Ali Rıza Taşdelen was born on December 6, 1956, in Ceyhan, Adana. He graduated from Adana Technical High School. In 1980, he moved to France, where his family lived. He received his bachelor’s degree in sociology from Lyon 2 Lumière University and his master’s degree in the same field from Paris 7 Denis Diderot University. His studies focused on the social organization of Turkish immigrants in France, Türkiye’s EU accession process, and French foreign policy. In 1987, he started working as a journalist at 2000’e Doğru magazine. His news and research articles were published in Gökyüzü, 2000’e Doğru, Yüzyıl, weekly and daily Aydınlık, and monthly Teori magazines. He worked as the representative of Ulusal Kanal and Aydınlık newspapers in France. Since 2011, he has been writing a weekly column foreign policy in the daily Aydınlık newspaper. He is the author of a book titled “<em>From Paris Commune to the Yellow Vests: French Social Democracy</em>,” published by Kaynak Yayınları in 2020.",
  },
  "Ayça Avcı": {
    tr: "Dokuz Eylül Üniversitesi, Sosyal Bilimler Enstitüsü",
    en: "Dokuz Eylül University, Institute of Social Sciences",
    email: "aycavci35@gmail.com",
    orcids: ["0000-0002-4819-126X"],
    biographyTr: "Ayça Avcı** Arkeoloji Doktora Öğrencisi Dokuz Eylül Üniversitesi Sosyal Bilimler Enstitüsü İzmir/Türkiye Ahmet Z. Bayburt*** Arkeoloji Doktora Öğrencisi Dokuz Eylül Üniversitesi Sosyal Bilimler Enstitüsü İzmir/Türkiye **Lisans eğitimini Süleyman Demirel Üniversitesi Kamu Yönetimi bölümünde yaptı. İlk yüksek lisansını Akdeniz Üniversitesi Felsefe bölümünde epistemoloji üzerine yaptı ve Tarih Felsefesi ile ilgili İbni Haldun ve Giambattista Vico'nun doğalcı ve tinselci tarih felsefelerinin karşılaştırılması üzerine tezini hazırladı. İkinci yüksek lisansını Dumlupınar Üniversitesinde Arkeoloji bölümünde yaptı ve Mezopotamya silindir mühürlerinde bulunan kutsal ağaç motifi üzerine tezini yazdı. Şu an Dokuz Eylül Üniversitesinde Arkeoloji bölümünde doktora yapmakta ve Lena-Yenisey Neolitik kültürleri üzerine bir tez hazırlamaktadır.",
    biographyEn: "Ayça Avcı** Archeology PhD Student Dokuz Eylül University Institute of Social Sciences İzmir/Türkiye Ahmet Z. Bayburt*** Archeology PhD Student Dokuz Eylül University Institute of Social Sciences İzmir/Türkiye **He completed his undergraduate education at Süleyman Demirel University, Department of Public Administration. He completed his first master's degree in epistemology at the Department of Philosophy at Akdeniz University and prepared his thesis on the comparison of naturalist and spiritualist philosophies of history by Ibn Khaldun and Giambattista Vico on the Philosophy of History. He completed his second master's degree at Dumlupınar University in the Department of Archeology and wrote his thesis on the sacred tree motif found on Mesopotamian cylinder seals. He is currently doing his doctorate in Archeology at Dokuz Eylul University and is preparing a thesis on Lena-Yenisei Neolithic cultures.",
  },
  "Barış Adıbelli": {
    tr: "Kütahya Dumlupınar Üniversitesi, Siyaset Bilimi ve Uluslararası İlişkiler Bölümü",
    en: "Department of Political Science and International Relations, Kütahya Dumlupınar University",
    email: "baris.adibelli@dpu.edu.tr",
    orcids: ["0000-0002-4270-9312"],
    biographyTr: "Barış Adıbelli, 1999’da Selçuk Üniversitesi Kamu Yönetimi Bölümünden mezun oldu. Yüksek lisansını 2002 yılında Ortadoğu Teknik Üniversitesi Sosyal Bilimler Enstitüsü’nde Uluslararası İlişkiler anabilim dalında, doktorasını ise Ankara Üniversitesi Sosyal Bilimler Enstitüsü’nde Uluslararası İlişkiler anabilim dalında 2009 yılında tamamladı. Akademik çalışmaları Asya Pasifik bölgesi ve özellikle Çin dış politikası üzerinde yoğunlaşmış olup, bu alanda çalışmalar yapmıştır. Halen Kütahya Dumlupınar Üniversitesi Siyaset Bilimi ve Uluslararası İlişkiler Bölümünde öğretim üyesi olarak görev yapmaktadır.",
    biographyEn: "Dr. Barış Adıbelli graduated from Selçuk University, Department of Public Administration in 1999. He completed his master’s degree in the Department of International Relations at the Social Sciences Institute of the Middle East Technical University in 2002, and his doctorate in the Department of International Relations at the Social Sciences Institute of Ankara University in 2009. His academic studies focus on the Asia-Pacific region and especially on Chinese foreign policy. He is currently a faculty member in the Department of Political Science and International Relations at Kütahya Dumlupınar University.",
  },
  "Bülent Gülçubuk": {
    tr: "Ankara Üniversitesi",
    en: "Ankara University",
    email: "bgulcubuk@gmail.com",
    orcids: ["0000-0003-4026-1814"],
    biographyTr: "Bülent Gülçubuk, Ankara Üniversitesi Ziraat Fakültesi Tarım Ekonomisi Bölümü’nden mezun oldu. Halen, aynı Bölümde “Prof. Dr.” olarak görev yapmaktadır. Kırsal Kalkınma, Tarımsal Kalkınma, Kırsal Sosyoloji, Tarım Politikası, Girişimcilik konularında çalışmalarda bulunmakta ve dersler vermektedir. 2002-2009 yılları arasında BM Küresel Çevre Formu Türkiye Yürütme komitesi üyeliği yaptı. “Ankara Üniversitesi Kalkınma Çalışmaları Uygulama ve Araştırma Merkezi” Müdürlüğü görevini sürdürmektedir. Uluslararası Tarım Ekonomisi Derneği, Dünya Kırsal Sosyoloji Derneği ve Avrupa Sosyoloji Derneği üyesidir. 10. ve 11. Beş Yıllık Kalkınma Planı ile 2. ve 3. Tarım ve Orman Şurasında Kırsal Kalkınma Komisyon Başkanlığını yaptı. Türk Dünyası Tarım Birliği Genel Sekreterliği’ni yürütmektedir.",
    biographyEn: "Bülent Gülçubuk graduated from Ankara University, Faculty of Agriculture, Department of Agricultural Economics. He is currently working as “Prof. Dr.” in the same department. He has been working and lecturing on Rural Development, Agricultural Development, Rural Sociology, Agricultural Policy, Entrepreneurship. Between 2002-2009, he was a member of the UN Global Environment Forum Türkiye Steering Committee. He is the Director of “Ankara University Development Studies Application and Research Center”. He is a member of International Agricultural Economics Association, World Rural Sociology Association and European Sociology Association. He was the Chairman of the 10th and 11th Five-Year Development Plan and the Rural Development Commission in the 2nd and 3rd Agriculture and Forestry Councils. He is the Secretary General of the Turkish World Agricultural Union.",
  },
  "Caner Karavit": {
    tr: "Mimar Sinan Güzel Sanatlar Üniversitesi",
    en: "Mimar Sinan Fine Arts University",
    email: "karavitcaner@gmail.com",
    orcids: ["0000-0001-7651-5877"],
    biographyTr: "Caner Karavit 1960’da Edirne’de doğdu. 1986 yılında İstanbul Mimar Sinan Üniversitesi, Grafik Bölümü Yüksek Lisans programından mezun oldu. 2003-2018 Mimar Sinan Güzel Sanatlar Üniversitesi (MSGSÜ) Temel Eğitim Bölümü başkanı oldu. 2009 yılında aynı bölümde profesör oldu. 2010-2013 MSGSÜ’de rektör yardımcılığı yaptı. Rektör Yardımcılığı döneminde birçok Çin kültürel ve sanatsal etkinliğini gerçekleştirdi. 2007-2015 Çin’de Hanban bursuyla Tsinghua Üniversitesi Sanat ve Tasarım Akademisi’nde çalışmalarda bulundu. Dunhuang, Yungang, Longmen, Binglingsi, Maijishan gibi Budist mağara tapınaklarıyla, St. Petersburg, Tokyo, Berlin ve birçok Çin müzesinde Kuzey Wei sanatına ait araştırmalar yaptı. 2012 “Türkiye’de Çin Kültür Yılı” kapsamında Dunhuang Mağaraları sanat sergisinin MSGSÜ Tophane-i Amire salonunda sergilenmesini sağladı. 2013-2015 Ressam Hanshi Liu’dan geleneksel Çin resmi dersleri aldı. Karavit’in uluslararası ve ulusal dergilerde yayınlanan makaleleri, konferans ve birçok karma sergi etkinlikleri bulunmaktadır. Karavit’in 5 kitabı, 7 kişisel sergisi, 7 ödülü, yurtdışı ve yurtiçindeki koleksiyonlarda eserleri vardır. Karavit’in eğitim alanları; Temel Sanat ve Tasarım Eğitimi, Geleneksel Çin Resmi, Uzak Doğu Sanatı, Karşılaştırmalı Doğu ve Batı Kompozisyon Kuramları üzerinedir.",
    biographyEn: "Caner Karavİt Prof. Mimar Sinan Fine Arts University Caner Karavit was born in Edirne in 1960. He graduated from Istanbul Mimar Sinan University, Graphic Department, Master's Program in 1986. Between the years of 2003 and 2018, he was the head of MSGSU's Basic Education Department. He became a professor in the same department in 2009. He served as vice rector at MSGSU between 2010 and 2013. He held many Chinese cultural and artistic events during his tenure as Vice-Chancellor. He attended Tsinghua University Art and Design in China on a Hanban scholarship from 2007 to 2015 and worked at the Academy. He conducted research on Northern Wei art in Dunhuang, Yungang, Longmen, Binglingsi, and in Buddhist cave temples such as Maijishan, St. Petersburg, Tokyo, and Berlin. From 2013 to 2015, he took traditional Chinese painting lessons from the painter Hanshi Liu. Karavit's articles are published in international and national journals. He has published 5 books, 7 personal exhibitions, and earned 7 awards. Karavit's study fields are: Basic Art and Design Education, Traditional Chinese Painting, Far Eastern Art, and Comparative Eastern and Western Composition Theories.",
  },
  "Cüneyt Akalın": {
    orcids: ["0000-0002-8479-3495"],
    biographyTr: "1945’te İstanbul'da doğdu. İlköğretimini Ankara'da tamamladıktan sonra girdiği Galatasaray Lisesi'nden 1965 yılında mezun oldu. AFS burslarından yararlanarak, öğrenimine bir yıl ABD'de devam etti. 1965’te girdiği Ankara Üniversitesi Siyasal Bilgiler Fakültesinden 1969'da mezun oldu. Aynı yıl adı geçen Fakültede asistan olarak kaldı ve doktora çalışmasına başladı. İstanbul'da yayıncılık ve gazeteciliğe başladı. Hürriyet, Cumhuriyet, Aydınlık gazetelerinde muhabir, dış politika yazarı, araştırma sayfası editörü, spor editörü vb. olarak çalıştı. Bu arada, başladığı doktora çalışmasına İstanbul Üniversitesi İktisat Fakültesi Siyaset Kürsüsünde devam etti. Öğretim görevlisi olarak çalışmaya başladığı Galatasaray Üniversitesi'nde 1999’de Yard. Doçentliğe getirildi, 2006'da doçentliğe yükseltildi Marmara Üniversitesi İletişim ve Güzel Sanatlar Fakültelerinde görev yaptı. Marmara Üniversitesi’nden 2012 yılında emekli olduktan sonra 10 yıl Arel Üniversitesinde dersler verdi. Bir yandan da serbest gazeteciliğe devam etti. Akalın'ın çeşitli dergilerde yayımlanmış çok sayıda bilimsel-siyasal makalesi, İngilizce-Fransızcadan Türkçeye aktardığı 10'u aşkın kitap çevirisi ve çok sayıda telif eseri bulunmaktadır.",
    biographyEn: "Cüneyt Akalın was born in Istanbul in 1945. After completing his primary education in Ankara, he graduated from Galatasaray High School in 1965. He continued his education in the USA for one year. He entered the Ankara University Faculty of Political Sciences and graduated in 1969. Later, he started his doctoral studies. He worked in publishing houses and Journals as a reporter, foreign policy writer, research page editor, and sports editor in Hürriyet, Cumhuriyet, and Aydnlk newspapers. He continued his doctoral studies at Istanbul University. He worked as a lecturer at Galatasaray University and was promoted to associate professor in years. He worked at Marmara University's Faculty of Communication and Fine Arts. After retiring from Marmara University, he taught at Arel University. At the same time, he continued his freelance journalism activities. Akalın has many scientific-political articles published in various journals, more than 10 book translations from English-French to Turkish, and many copyrighted works.",
  },
  "Dennis Munene Mwaniki": {
    tr: "Africa Policy Institute bünyesindeki China-Africa Centre",
    en: "China-Africa Centre at the Africa Policy Institute",
    email: "munenemwaniki@gmail.com",
    orcids: ["0009-0000-8993-8510"],
    biographyTr: "Dennis Munene Mwaniki, Nairobi Kenya’da bulunan Afrika Politikası Enstitüsü’nde yer alan Çin-Afrika Merkezi’nin Araştırma Direktörü ve Baş Yönetmenidir. Çin Sosyal Bilimler Akademisi Üniversitesi’nde (UCASS) Kalkınma Ekonomisi alanında doktora adayıdır. Nairobi Üniversitesi Uluslararası Çatışma Yönetimi Yüksek Lisansı’nı 2019 yılında tamamlamıştır. Yönetişim ve uluslararası ilişkiler danışmanı olarak, barış ve güvenliği teşvik etme, sürdürülebilir kalkınmayı destekleme ve küresel zorlukları ele alma konusunda 10 yıldan fazla deneyime sahiptir. “İklim Değişikliği ve Enerji Dönüşümü Konusunda Çin-Afrika İşbirliği”, “Afrika'nın Sanayileşme Süreci, Zorluklar, Fırsatlar ve Enerji Sektörünün Rolü”, “Afrika'daki Önemli Maden Kaynakları, Geliştirilmesi ve Kullanımı Üzerine Araştırma”, “Kuşak ve Yol Girişimi Kapsamında Çin-Afrika Enerji İşbirliği” çalışmalarından bazılarıdır. İngilizce ve Svahili dillerini bilmektedir.",
    biographyEn: "Dennis Munene Mwaniki is Director of Research and Executive Director of the China-Africa Centre at the Africa Policy Institute in Nairobi, Kenya. He is a PhD candidate in Development Economics at the University of Chinese Academy of Social Sciences (UCASS). He completed Master of Arts in International Conflict Management at University of Nairobi in 2019. As a governance and international relations consultant, he has more than 10 years of experience in promoting peace and security, supporting sustainable development and addressing global challenges. Some of his studies include “China-Africa Cooperation on Climate Change and Energy Transition”, “Africa’s Industrialization Process, Challenges, Opportunities and the Role of the Energy Sector”, “Research on the Resources, Development, and Utilization of Key Minerals in Africa”, “China-Africa Energy Cooperation under the Belt and Road Initiative. He speaks English and Swahili.",
  },
  "Digby James Wren": {
    tr: "Kamboçya Uluslararası İlişkiler Enstitüsü, Kamboçya Kraliyet Akademisi",
    en: "International Relations Institute of Cambodia, Royal Academy of Cambodia",
    biographyTr: "Dr. Wren, hem Uluslararası İlişkiler hem de Kamu Diplomasisi alanlarında araştırma derecelerine sahiptir ve şu anda Kamboçya Kraliyet Akademisi (RAC), Mekong Araştırma Merkezi Uluslararası İlişkiler Enstitüsü’nde (IRIC) Özel Danışmanlık ve Direktörlük yapmaktadır. Kuşak ve Yol Asya-Pasifik Kurultayı (BRICAP) ve Pakistan Uluslararası İlişkiler ve Medya Enstitüsü (PIIRM) Danışma Kurulu üyesi. Dr. Wren aynı zamanda Pekin'deki Taihe Observer'ın Yardımcı Editörü, CGTN ve Bloomberg TV televizyon kanallarının düzenli konuğudur.",
    biographyEn: "Dr. Wren holds research degrees in both International Relations and Public Diplomacy and is currently a Senior Special Advisor and Director of the Mekong Research Centre at the Institute of International Relations (IRIC), Royal Academy of Cambodia (RAC), Advisory Board Member of the Belt and Road Caucus for Asia- Pacific (BRICAP) and Advisory Board member of the Pakistan Institute of International Relations and Media (PIIRM). Dr. Wren is also the Associate Editor of Taihe Observer in Beijing and a regular guest on China Global Television and radio Networks (CGTN) and Bloomberg TV and Radio current affairs programs.",
  },
  "Doğan Başaran": {
    tr: "Türk Dünyası Tarım Birliği",
    en: "Agricultural Union of Turkic States",
    email: "dogan.basaran@tdtb.com.tr",
    orcids: ["0009-0003-1884-8982"],
    biographyTr: "Doğan Başaran, Ege Üniversitesi’nden aldığı Ziraat Fakültesi ve Uzaktan Algılama/Uydu Teknolojisi alanlarındaki Lisans ve Mühendislik Yüksek Lisans dereceleri ile eğitim ve öğretim hayatını tamamlamıştır. Profesyonel kariyeri; televizyon yayıncılığı, uluslararası organizasyonlar, etkinlik yönetimi, stratejik planlama ve pazar analizi hizmetlerini kapsayan geniş bir yelpazeden oluşmaktadır. AGRO TV Türkiye ve Azerbaycan’ın kurucu ortağı ve CEO’sudur. Türk Dünyası Tarım Birliği’nin kurucu başkanıdır.",
    biographyEn: "Doğan Başaran holds a bachelor’s degree in Agriculture and a master’s degree in Engineering in Remote Sensing/Satellite Technology from Ege University. His professional career spans a wide range of fields including television broadcasting, international organizations, event management, strategic planning and market analysis. He is the co-founder and CEO of AGRO TV Türkiye and Azerbaijan. He is the founding president of the Turkic World Agricultural Union.",
  },
  "Du Donghui": {
    tr: "Tarih Bölümü, Şanghay Üniversitesi",
    en: "Department of History, Shanghai University",
    email: "dudonghui@shu.edu.cn",
    orcids: ["0009-0005-8912-1670"],
    biographyTr: "Du Donghui, Şanghay Üniversitesi Tarih Bölümü’nde Dr. Öğretim Üyesi ve Türkiye Araştırmaları Merkezi’nde araştırmacı olarak görev yapmaktadır. 2021 yılında Şanghay Üniversitesi’nden Dünya Tarihi alanında doktora derecesini almış ve Fudan Üniversitesi’nde Siyaset Bilimi alanında doktora sonrası araştırma yapmıştır (2021-2023). Ayrıca Türkiye’de Marmara Üniversitesi’nde misafir araştırmacı olarak bulunmuştur (2018-2019). Başlıca araştırma alanları arasında Türkiye’nin dış politikası ve Ortadoğu’daki uluslararası ilişkiler yer almaktadır. Chinese Journal of European Studies, Journal of World Peoples Studies, West Asia and Africa, Historical Review, Forum of World Economics & Politics, Journal of Shanghai University gibi dergilerde uzmanlık alanıyla ilgili çeşitli akademik makaleler yayımlamıştır.",
    biographyEn: "Du Donghui is an Assistant Professor at the Department of History, Shanghai University and a researcher at the Center for Turkish Studies. In 2021, he received his PhD degree in World History from Shanghai University and conducted postdoctoral research in Political Science at Fudan University (2021-2023). He was also a visiting scholar at Marmara University in Türkiye (2018-2019). His main research interests include Türkiye's foreign policy and international relations in the Middle East. He has published several academic articles in journals such as Chinese Journal of European Studies, Journal of World Peoples Studies, West Asia and Africa, Historical Review, Forum of World Economics & Politics, Journal of Shanghai University.",
  },
  "Ersin Tatar": {
    tr: "Kuzey Kıbrıs Türk Cumhuriyeti Cumhurbaşkanı",
    en: "President of the Turkish Republic of Northern Cyprus",
    biographyTr: "Ersin Tatar, 1960 yılında Kıbrıs’ın başkenti Lefkoşa’da dünyaya geldi. İlk ve orta eğitimini Kıbrıs’ta, Lise ve Üniversite eğitimini ise İngiltere’de tamamladı.1982 yılında Cambridge Üniversitesi’nden mezun olduktan sonra 1986 yılına kadar dünyanın en önemli denetim ve mali müşavirlik şirketi olan Price Waterhouse’un İngiltere Merkez ofisinde çalıştı. 1986-1990 yılları arasında İngiltere’de Polly Peck Firması’nda, 1990-1992 yılları arasında da Ankara’da FMC-Nurol Savunma Sanayi A.Ş.’de Finansman Müdürü, 1992-2001 yılları arasında ise Show TV’de Mali İşler Koordinatörlüğü görevlerini yürüttü.1996 yılında Kuzey Kıbrıs Türk Cumhuriyeti’nin ilk özel televizyon kanalı olan “Kanal T”yi kurdu. 2009 genel seçimlerinde ise UBP’den milletvekili seçilerek parlamentoya girdi. 2009 yılında Maliye Bakanı olarak görev alan Ersin Tatar, 2018’de gerçekleştirilen UBP Kurultayı’nda Genel Başkan seçildi. 22 Mayıs 2019’da Kuzey Kıbrıs Türk Cumhuriyeti Başbakanı oldu. İlk turu 11 Ekim, ikinci turu 18 Ekim 2020’de yapılan Cumhurbaşkanlığı seçimini kazanarak, Kuzey Kıbrıs Türk Cumhuriyeti’nin 5’inci Cumhurbaşkanı oldu.",
    biographyEn: "Ersin Tatar was born in 1960 in Nicosia, the capital of Cyprus. He completed his primary and secondary education in Cyprus and his high school and university education in England. After graduating from Cambridge University in 1982, he worked in the UK Headquarters of Price Waterhouse, the most important auditing and financial consultancy company in the world, until 1986. He worked as the Finance Manager at Polly Peck Company in England between 1986-1990, at FMC-Nurol Defense Industry Inc. in Ankara between 1990-1992, and as Financial Affairs Coordinator at Show TV between 1992-2001. In 1996, he founded “Kanal T”, the first private television channel of the Turkish Republic of Northern Cyprus. In the 2009 general elections, he was elected as a deputy from the UBP and entered the parliament. Ersin Tatar, who served as the Minister of Finance in 2009, was elected as the Chairman at the UBP Congress held in 2018. He became the Prime Minister of the Turkish Republic of Northern Cyprus on May 22, 2019. He became the 5th President of the Turkish Republic of Northern Cyprus by winning the first round on October 11 and the second round on October 18, 2020.",
  },
  "Fabrizio Verde": {
    tr: "Gazeteci",
    en: "Journalist",
    biographyTr: "Fabrizio Verde gazeteci ve çevrimiçi gazete l'AntiDiplomatico'nun editörüdür. Verde, United World International düşünce kuruluşu ve uluslararası dergi ve gazetelerde jeopolitik analizci olarak görevler almaktadır. Bolivarcı Venezuela Cumhuriyeti'nin Napoli Başkonsolosluğu tarafından yayınlanan Amerindia dergisi ve çeşitli ulusal gazetelerle işbirliği yapmıştır. Napoli L'Orientale Üniversitesi Siyaset Bilimi mezunudur.",
    biographyEn: "Fabrizio Verde is a journalist, editor of the online newspaper l'AntiDiplomatico. He collaborates as a geopolitical analyst and expert for the United World International think-tank and with international magazines and newspapers. He has collaborated with the magazine Amerindia, published by the Consulate General of the Bolivarian Republic of Venezuela in Naples, and with several national organizations.",
  },
  "Fahri Erenel": {
    tr: "İstinye Üniversitesi",
    en: "İstinye University",
    email: "ferenel@istinye.edu.tr",
    biographyTr: "1980 yılında iktisat anabilim dalında Kara Harp Okulundan mezun olmuştur. Sosyoloji ve Uluslararası İlişkiler dalında lisans, Ulusal ve Uluslararası Güvenlik, Eğitim Yönetimi ve Denetimi, İş Sağlığı ve Güvenliği alanında Yüksek Lisansını, İnsan Kaynakları Yönetimi Bilim Dalında Doktorasını tamamlamıştır. 1980-2010 yılları arasında Türk Silahlı Kuvvetlerinin çeşitli kademelerinde görev yapmıştır. B sınıfı iş güvenlik uzmanıdır. 2017 yılında Yönetim ve Strateji alanında Doçent olmuştur. Altınbaş ve Kent Üniversitelerinde idari ve akademik kadrolarda çeşitli görevlerde bulunmuştur. Halen İstinye Üniversitesinde Siyaset Bilimi ve Kamu Yönetimi Bölümü Öğretim Üyesi olarak görev yapmaktadır.",
    biographyEn: "Fahri Erenel graduated from the Military Academy in 1980 in the department of economics. He completed his BA in Sociology and International Relations; his MA in National and International Security; Educational Administration and Supervision; Occupational Health and Safety; and his PhD in Human Resources Management. Between 1980 and 2010, he served at various levels in the Turkish Armed Forces. He is a B-class occupational safety specialist. He became an Associate Professor in Management and Strategy in 2017. He held various positions on the administrative and academic staff at Altınbaş and Kent Universities. He is still working as a lecturer at Istinye University, Department of Political Science and Public Administration. He is also the author of six books.",
  },
  "Fang Xuting": {
    tr: "Şanghay Üniversitesi Küresel Çalışmalar Enstitüsü, Türkiye Araştırmaları Merkezi",
    en: "Center for Turkish Studies, Institute of Global Studies, Shanghai University",
    orcids: ["0009-0005-8646-0861"],
    biographyTr: "Fang Xuting, Liberal Sanatlar Fakültesi’nde Siyaset Bilimi alanında yüksek lisans adayıdır ve Şanghay Üniversitesi Türkiye Çalışmaları Merkezi’nde Dr. Yang Chen’in danışmanlığında araştırma görevlisi olarak çalışmaktadır. Araştırma alanları ağırlıklı olarak Çin ve Türkiye arasındaki ilişkilere odaklanmaktadır.",
    biographyEn: "Fang Xuting is a master’s candidate majoring in Political Science at the College of Liberal Arts and a research assistant at the Center for Turkish Studies at Shanghai University under the supervision of Asst. Prof. Yang Chen. Her research interests primarily focus on Relations between China and Türkiye.",
  },
  "Guo Xin’gen": {
    tr: "Şanghay Üniversitesi, Türkiye Araştırmaları Merkezi",
    en: "Shanghai University, Center for Turkish Studies",
    orcids: ["0009-0006-2318-2224"],
    biographyTr: "Guo Xin’gen, Şanghay Üniversitesi Liberal Sanatlar Fakültesi’nde Siyaset Bilimi alanında yüksek lisans öğrencisi ve Şanghay Üniversitesi Türkiye Çalışmaları Merkezi’nde araştırma görevlisidir. Araştırma alanları öncelikle Türkiye’nin Yumuşak Gücü üzerine odaklanmaktadır.",
    biographyEn: "Guo Xin’gen is a master’s candidate majoring in Political Science at the College of Liberal Arts and a research assistant at the Center for Turkish Studies at Shanghai University. His research interests primarily focus on Türkiye’s Soft Power.",
  },
  "H. Şule Perinçek": {
    tr: "Atatürk'ün Bütün Eserleri Genel Yayın Yönetmeni · Ulusal Strateji Merkezi (USMER) Başkanı",
    en: "Editor-in-Chief of Collected Works of Atatürk · Chair of the National Strategy Center (USMER)",
    biographyTr: "Atatürk’ün Bütün Eserleri’nin Genel Yayın Yönetmeni, Vatan Partisi Merkez Yürütme Kurulu Üyesi - Uluslararası İlişkiler Bürosu Başkan Yardımcısı, Ulusal Strateji Merkezi Başkanı, gazeteci yazar. Çapa İlkokulu, İstanbul; Sankt George Avusturya Lisesi, İstanbul ve Boulder High School, Colo., Ankara Üniversitesi Siyasal Bilgiler Fakültesi Maliye ve İktisat bölümü mezunu. 68 gençlik hareketlerinde yer aldı. 1970'den bu yana örgütlü siyasi mücadelenin içinde. 1974'ten bu yana gazetecilik yapıyor. Çeşitli yayın organlarında ve yayınevlerinde yöneticilik yaptı. Çeşitli dergilerde özellikle siyaset, kadın, çevre ve yakın tarihimizin geleceğe ilişkin kültürel, ideolojik ve teorik konularında yazıları, araştırma ve incelemeleri yayımlandı. Çeviri, derleme ve telif kitapları, yurtiçi ve yurtdışı sempozyum ve panellerde tebliğleri bulunmaktadır. 25 yıldır Atatürk'ün Bütün Eserleri'nin Genel Yayın Yönetmenliğini yapıyor. Türk Devrimi’nin lideri Mustafa Kemal Atatürk’ün bütün yazdıklarının ve söylediklerinin tarih sırasına göre toplandığı 30 cilt olarak yayımlanan bu eser Türkiye’de bir ilk çalışma. Yalnızca Türkiye ve o dönem açısından değil bugün 21. Yüzyılda emperyalizme karşı mücadele eden dünya açısından ışık tutucu önemli deneyimleri barındırmaktadır.",
    biographyEn: "The Chief Editor of \"Collected Works of Atatürk\", Member of the Central Executive Board of the Vatan Party, Deputy Chair of the International Relations Bureau, Chairman of the National Strategy Center, journalist, and writer. Graduated from Çapa Primary School, Istanbul; St. George Austrian High School, Istanbul; and Boulder High School, Colo., as well as the Faculty of Political Sciences at Ankara University, with degrees in Finance and Economics. Engaged in youth movements during '68. Involved in organized political struggle since 1970. Engaged in journalism since 1974. Held managerial positions in various media outlets and publishing houses. Published articles and analyses in various journals, particularly in the fields of politics, women's issues, the environment, and the cultural, ideological, and theoretical aspects of our recent history with a focus on the future. Author of translated, compiled, and original books, as well as presentations at domestic and international symposiums and panels. Serving as the Chief Editor of \"Collected Works of Atatürk\" for 25 years. This work, in 30 volumes, compiles all the writings and speeches of Mustafa Kemal Atatürk, the leader of the Turkish Revolution, in chronological order. This work is a pioneering effort in Türkiye, offering illuminating and significant knowledge not only for Türkiye and its era, but also for the contemporary 21st century world engaged in the struggle against imperialism.",
  },
  "Halil Özsaraç": {
    tr: "Emekli Deniz Kurmay Albay",
    en: "Retired Naval Staff Captain",
    orcids: ["0009-0003-5169-1083"],
    biographyTr: "Halil Özsaraç 1970’te Yenişehir-Bursa’da doğan Halil Özsaraç, Karamürsel-Kocaeli’de büyümüş, 1987’de Deniz Lisesi’ni, 1991’de Deniz Harp Okulu’nu bitirerek deniz subayı; 2002’de de Deniz Harp Akademisi’ni bitirerek kurmay subay olmuştur. Türk Silahlı Kuvvetlerinde çeşitli savaş gemileri, tersane, karargâh ve askerî eğitim kurumlarında görevler almıştır. 2021’de Deniz Kurmay Albay rütbesiyle emekli olmadan önceki son görev yeri, Millî Savunma Üniversitesi (MSÜ) Deniz Harp Enstitüsü’dür (DHE). Halil Özsaraç, 2021’den emekli olduktan sonra da, MSÜ-DHE’de Komuta- Kurmay eğitimi gören Türk ve misafir ülke deniz subaylarına dersler vermeye devam etmektedir. Ulusal Strateji Merkezi’nde (USMER) Yönetim Kurulu Üyesi ve Millî Güvenlik Masası Başkanı olan Halil Özsaraç, Teori Dergisi Yayın Kurulu Üyesidir. “Donanmanın Tarihsel Serüveni”, “Barbaroslar: Akdeniz’in Anlatılmamış Hikâyesi” ve “Osmanlı’nın Kalbi: Tersâne-i Âmire-İstanbul Tersanesi” adlı kitapları vardır. Ulusal Kanal’da yayını devam eden “Denizdeki Türkler” belgeselinin sunmasının yanı sıra Aydınlık Gazetesi’nde yayını devam eden “Denizdeki Türkler” adlı köşenin yazarıdır. Evli ve 1 çocuk babasıdır. İngilizce bilmektedir.",
    biographyEn: "Born in Yenişehir-Bursa in 1970, Halil Özsaraç grew up in Karamürsel-Kocaeli; graduated from the Naval High School in 1987, the Naval Academy in 1991 and became a naval officer; and graduated from the Naval War College in 2002 and became a staff officer. He served in various warships, shipyards, headquarters and military education institutions in the Turkish Armed Forces. His last assignment before his retirement in 2021 was at the Naval Warfare Institute (DHE) of the National Defense University (MSÜ) with the rank of Naval Staff Captain. After his retirement in 2021, Halil Özsaraç continues to give lectures to Turkish and visiting naval officers studying Command and Staff training at MSÜ-DHE. Halil Özsaraç is a member of the “Board of Directors” at the National Strategy Center (USMER) and Head of the National Security Desk at USMER. He is a member of the Editorial Board of Teori Magazine. He wrote several books: “The Historical Adventure of the Navy”, “The Barbaros: The Untold Story of the Mediterranean” and “The Heart of the Ottoman Empire: Tersâne-i Âmire-Istanbul Shipyard”. He is the host of the documentary “Turks in the Sea”, which continues to be broadcast on Ulusal Kanal. He is also and the author of the column “Turks in the Sea”, which continues to be published in Aydınlık Newspaper. He is married and has 1 child.",
  },
  "Halim Gençoğlu": {
    tr: "Cape Town Üniversitesi",
    en: "University of Cape Town",
    email: "halim.gencoglu@wits.ac.za",
    orcids: ["0000-0002-4743-1698"],
    biographyTr: "Halim Gençoğlu İzmir’deki lisans eğitiminin ardından Cape Town Üniversitesi’nde (University of Cape Town: UCT) Dini Çalışmalar alanında yüksek lisansımı tamamladı. Tezinde Güney Afrika, Osmanlı ve diğer arşiv kaynaklarını kullanarak Osmanlı İslam alimi Ebubekir Efendi’nin 19. yüzyılda Güney Afrika’daki dini faaliyetlerine odaklandı. Daha sonra İbrani çalışmaları alanında “Marjinal Dini Mezheplerin Sosyo-Politik Zorlukları: Bir Vaka Çalışması Olarak Sabetaycı Tarikat” konulu doktora çalışmasını tamamladı. Tarihteki tartışmalı bir figürü, kendini Mesih ilan eden Yahudi Haham Şabbetay Tzvi’yi analiz etti. Akademik çalışmaları sırasında, hem Güney Afrika hem de Osmanlı arşiv kaynaklarını kullanarak daha geniş Güney Afrika temaları üzerine araştırmalar da yürüttü. Arşiv araştırmaları sırasında Dr. Muhammed Şükrü Efendi’nin UCT’den mezun olan ilk siyahi tıp öğrencisi olduğunu keşfetti. Bu keşif 12 Nisan 2016 tarihinde UCT web sitesinde yayınlandı. (http://www.health.uct.ac.za/news/newevidencefirst-black-medical-doctors-uct-south-african-history) Daha yakın bir tarihte, 71 Wale Street adresindeki Bo-Kaap müzesinin aslında Osmanlı Türk din alimi Mahmud Fakih Efendi’ye ait olduğunu keşfetti. Halen Cape Town Üniversitesi Afrika Çalışmaları Bölümü’nde Araştırma Görevlisi olarak Afrika Çalışmaları alanında araştırmalar yapıyor.",
    biographyEn: "After his undergraduate studies in Izmir, Halim Gençoğlu completed his master’s degree in religious studies at the University of Cape Town (UCT). His thesis focused on the religious activities of the Ottoman Islamic scholar Abu Bakr Effendi in South Africa in the nineteenth century, using South African, Ottoman, and other archival sources. He then enrolled for his PhD in Hebrew studies on “Socio-political Challenges of “Marginal” Religious Denominations: The Sabetai Sect as a Case Study.” He analyzed a controversial figure in history, the self-proclaimed Messiah, the Jewish Rabbi Shabbetai Tzvi. During his academic studies, he also conducted research on broader South African themes using both South African and Ottoman archival sources. During his archival research, he discovered that Dr. Muhammed Shukri Effendi was the first black medical student to graduate from UCT. This discovery was published on the UCT website on April 12, 2016. (http://www.health.uct.ac.za/news/new-evidencefirst-black-medical-doctors-uct-south-african-history) More recently, he discovered that the Bo-Kaap museum at 71 Wale Street actually belonged to the Ottoman Turkish religious scholar Mahmud Fakih Effendi. He is currently a Research Fellow in the Department of African Studies at the UCT, where he conducts research in African studies.",
  },
  "Hao Ruiqi": {
    tr: "Harbin Teknoloji Enstitüsü, Marksizm Okulu",
    en: "School of Marxism, Harbin Institute of Technology",
    orcids: ["0009-0001-0419-7651"],
    biographyTr: "Hao Ruiqi, Marksizm Okulu, Harbin Teknoloji Enstitüsü doktora öğrencisidir. Marksizm Teorisi alanında uzmandır.",
    biographyEn: "Hao Ruiqi is a PhD student at the School of Marxism, Harbin Institute of Technology. He specializes in Marxism Theory.",
  },
  "John Bellamy Foster": {
    tr: "Oregon Üniversitesi, Sosyoloji Bölümü",
    en: "University of Oregon, Department of Sociology",
    email: "jfoster@uoregon.edu",
    biographyTr: "John Bellamy Foster, Monthly Review dergisinin editörü ve Oregon Üniversitesi’nde sosyoloji profesörüdür. Politik ekonomi üzerine yazılar yazmış ve önemli bir çevre sosyoloğu olarak ün kazanmıştır. <em>Marx’ın Ekolojisi: Materyalizm ve Doğa</em>, <em>Büyük Mali Kriz: Nedenler ve Sonuçlar</em>, <em>Tekelci Kapitalizmin Teorisi: Marksist Politik Ekonominin Değerlendirilmesi</em>'nin aralarında bulunduğu birçok kitabın yazarıdır.",
    biographyEn: "John Bellamy Foster is editor of Monthly Review and professor of sociology at the University of Oregon. He has written widely on political economy and has established a reputation as a major environmental sociologist. He is the author of <em>Marx’s Ecology: Materialism and Nature</em> (2000), <em>The Theory of Monopoly Capitalism: An Elaboration of Marxian Political Economy</em> (New Edition, 2014), among many others.",
  },
  "Kazim Abdullaev": {
    tr: "İstanbul Üniversitesi",
    en: "İstanbul University",
    email: "kabdullaev@yahoo.com",
    orcids: ["0000-0002-1840-6709"],
    biographyTr: "Kazim Abdullaev, yüksek lisans derecesini 1975 yılında Gorki Üniversitesi'nden (Nizhni Novgorod) Rönesans Çalışmaları üzerine, doktora derecesini ise 1986 yılında SSCB Bilimler Akademisi Arkeoloji Enstitüsü'nden Klasik Arkeolojide Farklılıklar konusunda aldı. Araştırma alanları arasında Antik Dönemde Anadolu ve Helenistik ve Post-Helenistik Dönemlerin Orta Asya Arkeolojisi yer almaktadır. Yunan ikonografisinin Orta Asya'nın Doğu Medeniyetlerinde yayılması üzerine çalışmaları nedeniyle 2009'da Academie des Inscriptions et Belles-Lettres’den Seçkin Bilim İnsanı Ödülü almıştır. Şu anda İstanbul Üniversitesi Güzel Sanatlar Bölümü'nde Kıdemli Araştırmacı ve Öğretim Görevlisi, Ulusal Bilimsel Araştırmalar Merkezi (Paris) ve Antik Dünya Araştırmaları Enstitüsü’nde (New York) Ortak Üye, Uluslararası Akdeniz ve Doğu Araştırmaları Derneği’nde ise Yabancı Sorumlu Üyedir.",
    biographyEn: "Kazim Abdullaev received his M.A. degree in 1975 from Gorky University (Nizhni Novgorod) on Renaissance Studies, and his Ph.D. on Distinction in Classical Archaeology from the Institute of Archaeology, Academy of Sciences of the USSR in 1986. His research interests include the archaeology of Anatolia in Ancient period and Central Asia of the Hellenistic and Post-Hellenistic periods. He is a Laureate of Academie des Inscriptions et Belles-Lettres (Institut de France) since 2009 for the works on the diffusion of Greek iconography in the Oriental Civilizations of Central Asia. At present time he is Senior researcher and Lecturer in the Istanbul University – Department of Fine Arts, an Associated Member of the Centre National de Recherche Scientifique (Paris) and the Institute for The Study of the Ancient World (New York), 2017 – Foreign Corresponding Member of ISMEO — Associazione Internazionale di Studi sul Mediterraneo e l’Oriente (International Association of Studies on the Mediterranean and the East).",
  },
  "Khalid Taimur Akram": {
    tr: "Küresel ve Stratejik Çalışmalar Merkezi, İslamabad",
    en: "Center for Global and Strategic Studies Islamabad",
    biographyTr: "Khalid Taimur Akram, Kuşak ve Yol Girişimi ve Avrasya konularında çalışmalar yürüten bir uluslararası jeostrateji uzmanıdır. İslamabad Küresel ve Stratejik Çalışmalar Merkezi’nin (CGSS) İcra Müdürü olarak görev yapmaktadır. Faaliyet yürüttüğü kurumlar arasında Pakistan Ortak Gelecek Topluluğu Araştırma Merkezi (PRCCSF) de bulunmaktadır.",
    biographyEn: "Khalid Taimur Akram is a International Expert on the Eurasian region with specializing in Belt & Road Initiative. He is a recipient of the Best Researcher award for three consecutive years from 2021 to 2023. He was also awarded with the prestigious “Otlin Qalam” award by the Union of Journalists of Republic of Uzbekistan for being the best foreign writer in year 2022. Also, the Ministry of Economics of Republic of Azerbaijan awarded him with Best Writer award in year 2023.",
  },
  "Li Guitao": {
    tr: "Tsinghua Üniversitesi",
    en: "Tsinghua University",
    orcids: ["0009-0009-2383-4300"],
    biographyTr: "Li Guitao doktora derecesini Tianjin Üniversitesi’nden almıştır. Tsinghua Üniversitesi’nde doktora sonrası araştırma görevlisi olarak çalışmıştır. Tsinghua Üniversitesi Araştırma Enstitüsü’nde ve Havacılık ve Uzay Mühendisliği Fakültesi'nde öğretim üyesi olarak çalışmaktadır.E-",
    biographyEn: "Li Guitao received his PhD degree from Tianjin University. He worked as a postdoctoral research fellow at Tsinghua University. He is currently a faculty member at Tsinghua University Research Institute and the School of Aerospace Engineering.",
  },
  "Liu Ningning": {
    tr: "Çin Kuzeydoğu Üniversitesi, Marksizm Okulu",
    en: "School of Marxism, Northeastern University",
    email: "liuningning@mail.neu.edu.cn",
    orcids: ["0009-0006-1684-6424"],
    biographyTr: "Liu Ningning, Çin Kuzeydoğu Üniversitesi Marksizm Okulu’nda öğretim üyesi olarak görev yapmaktadır. Liaoning Üniversitesi’nden ekonomi alanında doktora derecesi almıştır ve dünya ekonomisi alanında uzmanlaşmıştır. Araştırma ve ilgi alanları arasında modern Çin tarihindeki temel konuların incelenmesi ve Marksist siyasi ekonominin incelenmesi yer almaktadır.",
    biographyEn: "Liu Ningning, Professor at School of Marxism, Northeastern University, China. Graduated from Liaoning University with a Ph.D. in economics and majored in world economy. Research interests include the study of basic issues in modern Chinese history and the study of Marxist political economy.",
  },
  "Lu Chunyi": {
    tr: "Şanghay Uluslararası İşletme ve Ekonomi Üniversitesi",
    en: "Shanghai University of International Business and Economics",
    biographyTr: "Lu Chunyi, ekonomi alanında doktorasını tamamlamış, finans profesörüdür. Şanghay Finans ve Ekonomi Üniversitesi'nden mezun olmuş, Fudan Üniversitesi Ekonomi Okulu'nda doktora sonrası araştırma yapmıştır. Amerika Birleşik Devletleri'nde Massachusetts Üniversitesi'nde misafir akademisyen olarak bulunmuştur. Finansallaşma ve finansal açıklık gibi konularda araştırmalar yapmaktadır.",
    biographyEn: "Lu Chunyi, Ph.D. in Economics, Professor of Finance, graduated from Shanghai University of Finance and Economics, engaged in postdoctoral research at the School of Economics at Fudan University. He was a visiting scholar at the University of Massachusetts in the United States. He is engaged in research on issues such as financialization and financial openness.",
  },
  "Lydia Alhassan": {
    tr: "Şanghay Üniversitesi, Liberal Sanatlar Fakültesi",
    en: "College of Liberal Arts, Shanghai University",
    orcids: ["0009-0003-3937-9169"],
    biographyTr: "Lydia Alhassan, Çin’in Şanghay Üniversitesi’nde uluslararası ilişkiler üzerine yüksek lisans yapmaktadır. Nijerya’da Afe Babalola Üniversitesi’nden uluslararası ilişkiler ve diplomasi alanında lisans derecesine sahip olan Lydia, çalışmalarında özellikle Afrika çalışmaları ve barış ile güvenlik konularına yoğunlaşmaktadır. Nijerya’da önemli kuruluşlarda gerçekleştirdiği stajlar ve çalıştığı tam zamanlı işlerde kapsamlı bir pratik deneyim kazanmıştır. Nijerya Federal Havaalanları İdaresi, İçişleri Bakanlığı ve Petrol Eşitleme Fonu’nda görevlerde bulunmuş, iç göçmen kampında gönüllü olarak çalışmalar gerçekleştirmiştir.",
    biographyEn: "Lydia Alhassan is a graduate student pursuing a Master of International Relations at Shanghai University, China. Holding a bachelor’s degree in international relations and diplomacy from Afe Babalola University, Nigeria, her academic journey has been marked by a passion for African studies and contributing to peace and security studies. With a solid academic foundation, she has gained practical experience through relevant internships and full-time work experience at important organizations in Nigeria. Her professional journey includes positions at the Federal Airports Authority of Nigeria, the Ministry of Interior, the Petroleum Equalization Fund and a volunteer at the internally displaced persons camp.",
  },
  "Ma Jinting": {
    tr: "Şanghay Üniversitesi, Türkiye Araştırmaları Merkezi",
    en: "Shanghai University, Center for Turkish Studies",
    email: "majinting@shu.edu.cn",
    orcids: ["0009-0003-7333-1564"],
    biographyTr: "Ma Jinting, Liberal Sanatlar Fakültesi'nde Siyaset Bilimi alanında yüksek lisans adayı ve Şanghay Üniversitesi Türkiye Çalışmaları Merkezi'nde araştırma görevlisidir. Araştırma alanları öncelikli olarak Türkiye'nin Siyaseti ve Diplomasisi üzerine odaklanmaktadır.",
    biographyEn: "Ma Jinting is a master’s candidate majoring in Political Science at the College of Liberal Arts and a research assistant at the Center for Turkish Studies at Shanghai University. Her research interests primarily focus on Türkiye’s Politics and Diplomacy.",
  },
  "Massoud Shojai Tabatabai": {
    biographyTr: "Massoud Shojai Tabatabai İranlı karikatürist ve küratördür. 1964’te Tahran’da doğdu, Tahran Üniversitesi Güzel Sanatlar Fakültesi’nden resim dalında mezun oldu. “Kayhan Caricature” dergisinin genel yayın yönetmenliğini ve “Iranian House of Cartoon” dergisinin yöneticiliğini yaptı. Tabatabai kariyeri boyunca dünya çapındaki prestijli çizgi film yarışmalarında sık sık jüri üyeliği yapmıştır. Türkiye, Küba, Çin, Suriye, Yunanistan ve Brezilya gibi ülkelerde jüri panellerine katılmıştır. Tahran Bienali Karikatür Yarışması dahil olmak üzere karikatür sergilerinin düzenlenmesi ve küratörlüğünde de uzmanlığına başvurulmuştur. Sırbistan’da düzenlenen 8. Uluslararası Hayvan Karikatürleri Yarışması ve Suriye Karikatür Yarışması gibi yarışmalarda birincilik ödülleri almıştır.",
    biographyEn: "Massoud Shojai Tabatabai is an Iranian cartoonist and curator. He was born in 1964 in Tehran and has a degree in painting from the Faculty of Fine Arts at Tehran University. He held the positions of editor-in-chief of “Kayhan Caricature” magazine and director of “Iranian House of Cartoon” magazine. Throughout his career, Tabatabai has consistently participated as a juror in esteemed international cartoon competitions. He has served on jury panels in Turkey, Cuba, China, Syria, Greece, and Brazil. His skills have been requested for the organization and curation of cartoon exhibitions, including the Tehran Biennial Cartoon Competition. He has been awarded first place in events including the 8th International Animal Cartoons Competition in Serbia and the Syria Cartoon Competition.",
  },
  "Michael Roberts": {
    tr: "Ekonomist",
    en: "Economist",
    biographyTr: "Michael Roberts, kırk yılı aşkın bir süredir Londra’da çeşitli finans kurumları için ekonomist olarak çalışmıştır. Akademik makalelerini https://independent.academia.edu/MichaelRoberts33 adresinde yayınlamaktadır. Yazdığı kitaplar arasında: Büyük Durgunluk - Marksist bir görüş (Lulu, 2009); “Uzun Depresyon” (Haymarket, 2016); ortak editörü olduğu “Krizdeki Dünya” (Haymarket, 2018); “Marx 200” (Lulu, 2018); ve “Engels 200” (Lulu, 2020) bulunmaktadır. G.Carchedi ile birlikte ortak yazarı olduğu “21.Yüzyılda Kapitalizm: Değer Prizmasıyla” adlı kitabı Pluto Press tarafından bu yaz yayınlanacaktır. Yazar “thenextrecession.wordpress.com” adresinden de düzenli olarak blog yazılarına devam etmektedir.",
    biographyEn: "Michael Roberts worked as an economist in the City of London for various financial institutions for over forty years. His academic papers can be found here: https://independent.academia.edu/MichaelRoberts33. He has written several books including: The Great Recession - a Marxist view (Lulu, 2009); The Long Depression (Haymarket, 2016); Joint ed: World in Crisis (Haymarket, 2018); Marx 200 (Lulu, 2018); and Engels 200 (Lulu, 2020). He is joint author with G. Carchedi of a forthcoming book published this summer by Pluto Press: Capitalism in the 21st century - through the prism of value. He blogs regularly at thenextrecession.wordpress.com",
  },
  "Mohammad Basir-Ul-Haq Sinha": {
    tr: "Gazeteci-Yazar",
    en: "Journalist - Writer",
    email: "mohammad_b_haq@hotmail.com",
    biographyTr: "Mohammad Basir-Ul-Haq Sinha, Inter Press Network adlı haber ajansının CEO’su ve Dakka, Bangladeş merkezli jeopolitik bir düşünce kuruluşu olan Eurasia Society’nin İcra Direktörüdür. İlgi alanı jeopolitik ve güç ilişkilerinden tarih ve kültürel antropolojik konulara kadar uzanmaktadır.",
    biographyEn: "Mohammad Basir-Ul-Haq Sinha is the CEO of the Inter Press Network, a news agency and Executive Director of the Eurasia Society, a geopolitical think-tank based in Dhaka, Bangladesh. His area of focus stems from geopolitics and power relations to history and cultural anthropological issues.",
  },
  "Mushahid Hussain Sayed": {
    tr: "Pakistan Senato Savunma Komitesi",
    en: "Senate Defence Committee of Pakistan",
    biographyTr: "Mushahid Hussain Sayed, Pakistan Senatörü ve Senato Savunma Komitesi Başkanıdır. Master of Science in Foreign Service programından 1975’te mezun olmuştur. İslamabad’dan dört kez seçilmiş bir senatör olarak Pakistan kamu hizmetinde seçkin bir kariyere sahiptir. Başbakanlık Orta Asya Görev Gücü Başkanlığı (1992), Cenevre’deki BM İnsan Hakları Komisyonu Pakistan Delegasyonu Başkanlığı (1993), Başbakanlık Özel Asistanlığı (ABD ve Orta Asya ile ilişkileri, 1993) ve Enformasyon, Kültür ve Turizm Bakanlığı (1997-1999) gibi görevlerde bulunmuştur. Başkan Nelson Mandela, Başkan Yaser Arafat, Başbakan Atal Behari Vajpayee, Başkan Fidel Ramos ve Başkan Muhammed Mursi’nin Pakistan ziyaretlerinde onlara eşlik etmiştir. Gazetecilik tecrübesi olan Sayed, The Muslim’in 29 yaşında en genç editörü olmuştur. The New York Times, The Washington Post, LA Times, National Interest, Jane’s Defence Weekly, Middle East International, Inter Press Service, The Times of India ve The Hindustan Times’a görüş ve makaleleriyle katkıda bulunmuştur. <em>Pakistan ve Değişen Bölgesel Senaryo</em>, <em>Pakistan Siyaseti: Ziya Yılları</em> ve <em>Pakistan’ın Yönetimi</em> (ortak yazar) adlı üç kitabı yayımlanmıştır.",
    biographyEn: "Senator Mushahid Hussain Sayed is a current Pakistani Senator and Chairman of the Senate Defence Committee. A graduate of the Master of Science in Foreign Service (MSFS) program (Class of 1975), Senator Hussain Sayed has a distinguished career in the Pakistan public service as a four-time elected senator from the Islamabad Federal Capital. His public service career also includes positions as the Chairman of the Prime Minister’s Task Force on Central Asia (1992), Leader of Pakistan Delegation to UN Human Rights Commission in Geneva (1993), Special Assistant to Prime Minister (handling relations with U.S. & Central Asia) (1993), and Minister for Information, Culture & Tourism (1997-1999). He also served as Minister-in-Waiting to President Nelson Mandela, President Yasser Arafat, Prime Minister Atal Behari Vajpayee, President Fidel Ramos & President Muhammad Morsi during their visits to Pakistan. He has career experience in the journalism sector as well. He was the youngest editor at age 29 of The Muslim. He has contributed op-eds and articles to The New York Times, The Washington Post, the LA Times, National Interest, Jane’s Defence Weekly, Middle East International, Inter Press Service, The Times of India, and The Hindustan Times. He has published three works, including <em>Pakistan and the Changing Regional Scenario</em>, <em>Pakistan’s Politics: The Zia Years</em>, and <em>Governance in Pakistan</em>(co-author).",
  },
  "Na Risu": {
    tr: "Moğolistan Bilim ve Teknoloji Üniversitesi",
    en: "Mongolia University of Science and Technology",
    biographyTr: "Na Risu, 1986 yılında İç Moğolistan’ın başkenti Huhhot’ta doğmuştur. Na Risu, Moğolistan Bilim ve Teknoloji Üniversitesi’nde doktora öğrencisidir. Esas olarak, uluslararası limanların ekonomik araştırmalarıyla uğraşmaktadır.",
  },
  "Necati Demircan": {
    tr: "Şanghay Üniversitesi",
    en: "Shanghai University",
    email: "ndemircan11@hotmail.com",
    orcids: ["0000-0002-5319-9629"],
    biographyTr: "Necati Demircan, 1992 yılında Sakarya’da doğdu. 2017 yılında Sakarya Üniversitesi Uluslararası İlişkiler bölümünden mezun olmuştur. 2018-2021 yılları arasında Shanghai Üniversitesinde Uluslararası İlişkiler ve Diplomasi bölümünde yüksek lisans yapmıştır. Demircan, Shanghai Üniversitesi Küresel Çalışmalar bölümünde doktora öğrencisidir.",
    biographyEn: "Necati Demircan was born in 1992 in Sakarya. He graduated from Sakarya University, Department of International Relations, in 2017. Between 2018 and 2021, he completed his master’s degree in International Relations and Diplomacy at Shanghai University. Demircan is a PhD student in the Department of Global Studies at Shanghai University.",
  },
  "Orhan Aydın": {
    tr: "Karadeniz Teknik Üniversitesi",
    en: "Karadeniz Technical University",
    biographyTr: "Karadeniz Teknik Üniversitesi Makine Mühendisliği Termodinamik Anabilim Dalı öğretim üyelerinden olan Aydın, 2007 yılında profesör unvanını aldı. Yönetiminde 11 doktora ve 11 yüksek lisans tezi tamamlandı. Başta TÜBİTAK olmak üzere ulusal ve uluslararası destekli projelerde yürütücü, araştırmacı ve danışman olarak görev aldı. 1999-2001 ve 2003-2004 yılları arasında University of Michigan (Ann Arbor)’da doktora sonrası araştırmacı ve misafir öğretim üyesi olarak çalıştı. Prof. Dr. Aydın’ın, 140’ın üzerinde uluslararası saygın dergide yayınlanmış makalesi, uluslararası saygın bir yayınevi tarafından basılan bir kitap bölümü, çok sayıda yurtiçi ve yurtdışı bildirisi mevcuttur. Bu eserlerine bu zamana kadar 4700/7500 civarında (Web of Science/ Google Scholar) atıf yapılan Prof. Dr. Aydın’ın h-endeksi 41/49 (Web of Science/Google Scholar)’dır. Prof. Dr. Aydın, yaptığı çalışmalarla, ulusal ve uluslararası ödüllere layık görülmüştür: 2007 ODTÜ M.N. Parlar Vakfı Araştırma Teşvik Ödülü, 2008 TÜBA Üstün Başarılı Genç Bilim İnsanı Ödülü, 2008 TÜBİTAK Bilim Teşvik Ödülü ve 2009 yılında TWAS Asosiye Üyelik ödülü. Aydın, 2021 yılında Türkiye Bilimler Akademisi (TÜBA) Asli Üyeliğine seçilmiştir. Prof. Dr. Aydın’ın araştırma ilgisi, termodinamik, ısı ve kütle transferi, akışkanlar mekaniği, mikro-elektro-mekanik sistemlerde akış fiziği, akış kaynaması, biyolojik sistemlerde akış ve ısı geçişi, elektronik soğutma ve enerji depolama gibi alanlarda yoğunlaşmıştır. Prof. Dr. Orhan Aydın, YÖK Denetleme Kurulu Üyeliği (2016-2018), YÖK Kurum Danışmanlığı (2012-2016), Teknoloji Transfer Mekanizmaları Destekleme Grubu Yürütme Kurulu Üyeliği (2013-2016; 2020-2023), TÜBİTAK ULAKBİM Yönetim Kurulu Üyeliği (2022-), Türk Patent ve Marka Kurumu Danışma Kurulu Üyeliği ve Türkiye Yeterlilikler Çerçevesi Kurulu Üyeliği gibi görevlerde bulunmuştur. Eylül 2018 - Eylül 2024 tarihleri arasında Tarsus Üniversitesi Rektörlüğünü yürüttü. 14 Eylül 2024’te TÜBİTAK Başkanlığına atanmıştır.",
    biographyEn: "Prof. Aydın was a faculty member at Karadeniz Technical University, Department of Mechanical Engineering, Department of Thermodynamics, and was appointed as a professor in 2007. He has supervised 11 Ph.D. and 11 M.S. theses. He has worked as a manager, researcher and consultant in national and international funded projects, especially The Scientific and Technological Research Council of Türkiye (TÜBİTAK). Prof. Aydın worked as a post-doctoral researcher and guest lecturer at the University of Michigan (Ann Arbor) between 1999-2001 and 2003-2004. Prof. Aydın has published more than 140 articles in more than 140 internationally reputed journals, one book chapter published by an internationally reputed publisher and many national and international papers. Prof. Aydın’s h-index is 41/49 (Web of Science/Google Scholar) and these papers have been cited around 4700/7500 (Web of Science/Google Scholar). Prof. Aydın has received national and international awards for his work: METU M.N. Parlar Foundation Research Incentive Award in 2007, TUBA Outstanding Young Scientist Award in 2008, TÜBİTAK Science Incentive Award in 2008 and TWAS Associate Membership Award in 2009. Prof. Aydın was elected as a full member of the Turkish Academy of Sciences (TÜBA) in 2021. Prof. Aydın’s research interests are in the areas of thermodynamics, heat and mass transfer, fluid mechanics, flow physics in micro-electro-mechanical systems, flow boiling, flow and heat transfer in biological systems, electronic cooling and energy storage. Prof. Dr. Orhan Aydın has served as a member of the Higher Education Council Supervisory Board (2016-2018), Higher Education Council Institutional Advisor (2012-2016), TÜBİTAK TEYDEB Technology Centres Committee Member (2013-2016; 2020-2023), TÜBİTAK ULAKBİM Board Member (2022-), Turkish Patent and Trademark Office Advisory Board Member, and Turkey Qualifications Framework Board Member. He served as the Rector of Tarsus University between September 2018 and September 2024. Prof. Dr. Orhan Aydın has been appointed as the President of TÜBİTAK from September 14, 2024.",
  },
  "Osman Can Ünver": {
    tr: "İstinye Üniversitesi",
    en: "İstinye University",
    email: "osman.unver@istinye.edu.tr",
    orcids: ["0000-0002-1425-5739"],
    biographyTr: "Osman Can Ünver lisans/yüksek lisans (Ana dal: Siyaset Bilimi, Yan dallar: İletişim Bilimi ve Türkoloji) öğrenimi için Almanya’ya gitti ve 1981’de Münih Ludwig Maximilian Üniversitesi’nden Magister Artium unvanıyla mezun oldu. 2003 yılında Hacettepe Üniversitesi’nden doktora derecesini aldı. 1979-2007 yılları arasında Çalışma ve Sosyal Güvenlik Bakanlığı yurtdışı teşkilatı mensubu olarak Münih Başkonsolosluğu’nda Sosyal Asistan, Nürnberg ve Hamburg Başkonsolosluklarında Çalışma ve Sosyal Güvenlik Ataşesi, Berlin Büyükelçiliği’nde Çalışma ve Sosyal Güvenlik Müşaviri olarak görev yaptı. 1991-1993 yıllarında Başbakanlık Yurtdışı Vatandaşlar Müşavirliği’ne, 1998-1999 yıllarında Milli Güvenlik Kurulu Genel Sekreterliği’nde Genel Sekreter Müşavirliği’ne atanmıştır. Bakanlıkta Daire Başkanlığı, Genel Müdür Yardımcılığı ve Dış İlişkiler ve Yurtdışı İşçi Hizmetleri Genel Müdürlüğü görevlerinde bulunmuş ve Ekim 2007’de kamu görevinden emekli olmuştur. 2002 yılından bu yana çeşitli üniversitelerde (Bilkent, Hacettepe, Başkent, Ufuk, Milli Savunma Üniversiteleri) yarı zamanlı öğretim üyesi olarak ders ücreti karşılığında dersler vermiş, yurt içi ve yurt dışında çok sayıda konferans ve bilimsel etkinliğe aktif olarak katılmıştır. 2021’den beri İstinye Üniversitesi Uluslararası İlişkiler ve Siyaset Bilimi ve Kamu Yönetimi Bölümlerinde kadrolu profesör olarak görev yapmaktadır.",
    biographyEn: "Osman Can Ünver went to Germany for his undergraduate/graduate studies (Major: Political Science, Minors: Communication Science and Turkology) and graduated from Ludwig Maximilian University of Munich in 1981 with the title of Magister Artium. In 2003, he received his PhD degree from Hacettepe University. Between 1979 and 2007, he worked as a member of the overseas organization of the Ministry of Labor and Social Security as Social Assistant at the Consulate General in Munich, Labor and Social Security Attaché at the Consulates General in Nuremberg and Hamburg, and Labor and Social Security Counselor at the Embassy in Berlin. In 1991-1993, he was appointed as Advisor to the Prime Ministry for Citizens Abroad and in 1998-1999, he was appointed as Advisor to the Secretary General at the Secretariat General of the National Security Council. He served as Head of Department, Deputy Director General and Director General of Foreign Relations and Overseas Labor Services in the Ministry and retired from public service in October 2007. Since 2002, he has lectured as a part-time lecturer at various universities (Bilkent, Hacettepe, Başkent, Ufuk, National Defense Universities) in return for tuition fees and has actively participated in numerous conferences and scientific events in Türkiye and abroad. Since 2021, he has been working as a tenured professor at Istinye University, Department of International Relations.",
  },
  "Oğuz Giray": {
    tr: "Yeditepe Üniversitesi",
    en: "Yeditepe University",
    email: "oguzgiray65@gmail.com",
    orcids: ["0000-0002-0304-1516"],
    biographyTr: "Oğuz Giray 1965 yılında Ankara'da doğdu. Atatürk Üniversitesi İİBF İktisat bölümünde Lisans, Trakya Üniversitesi İktisat Ana Bilim Dalı’nda Yüksek Lisans, Yeditepe Üniversitesi Hukuk Fakültesi Kamu Hukukunda Yüksek Lisans ve Yeditepe Üniversitesi Siyaset Bilimi ve Uluslararası İlişkiler Bütünleşik Doktora programında eğitimlerini tamamladı. Yeditepe Üniversitesi İİBF Kamu Yönetimi Bölümü’nde Doktor Öğretim Görevlisi olarak ders vermektedir.",
    biographyEn: "Oğuz Giray was born in Ankara in 1965. He obtained a bachelor’s degree in economics from Atatürk University, a master’s degree in economics from Trakya University, a master’s degree in public law from Yeditepe University, and an integrated PhD in political science and international relations from Yeditepe University. He serves as an assistant lecturer in the Department of Public Administration at Yeditepe University.",
  },
  "Ramzy Baroud": {
    tr: "Gazeteci-Yazar, Filistin",
    en: "Journalist-Writer, Palestine",
    biographyTr: "Dr. Ramzy Baroud Palestine Chronicle’nin editörü ve 6 kitabın yazarı bir gazetecidir. Dr. Baroud, İngiltere’deki Exeter Üniversitesi'nden doktora sahibidir. Yayınlanan kitaplarından bazılarının başlıkları, “<em>Babam bir Özgürlük Savaşçısıydı</em>” ve “<em>Son Dünya</em>”dır. Baroud’un en son kitabı, Dr. Ilan Pappe ile birlikte yazdığı “<em>Bağımsızlık için Bizim Vizyonumuz: Filistin’in Önderleri ve Aydınları Konuşuyor</em>”. Baroud şu anda kıdemli Araştırma Uzmanı olarak İstanbul Zaim Üniversitesi İslam ve Küresel İlişkiler Merkezi’nde (CİGA) görev yapmaktadır.",
    biographyEn: "Dr. Ramzy Baroud is a syndicated columnist, the author of six books and the Editor of The Palestine Chronicle. Baroud has a PhD in Palestine Studies from the University of Exeter. His books include ‘<em>My Father was a Freedom Fighter</em>’ and ‘<em>The Last Earth</em>’. His latest book, co-edited with Professor Ilan Pappé, is ‘<em>Our Vision for Liberation: Engaged Palestinian Leaders and Intellectuals Speak Out</em>’. Baroud is currently a Non-resident Senior Research Fellow at the Center for Islam and Global Affairs (CIGA).",
  },
  "Salama Brahim El-Bachir": {
    tr: "Sahra İşçi Sendikaları (UGTSARIO)",
    en: "Sahrawi Trade Union (UGTSARIO)",
    orcids: ["0000-0002-3755-1135"],
    biographyTr: "Salama Brahim El-Bachir, şehir planlama ve geliştirme konusunda uzmanlaşmış bir devlet mühendisidir. Sahra Öğrenci ve Gençlik Hareketi’nde önemli bir liderlik pozisyonunda bulunmuştur. Uzun yıllar boyunca Polisario Cephesi’nin dış ilişkiler ofisinde görev yapmıştır. 2016 yılında Sahra Genel İşçi Sendikaları Konfederasyonu’nun Başkanı olarak seçilmiştir ve 2021’de yeniden seçilerek bu görevini sürdürmektedir. Kariyeri süresince çok sayıda işçi konferansı ve uluslararası seminere katılmıştır. Ayrıca Polisario Cephesi’nin önde gelen üyelerinden biri olarak bilinmektedir.",
    biographyEn: "Salama Brahim El-Bachir is a state engineer specializing in urban planning and development. He has served in a leadership role in the Sahra Student and Youth Movement. El-Bachir has a long history of working in the external relations office of the POLISARIO Front. In 2016, he was elected as the President of the Sahra General Workers’ Union, a position he was re-elected to in 2021. Throughout his career, he has participated in numerous worker conferences and international seminars. El-Bachir is recognized as one of the leading members of the Polisario Front.",
  },
  "Semih Güneri": {
    tr: "Dokuz Eylül Üniversitesi, Kafkasya ve Orta Asya Arkeoloji Araştırmaları Merkezi",
    en: "Dokuz Eylül University, Caucasia & Central Asia Archaeological Research Center",
    email: "semihguneri@mail.ru",
    orcids: ["0000-0002-9209-3800"],
    biographyTr: "S. Güneri, lisans eğitimini Ankara Üniversitesi Eskiçağ Dilleri ve Kültürleri Bölümü'nde 1983 yılında tamamladı. 1987 yılında Atatürk Üniversitesi Arkeoloji Bölümü'nde yüksek lisans yaptı. 1995 yılında Hacettepe Üniversitesi Arkeoloji Bölümü'nden doktora derecesini aldı. 2009-2019 yılları arasında Moğol Altay bölgesinde petroglif çalışmaları yaptı. Son beş yıldır, o ve öğrencileri, Doğu Asya ve Yakın Doğu arasındaki kültürel ilişkiler üzerinde çalışıyor.",
    biographyEn: "S. Güneri completed his bachelor's at Ankara University, Department of Ancient Languages and Cultures in 1983. In 1987, he had his master's degree at Atatürk University, Archaeology Department. In 1995, he received his doctorate from Archaeology Department at Hacettepe University. Between 2009 and 2019, he studied petroglyphs in the Mongolian Altai region. For the last five years, he and his students have been studying on the cultural relations between East Asia and Near East.",
  },
  "Shu Zhan": {
    tr: "Fuzhou Üniversitesi, Marksizm Okulu",
    en: "School of Marxism, Fuzhou University",
    email: "shuzhan915@163.com",
    orcids: ["0009-0005-4477-6585"],
    biographyTr: "Shu Zhan, Fuzhou Üniversitesi Akademik Komitesi üyesi, Marksizm Okulu Müdürü ve Fuzhou Üniversitesi’ndeki Fujian Eyaleti Sosyal Bilimler Araştırma Üssü Çin’e Özgü Sosyalizmin Yeni Dönemine İlişkin Xi Jinping Düşüncesi direktörüdür. Ağırlıklı olarak uluslararası politik ekonomi ve Çin Marksizm’i üzerine araştırmalar yapmaktadır. Çin Ulusal Sosyal Bilimler Vakfı’nın ondan fazla projesine, Eğitim Bakanlığı’nın Beşeri ve Sosyal Bilimler Projeleri ile il ve bölüm düzeyindeki projelere başkanlık etmiş ve bu projeleri tamamlamıştır. Marksist Çalışmalar ve Çağdaş Ekonomik Çalışmalar dergilerinde 90’dan fazla makale yayınlamıştır ve makalelerinin çoğu Çin Renmin Üniversitesi Sosyal Bilimler Bilgi Merkezi Dergisi tarafından yeniden basılmıştır.",
    biographyEn: "Shu Zhan is a member of the Academic Committee of Fuzhou University, the leader of the first-level disciplines in the School of Marxism, and the director of the “Research Center for Xi Jinping's Socialism Thought with Chinese Characteristics in the New Era” of the Fujian Provincial Social Science Research Base of Fuzhou University. She is mainly engaged in research on international political economy and Chinese Marxism. She has headed and completed more than ten projects of the National Social Science Foundation of China, Humanities and Social Sciences Projects of the Ministry of Education, and provincial and departmental projects. She has published more than 90 articles in Marxist Studies and Contemporary Economic Studies, and most of his articles have been reprinted by the Journal of the Social Science Information Center of Renmin University of China.",
  },
  "Veena Ramachandran": {
    tr: "Birla Teknoloji ve Bilim Enstitüsü, Pilani",
    en: "Birla Institute of Technology and Science, Pilani",
    biographyTr: "Dr. Veena Ramachandran, Birla Teknoloji ve Bilim Enstitüsü, Pilani, Hindistan’da Yardımcı Doçent olarak görev yapmaktadır. Kendisi Amit Kumar’ın doktora danışmanıdır.",
    biographyEn: "Dr. Veena Ramachandran is an Assistant Professor at Birla Institute of Technology and Science, Pilani, India. She is Amit Kumar's Ph.D. supervisor.",
  },
  "Wang Laixi": {
    tr: "İç Moğolistan Normal Üniversitesi",
    en: "Inner Mongolia Normal University",
    email: "wanglx1963@.163.com",
    biographyTr: "Wang Laixi, 1963 yılında doğmuştur. İç Moğolistan Normal Üniversitesi’nde profesör ve rektör yardımcısıdır. Ekonomi bölümünden mezun olan Prof. Wang, ekonomi tarihi alanında yüksek lisans, Çin’in etnik azınlıkları konusunda doktora danışmanlığı yapmaktadır. Etnik azınlıkların ve etnik bölgelerin ekonomisi üzerine araştırmaları bulunmaktadır.",
    biographyEn: "Wang Laixi, born in 1963, vice President and second-class professor of Inner Mongolia Normal University, graduated from Economics major, master’s supervisor of economic history major, doctoral supervisor of Chinese ethnic minorities major; Engaged in research on the economy of ethnic minorities and ethnic regions.",
  },
  "Wang Sanyi": {
    email: "sanyiw@163.com",
    biographyTr: "Wang Sanyi, Şanghay Üniversitesi Sosyal Bilimler Fakültesi Tarih Bölümü’nde profesör ve doktora öğrenci danışmanıdır. Aynı zamanda Şanghay Üniversitesi Türkiye Araştırmaları Merkezi’nde araştırmacıdır. Çin Modern Dünya Tarihi Derneği ve Çin Ortadoğu Araştırmaları Derneği üyesidir. Başlıca araştırma alanları Modern ve Çağdaş Dünya Tarihi, İmparatorluklar Tarihi ve Ortadoğu Tarihidir. <em>Geç Osmanlı İmparatorluğu Üzerine Araştırmalar (1792-1918)</em>, <em>İngiltere’nin Ortadoğu’daki Mandası Üzerine</em>, <em>Orta Doğu’da Endüstriyel Medeniyetin ve Ekonomik Geçişin Zorlukları (1809-1938)</em>, <em>Türkiye’nin Yolu</em> yayınladığı kitaplardan bazılarıdır.",
    biographyEn: "Wang Sanyi is a professor in the Department of History, College of Liberal Arts at Shanghai University and Ph.D. student supervisor. He is also a researcher at the Center for Turkish Studies at Shanghai University. He is a member of the Association of Modern History of the World in China and the Association of the Middle East Studies in China. His major research fields include Modern and Contemporary History of the World, History of Empires, and History of the Middle East. He has published several books such as <em>Research on the Late Ottoman Empire (1792-1918)</em>, <em>On Britain's Mandate over the Middle East</em>, <em>Challenges of the Industrial Civilization and Economic Transition in the Middle East (1809-1938)</em>, <em>The Road of Turkey</em>, and more.",
  },
  "Xiao Yongtao": {
    tr: "Yüksek lisans öğrencisi, Şanghay Üniversitesi Türkiye Araştırmaları Merkezi",
    en: "Master's student, Center for Turkish Studies at Shanghai University",
    email: "xiaoyt19@shu.edu.cn",
    orcids: ["0009-0004-8795-8322"],
    biographyTr: "Xiao Yongtao, Şanghay Türkiye Araştırmaları Merkezi’nde yüksek lisans öğrencisidir. Türkiye’nin Afrika politikası ile ilgili konular üzerinde çalışmaktadır.",
    biographyEn: "Xiao Yongtao is a master’s candidate at the Center for Turkish Studies of Shanghai University, and he focuses on Türkiye’s Africa policy and diasporas relative issues.",
  },
  "Xie Fang": {
    tr: "Şanghay Üniversitesi, Türkiye Araştırmaları Merkezi",
    en: "Center for Turkish Studies, Shanghai University",
    biographyTr: "Xie Fang, Liberal Sanatlar Koleji’nde Dünya Tarihi alanında yüksek lisans adayı ve Şanghay Üniversitesi Türkiye Araştırmaları Merkezi’nde araştırma görevlisidir. Araştırma alanları arasında Türkiye Cumhuriyeti’nin erken tarihi ve Türkiye-Yunanistan İlişkileri yer almaktadır.",
    biographyEn: "Xie Fang is a master’s candidate majoring in World History in the College of Liberal Arts and a research assistant of the Center for Turkish Studies at Shanghai University. Her research fields include the early history of Republic of Turkey and Turkey-Greece Relations.",
  },
  "Yi Shaoxuan": {
    tr: "Şanghay Üniversitesi",
    en: "Shanghai University",
    orcids: ["0009-0006-2550-3044"],
    biographyTr: "Yi Shaoxuan, Şangay Üniversitesi Liberal Sanatlar Fakültesi’nde Dünya Tarihi alanında doktora adayı ve Türkiye Araştırmaları Merkezi’nde araştırma görevlisidir.",
    biographyEn: "Yi Shaoxuan, a PhD candidate majoring in World History at the College of Liberal Arts and a research assistant at the Center for Turkish Studies at Shanghai University.",
  },
  "Yingqi Yang": {
    tr: "Fudan Üniversitesi, Uluslararası İlişkiler ve Kamu İşleri Okulu",
    en: "Fudan University, School of International Relations & Public Affairs",
    email: "yingqiyang23@m.fudan.edu.cn",
    orcids: ["0009-0007-7178-6652"],
    biographyTr: "Yingqi Yang, Fudan Üniversitesi Uluslararası İlişkiler ve Kamu İşleri Fakültesi’nde doktora öğrencisidir. Araştırma alanı, Ortadoğu iklim değişikliğinde büyük güçlerin söylem gücü rekabeti; ABD, AB ve Çin'in Ortadoğu'ya yönelik temiz enerji diplomasisidir.",
    biographyEn: "Yingqi Yang is a PhD candidate at the School of International Relations & Public Affairs at Fudan University.",
  },
  "Yu Haijie": {
    tr: "Şanghay Uluslararası Çalışmalar Enstitüleri, Batı Asya ve Afrika Araştırmaları Merkezi",
    en: "Shanghai Institutes for International Studies, Center for West Asian and African Studies",
    email: "yuhaijie@siis.org.cn",
    orcids: ["0009-0008-8778-136X"],
    biographyTr: "Şangay Uluslararası Çalışmalar Enstitüsü, Batı Asya ve Afrika Çalışmaları Merkezi’nde yardımcı araştırma görevlisidir. 2018 yılında, Şangay Uluslararası Çalışmalar Üniversitesi Ortadoğu Çalışmaları Enstitüsü’nde doktorasını tamamladı. Ocak 2019’dan Mart 2021’e kadar Fudan Kuşak ve Yol & Küresel Yönetişim Enstitüsü’nde doktora sonrası araştırmacı olarak çalıştı. Araştırma alanları Ortadoğu siyasi ekonomisi ve diplomasisi, Kuşak ve Yol Girişimi ve Ortadoğu, ve Türkiye çalışmalarıdır.",
    biographyEn: "Yu Haijie is an assistant research fellow at the Shanghai Institutes for International Studies, the Center for West Asian and African Studies. In 2018, she completed her doctorate at Shanghai International Studies University, the Middle East Studies Institute. From January 2019 to March 2021, she was a postdoctoral fellow at the Fudan Institute of Belt and Road & Global Governance. Her research fields include Middle East political economy and diplomacy, the Belt and Road Initiative and the Middle East, and Turkish studies.",
  },
  "Zakir Abidov": {
    email: "z8082926@yandex.ru",
    biographyTr: "Zakir Khalilovich Abidov 25 Ekim 1964’te Özbekistan’ın Taşkent şehrinde doğdu. Taşkent Ulaştırma Üniversitesi’nde okudu (1981-1986). 1986-1988 yılları arasında silahlı kuvvetlerde görev yaptı. Glav Tashkent Stroy Şirketi’nde çalıştı (1988-1990). 1990’dan 1996’ya kadar Özbekistan Cumhuriyeti Dışişleri Bakanlığı’nda, 1996-1998 arasında Özbekistan Cumhuriyeti İstanbul Başkonsolosluğu’nda görev yaptı. 1998’den 2017’ye kadar Dostluk Dernekleri ve Yabancı Ülkelerle Kültürel ve Eğitim İlişkileri Konseyi’nde Sekreterya Başkanı ve Başkan Yardımcısı görevini yürüttü. 2017 yılından bu yana Özbekistan Cumhuriyeti Etnik Gruplar Arası İlişkiler ve Yabancı Ülkelerle Dostane İlişkiler Komitesi bünyesinde Uluslararası İlişkiler Dairesi Başkanı olarak görev yapmaktadır.",
    biographyEn: "Zakir Khalilovich Abidov was born on October 25, 1964, in Tashkent, Uzbekistan. He studied at the Tashkent University of Transport (1981-1986). From 1986 to 1988, he served in the armed forces. He worked at Glav Tashkent Stroy Company (1988-1990). From 1990 to 1996, he served in the Ministry of Foreign Affairs of the Republic of Uzbekistan, and from 1996 to 1998, he served in the Consulate General of the Republic of Uzbekistan in Istanbul. From 1998 to 2017, he served as Head of the Secretariat and Deputy Chairman of the Council for Cultural and Educational Relations with Friendship Associations and Foreign Countries. Since 2017, he has been the Head of the Department of International Relations at the Committee on Interethnic Relations and Friendly Relations with Foreign Countries of the Republic of Uzbekistan.",
  },
  "Zhang Jieying": {
    tr: "Fudan Üniversitesi, Uluslararası İlişkiler ve Kamu İşleri Okulu",
    en: "Fudan University, School of International Relations & Public Affairs",
    biographyTr: "Zhang Jieying Şanghay’da bulunan Fudan Üniversitesi Uluslararası İlişkiler ve Kamusal İşler Okulu’nda doktora adayıdır. Ortadoğu’daki Su Politikaları üzerine çalışmaktadır.",
    biographyEn: "Zhang Jieying is a PhD Candidate at the School of International Relations & Public Affairs, Fudan University, Shanghai, China. Her research interest is Hydro Politics in the Middle East.",
  },
  "Zhang Lili": {
    tr: "Shaanxi Normal Üniversitesi Genel Yayınevi",
    en: "General Publishing House Co. Ltd., Shaanxi Normal University",
    biographyTr: "Zhang Lili, yüksek lisans mezunu, Shaanxi Normal Üniversitesinin yayınevinde Genel Yayın Yönetmen Yardımcısıdır. Zhang, Xi'an'daki Şiir, Kaligraﬁ ve Resim Araştırma Derneği'nin konsey üyesidir.",
  },
  "Zhang Qingyi": {
    tr: "Siyaset Bilimi Bölümü, Şanghay Üniversitesi",
    en: "Department of Political Science, Shanghai University",
    orcids: ["0009-0000-8505-0741"],
    biographyTr: "Zhang Qingyi, Şanghay Üniversitesi Liberal Sanatlar Fakültesi’nde Siyaset Bilimi alanında yüksek lisans yapmakta ve aynı zamanda Şanghay Üniversitesi Küresel Çalışmalar Enstitüsü’nde araştırma görevlisi olarak çalışmaktadır. Akıcı bir şekilde Endonezce konuşmakta ve araştırma alanları arasında Endonezya dışpolitikası ve Güneydoğu Asya çalışmaları yer almaktadır.",
    biographyEn: "Zhang Qingyi is currently pursuing a master’s degree in political science within the College of Liberal Arts while also working as a research assistant at the Institute of Global Studies at Shanghai University. She is fluent in Indonesian, and her research interests include Indonesian foreign policy and Southeast Asian studies.",
  },
  "Zhao Changfeng": {
    tr: "Central China Normal University",
    en: "Central China Normal University",
    biographyTr: "Zhao Changfeng, Orta Çin Normal Üniversitesi’nde Profesördür. Siyaset Bilimi ve Uluslararası Çalışmalar Okulu'nda (SPIS) Uluslararası Siyaset Bölümü Başkanıdır.",
    biographyEn: "Zhao Changfeng is a Professor at Central China Normal University and the Director of the Department of International Politics, School of Politics and International Studies (SPIS), in Wuhan, Hubei, China.",
  },
  "Önder Çaynak": {
    tr: "İnşaat Mühendisi, Üst Düzey Şirket Yöneticisi, Dakar - Senegal",
    en: "Civil Engineer, Senior Company Manager - Dakar, Senegal",
    email: "ondercaynak@yandex.com",
    orcids: ["0009-0003-6180-2541"],
    biographyTr: "Önder Çaynak 1979 yılında İzmir’de doğdu. İlk, orta ve lise öğrenimini İzmir'de tamamladıktan sonra KKTC Doğu Akdeniz Üniversitesi İngilizce İnşaat Mühendisliği bölümünden 2003 yılında mezun oldu. 2004-2007 yılları arasında Rusya’da inşaat sektöründe çalıştıktan sonra Türkiye’ye döndü. Çeşitli firmalarda farklı görevlerde yer aldı. 2010-2013 yılları arasında Cezayir’de çalıştı. Daha sonra 2013 yılında Türkiye’ye dönüp kendi inşaat firmasında çeşitli projeler gerçekleştirdi. Kovid-19 salgını sırasında, 2020 yılında tekrar Afrika-Senegal’de bir inşaat firmasının ülke temsilcisi olarak çalışmaya başladı. Moritanya’dan Tunus’a kadar birçok Afrika ülkesinde ihale ve proje süreçlerinde yer aldı. Halen bu bölgede altyapı projeleri, maden ve enerji başta olmak üzere pazar araştırması ve iş geliştirme konusunda çalışmaktadır.",
    biographyEn: "Önder Çaynak was born in 1979 in Izmir. After completing his primary, secondary and high school education in Izmir, he graduated from Eastern Mediterranean University, Department of Civil Engineering in English in 2003. After working in the construction sector in Russia between 2004-2007, he returned to Türkiye. He worked in different positions in various companies. He worked in Algeria between 2010-2013. Then he returned to Türkiye in 2013 and realized various projects with him own construction company. During the Covid-19 pandemic, he started working as a country representative of a construction company in Africa-Senegal in 2020. He took part in tender and project processes in many African countries from Mauritania to Tunisia. He is currently working on market research and business development in this region, especially in infrastructure projects, mineral and energy.",
  },
  "İ. Engin Türe": {
    tr: "MEF Üniversitesi",
    en: "MEF University",
    email: "enginture@gmail.com",
    orcids: ["0000-0002-6570-1882"],
    biographyTr: "Türe, burada kurucu olarak beş yıl görev yaptı. TÜBİTAK-MAM Yılın Personeli ve Proje Başarı Ödülleri aldı. 1998 yılında profesör olarak atandığı Mimar Sinan Üniversitesi’nde Fizik Bölümü Başkanı olarak görev yaparken Yeditepe ve Haliç üniversitelerinde de dersler verdi. 2005 yılında Birleşmiş Milletler Uluslararası Hidrojen Teknolojileri Merkezinde önce başkan yardımcısı daha sonra 2008 yılına kadar başkanlık yaptı. 2008 yılında Haliç Üniversitesi Rektörlüğüne atanan Prof. Dr. Türe 2010 yılına kadar bu görevi sürdürdü. Aynı yıl Arentek Enerji ve Teknoloji şirketini kurdu ve birçok şirkete danışmanlık yaptı. 2017 yılından beri MEF Üniversitesi öğretim üyeliği görevini sürdüren Prof. Türe, Temiz Enerji Vakfı kurucusu ve eski başkanı olarak da çalışmalar yapmaktadır. Prof. Türe’nin çoğunluğu uluslararası dergilerde olmak üzere 50’dan fazla yayını bulunmakta olup, bu yayınlarına 600 kadar atıf yapılmıştır. Prof. Türe bugüne kadar aralarında, Japonya, Çin, ABD, İngiltere, Fransa, İtalya, Norveç gibi ülkelerin de bulunduğu 30 kadar ülkede davetli konuşmacı olarak 40’dan fazla konferans vermiş ve birçok uluslararası toplantılara başkanlık yapmıştır.",
    biographyEn: "Türe was appointed as the Head of Energy Systems Department at TUBITAK Marmara Research Center in 1992 and served as a founder there for five years. He received TÜBİTAK-MAM The Personnel of the Year and Project Achievement Awards. While working as the Head of the Physics Department at Mimar Sinan University, where he was appointed as a professor in 1998, he gave lectures also at Yeditepe and Haliç Universities for 4.5 years. In 2005, he first served as vice-president and then chairman until 2008 at the United Nations International Center for Hydrogen Technologies. Prof. Dr. Türe who was appointed as the Rector of Haliç University in 2008 maintained this position until 2010. In the same year, he founded Arentek Energy and Technology Company and provided consultancy to many companies. Prof. Türe who is continuing his duty as a lecturer at MEF University since 2017, is also carrying out work as the founder and former president of the Clean Energy Foundation. Prof. Türe has more than 50 publications, mostly in international journals, and his publications have been cited 600. Prof. Türe has given more than 40 conferences as a guest speaker in 30 countries including Japan, China, the USA, England, France, Italy, and Norway, and chaired many international meetings until today.",
  },
  "İbrahim Semih Akçomak": {
    tr: "Orta Doğu Teknik Üniversitesi",
    en: "Middle East Technical University",
    biographyTr: "Lisans ve Yüksek Lisans eğitimini Ortadoğu Teknik Üniversitesi (ODTÜ) İktisat bölümünde tamamlayan Dr. İbrahim Semih Akçomak, doktora çalışmasını sosyal sermaye, yenilik ve ekonomik büyüme üzerine 2009 yılında Maastricht Üniversitesi’nde tamamlamıştır. Daha sonra Hollanda Planlama Teşkilatı’nda (Centraal PlanBureau) Uluslararası İktisat bölümünde iki yıl süreyle görev yapmıştır. 2012 yılından itibaren ODTÜ, Bilim ve Teknoloji Politikası Çalışmaları anabilim dalında öğretim üyesi olarak görev yapan Akçomak’ın Economic Journal, European Economic Review, Regional Science and Urban Economics, ve Industrial and Corporate Change gibi akademik dergilerde makaleleri yayınlanmıştır. AB Çerçeve Programları projeleri başta olmak üzere uluslararası ve ulusal pek çok projede görev almıştır. Akçomak aynı zamanda Bilim ve Teknoloji Politikaları Araştırma Merkezi (TEKPOL) müdürlüğü görevini yürütmektedir. Akçomak, 2014-2018 yılları arasında Uluslararası Schumpeter Cemiyeti’nde (International Schumpeter Society) Yönetim Kurulu Üyesi olarak görev yapmıştır.",
    biographyEn: "Dr. İbrahim Semih Akçomak obtained his undergraduate and master’s degrees from the Economics Department at METU and completed his doctoral studies on social capital, innovation, and economic growth at Maastricht University in 2009. Subsequently, he was employed for two years in the International Economics division of the Netherlands Bureau for Economic Policy Analysis (Centraal PlanBureau). Since 2012, Akçomak has been a faculty member in the Department of Science and Technology Policy Studies at METU and has published articles in esteemed academic journals, including the Economic Journal, European Economic Review, Regional Science and Urban Economics, and Industrial and Corporate Change. He has participated in numerous international and national projects, notably those associated with the EU Framework Programme. Akçomak additionally holds the position of director of the Science and Technology Policies Research Center (TEKPOL). Akçomak was a Board Member of the International Schumpeter Society from 2014 to 2018.",
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
  "Pinar Gokcin Ozuyar": "Pınar Gökçin Özuyar",
  "Esra Bayhantopcu": "Esra Bayhantopçu",
  "Sadik Ucok": "Sadık Üçok",
  "Askin Ayrancioglu": "Aşkın Ayrancıoğlu",
  "Ibrahim Balaban": "İbrahim Balaban",
  "Huseyin Haydar": "Hüseyin Haydar",
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
