import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const slugs = [
  "kulturel-silinmeden-tarihsel-kurtarmaya-nishio-kanji-ve-amerikan-isgali-altindaki-japonyanin",
  "turkiyenin-kulturel-varliklari-geri-kazanma-mucadelesi",
  "kultur-varliklarinin-yasadisi-ithalatinin-onlenmesi-ve-iadesine-iliskin-turkiye-ile-isvicre",
  "cinde-somut-olmayan-kulturel-mirasin-korunmasi-yirmi-yillik-deneyim-suregelen-zorluklar-ve-gelecege",
  "anadolunun-kulturel-mirasini-koruma-ve-gelecege-aktarma-sorumlulugu",
  "yagmalanan-iskit-altinlarinin-mirasi",
  "mogolistanin-ucuncu-komsu-diplomasisinde-kurumsal-dengeleme-sanghay-isbirligi-orgutu-ile-etkilesim",
  "kusak-ve-yolun-guvenligi-ozel-guvenlik-risk-ve-cinin-kuresel-genislemesi"
];

test('V7I3 uses only canonical locale-split full-text files', () => {
  assert.equal(slugs.length, 8);
  const catalog = JSON.parse(fs.readFileSync('content/catalog.json', 'utf8'));
  for (const slug of slugs) {
    const dir = path.join('content', 'articles', slug, 'fulltext');
    const names = fs.readdirSync(dir).sort();
    assert.deepEqual(names, ['en.json', 'tr.json'], slug);
    assert.ok(catalog.fulltext.localized.includes(slug), `not registered as localized: ${slug}`);
    assert.ok(!catalog.fulltext.current.includes(slug), `still registered as current: ${slug}`);
    assert.ok(!catalog.fulltext.en_archive.includes(slug), `still registered as archive: ${slug}`);
    const en = JSON.parse(fs.readFileSync(path.join(dir, 'en.json'), 'utf8'));
    const tr = JSON.parse(fs.readFileSync(path.join(dir, 'tr.json'), 'utf8'));
    assert.ok(en.sections?.length, `missing EN sections: ${slug}`);
    assert.ok(tr.sections?.length, `missing TR sections: ${slug}`);
    const enText = en.sections.flatMap((s) => [s.title, ...(s.paragraphs ?? [])]).join(' ');
    const trText = tr.sections.flatMap((s) => [s.title, ...(s.paragraphs ?? [])]).join(' ');
    assert.notEqual(enText, trText, `EN must not fall back to TR: ${slug}`);
  }
});
