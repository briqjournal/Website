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
  biographyTr?: string;
  biographyEn?: string;
};

const genericBylines = new Set(["admin", "briq", "briqjournal"]);

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
    tr: "Fudan Üniversitesi, Uluslararası Araştırmalar Enstitüsü, Şanghay, Çin",
    en: "Institute of International Studies, Fudan University, Shanghai, China",
    email: "sundegang@fudan.edu.cn",
    orcids: ["0009-0003-3418-8558"],
    institutionUrl: "https://iis.fudan.edu.cn/",
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
    tr: "Kapadokya Üniversitesi, Siyaset Bilimi ve Uluslararası İlişkiler Bölümü, Türkiye",
    en: "Department of Political Science and International Relations, Cappadocia University, Türkiye",
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
};

const displayCorrections: Record<string, string> = {
  "Barış Adıbellİ": "Barış Adıbelli",
  "Mevlânâ Celâleddİn Rûmî": "Mevlânâ Celâleddin Rûmî",
};

function withoutAcademicTitle(value: string) {
  let name = value.trim();
  const prefixes = [
    /^Assoc\.?\s+Prof\.?\s+Dr\.?\s*/iu,
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
        termTr: "2026–Günümüz",
        termEn: "2026–Present",
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
        ? `${profile.name} için kayıtlı güncel mesleki veya kurumsal bilgi: ${profile.affiliationTr}. BRIQ bünyesindeki güncel görevi: ${profile.briqAppointments.map((item) => item.roleTr).join(" · ")}.`
        : ""),
      biographyEn: profile.biographyEn || (profile.briqAppointments.length
        ? `${profile.name}’s current professional or institutional information is recorded as ${profile.affiliationEn}. Current role at BRIQ: ${profile.briqAppointments.map((item) => item.roleEn).join(" · ")}.`
        : ""),
      articles: profile.articles.sort(
        (a, b) => b.volume - a.volume || b.issue - a.issue || a.title_tr.localeCompare(b.title_tr, "tr"),
      ),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "tr"));
})();

export function findAuthorProfile(id: string) {
  return authorProfiles.find((profile) => profile.id === id);
}
