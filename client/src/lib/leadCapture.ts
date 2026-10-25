export type LeadCaptureOptions = {
  intent?: string;
  prompt?: string;
  packageId?: string;
};

/**
 * Keeps every public acquisition CTA on one path: collect business context
 * first, then let the FlowSites team follow up with the right next step.
 */
export function leadCaptureHref({ intent, prompt, packageId }: LeadCaptureOptions = {}) {
  const params = new URLSearchParams();
  if (prompt?.trim()) params.set("q", prompt.trim());
  if (intent?.trim()) params.set("intent", intent.trim());
  if (packageId?.trim()) params.set("package", packageId.trim());
  const query = params.toString();
  return query ? `/ai-intake?${query}` : "/ai-intake";
}
