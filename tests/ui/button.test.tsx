import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui/button";
import { CyberButton } from "@/components/ui/cyber-button";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { PulseButton } from "@/components/ui/pulse-button";
import { ShimmerButton } from "@/components/ui/shimmer-button";

/**
 * What a Server Component's child looks like to a client component during SSR:
 * a lazy reference whose payload is an already-resolved thenable.
 */
function lazyElement(element: React.ReactElement) {
  const payload = Object.assign(Promise.resolve(element), { status: "fulfilled", value: element });
  return {
    $$typeof: Symbol.for("react.lazy"),
    _payload: payload,
    _init: (thenable: typeof payload) => thenable.value,
  } as unknown as React.ReactElement;
}

describe("Button loading", () => {
  it("keeps the label in the DOM, so the width and the accessible name hold", () => {
    render(
      <Button variant="solid" loading>
        Save changes
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Save changes" });
    expect(button).toHaveAttribute("data-loading");
    expect(button.querySelector("[data-button-spinner]")).not.toBeNull();
    expect(button.className).toContain("text-transparent");
    // Loading is "working", not "unavailable": it isn't dimmed like disabled.
    expect(button.className).not.toContain("aria-disabled:opacity-50");
  });

  it("drops the spinner and the hidden label once loading clears", () => {
    const { rerender } = render(<Button loading>Save</Button>);
    rerender(<Button>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button.querySelector("[data-button-spinner]")).toBeNull();
    expect(button.className).not.toContain("text-transparent");
  });

  it("has small and large icon sizes", () => {
    render(
      <>
        <Button size="icon-sm" aria-label="Add" />
        <Button size="icon-lg" aria-label="Remove" />
      </>,
    );
    expect(screen.getByRole("button", { name: "Add" }).className).toContain("size-8");
    expect(screen.getByRole("button", { name: "Remove" }).className).toContain("size-12");
  });
});

describe("asChild with a Server Component child", () => {
  const cases = [
    ["ShimmerButton", ShimmerButton],
    ["MagneticButton", MagneticButton],
    ["CyberButton", CyberButton],
    ["PulseButton", PulseButton],
  ] as const;

  it.each(cases)("%s renders the link, not a button, so SSR matches the client", (_, Component) => {
    const C = Component as React.ComponentType<{ asChild?: boolean; children?: React.ReactNode }>;
    render(<C asChild>{lazyElement(<a href="/changelog">Changelog</a>)}</C>);
    expect(screen.getByRole("link", { name: /Changelog/ })).toHaveAttribute("href", "/changelog");
    expect(screen.queryByRole("button")).toBeNull();
  });
});
