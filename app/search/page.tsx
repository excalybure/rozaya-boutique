import Grid from "components/grid";
import ProductGridItems from "components/layout/product-grid-items";
import { defaultSort, sorting } from "lib/constants";
import { getSearchCanonicalUrl } from "lib/seo";
import { getProducts } from "lib/shopify";
import type { Metadata } from "next";
import Link from "next/link";

type SearchPageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  props: SearchPageProps,
): Promise<Metadata> {
  const searchParams = (await props.searchParams) ?? {};
  const query = Array.isArray(searchParams.q)
    ? searchParams.q[0]
    : searchParams.q;
  return {
    title: "Shop jewelry",
    description:
      "Browse fine, vintage and collectible jewelry at Rozaya Boutique.",
    alternates: { canonical: getSearchCanonicalUrl(query) },
  };
}

export default async function SearchPage(props: SearchPageProps) {
  const searchParams = (await props.searchParams) ?? {};
  const sort = Array.isArray(searchParams.sort)
    ? searchParams.sort[0]
    : searchParams.sort;
  const searchValue = Array.isArray(searchParams.q)
    ? searchParams.q[0]
    : searchParams.q;
  const { sortKey, reverse } =
    sorting.find((item) => item.slug === sort) || defaultSort;
  const products = await getProducts({
    sortKey,
    reverse,
    query: searchValue,
  });

  return (
    <section className="min-h-[45vh] py-4 lg:py-0">
      <header className="mb-10 border-b border-burgundy/15 pb-8 sm:mb-12 sm:pb-10">
        <p className="mb-3 font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-gold-dark">
          Fine · Vintage · Collectible
        </p>
        <h1 className="font-heading text-4xl tracking-[-0.03em] text-burgundy sm:text-5xl">
          {searchValue ? `Results for “${searchValue}”` : "Shop the collection"}
        </h1>
        <p className="mt-4 max-w-2xl font-sans text-sm leading-7 text-charcoal/70">
          A considered selection of jewelry across eras, forms and occasions.
        </p>
      </header>

      {products.length ? (
        <Grid>
          <ProductGridItems products={products} />
        </Grid>
      ) : (
        <div className="max-w-xl py-6">
          <h2 className="font-heading text-2xl text-burgundy">
            {searchValue
              ? "No pieces matched that search."
              : "New discoveries are on their way."}
          </h2>
          <p className="mt-3 font-sans text-sm leading-7 text-charcoal/70">
            {searchValue
              ? "Try another search, or browse a category to see what catches your eye."
              : "Explore a category and find a piece that feels like yours."}
          </p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
            {[
              { title: "Rings", href: "/search/rings" },
              { title: "Necklaces", href: "/search/necklaces" },
              { title: "Earrings", href: "/search/earrings" },
              { title: "Vintage", href: "/search/victorian" },
            ].map((category) => (
              <Link
                key={category.href}
                href={category.href}
                className="border-b border-gold pb-1 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-burgundy transition-colors hover:text-gold-dark"
              >
                {category.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
