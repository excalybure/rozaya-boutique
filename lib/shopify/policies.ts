import { cache } from "react";
import { isShopifyConfigured, shopifyFetch } from "lib/shopify";
import { policyPages, type PolicyHandle } from "lib/policies";

type ShopPolicy = { title: string; body: string; url: string };
type PolicyOperation = {
  data: {
    shop: Record<
      (typeof policyPages)[PolicyHandle]["field"],
      ShopPolicy | null
    >;
  };
};

// Request-level deduplication only: legal edits must not wait for catalog cache expiry.
export const getPolicies = cache(async () => {
  if (!isShopifyConfigured) {
    return null;
  }

  const result = await shopifyFetch<PolicyOperation>({
    // contactInformation is absent from the catalog's legacy API schema.
    apiVersion: "2026-10",
    query: `query getPolicies {
      shop {
        privacyPolicy { title body url }
        refundPolicy { title body url }
        shippingPolicy { title body url }
        termsOfService { title body url }
        contactInformation { title body url }
      }
    }`,
  });
  return result.body.data.shop;
});
