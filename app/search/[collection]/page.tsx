import Filters from "components/layout/search/filters";
import { getCollection, getCollectionProductsWithFilters } from "lib/shopify";
import { Metadata } from "next";
import { notFound } from "next/navigation";

import Grid from "components/grid";
import ProductGridItems from "components/layout/product-grid-items";
import { defaultSort, sorting } from "lib/constants";

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

export async function generateMetadata(props: {
  params: Promise<{ collection: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const collection = await getCollection(params.collection);

  if (!collection) return notFound();

  return {
    title: collection.seo?.title || collection.title,
    description:
      collection.seo?.description ||
      collection.description ||
      `${collection.title} products`,
  };
}

export default async function CategoryPage(props: {
  params: Promise<{ collection: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = ((await props.searchParams) ?? {}) as SearchParams;
  const params = await props.params;
  const { sort } = searchParams as { [key: string]: string };
  const { sortKey, reverse } =
    sorting.find((item) => item.slug === sort) || defaultSort;
  const { products, filters } = await getCollectionProductsWithFilters({
    collection: params.collection,
    filters: getProductFilters(searchParams),
    sortKey,
    reverse,
  });

  return (
    <section className="flex flex-col gap-6 md:flex-row">
      <Filters filters={filters} />
      <div className="min-w-0 flex-1">
        {products.length === 0 ? (
          <p className="py-3 text-lg">{`No products found in this collection`}</p>
        ) : (
          <Grid>
            <ProductGridItems products={products} />
          </Grid>
        )}
      </div>
    </section>
  );
}
