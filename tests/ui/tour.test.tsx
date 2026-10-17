import * as React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { MotionGlobalConfig } from "motion/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { Tour, type TourStep } from "@/components/ui/tour";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

const steps: TourStep[] = [
  { target: "#env", title: "This is production", body: "Changes reach 41,000 people." },
  { target: "#deploy", title: "Ship from main" },
  { title: "Logs stay for 14 days", body: "Centered: no target." },
];

function Page(props: Partial<React.ComponentProps<typeof Tour>>) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button id="env">Production</button>
      <button id="deploy">Deploy</button>
      <button onClick={() => setOpen(true)}>Take the tour</button>
      <Tour steps={steps} open={open} onOpenChange={setOpen} {...props} />
    </>
  );
}

const dialog = () => screen.getByRole("dialog");
const press = (key: string) => fireEvent.keyDown(document.activeElement ?? document.body, { key });

async function openTour(props?: Partial<React.ComponentProps<typeof Tour>>) {
  render(<Page {...props} />);
  const opener = screen.getByRole("button", { name: "Take the tour" });
  act(() => opener.focus());
  fireEvent.click(opener);
  await waitFor(() => expect(dialog()).toBeInTheDocument());
  return opener;
}

describe("Tour", () => {
  it("renders nothing on the server or while closed", () => {
    expect(renderToString(<Tour steps={steps} defaultOpen />)).toBe("");
    render(<Tour steps={steps} />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens a labelled modal card with the step count, focused on Next", async () => {
    await openTour();
    expect(dialog()).toHaveAttribute("aria-modal", "true");
    expect(dialog()).toHaveAccessibleName("This is production");
    expect(dialog()).toHaveAccessibleDescription("Changes reach 41,000 people.");
    expect(dialog()).toHaveTextContent("1 of 3");
    expect(screen.getByRole("button", { name: "Next" })).toHaveFocus();
    expect(screen.queryByRole("button", { name: "Back" })).toBeNull();
    expect(document.querySelector("[data-nk-tour-overlay]")).toHaveAttribute("aria-hidden", "true");
  });

  it("steps with the arrow keys and buttons, and announces the step", async () => {
    const onStepChange = vi.fn();
    await openTour({ onStepChange });
    press("ArrowRight");
    expect(onStepChange).toHaveBeenLastCalledWith(1);
    expect(dialog()).toHaveAccessibleName("Ship from main");
    expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();
    press("ArrowLeft");
    expect(dialog()).toHaveAccessibleName("This is production");
    press("ArrowLeft"); // already first
    expect(onStepChange).toHaveBeenCalledTimes(2);
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(dialog()).toHaveAccessibleName("This is production");
  });

  it("finishes with Done, calls onComplete and gives focus back", async () => {
    const onComplete = vi.fn();
    const opener = await openTour({ onComplete });
    press("ArrowRight");
    press("ArrowRight");
    expect(dialog()).toHaveAccessibleName("Logs stay for 14 days");
    expect(screen.queryByRole("button", { name: "Skip tour" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(onComplete).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(opener).toHaveFocus();
  });

  it("skips with Escape or the Skip button, reporting the step", async () => {
    const onSkip = vi.fn();
    const opener = await openTour({ onSkip });
    press("ArrowRight");
    press("Escape");
    expect(onSkip).toHaveBeenCalledWith(1);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(opener).toHaveFocus();
    fireEvent.click(opener);
    await waitFor(() => expect(dialog()).toBeInTheDocument());
    expect(dialog()).toHaveAccessibleName("This is production"); // uncontrolled step starts over
    fireEvent.click(screen.getByRole("button", { name: "Skip tour" }));
    expect(onSkip).toHaveBeenLastCalledWith(0);
  });

  it("traps Tab inside the card", async () => {
    await openTour();
    press("ArrowRight");
    const skip = screen.getByRole("button", { name: "Skip tour" });
    const next = screen.getByRole("button", { name: "Next" });
    act(() => next.focus());
    fireEvent.keyDown(next, { key: "Tab" });
    expect(skip).toHaveFocus();
    fireEvent.keyDown(skip, { key: "Tab", shiftKey: true });
    expect(next).toHaveFocus();
    act(() => screen.getByRole("button", { name: "Deploy" }).focus());
    expect(next).toHaveFocus(); // focus that escapes is pulled back
  });

  it("leaves the arrow keys to text fields inside the card", async () => {
    render(<Tour defaultOpen steps={[{ title: "Name it", body: <input aria-label="Name" /> }, { title: "Two" }]} />);
    await waitFor(() => expect(dialog()).toBeInTheDocument());
    const input = screen.getByRole("textbox", { name: "Name" });
    act(() => input.focus());
    fireEvent.keyDown(input, { key: "ArrowRight" });
    expect(dialog()).toHaveAccessibleName("Name it");
  });

  it("follows a controlled step", async () => {
    const onStepChange = vi.fn();
    const { rerender } = render(<Tour open steps={steps} step={1} onStepChange={onStepChange} />);
    await waitFor(() => expect(dialog()).toHaveAccessibleName("Ship from main"));
    press("ArrowRight");
    expect(onStepChange).toHaveBeenCalledWith(2);
    expect(dialog()).toHaveAccessibleName("Ship from main");
    rerender(<Tour open steps={steps} step={2} onStepChange={onStepChange} />);
    expect(dialog()).toHaveAccessibleName("Logs stay for 14 days");
  });

  it("drops the count and Skip for a single step, and takes labels", async () => {
    render(<Tour defaultOpen steps={[{ title: "Search covers CI runs" }]} labels={{ done: "Got it" }} />);
    await waitFor(() => expect(dialog()).toBeInTheDocument());
    expect(dialog()).not.toHaveTextContent("1 of 1");
    expect(screen.getByRole("button", { name: "Got it" })).toHaveFocus();
    expect(screen.queryByRole("button", { name: "Skip tour" })).toBeNull();
  });

  it("dims only the container when given one", async () => {
    function Scoped() {
      const ref = React.useRef<HTMLDivElement>(null);
      return (
        <div ref={ref} data-testid="frame" style={{ position: "relative" }}>
          <button id="inside">Inside</button>
          <Tour defaultOpen container={ref} steps={[{ target: "#inside", title: "Inside" }]} />
        </div>
      );
    }
    render(<Scoped />);
    await waitFor(() => expect(dialog()).toBeInTheDocument());
    const overlay = document.querySelector("[data-nk-tour-overlay]")!;
    expect(screen.getByTestId("frame")).toContainElement(overlay as HTMLElement);
    expect(overlay).toHaveClass("absolute");
    expect(screen.getByTestId("frame")).not.toContainElement(dialog());
  });

  it("carries a color into the portals and keeps the strike out of reduced motion", async () => {
    render(<Tour defaultOpen color="magenta" steps={steps} />);
    await waitFor(() => expect(dialog()).toBeInTheDocument());
    const overlay = document.querySelector<HTMLElement>("[data-nk-tour-overlay]")!;
    expect(overlay.style.getPropertyValue("--neon")).toBe("240 70 235");
    const css = Array.from(document.querySelectorAll("style")).map((s) => s.textContent).join("");
    expect(css).toContain("@media (prefers-reduced-motion:reduce){.nk-tour-tube{animation:none}}");
  });
});
