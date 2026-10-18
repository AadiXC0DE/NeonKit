import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Field, FieldDescription, FieldError, Label, useFieldControl } from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

describe("Field", () => {
  it("labels and describes a native control", () => {
    render(
      <Field label="Region" description="Where new projects deploy.">
        <select>
          <option>Frankfurt</option>
        </select>
      </Field>,
    );
    const select = screen.getByRole("combobox", { name: "Region" });
    expect(select).toHaveAccessibleDescription("Where new projects deploy.");
    expect(select).not.toHaveAttribute("aria-invalid");
    // Native controls are labelled by htmlFor alone.
    expect(select).not.toHaveAttribute("aria-labelledby");
  });

  it("swaps the description for the error and marks the control invalid", () => {
    render(
      <Field label="Auth code" description="From your registrar." error="Too short.">
        <input />
      </Field>,
    );
    const input = screen.getByRole("textbox", { name: "Auth code" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Too short.");
    expect(screen.queryByText("From your registrar.")).not.toBeInTheDocument();
  });

  it("shows the red state without a message when error is true", () => {
    const { container } = render(
      <Field label="Name" error>
        <input />
      </Field>,
    );
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
    expect(container.querySelector("p")).toBeNull();
    expect((container.firstChild as HTMLElement).style.getPropertyValue("--neon-accent")).toBe("255 77 94");
  });

  it("sets required on the control and shows the dot", () => {
    const { container } = render(
      <Field label="Email" required>
        <input type="email" />
      </Field>,
    );
    expect(screen.getByRole("textbox", { name: "Email" })).toBeRequired();
    expect(container.querySelector('[title="Required"]')).toBeInTheDocument();
  });

  it("keeps the child's own id and aria-describedby", () => {
    render(
      <>
        <span id="hint">Shown in the URL.</span>
        <Field label="Slug" description="Lowercase only.">
          <input id="slug" aria-describedby="hint" />
        </Field>
      </>,
    );
    const input = screen.getByRole("textbox", { name: "Slug" });
    expect(input).toHaveAttribute("id", "slug");
    expect(input).toHaveAccessibleDescription("Shown in the URL. Lowercase only.");
  });

  it("names a Switch and toggles it from the label", () => {
    render(
      <Field orientation="horizontal" label="Preview deployments" description="One URL per pull request.">
        <Switch />
      </Field>,
    );
    const control = screen.getByRole("switch", { name: "Preview deployments" });
    expect(control).toHaveAccessibleDescription("One URL per pull request.");
    fireEvent.click(screen.getByText("Preview deployments"));
    expect(control).toHaveAttribute("aria-checked", "true");
  });

  it("names a Slider thumb and focuses it from the label", () => {
    render(
      <Field label="Concurrency">
        <Slider defaultValue={[4]} min={1} max={8} />
      </Field>,
    );
    const thumb = screen.getByRole("slider", { name: "Concurrency" });
    fireEvent.click(screen.getByText("Concurrency"));
    expect(thumb).toHaveFocus();
  });

  it("doesn't override an explicit aria-label", () => {
    render(
      <Field label="Volume">
        <Slider defaultValue={[20]} aria-label="Master volume" />
      </Field>,
    );
    expect(screen.getByRole("slider", { name: "Master volume" })).toBeInTheDocument();
  });

  it("gives custom controls their wiring through useFieldControl", () => {
    function Days() {
      const field = useFieldControl();
      return (
        <div role="group" {...field}>
          <button type="button">Mon</button>
        </div>
      );
    }
    render(
      <Field label="Quiet days" description="No alerts." error="Pick at least one." required>
        <Days />
      </Field>,
    );
    const group = screen.getByRole("group", { name: "Quiet days" });
    expect(group).toHaveAccessibleDescription("Pick at least one.");
    expect(group).toHaveAttribute("aria-invalid", "true");
    fireEvent.click(screen.getByText("Quiet days"));
    expect(screen.getByRole("button", { name: "Mon" })).toHaveFocus();
  });

  it("returns nothing from useFieldControl outside a Field", () => {
    let props: ReturnType<typeof useFieldControl> | undefined;
    function Probe() {
      props = useFieldControl();
      return null;
    }
    render(<Probe />);
    expect(props).toEqual({});
  });

  it("passes color down as --neon-accent", () => {
    const { container } = render(
      <Field label="Alerts" color="lime">
        <input />
      </Field>,
    );
    expect((container.firstChild as HTMLElement).style.getPropertyValue("--neon-accent")).toBe("163 230 53");
  });
});

describe("Label, FieldDescription and FieldError", () => {
  it("work on their own", () => {
    render(
      <>
        <Label htmlFor="pw" required>
          Password
        </Label>
        <input id="pw" aria-describedby="pw-hint" />
        <FieldDescription id="pw-hint">At least 12 characters.</FieldDescription>
      </>,
    );
    const input = screen.getByRole("textbox", { name: "Password" });
    expect(input).toHaveAccessibleDescription("At least 12 characters.");
  });

  it("renders no error paragraph without children", () => {
    const { container } = render(<FieldError />);
    expect(container).toBeEmptyDOMElement();
  });
});
