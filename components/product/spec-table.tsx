"use client";

import type { ProductMetafield } from "lib/shopify/types";

type SpecTableProps = {
  metafields?: ProductMetafield[] | null;
};

const labels: Record<string, string> = {
  metal: "Metal",
  primary_stone: "Primary Stone",
  carat_total: "Total Carat Weight",
  era: "Era",
  circa: "Circa",
  maker: "Maker",
  provenance: "Provenance",
};

const tableKeys = [
  "metal",
  "primary_stone",
  "carat_total",
  "era",
  "circa",
  "maker",
];

function formatSlug(value: string) {
  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatValue(key: string, value: string) {
  if (key === "carat_total") {
    return `${value} ct`;
  }

  if (key === "metal" || key === "primary_stone" || key === "era") {
    return formatSlug(value);
  }

  if (key === "maker" && value === "unknown") {
    return "Unknown";
  }

  return value;
}

export function SpecTable({ metafields }: SpecTableProps) {
  const populatedMetafields = (metafields ?? []).filter(
    (metafield): metafield is NonNullable<ProductMetafield> =>
      Boolean(metafield?.value?.trim()),
  );

  const tableRows = tableKeys
    .map((key) =>
      populatedMetafields.find((metafield) => metafield.key === key),
    )
    .filter((metafield): metafield is NonNullable<ProductMetafield> =>
      Boolean(metafield),
    );
  const provenance = populatedMetafields.find(
    (metafield) => metafield.key === "provenance",
  );

  if (!tableRows.length && !provenance) {
    return null;
  }

  return (
    <div className="mb-6 rounded-lg border border-burgundy/15 bg-cream-dark/40 p-6">
      <h3 className="mb-4 font-heading text-2xl text-burgundy">Details</h3>

      {tableRows.length ? (
        <dl className="divide-y divide-burgundy/10">
          {tableRows.map((metafield) => (
            <div
              className="grid grid-cols-[minmax(7rem,40%)_1fr] gap-4 py-3 first:pt-0 last:pb-0"
              key={metafield.key}
            >
              <dt className="text-sm font-semibold tracking-wide text-taupe [font-variant-caps:all-small-caps]">
                {labels[metafield.key]}
              </dt>
              <dd className="font-serif text-base leading-6 text-charcoal">
                {formatValue(metafield.key, metafield.value)}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {provenance ? (
        <div className="mt-5 border-t border-burgundy/10 pt-5">
          <p className="mb-2 text-sm font-semibold tracking-wide text-taupe [font-variant-caps:all-small-caps]">
            {labels.provenance}
          </p>
          <p className="font-serif text-base italic leading-7 text-charcoal">
            {provenance.value}
          </p>
        </div>
      ) : null}
    </div>
  );
}
