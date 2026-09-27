import CartModal from "components/cart/modal";
import { categories } from "lib/categories";
import { Menu } from "lib/shopify/types";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import MobileMenu from "./mobile-menu";
import Search, { SearchSkeleton } from "./search";

const shopAll: Menu = { title: "Shop all", path: "/search" };
const story: Menu = { title: "Our story", path: "/#story" };
const categoryMenu: Menu[] = categories.map((category) => ({
  title: category.title,
  path: category.href,
}));
const mobileMenu: Menu[] = [shopAll, ...categoryMenu, story];

export function Navbar() {
  const shopifyConfigured = Boolean(
    process.env.SHOPIFY_STORE_DOMAIN &&
      process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  );

  return (
    <header>
      <div className="bg-burgundy px-4 py-2 text-center text-cream">
        <p className="font-sans text-[9px] font-medium uppercase tracking-[0.22em] sm:text-[10px]">
          A considered collection of fine, vintage & collectible jewelry
        </p>
      </div>
      <nav className="border-b border-burgundy/10 bg-cream px-4 sm:px-6 lg:px-10">
        <div className="mx-auto flex min-h-[84px] max-w-[1440px] items-center justify-between gap-3 sm:min-h-[92px]">
          <div className="flex items-center gap-3 md:w-[42%]">
            <div className="lg:hidden">
              <Suspense fallback={null}>
                <MobileMenu menu={mobileMenu} />
              </Suspense>
            </div>
            <Link
              href="/"
              aria-label="Rozaya Boutique home"
              className="inline-flex shrink-0 items-center gap-2 sm:gap-3"
            >
              <Image
                src="/brand/monogram.svg"
                alt=""
                width={64}
                height={64}
                priority
                unoptimized
                className="h-11 w-11 shrink-0 sm:h-14 sm:w-14"
              />
              <span className="flex flex-col">
                <span className="font-heading text-[26px] leading-none tracking-[0.055em] text-burgundy sm:text-[34px]">
                  ROZAYA
                </span>
                <span className="mt-1 font-sans text-[10px] font-medium uppercase tracking-[0.32em] text-gold-dark sm:text-[11px]">
                  BOUTIQUE
                </span>
              </span>
            </Link>
            <ul className="ml-5 hidden items-center gap-5 lg:flex xl:gap-7">
              {[shopAll, story].map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.path}
                    className="whitespace-nowrap font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-charcoal/75 underline-offset-8 transition-colors hover:text-burgundy hover:underline"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden w-[34%] justify-center md:flex">
            <Suspense fallback={<SearchSkeleton />}>
              <Search />
            </Suspense>
          </div>

          <div className="flex justify-end md:w-[24%]">
            {shopifyConfigured ? (
              <CartModal />
            ) : (
              <Link
                href="/search"
                className="inline-flex min-h-11 items-center gap-2 font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-burgundy"
              >
                <ShoppingBagIcon className="h-5 w-5" aria-hidden="true" />
                <span className="hidden sm:inline">Shop the edit</span>
                <span className="sm:hidden">Shop</span>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
