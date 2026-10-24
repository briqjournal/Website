import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../dist/client/", import.meta.url);
const groups = [
  {
    "slug": "amit-kumar-ve-dr-veena-ramachandran",
    "members": [
      "amit-kumar",
      "veena-ramachandran"
    ]
  },
  {
    "slug": "cheng-enfu-ve-li-jing",
    "members": [
      "cheng-enfu",
      "li-jing"
    ]
  },
  {
    "slug": "cheng-enfu-ve-lu-chunyi",
    "members": [
      "cheng-enfu",
      "lu-chunyi"
    ]
  },
  {
    "slug": "dr-bassam-abu-abdullah-ve-dr-ziad-ayoub-arbache",
    "members": [
      "bassam-abu-abdullah",
      "ziad-ayoub-arbache"
    ]
  },
  {
    "slug": "dr-mohamad-zreik-prof-dr-zhao-changfeng",
    "members": [
      "mohamad-zreik",
      "zhao-changfeng"
    ]
  },
  {
    "slug": "dr-ogr-uyesi-assadollah-athari-ve-dr-ehsan-ejazi",
    "members": [
      "assadollah-athari",
      "ehsan-ejazi"
    ]
  },
  {
    "slug": "efe-can-gurcan-ve-omer-ersin-kahraman",
    "members": [
      "efe-can-gurcan",
      "omer-ersin-kahraman"
    ]
  },
  {
    "slug": "fahri-erenel-ahmet-gedik",
    "members": [
      "fahri-erenel",
      "ahmet-gedik"
    ]
  },
  {
    "slug": "fang-chenyu-ve-wang-weibin",
    "members": [
      "fang-chenyu",
      "wang-weibin"
    ]
  },
  {
    "slug": "liu-ningning-cheng-enfu",
    "members": [
      "liu-ningning",
      "cheng-enfu"
    ]
  },
  {
    "slug": "luis-kato-maldonado-ve-guadalupe-huerta-moreno",
    "members": [
      "luis-kato-maldonado",
      "guadalupe-huerta-moreno"
    ]
  },
  {
    "slug": "necati-demircan-ye-zhangxu",
    "members": [
      "necati-demircan",
      "ye-zhangxu"
    ]
  },
  {
    "slug": "prof-dr-song-shuli-prof-dr-cheng-enfu",
    "members": [
      "song-shuli",
      "cheng-enfu"
    ]
  },
  {
    "slug": "prof-dr-sun-degang-dr-aml-ali-abdrabou",
    "members": [
      "sun-degang",
      "aml-ali-abdrabou"
    ]
  },
  {
    "slug": "prof-dr-sun-degang-zhang-jieying",
    "members": [
      "sun-degang",
      "zhang-jieying"
    ]
  },
  {
    "slug": "semih-guneri-ayca-avci-ahmet-z-bayburt",
    "members": [
      "semih-guneri",
      "ayca-avci",
      "ahmet-z-bayburt"
    ]
  },
  {
    "slug": "shangtao-gao-jessica-durdu",
    "members": [
      "shangtao-gao",
      "jessica-durdu"
    ]
  },
  {
    "slug": "wenbo-zhang-quan-heng",
    "members": [
      "wenbo-zhang",
      "quan-heng"
    ]
  },
  {
    "slug": "yang-chen-ma-jinting",
    "members": [
      "yang-chen",
      "ma-jinting"
    ]
  },
  {
    "slug": "zhang-qingyi-du-donghui",
    "members": [
      "zhang-qingyi",
      "du-donghui"
    ]
  },
  {
    "slug": "zhang-yan-jun-liu-yu-jun",
    "members": [
      "zhang-yan-jun",
      "liu-yu-jun"
    ]
  }
];

test("21 bilingual historical coauthor routes are prerendered with correct metadata and members", async () => {
  assert.equal(groups.length, 21);
  const sitemap = await readFile(new URL("sitemap.xml", root), "utf8");
  const expectedSitemap = new Set();
  for (const { slug, members } of groups) {
    assert.ok(members.length >= 2);
    const trPath = `tr/ortak-yazarlar/${slug}/`;
    const enPath = `en/coauthors/${slug}/`;
    const trHref = `https://briqjournal.com/${trPath}`;
    const enHref = `https://briqjournal.com/${enPath}`;
    assert.ok(!expectedSitemap.has(trHref) && !expectedSitemap.has(enHref));
    expectedSitemap.add(trHref);
    expectedSitemap.add(enHref);
    const [tr, en] = await Promise.all([
      readFile(new URL(`${trPath}index.html`, root), "utf8"),
      readFile(new URL(`${enPath}index.html`, root), "utf8"),
    ]);
    assert.ok(tr.includes(`rel="canonical" href="${trHref}"`), `TR canonical ${slug}`);
    assert.ok(en.includes(`rel="canonical" href="${enHref}"`), `EN canonical ${slug}`);
    assert.ok(tr.includes(`hrefLang="en-US" href="${enHref}"`), `TR reciprocal hreflang ${slug}`);
    assert.ok(en.includes(`hrefLang="tr-TR" href="${trHref}"`), `EN reciprocal hreflang ${slug}`);
    for (const id of members) {
      assert.ok(tr.includes(`href="/tr/yazar/${id}/"`), `TR author ${id} in ${slug}`);
      assert.ok(en.includes(`href="/en/authors/${id}/"`), `EN author ${id} in ${slug}`);
    }
    assert.match(tr, /href="\/tr\/makaleler\/[a-z0-9-]+\/"/, `TR shared publication in ${slug}`);
    assert.match(en, /href="\/en\/articles\/[a-z0-9-]+\/"/, `EN shared publication in ${slug}`);
  }
  for (const url of expectedSitemap) {
    assert.ok(sitemap.includes(`<loc>${url}</loc>`), `Sitemap missing ${url}`);
  }
});

test("historical collaboration with two published works retains both links", async () => {
  const path = new URL("tr/ortak-yazarlar/necati-demircan-ye-zhangxu/index.html", root);
  const html = await readFile(path, "utf8");
  assert.ok(html.includes("/tr/makaleler/ikinci-cin-japon-savasi-sirasinda-rol-model-olarak-ankara-chongqing-bizim-ankaramiz/"));
  assert.ok(html.includes("/tr/makaleler/turk-devriminin-ckp-uzerindeki-etkisi-cai-hesenin-turkiye-yazilari-uzerine-inceleme/"));
  assert.ok(html.includes('href="/tr/yazar/necati-demircan/"'));
  assert.ok(html.includes('href="/tr/yazar/ye-zhangxu/"'));
});
