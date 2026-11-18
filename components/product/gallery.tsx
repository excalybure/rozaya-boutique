"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { GridTileImage } from "components/grid/tile";
import { ShopifyImage } from "components/shopify-image";
import { useRouter, useSearchParams } from "next/navigation";

const arrowButtonClassName =
  "group grid size-11 shrink-0 cursor-pointer place-items-center rounded-full text-burgundy";
const arrowCircleClassName =
  "grid size-8 place-items-center rounded-full border border-burgundy/20 transition-colors group-hover:border-burgundy/60 group-hover:bg-cream-dark";

export function Gallery({
  images,
}: {
  images: { src: string; altText: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedIndex = Number(searchParams.get("image") ?? 0);
  const imageIndex =
    Number.isInteger(requestedIndex) &&
    requestedIndex >= 0 &&
    requestedIndex < images.length
      ? requestedIndex
      : 0;
  const selectedImage = images[imageIndex];

  const updateImage = (index: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("image", String(index));
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const nextImageIndex = imageIndex + 1 < images.length ? imageIndex + 1 : 0;
  const previousImageIndex =
    imageIndex === 0 ? images.length - 1 : imageIndex - 1;

  return (
    <section aria-label="Product gallery">
      <div className="relative aspect-square h-full max-h-[550px] w-full overflow-hidden">
        {selectedImage && (
          <ShopifyImage
            className="h-full w-full object-contain"
            fill
            sizes="(min-width: 1024px) 66vw, 100vw"
            alt={selectedImage.altText}
            src={selectedImage.src}
            priority={true}
          />
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-4 mb-8 lg:mb-0">
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => updateImage(previousImageIndex)}
              aria-label="Previous product image"
              className={arrowButtonClassName}
            >
              <span className={arrowCircleClassName}>
                <ChevronLeftIcon className="size-4" aria-hidden="true" />
              </span>
            </button>

            <ul
              role="list"
              aria-label="Product image thumbnails"
              className="flex min-w-0 gap-1 sm:gap-2"
            >
              {images.map((image, index) => {
                const isActive = index === imageIndex;

                return (
                  <li key={image.src} className="w-20 min-w-0">
                    <button
                      type="button"
                      onClick={() => updateImage(index)}
                      aria-label={`Select product image ${index + 1}`}
                      aria-pressed={isActive}
                      className="block aspect-square w-full cursor-pointer"
                    >
                      <GridTileImage
                        alt=""
                        src={image.src}
                        width={80}
                        height={80}
                        active={isActive}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>

            <button
              type="button"
              onClick={() => updateImage(nextImageIndex)}
              aria-label="Next product image"
              className={arrowButtonClassName}
            >
              <span className={arrowCircleClassName}>
                <ChevronRightIcon className="size-4" aria-hidden="true" />
              </span>
            </button>
          </div>
          <p
            role="status"
            className="mt-2 text-center text-xs tracking-wider text-burgundy/80 tabular-nums"
          >
            <span className="sr-only">
              Photo {imageIndex + 1} of {images.length}
            </span>
            <span aria-hidden="true">
              {imageIndex + 1} / {images.length}
            </span>
          </p>
        </div>
      )}
    </section>
  );
}
