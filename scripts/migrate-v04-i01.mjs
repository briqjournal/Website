import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { extname, join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const pdfs = {
  en: join(root, "tmp/v04-i01-source/en.pdf"),
  tr: join(root, "tmp/v04-i01-source/tr.pdf"),
};
for (const path of Object.values(pdfs)) {
  if (!existsSync(path)) throw new Error(`Missing source PDF: ${path}`);
}

const records = [
  {
    slug: "dogu-akdenizdeki-son-gelismeler-isiginda-kuzey-kibris-turk-cumhuriyetinin-taninmasinin-gerekliligi",
    pages: [6, 13],
    body: { en: 7, tr: 7 },
    startExact: { en: "INTRODUCTION", tr: "Giriş" },
    images: { skip: 1, max: 1 },
  },
  {
    slug: "abdnin-cevrelemeye-calistigi-turkiye-rusya-ve-cin-isbirligi-yapmali",
    pages: [14, 24],
    body: { en: 15, tr: 15 },
    images: { skip: 1, max: 2 },
  },
  {
    slug: "yunanistandaki-abd-yiginagi-hem-turkiyeyi-hem-de-rusyayi-hedef-aliyor",
    pages: [26, 31],
    body: { en: 27, tr: 27 },
    images: { skip: 1, max: 2 },
  },
  {
    slug: "cinin-dogu-akdenizde-cozum-onerisi-kalkinmaci-baris-yaklasimi",
    pages: [32, 53],
    body: { en: 33, tr: 33 },
    startExact: { en: "Introduction", tr: "Giriş" },
    images: { skip: 0, max: 0 },
  },
  {
    slug: "turkiye-misir-ve-yunanistanin-savunma-harcamalari-denklemi-uzerinden-karaman-denizi-dogu-akdeniz",
    pages: [54, 71],
    body: { en: 55, tr: 55 },
    startContains: { en: "An Introduction to the Unique Geopolitics", tr: "Adalar (Ege) Denizi" },
    images: { skip: 0, max: 1 },
  },
  {
    slug: "dogu-akdenizde-cin-varligi-suriye-ornegi",
    pages: [72, 89],
    body: { en: 73, tr: 73 },
    startExact: { en: "Introduction", tr: "Giriş" },
    startAlternatives: { tr: ["GİRİŞ", "Giriş", "Giriş"] },
    images: { skip: 0, max: 0 },
  },
  {
    slug: "kusak-ve-yol-girisimi-bolgesellesme-ve-kuresellesme-icin-yeni-itici-guc",
    pages: [90, 92],
    body: { en: 90, tr: 90 },
    startContains: { en: "THE BELT AND ROAD INITIATIVE", tr: "KUŞAK VE YOL GİRİŞİMİ" },
    images: { skip: 0, max: 1 },
  },
];

const visualRecords = [
  { slug: "sessiz-isik", page: 93, title: { en: "The Silent Light", tr: "Sessiz Işık" } },
  { slug: "mavi-vatan", page: 94, title: { en: "Blue Homeland", tr: "Mavi Vatan" } },
  { slug: "silahlarin-kulturu", page: 95, title: { en: "The Culture of Guns", tr: "Silahların Kültürü" } },
];

const exactHeadings = new Set([
  "Giriş", "GİRİŞ", "Introduction", "INTRODUCTION",
  "Sonuç", "SONUÇ", "Conclusion", "CONCLUSION", "Conclusions", "CONCLUSIONS",
  "Kaynakça", "KAYNAKÇA", "References", "REFERENCES",
  "Notlar", "NOTLAR", "Notes", "NOTES",
  "Teşekkür", "TEŞEKKÜR", "Acknowledgements", "ACKNOWLEDGEMENTS", "Acknowledgments", "ACKNOWLEDGMENTS",
]);
const frontMatterHeadings = /^(?:ÖZ|ABSTRACT|SUMMARY|ANAHTAR KELİMELER|KEYWORDS)$/iu;

function decodeEntities(value) {
  return value
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replace(/\s+/g, " ")
    .trim();
}

function parseXml(xml) {
  const pages = [];
  const fonts = new Map();
  for (const match of xml.matchAll(/<fontspec\b[^>]*id="(\d+)"[^>]*size="([\d.]+)"[^>]*family="([^"]*)"[^>]*color="([^"]*)"\s*\/>/g)) {
    fonts.set(match[1], { size: Number(match[2]), family: match[3], color: match[4] });
  }
  for (const pageMatch of xml.matchAll(/<page\b[^>]*number="(\d+)"[^>]*>([\s\S]*?)<\/page>/g)) {
    const pageNumber = Number(pageMatch[1]);
    const nodes = [];
    for (const match of pageMatch[2].matchAll(/<text\b[^>]*top="([\d.]+)"[^>]*left="([\d.]+)"[^>]*width="([\d.]+)"[^>]*height="([\d.]+)"[^>]*font="(\d+)"[^>]*>([\s\S]*?)<\/text>/g)) {
      const text = decodeEntities(match[6]);
      if (!text) continue;
      nodes.push({
        page: pageNumber,
        top: Number(match[1]),
        left: Number(match[2]),
        width: Number(match[3]),
        height: Number(match[4]),
        font: fonts.get(match[5]) || { size: 0, family: "", color: "" },
        text,
        bold: /<(?:b|strong)>/i.test(match[6]),
      });
    }
    pages.push({ number: pageNumber, nodes });
  }
  return pages;
}

function dehyphenatedJoin(left, right) {
  if (/[-‐‑]$/u.test(left) && /^[a-zçğıöşü]/u.test(right)) return `${left.slice(0, -1)}${right}`;
  return `${left} ${right}`;
}

function isNoise(node) {
  const { text, top, font } = node;
  if (top < 108 || top > 1055) return true;
  if (/^\d{1,4}$/.test(text)) return true;
  if (/^B\s*R\s*I\s*[Qq]/.test(text)) return true;
  if (/^(RÖPORTAJ|INTERVIEW|KİTAP İNCELEME|BOOK REVIEW)$/.test(text)) return true;
  if (/Gotham|Bebas/i.test(font.family)) return true;
  if (/MyriadPro-Semibold|CronosPro/i.test(font.family)) return true;
  return false;
}

function looksLikeCaption(node) {
  if (/^(?:Tablo|Table|Şekil|Figure)\s+\d+\s*[:.]/iu.test(node.text)) return true;
  if (/^(?:World Maritime Trade Routes Density Map|Kuzey Kıbrıs Türk Cumhuriyeti’nin Coğrafi Konumu|Geographical location of the Turkish Republic of Northern Cyprus)/iu.test(node.text)) return true;
  if (node.font.size <= 13 && /(Fotoğraf|Photo|Harita|Map|Kaynak|Source):/i.test(node.text)) return true;
  if (node.font.size <= 13 && /\([^)]*(?:BRIQ|Xinhua|Presidency|Official Website|MarineTraffic|Li Tao)[^)]*\d{4}[^)]*\)/i.test(node.text)) return true;
  return false;
}

function looksLikeHeading(node) {
  if (exactHeadings.has(node.text)) return true;
  if (frontMatterHeadings.test(node.text)) return true;
  if (node.text.length > 125) return false;
  if (node.bold && /\?$/.test(node.text)) return true;
  if (/[.!:;]$/.test(node.text)) return false;
  if (node.font.size < 15 || node.font.size > 20) return false;
  const color = node.font.color.match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  if (color) {
    const channels = color.slice(1).map((value) => Number.parseInt(value, 16));
    if (Math.max(...channels) > 80 && Math.max(...channels) - Math.min(...channels) > 35) return true;
  }
  if (node.bold && node.text.split(/\s+/).length <= 16) return true;
  return false;
}

function matchesStart(record, locale, text) {
  if (record.startExact?.[locale] === text) return true;
  if ((record.startAlternatives?.[locale] || []).includes(text)) return true;
  if (record.startContains?.[locale] && text.includes(record.startContains[locale])) return true;
  return false;
}

function extractBlocks(pages, record, locale) {
  const selected = pages.filter((page) => page.number >= record.body[locale] && page.number <= record.pages[1]);
  const blocks = [];
  const captions = [];
  let paragraph = "";
  let heading = "";
  let started = !record.startExact?.[locale] && !record.startContains?.[locale] && !(record.startAlternatives?.[locale] || []).length;
  let mode = "body";
  let skipFrontMatter = false;
  let captionTail = null;

  const flushParagraph = () => {
    const value = paragraph.replace(/\s+/g, " ").trim();
    if (value.length > 1) blocks.push({ kind: "paragraph", text: value });
    paragraph = "";
  };
  const flushHeading = () => {
    const value = heading.replace(/\s+/g, " ").trim();
    if (value) blocks.push({ kind: "heading", text: value });
    heading = "";
  };

  for (const page of selected) {
    for (const node of page.nodes) {
      if (isNoise(node) && !exactHeadings.has(node.text)) continue;

      if (captionTail && node.page === captionTail.page && node.top > captionTail.top && node.top - captionTail.top <= 42 && node.font.size <= 14) {
        captions[captions.length - 1] = dehyphenatedJoin(captions[captions.length - 1], node.text);
        captionTail = { page: node.page, top: node.top };
        continue;
      }
      captionTail = null;
      if (looksLikeCaption(node)) {
        captions.push(node.text);
        captionTail = { page: node.page, top: node.top };
        continue;
      }

      const explicitHeading = exactHeadings.has(node.text) || frontMatterHeadings.test(node.text);
      const minimumFontSize = mode === "body" ? 14 : 9;
      if (!explicitHeading && (node.font.size < minimumFontSize || node.font.size > 20)) continue;

      if (!started) {
        if (matchesStart(record, locale, node.text)) started = true;
        else continue;
      }

      if (frontMatterHeadings.test(node.text)) {
        flushParagraph();
        flushHeading();
        skipFrontMatter = true;
        continue;
      }

      const isHeading = looksLikeHeading(node);
      if (skipFrontMatter) {
        if (!isHeading || frontMatterHeadings.test(node.text)) continue;
        skipFrontMatter = false;
      }

      if (isHeading) {
        flushParagraph();
        if (heading) heading = dehyphenatedJoin(heading, node.text);
        else heading = node.text;
        if (/^(?:Kaynakça|KAYNAKÇA|References|REFERENCES)$/.test(node.text)) mode = "references";
        else if (/^(?:Notlar|NOTLAR|Notes|NOTES)$/.test(node.text)) mode = "notes";
        else if (/^(?:Teşekkür|TEŞEKKÜR|Acknowledg(?:e)?ments?|ACKNOWLEDGEMENTS|ACKNOWLEDGMENTS)$/.test(node.text)) mode = "acknowledgements";
        else mode = "body";
        continue;
      }
      flushHeading();

      const columnBase = node.left > 420 ? 433 : 105;
      const isIndented = node.left - columnBase >= 13 && node.left - columnBase <= 34;
      const isAtColumnBase = Math.abs(node.left - columnBase) <= 8;
      if (mode === "references" && isAtColumnBase && paragraph) flushParagraph();
      else if (mode !== "references" && isIndented && paragraph && /[.!?…”’)]$/.test(paragraph)) flushParagraph();
      paragraph = paragraph ? dehyphenatedJoin(paragraph, node.text) : node.text;
    }
  }
  flushParagraph();
  flushHeading();
  return { blocks, captions };
}

function splitSpecialSections(blocks) {
  const positions = { notes: -1, refs: -1, ack: -1 };
  blocks.forEach((block, index) => {
    if (block.kind !== "heading") return;
    if (/^(?:Notlar|NOTLAR|Notes|NOTES)$/.test(block.text)) positions.notes = index;
    if (/^(?:Kaynakça|KAYNAKÇA|References|REFERENCES)$/.test(block.text)) positions.refs = index;
    if (/^(?:Teşekkür|TEŞEKKÜR|Acknowledg(?:e)?ments?|ACKNOWLEDGEMENTS|ACKNOWLEDGMENTS)$/.test(block.text)) positions.ack = index;
  });
  const special = Object.values(positions).filter((value) => value >= 0).sort((a, b) => a - b);
  const bodyEnd = special[0] ?? blocks.length;
  const sliceAfter = (key) => {
    const start = positions[key];
    if (start < 0) return [];
    const next = special.find((value) => value > start) ?? blocks.length;
    return blocks.slice(start + 1, next);
  };
  return { body: blocks.slice(0, bodyEnd), notes: sliceAfter("notes"), references: sliceAfter("refs"), acknowledgements: sliceAfter("ack") };
}

function blocksToSections(blocks, locale) {
  const untitled = locale === "tr" ? "Tam Metin" : "Full Text";
  const sections = [];
  let current = { title: untitled, paragraphs: [] };
  for (const block of blocks) {
    if (block.kind === "heading") {
      if (current.paragraphs.length) sections.push(current);
      current = { title: block.text, paragraphs: [] };
    } else if (block.text.length > 35) {
      current.paragraphs.push(block.text);
    }
  }
  if (current.paragraphs.length) sections.push(current);
  return sections.map((section, index) => ({ id: `${locale}-section-${index + 1}`, title: section.title, paragraphs: section.paragraphs }));
}

function parseNumberedNotes(blocks) {
  const text = blocks.map((block) => block.text).join(" ").replace(/\s+/g, " ").trim();
  if (!text) return [];
  const starts = [...text.matchAll(/(?:^|\s)(\d{1,2})[.)]?\s+(?=[A-ZÇĞİÖŞÜ])/g)];
  if (!starts.length) return [];
  return starts.map((match, index) => ({
    id: `note-${match[1]}`,
    text: text.slice(match.index + match[0].length, starts[index + 1]?.index ?? text.length).trim(),
  }));
}

function parseReferences(blocks) {
  return blocks
    .filter((block) => block.kind === "paragraph" && block.text.length > 8)
    .map((block, index) => ({ id: `ref-${index + 1}`, text: block.text.replace(/\s+/g, " ").trim() }));
}

function extractKeywords(record, locale) {
  const raw = execFileSync("pdftotext", ["-raw", "-f", String(record.pages[0]), "-l", String(Math.min(record.pages[0] + 2, record.pages[1])), pdfs[locale], "-"], { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
  const marker = locale === "tr" ? /Anahtar\s+Kelimeler\s*:/iu : /Keywords\s*:/iu;
  const match = marker.exec(raw);
  if (!match) return [];
  const value = raw.slice(match.index + match[0].length, match.index + match[0].length + 600)
    .split(/\.\s*(?:\n|\f)/)[0]
    .replace(/-\s*\n\s*(?=[a-zçğıöşü])/giu, "")
    .replace(/\s*\n\s*/g, " ")
    .replace(/\s+/g, " ").trim();
  return value.split(/,\s*/).map((keyword) => keyword.trim()).filter((keyword) => keyword.length > 1 && keyword.length < 90);
}

function extractExactImages(record, captionsByLocale) {
  if (!record.images?.max) return [];
  const temp = mkdtempSync(join(tmpdir(), "v04i01-img-"));
  const prefix = join(temp, "img");
  execFileSync("pdfimages", ["-f", String(record.pages[0]), "-l", String(record.pages[1]), "-all", pdfs.tr, prefix], { stdio: "ignore" });
  const candidates = readdirSync(temp)
    .filter((name) => [".jpg", ".jpeg", ".png"].includes(extname(name).toLowerCase()))
    .map((name) => {
      const path = join(temp, name);
      let width = 0, height = 0;
      try {
        [width, height] = execFileSync("identify", ["-format", "%w %h", path], { encoding: "utf8" }).trim().split(/\s+/).map(Number);
      } catch {}
      return { name, path, width, height, area: width * height, size: statSync(path).size };
    })
    .filter((x) => x.width >= 360 && x.height >= 220 && x.size >= 20000)
    .sort((a, b) => b.area - a.area);

  const usable = candidates.slice(record.images.skip || 0, (record.images.skip || 0) + record.images.max);
  const outDir = join(root, "public/assets/article-figures", record.slug);
  rmSync(outDir, { recursive: true, force: true });
  if (!usable.length) { rmSync(temp, { recursive: true, force: true }); return []; }
  mkdirSync(outDir, { recursive: true });
  const figures = usable.map((item, index) => {
    const extension = extname(item.name).toLowerCase() === ".jpeg" ? ".jpg" : extname(item.name).toLowerCase();
    const filename = `figure-${String(index + 1).padStart(2, "0")}${extension}`;
    copyFileSync(item.path, join(outDir, filename));
    return {
      id: `figure-${index + 1}`,
      src: `/assets/article-figures/${record.slug}/${filename}`,
      captionEn: captionsByLocale.en[index] || "",
      captionTr: captionsByLocale.tr[index] || "",
    };
  });
  rmSync(temp, { recursive: true, force: true });
  return figures;
}

const temp = mkdtempSync(join(tmpdir(), "v04i01-text-"));
const parsed = {};
for (const locale of ["tr", "en"]) {
  const xmlPath = join(temp, `${locale}.xml`);
  execFileSync("pdftohtml", ["-xml", "-hidden", pdfs[locale], xmlPath], { stdio: "ignore" });
  parsed[locale] = parseXml(readFileSync(xmlPath, "utf8"));
}

for (const record of records) {
  const extracted = {};
  for (const locale of ["en", "tr"]) extracted[locale] = extractBlocks(parsed[locale], record, locale);
  const figures = extractExactImages(record, { en: extracted.en.captions, tr: extracted.tr.captions });

  for (const locale of ["en", "tr"]) {
    const special = splitSpecialSections(extracted[locale].blocks);
    const canonical = {
      sections: blocksToSections(special.body, locale),
      keywords: extractKeywords(record, locale),
      footnotes: parseNumberedNotes(special.notes),
      references: parseReferences(special.references),
      acknowledgements: special.acknowledgements.map((block) => block.text).join(" ").replace(/\s+/g, " ").trim(),
      figures: figures.map((figure) => ({ id: figure.id, src: figure.src, caption: locale === "en" ? figure.captionEn : figure.captionTr })),
    };
    const output = join(root, "content/articles", record.slug, "fulltext", `${locale}.json`);
    mkdirSync(resolve(output, ".."), { recursive: true });
    writeFileSync(output, `${JSON.stringify(canonical, null, 2)}\n`);
  }
}

for (const visual of visualRecords) {
  const record = { slug: visual.slug, pages: [visual.page, visual.page], images: { skip: 0, max: 1 } };
  const figures = extractExactImages(record, { en: [visual.title.en], tr: [visual.title.tr] });
  for (const locale of ["en", "tr"]) {
    const canonical = {
      sections: [],
      keywords: [],
      footnotes: [],
      references: [],
      acknowledgements: "",
      figures: figures.map((figure) => ({ id: figure.id, src: figure.src, caption: locale === "en" ? visual.title.en : visual.title.tr })),
    };
    const output = join(root, "content/articles", visual.slug, "fulltext", `${locale}.json`);
    mkdirSync(resolve(output, ".."), { recursive: true });
    writeFileSync(output, `${JSON.stringify(canonical, null, 2)}\n`);
  }
}

rmSync(temp, { recursive: true, force: true });
console.log("Generated v04-i01 canonical EN/TR candidates and exact extracted raster assets.");
