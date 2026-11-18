"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

export type GalleryPhoto = {
  src: string;
  altText: string;
  width?: number | null;
  height?: number | null;
};

const controlClass =
  "inline-flex h-11 shrink-0 items-center justify-center border border-white/30 hover:bg-white/10";

export function PhotoLightbox({
  images,
  initialIndex,
  onClose,
}: {
  images: GalleryPhoto[];
  initialIndex: number;
  onClose: (index: number) => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);
  const [loadState, setLoadState] = useState<"loading" | "loaded" | "failed">(
    "loading",
  );
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const photo = images[index];

  useEffect(() => {
    const modal = dialog.current;
    if (modal && !modal.open) {
      modal.showModal();
      closeButton.current?.focus();
    }
  }, []);

  useLayoutEffect(() => {
    const frame = viewport.current;
    if (!frame) return;
    frame.scrollLeft = zoomed ? (frame.scrollWidth - frame.clientWidth) / 2 : 0;
    frame.scrollTop = zoomed
      ? (frame.scrollHeight - frame.clientHeight) / 2
      : 0;
  }, [index, zoomed]);

  function step(direction: number) {
    if (images.length < 2) return;
    setZoomed(false);
    setLoadState("loading");
    setIndex(
      (current) => (current + direction + images.length) % images.length,
    );
  }

  if (!photo) return null;

  return (
    <dialog
      ref={dialog}
      data-product-photo-lightbox=""
      aria-labelledby={titleId}
      className="m-auto h-dvh max-h-none w-full max-w-none grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden bg-[#211418] p-0 text-cream shadow-2xl open:grid backdrop:bg-[#160a0d]/90 sm:h-[calc(100dvh-2rem)] sm:w-[calc(100%-2rem)] sm:max-w-[1120px]"
      onClose={() => onClose(index)}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
      onKeyDown={(event) => {
        if (zoomed || (event.key !== "ArrowLeft" && event.key !== "ArrowRight"))
          return;
        event.preventDefault();
        step(event.key === "ArrowRight" ? 1 : -1);
      }}
    >
      <header className="flex items-center gap-2 border-b border-white/15 px-3 py-2.5 sm:gap-3 sm:px-4">
        <h2
          id={titleId}
          className="min-w-0 flex-1 text-lg text-cream sm:text-[22px]"
        >
          Photo detail
        </h2>
        <button
          type="button"
          disabled={loadState !== "loaded"}
          className={`${controlClass} px-2 text-xs disabled:opacity-50 sm:px-3 sm:text-sm`}
          onClick={() => setZoomed(!zoomed)}
        >
          {zoomed ? "Fit to screen" : "Actual size (1:1)"}
        </button>
        <button
          ref={closeButton}
          type="button"
          aria-label="Close photo"
          className={`${controlClass} w-11`}
          onClick={() => dialog.current?.close()}
        >
          <XMarkIcon className="size-5" aria-hidden="true" />
        </button>
      </header>

      <div
        ref={viewport}
        role="region"
        aria-label="Enlarged product photo"
        tabIndex={zoomed ? 0 : undefined}
        className="relative flex min-h-0 overflow-auto overscroll-contain [scrollbar-color:#957982_#211418] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gold"
      >
        {loadState === "failed" ? (
          <p role="status" className="m-auto p-4 text-center text-sm">
            This photo couldn’t be loaded.
          </p>
        ) : (
          <Image
            key={photo.src}
            // Bypass the responsive loader so 1:1 uses the original image pixels.
            unoptimized
            loading="eager"
            src={photo.src}
            alt={photo.altText}
            width={photo.width ?? 0}
            height={photo.height ?? 0}
            onLoad={() => setLoadState("loaded")}
            onError={() => setLoadState("failed")}
            className={`m-auto h-auto w-auto shrink-0 object-contain ${zoomed ? "max-h-none max-w-none" : "max-h-full max-w-full"} ${loadState === "loading" ? "invisible" : ""}`}
          />
        )}
        {loadState === "loading" && (
          <p
            role="status"
            className="pointer-events-none absolute inset-0 grid place-items-center text-sm"
          >
            Loading photo…
          </p>
        )}
      </div>

      <footer className="grid grid-cols-[44px_1fr_44px] items-center gap-2 border-t border-white/15 px-3 py-2.5 sm:px-4">
        {images.length > 1 && (
          <button
            type="button"
            className={`${controlClass} rounded-full`}
            aria-label="Previous photo"
            onClick={() => step(-1)}
          >
            <ChevronLeftIcon className="size-4" aria-hidden="true" />
          </button>
        )}
        <p
          role="status"
          className="col-start-2 text-center text-xs text-[#e1cdd0] tabular-nums"
        >
          Photo {index + 1} of {images.length}
          {zoomed && " · Scroll to explore"}
        </p>
        {images.length > 1 && (
          <button
            type="button"
            className={`${controlClass} rounded-full`}
            aria-label="Next photo"
            onClick={() => step(1)}
          >
            <ChevronRightIcon className="size-4" aria-hidden="true" />
          </button>
        )}
      </footer>
    </dialog>
  );
}
