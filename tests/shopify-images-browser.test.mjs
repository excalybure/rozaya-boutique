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
const lightboxProductPath =
  "/product/950-sterling-silver-tigers-eye-jewelry-set-necklace-pendant-earrings-modernist?image=4";
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
  "gallery loads responsive Shopify images and supports chevrons and keyboard selection",
  { skip: !modulePath },
  async (t) => {
    const page = await openPage(t, productPath, { width: 1280, height: 900 });
    const gallery = page.getByRole("region", { name: "Product gallery" });
    const main = gallery.locator("img").first();
    const thumbnails = gallery
      .getByRole("list", { name: "Product image thumbnails" })
      .getByRole("button");
    const previous = gallery.getByRole("button", {
      name: "Previous product image",
    });
    const next = gallery.getByRole("button", { name: "Next product image" });

    const initialPhoto = await checkImage(main);
    const firstThumbnail = await checkImage(thumbnails.first().locator("img"));
    const secondThumbnail = await checkImage(thumbnails.nth(1).locator("img"));
    const lastThumbnail = await checkImage(thumbnails.last().locator("img"));
    const imageCount = await thumbnails.count();
    assert.equal(firstThumbnail.pathname, initialPhoto.pathname);
    assert.ok(resizeWidth(firstThumbnail) < resizeWidth(initialPhoto));
    assert.notEqual(secondThumbnail.pathname, initialPhoto.pathname);

    await previous.click();
    await page.waitForURL(
      (url) => url.searchParams.get("image") === String(imageCount - 1),
    );
    assert.equal((await checkImage(main)).pathname, lastThumbnail.pathname);
    assert.equal(await thumbnails.last().getAttribute("aria-pressed"), "true");

    await next.click();
    await page.waitForURL((url) => url.searchParams.get("image") === "0");
    assert.equal((await checkImage(main)).pathname, firstThumbnail.pathname);

    await thumbnails.nth(1).press("Enter");
    await page.waitForURL((url) => url.searchParams.get("image") === "1");
    assert.equal((await checkImage(main)).pathname, secondThumbnail.pathname);
    assert.equal(
      await gallery.getByRole("button", { pressed: true }).count(),
      1,
    );
    assert.equal(await thumbnails.nth(1).getAttribute("aria-pressed"), "true");
    assert.ok(
      await gallery
        .getByRole("status")
        .getByText(`2 / ${imageCount}`, { exact: true })
        .isVisible(),
    );
  },
);

test(
  "gallery chevrons flank a single non-scrolling row below the photo",
  { skip: !modulePath },
  async (t) => {
    const page = await openPage(t, productPath, { width: 1280, height: 900 });
    const gallery = page.getByRole("region", { name: "Product gallery" });
    const photo = gallery.locator("img").first();
    const strip = gallery.getByRole("list", {
      name: "Product image thumbnails",
    });
    const previous = gallery.getByRole("button", {
      name: "Previous product image",
    });
    const next = gallery.getByRole("button", { name: "Next product image" });

    for (const width of [1280, 1024, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      const overflow = await strip.evaluate((list) => [
        list.scrollWidth - list.clientWidth,
        list.scrollHeight - list.clientHeight,
      ]);
      assert.deepEqual(
        overflow,
        [0, 0],
        `${width}px: thumbnail strip overflow`,
      );

      const [image, left, row, right] = await Promise.all(
        [photo, previous, strip, next].map((element) => element.boundingBox()),
      );
      assert.ok(image && left && row && right, `${width}px: visible controls`);
      const imageBottom = image.y + image.height;
      assert.ok(
        [left, row, right].every((box) => box.y >= imageBottom),
        `${width}px: all controls below the image`,
      );
      assert.ok(
        left.x + left.width <= row.x && row.x + row.width <= right.x,
        `${width}px: arrows flank the thumbnails`,
      );
      assert.ok(
        left.x >= 0 && right.x + right.width <= width,
        `${width}px: controls fit`,
      );

      const buttons = await strip
        .getByRole("button")
        .evaluateAll((thumbnails) =>
          thumbnails.map((button) => {
            const { top, width } = button.getBoundingClientRect();
            return { top, width };
          }),
        );
      assert.ok(buttons.length > 1);
      assert.ok(
        buttons.every(
          (button) => button.top === buttons[0].top && button.width >= 24,
        ),
        `${width}px: thumbnails stay in one row with usable targets`,
      );
    }
  },
);

test(
  "lightbox loads the original on demand and keeps the gallery selection after closing",
  { skip: !modulePath },
  async (t) => {
    const page = await openPage(t, lightboxProductPath, {
      width: 1280,
      height: 900,
    });
    const gallery = page.getByRole("region", { name: "Product gallery" });
    const main = gallery.getByRole("button", { name: "Enlarge photo" });
    const original = await checkImage(main.locator("img"));
    original.searchParams.delete("width");
    const dialog = page.getByRole("dialog", { name: "Photo detail" });
    assert.equal(
      await page.locator("dialog[data-product-photo-lightbox]").count(),
      0,
    );
    const originalRequest = page.waitForRequest(
      (request) => request.url() === original.href,
    );
    await main.press("Enter");
    await originalRequest;
    const image = dialog.getByRole("img");
    await image.waitFor();
    assert.equal(await image.getAttribute("src"), original.href);
    assert.equal(await image.getAttribute("srcset"), null);
    assert.equal(
      await dialog
        .getByRole("button", { name: "Close photo" })
        .evaluate((button) => button === document.activeElement),
      true,
    );
    // The inline image occupies a wide box, but object-fit contains the photo
    // within that box. Compare visible photo width, not the button's width.
    const inlinePhotoWidth = await main
      .locator("img")
      .evaluate((img) =>
        Math.min(
          img.clientWidth,
          (img.clientHeight * img.naturalWidth) / img.naturalHeight,
        ),
      );
    assert.ok((await image.boundingBox()).width > inlinePhotoWidth);
    assert.ok(
      await dialog.getByText("Photo 5 of 5", { exact: true }).isVisible(),
    );

    await dialog.getByRole("button", { name: "Actual size (1:1)" }).click();
    assert.deepEqual(
      await image.evaluate((img) => [img.clientWidth, img.clientHeight]),
      [1024, 1024],
    );
    const frame = dialog.getByRole("region", {
      name: "Enlarged product photo",
    });
    assert.ok(await frame.evaluate((element) => element.scrollTop > 0));
    await dialog.getByRole("button", { name: "Fit to screen" }).click();

    await page.keyboard.press("ArrowLeft");
    await dialog.getByText("Photo 4 of 5", { exact: true }).waitFor();
    assert.notEqual(await image.getAttribute("src"), original.href);
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "detached" });
    await page.waitForURL((url) => url.searchParams.get("image") === "3");
    assert.equal(
      await main.evaluate((button) => button === document.activeElement),
      true,
    );
    assert.equal(
      await gallery
        .getByRole("button", { name: "Select product image 4" })
        .getAttribute("aria-pressed"),
      "true",
    );

    await main.click();
    await dialog.waitFor();
    await page.mouse.click(4, 4);
    await dialog.waitFor({ state: "detached" });
  },
);

test(
  "mobile lightbox fits the screen and scrolls within the dialog at actual size",
  { skip: !modulePath },
  async (t) => {
    const page = await openPage(t, lightboxProductPath, {
      width: 390,
      height: 844,
    });
    await page.getByRole("button", { name: "Enlarge photo" }).click();
    const dialog = page.getByRole("dialog", { name: "Photo detail" });
    const image = dialog.getByRole("img");
    await image.waitFor();
    const size = await image.boundingBox();
    assert.ok(size.width > 0 && size.width <= 390);
    assert.equal((await dialog.boundingBox()).width, 390);
    await dialog.getByRole("button", { name: "Actual size (1:1)" }).click();
    assert.equal((await image.boundingBox()).width, 1024);
    const frame = dialog.getByRole("region", {
      name: "Enlarged product photo",
    });
    assert.ok(
      await frame.evaluate(
        (element) =>
          element.scrollLeft > 0 && element.scrollWidth > element.clientWidth,
      ),
    );
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth),
      390,
    );
    await dialog.getByRole("button", { name: "Next photo" }).click();
    await dialog.getByText("Photo 1 of 5", { exact: true }).waitFor();
    assert.ok(
      await dialog
        .getByRole("button", { name: "Actual size (1:1)" })
        .isVisible(),
    );
    await dialog.getByRole("button", { name: "Close photo" }).click();
    await dialog.waitFor({ state: "detached" });
    await page.waitForURL((url) => url.searchParams.get("image") === "0");
  },
);

test(
  "replacement collection tiles load their photos and open the matching storefront pages",
  { skip: !modulePath },
  async (t) => {
    const page = await openPage(t, "/", { width: 1280, height: 900 });
    for (const [handle, title] of [
      ["semi-precious-gemstones", "Semi-Precious Gemstones"],
      ["vintage-bakelite", "Vintage Bakelite"],
    ]) {
      const path = `/search/${handle}`;
      const tile = page.locator("#collections a").filter({
        has: page.getByRole("heading", { name: title, exact: true }),
      });
      assert.equal(await tile.getAttribute("href"), path);
      const image = tile.locator("img");
      await image.scrollIntoViewIfNeeded();
      assert.equal(
        await image.getAttribute("src"),
        `/images/categories/${handle}.webp`,
      );
      assert.ok(
        await image.evaluate(async (img) => {
          await img.decode();
          return img.naturalWidth > 0;
        }),
      );
      const menu = page.getByRole("navigation", { name: "Collections" });
      assert.equal(
        await menu
          .getByRole("link", { name: title, exact: true })
          .getAttribute("href"),
        path,
      );
      assert.equal(
        await page
          .locator('a[href="/search/diamond"], a[href="/search/gold-jewelry"]')
          .count(),
        0,
      );

      await tile.click();
      await page.waitForURL((url) => url.pathname === path);
      await page
        .getByRole("heading", { level: 1, name: title, exact: true })
        .waitFor();
      await page.goBack();
    }
  },
);

for (const collection of ["rings", "bracelets"]) {
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
