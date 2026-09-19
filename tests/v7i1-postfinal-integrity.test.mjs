import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';
const issue=JSON.parse(fs.readFileSync('content/issues/v07-i01.json','utf8'));
const read=(slug,l)=>JSON.parse(fs.readFileSync(path.join('content/articles',slug,'fulltext',`${l}.json`),'utf8'));
const text=r=>typeof r==='string'?r:r.text;

function urlPart(value) {
  const normalized=String(value??'').replace(/\n/g,' ');
  const start=normalized.search(/https?:\/\//iu);
  if(start<0) return null;
  const tail=normalized.slice(start);
  const markers=[/\s+(?:adresinden|adresine)\b/iu,/\s+\(?(?:accessed|retrieved)\b/iu];
  let end=tail.length;
  for(const marker of markers){const found=tail.search(marker); if(found>=0) end=Math.min(end,found);}
  return tail.slice(0,end).replace(/[.,;:]$/u,'');
}

test('V7I1 reference URLs and DOI URLs contain no PDF line-wrap whitespace',()=>{
  for(const slug of issue.articles) for(const locale of ['en','tr']) {
    for(const [index,ref] of (read(slug,locale).references||[]).entries()) {
      const url=urlPart(text(ref));
      if(url) assert.doesNotMatch(url,/\s/u,`${slug}/${locale} ref ${index+1}: ${url}`);
    }
  }
});

test('Yang Chen review follows the actual bilingual PDF heading hierarchy',()=>{
  const slug='cin-abd-iliskilerinin-gelecegi';
  const en=read(slug,'en'), tr=read(slug,'tr');
  assert.deepEqual(en.sections.map(s=>s.title),['Full text','What is Great Power Competition?','The Five Phases of China-U.S. Relations','Contradictions in the Current World Order and China’s Response']);
  assert.deepEqual(tr.sections.map(s=>s.title),['Tam metin','Büyük Güç Rekabeti Nedir?','Çin-ABD İlişkilerinde Beş Aşama','Mevcut Dünya Düzenindeki Çelişkiler ve Çin’in Tepkisi']);
  const enFive=en.sections[2].paragraphs.join('\n');
  const trFive=tr.sections[2].paragraphs.join('\n');
  assert.match(enFive,/Phase 1 \(1949-1978\): The “Confrontation Phase”/u);
  assert.match(enFive,/Great Power Competition Phase I” \(2016-2035\)/u);
  assert.match(enFive,/Competitive Coexistence Phase” \(2061 onwards\)/u);
  assert.doesNotMatch(JSON.stringify(en),/Coexis-|"title":\s*"If China|"title":\s*"China-U\.S\. relations are currently/u);
  assert.match(trFive,/2010 yılında Çin’in imalat üretimi ABD’yi geçti/u);
  assert.doesNotMatch(JSON.stringify(tr),/B üyük|Çin- ABD/u);
});

test('V7I1 audited bibliography cardinalities remain stable',()=>{
  const expected=[[21,21],[33,33],[61,61],[73,74],[0,0]];
  issue.articles.forEach((slug,index)=>{
    assert.equal((read(slug,'en').references||[]).length,expected[index][0],`${slug}/en`);
    assert.equal((read(slug,'tr').references||[]).length,expected[index][1],`${slug}/tr`);
  });
  const zhou=(read(issue.articles[3],'tr').references||[]).map(text).filter(x=>/^Zhou, L\.Y\. \(2009\)/u.test(x));
  assert.equal(zhou.length,1,'Zhang-Liu TR-only Zhou reference');
});
