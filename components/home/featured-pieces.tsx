import { GridTileImage } from "components/grid/tile";
import { getCollectionProducts, isShopifyConfigured } from "lib/shopify";
import Link from "next/link";

const featuredPieceCount = 4;

export async function FeaturedPieces() {
  if (!isShopifyConfigured) return null;

  const products = await getCollectionProducts({
    collection: "hidden-homepage-featured-items",
  });
  const featuredProducts = products
    .filter((product) => product.featuredImage?.url)
    .slice(0, featuredPieceCount);

  if (featuredProducts.length < featuredPieceCount) return null;

  return (
    <section className="bg-cream px-6 py-20 sm:px-10 lg:px-16 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-5 md:mb-14 md:flex-row md:items-end">
          <div>
            <p className="mb-3 font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-gold-dark">
              Selected for you
            </p>
            <h2 className="font-heading text-4xl tracking-[-0.03em] text-burgundy sm:text-5xl">
              Pieces to keep close
            </h2>
          </div>
          <Link
            href="/search"
            className="w-fit border-b border-gold pb-2 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-burgundy transition-colors hover:text-gold-dark"
          >
            View the full collection
          </Link>
        </div>

        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <li key={product.handle}>
              <Link href={`/product/${product.handle}`} className="block">
                <GridTileImage
                  alt={product.featuredImage?.altText || product.title}
                  label={{
                    title: product.title,
                    amount: product.priceRange.maxVariantPrice.amount,
                    currencyCode:
                      product.priceRange.maxVariantPrice.currencyCode,
                  }}
                  src={product.featuredImage?.url}
                  fill
                  sizes="(min-width: 1024px) 24vw, (min-width: 640px) 48vw, 100vw"
                  product={product}
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
