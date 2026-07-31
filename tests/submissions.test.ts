import { describe, expect, it } from "vitest";

import { canTransitionEnquiry } from "@/features/enquiries/transitions";
import { canPerformModeration } from "@/features/submissions/moderation";
import {
  canEditOwnerSubmission,
  canReviewAsStaff,
  isRetryableSubmissionTransactionError,
} from "@/features/submissions/service";
import { submissionFinalSchema } from "@/features/submissions/schemas";
import {
  canTransitionSubmission,
  getSubmittedStatus,
} from "@/features/submissions/transitions";
import { createSubmissionReference } from "@/features/submissions/references";
import { getSafeDocumentExtension } from "@/features/submissions/documents";
import {
  getSubmissionMediaExtension,
  submissionMediaMetadataSchema,
} from "@/features/submissions/media";
import { formatInrMinorUnits, formatInrRupees } from "@/lib/utils";

const validPlot = {
  intent: "SELL" as const,
  category: "PLOT" as const,
  title: "Corner plot near the city",
  description: "A clear description with enough context for a reviewer.",
  localityName: "Vaishali Nagar",
  city: "Jaipur",
  state: "Rajasthan",
  postalCode: "302021",
  addressLine: "Main road",
  priceMinor: "5000000",
  priceOnRequest: false,
  isNegotiable: true,
  areaValue: "1200",
  areaUnit: "SQ_FT" as const,
  bedrooms: null,
  bathrooms: null,
  floors: null,
  furnishing: "",
  possession: "Ready",
  amenities: ["Road access"],
  highlights: ["Corner position"],
  ownerPhone: "919876543210",
  consent: true,
};

describe("owner submission rules", () => {
  it("recognizes an expired interactive transaction as retryable", () => {
    expect(
      isRetryableSubmissionTransactionError(
        new Error("Transaction API error: Transaction not found."),
      ),
    ).toBe(true);
    expect(
      isRetryableSubmissionTransactionError(new Error("Invalid input")),
    ).toBe(false);
  });

  it("rejects conditional room fields for plots", () => {
    expect(submissionFinalSchema.safeParse(validPlot).success).toBe(true);
    expect(
      submissionFinalSchema.safeParse({ ...validPlot, bedrooms: 2 }).success,
    ).toBe(false);
  });

  it("only allows editable owner states and staff roles", () => {
    expect(canEditOwnerSubmission("DRAFT")).toBe(true);
    expect(canEditOwnerSubmission("UNDER_REVIEW")).toBe(false);
    expect(canReviewAsStaff("REVIEWER")).toBe(true);
    expect(canReviewAsStaff("USER")).toBe(false);
    expect(canPerformModeration("ADMIN")).toBe(true);
    expect(canPerformModeration("USER")).toBe(false);
  });
});

describe("submission and enquiry transitions", () => {
  it("keeps submit transitions explicit", () => {
    expect(getSubmittedStatus("DRAFT")).toBe("SUBMITTED");
    expect(getSubmittedStatus("NEEDS_CHANGES")).toBe("RESUBMITTED");
    expect(canTransitionSubmission("RESUBMITTED", "UNDER_REVIEW")).toBe(true);
    expect(() => getSubmittedStatus("APPROVED")).toThrow();
  });

  it("prevents closed enquiries from reopening", () => {
    expect(canTransitionEnquiry("NEW", "CONTACTED")).toBe(true);
    expect(canTransitionEnquiry("CLOSED_WON", "CONTACTED")).toBe(false);
  });
});

describe("submission references", () => {
  it("uses a stable year and sanitized suffix", () => {
    expect(
      createSubmissionReference(
        new Date("2026-04-03T00:00:00.000Z"),
        "ab 12/test",
      ),
    ).toBe("RSJ-2026-AB12TEST");
  });
});

describe("private document validation", () => {
  it("requires an extension matching the declared MIME type", () => {
    expect(getSafeDocumentExtension("title.pdf", "application/pdf")).toBe(
      "pdf",
    );
    expect(getSafeDocumentExtension("title.exe", "application/pdf")).toBe(null);
  });
});

describe("owner submission enhancements", () => {
  it("requires a custom type for OTHER properties", () => {
    expect(
      submissionFinalSchema.safeParse({
        ...validPlot,
        category: "OTHER",
        otherPropertyType: "",
      }).success,
    ).toBe(false);
    expect(
      submissionFinalSchema.safeParse({
        ...validPlot,
        category: "OTHER",
        otherPropertyType: "Heritage haveli",
      }).success,
    ).toBe(true);
  });

  it("keeps rupee formatting exact for minor-unit values", () => {
    expect(formatInrMinorUnits(BigInt("30000000"))).toBe("₹3,00,000");
    expect(formatInrRupees("300000")).toBe("3,00,000");
  });

  it("limits submission image metadata to supported files", () => {
    expect(getSubmissionMediaExtension("front.jpeg", "image/jpeg")).toBe(
      "jpeg",
    );
    expect(getSubmissionMediaExtension("front.gif", "image/gif")).toBe(null);
    expect(
      submissionMediaMetadataSchema.safeParse({
        altText: "Front elevation",
        width: 1200,
        height: 800,
      }).success,
    ).toBe(true);
    expect(
      submissionMediaMetadataSchema.safeParse({
        altText: "x",
        width: 1200,
        height: 800,
      }).success,
    ).toBe(false);
  });
});
