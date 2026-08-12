import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SettingControl } from "@/components/admin/setting-control";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("site font setting control", () => {
  it("saves an allowlisted font pair through an accessible select", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(
      <SettingControl
        description="Controls the typography used across public and admin pages."
        initialValue="current"
        settingKey="appearance.fontFamily"
      />,
    );

    const select = screen.getByRole("combobox", { name: "Site font family" });
    expect(select).toHaveValue("current");
    expect(screen.getByRole("option", { name: /Current.*Manrope/i })).toBeInTheDocument();

    await user.selectOptions(select, "dm-serif");
    expect(select).toHaveValue("dm-serif");
    expect(screen.getByText("Selected")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Preview font" }));

    const previewDialog = screen.getByRole("dialog", { name: "Font preview" });
    expect(previewDialog).toBeInTheDocument();
    expect(
      within(previewDialog).getByRole("heading", {
        name: "A home shaped by light",
      }),
    ).toBeInTheDocument();
    expect(
      within(previewDialog).getByText(/DM Sans \+ DM Serif Display/),
    ).toBeInTheDocument();

    expect(
      within(previewDialog).getByRole("button", { name: "Close preview" }),
    ).toHaveFocus();
    await user.keyboard("{Tab}");
    expect(
      within(previewDialog).getByRole("button", { name: "Close preview" }),
    ).toHaveFocus();
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(
      within(previewDialog).getByRole("button", { name: "Close preview" }),
    ).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Font preview" })).not.toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Preview font" })).toHaveFocus();
    });

    await user.click(screen.getByRole("button", { name: "Save and apply" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/admin/settings",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ key: "appearance.fontFamily", value: "dm-serif" }),
        }),
      );
    });
    expect(screen.getByText("Saved")).toBeInTheDocument();
  });
});
