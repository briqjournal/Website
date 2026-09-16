import fs from 'node:fs'; import path from 'node:path'; import assert from 'node:assert/strict'; import test from 'node:test';
const issue=JSON.parse(fs.readFileSync('content/issues/v07-i01.json','utf8')); const catalog=JSON.parse(fs.readFileSync('content/catalog.json','utf8'));
const read=(slug,l)=>JSON.parse(fs.readFileSync(path.join('content/articles',slug,'fulltext',`${l}.json`),'utf8'));
const meta=slug=>JSON.parse(fs.readFileSync(path.join('content/articles',slug,'metadata.json'),'utf8'));
const txt=r=>typeof r==='string'?r:r.text;
test('V7I1 is canonical locale-split metadata-v2 content',()=>{
  assert.equal(issue.articles.length,5);
  for(const slug of issue.articles){
    const dir=path.join('content/articles',slug,'fulltext'); assert.deepEqual(fs.readdirSync(dir).filter(x=>x.endsWith('.json')).sort(),['en.json','tr.json']);
    assert.equal(meta(slug).schemaVersion,2); assert.equal(meta(slug).dates.published,'2025-12-01');
    assert(catalog.fulltext.localized.includes(slug)); assert(!catalog.fulltext.current.includes(slug)); assert(!catalog.fulltext.en_archive.includes(slug));
    for(const l of ['en','tr']){ const x=read(slug,l); x.sections.forEach((s,i)=>assert.equal(s.id,`${l}-section-${i+1}`,`${slug}/${l}`)); assert.deepEqual(meta(slug).keywords?.[l]||[],x.keywords||[],`${slug}/${l} keywords`); }
  }
});
test('V7I1 bilingual bodies remain distinct',()=>{
  const body=x=>x.sections.flatMap(s=>s.paragraphs||[]).join(' ').replace(/\s+/g,' ').trim();
  for(const slug of issue.articles){ const e=body(read(slug,'en')),t=body(read(slug,'tr')); if(e.length>300&&t.length>300) assert.notEqual(e,t,slug); }
});
test('V7I1 source-verified reference repairs stay intact',()=>{
  const all=[]; for(const slug of issue.articles) for(const l of ['en','tr']) all.push(...(read(slug,l).references||[]).map(txt)); const joined=all.join('\n');
  for(const bad of ['https://www. eeo.com.cn','annurev. ecolsys','s12302-014- 0034-1','s11258-008- 9485-0','https://www. fao.org','https://zhuanlan. zhihu.com','https://www. aa.com.tr','https://www. bu.edu','https://www. inss.org.il','https://www. iisd.org','https://www. weforum.org','https://www. brettonwoodsproject.org','https:// doi.org','evolving strategies of a new power. Report. London: ODI (www. odi.org']) assert(!joined.includes(bad),bad);
  const g=issue.articles[2]; for(const l of ['en','tr']) { const refs=(read(g,l).references||[]).map(txt); assert.equal(refs.length,62,`Gao ${l} refs`); assert.equal(refs.filter(x=>/^Humphrey, C\. and Chen, Y\. \(2021\)/.test(x)).length,1); assert(refs.some(x=>x.includes('10.1007/s12140-023-09401-z'))); }
  const zrefs=(read(issue.articles[3],'tr').references||[]).map(txt); assert.equal(zrefs.length,74); assert(zrefs.some(x=>/^Zhou, L\.Y\. \(2009\)/.test(x)),'source-only Zhou ref must remain');
});
test('V7I1 declarations are not invented and Zhang-Liu funding is preserved',()=>{
  for(const slug of issue.articles.slice(0,3)) assert.equal(meta(slug).funding,null,slug);
  const f=meta(issue.articles[3]).funding; assert(f); const s=JSON.stringify(f); assert(s.includes('SGH23Y2327')); assert(s.includes('25GZ0201'));
  assert.equal(meta(issue.articles[4]).abstract.en,null); assert.equal(meta(issue.articles[4]).abstract.tr,null);
});
