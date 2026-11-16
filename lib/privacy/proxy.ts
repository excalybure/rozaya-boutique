import { isIP } from "node:net";

export type PrivacyProxyConfig = {
  checkoutRootDomain: string;
  privateStorefrontToken: string;
};

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
  config: PrivacyProxyConfig | null,
): Promise<Response> {
  if (!config?.privateStorefrontToken) {
    return privacyError("Privacy controls are not configured.", 503);
  }
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return privacyError("A same-origin request is required.", 403);
  }
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return privacyError("A JSON request is required.", 415);
  }
  // Vercel supplies this header; never trust a browser-supplied buyer-IP header.
  // Without a valid visitor IP, do not silently apply the function's region.
  const clientIp = request.headers.get("x-vercel-forwarded-for") ?? "";
  if (process.env.VERCEL !== "1" || isIP(clientIp) === 0) {
    return privacyError("Privacy location could not be determined.", 503);
  }
  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) {
    return privacyError("Request is too large.", 413);
  }

  // Preserve Shopify's documented header casing for private-token buyer traffic.
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Shopify-Storefront-Private-Token": config.privateStorefrontToken,
    "Shopify-Storefront-Buyer-IP": clientIp,
  };
  for (const name of FORWARDED_HEADERS) {
    const value = request.headers.get(name);
    if (value) {
      headers[name] = value;
    }
  }

  try {
    // The shop and credential come only from server configuration. The SDK's
    // public browser token is deliberately not forwarded by this transport.
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
    if (upstream.status === 401 || upstream.status === 403) {
      return privacyError("Shopify privacy authentication failed.", 502);
    }
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
