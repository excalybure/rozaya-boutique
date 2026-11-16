import PrivacyChoices from "components/privacy/choices";
import { getCanonicalUrl } from "lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy choices",
  alternates: { canonical: getCanonicalUrl("/privacy-choices") },
};

export default function PrivacyChoicesPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16 sm:px-10">
      <h1 className="mb-8 font-heading text-4xl text-burgundy sm:text-5xl">
        Privacy choices
      </h1>
      <PrivacyChoices />
    </section>
  );
}
