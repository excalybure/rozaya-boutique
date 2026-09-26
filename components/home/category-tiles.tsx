import { categories } from "lib/categories";
import Image from "next/image";
import Link from "next/link";

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

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          {categories.map((category) => (
            <Link
              key={category.handle}
              href={category.href}
              className="group relative block aspect-[4/5] overflow-hidden bg-cream-dark lg:aspect-square"
            >
              <Image
                src={category.image}
                alt=""
                fill
                sizes="(min-width: 1024px) 24vw, 48vw"
                className={`object-cover transition-transform duration-700 group-hover:scale-[1.04] ${category.position}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-burgundy/85 via-burgundy/5 to-transparent transition-opacity duration-500 group-hover:from-burgundy/90" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-cream sm:p-6 lg:p-7">
                <span className="font-sans text-[9px] tracking-[0.22em] text-gold-light sm:text-[10px]">
                  {category.number} / ROZAYA
                </span>
                <h3 className="mt-2 font-heading text-xl text-cream sm:text-2xl lg:text-3xl">
                  {category.title}
                </h3>
                <div className="mt-3 flex items-center justify-between border-t border-cream/35 pt-3">
                  <span className="font-sans text-[11px] text-cream/80 sm:text-xs">
                    {category.description}
                  </span>
                  <span
                    aria-hidden="true"
                    className="translate-x-0 font-sans text-lg text-gold-light transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
