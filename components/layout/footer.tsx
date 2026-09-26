import { categories } from "lib/categories";
import Link from "next/link";

const shopLinks = [
  { title: "Shop all jewelry", href: "/search" },
  ...categories.map((category) => ({
    title: category.title,
    href: category.href,
  })),
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-burgundy text-cream">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-14 sm:px-10 md:grid-cols-[1.2fr_0.8fr_0.8fr] md:gap-16 lg:px-16 lg:py-20">
        <div>
          <Link href="/" className="inline-flex flex-col">
            <span className="font-heading text-3xl tracking-[0.1em] text-gold-light">
              ROZAYA
            </span>
            <span className="mt-1 font-sans text-[9px] uppercase tracking-[0.34em] text-cream/75">
              Boutique · Fine · Vintage · Collectible
            </span>
          </Link>
          <p className="mt-6 max-w-sm font-serif text-lg leading-7 text-cream/75">
            A considered collection for people who choose with feeling and keep
            what they love.
          </p>
        </div>

        <div>
          <h2 className="font-sans text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-light">
            Explore
          </h2>
          <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-1 xl:grid-cols-2">
            {shopLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-sans text-sm text-cream/75 transition-colors hover:text-gold-light"
                >
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-sans text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-light">
            Rozaya
          </h2>
          <ul className="mt-5 space-y-3">
            <li>
              <Link
                href="/#story"
                className="font-sans text-sm text-cream/75 transition-colors hover:text-gold-light"
              >
                Our point of view
              </Link>
            </li>
            <li>
              <Link
                href="/#collections"
                className="font-sans text-sm text-cream/75 transition-colors hover:text-gold-light"
              >
                The collection
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/15 px-6 py-5 sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 font-sans text-[10px] uppercase tracking-[0.16em] text-cream/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Rozaya Boutique. All rights reserved.</p>
          <p>Made for a life well adorned.</p>
        </div>
      </div>
    </footer>
  );
}
