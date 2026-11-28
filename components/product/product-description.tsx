import { AddToCart } from "components/cart/add-to-cart";
import Price from "components/price";
import Prose from "components/prose";
import { ReturnPolicyNotice } from "components/return-policy-notice";
import { getProductCondition } from "lib/merchant/feed";
import { Product } from "lib/shopify/types";
import type { ReactNode } from "react";
import { SoldBadge } from "./sold-badge";
import { VariantSelector } from "./variant-selector";

const CONDITION_LABELS = {
  new: "New",
  used: "Pre-owned",
  refurbished: "Refurbished",
};

export function ProductDescription({
  children,
  product,
}: {
  children?: ReactNode;
  product: Product;
}) {
  const condition = getProductCondition(product.tags);
  return (
    <>
      <div className="mb-6 flex flex-col border-b border-burgundy/15 pb-6">
        {!product.availableForSale ? (
          <div className="mb-3">
            <SoldBadge />
          </div>
        ) : null}
        <h1 className="mb-3 font-heading text-4xl leading-tight text-burgundy sm:text-5xl">
          {product.title}
        </h1>
        <div className="w-fit font-serif text-2xl text-burgundy">
          <Price
            amount={product.priceRange.maxVariantPrice.amount}
            currencyCode={product.priceRange.maxVariantPrice.currencyCode}
          />
        </div>
        {condition ? (
          <p className="mt-3 text-sm text-taupe">
            Condition: {CONDITION_LABELS[condition]}
          </p>
        ) : null}
      </div>
      {product.availableForSale ? (
        <VariantSelector
          options={product.options}
          variants={product.variants}
        />
      ) : null}
      {product.descriptionHtml ? (
        <Prose className="mb-6" html={product.descriptionHtml} />
      ) : null}
      {children}
      <div className="space-y-3">
        {product.availableForSale ? <ReturnPolicyNotice /> : null}
        <AddToCart product={product} />
      </div>
    </>
  );
}
