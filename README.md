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

The development site opens at `http://localhost:3000`.

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
