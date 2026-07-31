import { describe, expect, it } from "vitest";

import { createWhatsAppUrl, toPropertySlug } from "@/features/properties/domain";
import { canAccessAdmin, canManageStaff, canReviewSubmissions } from "@/lib/permissions/roles";
import { assertSubmissionTransition, canTransitionSubmission } from "@/features/submissions/transitions";

describe("property domain helpers", () => {
  it("creates a safe WhatsApp URL with encoded context", () => {
    expect(createWhatsAppUrl("+91 98765 43210", "Hello from /properties/amber-01")).toBe("https://wa.me/919876543210?text=Hello%20from%20%2Fproperties%2Famber-01");
  });

  it("creates a stable readable property slug", () => {
    expect(toPropertySlug("Garden-facing Plot, Vaishali Nagar", "RSJ-001")).toBe("garden-facing-plot-vaishali-nagar-rsj-001");
  });
});

describe("submission transitions", () => {
  it("allows review and rejects invalid jumps", () => {
    expect(canTransitionSubmission("SUBMITTED", "UNDER_REVIEW")).toBe(true);
    expect(canTransitionSubmission("DRAFT", "APPROVED")).toBe(false);
    expect(() => assertSubmissionTransition("DRAFT", "APPROVED")).toThrow("Cannot move");
  });
});

describe("role permissions", () => {
  it("keeps staff management exclusive to super admins", () => {
    expect(canAccessAdmin("USER")).toBe(false);
    expect(canReviewSubmissions("REVIEWER")).toBe(true);
    expect(canManageStaff("ADMIN")).toBe(false);
    expect(canManageStaff("SUPER_ADMIN")).toBe(true);
  });
});
