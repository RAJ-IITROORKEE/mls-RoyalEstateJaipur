import { EnquiryType, PropertyStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { enquirySchema, getEnquiryFormValue } from "@/features/enquiries/schemas";
import { prisma } from "@/lib/db/prisma";
import { hasDatabaseConfiguration } from "@/lib/env";
import { checkRateLimit, getRequestIdentifier } from "@/lib/security/rate-limit";

function redirectWithMessage(request: Request, key: "sent" | "error", value: string) {
  const url = new URL("/contact", request.url);
  url.searchParams.set(key, value);
  return NextResponse.redirect(url, 303);
}

export async function POST(request: Request) {
  const rateLimit = checkRateLimit({ key: `public-enquiry:${getRequestIdentifier(request)}`, limit: 5, windowMs: 60 * 60 * 1000 });
  if (!rateLimit.allowed) return redirectWithMessage(request, "error", "Too many enquiries from this connection. Try again later.");
  const formData = await request.formData();
  const parsed = enquirySchema.safeParse({
    contactName: getEnquiryFormValue(formData, "contactName"),
    email: getEnquiryFormValue(formData, "email"),
    phone: getEnquiryFormValue(formData, "phone") || undefined,
    message: getEnquiryFormValue(formData, "message"),
    propertyReference: getEnquiryFormValue(formData, "propertyReference") || undefined,
    consent: getEnquiryFormValue(formData, "consent"),
    website: getEnquiryFormValue(formData, "website"),
  });
  if (!parsed.success || parsed.data.website) return redirectWithMessage(request, "error", "Please check the form and try again.");
  if (!hasDatabaseConfiguration()) return redirectWithMessage(request, "error", "The enquiry service is not configured yet.");

  try {
    const property = parsed.data.propertyReference ? await prisma.property.findFirst({ where: { referenceNumber: parsed.data.propertyReference, status: PropertyStatus.PUBLISHED }, select: { id: true } }) : null;
    await prisma.enquiry.create({
      data: {
        contactName: parsed.data.contactName,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        message: parsed.data.message,
        propertyId: property?.id,
        type: property ? EnquiryType.PROPERTY : EnquiryType.GENERAL,
        consentAt: new Date(),
        source: "website",
      },
    });
  } catch {
    return redirectWithMessage(request, "error", "We could not send the enquiry. Please try again shortly.");
  }

  return redirectWithMessage(request, "sent", "1");
}
