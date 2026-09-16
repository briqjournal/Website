import fs from 'node:fs';

const file = 'content/catalog.json';
const catalog = JSON.parse(fs.readFileSync(file, 'utf8'));
const anchor = 'kusak-ve-yol-girisimi-bolgesellesme-ve-kuresellesme-icin-yeni-itici-guc';
const additions = ['sessiz-isik', 'mavi-vatan', 'silahlarin-kulturu'];

catalog.article_order = catalog.article_order.filter((slug) => !additions.includes(slug));
const index = catalog.article_order.indexOf(anchor);
if (index < 0) throw new Error(`Anchor not found: ${anchor}`);
catalog.article_order.splice(index + 1, 0, ...additions);
fs.writeFileSync(file, JSON.stringify(catalog, null, 2) + '\n');
console.log('Inserted Cilt 4 Issue 1 visual entries into article_order.');
