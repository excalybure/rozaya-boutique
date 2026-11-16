import assert from "node:assert/strict";
import { test } from "node:test";
import { forwardPrivacyRequest } from "../lib/privacy/proxy.ts";

const config = {
  checkoutRootDomain: "example.myshopify.com",
  privateStorefrontToken: "private-storefront-test-fixture",
};
const endpoint = "https://shop.example.com/api/unstable/graphql.json";

function setup(t) {
  const originalFetch = globalThis.fetch;
  const originalVercel = process.env.VERCEL;
  process.env.VERCEL = "1";
  t.after(() => {
    globalThis.fetch = originalFetch;
    if (originalVercel === undefined) {
      delete process.env.VERCEL;
    } else {
      process.env.VERCEL = originalVercel;
    }
  });
}

function request(
  headers = {},
  body = '{"query":"query { consentManagement { cookies { trackingConsentCookie } } }"}',
) {
  return new Request(endpoint, {
    method: "POST",
    headers: {
      origin: "https://shop.example.com",
      "content-type": "application/json",
      "x-vercel-forwarded-for": "203.0.113.8",
      ...headers,
    },
    body,
  });
}

test("privacy proxy preserves opaque session state, GPC and separate response cookies", async (t) => {
  setup(t);
  const calls = [];
  const cookieHeaders = [
    "_shopify_cmp=opaque; Path=/; HttpOnly; Secure; SameSite=Lax",
    "_shopify_analytics=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; HttpOnly; Secure",
  ];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    const headers = new Headers({
      "content-type": "application/json",
      "server-timing": '_cmp;desc="opaque"',
      "cache-control": "public, max-age=3600",
      "access-control-allow-origin": "*",
    });
    for (const cookie of cookieHeaders) {
      headers.append("set-cookie", cookie);
    }
    return new Response('{"data":{"consentManagement":{}}}', { headers });
  };
  const input = request({
    cookie: "_shopify_cmp=opaque; _shopify_essential=opaque-session",
    "sec-gpc": "1",
    "x-vercel-forwarded-for": "203.0.113.8",
    "x-forwarded-for": "spoofed",
    "x-shopify-client-ip": "spoofed",
    "shopify-storefront-buyer-ip": "spoofed",
    "shopify-storefront-private-token": "must-not-be-forwarded",
    authorization: "must-not-be-forwarded",
    "x-shopify-storefront-access-token": "must-not-be-forwarded",
  });
  const response = await forwardPrivacyRequest(input, config);
  const { url, options } = calls[0];
  assert.equal(url, "https://example.myshopify.com/api/unstable/graphql.json");
  assert.equal(options.headers.cookie, input.headers.get("cookie"));
  assert.equal(options.headers["sec-gpc"], "1");
  assert.equal(options.headers["Shopify-Storefront-Buyer-IP"], "203.0.113.8");
  assert.equal(options.headers["x-forwarded-for"], undefined);
  assert.equal(options.headers["x-shopify-client-ip"], undefined);
  assert.equal(options.headers.authorization, undefined);
  assert.equal(
    options.headers["Shopify-Storefront-Private-Token"],
    config.privateStorefrontToken,
  );
  assert.equal(options.headers["X-Shopify-Storefront-Access-Token"], undefined);
  assert.equal(options.headers["x-shopify-storefront-access-token"], undefined);
  assert.equal(options.cache, "no-store");
  assert.equal(options.redirect, "error");
  assert.equal(response.status, 200);
  assert.deepEqual(response.headers.getSetCookie(), cookieHeaders);
  assert.equal(response.headers.get("server-timing"), '_cmp;desc="opaque"');
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("access-control-allow-origin"), null);
  assert.deepEqual(await response.json(), { data: { consentManagement: {} } });
});

test("proxy rejects unconfigured, cross-site, non-JSON and oversized requests before upstream", async (t) => {
  setup(t);
  globalThis.fetch = async () => assert.fail("Unexpected upstream request");
  for (const [input, settings, status] of [
    [request(), null, 503],
    [request(), { ...config, privateStorefrontToken: "" }, 503],
    [request({ origin: "https://attacker.example" }), config, 403],
    [request({ origin: "null" }), config, 403],
    [request({ "content-type": "text/plain" }), config, 415],
    [request({}, "x".repeat(65537)), config, 413],
  ]) {
    const response = await forwardPrivacyRequest(input, settings);
    assert.equal(response.status, status);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(typeof (await response.json()).error, "string");
  }
});

test("upstream HTTP/GraphQL errors remain failures and network errors return 502 without details", async (t) => {
  setup(t);
  globalThis.fetch = async () =>
    new Response('{"errors":[{"message":"Unavailable"}]}', {
      status: 429,
      headers: { "content-type": "application/json" },
    });
  const upstreamError = await forwardPrivacyRequest(request(), config);
  assert.equal(upstreamError.status, 429);
  assert.deepEqual(await upstreamError.json(), {
    errors: [{ message: "Unavailable" }],
  });
  globalThis.fetch = async () => {
    throw new Error("private request details");
  };
  const networkError = await forwardPrivacyRequest(request(), config);
  assert.equal(networkError.status, 502);
  assert.equal(
    (await networkError.text()).includes("private request details"),
    false,
  );
});

test("missing or invalid trusted IP fails instead of using the server's region", async (t) => {
  setup(t);
  globalThis.fetch = async () => assert.fail("Unexpected upstream request");
  for (const ip of ["", "spoofed", "203.0.113.8, 203.0.113.9"]) {
    const response = await forwardPrivacyRequest(
      request({ "x-vercel-forwarded-for": ip }),
      config,
    );
    assert.equal(response.status, 503);
  }
  delete process.env.VERCEL;
  assert.equal((await forwardPrivacyRequest(request(), config)).status, 503);
});

test("trusted IPv6 visitor addresses are forwarded in the buyer-IP header", async (t) => {
  setup(t);
  globalThis.fetch = async (_url, options) => {
    assert.equal(options.headers["Shopify-Storefront-Buyer-IP"], "2001:db8::8");
    return Response.json({ data: {} });
  };
  assert.equal(
    (
      await forwardPrivacyRequest(
        request({ "x-vercel-forwarded-for": "2001:db8::8" }),
        config,
      )
    ).status,
    200,
  );
});

test("authentication failures never return upstream credentials or cookies", async (t) => {
  setup(t);
  for (const status of [401, 403]) {
    globalThis.fetch = async () =>
      new Response(config.privateStorefrontToken, {
        status,
        headers: { "set-cookie": "upstream-error=hidden" },
      });
    const response = await forwardPrivacyRequest(request(), config);
    assert.equal(response.status, 502);
    assert.deepEqual(response.headers.getSetCookie(), []);
    assert.equal(
      (await response.text()).includes(config.privateStorefrontToken),
      false,
    );
  }
});
