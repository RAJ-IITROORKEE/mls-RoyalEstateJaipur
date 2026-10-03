import { describe, expect, it } from "vitest";
import { parseJournalPage } from "@/features/blog/pagination";
import { getSafeRedirectPath } from "@/features/auth/schemas";

describe("bounded journal parameters", () => {
  it("accepts positive integer pages and rejects unreasonable or malformed requests", () => {
    expect(parseJournalPage("2")).toBe(2);
    for (const input of [
      undefined,
      "-1",
      "0",
      "1.5",
      "Infinity",
      "1001",
      ["2", "3"],
    ])
      expect(parseJournalPage(input)).toBe(1);
  });
  it("rejects control characters before URL normalization can produce an external redirect", () => {
    expect(getSafeRedirectPath("/\t/evil.test", "/account")).toBe("/account");
    expect(getSafeRedirectPath("/\n/evil.test", "/account")).toBe("/account");
  });
});
