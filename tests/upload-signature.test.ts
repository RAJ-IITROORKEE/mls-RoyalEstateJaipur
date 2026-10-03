import { describe, expect, it } from "vitest";

import { hasExpectedUploadSignature } from "@/lib/security/upload-signature";

function upload(bytes: number[], type: string) {
  return new File([new Uint8Array(bytes)], "upload.bin", { type });
}

describe("upload signatures", () => {
  it("accepts matching image and PDF headers", async () => {
    await expect(
      hasExpectedUploadSignature(
        upload([0xff, 0xd8, 0xff, 0xe0], "image/jpeg"),
      ),
    ).resolves.toBe(true);
    await expect(
      hasExpectedUploadSignature(
        upload([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31], "application/pdf"),
      ),
    ).resolves.toBe(true);
  });

  it("rejects spoofed or unsupported uploads", async () => {
    await expect(
      hasExpectedUploadSignature(upload([0x47, 0x49, 0x46], "image/png")),
    ).resolves.toBe(false);
    await expect(
      hasExpectedUploadSignature(upload([0x47, 0x49, 0x46], "image/gif")),
    ).resolves.toBe(false);
  });
});
