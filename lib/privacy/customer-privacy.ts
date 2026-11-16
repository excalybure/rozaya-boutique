export type PrivacyConfig = {
  checkoutRootDomain: string;
  storefrontAccessToken: string;
};

type HeadlessConfig = PrivacyConfig & {
  storefrontRootDomain: string;
  headlessStorefront: true;
};

type SessionConfig = {
  isHeadless: true;
  asyncConsent: true;
  asyncVisitorState: true;
  consentDomain: string;
  storefrontAccessToken: string;
};

export type CustomerPrivacy = {
  analyticsProcessingAllowed: () => boolean;
  marketingAllowed: () => boolean;
  preferencesProcessingAllowed: () => boolean;
  saleOfDataAllowed: () => boolean;
  saleOfDataRegion: () => boolean;
  getRegion: () => string;
  currentVisitorConsent: () => {
    marketing: "yes" | "no" | "";
    analytics: "yes" | "no" | "";
    preferences: "yes" | "no" | "";
    sale_of_data: "yes" | "no" | "";
  };
  setTrackingConsent: (
    consent: HeadlessConfig & { sale_of_data: false },
    callback: (result?: { error?: string }) => void,
  ) => void;
};

type PrivacyBanner = {
  loadBanner: (config: HeadlessConfig) => Promise<void> | void;
  showPreferences: (config: HeadlessConfig) => Promise<void> | void;
};

type PrivacyWindow = Window & {
  Shopify?: {
    customerPrivacy?: (CustomerPrivacy | { setTrackingConsent?: never }) & {
      config?: SessionConfig;
      consentStatus?: string;
    };
  };
  privacyBanner?: PrivacyBanner;
};

const SCRIPT_URL =
  "https://cdn.shopify.com/shopifycloud/privacy-banner/storefront-banner.js";
const LOAD_TIMEOUT = 15000;
const READY_EVENT = "consentTrackingApiLoaded";
let loading: Promise<CustomerPrivacy> | undefined;

export function isPublicStorefrontToken(token: string): boolean {
  // Only Shopify's public Storefront token format may enter the browser bundle.
  return /^[a-f0-9]{32}$/i.test(token);
}

function headlessConfig(config: PrivacyConfig): HeadlessConfig {
  return {
    ...config,
    checkoutRootDomain: window.location.host,
    storefrontRootDomain: window.location.hostname,
    headlessStorefront: true,
  };
}

export function loadCustomerPrivacy(
  config: PrivacyConfig,
): Promise<CustomerPrivacy> {
  if (!isPublicStorefrontToken(config.storefrontAccessToken)) {
    return Promise.reject(
      new Error("Public Storefront token is not configured."),
    );
  }
  if (loading) {
    return loading;
  }

  loading = new Promise<CustomerPrivacy>((resolve, reject) => {
    const host = window as PrivacyWindow;
    const script = document.createElement("script");
    let scriptLoaded = false;
    let initializing = false;
    const cleanup = () => {
      window.clearTimeout(timeout);
      document.removeEventListener(READY_EVENT, initialize);
    };
    const fail = (error: unknown) => {
      initializing = true;
      cleanup();
      reject(error);
    };
    const initialize = async () => {
      const privacy = host.Shopify?.customerPrivacy;
      if (
        !scriptLoaded ||
        initializing ||
        privacy?.consentStatus !== "loaded"
      ) {
        return;
      }
      initializing = true;
      try {
        if (!host.privacyBanner || !privacy.setTrackingConsent) {
          throw new Error("Shopify privacy controls are unavailable.");
        }
        // Wait for Shopify's session before deciding regional banner/GPC behavior.
        await host.privacyBanner.loadBanner(headlessConfig(config));
        cleanup();
        resolve(privacy);
      } catch (error) {
        fail(error);
      }
    };
    const timeout = window.setTimeout(() => {
      fail(new Error("Shopify privacy settings did not finish loading."));
    }, LOAD_TIMEOUT);

    // Match Shopify's session-backed headless bootstrap. The same-origin proxy
    // lets Shopify retain omitted purposes, including native banner updates.
    // Cookies stay opaque; initialization records no visitor consent decision.
    host.Shopify ??= {};
    host.Shopify.customerPrivacy ??= {};
    host.Shopify.customerPrivacy.config = {
      isHeadless: true,
      asyncConsent: true,
      asyncVisitorState: true,
      consentDomain: window.location.host,
      storefrontAccessToken: config.storefrontAccessToken,
    };
    document.addEventListener(READY_EVENT, initialize);
    script.src = SCRIPT_URL;
    script.async = true;
    script.id = "shopify-customer-privacy";
    script.onerror = () => {
      fail(new Error("Shopify privacy settings could not be loaded."));
    };
    script.onload = () => {
      scriptLoaded = true;
      if (
        !host.privacyBanner ||
        !host.Shopify?.customerPrivacy?.setTrackingConsent
      ) {
        fail(new Error("Shopify privacy controls are unavailable."));
        return;
      }
      return initialize();
    };
    document.head.appendChild(script);
  });
  return loading;
}

export async function showPrivacyPreferences(config: PrivacyConfig) {
  await loadCustomerPrivacy(config);
  const banner = (window as PrivacyWindow).privacyBanner;
  if (!banner) {
    throw new Error("Shopify privacy controls are unavailable.");
  }
  await banner.showPreferences(headlessConfig(config));
}

export async function optOutOfDataSharing(config: PrivacyConfig) {
  const privacy = await loadCustomerPrivacy(config);
  await new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      reject(
        new Error("Your choice could not be confirmed. Please try again."),
      );
    }, LOAD_TIMEOUT);
    // Only a visitor's explicit opt-out invokes this. Cookie choices stay unchanged.
    privacy.setTrackingConsent(
      { ...headlessConfig(config), sale_of_data: false },
      (result) => {
        window.clearTimeout(timeout);
        if (result?.error || privacy.saleOfDataAllowed()) {
          reject(
            new Error("Your choice could not be confirmed. Please try again."),
          );
        } else {
          resolve();
        }
      },
    );
  });
}
