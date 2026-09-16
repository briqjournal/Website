import { readFile, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { loadFullTextCollections } from "./content-store.mjs";

const root = process.cwd();
const saudi = "suudi-arabistanin-abd-ile-cin-arasinda-cok-boyutlu-kulturel-dengeleme-stratejisi";
const comak = "turkiye-cin-diplomatik-iliskilerinin-55-yilinda-avrasyada-guc-gecisi-ve-jeoekonomik-baglantisallik";
const localized = [saudi, comak];

const collections = await loadFullTextCollections(root);
for (const slug of localized) {
  const current = collections.current[slug];
  const en = slug === saudi ? collections.saudiEn : current?.en;
  if (!current?.tr?.sections?.length || !en?.sections?.length) throw new Error(`Missing verified locale source for ${slug}`);
  const dir = join(root, "content/articles", slug, "fulltext");
  await writeFile(join(dir, "en.json"), `${JSON.stringify(en, null, 2)}\n`, "utf8");
  await writeFile(join(dir, "tr.json"), `${JSON.stringify(current.tr, null, 2)}\n`, "utf8");
  await rm(join(dir, "current.json"));
}
await rm(join(root, "content/articles", saudi, "fulltext", "en-archive.json"));
await rm(join(root, "content/articles", saudi, "fulltext", "saudi-en.json"));

const catalogPath = join(root, "content/catalog.json");
const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
catalog.fulltext.localized = localized;
catalog.fulltext.current = (catalog.fulltext.current || []).filter((slug) => !localized.includes(slug));
catalog.fulltext.en_archive = (catalog.fulltext.en_archive || []).filter((slug) => slug !== saudi);
delete catalog.fulltext.saudi_en;
await writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");

const issue = JSON.parse(await readFile(join(root, "content/issues/v07-i04.json"), "utf8"));
const common = ["slug", "volume", "issue", "year", "author", "authors", "pages", "doi", "published_online_date", "received_date", "revised_date", "accepted_date", "orcids", "shared_bilingual_pdf"];
const en = ["season_en", "title_en", "abstract_en", "keywords_en", "citation_en", "publication_type_en", "source_en", "pdf_en_source", "pdf_en_local"];
const tr = ["season_tr", "title_tr", "abstract_tr", "keywords_tr", "citation_tr", "publication_type_tr", "source_tr", "pdf_tr_source", "pdf_tr_local"];
for (const slug of issue.articles) {
  const metadataPath = join(root, "content/articles", slug, "metadata.json");
  const metadata = JSON.parse(await readFile(metadataPath, "utf8"));
  const ordered = {};
  for (const key of [...common, ...en, ...tr]) if (Object.hasOwn(metadata, key)) ordered[key] = metadata[key];
  for (const [key, value] of Object.entries(metadata)) if (!Object.hasOwn(ordered, key)) ordered[key] = value;
  await writeFile(metadataPath, `${JSON.stringify(ordered, null, 2)}\n`, "utf8");
}

const storePath = join(root, "scripts/content-store.mjs");
let store = await readFile(storePath, "utf8");
const localizedStore = `async function readLocalizedFullText(root, slug, locale) {
  assertSlug(slug, \`${"${locale}"}.json\`);
  const record = await readJson(join(root, "content/articles", slug, "fulltext", \`${"${locale}"}.json\`));
  if (Array.isArray(record.keywords)) record.keywords = normalizeKeywordList(record.keywords, locale);
  return record;
}

export async function loadFullTextCollections(root = process.cwd()) {
  const catalog = await loadCatalog(root);
  const localizedSlugs = catalog.fulltext.localized || [];
  const currentSlugs = catalog.fulltext.current || [];
  const archiveSlugs = catalog.fulltext.en_archive || [];
  assert(new Set(localizedSlugs).size === localizedSlugs.length, "Duplicate localized full-text slug.");
  assert(new Set(currentSlugs).size === currentSlugs.length, "Duplicate current full-text slug.");
  assert(new Set(archiveSlugs).size === archiveSlugs.length, "Duplicate English archive full-text slug.");
  const localized = {};
  for (const slug of localizedSlugs) localized[slug] = {
    en: await readLocalizedFullText(root, slug, "en"),
    tr: await readLocalizedFullText(root, slug, "tr"),
  };
  const current = {};
  for (const slug of currentSlugs) current[slug] = await readFullTextRecord(root, slug, "current.json");
  const enArchive = {};
  for (const slug of archiveSlugs) enArchive[slug] = await readFullTextRecord(root, slug, "en-archive.json");
  return { localized, current, enArchive };
}`;
const storePattern = /export async function loadFullTextCollections\(root = process\.cwd\(\)\) \{[\s\S]*?\n\}/;
if (!storePattern.test(store)) throw new Error("loadFullTextCollections block not found");
store = store.replace(storePattern, localizedStore);
await writeFile(storePath, store, "utf8");

const generatorPath = join(root, "scripts/generate-fulltext-modules.mjs");
const generator = `import { mkdir, rm, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { loadFullTextCollections } from "./content-store.mjs";

const root = process.cwd();
const appDir = join(root, "app");
const outputRoot = join(appDir, "generated-fulltext");
const localizedEnOutput = join(outputRoot, "localized", "en");
const localizedTrOutput = join(outputRoot, "localized", "tr");
const currentOutput = join(outputRoot, "current");
const archiveOutput = join(outputRoot, "en-archive");
const safeSlug = /^[a-z0-9-]+$/;
function assertSlug(slug, source) { if (!safeSlug.test(slug)) throw new Error(\`Unsafe article slug in \${source}: \${slug}\`); }
async function writeEntries(entries, directory, source) {
  await mkdir(directory, { recursive: true });
  for (const [slug, value] of entries) {
    assertSlug(slug, source);
    await writeFile(join(directory, \`\${slug}.json\`), \`\${JSON.stringify(value)}\\n\`, "utf8");
  }
}
const { localized, current, enArchive } = await loadFullTextCollections(root);
const localizedEntries = Object.entries(localized);
const localizedEnEntries = localizedEntries.map(([slug, value]) => [slug, value.en]);
const localizedTrEntries = localizedEntries.map(([slug, value]) => [slug, value.tr]);
const currentEntries = Object.entries(current);
const archiveEntries = Object.entries(enArchive);
await rm(outputRoot, { recursive: true, force: true });
await writeEntries(localizedEnEntries, localizedEnOutput, "localized English full text");
await writeEntries(localizedTrEntries, localizedTrOutput, "localized Turkish full text");
await writeEntries(currentEntries, currentOutput, "legacy current full text");
await writeEntries(archiveEntries, archiveOutput, "legacy English archive full text");
await mkdir(outputRoot, { recursive: true });
await writeFile(join(appDir, "article-fulltext-localized.json"), \`\${JSON.stringify(localized, null, 2)}\\n\`, "utf8");
await writeFile(join(appDir, "article-fulltext-current.json"), \`\${JSON.stringify(current, null, 2)}\\n\`, "utf8");
await writeFile(join(appDir, "article-fulltext-en-archive.json"), \`\${JSON.stringify(enArchive, null, 2)}\\n\`, "utf8");
const loaderLines = (entries, directory) => entries.map(([slug]) => \`  \${JSON.stringify(slug)}: () => import(\${JSON.stringify(\`./\${directory}/\${slug}.json\`)}),\`).join("\\n");
const loaderSource = \`// Generated by scripts/generate-fulltext-modules.mjs. Do not edit by hand.
type JsonModule = { default: unknown };
const localizedEnglishFullTextLoaders: Record<string, () => Promise<JsonModule>> = {
\${loaderLines(localizedEnEntries, "localized/en")}
};
const localizedTurkishFullTextLoaders: Record<string, () => Promise<JsonModule>> = {
\${loaderLines(localizedTrEntries, "localized/tr")}
};
const currentFullTextLoaders: Record<string, () => Promise<JsonModule>> = {
\${loaderLines(currentEntries, "current")}
};
const archiveEnglishFullTextLoaders: Record<string, () => Promise<JsonModule>> = {
\${loaderLines(archiveEntries, "en-archive")}
};
async function loadFrom(loaders: Record<string, () => Promise<JsonModule>>, slug: string) {
  const loader = loaders[slug]; if (!loader) return undefined; const module = await loader(); return module.default;
}
export function loadLocalizedFullText(slug: string, locale: "en" | "tr") { return loadFrom(locale === "en" ? localizedEnglishFullTextLoaders : localizedTurkishFullTextLoaders, slug); }
export function loadCurrentFullText(slug: string) { return loadFrom(currentFullTextLoaders, slug); }
export function loadArchiveEnglishFullText(slug: string) { return loadFrom(archiveEnglishFullTextLoaders, slug); }
\`;
await writeFile(join(outputRoot, "loaders.ts"), loaderSource, "utf8");
console.log(\`Generated \${localizedEntries.length} localized pairs, \${currentEntries.length} legacy current modules, and \${archiveEntries.length} legacy English archives in \${relative(root, outputRoot)}.\`);
`;
await writeFile(generatorPath, generator, "utf8");

const platformPath = join(root, "app/components/ArticlePlatform.tsx");
let platform = await readFile(platformPath, "utf8");
platform = platform.replace(`import {\n  loadArchiveEnglishFullText,\n  loadCurrentFullText,\n  loadSaudiEnglishFullText,\n} from "../generated-fulltext/loaders";`, `import {\n  loadArchiveEnglishFullText,\n  loadCurrentFullText,\n  loadLocalizedFullText,\n} from "../generated-fulltext/loaders";`);
platform = platform.replace(`const SAUDI_CULTURAL_HEDGING_SLUG = "${saudi}";\n`, "");
platform = platform.replace(`const COMAK_ENGLISH_FULLTEXT_SLUG = "${comak}";\n`, "");
const platformPattern = /  const fullRecord = await loadCurrentFullText\(article\.slug\) as CurrentFullTextRecord \| undefined;[\s\S]*?    : storedFullText;/;
const platformReplacement = `  const localizedFullText = await loadLocalizedFullText(article.slug, locale) as LocalizedFullText | undefined;
  const fullRecord = localizedFullText ? undefined : await loadCurrentFullText(article.slug) as CurrentFullTextRecord | undefined;
  const storedFullText = fullRecord?.[locale];
  const archivedEnglishFullText = !localizedFullText && locale === "en"
    ? await loadArchiveEnglishFullText(article.slug) as LocalizedFullText | undefined
    : undefined;
  const preferCurrentEnglish = article.volume === 7 && article.issue <= 3;
  const legacyFullText = locale === "en"
    ? preferCurrentEnglish
      ? mergeLocalizedFullText(storedFullText, archivedEnglishFullText)
      : mergeLocalizedFullText(archivedEnglishFullText, storedFullText)
    : storedFullText;
  const fullText = localizedFullText || legacyFullText;`;
if (!platformPattern.test(platform)) throw new Error("ArticlePlatform full-text block not found");
platform = platform.replace(platformPattern, platformReplacement);
await writeFile(platformPath, platform, "utf8");

const comakTestPath = join(root, "tests/comak-english-fulltext.test.mjs");
let comakTest = await readFile(comakTestPath, "utf8");
comakTest = comakTest.replace("const { current } = await loadFullTextCollections();\n  const record = current[slug];", "const { localized } = await loadFullTextCollections();\n  const record = localized[slug];");
comakTest = comakTest.replace(/\n\ntest\("keeps the canonical English record ahead of the broken archive extraction at render time"[\s\S]*$/, `\n\ntest("uses locale-split canonical files without article-specific render exceptions", async () => {\n  const platform = await readFile(new URL("../app/components/ArticlePlatform.tsx", import.meta.url), "utf8");\n  assert.match(platform, /loadLocalizedFullText/u);\n  assert.doesNotMatch(platform, /COMAK_ENGLISH_FULLTEXT_SLUG/u);\n  assert.doesNotMatch(platform, /SAUDI_CULTURAL_HEDGING_SLUG/u);\n});\n`);
await writeFile(comakTestPath, comakTest, "utf8");

const keywordTestPath = join(root, "tests/keyword-case.test.mjs");
let keywordTest = await readFile(keywordTestPath, "utf8");
keywordTest = keywordTest.replace("const { current, enArchive, saudiEn } = await loadFullTextCollections();", "const { localized, current, enArchive } = await loadFullTextCollections();");
keywordTest = keywordTest.replace("for (const record of Object.values(current))", "for (const record of [...Object.values(localized), ...Object.values(current)])");
keywordTest = keywordTest.replace(/\n  for \(const keyword of saudiEn\?\.keywords \|\| \[\]\) \{[\s\S]*?\n  \}\n/, "\n");
keywordTest = keywordTest.replace("const { current } = await loadFullTextCollections();\n  const relations = current[", "const { localized, current } = await loadFullTextCollections();\n  const relations = localized[");
keywordTest = keywordTest.replace("const { current } = await loadFullTextCollections();\n\n  for (const [slug, record] of Object.entries(current))", "const { localized, current } = await loadFullTextCollections();\n\n  for (const [slug, record] of [...Object.entries(localized), ...Object.entries(current)])");
await writeFile(keywordTestPath, keywordTest, "utf8");

console.log("Prepared V7I4 locale-split phase 1.");
