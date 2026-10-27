import crypto from "crypto";

/**
 * Checks the administrator-provided removal code without exposing the configured
 * secret. The code itself is supplied only through CUSTOMER_DELETION_CODE.
 */
export function isValidCustomerDeletionCode(candidate: string): boolean {
  const configuredCode = process.env.CUSTOMER_DELETION_CODE ?? "";
  if (!configuredCode || candidate.length !== configuredCode.length) return false;

  return crypto.timingSafeEqual(
    Buffer.from(candidate, "utf8"),
    Buffer.from(configuredCode, "utf8")
  );
}

/** Stripe states that still represent a billing obligation or live subscription. */
export function isBlockingSubscriptionStatus(status: string | null | undefined): boolean {
  return ["active", "trialing", "past_due", "unpaid", "incomplete", "paused"].includes(status ?? "");
}
