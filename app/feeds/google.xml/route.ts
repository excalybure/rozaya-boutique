import { HIDDEN_PRODUCT_TAG } from "lib/constants";
import { getMerchantProducts } from "lib/merchant/catalog";
import { buildMerchantFeed } from "lib/merchant/feed";
import { CANONICAL_ORIGIN } from "lib/seo";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(): Promise<Response> {
  try {
    const products = await getMerchantProducts({
      shopDomain: process.env.SHOPIFY_STORE_DOMAIN ?? "",
      storefrontAccessToken: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? "",
    });
    const feed = buildMerchantFeed(products, {
      origin: CANONICAL_ORIGIN,
      hiddenProductTag: HIDDEN_PRODUCT_TAG,
    });
    if (feed.excluded.length) {
      console.warn("Merchant Center feed exclusions:", feed.excluded);
    }
    if (feed.zeroWeightItemCount) {
      console.warn(
        "Merchant Center items with zero stored product weight; shipping weights are provisional packaging-only totals:",
        feed.zeroWeightItemCount,
      );
    }
    return new Response(feed.xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        "X-Merchant-Feed-Items": String(feed.itemCount),
        "X-Merchant-Feed-Excluded": String(feed.excluded.length),
        "X-Merchant-Feed-Zero-Weights": String(feed.zeroWeightItemCount),
      },
    });
  } catch {
    // Do not return a success-shaped empty feed, or expose upstream details.
    console.error("Merchant Center feed generation failed.");
    return new Response(
      "Product feed temporarily unavailable. Please retry later.\n",
      {
        status: 503,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
