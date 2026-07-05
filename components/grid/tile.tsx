import clsx from "clsx";
import type { Product } from "lib/shopify/types";
import Image from "next/image";
import Price from "../price";
import Label from "../label";

type ProductCardProduct = Product & {
  collections?:
    | { edges?: Array<{ node?: { handle?: string; path?: string } | null }> }
    | Array<{ handle?: string; path?: string }>;
};

type LabelProps = {
  title: string;
  amount: string;
  currencyCode: string;
  compareAtAmount?: string | null;
  position?: "bottom" | "center";
};

function getCompareAtPrice(
  product: ProductCardProduct | undefined,
  label: LabelProps | undefined,
) {
  const currentAmount = Number.parseFloat(label?.amount ?? "");
  const labelCompareAtAmount = Number.parseFloat(label?.compareAtAmount ?? "");

  if (
    Number.isFinite(labelCompareAtAmount) &&
    Number.isFinite(currentAmount) &&
    labelCompareAtAmount > currentAmount
  ) {
    return label?.compareAtAmount ?? null;
  }

  const variants = product?.variants as
    | Array<{
        price?: { amount?: string } | null;
        compareAtPrice?: { amount?: string } | null;
      }>
    | undefined;

  const discountedVariant = variants?.find((variant) => {
    const price = Number.parseFloat(variant.price?.amount ?? "");
    const compareAtPrice = Number.parseFloat(
      variant.compareAtPrice?.amount ?? "",
    );

    return (
      Number.isFinite(price) &&
      Number.isFinite(compareAtPrice) &&
      compareAtPrice > price
    );
  });

  return discountedVariant?.compareAtPrice?.amount ?? null;
}

function getMetafield(product: ProductCardProduct | undefined, key: string) {
  return (
    product?.metafields
      ?.find((metafield) => metafield?.key === key)
      ?.value?.trim() || null
  );
}

function formatTagValue(value: string) {
  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatCirca(value: string) {
  const normalizedValue = value.replace(/^c\.?\s*/i, "").trim();

  return `c. ${normalizedValue}`;
}

function getOfferBadge(product: ProductCardProduct | undefined) {
  const offerTag = product?.tags.find(
    (tag) => tag === "style:signed" || tag === "style:collectible",
  );

  return offerTag ? formatTagValue(offerTag.split(":")[1] ?? "") : null;
}

function getBrowseSimilarHref(product: ProductCardProduct | undefined) {
  const collections = product?.collections;

  if (Array.isArray(collections)) {
    const collection = collections[0];

    if (collection?.path) return collection.path;
    if (collection?.handle) return `/search/${collection.handle}`;
  }

  if (collections && !Array.isArray(collections)) {
    const collectionEdge = collections.edges?.[0]?.node;

    if (collectionEdge?.path) return collectionEdge.path;
    if (collectionEdge?.handle) return `/search/${collectionEdge.handle}`;
  }

  const categoryTag = product?.tags.find((tag) =>
    [
      "ring",
      "necklace",
      "bracelet",
      "earrings",
      "brooch",
      "charm",
      "pendant",
      "cufflinks",
      "watch",
      "pin",
      "bangle",
      "chain",
    ].includes(tag),
  );

  return categoryTag ? `/search/${categoryTag}s` : null;
}

export function GridTileImage({
  isInteractive = true,
  active,
  label,
  product,
  ...props
}: {
  isInteractive?: boolean;
  active?: boolean;
  label?: LabelProps;
  product?: ProductCardProduct;
} & React.ComponentProps<typeof Image>) {
  const compareAtPrice = getCompareAtPrice(product, label);
  const priceAmount = Number.parseFloat(label?.amount ?? "");
  const compareAtAmount = Number.parseFloat(compareAtPrice ?? "");
  const discountPercentage =
    Number.isFinite(priceAmount) &&
    Number.isFinite(compareAtAmount) &&
    compareAtAmount > priceAmount
      ? Math.round(((compareAtAmount - priceAmount) / compareAtAmount) * 100)
      : null;
  const offerBadge = getOfferBadge(product);
  const era = getMetafield(product, "era");
  const circa = getMetafield(product, "circa");
  const eraSubtitle = [
    era ? formatTagValue(era) : null,
    circa ? formatCirca(circa) : null,
  ]
    .filter(Boolean)
    .join(" • ");
  const browseSimilarHref = getBrowseSimilarHref(product);
  const image = props.src ? (
    <div
      className={clsx("relative w-full overflow-hidden bg-cream", {
        "aspect-square": label,
        "h-full": !label,
      })}
    >
      <Image
        className={clsx("relative h-full w-full object-cover", {
          "transition-transform duration-500 group-hover:scale-105":
            isInteractive,
        })}
        {...props}
      />

      {discountPercentage ? (
        <div className="absolute left-3 top-3 rounded bg-burgundy px-2 py-1 text-xs uppercase tracking-wide text-cream shadow-sm">
          {discountPercentage}% Off
        </div>
      ) : null}

      {offerBadge ? (
        <div className="absolute right-3 top-3 rounded bg-gold px-2 py-1 text-xs uppercase tracking-wide text-charcoal shadow-sm">
          {offerBadge}
        </div>
      ) : null}
    </div>
  ) : null;

  if (product && label) {
    return (
      <div
        className={clsx(
          "group w-full overflow-hidden rounded-md border border-burgundy/10 bg-cream shadow-sm transition-all duration-300 hover:border-burgundy/25 hover:shadow-md",
          {
            "border-burgundy/40": active,
          },
        )}
      >
        {image}

        <div className="space-y-1 p-4">
          <h3 className="line-clamp-2 font-serif text-sm leading-snug text-charcoal md:text-base">
            {label.title}
          </h3>

          {eraSubtitle ? (
            <p className="text-xs italic text-taupe">{eraSubtitle}</p>
          ) : null}

          <div className="flex items-baseline">
            <Price
              amount={label.amount}
              className="text-sm font-medium text-burgundy md:text-base"
              currencyCode={label.currencyCode}
              currencyCodeClassName="hidden"
            />

            {compareAtPrice ? (
              <Price
                amount={compareAtPrice}
                className="ml-2 text-xs text-taupe line-through"
                currencyCode={label.currencyCode}
                currencyCodeClassName="hidden"
              />
            ) : null}
          </div>

          {browseSimilarHref ? (
            <span className="block text-xs uppercase tracking-wider text-gold opacity-0 transition-opacity group-hover:opacity-100">
              Browse Similar
            </span>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "group flex h-full w-full items-center justify-center overflow-hidden rounded-lg border bg-white hover:border-blue-600 dark:bg-black",
        {
          relative: label,
          "border-2 border-blue-600": active,
          "border-neutral-200 dark:border-neutral-800": !active,
        },
      )}
    >
      {props.src ? (
        <Image
          className={clsx("relative h-full w-full object-contain", {
            "transition duration-300 ease-in-out group-hover:scale-105":
              isInteractive,
          })}
          {...props}
        />
      ) : null}
      {label ? (
        <Label
          title={label.title}
          amount={label.amount}
          currencyCode={label.currencyCode}
          position={label.position}
        />
      ) : null}
    </div>
  );
}
