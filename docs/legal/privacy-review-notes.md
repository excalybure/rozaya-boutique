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
  headless storefront host, shop checkout host, and public Storefront token.
  No country is forced in production code, and no regional list is hard-coded.
- Only the documented public token format is passed to the browser. Admin or
  private Storefront credentials must never be substituted. The configured
  token was already used with the public Storefront header; its value is not
  recorded in documentation or tests.
- The library controls consent/GPC. Application code does not read/write
  Shopify consent cookies, manufacture consent on load, or convert a cookie
  accept/decline into a sale/sharing opt-in. The separate explicit opt-out only
  submits `sale_of_data: false` with headless context.
- Errors and missing configuration disable actions and show an assistance
  message, never an invented success. The opt-out confirms the API's allowed
  state before reporting success. JavaScript-disabled visitors retain ordinary
  policy/contact links.
- No analytics events, marketing pixels, advertising integrations, or new
  account system were installed. Any future optional tracker must use Shopify's
  **Allowed** methods and consent-change events before collection; merely
  having a banner does not gate arbitrary third-party code.

## Verification matrix and limits

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
Analytics. This project is Next.js without that infrastructure. The direct
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
- [Storefront Shop policy fields](https://shopify.dev/docs/api/storefront/latest/objects/Shop).
- [Shopify Customer privacy settings](https://help.shopify.com/en/manual/privacy-and-security/privacy/customer-privacy-settings/privacy-settings).
- [Shopify automated store policies](https://help.shopify.com/en/manual/checkout-settings/refund-privacy-tos).
- [Shopify consumer privacy policy](https://www.shopify.com/legal/privacy/app-users),
  [privacy portal](https://privacy.shopify.com/en), and
  [cookie policy](https://www.shopify.com/legal/cookies).
