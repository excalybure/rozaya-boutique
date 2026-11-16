import type { PrivacyConfig } from "./customer-privacy";

const FORWARDED_HEADERS = [
  "accept-language",
  "cookie",
  "origin",
  "referer",
  "user-agent",
  "sec-gpc",
  "x-shopify-unique-token",
  "x-shopify-visit-token",
];
const MAX_BODY_BYTES = 65536;

function privacyError(message: string, status: number): Response {
  return Response.json(
    { error: message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function forwardPrivacyRequest(
  request: Request,
  config: PrivacyConfig | null,
): Promise<Response> {
  if (!config) {
    return privacyError("Privacy controls are not configured.", 503);
  }
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return privacyError("A same-origin request is required.", 403);
  }
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return privacyError("A JSON request is required.", 415);
  }
  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) {
    return privacyError("Request is too large.", 413);
  }

  const headers = new Headers({
    "Content-Type": "application/json",
    "X-Shopify-Storefront-Access-Token": config.storefrontAccessToken,
  });
  for (const name of FORWARDED_HEADERS) {
    const value = request.headers.get(name);
    if (value) {
      headers.set(name, value);
    }
  }
  // Only trust client IP headers supplied by the deployment platform. Otherwise
  // Shopify would geolocate the Vercel function instead of the visitor.
  if (process.env.VERCEL === "1") {
    const clientIp = request.headers.get("x-vercel-forwarded-for");
    if (clientIp) {
      headers.set("X-Shopify-Client-IP", clientIp);
      headers.set("X-Forwarded-For", clientIp);
    }
  }

  try {
    // Fixed, server-validated shop and public token: never a caller-supplied URL
    // or private credential. This route is the SDK's Storefront API transport.
    const upstream = await fetch(
      `https://${config.checkoutRootDomain}/api/unstable/graphql.json`,
      {
        method: "POST",
        headers,
        body,
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(10000),
      },
    );
    const responseHeaders = new Headers({ "Cache-Control": "no-store" });
    for (const name of ["content-type", "server-timing"]) {
      const value = upstream.headers.get(name);
      if (value) {
        responseHeaders.set(name, value);
      }
    }
    // Forward each cookie unchanged, including HttpOnly and deletion attributes.
    // Never parse consent or reconstruct/merge Shopify's cookie values ourselves.
    for (const cookie of upstream.headers.getSetCookie()) {
      responseHeaders.append("Set-Cookie", cookie);
    }
    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch {
    return privacyError("Shopify privacy controls could not be reached.", 502);
  }
}
