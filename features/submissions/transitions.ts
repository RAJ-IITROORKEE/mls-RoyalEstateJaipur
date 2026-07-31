export const submissionStatuses = ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "NEEDS_CHANGES", "RESUBMITTED", "APPROVED", "REJECTED", "WITHDRAWN", "ARCHIVED"] as const;
export type SubmissionStatus = (typeof submissionStatuses)[number];

const transitions: Record<SubmissionStatus, readonly SubmissionStatus[]> = {
  DRAFT: ["SUBMITTED", "WITHDRAWN"],
  SUBMITTED: ["UNDER_REVIEW", "WITHDRAWN"],
  UNDER_REVIEW: ["NEEDS_CHANGES", "APPROVED", "REJECTED", "WITHDRAWN"],
  NEEDS_CHANGES: ["RESUBMITTED", "WITHDRAWN"],
  RESUBMITTED: ["UNDER_REVIEW", "WITHDRAWN"],
  APPROVED: ["ARCHIVED"],
  REJECTED: ["ARCHIVED"],
  WITHDRAWN: ["ARCHIVED"],
  ARCHIVED: [],
};

export function canTransitionSubmission(from: SubmissionStatus, to: SubmissionStatus) {
  return transitions[from].includes(to);
}

export function assertSubmissionTransition(from: SubmissionStatus, to: SubmissionStatus) {
  if (!canTransitionSubmission(from, to)) throw new Error(`Cannot move a submission from ${from} to ${to}`);
}

export function getSubmittedStatus(current: SubmissionStatus): "SUBMITTED" | "RESUBMITTED" {
  if (current === "DRAFT") return "SUBMITTED";
  if (current === "NEEDS_CHANGES") return "RESUBMITTED";
  throw new Error(`Cannot submit a submission from ${current}`);
}
