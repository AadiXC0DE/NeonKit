import * as React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Banner, BannerAction } from "@/components/ui/banner";

/** What a Server Component's child looks like to a client component: a lazy reference. */
function lazyElement(element: React.ReactElement) {
  const payload = Object.assign(Promise.resolve(element), { status: "fulfilled", value: element });
  return {
    $$typeof: Symbol.for("react.lazy"),
    _payload: payload,
    _init: (thenable: typeof payload) => thenable.value,
  } as unknown as React.ReactElement;
}

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("Banner", () => {
  it("is a named region, never an alert", () => {
    render(<Banner>Billing changes on 1 November.</Banner>);
    const region = screen.getByRole("region", { name: "Announcement" });
    expect(region).toHaveAttribute("data-state", "open");
    expect(screen.queryByRole("alert")).toBeNull();
    expect(region).toHaveTextContent("Billing changes on 1 November.");
  });

  it("dismisses and reports it", () => {
    const onOpenChange = vi.fn();
    render(
      <Banner dismissible onOpenChange={onOpenChange}>
        Hello
      </Banner>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    const shell = document.querySelector("[data-state]") as HTMLElement & { inert?: boolean };
    expect(shell).toHaveAttribute("data-state", "closed");
    expect(shell).toHaveAttribute("aria-hidden", "true");
  });

  it("follows a controlled open prop", () => {
    const { rerender } = render(<Banner open={false}>Hi</Banner>);
    expect(document.querySelector("[data-state]")).toHaveAttribute("data-state", "closed");
    rerender(<Banner open>Hi</Banner>);
    expect(document.querySelector("[data-state]")).toHaveAttribute("data-state", "open");
  });

  it("remembers a dismissal under its storage key", async () => {
    const { unmount } = render(
      <Banner storageKey="test:banner" dismissible>
        CLI 3.0
      </Banner>,
    );
    await act(async () => {});
    expect(document.querySelector("[data-state]")).toHaveAttribute("data-state", "open");
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(window.localStorage.getItem("test:banner")).toBe("dismissed");
    unmount();

    render(<Banner storageKey="test:banner">CLI 3.0</Banner>);
    await act(async () => {});
    expect(document.querySelector("[data-state]")).toHaveAttribute("data-state", "closed");
  });

  it("still dismisses when storage throws", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    render(
      <Banner storageKey="test:blocked" dismissible>
        Hi
      </Banner>,
    );
    await act(async () => {});
    expect(document.querySelector("[data-state]")).toHaveAttribute("data-state", "open");
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(document.querySelector("[data-state]")).toHaveAttribute("data-state", "closed");
  });

  it("uses the variant's color unless one is given", () => {
    const { rerender } = render(<Banner variant="warning">Card expiring</Banner>);
    expect(screen.getByRole("region").style.getPropertyValue("--neon")).toBe("251 191 36");
    rerender(
      <Banner variant="warning" color="violet">
        Card expiring
      </Banner>,
    );
    expect(screen.getByRole("region").style.getPropertyValue("--neon")).toBe("168 85 247");
  });

  it("puts the message in a marquee when asked", () => {
    render(<Banner marquee>Writes pause for 90 seconds</Banner>);
    expect(screen.getAllByText("Writes pause for 90 seconds").length).toBeGreaterThanOrEqual(1);
  });
});

describe("BannerAction", () => {
  it("is a button by default and a link with asChild", () => {
    const onClick = vi.fn();
    const { rerender } = render(<BannerAction onClick={onClick}>See pricing</BannerAction>);
    fireEvent.click(screen.getByRole("button", { name: /See pricing/ }));
    expect(onClick).toHaveBeenCalled();
    rerender(
      <BannerAction asChild>
        <a href="/notes">Release notes</a>
      </BannerAction>,
    );
    expect(screen.getByRole("link", { name: /Release notes/ })).toHaveAttribute("href", "/notes");
  });

  it("keeps a link that arrives as a lazy reference", () => {
    render(<BannerAction asChild>{lazyElement(<a href="/status">Status page</a>)}</BannerAction>);
    expect(screen.getByRole("link", { name: /Status page/ })).toHaveAttribute("href", "/status");
    expect(screen.queryByRole("button")).toBeNull();
  });
});
