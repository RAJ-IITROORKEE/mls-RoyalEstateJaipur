import { z } from "zod";

export const journalPageSize = 12;
const journalPageSchema = z.coerce.number().int().min(1).max(1000);

export function parseJournalPage(value: unknown) {
  const parsed = journalPageSchema.safeParse(value);
  return parsed.success ? parsed.data : 1;
}
