import { getCollectionProducts } from "lib/shopify";
import Image from "next/image";
import Link from "next/link";

async function getHeroImage() {
  const products = await getCollectionProducts({
    collection: "hidden-homepage-featured-items",
  });

  return products[0]?.featuredImage;
}

export async function Hero() {
  const image = await getHeroImage();

  return (
    <section className="grid min-h-[70vh] w-full bg-burgundy md:grid-cols-[3fr_2fr]">
      <div className="flex flex-col justify-center bg-burgundy px-8 py-16 text-cream md:px-16">
        <p className="mb-6 font-sans text-xs font-medium uppercase tracking-widest text-gold">
          ROZAYA BOUTIQUE
        </p>
        <h1 className="mb-6 font-heading text-4xl italic leading-tight text-cream md:text-6xl lg:text-7xl">
          Fine &middot; Vintage &middot; Collectible
        </h1>
        <p className="mb-8 max-w-xl font-serif text-lg leading-8 text-cream/80 md:text-xl">
          A curated collection of jewelry across eras{" "}
          <span aria-hidden="true">&mdash;</span> from Georgian and Victorian
          rarities to contemporary artisan pieces. Every item hand-selected for
          craftsmanship, story, and lasting beauty.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/search"
            className="inline-flex justify-center bg-gold px-8 py-3 font-sans text-xs font-medium uppercase tracking-wider text-charcoal transition-colors hover:bg-gold-light"
          >
            Shop All Jewelry
          </Link>
          <Link
            href="/search/art-deco"
            className="inline-flex justify-center border border-cream px-8 py-3 font-sans text-xs font-medium uppercase tracking-wider text-cream transition-colors hover:bg-cream hover:text-burgundy"
          >
            Explore Art Deco
          </Link>
        </div>
      </div>

      <div className="relative min-h-[60vh] overflow-hidden bg-burgundy md:min-h-[70vh]">
        {image?.url ? (
          <>
            <Image
              src={image.url}
              alt={image.altText || "Curated Rozaya Boutique jewelry"}
              fill
              priority
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-burgundy/10" />
          </>
        ) : (
          <div className="flex h-full min-h-[60vh] items-center justify-center bg-burgundy md:min-h-[70vh]">
            <span className="font-heading text-9xl italic text-gold/70">
              R
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
