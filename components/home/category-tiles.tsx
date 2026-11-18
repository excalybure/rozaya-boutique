import { categories } from "lib/categories";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import CollectionMenu from "./collection-menu";

export function CategoryTiles() {
  return (
    <section
      id="collections"
      className="scroll-mt-8 bg-cream px-6 py-20 sm:px-10 lg:px-16 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-5 md:mb-14 md:flex-row md:items-end">
          <div>
            <p className="mb-3 font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-gold-dark">
              Find your next favorite
            </p>
            <h2 className="font-heading text-4xl tracking-[-0.03em] text-burgundy sm:text-5xl">
              Shop by category
            </h2>
          </div>
          <p className="max-w-md font-sans text-sm leading-7 text-charcoal/70">
            From daily signatures to pieces that wait for the right moment,
            there is always more than one way to wear a story.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(153px,16%)] lg:gap-7 xl:gap-9">
          <div className="lg:sticky lg:top-6 lg:col-start-2 lg:row-start-1 lg:self-start">
            <Suspense fallback={null}>
              <CollectionMenu />
            </Suspense>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:col-start-1 lg:row-start-1">
            {categories.map((category) => (
              <li key={category.handle}>
                <Link
                  href={category.href}
                  className="group relative block aspect-[4/5] bg-cream-dark md:aspect-square"
                >
                  <div
                    className="pointer-events-none absolute inset-0 overflow-hidden"
                    aria-hidden="true"
                  >
                    <Image
                      src={category.image}
                      alt=""
                      fill
                      // Serve the precompressed WebP tiles without requesting Vercel variants.
                      unoptimized={category.image.endsWith(".webp")}
                      sizes="(min-width: 1440px) 260px, (min-width: 1024px) 19vw, (min-width: 768px) 23vw, 47vw"
                      className={`object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-[1.04] ${category.position}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-burgundy/85 via-burgundy/5 to-transparent" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 px-2.5 pb-3 text-cream [text-shadow:0_1px_3px_#240c0f8c] sm:px-4 sm:pb-4 xl:px-5 xl:pb-5">
                    <h3 className="font-heading text-xl leading-tight text-cream! sm:text-2xl xl:text-[clamp(1.5rem,2.05vw,1.875rem)]">
                      {category.title}
                    </h3>
                    <div className="mt-2 flex min-h-[2.65em] items-start justify-between gap-1 border-t border-cream/40 pt-2 font-sans text-xs leading-snug xl:text-[13px]">
                      <span>{category.description}</span>
                      <span
                        aria-hidden="true"
                        className="font-sans text-lg leading-none text-gold-light motion-safe:transition-transform motion-safe:group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
