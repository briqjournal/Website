import {
  archiveArticles,
  articlePdfUrl,
  articleRouteSlug,
  publicationType,
  type ArchiveArticle,
} from "../archive";
import { isPersonByline, splitAuthorNames } from "../authors";

type OaiVerb =
  | "Identify"
  | "ListMetadataFormats"
  | "ListSets"
  | "ListIdentifiers"
  | "ListRecords"
  | "GetRecord";

type ListVerb = "ListIdentifiers" | "ListRecords";

type ResumptionState = {
  version: 1;
  verb: ListVerb;
  cursor: number;
  metadataPrefix: "oai_dc";
  from?: string;
  until?: string;
  set?: string;
};

const REPOSITORY_NAME = "BRIQ – Belt & Road Initiative Quarterly";
const REPOSITORY_IDENTIFIER = "briqjournal.com";
const JOURNAL_SET = "briq";
const JOURNAL_SET_NAME = "BRIQ – Belt and Road Initiative Quarterly";
const ADMIN_EMAIL = "briq@briqjournal.com";
const PUBLISHER = "Institute for China Studies in Türkiye (ICST)";
const JOURNAL_EN = "BRIQ Belt & Road Initiative Quarterly";
const RIGHTS_URL = "https://creativecommons.org/licenses/by/4.0/";
const PAGE_SIZE = 50;
const OAI_NS = "http://www.openarchives.org/OAI/2.0/";
const OAI_SCHEMA = "http://www.openarchives.org/OAI/2.0/OAI-PMH.xsd";
const OAI_DC_NS = "http://www.openarchives.org/OAI/2.0/oai_dc/";
const OAI_DC_SCHEMA = "http://www.openarchives.org/OAI/2.0/oai_dc.xsd";
const DC_NS = "http://purl.org/dc/elements/1.1/";
const OAI_IDENTIFIER_NS = "http://www.openarchives.org/OAI/2.0/oai-identifier";
const OAI_IDENTIFIER_SCHEMA = "http://www.openarchives.org/OAI/2.0/oai-identifier.xsd";
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function safeXml(value: string) {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cleanAbstract(value: string) {
  return value.replace(/^\s*(?:abstract|özet)\s*[:\n-]*\s*/iu, "").trim();
}

function isDay(value: string) {
  if (!DAY_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function oaiIdentifier(article: ArchiveArticle) {
  return `oai:${REPOSITORY_IDENTIFIER}:${article.slug}`;
}

function articleFromIdentifier(identifier: string) {
  const prefix = `oai:${REPOSITORY_IDENTIFIER}:`;
  if (!identifier.startsWith(prefix)) return undefined;
  const slug = identifier.slice(prefix.length);
  return archiveArticles.find((article) => article.slug === slug);
}

function inferredDatestamp(article: ArchiveArticle) {
  if (article.published_online_date && isDay(article.published_online_date)) {
    return article.published_online_date;
  }

  const year = article.year.match(/\d{4}/)?.[0] || "1970";
  const season = article.season_en.toLocaleLowerCase("en-US");
  const month = season.includes("spring")
    ? "03"
    : season.includes("summer")
      ? "06"
      : season.includes("autumn") || season.includes("fall")
        ? "09"
        : "12";
  return `${year}-${month}-01`;
}

function publicationDate(article: ArchiveArticle) {
  return article.published_online_date && isDay(article.published_online_date)
    ? article.published_online_date
    : article.year;
}

function absoluteUrl(origin: string, path: string) {
  return new URL(path, `${origin}/`).toString();
}

function normalizedDoiUrl(doi: string) {
  const normalized = doi.trim().replace(/^https?:\/\/(?:dx\.)?doi\.org\//iu, "");
  return normalized ? `https://doi.org/${normalized}` : "";
}

function headerXml(article: ArchiveArticle) {
  return [
    "<header>",
    `<identifier>${safeXml(oaiIdentifier(article))}</identifier>`,
    `<datestamp>${inferredDatestamp(article)}</datestamp>`,
    `<setSpec>${JOURNAL_SET}</setSpec>`,
    "</header>",
  ].join("");
}

function metadataXml(article: ArchiveArticle, origin: string) {
  const creators = splitAuthorNames(article.author).filter(isPersonByline);
  const effectiveCreators = creators.length > 0 ? creators : [article.author.trim()].filter(Boolean);
  const trUrl = absoluteUrl(origin, `/makaleler/${article.slug}`);
  const hasEnglishMetadata = Boolean(
    article.title_en
      || article.abstract_en
      || article.source_en
      || article.pdf_en_source
      || article.pdf_en_local,
  );
  const enUrl = hasEnglishMetadata
    ? absoluteUrl(origin, `/en/articles/${articleRouteSlug(article, "en")}`)
    : "";
  const trPdfPath = articlePdfUrl(article, "tr");
  const enPdfPath = articlePdfUrl(article, "en");
  const trPdfUrl = trPdfPath ? absoluteUrl(origin, trPdfPath) : "";
  const enPdfUrl = enPdfPath ? absoluteUrl(origin, enPdfPath) : "";
  const doiUrl = article.doi ? normalizedDoiUrl(article.doi) : "";
  const source = `${JOURNAL_EN}, Volume ${article.volume}, Issue ${article.issue}${article.pages ? `, pp. ${article.pages}` : ""}. ISSN 2687-5896; E-ISSN 2718-0581.`;

  const fields = [
    `<dc:title xml:lang="tr">${safeXml(article.title_tr)}</dc:title>`,
    article.title_en && article.title_en !== article.title_tr
      ? `<dc:title xml:lang="en">${safeXml(article.title_en)}</dc:title>`
      : "",
    ...effectiveCreators.map((creator) => `<dc:creator>${safeXml(creator)}</dc:creator>`),
    article.abstract_tr
      ? `<dc:description xml:lang="tr">${safeXml(cleanAbstract(article.abstract_tr))}</dc:description>`
      : "",
    article.abstract_en
      ? `<dc:description xml:lang="en">${safeXml(cleanAbstract(article.abstract_en))}</dc:description>`
      : "",
    `<dc:publisher>${safeXml(PUBLISHER)}</dc:publisher>`,
    `<dc:date>${safeXml(publicationDate(article))}</dc:date>`,
    "<dc:type>Text</dc:type>",
    `<dc:type>${safeXml(publicationType(article, "en"))}</dc:type>`,
    "<dc:format>text/html</dc:format>",
    trPdfUrl || enPdfUrl ? "<dc:format>application/pdf</dc:format>" : "",
    "<dc:language>tur</dc:language>",
    hasEnglishMetadata ? "<dc:language>eng</dc:language>" : "",
    `<dc:identifier>${safeXml(trUrl)}</dc:identifier>`,
    enUrl ? `<dc:identifier>${safeXml(enUrl)}</dc:identifier>` : "",
    doiUrl ? `<dc:identifier>${safeXml(doiUrl)}</dc:identifier>` : "",
    trPdfUrl ? `<dc:relation>${safeXml(trPdfUrl)}</dc:relation>` : "",
    enPdfUrl && enPdfUrl !== trPdfUrl ? `<dc:relation>${safeXml(enPdfUrl)}</dc:relation>` : "",
    `<dc:source>${safeXml(source)}</dc:source>`,
    `<dc:rights>${safeXml(RIGHTS_URL)}</dc:rights>`,
  ].filter(Boolean);

  return [
    "<metadata>",
    `<oai_dc:dc xmlns:oai_dc="${OAI_DC_NS}" xmlns:dc="${DC_NS}" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="${OAI_DC_NS} ${OAI_DC_SCHEMA}">`,
    ...fields,
    "</oai_dc:dc>",
    "</metadata>",
  ].join("");
}

function recordXml(article: ArchiveArticle, origin: string) {
  return `<record>${headerXml(article)}${metadataXml(article, origin)}</record>`;
}

function requestBaseUrl(request: Request) {
  const url = new URL(request.url);
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/$/, "");
}

function responseDate() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

function paramEntries(params: URLSearchParams) {
  const keys = [...new Set([...params.keys()])];
  return keys.map((key) => [key, params.getAll(key)] as const);
}

function requestElement(baseUrl: string, params: URLSearchParams) {
  const attributeOrder = [
    "verb",
    "identifier",
    "metadataPrefix",
    "from",
    "until",
    "set",
    "resumptionToken",
  ];
  const attributes = attributeOrder
    .flatMap((key) => {
      const values = params.getAll(key);
      return values.length === 1 ? [` ${key}="${safeXml(values[0])}"`] : [];
    })
    .join("");
  return `<request${attributes}>${safeXml(baseUrl)}</request>`;
}

function xmlResponse(request: Request, params: URLSearchParams, payload: string) {
  const baseUrl = requestBaseUrl(request);
  const body = [
    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
    `<OAI-PMH xmlns="${OAI_NS}" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="${OAI_NS} ${OAI_SCHEMA}">`,
    `<responseDate>${responseDate()}</responseDate>`,
    requestElement(baseUrl, params),
    payload,
    "</OAI-PMH>",
  ].join("");

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function errorXml(request: Request, params: URLSearchParams, code: string, message: string) {
  return xmlResponse(
    request,
    params,
    `<error code="${safeXml(code)}">${safeXml(message)}</error>`,
  );
}

function validateArguments(params: URLSearchParams, allowed: ReadonlySet<string>) {
  for (const [key, values] of paramEntries(params)) {
    if (!allowed.has(key)) return `Illegal argument: ${key}`;
    if (values.length !== 1) return `Argument must occur exactly once: ${key}`;
  }
  return "";
}

function encodeResumptionToken(state: ResumptionState) {
  return btoa(JSON.stringify(state))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function decodeResumptionToken(token: string): ResumptionState | null {
  try {
    const base64 = token.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const parsed = JSON.parse(atob(padded)) as Partial<ResumptionState>;
    if (
      parsed.version !== 1
      || (parsed.verb !== "ListIdentifiers" && parsed.verb !== "ListRecords")
      || parsed.metadataPrefix !== "oai_dc"
      || typeof parsed.cursor !== "number"
      || !Number.isInteger(parsed.cursor)
      || parsed.cursor < 0
      || (parsed.from !== undefined && !isDay(parsed.from))
      || (parsed.until !== undefined && !isDay(parsed.until))
      || (parsed.set !== undefined && parsed.set !== JOURNAL_SET)
    ) {
      return null;
    }
    return parsed as ResumptionState;
  } catch {
    return null;
  }
}

function filteredArticles(state: Pick<ResumptionState, "from" | "until" | "set">) {
  return archiveArticles
    .filter((article) => {
      const datestamp = inferredDatestamp(article);
      if (state.from && datestamp < state.from) return false;
      if (state.until && datestamp > state.until) return false;
      if (state.set && state.set !== JOURNAL_SET) return false;
      return true;
    })
    .sort((left, right) => {
      const dateCompare = inferredDatestamp(left).localeCompare(inferredDatestamp(right));
      return dateCompare || oaiIdentifier(left).localeCompare(oaiIdentifier(right));
    });
}

function parseListState(params: URLSearchParams, verb: ListVerb) {
  const token = params.get("resumptionToken");
  if (token !== null) {
    const validation = validateArguments(params, new Set(["verb", "resumptionToken"]));
    if (validation) return { errorCode: "badArgument", errorMessage: validation } as const;
    const state = decodeResumptionToken(token);
    if (!state || state.verb !== verb) {
      return {
        errorCode: "badResumptionToken",
        errorMessage: "The resumptionToken is invalid or does not belong to this verb.",
      } as const;
    }
    return { state } as const;
  }

  const validation = validateArguments(
    params,
    new Set(["verb", "metadataPrefix", "from", "until", "set"]),
  );
  if (validation) return { errorCode: "badArgument", errorMessage: validation } as const;

  const metadataPrefix = params.get("metadataPrefix");
  if (!metadataPrefix) {
    return { errorCode: "badArgument", errorMessage: "metadataPrefix is required." } as const;
  }
  if (metadataPrefix !== "oai_dc") {
    return {
      errorCode: "cannotDisseminateFormat",
      errorMessage: "Only the mandatory oai_dc metadata format is supported.",
    } as const;
  }

  const from = params.get("from") || undefined;
  const until = params.get("until") || undefined;
  const set = params.get("set") || undefined;
  if (from && !isDay(from)) {
    return { errorCode: "badArgument", errorMessage: "from must use YYYY-MM-DD granularity." } as const;
  }
  if (until && !isDay(until)) {
    return { errorCode: "badArgument", errorMessage: "until must use YYYY-MM-DD granularity." } as const;
  }
  if (from && until && from > until) {
    return { errorCode: "badArgument", errorMessage: "from must not be later than until." } as const;
  }
  if (set && set !== JOURNAL_SET) {
    return {
      errorCode: "noRecordsMatch",
      errorMessage: "The requested set does not exist or contains no records.",
    } as const;
  }

  return {
    state: {
      version: 1,
      verb,
      cursor: 0,
      metadataPrefix: "oai_dc",
      ...(from ? { from } : {}),
      ...(until ? { until } : {}),
      ...(set ? { set } : {}),
    } satisfies ResumptionState,
  } as const;
}

function identifyXml(baseUrl: string) {
  const earliestDatestamp = archiveArticles.map(inferredDatestamp).sort()[0] || "1970-01-01";
  const sample = archiveArticles[0]
    ? oaiIdentifier(archiveArticles[0])
    : `oai:${REPOSITORY_IDENTIFIER}:sample`;

  return [
    "<Identify>",
    `<repositoryName>${safeXml(REPOSITORY_NAME)}</repositoryName>`,
    `<baseURL>${safeXml(baseUrl)}</baseURL>`,
    "<protocolVersion>2.0</protocolVersion>",
    `<adminEmail>${safeXml(ADMIN_EMAIL)}</adminEmail>`,
    `<earliestDatestamp>${earliestDatestamp}</earliestDatestamp>`,
    "<deletedRecord>no</deletedRecord>",
    "<granularity>YYYY-MM-DD</granularity>",
    "<description>",
    `<oai-identifier xmlns="${OAI_IDENTIFIER_NS}" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="${OAI_IDENTIFIER_NS} ${OAI_IDENTIFIER_SCHEMA}">`,
    "<scheme>oai</scheme>",
    `<repositoryIdentifier>${REPOSITORY_IDENTIFIER}</repositoryIdentifier>`,
    "<delimiter>:</delimiter>",
    `<sampleIdentifier>${safeXml(sample)}</sampleIdentifier>`,
    "</oai-identifier>",
    "</description>",
    "</Identify>",
  ].join("");
}

function metadataFormatsXml() {
  return [
    "<ListMetadataFormats><metadataFormat>",
    "<metadataPrefix>oai_dc</metadataPrefix>",
    `<schema>${OAI_DC_SCHEMA}</schema>`,
    `<metadataNamespace>${OAI_DC_NS}</metadataNamespace>`,
    "</metadataFormat></ListMetadataFormats>",
  ].join("");
}

function listSetsXml() {
  return [
    "<ListSets><set>",
    `<setSpec>${JOURNAL_SET}</setSpec>`,
    `<setName>${safeXml(JOURNAL_SET_NAME)}</setName>`,
    "</set></ListSets>",
  ].join("");
}

function listResponseXml(state: ResumptionState, origin: string) {
  const all = filteredArticles(state);
  if (all.length === 0) {
    return {
      error: true as const,
      code: "noRecordsMatch",
      message: "No records match the requested criteria.",
    };
  }
  if (state.cursor >= all.length) {
    return {
      error: true as const,
      code: "badResumptionToken",
      message: "The resumptionToken cursor is outside the result set.",
    };
  }

  const page = all.slice(state.cursor, state.cursor + PAGE_SIZE);
  const records = state.verb === "ListRecords"
    ? page.map((article) => recordXml(article, origin)).join("")
    : page.map(headerXml).join("");
  const nextCursor = state.cursor + page.length;
  const hasNextPage = nextCursor < all.length;
  const token = hasNextPage
    ? encodeResumptionToken({ ...state, cursor: nextCursor })
    : "";
  const tokenXml = hasNextPage || state.cursor > 0
    ? `<resumptionToken completeListSize="${all.length}" cursor="${state.cursor}">${safeXml(token)}</resumptionToken>`
    : "";

  return {
    error: false as const,
    xml: `<${state.verb}>${records}${tokenXml}</${state.verb}>`,
  };
}

async function handleOai(request: Request, params: URLSearchParams) {
  const verbValues = params.getAll("verb");
  if (verbValues.length !== 1) {
    return errorXml(request, params, "badVerb", "Exactly one valid OAI-PMH verb is required.");
  }

  const verb = verbValues[0] as OaiVerb;
  const baseUrl = requestBaseUrl(request);
  const origin = new URL(baseUrl).origin;

  if (verb === "Identify") {
    const validation = validateArguments(params, new Set(["verb"]));
    if (validation) return errorXml(request, params, "badArgument", validation);
    return xmlResponse(request, params, identifyXml(baseUrl));
  }

  if (verb === "ListMetadataFormats") {
    const validation = validateArguments(params, new Set(["verb", "identifier"]));
    if (validation) return errorXml(request, params, "badArgument", validation);
    const identifier = params.get("identifier");
    if (identifier && !articleFromIdentifier(identifier)) {
      return errorXml(request, params, "idDoesNotExist", "The requested identifier does not exist.");
    }
    return xmlResponse(request, params, metadataFormatsXml());
  }

  if (verb === "ListSets") {
    const validation = validateArguments(params, new Set(["verb", "resumptionToken"]));
    if (validation) return errorXml(request, params, "badArgument", validation);
    if (params.has("resumptionToken")) {
      return errorXml(
        request,
        params,
        "badResumptionToken",
        "ListSets returns the complete set hierarchy in one response.",
      );
    }
    return xmlResponse(request, params, listSetsXml());
  }

  if (verb === "GetRecord") {
    const validation = validateArguments(
      params,
      new Set(["verb", "identifier", "metadataPrefix"]),
    );
    if (validation) return errorXml(request, params, "badArgument", validation);

    const identifier = params.get("identifier");
    const metadataPrefix = params.get("metadataPrefix");
    if (!identifier || !metadataPrefix) {
      return errorXml(
        request,
        params,
        "badArgument",
        "identifier and metadataPrefix are required.",
      );
    }
    if (metadataPrefix !== "oai_dc") {
      return errorXml(
        request,
        params,
        "cannotDisseminateFormat",
        "Only the mandatory oai_dc metadata format is supported.",
      );
    }

    const article = articleFromIdentifier(identifier);
    if (!article) {
      return errorXml(request, params, "idDoesNotExist", "The requested identifier does not exist.");
    }
    return xmlResponse(request, params, `<GetRecord>${recordXml(article, origin)}</GetRecord>`);
  }

  if (verb === "ListIdentifiers" || verb === "ListRecords") {
    const parsed = parseListState(params, verb);
    if ("errorCode" in parsed) {
      return errorXml(request, params, parsed.errorCode, parsed.errorMessage);
    }
    const result = listResponseXml(parsed.state, origin);
    if (result.error) return errorXml(request, params, result.code, result.message);
    return xmlResponse(request, params, result.xml);
  }

  return errorXml(request, params, "badVerb", "The verb is not a legal OAI-PMH verb.");
}

export function GET(request: Request) {
  return handleOai(request, new URL(request.url).searchParams);
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLocaleLowerCase("en-US").includes("application/x-www-form-urlencoded")) {
    return errorXml(
      request,
      new URLSearchParams(),
      "badArgument",
      "POST requests must use application/x-www-form-urlencoded.",
    );
  }
  return handleOai(request, new URLSearchParams(await request.text()));
}
