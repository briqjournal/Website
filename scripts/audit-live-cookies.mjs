/**
 * Read-only live cookie/privacy inventory for BRIQ.
 * Run in CI with: node scripts/audit-live-cookies.mjs
 * Records cookie NAMES and storage KEY NAMES only. Never records values.
 */
import { chromium } from "playwright";
import { mkdir, writeFile, appendFile } from "node:fs/promises";

const targets = [
  "https://briqjournal.com/tr/",
  "https://briqjournal.com/en/",
  "https://briqjournal.com/tr/arsiv/",
  "https://briqjournal.com/en/archive/",
  "https://briqjournal.com/tr/iletisim/",
  "https://briqjournal.com/en/contact/",
  "https://briqjournal.com/tr/makaleler/suudi-arabistanin-abd-ile-cin-arasinda-cok-boyutlu-kulturel-dengeleme-stratejisi/",
  "https://www.briqjournal.com/tr/",
];

const results = [];
const browser = await chromium.launch({ headless: true });
try {
  for (const target of targets) {
    const context = await browser.newContext({
      acceptDownloads: false,
      viewport: { width: 1365, height: 900 },
    });
    const page = await context.newPage();
    const networkHosts = new Map();
    const setCookieHeaders = new Set();
    const pageErrors = [];
    const pendingHeaders = [];

    page.on("pageerror", (error) => pageErrors.push(String(error.message).slice(0, 200)));
    page.on("request", (request) => {
      try {
        const host = new URL(request.url()).hostname.toLowerCase();
        if (host) networkHosts.set(host, (networkHosts.get(host) || 0) + 1);
      } catch { /* blob and data URLs */ }
    });
    page.on("response", (response) => {
      pendingHeaders.push((async () => {
        try {
          const headers = await response.headersArray();
          for (const header of headers) {
            if (header.name.toLowerCase() !== "set-cookie") continue;
            // Persist ONLY the cookie name, never its value.
            const cookieName = /^\s*([^=;\s]+)=/.exec(header.value)?.[1];
            if (cookieName) setCookieHeaders.add(cookieName);
          }
        } catch { /* A response may disappear before headers are available. */ }
      })());
    });

    let status = null;
    let error = null;
    try {
      const response = await page.goto(target, { waitUntil: "domcontentloaded", timeout: 35_000 });
      status = response?.status() ?? null;
      await page.waitForLoadState("networkidle", { timeout: 7_000 }).catch(() => {});
      await page.waitForTimeout(1200);
    } catch (cause) {
      error = String(cause?.message || cause).slice(0, 250);
    }

    await Promise.allSettled(pendingHeaders);
    const cookies = (await context.cookies()).map((cookie) => ({
      name: cookie.name,
      domain: cookie.domain,
      path: cookie.path,
      secure: cookie.secure,
      httpOnly: cookie.httpOnly,
      sameSite: cookie.sameSite,
    }));
    let storage = { localStorageKeys: [], sessionStorageKeys: [] };
    try {
      storage = await page.evaluate(() => ({
        localStorageKeys: Object.keys(window.localStorage),
        sessionStorageKeys: Object.keys(window.sessionStorage),
      }));
    } catch { /* Blocked by challenge, cross-origin navigation or browser policy. */ }

    const finalUrl = page.url();
    const frameHosts = [...new Set(page.frames().map(frame => {
      try { return new URL(frame.url()).hostname; } catch { return ""; }
    }).filter(Boolean))].sort();

    results.push({
      target, finalUrl, status, error,
      suspectedChallenge: status === 403 || status === 429 || status === 503
        || /cdn-cgi\/challenge-platform/i.test(finalUrl),
      cookieNames: [...new Set(cookies.map(cookie => cookie.name))].sort(),
      cookies, setCookieHeaderNames: [...setCookieHeaders].sort(), storage,
      requestHosts: [...networkHosts].sort(([a], [b]) => a.localeCompare(b))
        .map(([host, count]) => ({ host, count })),
      frameHosts, pageErrors: pageErrors.slice(0, 10),
    });
    await context.close();
  }
} finally {
  await browser.close();
}

await mkdir("cookie-audit-output", { recursive: true });
const report = {
  generatedAt: new Date().toISOString(),
  scope: "Anonymous Chromium visits to selected public BRIQ routes; no site/account changes.",
  limitations: [
    "A clean run does not prove that Cloudflare never sets security cookies for challenged visitors.",
    "Cloudflare dashboard rules, WAF and Bot settings cannot be inferred from source or one browser run.",
    "An automated browser can be challenged differently from a human visitor.",
    "Data processing and legal basis cannot be established from a cookie inventory alone.",
  ],
  results,
};
await writeFile("cookie-audit-output/report.json", JSON.stringify(report, null, 2) + "\n");

const allCookieNames = [...new Set(results.flatMap(item => item.cookieNames))].sort();
const allSetCookieNames = [...new Set(results.flatMap(item => item.setCookieHeaderNames))].sort();
const allHosts = [...new Set(results.flatMap(item => item.requestHosts.map(host => host.host)))].sort();
const summary = [
  "## BRIQ live cookie/privacy scan",
  "",
  "Read-only Chromium audit. No cookie values, personal data or credentials recorded.",
  "",
  "| Test | Outcome |",
  "| --- | --- |",
  ...results.map(item => `| \`${new URL(item.target).pathname}\` (${new URL(item.target).hostname}) | HTTP ${item.status ?? "N/A"}; cookies ${item.cookieNames.length}; storage keys ${item.storage.localStorageKeys.length + item.storage.sessionStorageKeys.length}${item.suspectedChallenge ? "; possible challenge" : ""}${item.error ? "; navigation error" : ""} |`),
  "",
  `**Cookie names:** ${allCookieNames.join(", ") || "(none observed)"}`,
  "",
  `**Set-Cookie names:** ${allSetCookieNames.join(", ") || "(none observed)"}`,
  "",
  `**Network hosts:** ${allHosts.join(", ") || "(none observed)"}`,
  "",
  "Full evidence: report.json artifact. Cloudflare account settings still require separate confirmation.",
  "",
].join("\n");
console.log(summary);
if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, summary);
if (results.every(item => item.error || item.status === null)) process.exitCode = 1;
