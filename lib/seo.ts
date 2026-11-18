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

export function getCatalogCanonicalUrl(
  pathname: string,
  page = 1,
  query?: string,
): string {
  const url = new URL(getCanonicalUrl(pathname));
  // Search text and page number define distinct catalog results.
  if (query) {
    url.searchParams.set("q", query);
  }
  if (page > 1) url.searchParams.set("page", String(page));
  return url.toString();
}

export function getSearchCanonicalUrl(query?: string, page = 1): string {
  return getCatalogCanonicalUrl("/search", page, query);
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
