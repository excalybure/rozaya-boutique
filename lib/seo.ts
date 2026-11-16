export const CANONICAL_ORIGIN = "https://rozaya-boutique.com";

const REDIRECT_HOSTS = [
  "www.rozaya-boutique.com",
  "rozayaboutique.com",
  "www.rozayaboutique.com",
];

export function getCanonicalUrl(pathname: string): string {
  const invalidPath =
    !pathname.startsWith("/") ||
    pathname.startsWith("//") ||
    pathname.includes("\\");
  if (invalidPath) {
    throw new Error("Canonical URLs require a root-relative pathname.");
  }
  const url = new URL(pathname, CANONICAL_ORIGIN);
  // Sorting, tracking, fragments and product variants do not define new pages.
  url.search = "";
  url.hash = "";
  return url.toString();
}

export function getSearchCanonicalUrl(query?: string): string {
  const url = new URL(getCanonicalUrl("/search"));
  // Unlike tracking/sort parameters, q changes the search page's actual content.
  if (query) {
    url.searchParams.set("q", query);
  }
  return url.toString();
}

export function getCanonicalRedirects() {
  return REDIRECT_HOSTS.map((host) => ({
    source: "/:path*",
    has: [{ type: "host" as const, value: host.replace(/\./g, "\\.") }],
    destination: `${CANONICAL_ORIGIN}/:path*`,
    // Next.js uses 308, preserving the HTTP method as well as path/query values.
    permanent: true,
  }));
}
