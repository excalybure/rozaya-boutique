export const CATALOG_PAGE_SIZE = 30;
export const SHOPIFY_CONNECTION_LIMIT = 250;

export type CatalogSearchParams = Record<string, string | string[] | undefined>;

export type ProductPageInfo = {
  hasNextPage: boolean;
  endCursor: string | null;
};

export function getCatalogPage(value: CatalogSearchParams[string]) {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return 1;
  const page = Number(value);
  return Number.isSafeInteger(page * CATALOG_PAGE_SIZE) ? page : 1;
}

export function getCatalogPageUrl(
  pathname: string,
  searchParams: CatalogSearchParams,
  page: number,
) {
  const params = new URLSearchParams();
  for (const [key, values] of Object.entries(searchParams)) {
    if (key === "page" || values === undefined) continue;
    for (const value of Array.isArray(values) ? values : [values]) {
      params.append(key, value);
    }
  }
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

// Resolve a numbered page using only Shopify's cursors, without loading the
// product cards from earlier pages. null means the requested page doesn't exist.
export async function getCatalogPageStart(
  page: number,
  pageSize: number,
  fetchPageInfo: (
    first: number,
    after?: string,
  ) => Promise<ProductPageInfo | undefined>,
  batchSize = SHOPIFY_CONNECTION_LIMIT,
): Promise<{ after?: string } | null> {
  let remaining = (page - 1) * pageSize;
  let after: string | undefined;
  const seenCursors = new Set<string>();
  while (remaining > 0) {
    const first = Math.min(remaining, batchSize);
    const info = await fetchPageInfo(first, after);
    if (!info?.hasNextPage) return null;
    if (!info.endCursor || seenCursors.has(info.endCursor)) {
      throw new Error("Shopify catalog pagination did not advance.");
    }
    after = info.endCursor;
    seenCursors.add(after);
    remaining -= first;
  }
  return { after };
}
