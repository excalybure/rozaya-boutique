export type PrivacyConfig = {
  checkoutRootDomain: string;
  storefrontAccessToken: string;
};

type HeadlessConfig = PrivacyConfig & {
  storefrontRootDomain: string;
  headlessStorefront: true;
};

export type CustomerPrivacy = {
  analyticsProcessingAllowed: () => boolean;
  marketingAllowed: () => boolean;
  preferencesProcessingAllowed: () => boolean;
  saleOfDataAllowed: () => boolean;
  saleOfDataRegion: () => boolean;
  getRegion: () => string;
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
  Shopify?: { customerPrivacy?: CustomerPrivacy };
  privacyBanner?: PrivacyBanner;
};

const SCRIPT_URL =
  "https://cdn.shopify.com/shopifycloud/privacy-banner/storefront-banner.js";
const LOAD_TIMEOUT = 15000;
let loading: Promise<CustomerPrivacy> | undefined;

export function isPublicStorefrontToken(token: string): boolean {
  // Only Shopify's public Storefront token format may enter the browser bundle.
  return /^[a-f0-9]{32}$/i.test(token);
}

function headlessConfig(config: PrivacyConfig): HeadlessConfig {
  return {
    ...config,
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
    const timeout = window.setTimeout(() => {
      reject(new Error("Shopify privacy settings did not finish loading."));
    }, LOAD_TIMEOUT);

    script.src = SCRIPT_URL;
    script.async = true;
    script.id = "shopify-customer-privacy";
    script.onerror = () => {
      window.clearTimeout(timeout);
      reject(new Error("Shopify privacy settings could not be loaded."));
    };
    script.onload = async () => {
      try {
        if (!host.privacyBanner || !host.Shopify?.customerPrivacy) {
          throw new Error("Shopify privacy controls are unavailable.");
        }
        // Shopify decides where to show its banner and honors regional GPC settings.
        // Do not record synthetic consent or read/write Shopify consent cookies.
        await host.privacyBanner.loadBanner(headlessConfig(config));
        window.clearTimeout(timeout);
        resolve(host.Shopify.customerPrivacy);
      } catch (error) {
        window.clearTimeout(timeout);
        reject(error);
      }
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
