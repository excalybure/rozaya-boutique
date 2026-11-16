import assert from "node:assert/strict";
import { test } from "node:test";
import { HIDDEN_PRODUCT_TAG } from "../lib/constants.ts";
import { getMerchantProducts } from "../lib/merchant/catalog.ts";
import {
  buildMerchantFeed,
  getProductCondition,
} from "../lib/merchant/feed.ts";
import { CANONICAL_ORIGIN } from "../lib/seo.ts";

const options = {
  origin: CANONICAL_ORIGIN,
  hiddenProductTag: HIDDEN_PRODUCT_TAG,
};
const config = {
  shopDomain: "example.myshopify.com",
  storefrontAccessToken: "a".repeat(32),
};

function product(id = 1) {
  return {
    id: `gid://shopify/Product/${id}`,
    handle: `silver-ring-${id}`,
    title: "Vintage silver ring",
    description: "Pre-owned sterling silver ring with a blue stone.",
    productType: "Ring",
    tags: ["condition:excellent"],
    featuredImage: { url: "https://cdn.shopify.com/ring.jpg?v=1&width=1000" },
    variants: {
      nodes: [
        {
          id: `gid://shopify/ProductVariant/${id}`,
          availableForSale: true,
          weight: 0.5,
          weightUnit: "OUNCES",
          price: { amount: "42.0", currencyCode: "USD" },
        },
      ],
      pageInfo: { hasNextPage: false },
    },
  };
}

function page(nodes, hasNextPage = false, endCursor = null) {
  return {
    data: { products: { nodes, pageInfo: { hasNextPage, endCursor } } },
  };
}

test("feed uses real variant identity, canonical landing pages, USD price and explicit pre-owned condition", () => {
  const item = product();
  const result = buildMerchantFeed([item], options);
  assert.equal(result.itemCount, 1);
  assert.deepEqual(result.excluded, []);
  assert.match(result.xml, /xmlns:g="http:\/\/base.google.com\/ns\/1.0"/);
  assert.match(result.xml, /<g:id>shopify_1<\/g:id>/);
  assert.match(
    result.xml,
    /<g:link>https:\/\/rozaya-boutique.com\/product\/silver-ring-1<\/g:link>/,
  );
  assert.match(result.xml, /<g:price>42.00 USD<\/g:price>/);
  assert.match(result.xml, /<g:condition>used<\/g:condition>/);
  assert.match(result.xml, /<g:shipping_weight>3.500 oz<\/g:shipping_weight>/);
  assert.equal(result.zeroWeightItemCount, 0);
  assert.match(result.xml, /<g:availability>in_stock<\/g:availability>/);
  assert.match(result.xml, /<g:product_type>Ring<\/g:product_type>/);
  item.title = "An updated product title";
  assert.match(
    buildMerchantFeed([item], options).xml,
    /<g:id>shopify_1<\/g:id>/,
  );
  // Missing barcodes do not prove that no identifier was ever assigned.
  assert.doesNotMatch(
    result.xml,
    /<g:(brand|mpn|gtin|identifier_exists|shipping|tax)>/,
  );
});

test("condition mapping never guesses for absent, unknown or conflicting tags", () => {
  for (const [tags, expected] of [
    [["condition:excellent"], "used"],
    [["condition:good"], "used"],
    [["condition:used", "condition:excellent"], "used"],
    [["condition:new"], "new"],
    [["condition:refurbished"], "refurbished"],
    [[], null],
    [["era:vintage"], null],
    [["condition:mint"], null],
    [["condition:new", "condition:good"], null],
    [["condition:used", "condition:unknown"], null],
    [["condition:toString"], null],
  ]) {
    assert.equal(getProductCondition(tags), expected);
  }
});

test("hidden and explicitly excluded products never enter the feed", () => {
  const hidden = product(2);
  hidden.tags.push(HIDDEN_PRODUCT_TAG);
  const excluded = product(3);
  excluded.tags.push("google-shopping-exclude");
  const result = buildMerchantFeed([product(), hidden, excluded], options);
  assert.equal(result.itemCount, 1);
  assert.equal(result.excluded.length, 2);
  assert.doesNotMatch(result.xml, /silver-ring-[23]/);
  assert.equal(buildMerchantFeed([hidden, excluded], options).itemCount, 0);
});

test("sold-out items retain stable identity and accurately report out_of_stock", () => {
  const item = product();
  item.variants.nodes[0].availableForSale = false;
  const result = buildMerchantFeed([item], options);
  assert.equal(result.itemCount, 1);
  assert.match(result.xml, /<g:availability>out_of_stock<\/g:availability>/);
  assert.match(result.xml, /<g:id>shopify_1<\/g:id>/);
});

test("shipping weight converts each Shopify unit and adds packaging exactly once without mutating the source", () => {
  for (const [weight, weightUnit, expected] of [
    [1, "OUNCES", "4.000 oz"],
    [0.0625, "POUNDS", "4.000 oz"],
    [28.349523125, "GRAMS", "4.000 oz"],
    [0.028349523125, "KILOGRAMS", "4.000 oz"],
    [1, "GRAMS", "3.036 oz"],
    [0.0001, "OUNCES", "3.001 oz"],
    [31997, "OUNCES", "32000.000 oz"],
  ]) {
    const item = product();
    Object.assign(item.variants.nodes[0], { weight, weightUnit });
    const original = structuredClone(item);
    const { xml, zeroWeightItemCount } = buildMerchantFeed([item], options);
    assert.equal(
      xml.match(/<g:shipping_weight>(.*?)<\/g:shipping_weight>/)[1],
      expected,
    );
    assert.equal(zeroWeightItemCount, 0);
    assert.deepEqual(item, original);
  }
});

test("explicit zero weights produce provisional packaging-only totals and accurate diagnostics", () => {
  for (const unit of ["GRAMS", "KILOGRAMS", "OUNCES", "POUNDS"]) {
    const zero = product(2);
    zero.variants.nodes[0].weight = 0;
    zero.variants.nodes[0].weightUnit = unit;
    const hiddenZero = structuredClone(zero);
    hiddenZero.id = "gid://shopify/Product/3";
    hiddenZero.tags.push(HIDDEN_PRODUCT_TAG);
    const result = buildMerchantFeed([product(), zero, hiddenZero], options);
    assert.equal(result.itemCount, 2);
    assert.equal(result.zeroWeightItemCount, 1);
    assert.match(
      result.xml,
      /<g:shipping_weight>3.000 oz<\/g:shipping_weight>/,
    );
  }
});

test("missing or invalid jewelry weights are excluded, not replaced with packaging-only estimates", () => {
  for (const [weight, weightUnit] of [
    [null, "GRAMS"],
    [undefined, "GRAMS"],
    [-1, "GRAMS"],
    [NaN, "GRAMS"],
    [Infinity, "POUNDS"],
    ["1", "OUNCES"],
    [1, null],
    [1, "STONE"],
    [1, "toString"],
    [31997.0001, "OUNCES"],
    [Number.MAX_VALUE, "KILOGRAMS"],
  ]) {
    const invalid = product(2);
    Object.assign(invalid.variants.nodes[0], { weight, weightUnit });
    const result = buildMerchantFeed([product(), invalid], options);
    assert.equal(result.itemCount, 1);
    assert.equal(result.zeroWeightItemCount, 0);
    assert.match(result.excluded[0].reason, /Shopify product weight/);
    assert.throws(
      () => buildMerchantFeed([invalid], options),
      /invalid empty feed/,
    );
  }
});

test("XML escapes catalog text and image query strings and removes illegal XML characters", () => {
  const item = product();
  item.title = `Silver & gold <ring> "café" 'é'\u0000\uD800 💍`;
  item.description = "One\n\t two ]]> three & four";
  item.handle = "a?b#c&dé";
  const { xml } = buildMerchantFeed([item], options);
  assert.match(
    xml,
    /Silver &amp; gold &lt;ring&gt; &quot;café&quot; &apos;é&apos; 💍/,
  );
  assert.match(xml, /One two \]\]&gt; three &amp; four/);
  assert.match(xml, /ring.jpg\?v=1&amp;width=1000/);
  assert.match(xml, /\/product\/a%3Fb%23c%26d%C3%A9/);
  assert.doesNotMatch(xml, /\u0000|\uD800/u);
});

test("Google text limits do not split surrogate pairs", () => {
  const item = product();
  item.title = "💍".repeat(151);
  item.description = "é".repeat(5001);
  const { xml } = buildMerchantFeed([item], options);
  assert.equal(
    Array.from(xml.match(/<g:title>(.*?)<\/g:title>/s)[1]).length,
    150,
  );
  assert.equal(
    xml.match(/<g:description>(.*?)<\/g:description>/s)[1].length,
    5000,
  );
});

test("invalid item fields are reported; an entirely invalid catalog fails instead of returning an empty success", () => {
  const mutations = [
    (p) => (p.title = " "),
    (p) => (p.description = "\u0000"),
    (p) => (p.handle = ""),
    (p) => (p.tags = []),
    (p) => (p.featuredImage = null),
    (p) => (p.featuredImage.url = "javascript:alert(1)"),
    (p) =>
      (p.featuredImage.url = "https://user:password@example.com/image.jpg"),
    (p) => (p.variants.nodes[0].id = "not-a-shopify-variant"),
    (p) => (p.variants.nodes = []),
    (p) =>
      p.variants.nodes.push({
        ...p.variants.nodes[0],
        id: "gid://shopify/ProductVariant/3",
      }),
    (p) => (p.variants.pageInfo.hasNextPage = true),
    (p) => (p.variants.nodes[0].price.currencyCode = "CAD"),
    ...["0", "-2", "NaN", "Infinity", "1e2", "1.001", ""].map(
      (amount) => (p) => (p.variants.nodes[0].price.amount = amount),
    ),
  ];
  for (const mutate of mutations) {
    const invalid = product(2);
    mutate(invalid);
    const result = buildMerchantFeed([product(), invalid], options);
    assert.equal(result.itemCount, 1);
    assert.equal(result.excluded.length, 1);
    assert.ok(result.excluded[0].reason);
    assert.throws(
      () => buildMerchantFeed([invalid], options),
      /invalid empty feed/,
    );
  }
});

test("duplicate variants fail; a genuinely empty catalog is representable", () => {
  assert.throws(
    () => buildMerchantFeed([product(), product()], options),
    /Duplicate variant/,
  );
  const result = buildMerchantFeed([], options);
  assert.equal(result.itemCount, 0);
  assert.match(result.xml, /<channel>/);
});

test("catalog pagination reads beyond 100 products without caches, cookies or private credentials", async () => {
  const calls = [];
  const products = Array.from({ length: 323 }, (_, i) => product(i + 1));
  const fetcher = async (url, init) => {
    calls.push({ url, init });
    const index = calls.length - 1;
    return Response.json(
      page(
        products.slice(index * 100, (index + 1) * 100),
        index < 3,
        `page-${index + 1}`,
      ),
    );
  };
  const catalog = await getMerchantProducts(config, fetcher);
  assert.equal(catalog.length, 323);
  assert.equal(buildMerchantFeed(catalog, options).itemCount, 323);
  assert.equal(calls.length, 4);
  assert.deepEqual(
    calls.map(({ init }) => JSON.parse(init.body).variables.after),
    [null, "page-1", "page-2", "page-3"],
  );
  for (const { url, init } of calls) {
    assert.equal(url, "https://example.myshopify.com/api/2026-10/graphql.json");
    assert.equal(init.cache, "no-store");
    assert.equal(init.redirect, "error");
    assert.ok(init.signal instanceof AbortSignal);
    assert.equal(
      init.headers["X-Shopify-Storefront-Access-Token"],
      config.storefrontAccessToken,
    );
    assert.equal(init.headers["Shopify-Storefront-Private-Token"], undefined);
    assert.equal(init.headers.cookie, undefined);
  }
});

test("a later-page HTTP or GraphQL failure never produces a partial feed", async () => {
  for (const failure of [
    () => new Response("Unavailable", { status: 429 }),
    () =>
      Response.json({
        errors: [{ message: "Upstream details" }],
        data: page([]).data,
      }),
    () => Response.json({ data: {} }),
    () => new Response("not JSON"),
    () => {
      throw new Error("Network failure");
    },
  ]) {
    let calls = 0;
    await assert.rejects(() =>
      getMerchantProducts(config, async () => {
        calls++;
        return calls === 1
          ? Response.json(page([product()], true, "next"))
          : failure();
      }),
    );
    assert.equal(calls, 2);
  }
});

test("broken pagination fails rather than looping or silently truncating", async () => {
  for (const brokenPage of [
    page([product()], true, null),
    page([], true, "next"),
    page([product()], true, "next"),
  ]) {
    let calls = 0;
    await assert.rejects(
      () =>
        getMerchantProducts(config, async () => {
          calls++;
          assert.ok(calls <= 2);
          return Response.json(brokenPage);
        }),
      /pagination did not advance/,
    );
  }
});

test("missing credentials and non-Shopify or credential-bearing destinations fail before fetching", async () => {
  for (const invalid of [
    { ...config, shopDomain: "" },
    { ...config, shopDomain: "attacker.example" },
    { ...config, shopDomain: "example.myshopify.com.attacker.example" },
    { ...config, shopDomain: "https://user:password@example.myshopify.com" },
    { ...config, storefrontAccessToken: "" },
    { ...config, storefrontAccessToken: "private-token-not-a-public-token" },
  ]) {
    await assert.rejects(
      () =>
        getMerchantProducts(invalid, async () =>
          assert.fail("Unexpected request"),
        ),
      /configuration/,
    );
  }
});
