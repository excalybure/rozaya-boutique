import { AddToCart } from "components/cart/add-to-cart";
import Price from "components/price";
import Prose from "components/prose";
import { Product } from "lib/shopify/types";
import type { ReactNode } from "react";
import { VariantSelector } from "./variant-selector";

export function ProductDescription({
  children,
  product,
}: {
  children?: ReactNode;
  product: Product;
}) {
  return (
    <>
      <div className="mb-6 flex flex-col border-b border-burgundy/15 pb-6">
        <h1 className="mb-3 font-heading text-4xl leading-tight text-burgundy sm:text-5xl">
          {product.title}
        </h1>
        <div className="w-fit font-serif text-2xl text-burgundy">
          <Price
            amount={product.priceRange.maxVariantPrice.amount}
            currencyCode={product.priceRange.maxVariantPrice.currencyCode}
          />
        </div>
      </div>
      <VariantSelector options={product.options} variants={product.variants} />
      {product.descriptionHtml ? (
        <Prose
          className="mb-6"
          html={product.descriptionHtml}
        />
      ) : null}
      {children}
      <AddToCart product={product} />
    </>
  );
}
