import type { MerchantProduct } from "./feed";

export type MerchantShopifyConfig = {
  shopDomain: string;
  storefrontAccessToken: string;
};

type CatalogPage = {
  nodes: MerchantProduct[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
};

const MERCHANT_PRODUCTS_QUERY = /* GraphQL */ `
  query MerchantProducts($after: String) @inContext(country: US, language: EN) {
    products(first: 100, after: $after, sortKey: ID) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        handle
        title
        description
        productType
        tags
        featuredImage {
          url
        }
        variants(first: 2) {
          pageInfo {
            hasNextPage
          }
          nodes {
            id
            availableForSale
            price {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

export async function getMerchantProducts(
  config: MerchantShopifyConfig,
  fetcher: typeof fetch = fetch,
): Promise<MerchantProduct[]> {
  const shopDomain = config.shopDomain
    .replace(/^https:\/\//, "")
    .replace(/\/$/, "");
  const validDomain = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(shopDomain);
  const validToken = /^[a-f0-9]{32}$/i.test(config.storefrontAccessToken);
  if (!validDomain || !validToken) {
    throw new Error(
      "Merchant Center Storefront configuration is missing or invalid.",
    );
  }
  const endpoint = `https://${shopDomain}/api/2026-10/graphql.json`;
  const products: MerchantProduct[] = [];
  const cursors = new Set<string>();
  const signal = AbortSignal.timeout(45000);
  let after: string | null = null;
  while (true) {
    const response = await fetcher(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": config.storefrontAccessToken,
      },
      body: JSON.stringify({
        query: MERCHANT_PRODUCTS_QUERY,
        variables: { after },
      }),
      cache: "no-store",
      redirect: "error",
      signal,
    });
    if (!response.ok) {
      throw new Error(
        `Merchant Center catalog request failed (${response.status}).`,
      );
    }
    const body: { data?: { products?: CatalogPage }; errors?: unknown[] } =
      await response.json();
    const page = body.data?.products;
    if (body.errors?.length || !page) {
      throw new Error(
        "Merchant Center catalog returned an incomplete GraphQL response.",
      );
    }
    products.push(...page.nodes);
    if (!page.pageInfo.hasNextPage) {
      return products;
    }
    const nextCursor = page.pageInfo.endCursor;
    if (!nextCursor || cursors.has(nextCursor) || !page.nodes.length) {
      throw new Error("Merchant Center catalog pagination did not advance.");
    }
    cursors.add(nextCursor);
    after = nextCursor;
  }
}
