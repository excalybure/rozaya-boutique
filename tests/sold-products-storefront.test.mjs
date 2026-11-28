// Read-only check against a storefront with a known sold item on the listing.
import assert from "node:assert/strict";
import { test } from "node:test";
import { pathToFileURL } from "node:url";

const {
  SOLD_TEST_BASE_URL: baseUrl,
  SOLD_TEST_PRODUCT_PATH: productPath,
  SOLD_TEST_LISTING_PATH: listingPath = "/search",
  SOLD_TEST_PLAYWRIGHT_MODULE: playwrightModule,
  SOLD_TEST_BROWSER_EXECUTABLE: executablePath,
} = process.env;

test(
  "a sold product stays browsable but has no usable add button",
  { skip: !baseUrl || !productPath || !playwrightModule, timeout: 90_000 },
  async (t) => {
    const { chromium } = await import(pathToFileURL(playwrightModule).href);
    const browser = await chromium.launch({ executablePath });
    t.after(() => browser.close());
    const page = await browser.newPage();

    assert.equal(
      (await page.goto(new URL(listingPath, baseUrl).href)).status(),
      200,
    );
    const card = page.locator(`a[href="${productPath}"]`).first();
    await card.getByText("Sold", { exact: true }).waitFor();

    await card.click();
    await page.waitForURL(new URL(productPath, baseUrl).href);
    await page.getByRole("heading", { level: 1 }).waitFor();
    const soldButton = page.getByRole("button", { name: "Sold", exact: true });
    await soldButton.waitFor();
    assert.equal(await soldButton.isDisabled(), true);
    assert.equal(
      await page.getByRole("button", { name: "Add to cart" }).count(),
      0,
    );
  },
);
