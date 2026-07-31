import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { propertyAdminMutationSchema } from "@/features/admin/property-schema";
import {
  updateAdminPropertyDetails,
  updateAdminPropertyFeatured,
  updateAdminPropertyStatus,
} from "@/features/admin/properties";
import { getCurrentUserAccess } from "@/lib/auth/current-user";
import { canManagePropertyInventory } from "@/lib/permissions/roles";

type RouteContext = { params: Promise<{ id: string }> };

const safeDomainErrors = [
  "Property not found.",
  "Only active administrators can manage property inventory.",
  "Only published properties can be featured.",
  "Add at least one public image before publishing.",
];

function safeMutationError(error: unknown) {
  if (!(error instanceof Error)) return "The property could not be updated.";
  if (
    safeDomainErrors.includes(error.message) ||
    error.message.startsWith("Cannot move a property from ")
  ) {
    return error.message;
  }
  return "The property could not be updated.";
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const access = await getCurrentUserAccess();
  if (access.mode !== "authorized" || !access.profile) {
    return NextResponse.json(
      { error: "You must be signed in." },
      { status: 401 },
    );
  }
  if (!canManagePropertyInventory(access.profile.role)) {
    return NextResponse.json(
      { error: "Administrator access is required." },
      { status: 403 },
    );
  }
  const parsed = propertyAdminMutationSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Check the property fields and try again." },
      { status: 400 },
    );
  }
  const propertyId = (await params).id;
  try {
    const property =
      parsed.data.kind === "status"
        ? await updateAdminPropertyStatus(
            access.profile.id,
            propertyId,
            parsed.data.status,
          )
        : parsed.data.kind === "featured"
          ? await updateAdminPropertyFeatured(
              access.profile.id,
              propertyId,
              parsed.data.isFeatured,
              parsed.data.featuredRank,
            )
          : await updateAdminPropertyDetails(
              access.profile.id,
              propertyId,
              parsed.data,
            );
    revalidatePath("/");
    revalidatePath("/properties");
    revalidatePath("/admin/properties");
    revalidatePath(`/admin/properties/${propertyId}`);
    return NextResponse.json({ property });
  } catch (error) {
    const message = safeMutationError(error);
    return NextResponse.json(
      { error: message },
      { status: message === "Property not found." ? 404 : 409 },
    );
  }
}
