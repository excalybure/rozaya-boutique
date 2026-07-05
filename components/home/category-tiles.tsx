import { getCollectionProducts } from "lib/shopify";
import Image from "next/image";
import Link from "next/link";

const categories = [
  { title: "Rings", handle: "rings", href: "/search/rings" },
  { title: "Necklaces", handle: "necklaces", href: "/search/necklaces" },
  { title: "Bracelets", handle: "bracelets", href: "/search/bracelets" },
  { title: "Earrings", handle: "earrings", href: "/search/earrings" },
  { title: "Art Deco", handle: "art-deco", href: "/search/art-deco" },
  { title: "Victorian", handle: "victorian", href: "/search/victorian" },
  { title: "Diamond", handle: "diamond", href: "/search/diamond" },
  { title: "Under $500", handle: "under-500", href: "/search/under-500" },
];

async function getCategoryTiles() {
  return Promise.all(
    categories.map(async (category) => {
      const products = await getCollectionProducts({
        collection: category.handle,
      });

      return {
        ...category,
        image: products[0]?.featuredImage,
      };
    }),
  );
}

export async function CategoryTiles() {
  const tiles = await getCategoryTiles();

  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-center font-heading text-3xl text-burgundy md:text-4xl">
          Shop by Category
        </h2>
        <div className="mx-auto mt-2 h-px w-24 bg-gold" />
        <p className="mb-8 mt-3 text-center font-serif text-lg italic text-taupe">
          Curated collections across eras and styles
        </p>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {tiles.map((tile) => (
            <Link key={tile.handle} href={tile.href} className="block">
              <div className="group relative aspect-square overflow-hidden rounded-md bg-burgundy">
                {tile.image?.url ? (
                  <Image
                    src={tile.image.url}
                    alt={tile.image.altText || tile.title}
                    fill
                    sizes="(min-width: 768px) 25vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : null}
                {tile.image?.url ? (
                  <div className="absolute inset-0 bg-burgundy/40 transition-colors group-hover:bg-burgundy/60" />
                ) : null}
                <div className="absolute inset-0 flex flex-col items-center justify-center px-3 text-center">
                  <span className="font-serif text-lg uppercase tracking-wider text-cream md:text-xl">
                    {tile.title}
                  </span>
                  <div className="mx-auto mt-2 h-px w-8 bg-gold transition-all duration-300 group-hover:w-16" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
