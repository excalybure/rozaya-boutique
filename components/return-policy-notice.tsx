import Link from "next/link";

export function ReturnPolicyNotice({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  return (
    <p className="text-sm leading-snug text-charcoal/80">
      No change-of-mind returns, except where required by law. For order issues
      and exceptions, see{" "}
      <Link
        href="/policies/refund-policy"
        onNavigate={onNavigate}
        className="font-semibold text-burgundy underline underline-offset-2 hover:text-burgundy-light"
      >
        Returns and Refunds
      </Link>
      .
    </p>
  );
}
