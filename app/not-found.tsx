import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20 sm:px-10">
      <p className="font-sans text-sm tracking-widest text-gold-dark">404</p>
      <h1 className="mt-3 font-heading text-4xl text-burgundy">
        Page not found
      </h1>
      <p className="mt-5 font-sans text-charcoal">
        This page could not be found.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block font-sans text-burgundy underline"
      >
        Return to Rozaya Boutique
      </Link>
    </section>
  );
}
