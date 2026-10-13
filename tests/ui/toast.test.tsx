import { act, render, screen } from "@testing-library/react";
import { MotionGlobalConfig } from "motion/react";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { Toaster, toast } from "@/components/ui/toast";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
  if (typeof ResizeObserver === "undefined") {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  }
});

afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

afterEach(() => {
  act(() => toast.dismiss());
});

const region = () => screen.getByRole("region", { name: "Notifications" });

describe("Toast", () => {
  it("announces through live regions that are already mounted", () => {
    render(<Toaster />);
    const polite = screen.getByRole("status");
    const urgent = screen.getByRole("alert");
    expect(polite).toBeEmptyDOMElement();
    expect(urgent).toBeEmptyDOMElement();

    act(() => {
      toast("Saved to drafts", { description: "Q4 launch plan" });
    });
    expect(polite).toHaveTextContent("Saved to drafts. Q4 launch plan");
    expect(urgent).toBeEmptyDOMElement();

    act(() => {
      toast.error("Deployment failed");
    });
    expect(urgent).toHaveTextContent("Deployment failed");
  });

  it("does not give each toast its own live role", () => {
    render(<Toaster />);
    act(() => {
      toast.success("Invite sent");
    });
    const item = region().querySelector("li");
    expect(item).not.toBeNull();
    expect(item).not.toHaveAttribute("role");
    expect(item).not.toHaveAttribute("aria-live");
  });

  it("announces an update to the same toast", () => {
    render(<Toaster />);
    let id = "";
    act(() => {
      id = toast.loading("Deploying acme-web");
    });
    expect(screen.getByRole("status")).toHaveTextContent("Deploying acme-web");
    act(() => {
      toast.success("Deployed to production", { id });
    });
    expect(screen.getByRole("status")).toHaveTextContent("Deployed to production");
  });
});
