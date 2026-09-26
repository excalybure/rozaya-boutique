import Image from "next/image";
import Link from "next/link";

export function Story() {
  return (
    <section id="story" className="scroll-mt-8 bg-cream-dark">
      <div className="mx-auto grid max-w-7xl md:grid-cols-[0.9fr_1.1fr]">
        <div className="relative min-h-[430px] md:min-h-[640px]">
          <Image
            src="/images/gold-bracelet.jpg"
            alt="A gold bracelet and rings worn in soft natural light"
            fill
            sizes="(min-width: 768px) 42vw, 100vw"
            className="object-cover object-[center_45%]"
          />
          <div className="absolute bottom-6 left-6 border-l border-gold pl-4 text-cream sm:bottom-10 sm:left-10">
            <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.24em]">
              The Rozaya point of view
            </p>
            <p className="mt-1 font-serif text-lg italic">
              Personal, never precious.
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-center px-6 py-16 sm:px-10 md:px-14 lg:px-20">
          <p className="mb-4 font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-gold-dark">
            A more personal way to collect
          </p>
          <h2 className="max-w-xl font-heading text-4xl leading-tight tracking-[-0.03em] text-burgundy sm:text-5xl">
            The best pieces feel like they already belong to you.
          </h2>
          <p className="mt-6 max-w-xl font-sans text-sm leading-7 text-charcoal/75 sm:text-base sm:leading-8">
            Rozaya brings together jewelry across eras and styles: enduring
            essentials, vintage discoveries and distinctive finds. We look for
            thoughtful details and lasting character, then let each piece speak
            for itself.
          </p>
          <Link
            href="/search/victorian"
            className="mt-8 inline-flex w-fit items-center gap-3 border-b border-gold pb-2 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-burgundy transition-colors hover:text-gold-dark"
          >
            Discover vintage finds <span aria-hidden="true">→</span>
          </Link>

          <div className="mt-12 grid grid-cols-1 gap-6 border-t border-burgundy/15 pt-7 sm:grid-cols-3 sm:gap-5">
            <div>
              <p className="font-serif text-2xl italic text-burgundy">01</p>
              <p className="mt-2 font-sans text-xs leading-5 text-charcoal/70">
                Chosen for character
              </p>
            </div>
            <div>
              <p className="font-serif text-2xl italic text-burgundy">02</p>
              <p className="mt-2 font-sans text-xs leading-5 text-charcoal/70">
                Made to live in
              </p>
            </div>
            <div>
              <p className="font-serif text-2xl italic text-burgundy">03</p>
              <p className="mt-2 font-sans text-xs leading-5 text-charcoal/70">
                Worth keeping close
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
