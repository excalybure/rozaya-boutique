export const policyPages = {
  "privacy-policy": { field: "privacyPolicy", title: "Privacy Policy" },
  "refund-policy": { field: "refundPolicy", title: "Returns and Refunds" },
  "shipping-policy": { field: "shippingPolicy", title: "Shipping Policy" },
  "terms-of-service": { field: "termsOfService", title: "Terms of Service" },
  "legal-notice": { field: "legalNotice", title: "Legal Notice" },
  "contact-information": { field: "contactInformation", title: "Contact" },
} as const;

export type PolicyHandle = keyof typeof policyPages;

export function isPolicyHandle(handle: string): handle is PolicyHandle {
  return Object.hasOwn(policyPages, handle);
}

export function isReviewDraft(body: string): boolean {
  // Do not silently publish an unfinished legal draft from Shopify Admin.
  return /\{\{[A-Z_]+\}\}|%7b%7b[A-Z_]+%7d%7d|markdownlivepreview\.com/i.test(
    body,
  );
}

export function localizePrivacyLinks(body: string, shopDomain: string): string {
  const domain = shopDomain.replace(/^https:\/\//, "").replace(/\/$/, "");
  const hostedOptOut = `https://${domain}/pages/data-sharing-opt-out`;
  return body.replace(
    /\bhref\s*=\s*(["'])([^"']*)\1/gi,
    (attribute: string, quote: string, href: string) => {
      const isShopOptOut =
        href === hostedOptOut || href === "/pages/data-sharing-opt-out";
      if (!isShopOptOut) {
        return attribute;
      }
      // Keep the approved wording, but use this headless storefront's controls.
      return `href=${quote}/privacy-choices#data-sharing${quote}`;
    },
  );
}
