import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';
const issue = JSON.parse(fs.readFileSync('content/issues/v07-i02.json','utf8'));
const read = (slug, locale) => JSON.parse(fs.readFileSync(path.join('content/articles',slug,'fulltext',`${locale}.json`),'utf8'));
test('V7I2 locale-split section ids are locale-prefixed and unique', () => {
  for (const slug of issue.articles) for (const locale of ['en','tr']) {
    const ids=(read(slug,locale).sections||[]).map(section=>section.id);
    assert.equal(new Set(ids).size,ids.length,`${slug}/${locale}: duplicate section id`);
    for (const id of ids) assert.match(id,new RegExp(`^${locale}-section-\\d+[a-z]?$`),`${slug}/${locale}: ${id}`);
  }
});
test('Jian article preserves the corrected parent/subsection heading hierarchy', () => {
  const slug='cine-ozgu-sosyalist-politik-ekonomiye-genel-bakis';
  for (const locale of ['en','tr']) {
    const sections=read(slug,locale).sections||[];
    const parent=sections.find(section=>section.id===`${locale}-section-2`);
    const child=sections.find(section=>section.id===`${locale}-section-2a`);
    assert.ok(parent,`${slug}/${locale}: missing parent section`);
    assert.ok(child,`${slug}/${locale}: missing child subsection`);
    assert.equal(parent.level,'section',`${slug}/${locale}: parent level`);
    assert.equal(child.level,'subsection',`${slug}/${locale}: child level`);
    assert.equal(parent.paragraphs?.length ?? 0,0,`${slug}/${locale}: parent should be structural only`);
    assert.ok((child.paragraphs?.length ?? 0)>0,`${slug}/${locale}: child should contain the section text`);
  }
});
test('V7I2 visual contributions render their source artwork', () => {
  for (const slug of ['zhang-yaxin','liu-chunhua','sanghay-halk-guzel-sanatlar-yayinevi-propaganda-afis-grubu']) for (const locale of ['en','tr']) {
    const x=read(slug,locale);
    assert.equal(x.figures?.length,1,`${slug}/${locale}`);
    const src=x.figures[0].src;
    assert(src.startsWith('/assets/article-figures/'));
    const file=path.join('public',src.replace(/^\//,''));
    assert(fs.existsSync(file),file);
    assert(fs.statSync(file).size > 100_000,`${file} too small`);
  }
});
