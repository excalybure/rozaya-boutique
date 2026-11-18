// Opt-in browser checks for a running app with a configured Shopify catalog.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { pathToFileURL } from "node:url";

const modulePath = process.env.SHOPIFY_IMAGES_PLAYWRIGHT_MODULE;
const baseUrl = new URL(
  process.env.SHOPIFY_IMAGES_TEST_BASE_URL ?? "http://localhost:3015",
);
const productPath =
  process.env.SHOPIFY_IMAGES_TEST_PRODUCT_PATH ??
  "/product/vintage-artisan-baltic-amber-dangle-earrings-and-ring-set-size-5-5";
let browser;

before(async () => {
  if (!modulePath) return;
  const { chromium } = await import(pathToFileURL(modulePath).href);
  browser = await chromium.launch({
    executablePath: process.env.SHOPIFY_IMAGES_BROWSER_EXECUTABLE || undefined,
  });
});
after(async () => {
  await browser?.close();
});

async function openPage(t, path, viewport) {
  const context = await browser.newContext({ viewport });
  t.after(() => context.close());
  // Prevent the navbar from creating a cart during these read-only checks.
  await context.route(
    (url) => url.origin === baseUrl.origin,
    (route) =>
      route.request().method() === "POST" ? route.abort() : route.continue(),
  );
  const page = await context.newPage();
  const response = await page.goto(new URL(path, baseUrl).href);
  assert.equal(response.status(), 200, path);
  return page;
}

function resizeWidth(url) {
  assert.equal(url.origin, "https://cdn.shopify.com", url.href);
  const width = Number(url.searchParams.get("width"));
  assert.ok(Number.isInteger(width) && width > 0, url.href);
  return width;
}

async function checkImage(image) {
  await image.scrollIntoViewIfNeeded();
  const { src, currentSrc, srcset, naturalWidth } = await image.evaluate(
    async (img) => {
      await img.decode();
      return {
        src: img.src,
        currentSrc: img.currentSrc,
        srcset: img.srcset,
        naturalWidth: img.naturalWidth,
      };
    },
  );

  assert.ok(naturalWidth > 0, currentSrc);
  resizeWidth(new URL(src));
  const widths = srcset.split(",").map((entry) => {
    const [url] = entry.trim().split(/\s+/);
    return resizeWidth(new URL(url));
  });
  assert.ok(new Set(widths).size > 1, srcset);
  const selectedUrl = new URL(currentSrc);
  resizeWidth(selectedUrl);
  return selectedUrl;
}

test(
  "gallery loads responsive Shopify images and switches to the selected photo",
  { skip: !modulePath },
  async (t) => {
    const page = await openPage(t, productPath, { width: 1280, height: 900 });
    const gallery = page.locator("form").filter({
      has: page.getByRole("button", { name: "Next product image" }),
    });
    const main = gallery.locator("img").first();
    const thumbnails = gallery.getByRole("button", {
      name: "Select product image",
    });

    const initialPhoto = await checkImage(main);
    const firstThumbnail = await checkImage(thumbnails.first().locator("img"));
    const secondThumbnail = await checkImage(thumbnails.nth(1).locator("img"));
    assert.equal(firstThumbnail.pathname, initialPhoto.pathname);
    assert.ok(resizeWidth(firstThumbnail) < resizeWidth(initialPhoto));
    assert.notEqual(secondThumbnail.pathname, initialPhoto.pathname);

    await thumbnails.nth(1).click();
    await page.waitForURL((url) => url.searchParams.get("image") === "1");
    assert.equal((await checkImage(main)).pathname, secondThumbnail.pathname);
  },
);

for (const collection of ["rings", "gold-jewelry"]) {
  test(
    `${collection} product cards load responsive Shopify images on mobile`,
    { skip: !modulePath },
    async (t) => {
      const page = await openPage(t, `/search/${collection}`, {
        width: 390,
        height: 844,
      });
      const cardImages = page.locator('main a[href^="/product/"] img');
      await checkImage(cardImages.first());
    },
  );
}
