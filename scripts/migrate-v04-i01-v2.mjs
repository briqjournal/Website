import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { extname, join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const issuePdfTr = join(root, "tmp/v04-i01-source/tr.pdf");
if (!existsSync(issuePdfTr)) throw new Error("Missing official Turkish issue PDF");

const records = [
  {
    slug: "dogu-akdenizdeki-son-gelismeler-isiginda-kuzey-kibris-turk-cumhuriyetinin-taninmasinin-gerekliligi",
    startPage: 2,
    start: { en: "INTRODUCTION", tr: "Giriş" },
    strictFixedHeadings: true,
    fixedHeadings: {
      en: ["INTRODUCTION","The Cyprus Negotiation Process and the Solution Based on the Existence of Two Equal Sovereign States","The Importance of the TRNC in the Eastern Mediterranean","The necessity of Recognition of TRNC","Conclusion"],
      tr: ["Giriş","Kıbrıs Müzakere Süreci ve Egemen Eşit İki Devletin Varlığına Dayalı Çözüm","KKTC’nin Doğu Akdeniz’deki Önemi","KKTC’nin Tanınmasının Gerekliliği","Sonuç"],
    },
    figures: 2,
    captions: {
      en: [
        "Geographical location of the Turkish Republic of Northern Cyprus (BRIQ, 2022).",
        "President Erdoğan welcomed President Ersin Tatar with an official ceremony (October 26, 2020). (Website of the Presidency of the Turkish Republic of Northern Cyprus, 2020).",
      ],
      tr: [
        "Kuzey Kıbrıs Türk Cumhuriyeti’nin Coğrafi Konumu (BRIQ, 2022).",
        "Türkiye Cumhurbaşkanı Erdoğan, Cumhurbaşkanı Ersin Tatar’ı resmi törenle karşılıyor (26 Ekim 2020). (Kuzey Kıbrıs Türk Cumhuriyeti Cumhurbaşkanlığı Web Sitesi, 2020).",
      ],
    },
  },
  {
    slug: "abdnin-cevrelemeye-calistigi-turkiye-rusya-ve-cin-isbirligi-yapmali",
    startPage: 2,
    autoStart: true,
    interview: true,
    figures: 2,
    captions: {
      en: [
        "Retired Brigadier General Assoc. Prof. Fahri Erenel (right), BRIQ Managing Editor Onurcan Balcı (left). (BRIQ, 2022).",
        "The location of the Northern European countries mentioned in the interview. (BRIQ, 2022).",
      ],
      tr: [
        "Emekli Tuğgeneral Doç. Dr. Fahri Erenel (sağda), BRIQ Yazıişleri Müdürü Onurcan Balcı (solda). (BRIQ, 2022).",
        "Röportajda bahsi geçen Kuzey Avrupa ülkelerinin konumu. (BRIQ, 2022).",
      ],
    },
  },
  {
    slug: "yunanistandaki-abd-yiginagi-hem-turkiyeyi-hem-de-rusyayi-hedef-aliyor",
    startPage: 2,
    autoStart: true,
    interview: true,
    figures: 2,
    captions: {
      en: [
        "President Recep Tayyip Erdoğan met with Russian President Vladimir Putin in Astana, Kazakhstan, on October 13, 2022. (Official Website of the Presidency of the Republic of Türkiye, 2022).",
        "The SCO summit took place in Samarkand, Uzbekistan, on September 16. (Li Tao/Xinhua, 2022).",
      ],
      tr: [
        "Cumhurbaşkanı Recep Tayyip Erdoğan, Kazakistan’ın başkenti Astana’da Rusya Devlet Başkanı Vladimir Putin ile görüştü (13 Ekim 2022). (Türkiye Cumhuriyeti Cumhurbaşkanlığı Resmi Web Sitesi, 2022).",
        "ŞİÖ zirvesi 16 Eylül’de Özbekistan’ın Semerkant şehrinde gerçekleşti. (Li Tao/Xinhua, 2022).",
      ],
    },
  },
  {
    slug: "cinin-dogu-akdenizde-cozum-onerisi-kalkinmaci-baris-yaklasimi",
    startPage: 2,
    start: { en: "Introduction", tr: "Giriş" },
    strictFixedHeadings: true,
    fixedHeadings: {
      en: ["Introduction","Democracy vis-à-vis Development: China’s “Developmental Peace” Proposal","China’s “Developmental Peace” Proposal in the Middle East","China’s “Developmental Peace” Proposal in Syria","China’s “Developmental Peace” Proposal in the Palestinian-Israeli Conflict","China’s “Developmental Peace” Proposal in Lebanon","Eastern Mediterranean and China’s “Developmental Peace” Proposal in Prospect","Conclusion"],
      tr: ["Giriş","Demokrasi Yerine Kalkınma: Çin’in “Kalkınmacı Barış” Önerisi","Çin’in Ortadoğu’da “Kalkınmacı Barış” Önerisi","Çin’in Suriye’deki “Kalkınmacı Barış” Politikası","Çin’in Filistin-İsrail Çatışmasında “Kalkınmacı Barış” Politikası","Çin’in Lübnan’da “Kalkınmacı Barış” Politikası","Doğu Akdeniz ve Çin’in “Kalkınmacı Barış” Politikasının Geleceği","Sonuç"],
    },
    figures: 0,
  },
  {
    slug: "turkiye-misir-ve-yunanistanin-savunma-harcamalari-denklemi-uzerinden-karaman-denizi-dogu-akdeniz",
    startPage: 2,
    startContains: {
      en: "An Introduction to the Unique Geopolitics",
      tr: "Adalar (Ege) Denizi ve",
    },
    strictFixedHeadings: true,
    fixedHeadings: {
      en: ["An Introduction to the Unique Geopolitics of the Islands Sea and the Karaman Sea","The Geopolitical Break in the Defense Industry in the Islands Sea and Karaman Sea Caused by the Unstoppable Rise of \"Türkiye\"","Turkish-Greek Relations in the Islands Sea and the Karaman Sea That Cannot Establish Their Balance","Historical Foundations of Turkish-Greek Relations","Greece’s Capacity to Face Military Tensions That Might Evolve and Turn into a War","Possible Effects of USA and Israel on Turkish-Greek Tension","Possible Effects of France on Turkish-Greek Tension","Possible Effects of Egypt on Turkish-Greek Tension","Non-Combat Options","International Court of Justice (ICJ)","1988 Athens Consensus","1936 Montreux Straits Convention","Conclusion"],
      tr: ["Adalar (Ege) Denizi ve Karaman Denizi’nin (Doğu Akdeniz) Sunduğu Eşsiz Jeopolitiğe Giriş","Savunma Endüstrisinde “Türkiye”nin Önlenemez Yükselişinin Adalar Denizi ve Karaman Denizi’nde Yol Açtığı Jeopolitik Kırılma","Dengelerini Kuramayan Adalar Denizi ve Karaman Denizi’nde Türk-Yunan İlişkileri","Türk-Yunan İlişkilerinin Tarihsel Temelleri","Yunanistan’ın Tırmanabilecek ve Bir Savaşa Dönüşebilecek Askerî Gerginlikleri Göğüsleyebilme Kapasitesi","ABD ve İsrail’in Türk-Yunan Gerginliğine Olası Etkileri","Fransa’nın Türk-Yunan Gerginliğine Olası Etkileri","Mısır’ın Türk-Yunan Gerginliğine Olası Etkileri","Savaş Dışı Seçenekler","Uluslararası Adalet Divanı","1988 Atina Mutabakatı","1936 Montrö Boğazlar Sözleşmesi","Sonuç ve Değerlendirme"],
    },
    figures: 2,
    captions: {
      en: ["World Maritime Trade Routes Density Map. (MarineTraffic, 2020).","The prototype of the Turkish Fighter developed by TAI was shared for the first time on 23 November 2022. Turkish Fighter is planned to leave the hangar next year. (Turkish Defence News, 2022)."],
      tr: ["Dünya Deniz Ticareti Rotaları Yoğunluk Haritası. (MarineTraffic, 2020).","TUSAŞ tarafından geliştirilen Milli Muharip Uçak’ın prototipi, 23 Kasım 2022’de ilk kez paylaşıldı. Milli Muharip Uçak’ın gelecek yıl hangardan çıkış yapması planlanıyor. (Savunma Sanayi ST, 2022)."],
    },
  },
  {
    slug: "dogu-akdenizde-cin-varligi-suriye-ornegi",
    startPage: 2,
    start: { en: "Introduction" },
    startContains: { tr: "REFORM VE DIŞA AÇILMA" },
    startAsParagraph: { tr: true },
    strictFixedHeadings: true,
    fixedHeadings: {
      en: ["Introduction","The Geostrategic Importance of Syria","Background on China-Syria Relations","China’s Position on the Syrian Crisis","Chinese Initiatives to Resolve the Syrian Crisis","Analysis of the Belt and Road Initiative in the WENA Region","Syria: A Strategic Partner for China","Recommendations","Conclusion"],
      tr: ["Suriye’nin Jeostratejik Önemi","Çin-Suriye İlişkilerinin Arka Planı","Çin’in Suriye Krizindeki Konumu","Çin’in Suriye Krizini Çözme Girişimleri","BAKA Bölgesindeki Kuşak ve Yol Girişiminin Analizi","Suriye: Çin için Stratejik Bir Partner","Öneriler","Sonuç"],
    },
    figures: 4,
    captions: {
      en: ["Syria’s geographical position connects the continents of Asia, Europe and Africa in the World Land-Bridge. (Schiller Institute, 2016).","A sign of the China-Egypt Suez Economic and Trade Cooperation Zone, located some 120 km to the east of Cairo near the Suez Canal, Egypt. (Xinhua Net, 2019).","Gas and oil pipelines around the region. (FracTracker, n.d.).","Head of Syria’s Planning and International Cooperation Commission Imad Sabouni shakes hands with Chinese Ambassador to Syria Feng Biao after signing an economic cooperation agreement in Damascus, Syria, on March 4, 2020. (Ammar Safarjalani/Xinhua, 2020)."],
      tr: ["Suriye Asya, Avrupa ve Afrika kıtalarını birbirine bağlar. (Schiller Institute, 2016).","Mısır’ın Süveyş Kanalı yakınında Kahire’nin yaklaşık 120 km doğusunda bulunan Çin-Mısır Süveyş Ekonomik ve Ticari İşbirliği Bölgesi’nin tabelası. (Xinhua Net, 2019).","Bölgedeki petrol ve doğal gaz hatları. (FracTracker, t.y.).","Suriye Planlama ve Uluslararası İşbirliği Komisyonu (PICC) Başkanı Imad Sabouni, 4 Mart 2020’de Suriye’nin Şam kentinde ekonomik işbirliği anlaşması imzaladıktan sonra Çin’in Suriye Büyükelçisi Feng Biao ile el sıkışıyor. (Ammar Safarjalani/Xinhua, 2020)."],
    },
  },
  {
    slug: "kusak-ve-yol-girisimi-bolgesellesme-ve-kuresellesme-icin-yeni-itici-guc",
    startPage: 1,
    startContains: { en: "THE BELT AND ROAD INITIATIVE", tr: "KUŞAK VE YOL GİRİŞİMİ" },
    strictFixedHeadings: true,
    fixedHeadings: {
      en: ["How Does the BRI Move Towards Epochal Regionalization?","How Will the New Regionalization Promoted by the BRI Affect Globalization?","Can the BRI Provide Sustainable Public Goods?"],
      tr: ["KYG Çağsal Bölgeselleşmeye Doğru Nasıl İlerliyor?","KYG’nin Teşvik Ettiği Yeni Bölgeselleşme Küreselleşmeyi Nasıl Etkileyecek?","KYG Sürdürülebilir Kamusal Mallar Sağlayabilir Mi?"],
    },
    figures: 1,
    captions: {
      en: ["Chen, X. (2021). The Belt and Road Initiative as Epochal Regionalisation. London: Routledge."],
      tr: ["Chen, X. (2021). The Belt and Road Initiative as Epochal Regionalisation. London: Routledge."],
    },
  },
];

const visualRecords = [
  { slug: "sessiz-isik", probes: ["Sessiz Işık","A. Kadir Ekinci"], title: { en: "The Silent Light", tr: "Sessiz Işık" } },
  { slug: "mavi-vatan", probes: ["Mavi Vatan","Muharrem Pire"], title: { en: "Blue Homeland", tr: "Mavi Vatan" } },
  { slug: "silahlarin-kulturu", probes: ["Silahların Kültürü","Luo Jie"], title: { en: "The Culture of Guns", tr: "Silahların Kültürü" } },
];

function sh(cmd,args,opts={}) {
  return execFileSync(cmd,args,{encoding:"utf8",maxBuffer:64*1024*1024,...opts});
}
function download(url,dest) {
  mkdirSync(resolve(dest,".."),{recursive:true});
  execFileSync("curl",["-L","--fail","--retry","4","--retry-delay","2",url,"-o",dest],{stdio:"ignore"});
}
function decodeEntities(value) {
  return value.replace(/<br\s*\/?\s*>/gi," ").replace(/<[^>]+>/g,"")
    .replace(/&#(\d+);/g,(_,c)=>String.fromCodePoint(Number(c)))
    .replace(/&#x([\da-f]+);/gi,(_,c)=>String.fromCodePoint(Number.parseInt(c,16)))
    .replaceAll("&amp;","&").replaceAll("&quot;",'"').replaceAll("&apos;","'")
    .replaceAll("&lt;","<").replaceAll("&gt;",">").replace(/\s+/g," ").trim();
}
function parseXml(xml) {
  const fonts=new Map(),pages=[];
  for(const m of xml.matchAll(/<fontspec\b[^>]*id="(\d+)"[^>]*size="([\d.]+)"[^>]*family="([^"]*)"[^>]*color="([^"]*)"\s*\/>/g))
    fonts.set(m[1],{size:Number(m[2]),family:m[3],color:m[4]});
  for(const pm of xml.matchAll(/<page\b[^>]*number="(\d+)"[^>]*>([\s\S]*?)<\/page>/g)){
    const nodes=[];
    for(const m of pm[2].matchAll(/<text\b[^>]*top="([\d.]+)"[^>]*left="([\d.]+)"[^>]*width="([\d.]+)"[^>]*height="([\d.]+)"[^>]*font="(\d+)"[^>]*>([\s\S]*?)<\/text>/g)){
      const text=decodeEntities(m[6]); if(!text) continue;
      nodes.push({page:Number(pm[1]),top:Number(m[1]),left:Number(m[2]),width:Number(m[3]),height:Number(m[4]),font:fonts.get(m[5])||{size:0,family:"",color:""},text,bold:/<(?:b|strong)>/i.test(m[6])});
    }
    pages.push({number:Number(pm[1]),nodes});
  }
  return pages;
}
function joinText(a,b){ return /[-‐‑]$/u.test(a)&&/^[a-zçğıöşü]/u.test(b)?a.slice(0,-1)+b:a+" "+b; }
function isNoise(n){
  if(n.top<90||n.top>1065) return true;
  if(/^\d{1,4}$/.test(n.text)||/^B\s*R\s*I\s*[Qq]/.test(n.text)) return true;
  if(/^(RÖPORTAJ|INTERVIEW|KİTAP İNCELEME|BOOK REVIEW)$/i.test(n.text)) return true;
  if(/Gotham|Bebas/i.test(n.font.family)) return true;
  return false;
}
function fixedHeadingMatch(text,list=[]){
  const norm=s=>s.toLocaleLowerCase("en-US").replace(/[^\p{L}\p{N}]+/gu," ").trim();
  const t=norm(text);
  return list.find(x=>{const f=norm(x);return t===f||f.startsWith(t+" ")||f.includes(" "+t+" ")||f.endsWith(" "+t);});
}
function genericHeading(n){
  if(/^(Giriş|GİRİŞ|Introduction|INTRODUCTION|Sonuç|SONUÇ|Conclusion|CONCLUSION|Conclusions|Kaynakça|KAYNAKÇA|References|REFERENCES|Notlar|NOTLAR|Notes|NOTES|Teşekkür|TEŞEKKÜR|Acknowledg(?:e)?ments?)$/i.test(n.text)) return true;
  if(n.text.length>150||/[.;:]$/.test(n.text)) return false;
  if(n.font.size<14.5||n.font.size>21) return false;
  const c=n.font.color.match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  if(c){const a=c.slice(1).map(x=>Number.parseInt(x,16));if(Math.max(...a)>80&&Math.max(...a)-Math.min(...a)>35)return true;}
  return n.bold&&n.text.split(/\s+/).length<=18;
}
function isCaptionStart(text){
  return /^(?:Tablo|Table|Şekil|Figure)\s*\d+\s*[:.]/iu.test(text)
    || /^(?:World Maritime Trade Routes Density Map|Dünya Deniz Ticareti Rotaları Yoğunluk Haritası|Geographical location of the Turkish Republic|Kuzey Kıbrıs Türk Cumhuriyeti’nin Coğrafi Konumu)/iu.test(text);
}
function matchesStart(record,locale,text){
  if(record.start?.[locale]===text) return true;
  if((record.startAlternatives?.[locale]||[]).includes(text)) return true;
  return !!record.startContains?.[locale]&&text.includes(record.startContains[locale]);
}
function extractBlocks(pages,record,locale){
  const blocks=[],captions=[]; let paragraph="",heading="",started=!!record.autoStart,mode="body",captionTail=false;
  const flushP=()=>{const v=paragraph.replace(/\s+/g," ").trim();if(v.length>1)blocks.push({kind:"paragraph",text:v});paragraph="";};
  const flushH=()=>{const v=heading.replace(/\s+/g," ").trim();if(v)blocks.push({kind:"heading",text:v});heading="";};
  for(const page of pages.filter(p=>p.number>=record.startPage)){
    for(const n of page.nodes){
      if(isNoise(n)) continue;
      if(captionTail&&n.font.size<=18){captions[captions.length-1]=joinText(captions[captions.length-1],n.text);captionTail=false;continue;}
      if(isCaptionStart(n.text)){flushP();captions.push(n.text);captionTail=true;continue;}
      if(!started){if(matchesStart(record,locale,n.text)){started=true;if(record.startAsParagraph?.[locale]){paragraph=n.text;continue;}}else continue;}
      if(/^(ÖZ|ABSTRACT|SUMMARY|ANAHTAR KELİMELER|KEYWORDS)$/iu.test(n.text)){
        continue;
      }
      const fixed=fixedHeadingMatch(n.text,record.fixedHeadings?.[locale]);
      const fixedStyled=fixed&&(n.bold||n.font.size>=14.5)?fixed:null;
      const h=fixedStyled||(!record.strictFixedHeadings&&genericHeading(n));
      if(h){
        flushP();
        const candidate=fixedStyled||n.text;
        heading=heading?(heading===candidate?heading:joinText(heading,candidate)):candidate;
        if(/^(Kaynakça|KAYNAKÇA|References|REFERENCES)$/i.test(candidate))mode="references";
        else if(/^(Notlar|NOTLAR|Notes|NOTES)$/i.test(candidate))mode="notes";
        else if(/^Acknowledg|^Teşekkür/i.test(candidate))mode="ack";
        else mode="body";
        continue;
      }
      flushH();
      if(n.font.size<9||n.font.size>20) continue;
      const base=n.left>420?433:105, indent=n.left-base;
      if(mode==="references"&&Math.abs(indent)<=9&&paragraph)flushP();
      else if(mode!=="references"&&indent>=13&&indent<=35&&paragraph&&/[.!?…”’)]$/.test(paragraph))flushP();
      paragraph=paragraph?joinText(paragraph,n.text):n.text;
    }
  }
  flushP();flushH();
  return {blocks,captions};
}
function splitSpecial(blocks){
  const pos={notes:-1,refs:-1,ack:-1};
  blocks.forEach((b,i)=>{if(b.kind!=="heading")return;if(/^(Notlar|NOTLAR|Notes|NOTES)$/i.test(b.text))pos.notes=i;if(/^(Kaynakça|KAYNAKÇA|References|REFERENCES)$/i.test(b.text))pos.refs=i;if(/^(Teşekkür|Acknowledg)/i.test(b.text))pos.ack=i;});
  const starts=Object.values(pos).filter(x=>x>=0).sort((a,b)=>a-b),end=starts[0]??blocks.length;
  const slice=k=>{const s=pos[k];if(s<0)return[];const n=starts.find(x=>x>s)??blocks.length;return blocks.slice(s+1,n);};
  return {body:blocks.slice(0,end),notes:slice("notes"),refs:slice("refs"),ack:slice("ack")};
}
function sectionsFrom(blocks,locale,record){
  let sections=[],cur={title:locale==="tr"?"Tam Metin":"Full Text",paragraphs:[]};
  for(const b of blocks){
    if(b.kind==="heading"){if(cur.paragraphs.length)sections.push(cur);cur={title:b.text,paragraphs:[]};}
    else if(b.text.length>28)cur.paragraphs.push(b.text);
  }
  if(cur.paragraphs.length)sections.push(cur);
  const merged=[];
  for(const s of sections){
    if(merged.length && merged[merged.length-1].title===s.title) merged[merged.length-1].paragraphs.push(...s.paragraphs);
    else merged.push(s);
  }
  sections=merged;
  if(record.strictFixedHeadings && record.slug==="kusak-ve-yol-girisimi-bolgesellesme-ve-kuresellesme-icin-yeni-itici-guc"){
    const expected=record.fixedHeadings?.[locale]||[];
    const intro=sections[0]||{title:locale==="tr"?"Tam Metin":"Full Text",paragraphs:[]};
    const normalized=[intro];
    let lastIndex=-1;
    for(const s of sections.slice(1)){
      const idx=expected.findIndex(h=>s.title.includes(h));
      if(idx<0 || idx<lastIndex){ intro.paragraphs.push(...s.paragraphs); continue; }
      lastIndex=idx;
      normalized.push({...s,title:expected[idx]});
    }
    sections=normalized;
  }
  if(record.interview){
    const out=[];
    for(const s of sections){
      if(s.title.includes("?")) out.push(s);
      else if(out.length) out[out.length-1].paragraphs.push(...s.paragraphs);
    }
    sections=out;
  }
  if(record.collapseLongHeadings){
    const out=[];
    for(const s of sections){
      if(s.title.length>100&&out.length) out[out.length-1].paragraphs.push(...s.paragraphs);
      else out.push(s);
    }
    sections=out;
  }
  return sections.map((s,i)=>({id:locale+"-section-"+(i+1),title:s.title,paragraphs:s.paragraphs}));
}
function notesFrom(blocks){
  const t=blocks.map(b=>b.text).join(" ").replace(/\s+/g," ").trim();if(!t)return[];
  const m=[...t.matchAll(/(?:^|\s)(\d{1,2})[.)]?\s+(?=[A-ZÇĞİÖŞÜ])/g)];
  return m.map((x,i)=>({id:"note-"+x[1],text:t.slice(x.index+x[0].length,m[i+1]?.index??t.length).trim()}));
}
function refsFrom(blocks){return blocks.filter(b=>b.kind==="paragraph"&&b.text.length>8).map((b,i)=>({id:"ref-"+(i+1),text:b.text.replace(/\s+/g," ").trim()}));}
function extractImages(pdf,startPage,count,outDir,preferLargest=false){
  rmSync(outDir,{recursive:true,force:true});if(!count)return[];
  const temp=mkdtempSync(join(tmpdir(),"v04i01-img-"));
  sh("pdfimages",["-f",String(startPage),"-all",pdf,join(temp,"img")],{stdio:"ignore"});
  let candidates=readdirSync(temp).filter(n=>[".jpg",".jpeg",".png"].includes(extname(n).toLowerCase())).sort().map(name=>{
    const path=join(temp,name);let w=0,h=0;try{[w,h]=sh("identify",["-format","%w %h",path]).trim().split(/\s+/).map(Number);}catch{}
    return {name,path,w,h,size:statSync(path).size,area:w*h};
  }).filter(x=>x.w>=360&&x.h>=220&&x.size>=18000);
  if(preferLargest) candidates=candidates.sort((a,b)=>b.area-a.area||b.size-a.size);
  if(!candidates.length){rmSync(temp,{recursive:true,force:true});return[];}
  mkdirSync(outDir,{recursive:true});
  const picked=candidates.slice(0,count);
  const out=picked.map((x,i)=>{const ext=extname(x.name).toLowerCase()===".jpeg"?".jpg":extname(x.name).toLowerCase();const fn="figure-"+String(i+1).padStart(2,"0")+ext;copyFileSync(x.path,join(outDir,fn));return fn;});
  rmSync(temp,{recursive:true,force:true});return out;
}
function findIssuePage(probes){
  const raw=sh("pdftotext",["-layout",issuePdfTr,"-"]);
  const pages=raw.split("\f");
  for(let i=pages.length-1;i>=0;i--)if(probes.some(p=>pages[i].includes(p)))return i+1;
  throw new Error("Could not locate visual page: "+probes.join(" | "));
}

const sourceRoot=join(root,"tmp/v04-i01-source/articles");
mkdirSync(sourceRoot,{recursive:true});
for(const record of records){
  const meta=JSON.parse(readFileSync(join(root,"content/articles",record.slug,"metadata.json"),"utf8"));
  const pdf={};
  for(const locale of ["en","tr"]){
    const url=meta.urls?.[locale==="en"?"pdfEn":"pdfTr"];if(!url)throw new Error("Missing official "+locale+" PDF URL for "+record.slug);
    pdf[locale]=join(sourceRoot,record.slug+"-"+locale+".pdf");download(url,pdf[locale]);
  }
  const parsed={};
  for(const locale of ["en","tr"]){const x=join(sourceRoot,record.slug+"-"+locale+".xml");sh("pdftohtml",["-xml","-hidden",pdf[locale],x],{stdio:"ignore"});parsed[locale]=parseXml(readFileSync(x,"utf8"));}
  const extracted={en:extractBlocks(parsed.en,record,"en"),tr:extractBlocks(parsed.tr,record,"tr")};
  const filenames=extractImages(pdf.tr,record.startPage,record.figures,join(root,"public/assets/article-figures",record.slug));
  for(const locale of ["en","tr"]){
    const special=splitSpecial(extracted[locale].blocks);
    const ft={
      sections:sectionsFrom(special.body,locale,record),
      keywords:Array.isArray(meta.keywords?.[locale])?[...meta.keywords[locale]]:[],
      footnotes:notesFrom(special.notes),
      references:refsFrom(special.refs),
      acknowledgements:special.ack.map(b=>b.text).join(" ").replace(/\s+/g," ").trim(),
      figures:filenames.map((fn,i)=>({id:"figure-"+(i+1),src:"/assets/article-figures/"+record.slug+"/"+fn,caption:record.captions?.[locale]?.[i]||extracted[locale].captions[i]||""})),
    };
    const out=join(root,"content/articles",record.slug,"fulltext",locale+".json");mkdirSync(resolve(out,".."),{recursive:true});writeFileSync(out,JSON.stringify(ft,null,2)+"\n");
  }
}

for(const visual of visualRecords){
  const page=findIssuePage(visual.probes);
  const files=extractImages(issuePdfTr,page,1,join(root,"public/assets/article-figures",visual.slug),true);
  if(files.length!==1)throw new Error("Expected one exact visual asset for "+visual.slug+", got "+files.length);
  for(const locale of ["en","tr"]){
    const ft={sections:[],keywords:[],footnotes:[],references:[],acknowledgements:"",figures:[{id:"figure-1",src:"/assets/article-figures/"+visual.slug+"/"+files[0],caption:visual.title[locale]}]};
    const out=join(root,"content/articles",visual.slug,"fulltext",locale+".json");mkdirSync(resolve(out,".."),{recursive:true});writeFileSync(out,JSON.stringify(ft,null,2)+"\n");
  }
}
console.log("Generated v04-i01 canonical candidates from article-level official locale PDFs and exact PDF raster objects.");
