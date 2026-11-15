"use client";

import {
  optOutOfDataSharing,
  showPrivacyPreferences,
} from "lib/privacy/customer-privacy";
import Link from "next/link";
import { useState } from "react";
import { usePrivacy } from "./provider";

const buttonClass =
  "mt-5 rounded border border-burgundy bg-burgundy px-5 py-3 font-sans text-sm text-cream hover:bg-burgundy/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-burgundy disabled:cursor-not-allowed disabled:opacity-50";

export default function PrivacyChoices() {
  const { config, privacy, error } = usePrivacy();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const ready = Boolean(config && privacy && !error);

  async function handleChoice(choice: "cookies" | "opt-out") {
    if (!config || !ready || busy) {
      return;
    }
    setBusy(true);
    setMessage("");
    setActionError("");
    try {
      if (choice === "cookies") {
        await showPrivacyPreferences(config);
      } else {
        await optOutOfDataSharing(config);
        setMessage(
          "Your data sale/sharing opt-out has been recorded for this browser.",
        );
      }
    } catch {
      setActionError(
        "Your choice could not be confirmed. Please reload and try again, or contact us.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-10 font-sans text-sm leading-7">
      <p>
        Use these controls to manage Shopify cookies and data-sharing choices
        for this browser. Necessary services, including the shopping cart,
        security, and checkout, are not turned off by declining optional
        cookies.
      </p>
      {!ready && !error && <p role="status">Loading privacy controls…</p>}
      {(error || actionError) && <p role="alert">{error || actionError}</p>}
      {message && <p role="status">{message}</p>}
      <section aria-labelledby="cookie-choices">
        <h2 id="cookie-choices" className="font-heading text-3xl text-burgundy">
          Cookie preferences
        </h2>
        <p className="mt-3">
          Open Shopify’s preferences panel to review or change optional cookie
          choices. The automatic banner follows our regional settings; you can
          reopen preferences here at any time.
        </p>
        <button
          className={buttonClass}
          disabled={!ready || busy}
          onClick={() => handleChoice("cookies")}
        >
          Manage cookie preferences
        </button>
      </section>
      <section aria-labelledby="data-sharing">
        <h2 id="data-sharing" className="font-heading text-3xl text-burgundy">
          Do not sell or share my personal information
        </h2>
        <p className="mt-3">
          Opt out of data sale/sharing for this browser without changing your
          separate cookie preferences. Shopify processes Global Privacy Control
          (GPC) signals in regions configured for data-sharing opt-outs.
          Clearing browser data or using another browser may require setting
          choices again.
        </p>
        <button
          className={buttonClass}
          disabled={!ready || busy}
          onClick={() => handleChoice("opt-out")}
        >
          Opt out of data sale/sharing
        </button>
      </section>
      <p>
        For access, deletion, correction, or an account-level privacy request,
        please{" "}
        <Link className="underline" href="/policies/contact-information">
          contact us
        </Link>
        . These browser controls do not by themselves confirm an account-level
        request. Read our{" "}
        <Link className="underline" href="/policies/privacy-policy">
          Privacy Policy
        </Link>{" "}
        for more information.
      </p>
      <noscript>
        JavaScript is required for browser privacy controls. Please contact us
        for assistance.
      </noscript>
    </div>
  );
}
