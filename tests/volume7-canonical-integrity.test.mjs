import fs from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";
import { bilingualKeywordParityOverrides } from "../scripts/content-store.mjs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const dates={1:"2025-12-01",2:"2026-03-01",3:"2026-06-01",4:"2026-09-01"};
const slugs=[]; const issueBySlug=new Map();
for(let n=1;n<=4;n++){const issue=read(`content/issues/v07-i0${n}.json`);for(const slug of issue.articles){slugs.push(slug);issueBySlug.set(slug,n);}}
const text=r=>typeof r==="string"?r:r.text;
function urlPart(value){const start=value.search(/https?:\/\//iu);if(start<0)return null;const tail=value.slice(start);const markers=[/\s+\(?(?:adresinden|adresine)\b/iu,/\s+\(?(?:erişim tarihi|erişildi|erişim)\b/iu,/\s+\(?(?:accessed|retrieved)\b/iu];let end=tail.length;for(const marker of markers){const i=tail.search(marker);if(i>=0)end=Math.min(end,i);}return tail.slice(0,end);}
test("Volume 7 canonical source integrity",()=>{
  assert.equal(new Set(slugs).size,30);
  for(const slug of slugs){
    const n=issueBySlug.get(slug);const base=`content/articles/${slug}`;const meta=read(`${base}/metadata.json`);
    assert.equal(meta.schemaVersion,2,slug);assert.equal(meta.journal.volume,7,slug);assert.equal(meta.journal.issue,n,slug);assert.equal(meta.dates.published,dates[n],slug);
    assert.deepEqual(fs.readdirSync(`${base}/fulltext`).filter(x=>x.endsWith(".json")).sort(),["en.json","tr.json"],slug);
    for(const locale of ["en","tr"]){const ft=read(`${base}/fulltext/${locale}.json`);assert.deepEqual(meta.keywords?.[locale]||[],ft.keywords||[],`${slug}/${locale} keywords`);const ids=new Set();for(const section of ft.sections||[]){assert(section.id);assert(!ids.has(section.id),`${slug}/${locale} duplicate ${section.id}`);ids.add(section.id);}for(const [i,r] of (ft.references||[]).entries()){const url=urlPart(text(r));if(url)assert.doesNotMatch(url,/\s/u,`${slug}/${locale} ref ${i+1}: ${url}`);}}
    assert(!bilingualKeywordParityOverrides.has(slug),`${slug}: V7 must not depend on loader keyword override`);
  }
});
test("Volume 7 source-verified corrections remain canonical",()=>{const ertan=read("content/articles/iklim-degisikligi-baglaminda-su-kitligi-ve-kuresel-gida-krizi/metadata.json");assert.equal(ertan.dates.accepted,"2025-11-01");const oz=read("content/articles/anadolunun-kulturel-mirasini-koruma-ve-gelecege-aktarma-sorumlulugu/fulltext/en.json");assert.match(oz.sections[3].title,/Göbeklitepe is quite popular\.$/u);const store=fs.readFileSync("scripts/content-store.mjs","utf8");assert(!store.includes("repairComakArticleFullText"));assert(!store.includes("comakArticleSlug"));});
