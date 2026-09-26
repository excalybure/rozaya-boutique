import Filters from "components/layout/search/filters";
import Grid from "components/grid";
import ProductGridItems from "components/layout/product-grid-items";
import { defaultSort, sorting } from "lib/constants";
import {
  getCollection,
  getCollectionProductsWithFilters,
  isShopifyConfigured,
} from "lib/shopify";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type SearchParams = { [key: string]: string | string[] | undefined };

function getSearchParamValues(value: string | string[] | undefined) {
  if (!value) return [];

  return Array.isArray(value) ? value : [value];
}

function getProductFilters(searchParams: SearchParams) {
  const filters: Record<string, unknown>[] = [];

  for (const [key, value] of Object.entries(searchParams)) {
    const values = getSearchParamValues(value).filter(Boolean);

    if (!key.startsWith("filter.")) continue;

    for (const currentValue of values) {
      if (key === "filter.p.tag") {
        filters.push({ tag: currentValue });
        continue;
      }

      if (key === "filter.p.product_type") {
        filters.push({ productType: currentValue });
        continue;
      }

      if (key === "filter.p.vendor") {
        filters.push({ vendor: currentValue });
        continue;
      }

      if (key.startsWith("filter.p.m.")) {
        const [, , , namespace, metafieldKey] = key.split(".");

        if (namespace && metafieldKey) {
          filters.push({
            productMetafield: {
              namespace,
              key: metafieldKey,
              value: currentValue,
            },
          });
        }
      }
    }
  }

  return filters;
}

function titleFromHandle(handle: string) {
  return handle
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function generateMetadata(props: {
  params: Promise<{ collection: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const collection = await getCollection(params.collection);

  if (!collection && isShopifyConfigured) return notFound();

  const title = collection?.title || titleFromHandle(params.collection);

  return {
    title: collection?.seo?.title || title,
    description:
      collection?.seo?.description ||
      collection?.description ||
      `Explore ${title.toLowerCase()} at Rozaya Boutique.`,
  };
}

export default async function CategoryPage(props: {
  params: Promise<{ collection: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = ((await props.searchParams) ?? {}) as SearchParams;
  const params = await props.params;
  const collection = await getCollection(params.collection);

  if (!collection && isShopifyConfigured) notFound();

  const { sort } = searchParams as { [key: string]: string };
  const { sortKey, reverse } =
    sorting.find((item) => item.slug === sort) || defaultSort;
  const { products, filters } = await getCollectionProductsWithFilters({
    collection: params.collection,
    filters: getProductFilters(searchParams),
    sortKey,
    reverse,
  });
  const title = collection?.title || titleFromHandle(params.collection);

  return (
    <section className="py-4 lg:py-0">
      <header className="mb-10 border-b border-burgundy/15 pb-8 sm:mb-12 sm:pb-10">
        <p className="mb-3 font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-gold-dark">
          Shop by category
        </p>
        <h1 className="font-heading text-4xl tracking-[-0.03em] text-burgundy sm:text-5xl">
          {title}
        </h1>
        {collection?.description ? (
          <p className="mt-4 max-w-2xl font-sans text-sm leading-7 text-charcoal/70">
            {collection.description}
          </p>
        ) : null}
      </header>

      <div className="flex flex-col gap-8 md:flex-row">
        {products.length ? <Filters filters={filters} /> : null}
        <div className="min-w-0 flex-1">
          {products.length ? (
            <Grid>
              <ProductGridItems products={products} />
            </Grid>
          ) : (
            <div className="max-w-xl py-6">
              <h2 className="font-heading text-2xl text-burgundy">
                The collection is being prepared.
              </h2>
              <p className="mt-3 font-sans text-sm leading-7 text-charcoal/70">
                Browse the full collection or come back soon to discover what
                has been selected.
              </p>
              <Link
                href="/search"
                className="mt-6 inline-flex min-h-11 items-center bg-burgundy px-6 font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-burgundy-light"
              >
                Shop all jewelry
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
