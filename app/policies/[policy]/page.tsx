import Prose from "components/prose";
import {
  isPolicyHandle,
  isReviewDraft,
  localizePrivacyLinks,
  policyPages,
} from "lib/policies";
import { getCanonicalUrl } from "lib/seo";
import { getPolicies } from "lib/shopify/policies";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = { params: Promise<{ policy: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { policy } = await params;
  if (!isPolicyHandle(policy)) {
    notFound();
  }
  const policies = await getPolicies();
  const savedPolicy = policies?.[policyPages[policy].field];
  const available =
    savedPolicy?.body.trim() && !isReviewDraft(savedPolicy.body);
  return {
    title: policyPages[policy].title,
    alternates: { canonical: getCanonicalUrl(`/policies/${policy}`) },
    ...(!available && { robots: { index: false, follow: true } }),
  };
}

export default async function PolicyPage({ params }: PageProps) {
  const { policy } = await params;
  if (!isPolicyHandle(policy)) {
    notFound();
  }
  const policies = await getPolicies();
  const savedPolicy = policies?.[policyPages[policy].field];
  const available =
    savedPolicy?.body.trim() && !isReviewDraft(savedPolicy.body);

  return (
    <section className="mx-auto max-w-4xl px-6 py-16 sm:px-10">
      <h1 className="mb-8 font-heading text-4xl text-burgundy sm:text-5xl">
        {policyPages[policy].title}
      </h1>
      {policy === "privacy-policy" && (
        <p className="mb-8 font-sans text-sm">
          <Link
            href="/privacy-choices"
            className="underline underline-offset-4"
          >
            Manage cookies and data-sharing choices
          </Link>
        </p>
      )}
      {savedPolicy && available ? (
        <Prose
          html={localizePrivacyLinks(
            savedPolicy.body,
            process.env.SHOPIFY_STORE_DOMAIN ?? "",
          )}
        />
      ) : (
        <p role="status" className="font-sans leading-7">
          This information is not available here yet. Please check back before
          placing an order.
          {policy !== "contact-information" && (
            <>
              {" "}
              <Link href="/policies/contact-information" className="underline">
                Contact Rozaya Boutique
              </Link>{" "}
              if you need assistance.
            </>
          )}
        </p>
      )}
    </section>
  );
}
