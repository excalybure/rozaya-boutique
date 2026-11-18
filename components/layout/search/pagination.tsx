import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import {
  getCatalogPageUrl,
  type CatalogSearchParams,
} from "lib/catalog-pagination";
import Link from "next/link";

const linkClassName =
  "inline-flex min-h-11 w-full items-center justify-center gap-1 border border-burgundy/25 px-2 font-sans text-xs text-burgundy transition-colors hover:bg-burgundy hover:text-cream sm:px-4";

export default function CatalogPagination({
  pathname,
  searchParams,
  page,
  hasNextPage,
}: {
  pathname: string;
  searchParams: CatalogSearchParams;
  page: number;
  hasNextPage: boolean;
}) {
  if (page === 1 && !hasNextPage) return null;

  return (
    <nav
      aria-label="Product pagination"
      className="mt-10 grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-t border-burgundy/15 pt-6 sm:mx-auto sm:max-w-sm"
    >
      <div>
        {page > 1 ? (
          <Link
            href={getCatalogPageUrl(pathname, searchParams, page - 1)}
            rel="prev"
            prefetch={false}
            className={linkClassName}
          >
            <ChevronLeftIcon aria-hidden="true" className="size-3 shrink-0" />
            Previous
          </Link>
        ) : null}
      </div>
      <span aria-current="page" className="font-sans text-xs text-charcoal/75">
        Page {page}
      </span>
      <div>
        {hasNextPage ? (
          <Link
            href={getCatalogPageUrl(pathname, searchParams, page + 1)}
            rel="next"
            prefetch={false}
            className={linkClassName}
          >
            Next
            <ChevronRightIcon aria-hidden="true" className="size-3 shrink-0" />
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
