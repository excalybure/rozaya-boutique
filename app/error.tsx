"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto my-12 flex max-w-xl flex-col border border-burgundy/10 bg-cream px-6 py-10 sm:px-10">
      <p className="mb-3 font-sans text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-dark">
        Rozaya Boutique
      </p>
      <h2 className="font-heading text-3xl text-burgundy">We hit a snag.</h2>
      <p className="my-3 font-sans text-sm leading-7 text-charcoal/75">
        Something interrupted this page. Please try again.
      </p>
      <button
        className="mt-4 flex min-h-12 w-full items-center justify-center bg-burgundy px-4 py-3 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-burgundy-light"
        onClick={() => reset()}
      >
        Try Again
      </button>
    </div>
  );
}
