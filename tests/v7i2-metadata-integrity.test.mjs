import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';
const issue=JSON.parse(fs.readFileSync('content/issues/v07-i02.json','utf8'));
test('V7I2 metadata keywords exactly match canonical locale full text',()=>{
  for(const slug of issue.articles){
    const m=JSON.parse(fs.readFileSync(path.join('content/articles',slug,'metadata.json'),'utf8'));
    for(const locale of ['en','tr']){
      const f=JSON.parse(fs.readFileSync(path.join('content/articles',slug,'fulltext',`${locale}.json`),'utf8'));
      assert.deepEqual(m.keywords?.[locale]||[],f.keywords||[],`${slug}/${locale}`);
    }
  }
});
test('Zhang Yaxin does not expose the Turkish-only PDF as an English PDF',()=>{
  const m=JSON.parse(fs.readFileSync('content/articles/zhang-yaxin/metadata.json','utf8'));
  assert.ok(m.urls.pdfTr);
  assert.equal(m.urls.pdfEn,null);
  assert.equal(m.urls.pdfEnLocal,null);
  assert.equal(m.urls.sharedBilingualPdf,false);
});
