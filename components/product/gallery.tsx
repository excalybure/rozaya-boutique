"use client";

import {
  ArrowsPointingOutIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { GridTileImage } from "components/grid/tile";
import { ShopifyImage } from "components/shopify-image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { PhotoLightbox, type GalleryPhoto } from "./photo-lightbox";

// The thumbnail strip shows at most this many thumbnails at once and scrolls
// horizontally for the rest. "Desktop" starts at the `sm` breakpoint, where the
// thumbnail gap also widens.
const phoneThumbnailCount = 5;
const desktopThumbnailCount = 6;

const arrowButtonClassName =
  "group grid size-11 shrink-0 cursor-pointer place-items-center rounded-full text-burgundy";
const arrowCircleClassName =
  "grid size-8 place-items-center rounded-full border border-burgundy/20 transition-colors group-hover:border-burgundy/60 group-hover:bg-cream-dark";

export function Gallery({ images }: { images: GalleryPhoto[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const openButton = useRef<HTMLButtonElement>(null);
  const thumbnailList = useRef<HTMLUListElement>(null);
  const hasPositionedThumbnails = useRef(false);
  const [lightboxStart, setLightboxStart] = useState<number | null>(null);
  const requestedIndex = Number(searchParams.get("image") ?? 0);
  const imageIndex =
    Number.isInteger(requestedIndex) &&
    requestedIndex >= 0 &&
    requestedIndex < images.length
      ? requestedIndex
      : 0;
  const selectedImage = images[imageIndex];

  // Keep the selected thumbnail visible when the photo changes from the arrows,
  // the lightbox or the URL. Only the strip scrolls, never the page. The first
  // positioning (e.g. a shared `?image=` link) jumps instead of animating.
  useEffect(() => {
    const list = thumbnailList.current;
    const thumbnail = list?.children[imageIndex];
    if (!list || !thumbnail) return;

    const isFirstPosition = !hasPositionedThumbnails.current;
    hasPositionedThumbnails.current = true;

    const listRect = list.getBoundingClientRect();
    const thumbnailRect = thumbnail.getBoundingClientRect();
    const offset =
      thumbnailRect.left < listRect.left
        ? thumbnailRect.left - listRect.left
        : thumbnailRect.right > listRect.right
          ? thumbnailRect.right - listRect.right
          : 0;
    if (offset === 0) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    list.scrollBy({
      left: offset,
      behavior: isFirstPosition || reduceMotion ? "instant" : "smooth",
    });
  }, [imageIndex]);

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
      {selectedImage ? (
        <button
          ref={openButton}
          type="button"
          aria-haspopup="dialog"
          aria-label="Enlarge photo"
          onClick={() => setLightboxStart(imageIndex)}
          className="relative block aspect-square h-full max-h-[550px] w-full cursor-zoom-in overflow-hidden"
        >
          <ShopifyImage
            className="h-full w-full object-contain"
            fill
            sizes="(min-width: 1024px) 66vw, 100vw"
            alt={selectedImage.altText}
            src={selectedImage.src}
            priority={true}
          />
          <span className="absolute right-3 bottom-3 inline-flex min-h-9 items-center gap-2 bg-cream px-3 text-xs text-burgundy shadow-sm">
            <ArrowsPointingOutIcon className="size-4" aria-hidden="true" />
            Enlarge photo
          </span>
        </button>
      ) : (
        <div className="relative aspect-square h-full max-h-[550px] w-full overflow-hidden" />
      )}

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
              ref={thumbnailList}
              role="list"
              aria-label="Product image thumbnails"
              className="flex max-w-[calc(var(--thumbs)_*_5rem_+_(var(--thumbs)_-_1)_*_var(--thumb-gap))] min-w-0 flex-1 snap-x snap-mandatory gap-(--thumb-gap) overflow-x-auto overscroll-x-contain [scrollbar-width:thin] [--thumb-gap:0.25rem] [--thumbs:var(--thumbs-phone)] sm:[--thumb-gap:0.5rem] sm:[--thumbs:var(--thumbs-desktop)]"
              style={
                {
                  "--thumbs-phone": Math.min(
                    images.length,
                    phoneThumbnailCount,
                  ),
                  "--thumbs-desktop": Math.min(
                    images.length,
                    desktopThumbnailCount,
                  ),
                } as CSSProperties
              }
            >
              {images.map((image, index) => {
                const isActive = index === imageIndex;

                return (
                  <li
                    key={image.src}
                    className="w-[calc((100%_-_(var(--thumbs)_-_1)_*_var(--thumb-gap))_/_var(--thumbs))] shrink-0 snap-start"
                  >
                    <button
                      type="button"
                      onClick={() => updateImage(index)}
                      aria-label={`Select product image ${index + 1}`}
                      aria-pressed={isActive}
                      className="block aspect-square w-full cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gold"
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
      {lightboxStart !== null && (
        <PhotoLightbox
          images={images}
          initialIndex={lightboxStart}
          onClose={(index) => {
            setLightboxStart(null);
            if (index !== imageIndex) updateImage(index);
            openButton.current?.focus({ preventScroll: true });
          }}
        />
      )}
    </section>
  );
}
