import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CATALOG_PAGE_SIZE,
  getCatalogPage,
  getCatalogPageStart,
  getCatalogPageUrl,
} from "../lib/catalog-pagination.ts";
import { getCatalogCanonicalUrl, getSearchCanonicalUrl } from "../lib/seo.ts";

test("only positive, unambiguous page numbers select later pages", () => {
  for (const value of [
    undefined,
    "",
    "0",
    "-2",
    "1.5",
    "2e2",
    ["2"],
    "9".repeat(20),
  ]) {
    assert.equal(getCatalogPage(value), 1);
  }
  assert.equal(getCatalogPage("11"), 11);
});

test("catalog links preserve search, sort and repeated filters", () => {
  const path = "/search/all-jewelry";
  const state = {
    q: "gold & silver",
    sort: "price-asc",
    "filter.p.tag": ["vintage", "sterling silver"],
    page: "3",
  };
  const next = new URL(
    getCatalogPageUrl(path, state, 4),
    "https://example.com",
  );
  assert.equal(next.pathname, path);
  assert.equal(next.searchParams.get("q"), state.q);
  assert.equal(next.searchParams.get("sort"), state.sort);
  assert.deepEqual(
    next.searchParams.getAll("filter.p.tag"),
    state["filter.p.tag"],
  );
  assert.deepEqual(next.searchParams.getAll("page"), ["4"]);
  assert.equal(getCatalogPageUrl(path, state, 1).includes("page="), false);
});

test("default paginated views have distinct canonicals", () => {
  assert.equal(
    getCatalogCanonicalUrl("/search/rings", 2),
    "https://rozaya-boutique.com/search/rings?page=2",
  );
  assert.equal(
    getSearchCanonicalUrl("gold & silver", 2),
    "https://rozaya-boutique.com/search?q=gold+%26+silver&page=2",
  );
});

test("page lookup crosses Shopify's connection limit and rejects pages past the end", async () => {
  const queries = [];
  const total = 320;
  const fetchPageInfo = async (first, after) => {
    queries.push([first, after]);
    const end = Math.min(Number(after ?? 0) + first, total);
    return { hasNextPage: end < total, endCursor: String(end) };
  };
  assert.deepEqual(
    await getCatalogPageStart(1, CATALOG_PAGE_SIZE, fetchPageInfo),
    { after: undefined },
  );
  assert.deepEqual(queries, []);
  assert.deepEqual(
    await getCatalogPageStart(11, CATALOG_PAGE_SIZE, fetchPageInfo),
    { after: "300" },
  );
  assert.equal(queries.length, 2);
  assert.equal(
    await getCatalogPageStart(12, CATALOG_PAGE_SIZE, fetchPageInfo),
    null,
  );
});

test("relevance lookup walks the same boundaries as shopper navigation", async () => {
  const requests = [];
  const result = await getCatalogPageStart(
    4,
    CATALOG_PAGE_SIZE,
    async (first, after) => {
      assert.equal(first, CATALOG_PAGE_SIZE);
      requests.push(after);
      return { hasNextPage: true, endCursor: `cursor-${requests.length}` };
    },
    CATALOG_PAGE_SIZE,
  );
  assert.deepEqual(requests, [undefined, "cursor-1", "cursor-2"]);
  assert.deepEqual(result, { after: "cursor-3" });
});

test("a stalled Shopify cursor fails instead of looping indefinitely", async () => {
  await assert.rejects(
    getCatalogPageStart(11, CATALOG_PAGE_SIZE, async () => ({
      hasNextPage: true,
      endCursor: "same-cursor",
    })),
    /did not advance/,
  );
});
