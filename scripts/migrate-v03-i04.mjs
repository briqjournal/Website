import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { extname, join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const sourceRoot = join(root, "tmp/v03-i04-source");
const issuePdf = {
  en: join(sourceRoot, "issue-en.pdf"),
  tr: join(sourceRoot, "issue-tr.pdf"),
};
for (const p of Object.values(issuePdf)) if (!existsSync(p)) throw new Error("Missing source PDF: "+p);

const issueUrls = {
  en: "https://briqjournal.com/sites/default/files/dergi-sayilari/2022-09/C3S4_ENG_YK.pdf",
  tr: "https://briqjournal.com/sites/default/files/dergi-sayilari/2022-10/BRIQ_C3S4_TR_FINAL_YEN%C4%B0.pdf",
};

const records = [
  {
    slug: "uygarlik-yolunda-birlesme-kaynasma-ve-kardeslik",
    source: "issue",
    ranges: { en:[4,5], tr:[2,3] },
    startContains: { en:"At a time when US ambitions", tr:"Kuşak ve Yol Girişimi" },
    fixedHeadings: { en:[], tr:[] },
    figures: 0,
  },
  {
    slug: "ortak-mirasimiz-olan-gecmisi-kuresel-olcekte-ele-alip-bilimi-paylasmak-zorundayiz",
    source: "article",
    startContains: { en:"Which countries is the Shanghai", tr:"Şanghay Arkeoloji Forumu" },
    figures: 1,
  },
  {
    slug: "yeni-dunya-ipek-yolunun-yarattigi-evrensel-degerler-uzerinde-zenginlik-ve-barisla-kurulacak",
    source: "article",
    startContains: { en:"In this issue, we cover", tr:"Bu sayımızda İpek Yolu" },
    figures: 0,
  },
  {
    slug: "kulturel-ozguveni-percinleyelim",
    source: "mixed-xi",
    ranges: { en:[26,29] },
    startContains: { en:"EVEN THE HIGHEST TREES", tr:"EN YÜKSEK AĞAÇLAR" },
    fixedHeadings: {
      en:["The magnificent and diverse tapestry of Chinese civilization","Illustrating the origins of Chinese civilization and the historical path of its development"],
      tr:["Çin Uygarlığının Eşsiz Mozaiği","Çin Uygarlığının Kökenlerini ve Gelişiminin Tarihsel Yolunu Aydınlatmak"],
    },
    figures: 0,
  },
  {
    slug: "ipek-yolu-uzerindeki-magara-tapinaklarindaki-kuzey-wei-donemine-ait-budist-resim-kompozisyonlarinin",
    source: "article",
    start: { en:"Introduction", tr:"Giriş" },
    figures: 19,
  },
  {
    slug: "ipek-yolu-cayir-guzergahi-cayir-ipek-yolu-milli-ekonomi-iletisim-ve-butunlesme",
    source: "article",
    startContains: { en:"IN 1877, THE GERMAN GEOGRAPHER", tr:"“İPEK YOLU” TERIMI" },
    figures: 4,
  },
  {
    slug: "ipek-yolu-uzerinden-yakin-doguya-sibiryali-ust-paleolitik-cag-gocleri",
    source: "article",
    start: { en:"Introduction", tr:"Giriş" },
    figures: 13,
  },
  {
    slug: "ipek-yolunda-kulturel-etkilesim-orta-asyada-yuezhi-goc-donemi",
    source: "article",
    start: { en:"Introduction", tr:"Giriş" },
    figures: 10,
  },
  {
    slug: "guc-zayifliktir",
    source: "article",
    startContains: { en:"AFTER EASTERNISATION", tr:"BU KITAP, FINANCIAL TIMES" },
    figures: 1,
  },
];

const visuals = [
  {
    slug:"yangin-merdiveni",
    sourcePdf:"tr",
    issueRange:{en:[95,95],tr:[93,93]},
    startContains:{
      en:"Alexander Rodchenko and Varvara Stepanova lived",
      tr:"Alexander Rodchenko ve Varvara Stepanova bu evde yaşadılar"
    },
    title:{en:"Fire Escape",tr:"Yangın Merdiveni"},
  },
  {
    slug:"simitci",
    sourcePdf:"tr",
    issueRange:{en:[96,96],tr:[94,94]},
    startContains:{
      en:"Jak Ihmalyan was born",
      tr:"Jak İhmalyan, 30 Haziran 1922"
    },
    title:{en:"Simit Seller",tr:"Simitçi"},
  },
  {
    slug:"uygarligin-ipek-yolu",
    sourcePdf:"tr",
    issueRange:{en:[97,97],tr:[95,95]},
    startContains:{
      en:"Erhan Yalvaç graduated",
      tr:"Erhan Yalvaç, 1976-77"
    },
    title:{en:"Silk Road of Civilization",tr:"Uygarlığın İpek Yolu"},
  },
];

function sh(cmd,args,opts={}) {
  return execFileSync(cmd,args,{encoding:"utf8",maxBuffer:128*1024*1024,...opts});
}
function download(url,dest) {
  mkdirSync(resolve(dest,".."),{recursive:true});
  execFileSync("curl",["-L","--fail","--retry","4","--retry-delay","2",url,"-o",dest],{stdio:"ignore"});
}
function decodeEntities(v) {
  return v.replace(/<br\s*\/?\s*>/gi," ").replace(/<[^>]+>/g,"")
    .replace(/&#(\d+);/g,(_,c)=>String.fromCodePoint(Number(c)))
    .replace(/&#x([\da-f]+);/gi,(_,c)=>String.fromCodePoint(Number.parseInt(c,16)))
    .replaceAll("&amp;","&").replaceAll("&quot;",'"').replaceAll("&apos;","'")
    .replaceAll("&lt;","<").replaceAll("&gt;",">").replace(/\s+/g," ").trim();
}
function parseXml(xml) {
  const fonts=new Map(), pages=[];
  for (const m of xml.matchAll(/<fontspec\b[^>]*id="(\d+)"[^>]*size="([\d.]+)"[^>]*family="([^"]*)"[^>]*color="([^"]*)"\s*\/>/g))
    fonts.set(m[1],{size:Number(m[2]),family:m[3],color:m[4]});
  for (const pm of xml.matchAll(/<page\b[^>]*number="(\d+)"[^>]*>([\s\S]*?)<\/page>/g)) {
    const nodes=[];
    for (const m of pm[2].matchAll(/<text\b[^>]*top="([\d.]+)"[^>]*left="([\d.]+)"[^>]*width="([\d.]+)"[^>]*height="([\d.]+)"[^>]*font="(\d+)"[^>]*>([\s\S]*?)<\/text>/g)) {
      const text=decodeEntities(m[6]); if(!text) continue;
      nodes.push({page:Number(pm[1]),top:Number(m[1]),left:Number(m[2]),width:Number(m[3]),height:Number(m[4]),font:fonts.get(m[5])||{size:0,family:"",color:""},text,bold:/<(?:b|strong)>/i.test(m[6])});
    }
    pages.push({number:Number(pm[1]),nodes});
  }
  return pages;
}
function toXml(pdf,tag) {
  const path=join(sourceRoot,tag+".xml");
  sh("pdftohtml",["-xml","-hidden",pdf,path],{stdio:"ignore"});
  return parseXml(readFileSync(path,"utf8"));
}
function joinText(a,b) {
  return /[-‐‑]$/u.test(a) && /^[a-zçğıöşü]/u.test(b) ? a.slice(0,-1)+b : a+" "+b;
}
function norm(s) { return s.toLocaleLowerCase("en-US").replace(/[^\p{L}\p{N}]+/gu," ").trim(); }
function isNoise(n) {
  if(n.top<75||n.top>1075) return true;
  if(/^\d{1,4}$/.test(n.text)||/^B\s*R\s*I\s*[Qq]/.test(n.text)) return true;
  if(/^(RÖPORTAJ|INTERVIEW|KİTAP İNCELEME|KITAP INCELEME|BOOK REVIEW|HAKEMLİ MAKALE|PEER-REVIEWED ARTICLE|FOTOĞRAF|PHOTOGRAPH|PHOTOGRAPHY ART|RESİM|PAINTING|KARİKATÜR|CARTOON)$/iu.test(n.text)) return true;
  if(/Gotham|Bebas/i.test(n.font.family)) return true;
  if(/^(How to cite:|Atıf:)/i.test(n.text)) return true;
  return false;
}
function fixedHeading(text,list=[]) {
  const t=norm(text);
  return list.find(x=>{const f=norm(x);return t===f||f.startsWith(t+" ")||t.startsWith(f+" ");})||null;
}
function genericHeading(n) {
  if(/^(Giriş|GİRİŞ|Introduction|INTRODUCTION|Sonuç|SONUÇ|Conclusion|CONCLUSION|Conclusions|Kaynakça|KAYNAKÇA|References|REFERENCES|Bibliography|BIBLIOGRAPHY|Bibliyografya|Notlar|NOTLAR|Notes|NOTES|Teşekkür|TEŞEKKÜR|Acknowledg(?:e)?ments?)$/iu.test(n.text)) return true;
  if(n.text.length>170||/[.;:]$/.test(n.text)) return false;
  if(n.font.size<14||n.font.size>23) return false;
  return n.bold || n.text.split(/\s+/).length<=16;
}
function isCaptionStart(text) {
  return /^(?:Tablo|Table|Şekil|Figure|Resim|Picture)\s*\d+\s*[:.]/iu.test(text)
    || /^Hexi Corridor\b/iu.test(text)
    || /^The road map of the “?ancient tea-horse road/iu.test(text)
    || /^Map showing Marco Polo/i.test(text)
    || /^Shangdu, the capital of the Yuan Dynasty/i.test(text)
    || /^4th Shanghai Archeology Forum award ceremony/i.test(text)
    || /^4\. Şanghay Arkeoloji Forumu/i.test(text);
}
function isSpecialHeading(text) {
  return /^(Kaynakça|KAYNAKÇA|References|REFERENCES|Bibliography|BIBLIOGRAPHY|Bibliyografya|Notlar|NOTLAR|Notes|NOTES|Teşekkür|TEŞEKKÜR|Acknowledg(?:e)?ments?)$/iu.test(text);
}
function extractBlocks(pages,record,locale,range=null) {
  const blocks=[], captions=[]; let paragraph="", heading="", started=false, mode="body", capTail=0;
  const flushP=()=>{const v=paragraph.replace(/\s+/g," ").trim();if(v.length>1)blocks.push({kind:"paragraph",text:v});paragraph="";};
  const flushH=()=>{const v=heading.replace(/\s+/g," ").trim();if(v)blocks.push({kind:"heading",text:v});heading="";};
  const list=range?pages.filter(p=>p.number>=range[0]&&p.number<=range[1]):pages;
  for(const page of list) {
    for(const n of page.nodes) {
      if(isNoise(n)) continue;
      if(capTail>0) {
        if(n.font.size<=12.5 && n.text.length<500 && !genericHeading(n) && !isCaptionStart(n.text)) {
          captions[captions.length-1]=joinText(captions[captions.length-1],n.text);
          capTail--;
          continue;
        }
        capTail=0;
      }
      if(isCaptionStart(n.text)) { flushP(); flushH(); captions.push(n.text); capTail=2; continue; }
      if(!started) {
        const s=record.start?.[locale];
        const c=record.startContains?.[locale];
        if((s&&norm(n.text)===norm(s))||(c&&norm(n.text).includes(norm(c)))) {
          started=true;
          if(s && /^(Introduction|Giriş)$/iu.test(s)) {
            heading=s;
            flushH();
            continue;
          }
          paragraph=n.text;
          continue;
        }
        continue;
      }
      if(/^(ABSTRACT|ÖZ|SUMMARY|ANAHTAR KELİMELER|KEYWORDS)\b/iu.test(n.text)) continue;
      const f=fixedHeading(n.text,record.fixedHeadings?.[locale]||[]);
      const h=f || (genericHeading(n)?n.text:null);
      if(h) {
        flushP(); flushH();
        heading=h; flushH();
        if(/^(Kaynakça|References|Bibliography|Bibliyografya)$/iu.test(h)) mode="references";
        else if(/^(Notlar|Notes)$/iu.test(h)) mode="notes";
        else if(/^(Teşekkür|Acknowledg)/iu.test(h)) mode="ack";
        else mode="body";
        continue;
      }
      if(n.font.size<8.5||n.font.size>20.5) continue;
      const base=n.left>390?430:95;
      const indent=n.left-base;
      if(mode==="references" && Math.abs(indent)<=12 && paragraph) flushP();
      else if(mode!=="references" && indent>=12 && indent<=42 && paragraph && /[.!?…”’):]$/.test(paragraph)) flushP();
      paragraph=paragraph?joinText(paragraph,n.text):n.text;
    }
  }
  flushP(); flushH();
  return {blocks,captions};
}
function splitSpecial(blocks) {
  let mode="body"; const out={body:[],notes:[],refs:[],ack:[]};
  for(const b of blocks) {
    if(b.kind==="heading") {
      if(/^(Kaynakça|References|Bibliography|Bibliyografya)$/iu.test(b.text)){mode="refs";continue;}
      if(/^(Notlar|Notes)$/iu.test(b.text)){mode="notes";continue;}
      if(/^(Teşekkür|Acknowledg)/iu.test(b.text)){mode="ack";continue;}
    }
    out[mode].push(b);
  }
  return out;
}
function sectionsFrom(blocks,locale) {
  let sections=[],cur={title:locale==="tr"?"Tam Metin":"Full Text",paragraphs:[]};
  for(const b of blocks) {
    if(b.kind==="heading") {
      if(cur.paragraphs.length) sections.push(cur);
      cur={title:b.text,paragraphs:[]};
    } else if(b.text.length>20) cur.paragraphs.push(b.text);
  }
  if(cur.paragraphs.length) sections.push(cur);
  const merged=[];
  for(const s of sections) {
    if(merged.length && merged[merged.length-1].title===s.title) merged[merged.length-1].paragraphs.push(...s.paragraphs);
    else merged.push(s);
  }
  return merged.map((s,i)=>({id:locale+"-section-"+(i+1),title:s.title,paragraphs:s.paragraphs}));
}
function notesFrom(blocks) {
  const t=blocks.map(b=>b.text).join(" ").replace(/\s+/g," ").trim(); if(!t)return[];
  const ms=[...t.matchAll(/(?:^|\s)(\d{1,2})[.)]?\s+(?=[A-ZÇĞİÖŞÜ])/g)];
  if(!ms.length) return [{id:"note-1",text:t}];
  return ms.map((x,i)=>({id:"note-"+x[1],text:t.slice(x.index+x[0].length,ms[i+1]?.index??t.length).trim()}));
}
function refsFrom(blocks) {
  const ps=blocks.filter(b=>b.kind==="paragraph"&&b.text.length>8).map(b=>b.text.replace(/\s+/g," ").trim());
  return ps.map((text,i)=>({id:"ref-"+(i+1),text}));
}
function pageCount(pdf) {
  const m=sh("pdfinfo",[pdf]).match(/^Pages:\s+(\d+)/m); if(!m)throw new Error("No page count "+pdf); return Number(m[1]);
}
function extractImages(pdf,first,last,count,outDir) {
  rmSync(outDir,{recursive:true,force:true});
  if(!count)return[];
  const tmp=mkdtempSync(join(tmpdir(),"v03i04-img-"));
  sh("pdfimages",["-f",String(first),"-l",String(last),"-all",pdf,join(tmp,"img")],{stdio:"ignore"});
  let cs=readdirSync(tmp).filter(n=>[".jpg",".jpeg",".png"].includes(extname(n).toLowerCase())).sort().map(name=>{
    const path=join(tmp,name); let w=0,h=0;
    try{[w,h]=sh("identify",["-format","%w %h",path]).trim().split(/\s+/).map(Number);}catch{}
    return {name,path,w,h,size:statSync(path).size,area:w*h};
  }).filter(x=>x.w>=300&&x.h>=180&&x.size>=12000);
  const ded=[]; const seen=new Set();
  for(const x of cs) {
    const hash=sh("sha256sum",[x.path]).split(/\s+/)[0];
    if(seen.has(hash))continue; seen.add(hash); ded.push({...x,hash});
  }
  cs=ded;
  if(cs.length<count) {
    throw new Error("Not enough production raster candidates: "+outDir+" expected "+count+" got "+cs.length+" :: "+JSON.stringify(cs.map(x=>({name:x.name,w:x.w,h:x.h,size:x.size}))));
  }
  mkdirSync(outDir,{recursive:true});
  const picked=cs.slice(0,count);
  const files=picked.map((x,i)=>{
    const ext=extname(x.name).toLowerCase()===".jpeg"?".jpg":extname(x.name).toLowerCase();
    const fn="figure-"+String(i+1).padStart(2,"0")+ext;
    copyFileSync(x.path,join(outDir,fn)); return fn;
  });
  rmSync(tmp,{recursive:true,force:true});
  return files;
}
function articlePdf(meta,locale,slug) {
  let url=meta.urls?.[locale==="en"?"pdfEn":"pdfTr"];
  if(!url)throw new Error("Missing article PDF "+slug+" "+locale);
  const dest=join(sourceRoot,slug+"-"+locale+".pdf");
  download(url,dest); return dest;
}
function writeFt(slug,locale,ft) {
  const out=join(root,"content/articles",slug,"fulltext",locale+".json");
  mkdirSync(resolve(out,".."),{recursive:true}); writeFileSync(out,JSON.stringify(ft,null,2)+"\n");
}
function fallbackCaption(locale,i) { return (locale==="tr"?"Görsel ":"Figure ")+(i+1); }

const issuePages={en:toXml(issuePdf.en,"issue-en"),tr:toXml(issuePdf.tr,"issue-tr")};

for(const record of records) {
  const meta=JSON.parse(readFileSync(join(root,"content/articles",record.slug,"metadata.json"),"utf8"));
  const pdf={}, pages={}, range={};
  for(const locale of ["en","tr"]) {
    if(record.source==="issue") {
      pdf[locale]=issuePdf[locale]; pages[locale]=issuePages[locale]; range[locale]=record.ranges[locale];
    } else if(record.source==="mixed-xi") {
      if(locale==="en") {
        pdf.en=issuePdf.en; pages.en=issuePages.en; range.en=record.ranges.en;
      } else {
        pdf.tr=articlePdf(meta,"tr",record.slug); pages.tr=toXml(pdf.tr,record.slug+"-tr"); range.tr=[1,pageCount(pdf.tr)];
      }
    } else {
      pdf[locale]=articlePdf(meta,locale,record.slug); pages[locale]=toXml(pdf[locale],record.slug+"-"+locale); range[locale]=[1,pageCount(pdf[locale])];
    }
  }
  const extracted={};
  for(const locale of ["en","tr"]) extracted[locale]=extractBlocks(pages[locale],record,locale,range[locale]);

  let files=[];
  if(record.figures) {
    const sourceLocale="en";
    files=extractImages(pdf[sourceLocale],range[sourceLocale][0],range[sourceLocale][1],record.figures,join(root,"public/assets/article-figures",record.slug));
  }
  for(const locale of ["en","tr"]) {
    const sp=splitSpecial(extracted[locale].blocks);
    const caps=extracted[locale].captions;
    const ft={
      sections:sectionsFrom(sp.body,locale),
      keywords:Array.isArray(meta.keywords?.[locale])?[...meta.keywords[locale]]:[],
      footnotes:notesFrom(sp.notes),
      references:refsFrom(sp.refs),
      acknowledgements:sp.ack.map(b=>b.text).join(" ").replace(/\s+/g," ").trim(),
      figures:files.map((fn,i)=>({id:"figure-"+(i+1),src:"/assets/article-figures/"+record.slug+"/"+fn,caption:caps[i]||fallbackCaption(locale,i)})),
    };
    writeFt(record.slug,locale,ft);
  }
}

for(const v of visuals) {
  const meta=JSON.parse(readFileSync(join(root,"content/articles",v.slug,"metadata.json"),"utf8"));
  const trPdf=articlePdf(meta,"tr",v.slug);
  const n=pageCount(trPdf);
  const files=extractImages(trPdf,1,n,1,join(root,"public/assets/article-figures",v.slug));
  for(const locale of ["en","tr"]) {
    const ex=extractBlocks(issuePages[locale],{startContains:{[locale]:v.startContains[locale]}},locale,v.issueRange[locale]);
    const paras=ex.blocks.filter(b=>b.kind==="paragraph").map(b=>b.text).filter(x=>x.length>20);
    const ft={
      sections:paras.length?[{id:locale+"-section-1",title:locale==="tr"?"Tam Metin":"Full Text",paragraphs:paras}]:[],
      keywords:[],footnotes:[],references:[],acknowledgements:"",
      figures:[{id:"figure-1",src:"/assets/article-figures/"+v.slug+"/"+files[0],caption:v.title[locale]}],
    };
    writeFt(v.slug,locale,ft);
  }
}
console.log("Generated v03-i04 canonical EN/TR full texts and exact embedded production raster assets.");
