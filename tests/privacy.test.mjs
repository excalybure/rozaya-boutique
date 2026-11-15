import assert from "node:assert/strict";
import { test } from "node:test";
import {
  isPolicyHandle,
  isReviewDraft,
  localizePrivacyLinks,
} from "../lib/policies.ts";

const config = {
  checkoutRootDomain: "example.myshopify.com",
  storefrontAccessToken: "0123456789abcdef0123456789abcdef",
};
let moduleId = 0;

async function setup(t) {
  const scripts = [];
  const bannerCalls = [];
  const consentCalls = [];
  const timers = new Map();
  let timerId = 0;
  let allowed = true;
  const api = {
    saleOfDataAllowed: () => allowed,
    setTrackingConsent: (consent, callback) => {
      consentCalls.push({ consent, callback });
    },
  };
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  globalThis.window = {
    location: { hostname: "shop.example.com" },
    Shopify: { customerPrivacy: api },
    privacyBanner: {
      loadBanner: async (options) => bannerCalls.push(["load", options]),
      showPreferences: async (options) =>
        bannerCalls.push(["preferences", options]),
    },
    setTimeout: (callback) => {
      const id = ++timerId;
      timers.set(id, callback);
      return id;
    },
    clearTimeout: (id) => timers.delete(id),
  };
  globalThis.document = {
    createElement: () => ({}),
    head: { appendChild: (script) => scripts.push(script) },
  };
  t.after(() => {
    globalThis.window = previousWindow;
    globalThis.document = previousDocument;
  });
  // Isolate each SDK singleton without adding a runtime-only test reset hook.
  const sdk = await import(
    `../lib/privacy/customer-privacy.ts?test=${++moduleId}`
  );
  async function ready() {
    const promise = sdk.loadCustomerPrivacy(config);
    await scripts[0].onload();
    return promise;
  }
  return {
    sdk,
    scripts,
    bannerCalls,
    consentCalls,
    api,
    timers,
    ready,
    setAllowed: (value) => {
      allowed = value;
    },
  };
}

test("policy routing rejects inherited and unknown names", () => {
  for (const handle of [
    "privacy-policy",
    "refund-policy",
    "shipping-policy",
    "terms-of-service",
    "contact-information",
  ]) {
    assert.equal(isPolicyHandle(handle), true);
  }
  for (const handle of [
    "constructor",
    "__proto__",
    "unknown",
    "../privacy-policy",
  ]) {
    assert.equal(isPolicyHandle(handle), false);
  }
});

test("unfinished legal drafts are withheld, not ordinary final policy HTML", () => {
  for (const html of [
    "Effective {{EFFECTIVE_DATE}}",
    '<a href="https://markdownlivepreview.com/%7B%7BPRIVACY_POLICY_URL%7D%7D">Privacy</a>',
    "%7b%7bLEGAL_OPERATOR_NAME%7d%7d",
  ]) {
    assert.equal(isReviewDraft(html), true);
  }
  assert.equal(
    isReviewDraft(
      '<p>Contact us.</p><a href="/privacy-choices">Privacy choices</a>',
    ),
    false,
  );
});

test("saved opt-out links use local controls without rewriting provider or unrelated links", () => {
  const body =
    '<a href="https://example.myshopify.com/pages/data-sharing-opt-out">here</a> <a href="/pages/data-sharing-opt-out">choices</a> <a href="https://privacy.shopify.com/en">Shopify</a> <a href="https://another.myshopify.com/pages/data-sharing-opt-out">other store</a>';
  const localized = localizePrivacyLinks(
    body,
    "https://example.myshopify.com/",
  );
  assert.equal(
    localized,
    '<a href="/privacy-choices#data-sharing">here</a> <a href="/privacy-choices#data-sharing">choices</a> <a href="https://privacy.shopify.com/en">Shopify</a> <a href="https://another.myshopify.com/pages/data-sharing-opt-out">other store</a>',
  );
});

test("private/malformed credentials never load the browser SDK", async (t) => {
  const { sdk, scripts } = await setup(t);
  for (const token of [
    "",
    "shpat_private",
    "shpss_private",
    "not-a-public-token",
  ]) {
    await assert.rejects(
      sdk.loadCustomerPrivacy({ ...config, storefrontAccessToken: token }),
      /Public Storefront token/,
    );
  }
  assert.equal(scripts.length, 0);
});

test("one headless regional initialization, with no manufactured consent", async (t) => {
  const { sdk, scripts, bannerCalls, consentCalls, ready, api } =
    await setup(t);
  const first = sdk.loadCustomerPrivacy(config);
  const second = sdk.loadCustomerPrivacy(config);
  assert.equal(first, second);
  assert.equal(scripts.length, 1);
  assert.equal(await ready(), api);
  assert.deepEqual(bannerCalls, [
    [
      "load",
      {
        ...config,
        storefrontRootDomain: "shop.example.com",
        headlessStorefront: true,
      },
    ],
  ]);
  assert.deepEqual(consentCalls, []);
  await sdk.showPrivacyPreferences(config);
  assert.equal(bannerCalls[1][0], "preferences");
  assert.deepEqual(bannerCalls[1][1], bannerCalls[0][1]);
});

test("blocked script, missing SDK, and loading timeout reject rather than succeeding", async (t) => {
  for (const mode of ["blocked", "missing", "timeout"]) {
    await t.test(mode, async (t) => {
      const { sdk, scripts, timers } = await setup(t);
      const promise = sdk.loadCustomerPrivacy(config);
      const rejected = assert.rejects(promise);
      if (mode === "blocked") {
        scripts[0].onerror();
      }
      if (mode === "missing") {
        delete window.privacyBanner;
        await scripts[0].onload();
      }
      if (mode === "timeout") {
        [...timers.values()][0]();
      }
      await rejected;
    });
  }
});

test("explicit sale/sharing opt-out preserves separate cookie choices", async (t) => {
  const { sdk, consentCalls, ready, setAllowed } = await setup(t);
  await ready();
  const result = sdk.optOutOfDataSharing(config);
  await Promise.resolve();
  assert.equal(consentCalls.length, 1);
  assert.deepEqual(consentCalls[0].consent, {
    ...config,
    storefrontRootDomain: "shop.example.com",
    headlessStorefront: true,
    sale_of_data: false,
  });
  setAllowed(false);
  consentCalls[0].callback();
  await result;
});

test("opt-out errors, an unconfirmed allowed state, and timeout never report success", async (t) => {
  for (const mode of ["api-error", "still-allowed", "timeout"]) {
    await t.test(mode, async (t) => {
      const { sdk, consentCalls, ready, timers } = await setup(t);
      await ready();
      const promise = sdk.optOutOfDataSharing(config);
      const rejected = assert.rejects(promise, /could not be confirmed/);
      await Promise.resolve();
      if (mode === "timeout") {
        [...timers.values()][0]();
      } else {
        consentCalls[0].callback(
          mode === "api-error" ? { error: "Unable to save" } : undefined,
        );
      }
      await rejected;
    });
  }
});
