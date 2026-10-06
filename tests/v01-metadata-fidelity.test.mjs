import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';
import { buildArchiveData } from '../scripts/archive-store.mjs';

async function getArchive() {
  if (fs.existsSync('app/archive-data.json')) {
    return JSON.parse(fs.readFileSync('app/archive-data.json', 'utf8'));
  }
  return buildArchiveData();
}

const archive = await getArchive();
const v1Issues = archive.issues.filter((iss) => iss.volume === 1).sort((a, b) => a.issue - b.issue);

test('Volume 1 all 34 records have valid schema and consistent journal metadata', () => {
  let count = 0;
  for (const iss of v1Issues) {
    for (const slug of iss.articles) {
      count++;
      const meta = JSON.parse(fs.readFileSync(path.join('content/articles', slug, 'metadata.json'), 'utf8'));
      assert.equal(meta.schemaVersion, 2);
      assert.equal(meta.id, slug);
      assert.equal(meta.journal.volume, 1);
      assert.equal(meta.journal.issue, iss.issue);
      assert.ok(meta.title.tr);
      assert.ok(meta.title.en);
      assert.ok(meta.articleType.id);
      assert.ok(meta.authors.length > 0);
      for (const a of meta.authors) {
        assert.ok(a.displayName);
        assert.ok(a.givenName);
        assert.ok(a.familyName);
      }
      if (meta.urls.pdfEn) {
        assert.doesNotMatch(meta.urls.pdfEn, /-(?:TR|_TR|tr)(?:_0)?\.pdf$/u);
      }
      if (meta.urls.pdfTr) {
        assert.doesNotMatch(meta.urls.pdfTr, /-(?:ENG|_ENG|eng)(?:_0)?\.pdf$/u);
      }
    }
  }
  assert.equal(count, 34, 'all 34 Volume 1 records audited');
});

test('V01-I01 metadata fidelity repairs remain canonical', () => {
  const koray = JSON.parse(fs.readFileSync('content/articles/kusak-ve-yol-girisimi-yeni-ufuklar-aciyor/metadata.json', 'utf8'));
  assert.equal(koray.authors[0].displayName, 'Prof. Dr. Semih Koray');
  assert.equal(koray.authors[0].givenName, 'Semih');
  assert.equal(koray.authors[0].familyName, 'Koray');

  const wang = JSON.parse(fs.readFileSync('content/articles/kusak-ve-yol-girisiminin-yuksek-nitelikli-gelisimi-icin-yeni-bir-yolculuk/metadata.json', 'utf8'));
  assert.equal(wang.authors[0].displayName, 'Wang Yi');
  assert.equal(wang.authors[0].givenName, 'Yi');
  assert.equal(wang.authors[0].familyName, 'Wang');

  const yang = JSON.parse(fs.readFileSync('content/articles/ortadogudaki-bolgesel-duzenin-yeniden-insasinda-cinin-rolu-itici-gucler-firsatlar-ve-zorluklar/metadata.json', 'utf8'));
  assert.ok(yang.funding);
  assert.match(yang.funding.statement.tr, /18ZDA170/);
  assert.equal(yang.funding.funders.length, 3);
  assert.deepEqual(yang.funding.funders[2].awardNumbers, ['18ZDA170']);

  const haydar = JSON.parse(fs.readFileSync('content/articles/dunyanin-kusak-yola-kusak-yolun-siire-ihtiyaci-var-ve-kusak-yol-sairlerine-cagri/metadata.json', 'utf8'));
  assert.equal(haydar.acknowledgements, null);
});

test('V01-I02 metadata fidelity and translator attribution repairs remain canonical', () => {
  const sultan = JSON.parse(fs.readFileSync('content/articles/cinin-sudan-ve-guney-sudandaki-catisma-cozumune-katilimi-bir-yaratici-arabuluculuk-ornegi/metadata.json', 'utf8'));
  assert.equal(sultan.acknowledgements, 'Çevirmen: Diltra Çeviri Bürosu');

  const gong = JSON.parse(fs.readFileSync('content/articles/cinin-yeni-koronavirus-zaturresine-karsi-savasi-mucadeleler-sonuclar-ve-yansimalar/metadata.json', 'utf8'));
  assert.equal(gong.acknowledgements, 'Çeviri: Mehmet Enes Başer - Doğukan Doğu');

  const yang = JSON.parse(fs.readFileSync('content/articles/ortadoguda-guvenlik-ikileminin-cinin-kusak-ve-yol-girisimine-etkisi/metadata.json', 'utf8'));
  assert.equal(yang.acknowledgements, 'Çeviri: Kurtuluş Özgür Yıldız');

  const sahin = JSON.parse(fs.readFileSync('content/articles/cok-kutuplulasan-dunyada-geleneksel-olmayan-guvenlik-anlayisi-sio-ornegi/metadata.json', 'utf8'));
  assert.equal(sahin.acknowledgements, 'Translated from Turkish to English by Ayçe Feride Köroğlu');
});

test('V01-I03 metadata fidelity and historical-document classification repairs remain canonical', () => {
  const gao = JSON.parse(fs.readFileSync('content/articles/turk-milli-ordusunun-zaferinin-uluslarasi-kiymeti/metadata.json', 'utf8'));
  assert.equal(gao.articleType.id, 'historical-document');
  assert.equal(gao.articleType.tr, 'Tarihten');
  assert.equal(gao.articleType.en, 'History');
  assert.equal(gao.title.tr, "Türk Milli Ordusu'nun Zaferinin Uluslararası Kıymeti");
  assert.doesNotMatch(gao.citation.tr, /Uluslarası/u);
});

test('V01-I04 metadata fidelity, routing and title prefix repairs remain canonical', () => {
  const cheng = JSON.parse(fs.readFileSync('content/articles/kusak-ve-yol-girisiminde-deniz-isbirliginin-gunumuzdeki-ve-gelecekteki-durumu/metadata.json', 'utf8'));
  assert.equal(cheng.urls.pdfEn, null);

  const mesud = JSON.parse(fs.readFileSync('content/articles/iranda-ataturk-ve-milli-mucadele-konusunda-ilk-kitap/metadata.json', 'utf8'));
  assert.equal(mesud.articleType.id, 'historical-document');
  assert.equal(mesud.title.en, 'The First Book About Atatürk Ever Published in Iran');
  assert.match(mesud.urls.pdfEn, /ENG\.pdf$/u);
  assert.match(mesud.urls.pdfTr, /TR\.pdf$/u);

  const serdar = JSON.parse(fs.readFileSync('content/articles/covid-19-sonrasi-kuresel-sistem-eski-sorunlar-yeni-trendler/metadata.json', 'utf8'));
  assert.equal(serdar.title.en, 'Post-COVID-19 Global System: Old Problems, New Trends');

  const nimin = JSON.parse(fs.readFileSync('content/articles/fotograf-ni-min-fujian-huian-kadini-ag-onariyor/metadata.json', 'utf8'));
  assert.equal(nimin.title.tr, "Fujian Hui'an Kadını Ağ Onarıyor");
  assert.equal(nimin.title.en, "Fujian Hui'an Maiden's Weaving Net");
});

test('Archive-data synchronization remains intact with metadata', async () => {
  const currentArchive = await getArchive();
  const bySlug = new Map(currentArchive.articles.map((a) => [a.slug, a]));
  for (const iss of v1Issues) {
    for (const slug of iss.articles) {
      const art = bySlug.get(slug);
      assert.ok(art, `article exists in archive data: ${slug}`);
      const meta = JSON.parse(fs.readFileSync(path.join('content/articles', slug, 'metadata.json'), 'utf8'));
      assert.equal(art.title_tr, meta.title.tr);
      assert.equal(art.title_en, meta.title.en);
      assert.equal(art.pdf_en_source, meta.urls.pdfEn);
      assert.equal(art.pdf_tr_source, meta.urls.pdfTr);
      assert.equal(art.publication_type_tr, meta.articleType.tr);
      assert.equal(art.publication_type_en, meta.articleType.en);
    }
  }
});
