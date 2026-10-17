import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";

describe("InputGroup", () => {
  it("wraps the control and addons in one group", () => {
    render(
      <InputGroup aria-label="Payment link">
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput aria-label="Slug" defaultValue="spring-pottery-class" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon" aria-label="Copy link">
            C
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>,
    );
    const group = screen.getByRole("group", { name: "Payment link" });
    expect(group).toContainElement(screen.getByRole("textbox", { name: "Slug" }));
    expect(screen.getByText("https://").closest("[data-align]")).toHaveAttribute("data-align", "inline-start");
    expect(screen.getByRole("button", { name: "Copy link" })).toHaveAttribute("type", "button");
  });

  it("focuses the control when an addon is pressed, but not when a button is", () => {
    const onCopy = vi.fn();
    render(
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>€</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput aria-label="Price" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton onClick={onCopy}>Copy</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>,
    );
    const input = screen.getByRole("textbox", { name: "Price" });
    fireEvent.mouseDown(screen.getByText("€"));
    expect(input).toHaveFocus();

    input.blur();
    const button = screen.getByRole("button", { name: "Copy" });
    const event = fireEvent.mouseDown(button);
    expect(event).toBe(true);
    fireEvent.click(button);
    expect(onCopy).toHaveBeenCalled();
  });

  it("forwards refs and native props to the control", () => {
    const ref = React.createRef<HTMLInputElement>();
    render(
      <InputGroup>
        <InputGroupInput ref={ref} aria-label="Handle" aria-invalid placeholder="ana" />
      </InputGroup>,
    );
    expect(ref.current).toBe(screen.getByRole("textbox", { name: "Handle" }));
    expect(ref.current).toHaveAttribute("aria-invalid", "true");
    expect(ref.current).toHaveAttribute("placeholder", "ana");
  });

  it("works with a textarea and a toolbar row", () => {
    render(
      <InputGroup>
        <InputGroupTextarea aria-label="Reply" />
        <InputGroupAddon align="block-end">
          <InputGroupButton aria-label="Send">Send</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>,
    );
    const textarea = screen.getByRole("textbox", { name: "Reply" });
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(screen.getByRole("button", { name: "Send" }).closest("[data-align]")).toHaveAttribute("data-align", "block-end");
  });

  it("dims the group and leaves it alone when the control is disabled", () => {
    render(
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>@</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput aria-label="Handle" disabled />
      </InputGroup>,
    );
    fireEvent.mouseDown(screen.getByText("@"));
    expect(screen.getByRole("textbox", { name: "Handle" })).not.toHaveFocus();
  });
});
