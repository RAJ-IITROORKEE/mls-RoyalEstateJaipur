export const roles = ["USER", "REVIEWER", "ADMIN", "SUPER_ADMIN"] as const;
export type Role = (typeof roles)[number];

export function canAccessAdmin(role: Role) {
  return role !== "USER";
}

export function canManageStaff(role: Role) {
  return role === "SUPER_ADMIN";
}

export function canManageSettings(role: Role) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function canManagePropertyInventory(role: Role) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function canReviewSubmissions(role: Role) {
  return role === "REVIEWER" || role === "ADMIN" || role === "SUPER_ADMIN";
}
