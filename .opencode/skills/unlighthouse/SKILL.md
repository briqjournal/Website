---
name: Unlighthouse
description: Site-wide Google Lighthouse audits with the Unlighthouse CLI. Use when auditing every page of a site for performance (Core Web Vitals), accessibility, best practices, or SEO, running scans from the CLI or CI, generating static HTML/JSON/CSV reports, or tuning scan options such as budgets, sampling, device emulation, URL filters, and auth.
---

# Unlighthouse

Unlighthouse runs Google Lighthouse on every page of a site in parallel. It
discovers URLs (robots.txt, sitemap.xml, internal links), audits them with
threaded Chrome workers, smart-samples dynamic routes, and combines the
results into one report with an interactive client.

Use it when you need:

- A site-wide performance / CWV / SEO / accessibility audit, not a single-URL check.
- A regression check after a deploy, with a budget gate.
- Machine-readable per-route results (JSON, CSV) or a shareable static HTML report.

Source of truth: https://unlighthouse.dev/ (repo: https://github.com/harlan-zw/unlighthouse).

## Requirements

- Node.js 22.18+.
- Chrome: uses the system Chrome; if missing, downloads Chromium automatically.
- CI environments: install `@unlighthouse/cli` together with `puppeteer`.

## Two binaries

| Binary | Purpose | Behavior |
| --- | --- | --- |
| `unlighthouse` | Interactive audit | Crawls, scans, and serves a live dashboard client (default port 5678); results stream in as pages complete. |
| `unlighthouse-ci` | CI / machine-readable audit | Same scan, no interactive client; writes reports to disk and exits 1 when a budget fails, 0 when all pages pass. |

```bash
# Interactive scan with live dashboard
npx unlighthouse --site example.com

# CI scan with a budget gate: exit 1 if any page scores below 75
npx unlighthouse-ci --site example.com --budget 75

# CI scan plus a shareable static HTML report
npx unlighthouse-ci --site example.com --budget 75 --build-static
```

Prefer `unlighthouse-ci` when the agent runs the scan: it finishes on its own
and produces files to read, while `unlighthouse` keeps a dev server running.

## Configuration

Create `unlighthouse.config.ts` in the project root (`.js`/`.mjs` also work,
or pass `--config-file <path>`). When the CLI runs via npx (unlighthouse not
installed in the project), the `defineUnlighthouseConfig` import cannot
resolve from the config file — skip the import and export a plain default
object; it works the same way. With a local install the import is available:

```ts
import { defineUnlighthouseConfig } from 'unlighthouse/config'

export default defineUnlighthouseConfig({
  site: 'https://example.com',
  scanner: {
    device: 'desktop',              // default is mobile
    samples: 3,                     // run each page N times, average
    throttle: true,                 // simulate real network conditions
    exclude: ['/api/*', '/admin/*'], // skip paths (globs)
    include: ['/blog/*'],           // or scan only these paths
  },
  ci: {
    budget: {                       // per-category minimum scores (1-100)
      performance: 80,
      accessibility: 90,
      'best-practices': 80,
      seo: 90,
    },
    buildStatic: true,
  },
  lighthouseOptions: {              // passed straight to Lighthouse
    onlyCategories: ['performance', 'accessibility'],
    skipAudits: ['uses-http2'],
  },
})
```

For reliable numbers (CI assertions) use `samples: 3` plus
`puppeteerClusterOptions: { maxConcurrency: 1 }`; this is much slower.
Authenticated scans support `auth` (basic), `cookies`, `extraHeaders`, and
`--auth user:pass` / `--cookies foo=bar;bar=foo` on the CLI.

## Key CLI flags

Both binaries accept these (shown via `-h, --help`):

- `--site <url>` — host URL to scan.
- `--root <path>` — project root; changes where the config is read from.
- `--config-file <path>` — explicit config file.
- `--output-path <path>` — where the client and reports are written (default `.unlighthouse/`).
- `--desktop` / `--mobile` — device emulation.
- `--samples <n>`, `--throttle` — sampling and throttling.
- `--urls <paths>` — explicit relative paths to scan (comma-separated); disables the link crawler.
- `--include-urls` / `--exclude-urls <paths>` — relative path or regex filters.
- `--sitemaps <urls>` — override sitemaps from robots.txt.
- `--disable-sitemap`, `--disable-robots-txt`, `--disable-dynamic-sampling`.
- `--enable-javascript` / `--disable-javascript` — wait for JS execution (enable for SPAs).
- `--enable-i18n-pages` / `--disable-i18n-pages` — scan or skip x-default pages.
- `--cache` / `--no-cache`.
- `-d, --debug` — enable debug logging.

`unlighthouse-ci` adds (verified against v0.18.1): `--budget <1-100>` —
the minimum score that can pass, `--build-static` — build a static site for
the reports, `--reporter <csv|csvExpanded|json|jsonExpanded|false>` (default
`json`), and LHCI upload flags (`--lhci-host`, `--lhci-build-token`,
`--lhci-auth`).

## Output and reports

- Reports and the client are written to `.unlighthouse/` in the project root
  (or `--output-path`). Gitignore this directory.
- `--reporter json` (the default) writes per-route results to disk
  (`ci-result.json`, a flat JSON array); `jsonExpanded` writes a full
  per-route metrics object. Accept both shapes when parsing.
- `--build-static` produces a static HTML dashboard deployable to any static
  host; live examples: https://inspect.unlighthouse.dev/

## Agent workflow

1. Pick the target: a deployed URL, or a locally running dev server (start it
   first; scanning `http://localhost:<port>` works the same way).
2. Run `unlighthouse-ci --site <url> --budget <n>` (or with a config file) in
   the background if the site is large; the exit code is the budget result.
3. Read the generated report from `.unlighthouse/` (`ci-result.json` or the
   chosen reporter output) and summarize per-route and aggregate findings.
4. For debugging, re-run with `--debug`. First scans are slow (Chrome warmup,
   route discovery); `--cache` enables caching for later runs.
5. Route caps and per-page timeouts are set in a config file via
   `scanner.maxRoutes` and `lighthouseOptions`; the CLI has no
   `--max-routes` flag.

## Fix guidance

For interpreting and fixing results (LCP, CLS, INP, accessibility, SEO
audits), use the guides at https://unlighthouse.dev/learn-lighthouse/ and the
glossary at https://unlighthouse.dev/glossary/ rather than guessing.
