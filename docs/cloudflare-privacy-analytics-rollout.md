# BRIQ — Cloudflare analytics and privacy rollout (2026-10-14)

## Decisions

- **Do not introduce non-essential cookies** simply to improve analytics or support possible future sponsorship.
- **Do not add a cookie-consent banner** while the verified deployment has no non-essential cookies. Reassess after every tracking, advertising, embedded-content or security configuration change.
- Keep Cloudflare Web Analytics, already observed on the deployed site. It is cookie-free. Its browser beacon is Cloudflare-managed and does not require a new BRIQ application Worker endpoint.
- Do not add pageview tracking by posting to a custom analytics endpoint. That would spend request/operation quota.
- No Analytics Engine binding, write, or runtime instrumentation is introduced in this PR.

## Evidence and limits

The read-only GitHub Actions browser audit in draft PR #278 checked eight ordinary TR/EN production paths and reported no cookies, Set-Cookie responses, localStorage or sessionStorage items. It detected Cloudflare Web Analytics but no advertising trackers in those flows.

The account's Cloudflare Security analytics, supplied by the site administrator for 14 October 2026, recorded one Managed Challenge in the previous 24 hours. Therefore **conditional** security cookies, including potential cf_clearance, cannot be ruled out. Browser tests do not establish cookie absence in every protection state.

Cloudflare Zaraz was reported **inactive** by the administrator; Bot Fight Mode **off**, Browser Integrity Check **on**. Recheck these facts if settings change.

## Release blockers: must confirm before merging or publishing the policy pages

1. **Responsible legal entity:** the current BRIQ footer names Çin İş Geliştirme ve Dostluk Derneği / Turkish-Chinese Business Development and Friendship Association as publisher. Confirm the actual KVKK data controller, its complete legal name, postal service address and valid rights-request contact.
2. **Processing inventory:** verify exact Cloudflare products and logs, account access, email inbox provider and DergiPark relationship. Do not imply the BRIQ site operates DergiPark's submission system.
3. **Lawful basis:** obtain a purpose-by-purpose KVKK Article 5 assessment for security, analytics and editorial correspondence. Legitimate interests cannot simply be presumed for every data flow.
4. **International transfers:** assess Cloudflare's actual processing locations, contractual roles, and any requirements under the current KVKK Article 9 regime. Do not assume a signed cross-border transfer mechanism.
5. **Retention:** establish the real Cloudflare account log retention, correspondence retention rules, deletion and response workflows, then replace general criteria with verified periods where appropriate.
6. **Security cookies:** recheck Cloudflare challenge/cookie configuration and actual attributes/retention; the present evidence establishes a potential security cookie, **not** that one was written during the single observed challenge.
7. **Editorial / legal review:** approve TR and EN text with responsible representatives and qualified counsel; review accessibility, footer navigation, sitemap, metadata and actual published routes.
8. **Do not merge a draft** solely because CI passes. Legal review is distinct from engineering review.

## Low-quota analytics next phase (separate PR, not in this PR)

**Stage A: no new server code.** Use the existing Cloudflare Web Analytics URL/path and referrer reporting to examine top articles, sources, language routes, countries and trends. Establish a measured baseline rather than re-collecting the same pageview information.

**Stage B: PDF events only if a gap is demonstrated.** Inspect the existing Worker/R2 PDF serving code and current Free-plan quotas first. If a PDF request already executes the site Worker, consider writing a *minimal, aggregated* event to Workers Analytics Engine within that existing request, with no extra fetch from the browser. Keep bot/caching differences, HEAD/Range requests, prefetch and direct open versus download distinctions explicit. Confirm whether the same request is actually executed by the Worker and whether CPU, Analytics Engine write quota, and query usage remain acceptable.

**Stage C: retention.** Analytics Engine has its own limited data retention. Only if annual reporting is required, consider low-frequency aggregation into the site's existing Cloudflare storage after checking R2 operations and costs. Avoid persisting IPs or other identifiers where not necessary.

**Future advertising:** use contextual placement and aggregated impressions/clicks first. Any additional tracking/consent requirements must be separately assessed and implemented *before* activation. Sponsorship must remain clearly labeled and editorially independent.

## References

- KVKK, Çerez Uygulamaları Hakkında Rehber: https://www.kvkk.gov.tr/Icerik/7353/Cerez-Uygulamalari-Hakkinda-Rehber
- KVKK, Aydınlatma Yükümlülüğü: https://www.kvkk.gov.tr/Icerik/2033/Aydinlatma-Yukumlulugu-
- Cloudflare Web Analytics (data origin and collection): https://developers.cloudflare.com/web-analytics/data-metrics/data-origin-and-collection/
