// Opt-in read-only integration against a running app using the Shopify catalog.
import assert from "node:assert/strict";
import { test } from "node:test";
import { CATALOG_PAGE_SIZE } from "../lib/catalog-pagination.ts";

const baseUrl = process.env.CATALOG_TEST_BASE_URL;

async function read(path) {
  const response = await fetch(new URL(path, baseUrl), {
    signal: AbortSignal.timeout(60_000),
  });
  assert.equal(response.status, 200, String(path));
  return response.text();
}

function getPageLink(html, direction) {
  const anchor = html.match(
    new RegExp(`<a\\b[^>]*\\brel="${direction}"[^>]*>`),
  );
  return anchor?.[0].match(/\bhref="([^"]+)"/)?.[1].replaceAll("&amp;", "&");
}

async function walkCatalog(firstPath) {
  const products = new Set();
  let previous;
  let path = firstPath;
  let pages = 0;
  let lastPageSize;
  while (path) {
    assert.ok(++pages < 50, "catalog navigation never ended");
    const html = await read(path);
    assert.equal(getPageLink(html, "prev"), previous, path);
    const links = [...html.matchAll(/href="(\/product\/[^"#?]+)/g)].map(
      (match) => match[1],
    );
    assert.ok(links.length > 0 && links.length <= CATALOG_PAGE_SIZE, path);
    for (const link of links) {
      assert.ok(!products.has(link), `Duplicate product ${link} on ${path}`);
      products.add(link);
    }
    lastPageSize = links.length;
    previous = path;
    path = getPageLink(html, "next");
    if (path) {
      const { searchParams } = new URL(path, baseUrl);
      assert.equal(searchParams.get("page"), String(pages + 1));
      searchParams.delete("page");
      assert.deepEqual(searchParams, new URL(firstPath, baseUrl).searchParams);
    }
  }
  return { products, pages, lastPageSize };
}

test(
  "Shop All exposes the entire sitemap catalog exactly once",
  { skip: !baseUrl },
  async () => {
    const { products, pages, lastPageSize } = await walkCatalog("/search");
    const sitemap = await read("/sitemap.xml");
    const sitemapProducts = [
      ...sitemap.matchAll(/<loc>[^<]*(\/product\/[^<]+)<\/loc>/g),
    ].map((match) => match[1]);
    assert.ok(products.size > 100);
    assert.equal(sitemapProducts.length, products.size);
    assert.deepEqual(new Set(sitemapProducts), products);
    assert.equal(pages, Math.ceil(products.size / CATALOG_PAGE_SIZE));
    assert.equal(lastPageSize, products.size - (pages - 1) * CATALOG_PAGE_SIZE);
  },
);

test(
  "keyword relevance and collection results paginate without repeats",
  { skip: !baseUrl },
  async () => {
    const search = await walkCatalog("/search?q=silver");
    assert.ok(search.pages > 1);
    const collection = await walkCatalog("/search/all-jewelry");
    assert.ok(collection.pages > 1);
  },
);

test(
  "filtered collection pages preserve the active sort and filters",
  { skip: !baseUrl },
  async () => {
    const collection = await walkCatalog(
      "/search/all-jewelry?filter.p.m.custom.metal=Sterling+Silver&sort=price-asc",
    );
    assert.ok(collection.pages > 1);
    const searchPage = await read("/search?q=silver&sort=price-asc&page=2");
    assert.equal(
      getPageLink(searchPage, "prev"),
      "/search?q=silver&sort=price-asc",
    );
    assert.equal(
      getPageLink(searchPage, "next"),
      "/search?q=silver&sort=price-asc&page=3",
    );
  },
);

test(
  "Under $100 keeps bookmarked sort options and loads the renamed Shopify collection",
  { skip: !baseUrl },
  async () => {
    const query = "?sort=price-asc";
    const previous = await fetch(
      new URL(`/search/under-500${query}`, baseUrl),
      {
        redirect: "manual",
        signal: AbortSignal.timeout(60_000),
      },
    );
    assert.equal(previous.status, 308);
    const destination = new URL(previous.headers.get("location"), baseUrl);
    assert.equal(destination.pathname, "/search/under-100");
    assert.equal(destination.search, query);

    const html = await read(destination);
    assert.match(html, /<h1\b[^>]*>Under \$100<\/h1>/);
    assert.match(html, /href="\/product\//);
    assert.match(html, /rel="canonical" href="[^"]+\/search\/under-100"/);

    const homepage = await read("/");
    assert.match(homepage, /<h3\b[^>]*>Under \$100<\/h3>/);
    assert.match(homepage, /href="\/search\/under-100"/);
    assert.doesNotMatch(homepage, /href="\/search\/under-500"|Under \$500/);

    const sitemap = await read("/sitemap.xml");
    assert.match(sitemap, /\/search\/under-100<\/loc>/);
    assert.doesNotMatch(sitemap, /\/search\/under-500<\/loc>/);
  },
);
