import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
const root=process.cwd();
const issue=JSON.parse(await readFile(join(root,'content/issues/v06-i03.json'),'utf8'));
const load=async(slug,loc)=>JSON.parse(await readFile(join(root,'content/articles',slug,'fulltext',`${loc}.json`),'utf8'));
const iratni='cezayir-devrimci-diplomasisi-bandung-temel-girisiminden-yeni-bir-baglantisizlar-konseptine';
const interview='70-yilinda-bandung-baglantisizliktan-hegemonyaciliga-karsi-milli-devletlerin-ortak-kalkinma-ve';
const zhang='endonezya-dis-politikasinda-bandung-mirasina-yeniden-bakis-tarihsel-bir-inceleme-ve-guncel';
const akalin='bandung-ruhu-70-yasinda';
const fang='bandung-konferansi-oncesi-ve-sonrasinda-yeni-cinin-dis-politikasi-bandung-konferansini-yeniden';
const expected=new Map([
 [`${iratni}:en`,['Introduction','The “Mecca” of the Revolutionaries','Diplomatic support','Arms and military training for African freedom fighters','The Arduous Quest for a Militant Non-Aligned Movement','Adapting the Non-Aligned Movement to an Evolving Global Landscape','Conclusion']],
 [`${iratni}:tr`,['Giriş','Devrimcilerin “Mekke’si”','Diplomatik destek','Afrika özgürlük savaşçıları için silah ve askeri eğitim','Militan Bağlantısızlar Hareketi için Zorlu Arayış','Bağlantısızlar Hareketi’ni Değişen Uluslararası Bağlama Uyarlama','Sonuç']],
 [`${interview}:en`,['Interview','The Path of National States against Imperialism','The Dynamics of Multipolarity: How Today Differs from Yesterday','The Strategy Turkey Needs']],
 [`${interview}:tr`,['Röportaj','Emperyalizme Karşı Milli Devletlerin Önündeki Yol','Çok Kutupluluğun Dinamikleri ve Bugünün Dünden Farkı','Türkiye’nin İhtiyacı Olan Strateji']],
 [`${zhang}:en`,['Introduction','Why did Indonesia Initiate the Bandung Conference?','Reconfiguration of Global Powers Necessitates Third World Nations Uniting for Mutual Support','The Recently Liberated Indonesia was in Urgent Need of Asserting its Sovereignty and Independence','Sukarno’s Firm Anti-Imperialist and Anti-Colonialist Stance','Bandung Conference and Indonesia’s Domestic Diplomacy','Indonesia’s Inheritance or Divergence from the Bandung Legacy','The Transformation of Indonesian Diplomacy and its Contribution to Fostering the Bandung Spirit','Conclusion']],
 [`${akalin}:en`,['Introduction','The Global Landscape Prior to the Bandung Conference','Asian Relations Conference in Delhi','China’s Contributions','Indonesia’s Contributions','Bandung-Asia-Africa Conference','Nehru-Zorlu conflict during the conference','Bandung Conference in Turkish Press','Western Positions on Bandung','Non-Alignement Movement After Bandung','Conclusion']],
 [`${fang}:en`,['Introduction','Before the Bandung Conference: From “Leaning to One Side” to peaceful coexistence','The historical logic of the “one-sided” diplomatic strategy','One of the important manifestations of “Leaning to One Side”: The Korean War','The Proposal of the Five Principles of Peaceful Coexistence','In the Bandung Conference: Exploration of New Diplomatic Routes','Preparation for the Conference: The Indonesian Initiative and the Bogor Conference','Conference process: Zhou Enlai’s diplomatic practice','Outcome of the Conference: The Ten Principles of Bandung','After the Bandung Conference: The evolution of Chinese Foreign policy','Conclusion']],
]);
test('V6I3 source-verified heading hierarchy is stable',async()=>{
 for(const [key,titles] of expected){const [slug,loc]=key.split(':');const d=await load(slug,loc);assert.deepEqual(d.sections.map(s=>s.title),titles,key);}
});
test('V6I3 prose has no obvious column-break artifacts or page-number ghosts',async()=>{
 for(const slug of issue.articles){for(const loc of ['en','tr']){const d=await load(slug,loc);const paras=d.sections.flatMap(s=>s.paragraphs||[]);const prose=paras.join('\n');assert.doesNotMatch(prose,/\b\d{3}\1\b/);for(let i=0;i<paras.length-1;i++){assert.ok(!(/[A-Za-zÇĞİÖŞÜçğıöşü]-$/.test(paras[i])&&/^[a-zçğıöşü]/.test(paras[i+1])),`${slug} ${loc} broken boundary: ${paras[i].slice(-40)} | ${paras[i+1].slice(0,40)}`);}}}
});
test('V6I3 false pull-quotes are not section headings',async()=>{
 const bad=['An infrequently promoted episode included the assistance provided by Fidel Castro to Algeria.','The aim was to counter US maneuvers to weaken the third world coalition by using OPEC member countries against non-oil developing countries.','(Feng & Jin, 2003: 590).','Spirit','Involved States,','China’s international political circumstances progressively enhanced following the Bandung meeting.'];
 for(const slug of issue.articles){for(const loc of ['en','tr']){const d=await load(slug,loc);for(const title of d.sections.map(s=>s.title))assert.ok(!bad.includes(title),`${slug} ${loc}: false heading ${title}`);}}
});
