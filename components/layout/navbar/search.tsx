"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Form from "next/form";
import { useSearchParams } from "next/navigation";

export default function Search() {
  const searchParams = useSearchParams();

  return (
    <Form
      action="/search"
      className="relative w-full max-w-[550px] lg:w-80 xl:w-full"
    >
      <input
        key={searchParams?.get("q")}
        type="text"
        name="q"
        placeholder="Find a piece..."
        autoComplete="off"
        defaultValue={searchParams?.get("q") || ""}
        aria-label="Search the Rozaya collection"
        className="w-full border border-burgundy/15 bg-cream px-4 py-2.5 pr-10 font-sans text-xs text-charcoal placeholder:text-taupe focus:border-gold"
      />
      <div className="pointer-events-none absolute right-0 top-0 mr-3 flex h-full items-center text-burgundy">
        <MagnifyingGlassIcon className="h-4 w-4" />
      </div>
    </Form>
  );
}

export function SearchSkeleton() {
  return (
    <form className="relative w-full max-w-[550px] lg:w-80 xl:w-full">
      <input
        placeholder="Find a piece..."
        aria-label="Search the Rozaya collection"
        className="w-full border border-burgundy/15 bg-cream px-4 py-2.5 pr-10 font-sans text-xs text-charcoal placeholder:text-taupe"
      />
      <div className="pointer-events-none absolute right-0 top-0 mr-3 flex h-full items-center text-burgundy">
        <MagnifyingGlassIcon className="h-4 w-4" />
      </div>
    </form>
  );
}
