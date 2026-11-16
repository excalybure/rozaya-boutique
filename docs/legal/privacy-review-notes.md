# Privacy review and local implementation handoff

## Status and publication gates

The [privacy policy](drafts/privacy-policy.md) is a counsel-review draft, not legal
advice or an approved live policy. Neither this document nor the draft is
rendered as website policy content. The local policy routes read Shopify's
saved policy objects. No Shopify policy, admin setting, pixel, Network
Intelligence setting, deployment, or Git remote was changed by this work.

**Important live-content finding:** a read-only Storefront API request returned
saved Terms containing unresolved `{{...}}` tokens and links under
`markdownlivepreview.com` with encoded tokens. The earlier "Done" cannot be
treated as evidence of a final, completed policy. The local renderer withholds
such drafts and marks the page noindex, but it does **not** remove them from
Shopify checkout or any other published surface. Owner/counsel must replace
the incomplete saved Terms before launch; this work does not authorize doing
that automatically.

Before publishing a replacement privacy policy:

1. Resolve `{{EFFECTIVE_DATE}}`, `{{LEGAL_OPERATOR_NAME}}`,
   `{{PRIVACY_CONTACT_EMAIL}}`, and `{{BUSINESS_POSTAL_ADDRESS}}` with approved
   facts, and verify `{{CONTACT_INFORMATION_URL}}` and `{{PRIVACY_CHOICES_URL}}`.
   The [generator](README.md) fills the effective date from today's local date;
   generate on the intended effective date. Do not publish a new support alias
   until forwarding and replies work.
2. Confirm legal operator identity, business/controller roles, required contact
   methods, and any required European/UK representative or DPO. California
   location does not settle worldwide requirements.
3. Complete a processing/vendor inventory, including the previous 12 months
   where required: hosting logs, Shopify/Enhanced Services, Global-e,
   payments/fraud, carriers, email, apps, exports, backups, and provider-side
   analytics. Record categories, sources, purposes, recipients, sensitive data,
   retention, and sale/sharing/targeted-advertising classifications. Adapt any
   jurisdiction-specific notice, including California disclosures, accordingly.
4. Confirm applicable legal bases, transfer mechanisms, contracts and provider
   controller/processor roles. Do not claim exclusive-US processing or a
   specific safeguard based only on the Shopify hosting-location screen.
5. Document retention periods/criteria and deletion procedures, identity and
   agent verification, response deadlines, appeal/escalation, and handling of
   children's information. Verify the "not intended for children" statement
   against actual products and marketing. Confirm any sensitive-information,
   under-age sale/sharing, profiling, or financial-incentive disclosures needed.
6. Complete the runtime matrix below on HTTPS deployment candidates and
   checkout. A working browser opt-out is not proof of account-linked/server
   processing or of every jurisdiction's requirements.
7. Export the current automated policy and confirm how Shopify automation will
   be disabled or reconciled **before** intentionally publishing custom text.
   Do not overwrite it without a reviewed publication decision.

## Evidence retained from the owner

- Shopify Customer events showed no installed app/custom pixels. This is not
  proof that hosting, Shopify, or another provider collects no information.
- Customer privacy showed automated policy, automated banner for 31 regions,
  automated data-sharing opt-out for 15 states including California and
  Colorado, and Shopify Network Intelligence enabled.
- Shopify data hosting location showed United States. Marketing-preference
  and double-opt-in rows did not establish their enabled state.
- The custom Next.js storefront is hosted on Vercel; Shopify handles commerce
  and checkout. The existing `cartId` cookie is used for the shopping cart.
- Read-only API inspection confirmed nonempty saved privacy, refund, shipping,
  Terms, and contact policy objects. Saved content is not proof of legal
  approval. Existing privacy HTML contained real Shopify privacy/portal links;
  missing links in pasted plain text were not evidence of broken HTML links.

## Implementation choices

- `/policies/privacy-policy`, `/policies/refund-policy`,
  `/policies/shipping-policy`, `/policies/terms-of-service`, and
  `/policies/contact-information` fetch Shopify **policy objects**, not Pages.
  They do not collide with the existing single-segment `[page]` route.
- Policy requests explicitly use Storefront API `2026-10`. The existing
  catalog/cart endpoint requests an obsolete version and currently falls
  forward to `2026-01`, whose schema lacks `contactInformation`. This was
  reproduced as a GraphQL error and fixed for policy requests; unrelated
  commerce requests were not migrated in this change.
- Saved HTML links to this shop's hosted `pages/data-sharing-opt-out` are
  localized to `/privacy-choices#data-sharing` without changing their wording.
  Shopify's independent privacy-policy/portal links remain external.
- Footer links expose those pages, `/privacy-choices`, and an explicit
  "Do not sell or share my personal information" link.
- The Shopify-hosted `privacy-banner/storefront-banner.js` script supplies the
  actual regional banner and cookie preferences. Initialization passes the
  headless storefront host and public Storefront token. The session-backed SDK
  uses a same-origin Storefront API proxy to the configured shop checkout host.
  No country is forced in production code, and no regional list is hard-coded.
- Only the documented public token format is passed to the browser. Admin or
  private Storefront credentials must never be substituted. The configured
  token was already used with the public Storefront header; its value is not
  recorded in documentation or tests.
- The library controls consent/GPC. Application code does not read/write
  Shopify consent cookie values, manufacture consent on load, or convert a cookie
  accept/decline into a sale/sharing opt-in. The separate explicit opt-out only
  submits `sale_of_data: false` with headless context. The proxy forwards opaque
  session cookies and each upstream `Set-Cookie` header unchanged; it does not
  decode, merge, or reconstruct them. Responses are not cached. The preview
  candidate uses a server-only private Storefront credential and sends Vercel's
  trusted visitor IP in Shopify's buyer-IP header. Missing private credentials
  or trustworthy visitor IP fail instead of applying the function's region.
- Errors and missing configuration disable actions and show an assistance
  message, never an invented success. The opt-out confirms the API's allowed
  state before reporting success. JavaScript-disabled visitors retain ordinary
  policy/contact links.
- No analytics events, marketing pixels, advertising integrations, or new
  account system were installed. Any future optional tracker must use Shopify's
  **Allowed** methods and consent-change events before collection; merely
  having a banner does not gate arbitrary third-party code.

## Verification matrix and limits

### Session-preservation candidate and rollback

After the original deployment, live tests demonstrated that the legacy
cross-origin transport reset unrelated explicit consent purposes. Decline then
sale/sharing opt-out cleared cookie denials; accepting cookies after opt-out
cleared `sale_of_data: 'no'`. The earlier tests below did not cover these
interactions and were insufficient to establish independence.

The follow-up uses Shopify's current session-backed headless bootstrap
(`isHeadless`, `asyncConsent`, `asyncVisitorState`, same-origin `consentDomain`)
and a fixed-shop Storefront proxy. Shopify's session now retains omitted purposes
for both the native panel and separate opt-out; application code does not issue
corrective consent writes after events or patch Shopify's banner internals.
Readiness waits for the SDK's completed session initialization, not just download.

The original public-token follow-up was exercised against the real SDK/API with
isolated local Edge contexts: untouched purposes stay unset, decline then opt-out stays denied,
opt-out then native Accept/Decline/Save retains the opt-out, mixed choices survive
reload, configured regional GPC remains enforced after accepting cookies, and
blocked script/session loads show errors and disable controls. See the README
for the opt-in runner. Unit regressions cover proxy/session headers, separate
cookies, trusted IP handling, same-origin validation, errors and readiness.
An additional real-SDK migration diagnostic retained legacy cookie denials,
sale opt-outs, and mixed purpose decisions when opening the new session-backed
app. Those choices were created through the legacy SDK, not by constructing
consent cookies. The five browser regressions also passed against the local
optimized production build, not just development mode.
These are local checks, not evidence of deployment, all-region behavior,
cross-domain sessions, checkout continuity, or account-level opt-outs.

The public-token candidate was subsequently deployed as `c713200a`. Its five
interaction browser tests passed over public HTTPS, but an additional comparison
found proxy region `USVA` versus direct Shopify region `USCA` from the same
browser. Forwarded IP headers were ignored in controlled public-token tests.
The candidate was therefore reverted in `36fff495`, restoring the original
regional behavior and leaving the independent-choice defect unresolved.

The current isolated preview candidate uses the private Storefront credential
only on the server, with `Shopify-Storefront-Private-Token` and the documented
`Shopify-Storefront-Buyer-IP` header. The public browser configuration remains
separate. Adding the secret alone is not a fix; regional behavior and consent
interactions require runtime verification before production promotion.

### Private-token preview verification (owner-assisted)

The owner tested preview commit `85b45216885bff8668d8ac7129e6cc64c7d199be`
on the isolated `fix/privacy-session-private-auth` branch. Vercel reported a
successful Preview deployment. Its sign-in protection prevented independent
automated browser access, so the runtime findings below are owner-reported UI
actions and read-only Shopify API outputs, not an automated suite result.

| Check                               | Owner-reported result                                                                                                                                                                                          |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Native preferences panel            | Opened successfully.                                                                                                                                                                                           |
| Regional comparison                 | Preview and restored live site both returned `USCA` in the same browser/network.                                                                                                                               |
| Cookie denial then separate opt-out | After Decline all, separate opt-out and reload, all four consent purposes were `no`.                                                                                                                           |
| Cookie acceptance after opt-out     | After Accept all and reload, the three cookie purposes were `yes`, `sale_of_data` stayed `no`, and `saleOfDataAllowed()` was `false`.                                                                          |
| Selective Save and reload           | Marketing and Analytics `no`, Preferences `yes`, sale/sharing `no`. An earlier Analytics `yes` result matched a checkbox the owner had not unchecked; after correcting the selection, the saved state matched. |
| Untouched fresh session             | In a fresh private window without consent interactions, all four recorded purposes were empty strings.                                                                                                         |
| Native Firefox GPC, fresh session   | After enabling the native setting, a fresh private session returned region `USCA`, GPC `true`, opt-out region `true`, and sharing allowed `false` before a manual consent choice.                              |
| Cookie acceptance with GPC active   | After Accept all and reload, GPC remained `true` and sharing allowed remained `false`.                                                                                                                         |

The private-token candidate also passed 22 focused unit tests, TypeScript
no-emit, the optimized webpack build, and focused formatting/whitespace checks.
Its browser regression runner now includes direct-versus-proxy regional and
default-permission comparison, but that automated Preview check was not run
through the sign-in barrier. No protection was disabled and no secret was
included in the owner's console outputs.

This is bounded California/browser evidence, not all-region, all-domain,
checkout-continuity, account/server-side opt-out, or legal-compliance approval.
Before promotion, the private token must also be configured securely for
Production. Production behavior must be rechecked after deployment rather than
inferred from these Preview results.

### Historical initial verification

The checks below used headless Microsoft Edge, a local Next.js server, and the
real Shopify-hosted SDK and shop API. No orders or payments were submitted.
Browser contexts were isolated and closed after testing. SDK tests necessarily
communicated with Shopify; no merchant advertising pixels were installed.
The optimized build was also started locally: draft Terms were absent from the
complete HTML response, preferences opened, opt-out was confirmed, and the
simulated GPC test again blocked sale/sharing in `USCA`. This was a local
production-mode test, not a Vercel deployment.

| Scenario                             | Result / remaining requirement                                                                                                                                                                                                                                                                                             |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fresh California visitor             | Shopify detected `USCA`; no automatic cookie banner, empty consent-purpose decisions, sale/sharing initially allowed without GPC. No application-generated acceptance.                                                                                                                                                     |
| Configured opt-in region             | **Not geographically verified.** Test from a configured European/other opt-in region before launch; regional SDK configuration alone is not runtime evidence.                                                                                                                                                              |
| Preferences reopened from footer     | Shopify dialog opened. Accept all set preferences/analytics/marketing to `yes`, survived reload, and could be withdrawn to `no`. A separate decline test survived reload. Sale/sharing was not turned into an opt-in.                                                                                                      |
| Separate sale/sharing opt-out        | Confirmed `saleOfDataAllowed() === false` and `sale_of_data: 'no'`; survived reload. Other consent-purpose decisions remained unchanged.                                                                                                                                                                                   |
| GPC enabled                          | With simulated `navigator.globalPrivacyControl === true` and `Sec-GPC: 1`, real Shopify responses in detected `USCA` reported sale/sharing blocked on initial load. This is a controlled signal test, not a physical GPC-browser/device fleet test.                                                                        |
| Script blocked/configuration invalid | Blocking the SDK in-browser showed an error and disabled both actions. Unit tests reject malformed/private tokens, missing SDK, API errors, unconfirmed writes, and timeouts without success.                                                                                                                              |
| Policy links and draft withholding   | Privacy/refund/shipping/contact routes returned 200 with content. Terms showed unavailable/noindex, not unfinished draft text. Unknown policy returned 404. Two saved opt-out links were localized; provider links retained.                                                                                               |
| Mobile and JavaScript disabled       | At 390px width there was no document horizontal overflow in the exercised preferences flow. With JavaScript disabled, assistance text and contact link remained visible. This is not a full accessibility audit.                                                                                                           |
| Checkout handoff                     | **Blocked.** A product was added to a temporary cart; Proceed to Checkout redirected to `https://rozaya-boutique.vercel.app/password`, which rendered 404. No checkout consent API was available there. Checkout settings/password/redirect configuration need owner review; no cause is asserted from the redirect alone. |
| Multiple storefront domains          | **Not verified or deployed.** Repeat HTTPS choices and checkout tests on canonical host/aliases; do not assume cross-domain sharing.                                                                                                                                                                                       |
| Account/server-side request          | **Not verified.** Confirm Shopify/customer request processes, identity linking and provider behavior independently; browser choices alone are insufficient.                                                                                                                                                                |

Developer verification:

- `node --test tests/privacy.test.mjs`: 14 tests passed on Node 24, covering
  policy routing/draft/link behavior and SDK initialization, separation of
  purposes, and failures. Native TypeScript module-detection warning is
  non-fatal; package module semantics were not changed just to suppress it.
- TypeScript no-emit check passed.
- `next build --webpack`: passed, including compilation, type checks and page
  generation. Warnings concerned stale baseline-browser metadata and a
  metadataBase fallback; neither is evidence of a checkout test.
- Formatting, whitespace, and local-document-link checks are separate from
  legal approval. No test establishes universal legal compliance.

Shopify's current custom-storefront documentation recommends Hydrogen's
analytics/session integration for full session continuity and Shopify
Analytics. This Next.js app now has the same-origin privacy transport, not the
full Hydrogen analytics/cart/session infrastructure. This
Customer Privacy API/banner integration must not be represented as full
Hydrogen Analytics, and cross-checkout behavior needs its own evidence. Do not
enable tracking to make a test pass. If checkout loses choices, treat it as a
launch blocker and design the supported session integration before deployment.

## Sources

- [Shopify Customer Privacy API](https://shopify.dev/docs/api/customer-privacy)
  (headless configuration, separate sale/sharing opt-out, regional GPC,
  supported permission methods, prohibition on direct cookie manipulation).
- [Shopify's headless banner integration source, Hydrogen 2025.5.0](https://github.com/Shopify/hydrogen/blob/%40shopify/hydrogen%402025.5.0/packages/hydrogen/src/customer-privacy/ShopifyCustomerPrivacy.tsx)
  (Shopify CDN script and headless options; not a claim that the whole Hydrogen
  session infrastructure is installed here).
- [Current Hydrogen analytics and consent guidance](https://shopify.dev/docs/storefronts/hydrogen/analytics)
  (session/proxy requirements and checkout-continuity limitations).
- [Shopify's session-backed consent bootstrap tests](https://github.com/Shopify/hydrogen/blob/main/packages/hydrogen/src/core/shopify-scripts/consent-tracking.test.ts)
  (current async headless configuration and same-origin consent domain).
- [Shopify's Storefront API forwarding implementation](https://github.com/Shopify/hydrogen/blob/27066a28577484f406222116a959eb463d255685/packages/hydrogen/src/storefront.ts#L546-L611)
  (session-cookie and selected-header transport).
- [Vercel request headers](https://vercel.com/docs/headers/request-headers)
  (platform-supplied visitor IP for geolocation).
- [Storefront private-token authentication](https://shopify.dev/docs/api/storefront/latest#make-server-side-requests-with-a-private-access-token)
  (server-only authentication and buyer-IP header).
- [Storefront Shop policy fields](https://shopify.dev/docs/api/storefront/latest/objects/Shop).
- [Shopify Customer privacy settings](https://help.shopify.com/en/manual/privacy-and-security/privacy/customer-privacy-settings/privacy-settings).
- [Shopify automated store policies](https://help.shopify.com/en/manual/checkout-settings/refund-privacy-tos).
- [Shopify consumer privacy policy](https://www.shopify.com/legal/privacy/app-users),
  [privacy portal](https://privacy.shopify.com/en), and
  [cookie policy](https://www.shopify.com/legal/cookies).
