"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { addItem } from "components/cart/actions";
import type { Product } from "lib/shopify/types";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { useCart } from "./cart-context";

function SubmitButton({
  isSold,
  hasSelection,
}: {
  isSold: boolean;
  hasSelection: boolean;
}) {
  const buttonClasses =
    "relative flex min-h-14 w-full items-center justify-center bg-burgundy px-5 py-4 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-cream transition-colors";
  const disabledClasses = "cursor-not-allowed opacity-50 hover:bg-burgundy";

  if (isSold) {
    return (
      <button
        type="button"
        disabled
        className={clsx(buttonClasses, disabledClasses)}
      >
        Sold
      </button>
    );
  }

  if (!hasSelection) {
    return (
      <button
        aria-label="Please select an option"
        disabled
        className={clsx(buttonClasses, disabledClasses)}
      >
        <div className="absolute left-0 ml-4">
          <PlusIcon className="h-5" />
        </div>
        Add To Cart
      </button>
    );
  }

  return (
    <button
      aria-label="Add to cart"
      className={clsx(buttonClasses, {
        "hover:bg-burgundy-light": true,
      })}
    >
      <div className="absolute left-0 ml-4">
        <PlusIcon className="h-5" />
      </div>
      Add To Cart
    </button>
  );
}

export function AddToCart({ product }: { product: Product }) {
  const { variants, availableForSale } = product;
  const { addCartItem } = useCart();
  const searchParams = useSearchParams();
  const [message, formAction] = useActionState(addItem, null);

  const variant =
    variants.length === 1
      ? variants[0]
      : variants.find((variant) =>
          variant.selectedOptions.every(
            (option) =>
              option.value === searchParams.get(option.name.toLowerCase()),
          ),
        );

  if (!availableForSale || variant?.availableForSale === false) {
    return <SubmitButton isSold hasSelection={Boolean(variant)} />;
  }

  return (
    <form
      action={async () => {
        if (!variant?.availableForSale) return;

        addCartItem(variant, product);
        formAction(variant.id);
      }}
    >
      <SubmitButton isSold={false} hasSelection={Boolean(variant)} />
      <p
        className={message ? "mt-2 text-sm text-burgundy" : "sr-only"}
        role="status"
      >
        {message}
      </p>
    </form>
  );
}
