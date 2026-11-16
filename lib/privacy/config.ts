import "server-only";
import {
  isPublicStorefrontToken,
  type PrivacyConfig,
} from "./customer-privacy";
import type { PrivacyProxyConfig } from "./proxy";

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

export function getPrivacyProxyConfig(): PrivacyProxyConfig | null {
  const publicConfig = getPrivacyConfig();
  const privateStorefrontToken =
    process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN ?? "";
  const invalidPrivateToken =
    !privateStorefrontToken ||
    /\s/.test(privateStorefrontToken) ||
    privateStorefrontToken === publicConfig?.storefrontAccessToken;
  if (!publicConfig || invalidPrivateToken) {
    return null;
  }

  // Server-only configuration: never pass this object to PrivacyProvider or JSX.
  return {
    checkoutRootDomain: publicConfig.checkoutRootDomain,
    privateStorefrontToken,
  };
}
