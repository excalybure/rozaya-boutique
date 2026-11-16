# Rozaya Boutique

A jewelry storefront for fine, vintage and collectible pieces. The site is built
with Next.js App Router and uses Shopify as its product catalog, cart and
checkout provider.

## Run locally

Use Node.js and pnpm, then install the dependencies:

```sh
pnpm install
```

Copy `.env.example` to `.env.local` and add the Shopify Storefront API
credentials. The branded homepage and empty catalog states render without those
credentials; product listings, product details, cart and checkout need a
configured Shopify store.

```sh
pnpm dev
```

Leave that terminal running and open `http://localhost:3000` in your browser.
Stop the server with `Ctrl+C`.

If dependencies are already installed but `pnpm dev` fails with
`ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY`, start the same development script
without pnpm's dependency checks:

```sh
npm run dev -- --hostname 127.0.0.1
```

This uses the existing dependencies; it does not require `npm install` or a new
lockfile. If port 3000 is occupied, Next.js may choose another port; use the
**Local** URL printed in the terminal.

### Check the current storefront

With the server running and Shopify configured:

1. Open `/` and check the homepage images, category links and mobile navigation.
2. Open `/search`, search for a product, and try sorting the results.
3. Open a category such as `/search/rings`, then open a product detail page.
4. For an available product, select any required options, add it to the cart,
   and check quantity changes and removal.

Local development uses the Shopify store configured in `.env.local`, not a
separate test catalog. Do not complete checkout with real payment details when
testing; confirm Shopify's payment test mode before testing an order. Rendering
the storefront alone does not verify payment, shipping or tax configuration.

## Shopify setup

Add these values to `.env.local` and to the deployment environment:

- `SHOPIFY_STORE_DOMAIN`: the shop's `*.myshopify.com` domain
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN`: a Storefront API access token
- `SHOPIFY_REVALIDATION_SECRET`: a secret used by the revalidation endpoint
- `SITE_NAME` and `COMPANY_NAME`: both default to Rozaya Boutique

The homepage shows "Pieces to keep close" automatically when the Shopify
collection `hidden-homepage-featured-items` contains at least four products
with images that are visible to the Headless sales channel. Add or remove
products in Shopify Admin under Products > Collections; the section refreshes
after the storefront cache updates. Category navigation expects collections with
the handles `rings`, `necklaces`, `bracelets`, `earrings`, `art-deco`,
`victorian`, `diamond` and `under-500`.

## Custom domains

See [Custom domain setup](docs/custom-domains.md) for the recorded Vercel DNS
values, Squarespace configuration steps, and verification instructions for
`rozaya-boutique.com` and `rozayaboutique.com`.

## Legal review drafts

The [revised Terms of Service](docs/legal/drafts/terms-of-service.md) and
[counsel handoff](docs/legal/terms-review-notes.md) are review documents, not
published policies or legal approval. Resolve their publication gates and
business-detail tokens before using the text in Shopify or the storefront.

The [privacy policy draft](docs/legal/drafts/privacy-policy.md) and
[privacy implementation/review notes](docs/legal/privacy-review-notes.md) cover
the custom storefront, Shopify Enhanced Services, privacy controls, and remaining
verification/publication gates. They are not published by the app.

See the [legal document workflow](docs/legal/README.md) for the shared token
mapping and PowerShell generator. It fills today's effective date and produces
Markdown, Shopify-ready HTML, and browser previews locally; it never publishes.

### Storefront policy and privacy controls

The footer links to Shopify's saved policies at `/policies/privacy-policy`,
`/policies/refund-policy`, `/policies/shipping-policy`,
`/policies/terms-of-service`, and `/policies/contact-information`. These use
Shopify policy objects, not Online Store Pages. Empty policies and detected
unfinished drafts show an unavailable notice instead of invented legal text.
This does not remove incomplete policies from Shopify checkout: correct them
in Admin only after an approved publication decision.

`/privacy-choices` reopens Shopify's cookie preferences and provides a separate
browser sale/sharing opt-out. The Shopify-hosted banner uses the shop's regional
settings and handles applicable GPC signals. Existing `SHOPIFY_STORE_DOMAIN`
and the **public** `SHOPIFY_STOREFRONT_ACCESS_TOKEN` configure it. The public
token is intentionally sent to the browser; Admin and private Storefront tokens
are rejected. Do not replace this with private credentials. No advertising
pixels or analytics events are added.

The SDK uses Shopify's session-backed headless configuration and the same-origin
`POST /api/unstable/graphql.json` transport. The proxy targets only the configured
shop with a separate **server-only** `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` credential.
Save that variable as a Vercel Secret, initially scoped to the testing Preview
environment only. Never use a `NEXT_PUBLIC_` name or replace the browser's public
token with it. The private credential is sent only in Shopify's private-token
header; Vercel's trusted visitor IP is sent in `Shopify-Storefront-Buyer-IP`.
There is no public-token fallback. Missing credentials, invalid/missing visitor
IP, or a non-Vercel runtime fail with an error instead of using the server's
region. Do not forge Vercel headers to enable local browser integration tests.

The proxy forwards opaque session cookies and GPC, and returns Shopify's separate
`Set-Cookie` and `Server-Timing` headers without caching.
No consent cookie values are interpreted or constructed by application code.
Do not switch the banner back to direct cross-origin requests: omitted consent
purposes can reset when Shopify does not receive the existing visitor session.
Both the native cookie panel and the separate opt-out need the same transport.

Test privacy behavior on HTTPS for every launch domain and checkout; localhost
success alone does not establish checkout continuity or account-level opt-outs.
See the review notes for the verification matrix and known limitations.

Focused regression tests use Node's built-in test runner and native TypeScript
support (Node 22.18+; verified on Node 24):

```sh
node --test tests/privacy.test.mjs tests/privacy-proxy.test.mjs
```

Real-SDK browser regressions are opt-in and use isolated browser contexts. They
contact the configured Shopify shop but do not change merchant settings, create
orders, or install trackers. Run from a configured data-sale opt-out region for
the GPC assertion. Use an approved Vercel preview with its private secret and
normal trusted visitor-IP header. Browser tests also compare its region and
default processing permissions to a direct Shopify request from the same browser.
This comparison is required: the earlier public-token proxy passed interaction
tests but geolocated the server instead of the visitor and was rolled back.

Install Playwright outside the repository and use an existing Edge installation
(or supply another browser executable). Set the preview URL and the shop's real
hostname below. The suite skips explicitly when `PRIVACY_PLAYWRIGHT_MODULE` is
not set. Preview deployment protection may require owner-assisted access; do not
disable it or commit access credentials just to run tests.

```powershell
$testTools = Join-Path $env:TEMP ('rozaya-privacy-' + [guid]::NewGuid().ToString('N'))
try {
  npm.cmd install --prefix $testTools --no-package-lock --no-audit --no-fund playwright@1.58.2
  if ($LASTEXITCODE -ne 0) { throw 'Playwright installation failed.' }
  $env:PRIVACY_PLAYWRIGHT_MODULE = Join-Path $testTools 'node_modules\playwright\index.mjs'
  $env:PRIVACY_BROWSER_EXECUTABLE = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
  $env:PRIVACY_TEST_BASE_URL = 'https://YOUR-APPROVED-PREVIEW.vercel.app'
  $env:PRIVACY_TEST_SHOP_DOMAIN = 'YOUR-SHOP.myshopify.com'
  node --test tests/privacy-browser.test.mjs
  if ($LASTEXITCODE -ne 0) { throw 'Privacy browser tests failed.' }
} finally {
  Remove-Item Env:PRIVACY_PLAYWRIGHT_MODULE, Env:PRIVACY_BROWSER_EXECUTABLE, Env:PRIVACY_TEST_BASE_URL, Env:PRIVACY_TEST_SHOP_DOMAIN -ErrorAction SilentlyContinue
  if (Test-Path -LiteralPath $testTools) { Remove-Item -LiteralPath $testTools -Recurse -Force }
}
```

Do not promote this branch or copy its secret to Production until the preview
passes both geolocation and interaction tests. Preview success is not checkout,
all-region, or account-level verification.

## Image credits

The following editorial photos in `public/images` are from Unsplash and are used
under the Unsplash License:

- Hero necklace: [Patrick Nguyen](https://unsplash.com/photos/woman-wearing-a-gold-necklace-with-interlocking-rings-eQsh5E5ZTzc)
- Vintage jewelry box: [Aliona Zahrai](https://unsplash.com/photos/collection-of-gold-and-pearl-vintage-earrings-in-jewelry-box-lgiku9zKFP8)
- Bracelet: [Mahbod Akhzami](https://unsplash.com/photos/a-womans-hand-with-a-bracelet-on-it-_UzP7G2f-_I)
- Pearl earrings: [Stephan Koning](https://unsplash.com/photos/a-pair-of-black-and-gold-earrings-with-a-pearl-0twGcvn-i0E)
- Gold necklace: [Process AG](https://unsplash.com/photos/gold-colored-necklace-OEuo7nx97fM)
- Ring: [MR O.K](https://unsplash.com/photos/person-showing-gold-colored-ring--ePHy6jg_7c)

The Diamond and Under $500 category images were generated for this project with
OpenAI ImageGen.
