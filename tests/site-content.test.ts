import { describe, expect, it } from "vitest";

import { publicPropertyIntents } from "@/features/properties/domain";
import { submissionDraftSchema } from "@/features/submissions/schemas";
import {
  faqInputSchema,
  localityInputSchema,
} from "@/features/site-content/schemas";
import { canManageSiteContent } from "@/lib/permissions/roles";

describe("public property intent boundary", () => {
  it("offers Buy and Rent for new public searches and submissions", () => {
    expect(publicPropertyIntents).toEqual(["SELL", "RENT"]);
    expect(
      submissionDraftSchema.safeParse({
        intent: "LEASE",
        category: "RESIDENTIAL",
        title: "",
        description: "",
        localityName: "",
        city: "",
        state: "",
        priceOnRequest: true,
        isNegotiable: false,
        amenities: [],
        highlights: [],
        consent: false,
      }).success,
    ).toBe(false);
  });
});

describe("site content boundaries", () => {
  it("validates FAQ and locality fields at mutation boundaries", () => {
    expect(
      faqInputSchema.safeParse({
        question: "How do I request a site visit?",
        answer:
          "Send an enquiry from the property page to start a conversation.",
        sortOrder: 1,
        isPublished: true,
      }).success,
    ).toBe(true);
    expect(
      faqInputSchema.safeParse({
        question: "Short?",
        answer: "Answer",
        sortOrder: -1,
        isPublished: true,
      }).success,
    ).toBe(false);
    expect(
      localityInputSchema.safeParse({
        name: "Vaishali Nagar",
        city: "Jaipur",
        state: "Rajasthan",
        sortOrder: 0,
        isFeatured: false,
        isActive: true,
      }).success,
    ).toBe(true);
  });

  it("limits FAQ and locality management to administrators", () => {
    expect(canManageSiteContent("ADMIN")).toBe(true);
    expect(canManageSiteContent("SUPER_ADMIN")).toBe(true);
    expect(canManageSiteContent("REVIEWER")).toBe(false);
    expect(canManageSiteContent("USER")).toBe(false);
  });
});
