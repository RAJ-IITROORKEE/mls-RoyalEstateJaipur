export function createSubmissionReference(date = new Date(), suffix = Math.random().toString(36).slice(2, 8).toUpperCase()) {
  const year = date.getFullYear();
  return `RSJ-${year}-${suffix.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8).padEnd(4, "0")}`;
}
