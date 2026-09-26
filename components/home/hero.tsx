import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="grid bg-cream md:min-h-[660px] md:grid-cols-[1fr_0.92fr]">
      <div className="flex flex-col justify-center px-6 py-16 sm:px-10 md:px-14 lg:px-20 lg:py-24">
        <p className="mb-6 font-sans text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-dark">
          Fine · Vintage · Collectible
        </p>
        <h1 className="max-w-2xl font-heading text-5xl leading-[1.04] tracking-[-0.04em] text-burgundy sm:text-6xl lg:text-7xl">
          Jewelry with a life of its own.
        </h1>
        <p className="mt-7 max-w-lg font-sans text-sm leading-7 text-charcoal/75 sm:text-base sm:leading-8">
          A considered collection of fine, vintage and collectible pieces,
          chosen for their character, craftsmanship and the stories they carry.
        </p>
        <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Link
            href="#collections"
            className="inline-flex min-h-12 items-center justify-center bg-burgundy px-7 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-burgundy-light"
          >
            Explore the collection
          </Link>
          <Link
            href="#story"
            className="inline-flex min-h-12 items-center font-sans text-xs font-semibold uppercase tracking-[0.16em] text-burgundy underline decoration-gold underline-offset-8 transition-colors hover:text-gold-dark"
          >
            The Rozaya point of view
          </Link>
        </div>
        <div className="mt-14 flex items-center gap-4 border-t border-burgundy/15 pt-5">
          <span className="h-px w-10 bg-gold" />
          <p className="font-serif text-lg italic text-taupe">
            Made to be found. Chosen to be kept.
          </p>
        </div>
      </div>

      <div className="relative min-h-[470px] overflow-hidden sm:min-h-[580px] md:min-h-full">
        <Image
          src="/images/hero-necklace.jpg"
          alt="A delicate gold necklace worn with a linen top"
          fill
          priority
          sizes="(min-width: 768px) 48vw, 100vw"
          className="object-cover object-[center_48%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-burgundy/35 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6 border-l border-gold pl-4 text-cream sm:bottom-10 sm:left-10">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.24em]">
            The Rozaya edit
          </p>
          <p className="mt-1 font-heading text-xl italic sm:text-2xl">
            Keep what moves you.
          </p>
        </div>
      </div>
    </section>
  );
}
