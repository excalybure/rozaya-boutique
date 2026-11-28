import { policyPages } from "lib/policies";
import { getCanonicalUrl } from "lib/seo";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

const canonical = getCanonicalUrl("/about");
const description =
  "From a grandmother’s jewelry box to estate sales and flea markets: the story behind Rozaya Boutique and how I choose and check every vintage piece.";
const policyLinkClassName =
  "font-semibold text-burgundy underline decoration-gold-dark underline-offset-4 transition-colors hover:text-burgundy-light";

export const metadata: Metadata = {
  title: { absolute: "About Rozaya Boutique" },
  description,
  alternates: { canonical },
  openGraph: {
    type: "website",
    url: canonical,
    title: "About Rozaya Boutique",
    description,
  },
};

function StorySection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-4 border-t border-burgundy/15 py-9 sm:py-12 md:grid-cols-[1fr_1.9fr] md:gap-10">
      <h2 className="max-w-xs font-heading text-3xl leading-tight tracking-[-0.02em] sm:text-4xl">
        {title}
      </h2>
      <div className="max-w-prose space-y-4 text-base leading-8 text-charcoal/80">
        {children}
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <article>
      <header className="bg-cream-dark">
        <div className="mx-auto grid max-w-7xl gap-y-7 px-6 py-12 sm:px-10 sm:py-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-x-16 lg:gap-y-6 lg:px-16 lg:py-20">
          <div className="max-w-xl lg:col-start-1 lg:row-start-1 lg:self-end">
            <h1 className="flex items-center gap-3 font-sans text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-dark">
              <span aria-hidden="true" className="h-px w-7 shrink-0 bg-gold" />
              About Rozaya Boutique
            </h1>
            <p className="mt-5 max-w-lg font-heading text-4xl leading-[1.08] tracking-[-0.04em] text-burgundy sm:text-5xl xl:text-6xl">
              It started with my grandmother’s jewelry box.
            </p>
          </div>
          <div className="relative aspect-[3/2] overflow-hidden bg-burgundy lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
            <Image
              src="/images/about-jewelry-box.webp"
              alt="Hands sorting pearls and brooches in a burgundy velvet-lined jewelry box"
              fill
              priority
              unoptimized
              className="object-cover"
            />
          </div>
          <p className="max-w-prose text-base leading-8 text-charcoal/80 lg:col-start-1 lg:row-start-2">
            As a child, I loved sorting through her brooches, beads and old
            clip-on earrings. I always wondered who had worn them, and where
            they’d been. That curiosity never really left me. Over the years I
            started buying and selling vintage pieces on different marketplaces,
            mostly just for fun — and somewhere along the way it turned into a
            real passion for learning: maker’s marks, hallmarks, gemstones, and
            the history behind each era and style.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-12 sm:px-10 sm:py-16 lg:px-16">
        <StorySection title="A treasure hunter in Southern California">
          <p>
            Living in San Diego has been a gift for this kind of hunting.
            Southern California is full of estate sales, auctions and flea
            markets, and any weekend can turn up something special. I’ve also
            searched the wonderful flea markets of Europe, where you can still
            find pieces with real age, craftsmanship and character. Everything
            in my shop is pre-owned, and many pieces are one of a kind — when
            something sells, it’s gone.
          </p>
        </StorySection>

        <StorySection title="How I check every piece">
          <p>
            Before anything is listed, I examine it by hand. I read hallmarks
            and maker’s marks under magnification. I acid-test gold and silver.
            I screen stones with an electronic diamond and gemstone tester. And
            I note any wear, repairs or missing details — in writing, and in the
            photos.
          </p>
          <p>
            I try to learn as much as I can about every piece I sell: its maker,
            its materials, its era. When I can’t identify something with
            confidence, the listing says so rather than guessing.
          </p>
        </StorySection>

        <section className="grid gap-4 border-l-2 border-gold bg-cream-dark px-5 py-8 sm:px-8 sm:py-10 md:grid-cols-[1fr_1.9fr] md:gap-10">
          <h2 className="font-heading text-3xl leading-tight tracking-[-0.02em] sm:text-4xl">
            My promise to you
          </h2>
          <ul className="max-w-prose list-disc space-y-2.5 pl-5 text-base leading-7 text-charcoal/80 marker:text-gold-dark">
            <li>Honest descriptions, flaws included.</li>
            <li>
              Real photos of the actual piece you’ll receive, never stock
              images.
            </li>
            <li>
              I don’t accept change-of-mind returns except where required by
              law. If there’s a problem with your order, see{" "}
              <Link
                href="/policies/refund-policy"
                className={policyLinkClassName}
              >
                {policyPages["refund-policy"].title}
              </Link>
              .
            </li>
            <li>
              If a written independent appraisal finds that a piece is
              materially different from its description, send me the report
              within 30 days of delivery. If I confirm the difference, I’ll
              issue a full refund when you return the piece in the condition you
              received it. See section 10 of the{" "}
              <Link
                href="/policies/legal-notice"
                className={policyLinkClassName}
              >
                {policyPages["legal-notice"].title}
              </Link>
              .
            </li>
          </ul>
        </section>

        <div className="mt-9 sm:mt-12">
          <StorySection title="The purpose behind the shop">
            <p>
              Every piece in this shop had a life before it reached me — it was
              made by someone, worn by someone, kept for a reason. I don’t think
              jewelry like that should sit forgotten in a drawer. My job, as I
              see it, is to find these pieces, learn what they are, and pass
              them on to the person who’s meant to wear them next.
            </p>
          </StorySection>
        </div>

        <p className="border-t border-burgundy/15 pt-9 text-center font-serif text-3xl leading-tight text-burgundy italic sm:pt-12 sm:text-4xl">
          Made to be found. Chosen to be kept.
        </p>
      </div>
    </article>
  );
}
