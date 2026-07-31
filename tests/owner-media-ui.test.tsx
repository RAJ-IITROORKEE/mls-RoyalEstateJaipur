import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { OwnerSubmissionMedia } from "@/components/forms/owner-submission-media";
import {
  OwnerSubmissionWizard,
  defaultDraft,
} from "@/components/forms/owner-submission-wizard";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("owner submission photo experience", () => {
  it("includes Photos as a dedicated six-step wizard stage", () => {
    render(<OwnerSubmissionWizard initialDraft={defaultDraft} />);

    expect(screen.getByText("Step 1 of 6")).toBeInTheDocument();
    expect(screen.getByText("Photos")).toBeInTheDocument();
  });

  it("shows the multi-image upload target and minimum count", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: async () => ({ media: [] }),
      }),
    );

    render(<OwnerSubmissionMedia submissionId="submission-id" />);

    expect(screen.getByText("Add the first preview image")).toBeInTheDocument();
    expect(screen.getByText("0/5 uploaded · minimum 1")).toBeInTheDocument();
    expect(
      screen.getByText(/cover banner shown on the public property page/i),
    ).toBeInTheDocument();
  });

  it("allows an accidentally uploaded image to be removed", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        json: async () => ({
          media: [
            {
              id: "media-id",
              fileName: "wrong-image.jpg",
              altText: "Wrong property image",
              width: 1200,
              height: 800,
              sortOrder: 0,
              isCover: true,
              url: "https://example.com/wrong-image.jpg",
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ ok: true }),
        ok: true,
      });
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();

    render(<OwnerSubmissionMedia submissionId="submission-id" />);

    await user.click(
      await screen.findByRole("button", { name: "Remove wrong-image.jpg" }),
    );

    await waitFor(() => {
      expect(screen.queryByText("wrong-image.jpg")).not.toBeInTheDocument();
    });
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/submissions/submission-id/media?mediaId=media-id",
      { method: "DELETE" },
    );
    expect(screen.getByText("Image removed.")).toBeInTheDocument();
  });
});
