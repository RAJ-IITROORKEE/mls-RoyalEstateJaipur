import type { PropertyStatus } from "./domain";

const transitions: Record<PropertyStatus, readonly PropertyStatus[]> = {
  DRAFT: ["PUBLISHED", "ARCHIVED"],
  PUBLISHED: ["DRAFT", "PAUSED", "SOLD", "RENTED", "LEASED", "ARCHIVED"],
  PAUSED: ["DRAFT", "PUBLISHED", "ARCHIVED"],
  SOLD: ["DRAFT", "ARCHIVED"],
  RENTED: ["DRAFT", "ARCHIVED"],
  LEASED: ["DRAFT", "ARCHIVED"],
  ARCHIVED: ["DRAFT"],
};

export function canTransitionPropertyStatus(
  current: PropertyStatus,
  next: PropertyStatus,
) {
  return current === next || transitions[current].includes(next);
}

export function getAllowedPropertyStatuses(current: PropertyStatus) {
  return [current, ...transitions[current]];
}

export function assertPropertyStatusTransition(
  current: PropertyStatus,
  next: PropertyStatus,
) {
  if (!canTransitionPropertyStatus(current, next)) {
    throw new Error(`Cannot move a property from ${current} to ${next}.`);
  }
}
