// Opt-in integration tests: run against a local app with its real Shopify config.
// Playwright is supplied externally; see README.md. No merchant settings change.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { pathToFileURL } from "node:url";

const modulePath = process.env.PRIVACY_PLAYWRIGHT_MODULE;
const baseUrl = process.env.PRIVACY_TEST_BASE_URL ?? "http://localhost:3015";
let browser;

before(async () => {
  if (!modulePath) {
    return;
  }
  const { chromium } = await import(pathToFileURL(modulePath).href);
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PRIVACY_BROWSER_EXECUTABLE || undefined,
  });
});
after(async () => {
  await browser?.close();
});

async function open(t, options) {
  const context = await browser.newContext(options);
  t.after(() => context.close());
  return context.newPage();
}

async function ready(page) {
  await page.goto(new URL("/privacy-choices", baseUrl).href);
  await page
    .getByRole("button", { name: "Manage cookie preferences" })
    .waitFor();
  await page.waitForFunction(
    () => window.Shopify?.customerPrivacy?.consentStatus === "loaded",
  );
  await page.waitForFunction(() => {
    const button = Array.from(document.querySelectorAll("button")).find(
      (button) => button.textContent === "Manage cookie preferences",
    );
    return Boolean(button && !button.disabled);
  });
}

async function consent(page) {
  return page.evaluate(() =>
    window.Shopify.customerPrivacy.currentVisitorConsent(),
  );
}

async function optOut(page) {
  await page
    .getByRole("button", { name: "Opt out of data sale/sharing" })
    .click();
  await page
    .getByText(
      "Your data sale/sharing opt-out has been recorded for this browser.",
      { exact: true },
    )
    .waitFor();
}

async function cookies(page, action) {
  await page.getByRole("button", { name: "Manage cookie preferences" }).click();
  await page.locator(`#shopify-pc__prefs__header-${action}`).click();
  await page.locator("#shopify-pc__prefs__dialog").waitFor({ state: "hidden" });
}

test(
  "proxy location and regional permissions match a direct Shopify request",
  { skip: !modulePath },
  async (t) => {
    const shopDomain = process.env.PRIVACY_TEST_SHOP_DOMAIN ?? "";
    assert.match(
      shopDomain,
      /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i,
      "Set PRIVACY_TEST_SHOP_DOMAIN to the configured shop hostname",
    );
    const proxy = await open(t);
    await ready(proxy);
    const publicToken = await proxy.evaluate(
      () => Shopify.customerPrivacy.config.storefrontAccessToken,
    );
    const reference = await open(t);
    const referenceUrl = new URL("/__privacy-region-reference", baseUrl);
    await reference.route(referenceUrl.href, (route) =>
      route.fulfill({
        contentType: "text/html",
        body: '<!doctype html><html><body><script src="https://cdn.shopify.com/shopifycloud/privacy-banner/storefront-banner.js"></script></body></html>',
      }),
    );
    await reference.goto(referenceUrl.href);
    await reference.waitForFunction(
      () => window.privacyBanner && window.Shopify?.customerPrivacy,
    );
    await reference.evaluate(
      (config) =>
        window.privacyBanner.loadBanner({
          ...config,
          storefrontRootDomain: location.hostname,
          headlessStorefront: true,
        }),
      { checkoutRootDomain: shopDomain, storefrontAccessToken: publicToken },
    );
    await reference.waitForFunction(() => Shopify.customerPrivacy.getRegion());
    const snapshot = (page) =>
      page.evaluate(() => ({
        region: Shopify.customerPrivacy.getRegion(),
        bannerRegion: Shopify.customerPrivacy.shouldShowBanner(),
        saleRegion: Shopify.customerPrivacy.saleOfDataRegion(),
        analyticsAllowed: Shopify.customerPrivacy.analyticsProcessingAllowed(),
        marketingAllowed: Shopify.customerPrivacy.marketingAllowed(),
        preferencesAllowed:
          Shopify.customerPrivacy.preferencesProcessingAllowed(),
        saleAllowed: Shopify.customerPrivacy.saleOfDataAllowed(),
      }));
    const actual = await snapshot(proxy);
    const expected = await snapshot(reference);
    t.diagnostic(
      `Proxy region ${actual.region}; direct Shopify region ${expected.region}`,
    );
    assert.notEqual(expected.region, "");
    assert.deepEqual(actual, expected);
  },
);

test(
  "real Shopify SDK keeps cookie choices and sale opt-out independent across reloads",
  { skip: !modulePath },
  async (t) => {
    const page = await open(t);
    const apiErrors = [];
    page.on("response", (response) => {
      if (
        response.url().endsWith("/api/unstable/graphql.json") &&
        !response.ok()
      ) {
        apiErrors.push(response.status());
      }
    });
    await ready(page);
    assert.deepEqual(await consent(page), {
      marketing: "",
      analytics: "",
      preferences: "",
      sale_of_data: "",
    });
    await optOut(page);
    assert.deepEqual(await consent(page), {
      marketing: "",
      analytics: "",
      preferences: "",
      sale_of_data: "no",
    });
    await ready(page);
    assert.deepEqual(await consent(page), {
      marketing: "",
      analytics: "",
      preferences: "",
      sale_of_data: "no",
    });
    await cookies(page, "accept");
    assert.deepEqual(await consent(page), {
      marketing: "yes",
      analytics: "yes",
      preferences: "yes",
      sale_of_data: "no",
    });
    await ready(page);
    assert.equal((await consent(page)).sale_of_data, "no");
    await cookies(page, "decline");
    await optOut(page);
    assert.deepEqual(await consent(page), {
      marketing: "no",
      analytics: "no",
      preferences: "no",
      sale_of_data: "no",
    });
    await ready(page);
    assert.deepEqual(await consent(page), {
      marketing: "no",
      analytics: "no",
      preferences: "no",
      sale_of_data: "no",
    });
    await page
      .getByRole("button", { name: "Manage cookie preferences" })
      .click();
    const preferences = page.locator("#shopify-pc__prefs__preferences-input");
    await preferences.focus();
    await preferences.press("Space");
    assert.equal(await preferences.isChecked(), true);
    await page.locator("#shopify-pc__prefs__header-save").click();
    await page
      .locator("#shopify-pc__prefs__dialog")
      .waitFor({ state: "hidden" });
    await optOut(page);
    await ready(page);
    assert.deepEqual(await consent(page), {
      marketing: "no",
      analytics: "no",
      preferences: "yes",
      sale_of_data: "no",
    });
    assert.deepEqual(apiErrors, []);
  },
);

test(
  "declining cookies first remains declined after the separate opt-out",
  { skip: !modulePath },
  async (t) => {
    const page = await open(t);
    await ready(page);
    await cookies(page, "decline");
    assert.equal((await consent(page)).sale_of_data, "");
    await optOut(page);
    await ready(page);
    assert.deepEqual(await consent(page), {
      marketing: "no",
      analytics: "no",
      preferences: "no",
      sale_of_data: "no",
    });
    assert.equal(
      await page.evaluate(() =>
        Shopify.customerPrivacy.analyticsProcessingAllowed(),
      ),
      false,
    );
  },
);

test(
  "configured regional GPC still denies sharing after accepting optional cookies",
  { skip: !modulePath },
  async (t) => {
    const page = await open(t, { extraHTTPHeaders: { "Sec-GPC": "1" } });
    await page.addInitScript(() =>
      Object.defineProperty(navigator, "globalPrivacyControl", {
        get: () => true,
      }),
    );
    await ready(page);
    assert.equal(
      await page.evaluate(() => Shopify.customerPrivacy.saleOfDataRegion()),
      true,
      "Run from a Shopify-configured data-sale opt-out region",
    );
    assert.equal(
      await page.evaluate(() => Shopify.customerPrivacy.saleOfDataAllowed()),
      false,
    );
    await cookies(page, "accept");
    await ready(page);
    assert.equal(
      await page.evaluate(() => Shopify.customerPrivacy.saleOfDataAllowed()),
      false,
    );
  },
);

for (const failure of ["script", "session"]) {
  test(
    `blocked ${failure} displays an error and disables privacy actions`,
    { skip: !modulePath },
    async (t) => {
      const page = await open(t);
      await page.route(
        failure === "script"
          ? "**/privacy-banner/storefront-banner.js"
          : "**/api/unstable/graphql.json",
        (route) => route.abort(),
      );
      await page.goto(new URL("/privacy-choices", baseUrl).href);
      await page
        .getByRole("alert")
        .filter({ hasText: "Privacy controls could not load" })
        .waitFor({ timeout: 25000 });
      assert.equal(
        await page
          .getByRole("button", { name: "Manage cookie preferences" })
          .isDisabled(),
        true,
      );
      assert.equal(
        await page
          .getByRole("button", { name: "Opt out of data sale/sharing" })
          .isDisabled(),
        true,
      );
    },
  );
}
