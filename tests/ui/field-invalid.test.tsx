import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// The red state comes from Field's error as well as the control's own, so a form only marks errors in one place.
describe("controls inside an invalid Field", () => {
  it.each([
    ["Input", <Input key="i" />],
    ["Textarea", <Textarea key="t" />],
  ])("%s is marked and styled invalid", (_, control) => {
    render(
      <Field label="Email" error="Use your work address">
        {control}
      </Field>,
    );
    const element = screen.getByLabelText("Email");
    expect(element).toHaveAttribute("aria-invalid", "true");
    // The lit border lives on the control's frame, a parent of the element.
    expect(element.closest("[class*='border-[rgb(var(--neon)/0.55)]']")).not.toBeNull();
  });

  it("stays calm without an error", () => {
    render(
      <Field label="Name">
        <Input />
      </Field>,
    );
    const element = screen.getByLabelText("Name");
    expect(element).not.toHaveAttribute("aria-invalid");
    expect(element.closest("[class*='border-[rgb(var(--neon)/0.55)]']")).toBeNull();
  });
});
