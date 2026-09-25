import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const archive = JSON.parse(await readFile(new URL("../app/archive-data.json", import.meta.url), "utf8"));

async function fetchFromBuiltWorker(pathname, init = {}) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${pathname}`, init),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

function xmlText(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

test("exposes an OAI-PMH 2.0 Identify response at /oai", async () => {
  const response = await fetchFromBuiltWorker("/oai?verb=Identify");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") || "", /^text\/xml\b/i);
  const xml = await response.text();

  assert.match(xml, /<OAI-PMH xmlns="http:\/\/www\.openarchives\.org\/OAI\/2\.0\/"/);
  assert.match(xml, /<repositoryName>BRIQ – Belt &amp; Road Initiative Quarterly<\/repositoryName>/);
  assert.match(xml, /<baseURL>http:\/\/localhost\/oai<\/baseURL>/);
  assert.match(xml, /<protocolVersion>2\.0<\/protocolVersion>/);
  assert.match(xml, /<adminEmail>briq@briqjournal\.com<\/adminEmail>/);
  assert.match(xml, /<earliestDatestamp>\d{4}-\d{2}-\d{2}<\/earliestDatestamp>/);
  assert.match(xml, /<deletedRecord>no<\/deletedRecord>/);
  assert.match(xml, /<granularity>YYYY-MM-DD<\/granularity>/);
  assert.match(xml, /<repositoryIdentifier>briqjournal\.com<\/repositoryIdentifier>/);
});

test("advertises mandatory oai_dc and one WorldCat-friendly BRIQ collection set", async () => {
  const [formatsResponse, setsResponse] = await Promise.all([
    fetchFromBuiltWorker("/oai?verb=ListMetadataFormats"),
    fetchFromBuiltWorker("/oai?verb=ListSets"),
  ]);
  const [formats, sets] = await Promise.all([formatsResponse.text(), setsResponse.text()]);

  assert.match(formats, /<metadataPrefix>oai_dc<\/metadataPrefix>/);
  assert.match(formats, /http:\/\/www\.openarchives\.org\/OAI\/2\.0\/oai_dc\.xsd/);
  assert.equal((sets.match(/<set>/g) || []).length, 1);
  assert.match(sets, /<setSpec>briq<\/setSpec>/);
  assert.match(sets, /<setName>BRIQ – Belt and Road Initiative Quarterly<\/setName>/);
});

test("harvests every archive article through ListIdentifiers with valid flow control", async () => {
  let path = "/oai?verb=ListIdentifiers&metadataPrefix=oai_dc&set=briq";
  const identifiers = [];
  let sawNonEmptyToken = false;
  let sawFinalEmptyToken = false;

  for (let page = 0; page < 100; page += 1) {
    const response = await fetchFromBuiltWorker(path);
    assert.equal(response.status, 200);
    const xml = await response.text();
    assert.doesNotMatch(xml, /<error\b/);

    for (const match of xml.matchAll(/<identifier>([^<]+)<\/identifier>/g)) {
      identifiers.push(xmlText(match[1]));
    }

    const tokenMatch = xml.match(/<resumptionToken\b[^>]*>([^<]*)<\/resumptionToken>/);
    if (!tokenMatch) break;
    const token = xmlText(tokenMatch[1]);
    if (!token) {
      sawFinalEmptyToken = true;
      break;
    }
    sawNonEmptyToken = true;
    path = `/oai?verb=ListIdentifiers&resumptionToken=${encodeURIComponent(token)}`;
  }

  assert.equal(identifiers.length, archive.articles.length);
  assert.equal(new Set(identifiers).size, archive.articles.length);
  assert.ok(identifiers.every((identifier) => identifier.startsWith("oai:briqjournal.com:")));
  if (archive.articles.length > 50) {
    assert.equal(sawNonEmptyToken, true);
    assert.equal(sawFinalEmptyToken, true);
  }
});

test("returns Dublin Core article metadata suitable for WorldCat harvesting", async () => {
  const response = await fetchFromBuiltWorker(
    "/oai?verb=ListRecords&metadataPrefix=oai_dc&set=briq&from=2026-01-01",
  );
  assert.equal(response.status, 200);
  const xml = await response.text();

  assert.match(xml, /<ListRecords>/);
  assert.match(xml, /<oai_dc:dc\b/);
  assert.match(xml, /<dc:title xml:lang="tr">/);
  assert.match(xml, /<dc:creator>/);
  assert.match(xml, /<dc:publisher>Institute for China Studies in Türkiye \(ICST\)<\/dc:publisher>/);
  assert.match(xml, /<dc:date>/);
  assert.match(xml, /<dc:type>Text<\/dc:type>/);
  assert.match(xml, /<dc:language>tur<\/dc:language>/);
  assert.match(xml, /<dc:identifier>http:\/\/localhost\/tr\/makaleler\//);
  assert.match(xml, /<dc:rights>https:\/\/creativecommons\.org\/licenses\/by\/4\.0\/<\/dc:rights>/);
  assert.match(xml, /<setSpec>briq<\/setSpec>/);
});

test("serves individual records and OAI-PMH protocol errors without HTTP error pages", async () => {
  const sample = archive.articles[0];
  const identifier = `oai:briqjournal.com:${sample.slug}`;
  const recordResponse = await fetchFromBuiltWorker(
    `/oai?verb=GetRecord&metadataPrefix=oai_dc&identifier=${encodeURIComponent(identifier)}`,
  );
  const record = await recordResponse.text();
  assert.equal(recordResponse.status, 200);
  assert.match(record, /<GetRecord><record>/);
  assert.match(record, new RegExp(`<identifier>${identifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}<\\/identifier>`));

  const cases = [
    ["/oai", "badVerb"],
    ["/oai?verb=NoSuchVerb", "badVerb"],
    ["/oai?verb=ListRecords&metadataPrefix=mods", "cannotDisseminateFormat"],
    ["/oai?verb=ListRecords&metadataPrefix=oai_dc&set=missing", "noRecordsMatch"],
    [
      "/oai?verb=GetRecord&metadataPrefix=oai_dc&identifier=oai%3Abriqjournal.com%3Amissing",
      "idDoesNotExist",
    ],
  ];

  for (const [path, code] of cases) {
    const response = await fetchFromBuiltWorker(path);
    assert.equal(response.status, 200, path);
    assert.match(await response.text(), new RegExp(`<error code="${code}">`), path);
  }
});

test("accepts OAI-PMH POST requests without changing ordinary site routing", async () => {
  const postResponse = await fetchFromBuiltWorker("/oai", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: "verb=Identify",
  });
  assert.equal(postResponse.status, 200);
  assert.match(await postResponse.text(), /<Identify>/);

  const homeResponse = await fetchFromBuiltWorker("/", { headers: { accept: "text/html" } });
  assert.equal(homeResponse.status, 307);
  assert.equal(new URL(homeResponse.headers.get("location")).pathname, "/en/");
  assert.doesNotMatch(await homeResponse.text(), /<OAI-PMH\b/);
});
