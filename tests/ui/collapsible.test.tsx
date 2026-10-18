import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MotionGlobalConfig } from "motion/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});

afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

describe("Collapsible", () => {
  it("toggles its content and keeps aria-expanded and aria-controls in sync", async () => {
    const onOpenChange = vi.fn();
    render(
      <Collapsible onOpenChange={onOpenChange}>
        <CollapsibleTrigger>Advanced settings</CollapsibleTrigger>
        <CollapsibleContent>Build cache: enabled</CollapsibleContent>
      </Collapsible>,
    );
    const trigger = screen.getByRole("button", { name: "Advanced settings" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).not.toHaveAttribute("aria-controls");
    expect(screen.queryByText("Build cache: enabled")).not.toBeInTheDocument();

    fireEvent.click(trigger);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const content = screen.getByText("Build cache: enabled");
    expect(trigger).toHaveAttribute("aria-controls", content.id);

    fireEvent.click(trigger);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await waitFor(() => expect(screen.queryByText("Build cache: enabled")).not.toBeInTheDocument());
  });

  it("starts open with defaultOpen", () => {
    render(
      <Collapsible defaultOpen>
        <CollapsibleTrigger>Details</CollapsibleTrigger>
        <CollapsibleContent>Region: fra1</CollapsibleContent>
      </Collapsible>,
    );
    expect(screen.getByText("Region: fra1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Details" })).toHaveAttribute("data-state", "open");
  });

  it("stays put when controlled", () => {
    const onOpenChange = vi.fn();
    render(
      <Collapsible open={false} onOpenChange={onOpenChange}>
        <CollapsibleTrigger>Details</CollapsibleTrigger>
        <CollapsibleContent>Region: fra1</CollapsibleContent>
      </Collapsible>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Details" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByText("Region: fra1")).not.toBeInTheDocument();
  });

  it("ignores the trigger while disabled", () => {
    const onOpenChange = vi.fn();
    render(
      <Collapsible disabled onOpenChange={onOpenChange}>
        <CollapsibleTrigger>Details</CollapsibleTrigger>
        <CollapsibleContent>Region: fra1</CollapsibleContent>
      </Collapsible>,
    );
    const trigger = screen.getByRole("button", { name: "Details" });
    expect(trigger).toBeDisabled();
    fireEvent.click(trigger);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("keeps forceMount content in the DOM, hidden while closed", async () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Notes</CollapsibleTrigger>
        <CollapsibleContent forceMount>
          <textarea aria-label="Release notes" defaultValue="Draft" />
        </CollapsibleContent>
      </Collapsible>,
    );
    const field = screen.getByLabelText("Release notes");
    expect(field).not.toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Notes" }));
    await waitFor(() => expect(field).toBeVisible());

    fireEvent.click(screen.getByRole("button", { name: "Notes" }));
    await waitFor(() => expect(field).not.toBeVisible());
    expect(field).toBeInTheDocument();
  });

  it("merges onto its child with asChild, and the child can cancel", () => {
    render(
      <Collapsible>
        <CollapsibleTrigger asChild>
          <a href="#more" className="link" onClick={(event) => event.preventDefault()}>
            Show 4 more
          </a>
        </CollapsibleTrigger>
        <CollapsibleContent>More files</CollapsibleContent>
      </Collapsible>,
    );
    const link = screen.getByRole("link", { name: "Show 4 more" });
    expect(link).toHaveClass("link");
    expect(link).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(link);
    expect(screen.queryByText("More files")).not.toBeInTheDocument();
  });

  it("applies color through --neon", () => {
    const { container } = render(
      <Collapsible color="amber">
        <CollapsibleTrigger>Details</CollapsibleTrigger>
      </Collapsible>,
    );
    expect((container.firstChild as HTMLElement).style.getPropertyValue("--neon")).toBe("251 191 36");
  });
});
