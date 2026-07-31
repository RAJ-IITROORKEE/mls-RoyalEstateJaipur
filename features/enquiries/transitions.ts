import type { EnquiryStatus } from "@prisma/client";

export const enquiryStatuses = ["NEW", "CONTACTED", "QUALIFIED", "SITE_VISIT_SCHEDULED", "NEGOTIATING", "CLOSED_WON", "CLOSED_LOST", "SPAM"] as const;

const transitions: Record<EnquiryStatus, readonly EnquiryStatus[]> = {
  NEW: ["CONTACTED", "SPAM"],
  CONTACTED: ["QUALIFIED", "SITE_VISIT_SCHEDULED", "CLOSED_WON", "CLOSED_LOST", "SPAM"],
  QUALIFIED: ["SITE_VISIT_SCHEDULED", "NEGOTIATING", "CLOSED_WON", "CLOSED_LOST", "SPAM"],
  SITE_VISIT_SCHEDULED: ["NEGOTIATING", "CLOSED_WON", "CLOSED_LOST", "SPAM"],
  NEGOTIATING: ["CLOSED_WON", "CLOSED_LOST", "SPAM"],
  CLOSED_WON: [],
  CLOSED_LOST: [],
  SPAM: [],
};

export function canTransitionEnquiry(from: EnquiryStatus, to: EnquiryStatus) {
  return from === to || transitions[from].includes(to);
}

export function assertEnquiryTransition(from: EnquiryStatus, to: EnquiryStatus) {
  if (!canTransitionEnquiry(from, to)) throw new Error(`Cannot move enquiry from ${from} to ${to}.`);
}
