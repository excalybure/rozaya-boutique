# Google Merchant Center

## Scheduled product feed

In Merchant Center, select **Add products from a file → Enter a link to your
file**, and use:

```text
https://rozaya-boutique.com/feeds/google.xml
```

The feed is public product data and requires no username or password. Daily
scheduled fetching is a starting point, not real-time stock synchronization.
The route queries Shopify anew on each request with `no-store` on both upstream
requests and the response. Google still needs to fetch and process changes.
One-of-a-kind inventory can sell between fetches; review Merchant Center's
automatic item updates and diagnostics, and consider more frequent updates or a
Merchant API integration if the scheduled delay is unacceptable.

The route is independent of the SEO sitemap. It paginates the full Shopify
Storefront catalog instead of using the existing 100-product storefront query.
On November 16, 2026, the owner confirmed that all 323 storefront-accessible
products were real inventory intended for Google listings. That confirmation
does not certify Google's product-policy eligibility, identifiers, image quality,
shipping settings, or international restrictions.

## Data and inclusion rules

- Only products accessible through the configured Shopify Storefront/Headless
  channel are read. Draft/unpublished products outside that channel are not
  exposed by this feed.
- The existing `nextjs-frontend-hidden` tag excludes a product. Add the explicit
  `google-shopping-exclude` tag to hide a product from this feed without hiding
  it from the storefront. An intentionally empty catalog can produce an empty
  feed; a wholly invalid catalog fails instead.
- The current storefront displays the maximum product price, not the selected
  variant's price. Until that landing-page behavior is revised and verified,
  products with multiple variants are excluded with a diagnostic reason. All
  323 products inspected at implementation had exactly one variant.
- Stable item IDs are `shopify_` followed by the Shopify variant's numeric ID.
  They do not change when titles or SKUs change.
- Landing links use `https://rozaya-boutique.com/product/<encoded-handle>`.
  Preview hosts and Shopify's theme URLs never become product landing links.
- Product title, plain-text description, featured image, product type, variant
  price and sale availability come from Shopify. Out-of-stock items remain in
  the feed with `out_of_stock`; they are not relabeled as available.
- The feed explicitly requests US/English Shopify context and requires positive
  USD prices with at most two decimal places. It does not round another
  currency or invent a country-specific price.
- Conditions come only from explicit tags. `condition:new`, `condition:used`
  and `condition:refurbished` map directly. The owner confirmed that
  `condition:excellent` and `condition:good` mean **used/pre-owned**. Product
  pages display the same condition and include it in their offer structured
  data. Unknown, missing or conflicting condition tags are excluded, not
  assumed to mean new.
- No brand, GTIN, MPN, `identifier_exists=no`, shipping rate, tax amount, gender,
  age group, material or Google product category is invented. The current
  catalog has no barcodes, all vendor values are the reseller's name, and maker
  fields require review. In particular, absence of a barcode does not establish
  that an identifier was never assigned. Google may flag missing attributes or
  limit visibility; review actual manufacturer identifiers before adding them.
- Text is XML-escaped and limited to Google's title/description lengths. XML
  control characters and unpaired surrogates are removed. No AI-generated text
  is introduced by the feed; merchants must still accurately label any
  AI-generated source assets as required by Google.

## Shipping weights: provisional until inventory weights are corrected

The owner confirmed the standard prepared empty package weighs **3 oz** and
that Shopify product weights should represent jewelry alone. Both the
Storefront API and Shopify Admin currently report **zero weight for all 323
variants**. The owner explicitly chose to defer weighing and use these stored
values provisionally. These are not verified packed shipment weights.

The feed now emits `shipping_weight` as **stored Shopify item weight + 3 oz**.
It converts Shopify grams, kilograms, ounces and pounds to ounces, rounds upward
to 0.001 oz, and enforces Google's imperial 2,000 lb limit. It does not change
Shopify product weights, package settings or checkout rates. A corrected Shopify
weight will appear in the next feed fetch without another code deployment.

A stored zero produces **3.000 oz**, which represents packaging only and can
understate actual shipment weight. `X-Merchant-Feed-Zero-Weights` and server
warnings count included items with zero stored weight. Missing, negative,
non-finite or unsupported weights are excluded with diagnostics rather than
silently treated as zero. Do not describe carrier rates based on these values
as validated, or assume Google's shipping-policy acceptance guarantees their
accuracy. Correct the item weights and recheck checkout/Google rates later.

The standard-package assumption must be reviewed for products or combined
orders needing different packaging. No unverified dimensions, carrier service,
dispatch ZIP, shipping fee or discount is introduced by this calculation.

Missing required attributes, invalid images/prices/IDs and unsupported variants
produce explicit exclusion diagnostics. HTTP response headers
`X-Merchant-Feed-Items` and `X-Merchant-Feed-Excluded` expose the counts; server
logs list excluded product IDs and reasons. Unexpected errors, configuration
failures, upstream HTTP/GraphQL failures, stalled pagination and duplicate IDs
fail the request with HTTP 503 rather than returning a partial or invalid empty
feed. Credentials and upstream error details are not returned in the response.

## Merchant Center setup still required

Deploying this endpoint does **not** verify or claim a Merchant Center website,
submit a data source, configure shipping/returns, approve products, or enable an
advertising campaign.

1. Confirm Merchant Center has verified and claimed `rozaya-boutique.com`.
2. Submit the feed URL without authentication. Use English and a stable feed
   label (for example, `ROZAYA-USD`). Do not replace an existing source without
   reviewing duplicate-item and account-linking effects.
3. Choose intended destination countries. The owner intends worldwide shipping,
   but each selected market still needs accurate shipping costs, handling and
   transit times, return settings and product eligibility. The onboarding screen
   initially selected Canada, the United Kingdom and the United States; that is
   not evidence that those settings have been validated.
4. Set up free listings. Do not start paid campaigns or add ads billing merely to
   complete free-listing setup. "All marketing methods" on a data source does
   not itself create or fund a campaign.
5. Review Google's fetch results and product diagnostics. Feed validation is not
   Google approval, and approval does not guarantee impressions or ranking.

## Verification

```sh
node --test tests/merchant-feed.test.mjs tests/seo.test.mjs tests/privacy.test.mjs tests/privacy-proxy.test.mjs
node node_modules/next/dist/bin/next build --webpack
```

With the production-mode app running, fetch `/feeds/google.xml` and validate the
body with an XML parser, including the Google namespace, unique IDs, count,
required attributes, canonical landing links and current Shopify prices/stock.
Check HTTP 200, XML content type, `Cache-Control: no-store`, no credentials or
session cookies in the response, and no unexpected exclusions. Follow a sample
of landing/image links and verify visible prices and pre-owned condition. Also
verify an unconfigured or failing upstream responds with non-200 status, not a
successful empty catalog. No order, payment or Google submission is needed for
these checks.

Opt-in browser checks use externally installed Playwright, like the existing
SEO/privacy suites. Set `MERCHANT_PLAYWRIGHT_MODULE` to its `index.mjs`,
`MERCHANT_BROWSER_EXECUTABLE` to your browser executable and
`MERCHANT_TEST_BASE_URL` to the running app (default `http://localhost:3015`).
Optionally set `MERCHANT_EXPECTED_ITEMS` to the independently observed current
catalog count. `MERCHANT_EXPECTED_ZERO_WEIGHTS` and
`MERCHANT_EXPECTED_SHIPPING_WEIGHT` can check an explicitly expected provisional
snapshot (initially `323` and `3.000 oz`). Run
`node --test tests/merchant-feed-browser.test.mjs`. The tests
parse the actual XML, check all items and follow first/middle/last landing and
image links without adding to cart or submitting anything to Google.

## References

- [Google product data specification](https://support.google.com/merchants/answer/7052112)
- [Condition](https://support.google.com/merchants/answer/6324469)
- [Unique product identifiers](https://support.google.com/merchants/answer/160161)
- [Identifier exists](https://support.google.com/merchants/answer/6324478)
- [Shipping weight](https://support.google.com/merchants/answer/6324503)
