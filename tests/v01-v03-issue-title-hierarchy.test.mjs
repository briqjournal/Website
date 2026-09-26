import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Volume 1–3 issue title hierarchy is shared across Turkish and English", async () => {
  const copy = await readFile(new URL("../app/issue-copy.ts", import.meta.url), "utf8");

  const expectedRows = [
    ['"3-4"', 'tr: { title: "Uygarlığın İpek Yolu", subtitle: "Sanatın Ve Kültürün Köklerine Yolculuk" }', 'en: { title: "The Silk Road of Civilization", subtitle: "Journey to the Roots of Art and Culture" }'],
    ['"3-3"', 'tr: { title: "Yeşil Hidrojen", subtitle: "Ekolojik Uygarlığın Enerjisi" }', 'en: { title: "Green Hydrogen", subtitle: "The Energy of Ecological Civilization" }'],
    ['"3-2"', 'tr: { title: "Gelişen Dünyanın Alternatif Kalkınma Programı", subtitle: "" }', 'en: { title: "Alternative Models of Development for Developing Countries", subtitle: "" }'],
    ['"3-1"', 'tr: { title: "Ortak Kader Ortak Gelecek", subtitle: "Türkiye Cumhuriyeti İle Çin Halk Cumhuriyeti Arasında Diplomatik İlişkilerin 50. Yılı" }', 'en: { title: "Common Destiny Shared Future", subtitle: "50th Anniversary of Diplomatic Relations Between the Republic of Turkey and the People’s Republic of China" }'],
    ['"2-3"', 'tr: { title: "Ekolojik Uygarlık", subtitle: "Asya Çağının Habercisi" }', 'en: { title: "Ecological Civilization", subtitle: "The Herald of the Asian Age" }'],
    ['"2-2"', 'tr: { title: "Ortak Geleceğin İnşası İçin Bilim Ve Teknolojide İşbirliği", subtitle: "" }', 'en: { title: "Cooperation in Science and Technology for Building a Shared Future", subtitle: "" }'],
    ['"2-1"', 'tr: { title: "Deniz İpek Yolu’nda “Mavi Vatan” Buluşması", subtitle: "" }', 'en: { title: "Reclaiming the \'Blue Homeland\' Through the Maritime Silkroad.", subtitle: "" }'],
    ['"1-4"', 'tr: { title: "Deniz İpek Yolu’nda Ortak Rota", subtitle: "" }', 'en: { title: "The Common Course Towards the Maritime Silk Road", subtitle: "" }'],
    ['"1-3"', 'tr: { title: "Paylaşarak Gelişme Çağı", subtitle: "COVID-19 Sonrası Yeni Dünya" }', 'en: { title: "Towards an Era of Shared Development", subtitle: "The New World After COVID-19" }'],
    ['"1-2"', 'tr: { title: "Uluslararası Güvenliğin Yolu", subtitle: "" }', 'en: { title: "The Road to International Security", subtitle: "" }'],
  ];

  for (const [key, tr, en] of expectedRows) {
    const start = copy.indexOf(`  ${key}: {`);
    assert.notEqual(start, -1, `missing issue ${key}`);
    const end = copy.indexOf("\n  },", start);
    const block = copy.slice(start, end);
    assert.ok(block.includes(tr), `missing Turkish hierarchy for ${key}`);
    assert.ok(block.includes(en), `missing English hierarchy for ${key}`);
  }

  const layoutBlock = copy.match(/const subtitleFirstIssues = new Set\(\[([\s\S]*?)\]\);/)?.[1] ?? "";
  for (const key of ["3-4", "3-3", "3-1", "2-3", "1-3"]) {
    assert.match(layoutBlock, new RegExp(`"${key}"`));
  }
  for (const key of ["3-2", "2-2", "2-1", "1-4", "1-2"]) {
    assert.doesNotMatch(layoutBlock, new RegExp(`"${key}"`));
  }
});
