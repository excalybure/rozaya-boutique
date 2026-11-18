"use client";

import clsx from "clsx";
import type { SortFilterItem } from "lib/constants";
import { createUrl } from "lib/utils";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ListItem, PathFilterItem } from ".";

function PathFilterItem({ item }: { item: PathFilterItem }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = pathname === item.path;
  const newParams = new URLSearchParams(searchParams.toString());
  const DynamicTag = active ? "p" : Link;

  newParams.delete("q");
  newParams.delete("page");

  return (
    <li
      className="mt-2 flex font-sans text-xs text-charcoal/75"
      key={item.title}
    >
      <DynamicTag
        href={createUrl(item.path, newParams)}
        className={clsx(
          "w-full underline-offset-4 hover:text-burgundy hover:underline",
          {
            "underline underline-offset-4": active,
          },
        )}
      >
        {item.title}
      </DynamicTag>
    </li>
  );
}

function SortFilterItem({ item }: { item: SortFilterItem }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get("sort") === item.slug;
  const title =
    !item.slug && (pathname !== "/search" || !searchParams.get("q")?.trim())
      ? "Default order"
      : item.title;
  const newParams = new URLSearchParams(searchParams.toString());
  newParams.delete("page");
  if (item.slug) newParams.set("sort", item.slug);
  else newParams.delete("sort");
  const href = createUrl(pathname, newParams);
  const DynamicTag = active ? "p" : Link;

  return (
    <li
      className="mt-2 flex font-sans text-xs text-charcoal/75"
      key={item.title}
    >
      <DynamicTag
        prefetch={!active ? false : undefined}
        href={href}
        className={clsx(
          "w-full hover:text-burgundy hover:underline hover:underline-offset-4",
          {
            "underline underline-offset-4": active,
          },
        )}
      >
        {title}
      </DynamicTag>
    </li>
  );
}

export function FilterItem({ item }: { item: ListItem }) {
  return "path" in item ? (
    <PathFilterItem item={item} />
  ) : (
    <SortFilterItem item={item} />
  );
}
