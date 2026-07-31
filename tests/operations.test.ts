import { describe, expect, it } from "vitest";

import { profileAccessSchema } from "@/features/admin/user-schema";
import {
  propertyDetailsUpdateSchema,
  propertyFeaturedUpdateSchema,
  propertyStatusUpdateSchema,
} from "@/features/admin/property-schema";
import { settingsUpdateSchema } from "@/features/admin/settings-schema";
import {
  getSafeMediaExtension,
  mediaUploadSchema,
} from "@/features/properties/media";
import { canTransitionPropertyStatus } from "@/features/properties/lifecycle";
import {
  canManagePropertyInventory,
  canManageSettings,
} from "@/lib/permissions/roles";

describe("operational authorization boundaries", () => {
  it("keeps settings and staff permissions separate", () => {
    expect(canManageSettings("ADMIN")).toBe(true);
    expect(canManageSettings("REVIEWER")).toBe(false);
    expect(
      profileAccessSchema.safeParse({
        profileId: "not-a-uuid",
        role: "ADMIN",
        status: "ACTIVE",
      }).success,
    ).toBe(false);
  });

  it("validates editable settings by key", () => {
    expect(
      settingsUpdateSchema.safeParse({
        key: "business.email",
        value: "team@example.com",
      }).success,
    ).toBe(true);
    expect(
      settingsUpdateSchema.safeParse({
        key: "business.email",
        value: "not-an-email",
      }).success,
    ).toBe(false);
    expect(
      settingsUpdateSchema.safeParse({
        key: "business.whatsapp",
        value: "91 987",
      }).success,
    ).toBe(false);
  });

  it("limits property inventory mutations to administrators", () => {
    expect(canManagePropertyInventory("ADMIN")).toBe(true);
    expect(canManagePropertyInventory("SUPER_ADMIN")).toBe(true);
    expect(canManagePropertyInventory("REVIEWER")).toBe(false);
  });
});

describe("property inventory operations", () => {
  it("supports deliberate lifecycle changes without arbitrary status jumps", () => {
    expect(canTransitionPropertyStatus("PUBLISHED", "DRAFT")).toBe(true);
    expect(canTransitionPropertyStatus("PUBLISHED", "ARCHIVED")).toBe(true);
    expect(canTransitionPropertyStatus("ARCHIVED", "PUBLISHED")).toBe(false);
    expect(canTransitionPropertyStatus("ARCHIVED", "DRAFT")).toBe(true);
  });

  it("validates status and featured updates", () => {
    expect(
      propertyStatusUpdateSchema.safeParse({
        kind: "status",
        status: "ARCHIVED",
      }).success,
    ).toBe(true);
    expect(
      propertyStatusUpdateSchema.safeParse({
        kind: "status",
        status: "INVALID",
      }).success,
    ).toBe(false);
    expect(
      propertyFeaturedUpdateSchema.safeParse({
        kind: "featured",
        isFeatured: true,
        featuredRank: 2,
      }).success,
    ).toBe(true);
  });

  it("requires complete, exact property details", () => {
    const result = propertyDetailsUpdateSchema.safeParse({
      kind: "details",
      title: "Courtyard home in C-Scheme",
      description:
        "A complete property description with useful and factual context.",
      intent: "SELL",
      category: "RESIDENTIAL",
      otherPropertyType: "",
      priceRupees: "3000000",
      priceOnRequest: false,
      isNegotiable: true,
      areaValue: "1800",
      areaUnit: "SQ_FT",
      addressLine: "",
      localityName: "C-Scheme",
      city: "Jaipur",
      state: "Rajasthan",
      postalCode: "",
      bedrooms: "3",
      bathrooms: "3",
      floors: "2",
      furnishing: "SEMI_FURNISHED",
      possession: "Ready to move",
      amenities: ["Parking"],
      highlights: ["Corner property"],
      seoTitle: "",
      seoDescription: "",
    });
    expect(result.success).toBe(true);
  });
});

describe("public property media boundaries", () => {
  it("requires matching image extensions and descriptive alt text", () => {
    expect(getSafeMediaExtension("front.webp", "image/webp")).toBe("webp");
    expect(getSafeMediaExtension("front.jpg", "image/png")).toBe(null);
    expect(
      mediaUploadSchema.safeParse({ altText: "Front elevation at noon" })
        .success,
    ).toBe(true);
    expect(mediaUploadSchema.safeParse({ altText: "x" }).success).toBe(false);
  });
});
