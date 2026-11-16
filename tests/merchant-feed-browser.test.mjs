// Opt-in, read-only verification of a running app. Playwright is external.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { pathToFileURL } from "node:url";
import { CANONICAL_ORIGIN } from "../lib/seo.ts";

const modulePath = process.env.MERCHANT_PLAYWRIGHT_MODULE;
const baseUrl = process.env.MERCHANT_TEST_BASE_URL ?? "http://localhost:3015";
let browser;

before(async () => {
  if (!modulePath) {
    return;
  }
  const { chromium } = await import(pathToFileURL(modulePath).href);
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.MERCHANT_BROWSER_EXECUTABLE || undefined,
  });
});
after(async () => {
  await browser?.close();
});

async function readFeed(context) {
  const response = await context.request.get(
    new URL("/feeds/google.xml", baseUrl).href,
    {
      maxRedirects: 0,
      headers: { "user-agent": "Googlebot" },
    },
  );
  assert.equal(response.status(), 200);
  const headers = response.headers();
  assert.match(headers["content-type"], /^application\/xml\b/);
  assert.equal(headers["cache-control"], "no-store");
  assert.equal(headers["set-cookie"], undefined);
  const page = await context.newPage();
  const items = await page.evaluate(
    (xml) => {
      const doc = new DOMParser().parseFromString(xml, "application/xml");
      if (doc.querySelector("parsererror")) {
        throw new Error(doc.querySelector("parsererror").textContent);
      }
      if (doc.documentElement.localName !== "rss") {
        throw new Error("Expected RSS document.");
      }
      return [...doc.querySelectorAll("item")].map((item) => {
        const values = {};
        for (const child of item.children) {
          if (child.namespaceURI !== "http://base.google.com/ns/1.0") {
            throw new Error("Invalid Merchant Center attribute namespace.");
          }
          if (Object.hasOwn(values, child.localName)) {
            throw new Error("Duplicate item attribute.");
          }
          values[child.localName] = child.textContent;
        }
        return values;
      });
    },
    await response.text(),
  );
  await page.close();
  assert.equal(items.length, Number(headers["x-merchant-feed-items"]));
  assert.equal(Number(headers["x-merchant-feed-excluded"]), 0);
  const zeroWeights = Number(headers["x-merchant-feed-zero-weights"]);
  assert.ok(
    Number.isInteger(zeroWeights) &&
      zeroWeights >= 0 &&
      zeroWeights <= items.length,
  );
  if (process.env.MERCHANT_EXPECTED_ZERO_WEIGHTS) {
    assert.equal(
      zeroWeights,
      Number(process.env.MERCHANT_EXPECTED_ZERO_WEIGHTS),
    );
  }
  if (process.env.MERCHANT_EXPECTED_ITEMS) {
    assert.equal(items.length, Number(process.env.MERCHANT_EXPECTED_ITEMS));
  }
  assert.ok(items.length > 0);
  return items;
}

test(
  "live feed is valid XML with unique IDs, required attributes and canonical product links",
  { skip: !modulePath },
  async (t) => {
    const context = await browser.newContext();
    t.after(() => context.close());
    const items = await readFeed(context);
    assert.equal(new Set(items.map((item) => item.id)).size, items.length);
    for (const item of items) {
      assert.match(item.id, /^shopify_\d+$/);
      assert.ok(item.title.trim());
      assert.ok(Array.from(item.title).length <= 150);
      assert.ok(item.description.trim());
      assert.ok(Array.from(item.description).length <= 5000);
      const link = new URL(item.link);
      assert.equal(link.origin, CANONICAL_ORIGIN);
      assert.match(link.pathname, /^\/product\/[^/]+$/);
      assert.equal(link.search, "");
      assert.equal(link.hash, "");
      assert.match(item.image_link, /^https?:\/\//);
      assert.match(item.price, /^\d+\.\d{2} USD$/);
      assert.ok(Number.parseFloat(item.price) > 0);
      assert.match(item.shipping_weight, /^\d+\.\d{3} oz$/);
      assert.ok(Number.parseFloat(item.shipping_weight) >= 3);
      assert.ok(Number.parseFloat(item.shipping_weight) <= 32000);
      if (process.env.MERCHANT_EXPECTED_SHIPPING_WEIGHT) {
        assert.equal(
          item.shipping_weight,
          process.env.MERCHANT_EXPECTED_SHIPPING_WEIGHT,
        );
      }
      assert.ok(["in_stock", "out_of_stock"].includes(item.availability));
      assert.ok(["new", "used", "refurbished"].includes(item.condition));
      assert.deepEqual(
        Object.keys(item).sort(),
        [
          "availability",
          "condition",
          "description",
          "id",
          "image_link",
          "link",
          "price",
          "shipping_weight",
          "title",
          ...(item.product_type ? ["product_type"] : []),
        ].sort(),
      );
    }
  },
);

test(
  "sample landing pages agree with feed prices, titles, condition and canonical URL; images load",
  { skip: !modulePath },
  async (t) => {
    const context = await browser.newContext({ locale: "en-US" });
    t.after(() => context.close());
    const items = await readFeed(context);
    const indices = [
      ...new Set([0, Math.floor(items.length / 2), items.length - 1]),
    ];
    const labels = {
      new: "New",
      used: "Pre-owned",
      refurbished: "Refurbished",
    };
    const schema = {
      new: "NewCondition",
      used: "UsedCondition",
      refurbished: "RefurbishedCondition",
    };
    for (const index of indices) {
      const item = items[index];
      const page = await context.newPage();
      const response = await page.goto(
        new URL(new URL(item.link).pathname, baseUrl).href,
      );
      assert.equal(response.status(), 200, item.link);
      await page
        .getByText(`Condition: ${labels[item.condition]}`, { exact: true })
        .waitFor();
      const visibleTitle = (await page.locator("h1").innerText())
        .replace(/\s+/g, " ")
        .trim();
      assert.equal(Array.from(visibleTitle).slice(0, 150).join(""), item.title);
      const price = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(Number.parseFloat(item.price));
      assert.ok(
        await page.getByText(price, { exact: true }).count(),
        item.link,
      );
      const jsonLd = JSON.parse(
        await page
          .locator('script[type="application/ld+json"]')
          .first()
          .textContent(),
      );
      assert.equal(
        jsonLd.offers.itemCondition,
        `https://schema.org/${schema[item.condition]}`,
      );
      assert.equal(
        Number(jsonLd.offers.lowPrice),
        Number.parseFloat(item.price),
      );
      assert.equal(
        Number(jsonLd.offers.highPrice),
        Number.parseFloat(item.price),
      );
      await page
        .locator('head link[rel="canonical"]')
        .waitFor({ state: "attached" });
      assert.equal(
        await page.locator('head link[rel="canonical"]').getAttribute("href"),
        item.link,
      );
      const image = await context.request.head(item.image_link);
      assert.equal(image.status(), 200);
      assert.match(image.headers()["content-type"], /^image\//);
      await page.close();
    }
  },
);
