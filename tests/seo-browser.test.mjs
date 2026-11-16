// Opt-in tests for a running Next.js app, with Playwright installed externally.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { pathToFileURL } from "node:url";
import { getCanonicalUrl, getSearchCanonicalUrl } from "../lib/seo.ts";

const modulePath = process.env.SEO_PLAYWRIGHT_MODULE;
const baseUrl = process.env.SEO_TEST_BASE_URL ?? "http://localhost:3015";
const local = ["localhost", "127.0.0.1"].includes(new URL(baseUrl).hostname);
let browser;

before(async () => {
  if (!modulePath) {
    return;
  }
  const { chromium } = await import(pathToFileURL(modulePath).href);
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.SEO_BROWSER_EXECUTABLE || undefined,
  });
});
after(async () => {
  await browser?.close();
});

async function contextFor(t) {
  const context = await browser.newContext();
  t.after(() => context.close());
  return context;
}

async function checkPage(page, path, expectedCanonical) {
  const response = await page.goto(new URL(path, baseUrl).href);
  assert.equal(response.status(), 200, path);
  const head =
    (await response.text()).match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] ??
    "";
  assert.equal(
    (head.match(/<link\b[^>]*rel="canonical"[^>]*>/g) ?? []).length,
    1,
    `Initial head canonical: ${path}`,
  );
  await page
    .locator('head link[rel="canonical"]')
    .waitFor({ state: "attached" });
  assert.deepEqual(
    await page
      .locator('link[rel="canonical"]')
      .evaluateAll((links) => links.map((link) => link.href)),
    [expectedCanonical],
    path,
  );
  const robots = await page
    .locator('meta[name="robots"]')
    .getAttribute("content");
  assert.equal(robots.includes("noindex"), false, path);
  assert.ok((await page.locator("main").innerText()).trim().length > 30, path);
}

test(
  "Next redirects preserve paths and query values and use method-preserving 308",
  { skip: !modulePath },
  async (t) => {
    const context = await contextFor(t);
    for (const host of [
      "www.rozaya-boutique.com",
      "rozayaboutique.com",
      "www.rozayaboutique.com",
    ]) {
      for (const path of [
        "/",
        "/search?q=gold+ring&sort=price-asc&utm_source=test",
        "/product/ring%20test?variant=1&variant=2",
        "/policies/privacy-policy?source=google",
      ]) {
        const requested = new URL(path, local ? baseUrl : `https://${host}`);
        const response = await context.request.get(requested.href, {
          headers: local ? { host } : {},
          maxRedirects: 0,
        });
        assert.equal(response.status(), 308, `${host}${path}`);
        const destination = new URL(response.headers().location);
        assert.equal(destination.origin, "https://rozaya-boutique.com");
        assert.equal(destination.pathname, requested.pathname);
        assert.deepEqual(
          [...destination.searchParams],
          [...requested.searchParams],
        );
      }
      const response = await context.request.post(
        new URL(
          "/api/unstable/graphql.json?source=test",
          local ? baseUrl : `https://${host}`,
        ).href,
        {
          headers: local ? { host } : {},
          data: { query: "{ __typename }" },
          maxRedirects: 0,
        },
      );
      assert.equal(response.status(), 308);
      assert.equal(
        response.headers().location,
        "https://rozaya-boutique.com/api/unstable/graphql.json?source=test",
      );
    }
    if (local) {
      for (const host of [
        "rozaya-boutique.com",
        "localhost",
        "rozaya-boutique.vercel.app",
        "preview-team.vercel.app",
        "rozaya-boutique.myshopify.com",
      ]) {
        const response = await context.request.get(
          new URL("/robots.txt", baseUrl).href,
          { headers: { host }, maxRedirects: 0 },
        );
        assert.equal(response.status(), 200, host);
      }
    }
  },
);

test(
  "page canonicals and branded title are present in the initial head",
  { skip: !modulePath },
  async (t) => {
    const context = await contextFor(t);
    const page = await context.newPage();
    await checkPage(page, "/?utm_source=test", getCanonicalUrl("/"));
    assert.equal(
      await page.title(),
      "Rozaya Boutique | Fine, Vintage & Collectible Jewelry",
    );
    assert.equal(
      new URL(
        await page.locator('meta[property="og:url"]').getAttribute("content"),
      ).href,
      getCanonicalUrl("/"),
    );
    await checkPage(
      page,
      "/search?sort=price-asc&utm_source=test",
      getCanonicalUrl("/search"),
    );
    await checkPage(
      page,
      "/search?q=gold%20%26%20pearl&sort=price-asc&utm_source=test",
      getSearchCanonicalUrl("gold & pearl"),
    );
    await checkPage(
      page,
      "/search/rings?sort=price-asc&filter.p.tag=gold",
      getCanonicalUrl("/search/rings"),
    );
    await checkPage(
      page,
      "/privacy-choices?utm_source=test",
      getCanonicalUrl("/privacy-choices"),
    );
    for (const policy of [
      "privacy-policy",
      "refund-policy",
      "shipping-policy",
      "terms-of-service",
      "contact-information",
    ]) {
      await checkPage(
        page,
        `/policies/${policy}`,
        getCanonicalUrl(`/policies/${policy}`),
      );
    }
  },
);

test(
  "robots and sitemap agree with product/page canonicals and missing pages stay noindex",
  { skip: !modulePath },
  async (t) => {
    const context = await contextFor(t);
    const page = await context.newPage();
    const robots = await context.request.get(
      new URL("/robots.txt", baseUrl).href,
    );
    assert.equal(robots.status(), 200);
    assert.match(
      await robots.text(),
      /^Sitemap: https:\/\/rozaya-boutique\.com\/sitemap\.xml$/m,
    );
    const sitemap = await context.request.get(
      new URL("/sitemap.xml", baseUrl).href,
    );
    assert.equal(sitemap.status(), 200);
    const urls = await page.evaluate(
      (xml) => {
        const document = new DOMParser().parseFromString(
          xml,
          "application/xml",
        );
        if (document.querySelector("parsererror")) {
          throw new Error("Invalid sitemap XML");
        }
        return Array.from(document.querySelectorAll("loc")).map(
          (loc) => loc.textContent,
        );
      },
      await sitemap.text(),
    );
    assert.ok(urls.length > 1);
    for (const url of urls) {
      assert.equal(new URL(url).origin, "https://rozaya-boutique.com");
    }
    const product = urls.find((url) =>
      new URL(url).pathname.startsWith("/product/"),
    );
    assert.ok(
      product,
      "A configured Shopify catalog is required for this test",
    );
    await checkPage(
      page,
      `${new URL(product).pathname}?variant=1&utm_source=test`,
      product,
    );
    const contentPage = urls.find((url) => {
      const path = new URL(url).pathname;
      return (
        path !== "/" &&
        !path.startsWith("/search") &&
        !path.startsWith("/product/")
      );
    });
    if (contentPage) {
      await checkPage(page, new URL(contentPage).pathname, contentPage);
    }
    const missing = await page.goto(
      new URL("/policies/not-a-policy", baseUrl).href,
    );
    // PPR already returns 200 for a streamed notFound on the pre-change site.
    assert.ok([200, 404].includes(missing.status()));
    await page
      .getByText("This page could not be found.", { exact: true })
      .waitFor();
    const missingRobots = await page
      .locator('meta[name="robots"]')
      .evaluateAll((metas) => metas.map((meta) => meta.content));
    assert.ok(missingRobots.some((value) => value.includes("noindex")));
    assert.equal(await page.locator('link[rel="canonical"]').count(), 0);
  },
);
