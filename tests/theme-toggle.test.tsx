import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ThemeToggle } from "@/components/theme-toggle";

const themeState = vi.hoisted(() => ({
  current: "system",
  setTheme: vi.fn(),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: themeState.current, setTheme: themeState.setTheme }),
}));

afterEach(() => {
  cleanup();
  themeState.current = "system";
  themeState.setTheme.mockReset();
});

describe("theme control", () => {
  it("offers light, dark, and system appearance modes", () => {
    render(<ThemeToggle />);

    expect(screen.getByRole("combobox", { name: "Color theme" })).toHaveValue("system");
    expect(screen.getByRole("option", { name: "Light" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Dark" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "System" })).toBeInTheDocument();
  });

  it("persists the selected appearance mode through next-themes", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.selectOptions(screen.getByRole("combobox", { name: "Color theme" }), "dark");

    expect(themeState.setTheme).toHaveBeenCalledWith("dark");
  });
});
