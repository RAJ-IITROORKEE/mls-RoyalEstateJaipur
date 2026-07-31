export const propertyIntents = ["SELL", "RENT", "LEASE"] as const;
export type PropertyIntent = (typeof propertyIntents)[number];

export const propertyCategories = ["PLOT", "RESIDENTIAL", "COMMERCIAL", "INDUSTRIAL", "AGRICULTURAL", "OTHER"] as const;
export type PropertyCategory = (typeof propertyCategories)[number];

export const propertyStatuses = ["DRAFT", "PUBLISHED", "PAUSED", "SOLD", "RENTED", "LEASED", "ARCHIVED"] as const;
export type PropertyStatus = (typeof propertyStatuses)[number];

export function createWhatsAppUrl(phone: string, message: string) {
  const normalizedPhone = phone.replace(/[^\d]/g, "");
  if (!normalizedPhone) throw new Error("A WhatsApp number is required");
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}

export function toPropertySlug(title: string, reference: string) {
  const slug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `${slug || "property"}-${reference.toLowerCase()}`;
}
