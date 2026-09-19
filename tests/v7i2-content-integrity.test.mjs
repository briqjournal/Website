import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = "content/articles";

const slugs = {
  soviet: "sovyet-reformunun-tarihi-trajedisinden-bizi-kurtaran-ne-oldu-cinin-ekonomik-cagdaslasmasina-yon-0",
  jian: "cine-ozgu-sosyalist-politik-ekonomiye-genel-bakis",
  africa: "afrikada-yabanci-guclerin-mudahaleleri-elestirel-bir-degerlendirme",
  fang: "uluslararasi-kalkinma-isbirliginin-ic-siyasal-mantigi-guneydogu-asyada-kusak-ve-yol-girisiminin",
  rugemer: "hitlerin-sovyetler-birligine-karsi-savasi-ayni-zamanda-abd-icin-bir-vekalet-savasiydi",
  onishi: "japonyadaki-abd-isgaline-karsi-sag-ve-sol-arasinda-olasi-ittifak",
};

function fulltext(slug, locale) {
  return JSON.parse(fs.readFileSync(path.join(root, slug, "fulltext", `${locale}.json`), "utf8"));
}

test("V7I2 preserves the PDF-verified heading and reference repairs", () => {
  const rugEn = fulltext(slugs.rugemer, "en");
  const rugTr = fulltext(slugs.rugemer, "tr");
  assert.ok(rugEn.sections.some((section) => section.title === "No Bombing of German and US Arms Factories!"));
  assert.ok(rugTr.sections.some((section) => section.title === "Alman ve ABD Silah Fabrikalarının Bombalanmaması!"));

  const africaEn = fulltext(slugs.africa, "en");
  const africaTr = fulltext(slugs.africa, "tr");
  assert.equal(
    africaEn.references.find((reference) => reference.id === "ref-10")?.text,
    "Britannica. (n. d.). Partition of Africa. Retrieved September 22, 2025, from https://www.britannica.com/topic/Western-colonialism/Partition-of-Africa."
  );
  assert.equal(
    africaEn.references.find((reference) => reference.id === "ref-15")?.text,
    "Global Terrorism Index. (2023). Relief Web. Retrieved September 22, 2025, from https://reliefweb.int/report/world/global-terrorism-index-2023."
  );
  assert.equal(
    africaTr.references.find((reference) => reference.id === "ref-49")?.text,
    "Toulemonde, M. (2021). Inside the Great African Land Rush. 22 Eylül 2025 tarihinde https://www.theafricareport.com/77291/inside-the-great-african-land-rush/ adresinden alınmıştır."
  );
});

test("V7I2 restores the published visual inventories and assets", () => {
  const expected = new Map([
    [slugs.soviet, { en: 5, tr: 5 }],
    [slugs.jian, { en: 8, tr: 9 }],
    [slugs.africa, { en: 10, tr: 10 }],
    [slugs.fang, { en: 12, tr: 12 }],
    [slugs.rugemer, { en: 3, tr: 3 }],
    [slugs.onishi, { en: 3, tr: 3 }],
  ]);

  for (const [slug, counts] of expected) {
    for (const locale of ["en", "tr"]) {
      const data = fulltext(slug, locale);
      assert.equal(data.figures?.length, counts[locale], `${slug} ${locale}`);
      for (const figure of data.figures) {
        assert.match(figure.caption, /\S/u, `${slug} ${locale} ${figure.id}`);
        assert.doesNotMatch(figure.caption, /^(?:Figure|Şekil)\s*\d*$/u, `${slug} ${locale} ${figure.id}`);
        assert.ok(figure.src?.startsWith("/assets/article-figures/"), `${slug} ${locale} ${figure.id}`);
        assert.ok(fs.existsSync(path.join("public", figure.src.slice(1))), `${slug} ${locale} ${figure.src}`);
      }
    }
  }

  const onishiEn = fulltext(slugs.onishi, "en");
  assert.match(onishiEn.figures[1].caption, /^Figure: JCP’s Strategic Shift/);
  const fangEn = fulltext(slugs.fang, "en");
  assert.match(fangEn.figures[5].caption, /^Figure 1\. The Impossible Trinity/);
  assert.match(fangEn.figures[11].caption, /Illustration: Shen Shiwei & Huang Ruiqi\/CGTN, 2023/);
});
