import "server-only";
import {
  isPublicStorefrontToken,
  type PrivacyConfig,
} from "./customer-privacy";

export function getPrivacyConfig(): PrivacyConfig | null {
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? "";
  const domain = process.env.SHOPIFY_STORE_DOMAIN ?? "";
  const checkoutRootDomain = domain
    .replace(/^https:\/\//, "")
    .replace(/\/$/, "");
  const validShopDomain = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(
    checkoutRootDomain,
  );
  if (!isPublicStorefrontToken(token) || !validShopDomain) {
    return null;
  }

  // This is intentionally public, just like the X-Shopify-Storefront-Access-Token
  // header. Never substitute an Admin or private Storefront API token here.
  return { checkoutRootDomain, storefrontAccessToken: token };
}
