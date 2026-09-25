// Sampled site-wide audit of production.
// Full sitemap has 1240 URLs; scanner.maxRoutes caps the scan to a
// representative sample across both language trees and template families.
// NOTE: no `defineUnlighthouseConfig` import — when the CLI runs via npx
// (unlighthouse not installed in the project), that import cannot resolve.
// A plain default export works the same way.
export default {
  site: 'https://briqjournal.com',
  scanner: {
    maxRoutes: 120,
    device: 'desktop',
  },
  // Polite concurrency for a production scan.
  puppeteerClusterOptions: {
    maxConcurrency: 4,
  },
  ci: {
    buildStatic: true,
  },
}
