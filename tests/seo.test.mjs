import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getCanonicalRedirects,
  getCanonicalUrl,
  getSearchCanonicalUrl,
} from "../lib/seo.ts";

test("page canonicals use the chosen origin and preserve distinct page paths", () => {
  for (const pathname of [
    "/",
    "/product/silver-ring",
    "/search/rings",
    "/policies/privacy-policy",
    "/privacy-choices",
    "/about-us",
    `/product/${encodeURIComponent("silver & gold")}`,
  ]) {
    const url = new URL(getCanonicalUrl(pathname));
    assert.equal(url.origin, "https://rozaya-boutique.com");
    assert.equal(url.pathname, pathname);
  }
});

test("tracking, sort, variants and fragments do not create new page canonicals", () => {
  const url = new URL(
    getCanonicalUrl("/product/silver-ring?variant=2&utm_source=test#details"),
  );
  assert.equal(url.pathname, "/product/silver-ring");
  assert.equal(url.search, "");
  assert.equal(url.hash, "");
  assert.equal(
    getCanonicalUrl("/search/rings?sort=price-asc"),
    getCanonicalUrl("/search/rings"),
  );
});

test("canonical paths cannot switch the origin or accept absolute URLs", () => {
  for (const pathname of [
    "",
    "product/ring",
    "https://other.example/product/ring",
    "//other.example/ring",
    "/\\other.example/ring",
  ]) {
    assert.throws(() => getCanonicalUrl(pathname), /root-relative pathname/);
  }
});

test("meaningful search text is retained and safely encoded", () => {
  for (const query of ["gold & pearl", '"silver" + ruby', "café", "a?b#c"]) {
    const url = new URL(getSearchCanonicalUrl(query));
    assert.equal(url.origin, "https://rozaya-boutique.com");
    assert.equal(url.pathname, "/search");
    assert.equal(url.searchParams.get("q"), query);
    assert.deepEqual([...url.searchParams.keys()], ["q"]);
    assert.equal(url.hash, "");
  }
  assert.equal(getSearchCanonicalUrl(), getCanonicalUrl("/search"));
  assert.equal(getSearchCanonicalUrl(""), getCanonicalUrl("/search"));
});

test("permanent redirects match only the three exact custom aliases", () => {
  const redirects = getCanonicalRedirects();
  const matches = (host) =>
    redirects.filter((rule) => new RegExp(`^${rule.has[0].value}$`).test(host));
  assert.equal(redirects.length, 3);
  for (const host of [
    "www.rozaya-boutique.com",
    "rozayaboutique.com",
    "www.rozayaboutique.com",
  ]) {
    const matching = matches(host);
    assert.equal(matching.length, 1);
    assert.equal(matching[0].source, "/:path*");
    assert.equal(matching[0].has[0].type, "host");
    assert.equal(matching[0].destination, "https://rozaya-boutique.com/:path*");
    assert.equal(matching[0].permanent, true);
  }
  for (const host of [
    "rozaya-boutique.com",
    "localhost",
    "127.0.0.1",
    "rozaya-boutique.vercel.app",
    "rozaya-boutique-preview-team.vercel.app",
    "rozaya-boutique.myshopify.com",
    "checkout.rozaya-boutique.com",
    "wwwXrozaya-boutiqueYcom",
    "rozayaboutique.com.attacker.example",
  ]) {
    assert.deepEqual(matches(host), []);
  }
});
