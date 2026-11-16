import { CategoryTiles } from "components/home/category-tiles";
import { FeaturedPieces } from "components/home/featured-pieces";
import { Hero } from "components/home/hero";
import { Story } from "components/home/story";
import { getCanonicalUrl } from "lib/seo";
import Link from "next/link";

export const metadata = {
  title: {
    absolute: "Rozaya Boutique | Fine, Vintage & Collectible Jewelry",
  },
  alternates: { canonical: getCanonicalUrl("/") },
  description:
    "Discover a considered collection of fine, vintage and collectible jewelry, chosen for its character, craftsmanship and enduring appeal.",
  openGraph: {
    type: "website",
    url: getCanonicalUrl("/"),
    title: "Rozaya Boutique — Jewelry with a life of its own",
    description:
      "A considered collection of fine, vintage and collectible jewelry.",
  },
};

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      <Hero />
      <div className="border-y border-gold/25 bg-burgundy px-6 py-5 text-cream sm:px-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-2 text-center font-sans text-[10px] font-semibold uppercase tracking-[0.24em] sm:justify-between sm:text-xs">
          <span>Fine jewelry</span>
          <span className="hidden h-1 w-1 rounded-full bg-gold sm:block" />
          <span>Vintage discoveries</span>
          <span className="hidden h-1 w-1 rounded-full bg-gold sm:block" />
          <span>Collectible pieces</span>
          <span className="hidden h-1 w-1 rounded-full bg-gold sm:block" />
          <span>Chosen with care</span>
        </div>
      </div>
      <CategoryTiles />
      <FeaturedPieces />
      <Story />
      <section className="bg-burgundy px-6 py-16 text-center text-cream sm:px-10 lg:py-20">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-gold-light">
          Fine · Vintage · Collectible
        </p>
        <h2 className="mx-auto mt-4 max-w-3xl font-heading text-4xl leading-tight tracking-[-0.03em] text-cream sm:text-5xl">
          Find a piece that feels like yours.
        </h2>
        <Link
          href="#collections"
          className="mt-8 inline-flex min-h-12 items-center justify-center border border-gold px-7 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-gold hover:text-burgundy"
        >
          Explore the collection
        </Link>
      </section>
    </div>
  );
}
