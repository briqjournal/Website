import assert from "node:assert/strict";
import test from "node:test";

const BASE = "https://briqjournal.com";
const VERIFIED = [
  ["/tr/yazar/prof-dr-ahmet-kavas", "/tr/yazar/ahmet-kavas/"],
  ["/tr/yazar/prof-dr-li-xi", "/tr/yazar/li-xi/"],
  ["/en/authors/8", "/en/authors/dominik-pietzcker/"],
  ["/tr/yazar/dr-ramzy-baroud", "/tr/yazar/ramzy-baroud/"],
  ["/en/authors/prof-dr-emin-gurses", "/en/authors/emin-gurses/"],
  ["/en/authors/prof-dr-ugur-murat-leloglu", "/en/authors/ugur-murat-leloglu/"],
  ["/tr/yazar/dr-ceyhun-ilsever", "/tr/yazar/ceyhun-ilsever/"],
  ["/tr/yazar/cheng-enfu-ve-li-jing", "/tr/yazar/cheng-enfu/"],
  ["/tr/yazar/prof-dr-ugur-murat-leloglu", "/tr/yazar/ugur-murat-leloglu/"],
  ["/tr/yazar/dr-hande-gunozu", "/tr/yazar/hande-gunozu/"],
  ["/en/authors/dr-hande-gunozu", "/en/authors/hande-gunozu/"],
  ["/en/authors/prof-dr-sun-degang", "/en/authors/sun-degang/"],
  ["/tr/yazar/dr-mehmet-perincek", "/tr/yazar/mehmet-perincek/"],
  ["/tr/yazar/necati-demircan-ye-zhangxu", "/tr/yazar/necati-demircan/"],
  ["/en/authors/7", "/en/authors/mehmet-adnan-akfirat/"],
  ["/tr/yazar/dr-sean-thomas-mckenna", "/tr/yazar/sean-thomas-mckenna/"],
  ["/en/authors/prof-dr-li-xi", "/en/authors/li-xi/"],
  ["/en/authors/sultan-hem-ve-degang-sun", "/en/authors/hend-elmahly-mahmoud-sultan/"],
  ["/en/authors/dr-sean-thomas-mckenna", "/en/authors/sean-thomas-mckenna/"],
  ["/tr/yazar/assoc-prof-dr-aleksandr-sotnicenko", "/tr/yazar/aleksandr-sotnicenko/"],
  ["/en/authors/dr-francisco-dominguez", "/en/authors/francisco-dominguez/"],
  ["/tr/yazar/yi-shaoxuan-yang-chen", "/tr/yazar/yi-shaoxuan/"],
  ["/tr/yazar/prof-dr-birol-kilkis", "/tr/yazar/birol-kilkis/"],
  ["/en/authors/prof-jinghua-cao", "/en/authors/jinghua-cao/"],
  ["/tr/yazar/prof-dr-semih-koray", "/tr/yazar/semih-koray/"],
  ["/tr/yazar/yang-chen-ma-jinting", "/tr/yazar/yang-chen/"],
  ["/tr/yazar/dr-mohamad-zreik-prof-dr-zhao-changfeng", "/tr/yazar/mohamad-zreik/"],
  ["/tr/yazar/dr-ogr-uyesi-assadollah-athari-ve-dr-ehsan-ejazi", "/tr/yazar/assadollah-athari/"],
  ["/tr/yazar/7", "/tr/yazar/mehmet-adnan-akfirat/"],
  ["/tr/yazar/assoc-prof-dr-yang-chen", "/tr/yazar/yang-chen/"],
  ["/tr/yazar/doc-dr-efe-can-gurcan", "/tr/yazar/efe-can-gurcan/"],
  ["/tr/yazar/prof-dr-emin-gurses", "/tr/yazar/emin-gurses/"],
  ["/en/authors/prof-dr-mehmet-celal-ozdogan", "/en/authors/mehmet-celal-ozdogan/"],
  ["/tr/yazar/doc-dr-siir-kilkis", "/tr/yazar/siir-kilkis/"],
  ["/en/authors/dr-can-ulusoy", "/en/authors/can-ulusoy/"],
  ["/en/authors/prof-dr-song-shuli-prof-dr-cheng-enfu", "/en/authors/song-shuli/"],
  ["/tr/yazar/mao-zedung", "/tr/yazar/mao-zedong/"],
  ["/tr/yazar/wang-laixi-na-risu-wu-lan", "/tr/yazar/wang-laixi/"],
  ["/en/authors/wang-laixi-na-risu-wu-lan", "/en/authors/wang-laixi/"],
  ["/tr/yazar/zhang-yan-jun-liu-yu-jun", "/tr/yazar/zhang-yan-jun/"],
  ["/tr/yazar/prof-dr-sun-degang-dr-aml-ali-abdrabou", "/tr/yazar/sun-degang/"],
  ["/en/authors/prof-dr-gunay-cifci", "/en/authors/gunay-cifci/"],
  ["/en/authors/zhang-qingyi-du-donghui", "/en/authors/zhang-qingyi/"],
  ["/tr/yazar/igor-korotchenko", "/tr/yazar/igor-korotcenko/"],
  ["/tr/yazar/sule-perincek", "/tr/yazar/h-sule-perincek/"],
  ["/tr/yazar/expert-committee-shanghai-energy-conservation-commission", "/tr/yazar/expert-committee-of-shanghai-energy-conservation-commission/"],
  ["/en/authors/zhang-yan-jun-liu-yu-jun", "/en/authors/zhang-yan-jun/"],
  ["/en/authors/prof-dr-guo-changgang", "/en/authors/guo-changgang/"],
  ["/en/authors/igor-korotchenko", "/en/authors/igor-korotcenko/"],
  ["/tr/yazar/liu-ningning-cheng-enfu", "/tr/yazar/liu-ningning/"],
  ["/tr/yazar/prof-dr-sun-degang", "/tr/yazar/sun-degang/"],
  ["/en/authors/necati-demircan-ye-zhangxu", "/en/authors/necati-demircan/"],
  ["/tr/yazar/prof-dr-mehmet-celal-ozdogan", "/tr/yazar/mehmet-celal-ozdogan/"],
  ["/tr/yazar/8", "/tr/yazar/dominik-pietzcker/"],
  ["/en/authors/prof-dr-david-laibman", "/en/authors/david-laibman/"],
  ["/tr/yazar/zhang-qingyi-du-donghui", "/tr/yazar/zhang-qingyi/"],
  ["/en/authors/prof-dr-semih-koray", "/en/authors/semih-koray/"],
  ["/en/authors/cheng-enfu-ve-lu-chunyi", "/en/authors/cheng-enfu/"],
  ["/en/authors/prof-ding-xiaoqin", "/en/authors/ding-xiaoqin/"],
  ["/en/authors/doc-dr-han-zhimin", "/en/authors/han-zhimin/"],
  ["/en/authors/liu-ningning-cheng-enfu", "/en/authors/liu-ningning/"],
  ["/en/authors/expert-committee-shanghai-energy-conservation-commission", "/en/authors/expert-committee-of-shanghai-energy-conservation-commission/"],
  ["/en/authors/sule-perincek", "/en/authors/h-sule-perincek/"],
  ["/en/authors/assoc-prof-dr-aleksandr-sotnicenko", "/en/authors/aleksandr-sotnicenko/"],
  ["/tr/yazar/prof-dr-gunay-cifci", "/tr/yazar/gunay-cifci/"],
  ["/tr/yazar/cheng-enfu-ve-lu-chunyi", "/tr/yazar/cheng-enfu/"],
  ["/tr/yazar/doc-dr-han-zhimin", "/tr/yazar/han-zhimin/"],
  ["/tr/yazar/prof-ding-xiaoqin", "/tr/yazar/ding-xiaoqin/"],
  ["/en/authors/dr-mohamad-zreik-prof-dr-zhao-changfeng", "/en/authors/mohamad-zreik/"],
  ["/en/authors/prof-caner-karavit", "/en/authors/caner-karavit/"],
  ["/en/authors/drarif-acaloglu", "/en/authors/arif-acaloglu/"],
  ["/en/authors/fahri-erenel-ahmet-gedik", "/en/authors/fahri-erenel/"],
  ["/en/authors/luis-kato-maldonado-ve-guadalupe-huerta-moreno", "/en/authors/luis-kato-maldonado/"],
  ["/en/authors/dr-digby-james-wren", "/en/authors/digby-james-wren/"],
  ["/tr/yazar/fahri-erenel-ahmet-gedik", "/tr/yazar/fahri-erenel/"],
  ["/tr/yazar/drarif-acaloglu", "/tr/yazar/arif-acaloglu/"],
  ["/en/authors/prof-dr-radhika-desai", "/en/authors/radhika-desai/"],
  ["/tr/yazar/semih-guneri-ayca-avci-ahmet-z-bayburt", "/tr/yazar/semih-guneri/"],
  ["/en/authors/dr-tulin-uygur", "/en/authors/tulin-uygur/"],
  ["/en/authors/prof-cheng-enfu", "/en/authors/cheng-enfu/"],
  ["/en/authors/amit-kumar-ve-dr-veena-ramachandran", "/en/authors/amit-kumar/"],
  ["/tr/yazar/prof-dr-radhika-desai", "/tr/yazar/radhika-desai/"],
  ["/tr/yazar/dr-ali-sahin", "/tr/yazar/ali-sahin/"],
  ["/tr/yazar/sultan-hem-ve-degang-sun", "/tr/yazar/hend-elmahly-mahmoud-sultan/"],
  ["/en/authors/dr-ramzy-baroud", "/en/authors/ramzy-baroud/"],
  ["/en/authors/semih-guneri-ayca-avci-ahmet-z-bayburt", "/en/authors/semih-guneri/"],
  ["/tr/yazar/efe-can-gurcan-ve-omer-ersin-kahraman", "/tr/yazar/efe-can-gurcan/"],
  ["/en/authors/prof-dr-birol-kilkis", "/en/authors/birol-kilkis/"],
  ["/en/authors/doc-dr-siir-kilkis", "/en/authors/siir-kilkis/"],
  ["/tr/yazar/prof-dr-guo-changgang", "/tr/yazar/guo-changgang/"],
  ["/en/authors/degang-sun-yingqi-yang", "/en/authors/sun-degang/"],
  ["/tr/yazar/dr-alexandr-bovdunov", "/tr/yazar/alexandr-bovdunov/"],
  ["/en/authors/wenbo-zhang-quan-heng", "/en/authors/wenbo-zhang/"],
  ["/en/authors/doc-dr-efe-can-gurcan", "/en/authors/efe-can-gurcan/"],
  ["/tr/yazar/shangtao-gao-jessica-durdu", "/tr/yazar/shangtao-gao/"],
  ["/en/authors/yi-shaoxuan-yang-chen", "/en/authors/yi-shaoxuan/"],
  ["/tr/yazar/dr-ersel-zafer-oral", "/tr/yazar/ersel-zafer-oral/"],
  ["/en/authors/assoc-prof-dr-yang-chen", "/en/authors/yang-chen/"],
  ["/en/authors/prof-dr-ahmet-kavas", "/en/authors/ahmet-kavas/"],
  ["/en/authors/shangtao-gao-jessica-durdu", "/en/authors/shangtao-gao/"],
  ["/tr/yazar/dr-tulin-uygur", "/tr/yazar/tulin-uygur/"],
  ["/tr/yazar/dr-can-ulusoy", "/tr/yazar/can-ulusoy/"],
  ["/tr/yazar/prof-dr-ufuk-tutan", "/tr/yazar/ufuk-tutan/"],
];

async function worker() {
  return (await import(new URL("../dist/server/index.js", import.meta.url))).default;
}

async function request(path) {
  return (await worker()).fetch(
    new Request(BASE + path),
    { ASSETS: { fetch: async () => new Response("Not Found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("103 verified legacy author profile URLs redirect to existing individual profiles in one hop", async () => {
  assert.equal(VERIFIED.length, 103);
  assert.equal(new Set(VERIFIED.map(([source]) => source)).size, 103);
  for (const [source, destination] of VERIFIED) {
    const response = await request(source);
    assert.equal(response.status, 301, `expected permanent redirect: ${source}`);
    assert.equal(new URL(response.headers.get("location")).href, BASE + destination, source);
    assert.ok(/\\/(?:tr\\/yazar|en\\/authors)\\//.test(destination), source);
  }
});

test("historical author profile aliases preserve query parameters and trailing-slash variants", async () => {
  for (const source of ["/en/authors/prof-dr-ahmet-kavas", "/tr/yazar/cheng-enfu-ve-li-jing", "/en/authors/fahri-erenel-ahmet-gedik"]) {
    const target = VERIFIED.find(([s]) => s === source)?.[1];
    assert.ok(target);
    const response = await request(source + "/?ref=gsc");
    assert.equal(response.status, 301);
    const location = new URL(response.headers.get("location"));
    assert.equal(location.pathname, target);
    assert.equal(location.search, "?ref=gsc");
  }
});

test("ambiguous historical group identities and CMS records are never aliased to invented profiles", () => {
  const unverified = [
    "/en/authors/prof-dr-yang-guang",
    "/tr/yazar/prof-dr-yang-guang",
    "/en/authors/inan-oner",
    "/tr/yazar/inan-oner",
    "/en/authors/dr-bassam-abu-abdullah-ve-dr-ziad-ayoub-arbache",
    "/tr/yazar/dr-bassam-abu-abdullah-ve-dr-ziad-ayoub-arbache",
    "/en/authors/admin",
  ];
  for (const path of unverified) assert.ok(!VERIFIED.some(([source]) => source === path), path);
});
