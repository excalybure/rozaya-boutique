"use client";

import {
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import type { Filter, FilterInput, FilterValue } from "lib/shopify/types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const initialValueCount = 8;

function normalizeInput(input: FilterInput): Record<string, unknown> | null {
  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? parsed
        : null;
    } catch {
      return null;
    }
  }

  return input && typeof input === "object" && !Array.isArray(input)
    ? input
    : null;
}

function getFilterParam(value: FilterValue) {
  const input = normalizeInput(value.input);

  if (!input) return null;

  if (typeof input.tag === "string") {
    return {
      key: "filter.p.tag",
      value: input.tag,
    };
  }

  if (
    input.productMetafield &&
    typeof input.productMetafield === "object" &&
    !Array.isArray(input.productMetafield)
  ) {
    const metafield = input.productMetafield as Record<string, unknown>;

    if (
      typeof metafield.namespace === "string" &&
      typeof metafield.key === "string" &&
      typeof metafield.value === "string"
    ) {
      return {
        key: `filter.p.m.${metafield.namespace}.${metafield.key}`,
        value: metafield.value,
      };
    }
  }

  if (typeof input.productType === "string") {
    return {
      key: "filter.p.product_type",
      value: input.productType,
    };
  }

  if (typeof input.vendor === "string") {
    return {
      key: "filter.p.vendor",
      value: input.vendor,
    };
  }

  return null;
}

function isChecked(searchParams: URLSearchParams, value: FilterValue) {
  const param = getFilterParam(value);

  if (!param) return false;

  return searchParams.getAll(param.key).includes(param.value);
}

function FilterGroup({ filter }: { filter: Filter }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const visibleValues = showAll
    ? filter.values
    : filter.values.slice(0, initialValueCount);

  function toggleValue(value: FilterValue) {
    const param = getFilterParam(value);

    if (!param) return;

    const params = new URLSearchParams(searchParams.toString());
    const values = params.getAll(param.key);
    const nextValues = values.includes(param.value)
      ? values.filter((currentValue) => currentValue !== param.value)
      : [...values, param.value];

    params.delete(param.key);
    nextValues.forEach((nextValue) => params.append(param.key, nextValue));

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="border-b border-burgundy/10 py-4 first:pt-0">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 text-left"
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="text-xs font-medium uppercase tracking-widest text-taupe">
          {filter.label}
        </span>
        {isOpen ? (
          <ChevronUpIcon className="h-4 w-4 text-taupe" />
        ) : (
          <ChevronDownIcon className="h-4 w-4 text-taupe" />
        )}
      </button>

      {isOpen ? (
        <div className="mt-3 space-y-2">
          {visibleValues.map((value) => {
            const param = getFilterParam(value);

            if (!param) return null;

            return (
              <label
                key={value.id}
                className="flex cursor-pointer items-center gap-2 font-serif text-sm leading-5 text-charcoal"
              >
                <input
                  type="checkbox"
                  checked={isChecked(searchParams, value)}
                  onChange={() => toggleValue(value)}
                  className="h-4 w-4 rounded border-burgundy/20 bg-cream accent-burgundy"
                />
                <span className="flex-1">{value.label}</span>
                <span className="text-xs text-taupe">({value.count})</span>
              </label>
            );
          })}

          {filter.values.length > initialValueCount ? (
            <button
              type="button"
              className="pt-1 text-xs uppercase tracking-wider text-gold"
              onClick={() => setShowAll((current) => !current)}
            >
              {showAll ? "Show less" : "Show more"}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function FilterPanel({ filters }: { filters: Filter[] }) {
  return (
    <>
      <h3 className="mb-6 font-heading text-lg uppercase tracking-wider text-burgundy">
        Refine
      </h3>
      <div>
        {filters.map((filter) => (
          <FilterGroup key={filter.id} filter={filter} />
        ))}
      </div>
    </>
  );
}

export default function Filters({ filters }: { filters: Filter[] }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const usableFilters = useMemo(
    () =>
      filters
        .map((filter) => ({
          ...filter,
          values: filter.values.filter((value) => getFilterParam(value)),
        }))
        .filter((filter) => filter.values.length > 0),
    [filters],
  );

  useEffect(() => {
    console.log(
      "Shopify filter inputs",
      filters.map((filter) => ({
        label: filter.label,
        values: filter.values.map((value) => value.input),
      })),
    );
  }, [filters]);

  if (!usableFilters.length) return null;

  return (
    <>
      <button
        type="button"
        className="mb-4 inline-flex items-center justify-center rounded border border-burgundy/20 bg-cream px-4 py-2 font-sans text-xs uppercase tracking-wider text-burgundy md:hidden"
        onClick={() => setIsDrawerOpen(true)}
      >
        Filters
      </button>

      <aside className="hidden w-64 flex-shrink-0 border-r border-burgundy/10 pr-6 md:block">
        <FilterPanel filters={usableFilters} />
      </aside>

      {isDrawerOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-charcoal/40"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] overflow-y-auto bg-cream p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-heading text-lg uppercase tracking-wider text-burgundy">
                Refine
              </h3>
              <button
                type="button"
                aria-label="Close filters"
                onClick={() => setIsDrawerOpen(false)}
                className="rounded p-1 text-burgundy"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div>
              {usableFilters.map((filter) => (
                <FilterGroup key={filter.id} filter={filter} />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
