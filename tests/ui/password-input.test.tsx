import * as React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Field } from "@/components/ui/field";
import { PasswordInput, evaluatePassword, type PasswordRule } from "@/components/ui/password-input";

const field = () => screen.getByLabelText("Password") as HTMLInputElement;
const toggle = () => screen.getByRole("button", { name: "Show password" });

describe("evaluatePassword", () => {
  it("ranks the usual suspects", () => {
    expect(evaluatePassword("").score).toBe(0);
    expect(evaluatePassword("hunter2").score).toBe(1);
    expect(evaluatePassword("Password123!").score).toBe(1);
    expect(evaluatePassword("aaaaaaaaaaaaaaaa").score).toBeLessThanOrEqual(2);
    expect(evaluatePassword("Summer2026!").score).toBe(2);
    expect(evaluatePassword("neonkit-blue").score).toBe(3);
    expect(evaluatePassword("Copper-Kettle-41-Rain").score).toBe(4);
    expect(evaluatePassword("correct horse battery staple").score).toBe(4);
    expect(evaluatePassword("Copper-Kettle-41-Rain").label).toBe("Strong");
  });

  it("caps short passwords by length", () => {
    expect(evaluatePassword("X#9q!Lm2").score).toBeLessThanOrEqual(2);
    expect(evaluatePassword("X#9q!Lm2zP", 20).score).toBeLessThanOrEqual(2);
  });
});

describe("PasswordInput", () => {
  it("reveals as a pressed toggle with a fixed name, keeping focus in the field", () => {
    const onVisibleChange = vi.fn();
    render(<PasswordInput label="Password" defaultValue="secret" onVisibleChange={onVisibleChange} />);
    expect(field()).toHaveAttribute("type", "password");
    expect(toggle()).toHaveAttribute("aria-pressed", "false");
    expect(toggle()).toHaveAttribute("aria-controls", field().id);
    field().focus();
    const down = fireEvent.mouseDown(toggle());
    expect(down).toBe(false); // default prevented, so focus stays put
    fireEvent.click(toggle());
    expect(field()).toHaveAttribute("type", "text");
    expect(toggle()).toHaveAttribute("aria-pressed", "true");
    expect(onVisibleChange).toHaveBeenCalledWith(true);
  });

  it("honours a controlled visible prop", () => {
    const { rerender } = render(<PasswordInput label="Password" visible={false} onVisibleChange={() => {}} />);
    fireEvent.click(toggle());
    expect(field()).toHaveAttribute("type", "password");
    rerender(<PasswordInput label="Password" visible onVisibleChange={() => {}} />);
    expect(field()).toHaveAttribute("type", "text");
  });

  it("lights the meter and announces the label as the value changes", () => {
    const onValueChange = vi.fn();
    const { container } = render(<PasswordInput label="Password" strength onValueChange={onValueChange} />);
    const lit = () => container.querySelectorAll(".nk-pw-seg[data-lit]").length;
    expect(lit()).toBe(0);
    fireEvent.change(field(), { target: { value: "hunter2" } });
    expect(onValueChange).toHaveBeenLastCalledWith("hunter2");
    expect(lit()).toBe(1);
    const status = screen.getByText("Weak").closest("[aria-live]")!;
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveTextContent("Strength: Weak");
    fireEvent.change(field(), { target: { value: "Copper-Kettle-41-Rain" } });
    expect(lit()).toBe(4);
    expect(status).toHaveTextContent("Strong");
  });

  it("ticks off the default rules and wires everything into aria-describedby", () => {
    render(<PasswordInput label="Password" strength rules description="Use a passphrase." />);
    const list = screen.getByRole("list");
    const ids = field().getAttribute("aria-describedby")!.split(" ");
    expect(ids).toContain(list.id);
    expect(ids).toContain(screen.getByText("Use a passphrase.").id);
    expect(ids.some((id) => id.endsWith("-strength"))).toBe(true);
    fireEvent.change(field(), { target: { value: "abcDEF123456" } });
    const items = screen.getAllByRole("listitem");
    expect(items.map((li) => li.hasAttribute("data-met"))).toEqual([true, true, true, false]);
    expect(items[3]).toHaveTextContent("A symbol, not yet");
    expect(field()).toHaveAttribute("autocomplete", "new-password");
  });

  it("uses custom rules and evaluate", () => {
    const rules: PasswordRule[] = [{ id: "dash", label: "Has a dash", test: (v) => v.includes("-") }];
    const evaluate = vi.fn((value: string, passed: Record<string, boolean>) => ({ score: passed.dash ? 4 : 1, label: passed.dash ? "OK" : "No" }) as const);
    render(<PasswordInput label="Password" rules={rules} strength evaluate={evaluate} />);
    fireEvent.change(field(), { target: { value: "a-b" } });
    expect(evaluate).toHaveBeenLastCalledWith("a-b", { dash: true });
    expect(screen.getByText("OK")).toBeInTheDocument();
  });

  it("warns about Caps Lock while typing and clears on blur", () => {
    render(<PasswordInput label="Password" />);
    const keydown = new KeyboardEvent("keydown", { key: "A", bubbles: true });
    Object.defineProperty(keydown, "getModifierState", { value: (key: string) => key === "CapsLock" });
    act(() => {
      field().dispatchEvent(keydown);
    });
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Caps Lock is on");
    expect(field().getAttribute("aria-describedby")).toContain(status.id);
    fireEvent.blur(field());
    expect(status).toHaveTextContent("");
  });

  it("works inside Field: label, error, aria-invalid and the red state", () => {
    render(
      <Field label="Password" error="That password doesn’t match." required>
        <PasswordInput />
      </Field>,
    );
    expect(field()).toBeRequired();
    expect(field()).toHaveAttribute("aria-invalid", "true");
    expect(field().getAttribute("aria-describedby")).toContain(screen.getByText("That password doesn’t match.").id);
    expect(field().parentElement).toHaveClass("border-[rgb(var(--neon)/0.55)]");
  });

  it("only sets minLength on the input when asked", () => {
    const { rerender } = render(<PasswordInput label="Password" />);
    expect(field()).not.toHaveAttribute("minlength");
    rerender(<PasswordInput label="Password" minLength={16} rules />);
    expect(field()).toHaveAttribute("minlength", "16");
    expect(screen.getByText("16 or more characters")).toBeInTheDocument();
  });

  it("empties again on form reset", () => {
    render(
      <form>
        <PasswordInput label="Password" strength />
        <button type="reset">Reset</button>
      </form>,
    );
    fireEvent.change(field(), { target: { value: "hunter2" } });
    expect(field()).toHaveValue("hunter2");
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(field()).toHaveValue("");
  });

  it("forwards its ref to the input", () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<PasswordInput ref={ref} label="Password" />);
    expect(ref.current).toBe(field());
  });
});
