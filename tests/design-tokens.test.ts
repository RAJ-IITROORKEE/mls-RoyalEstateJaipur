import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");

function tokens(selector: string) {
  const block = css.split(`${selector} {`)[1]?.split("}")[0] ?? "";
  return Object.fromEntries(
    [...block.matchAll(/--([\w-]+):\s*(#[\da-f]{6});/gi)].map((match) => [
      match[1],
      match[2],
    ]),
  );
}

function luminance(hex: string) {
  const channels = [1, 3, 5].map((position) => {
    const channel =
      Number.parseInt(hex.slice(position, position + 2), 16) / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return (
    (channels[0] ?? 0) * 0.2126 +
    (channels[1] ?? 0) * 0.7152 +
    (channels[2] ?? 0) * 0.0722
  );
}

function contrast(first: string, second: string) {
  const values = [luminance(first), luminance(second)];
  return (Math.max(...values) + 0.05) / (Math.min(...values) + 0.05);
}

for (const selector of [":root", ".dark"]) {
  describe(`${selector} semantic contrast`, () => {
    const theme = tokens(selector);
    for (const [foreground, background] of [
      ["foreground", "background"],
      ["card-foreground", "card"],
      ["popover-foreground", "popover"],
      ["muted-foreground", "muted"],
      ["muted-foreground", "card"],
      ["primary-foreground", "primary"],
      ["primary-hover-foreground", "primary-hover"],
      ["secondary-foreground", "secondary"],
      ["accent-foreground", "accent"],
      ["spotlight-foreground", "spotlight"],
      ["spotlight-accent", "spotlight"],
      ["destructive-foreground", "destructive"],
      ["destructive", "card"],
    ]) {
      it(`${foreground} on ${background} meets 4.5:1`, () => {
        expect(theme[foreground ?? ""]).toBeDefined();
        expect(theme[background ?? ""]).toBeDefined();
        expect(
          contrast(
            theme[foreground ?? ""] ?? "",
            theme[background ?? ""] ?? "",
          ),
        ).toBeGreaterThanOrEqual(4.5);
      });
    }
    for (const surface of ["card", "muted", "background"]) {
      it(`essential outline on ${surface} meets 3:1`, () => {
        expect(
          contrast(theme.input ?? "", theme[surface] ?? ""),
        ).toBeGreaterThanOrEqual(3);
        expect(
          contrast(theme.ring ?? "", theme[surface] ?? ""),
        ).toBeGreaterThanOrEqual(3);
      });
    }
  });
}
