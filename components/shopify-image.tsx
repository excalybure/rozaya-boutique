"use client";

import Image, { type ImageLoader, type ImageProps } from "next/image";

const shopifyImageLoader: ImageLoader = ({ src, width }) => {
  const url = new URL(src);
  url.searchParams.set("width", String(width));
  return url.href;
};

export function ShopifyImage({ src, ...props }: Omit<ImageProps, "loader">) {
  const isShopifyCdn =
    typeof src === "string" && src.startsWith("https://cdn.shopify.com/");

  // Keep Next.js responsive sizes, but let Shopify do the resizing.
  return (
    <Image
      {...props}
      src={src}
      loader={isShopifyCdn ? shopifyImageLoader : undefined}
    />
  );
}
