import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "@/components/ui/checkbox";
import { ColorPicker } from "@/components/ui/color-picker";
import { Rating } from "@/components/ui/rating";
import { Combobox } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { OTPInput } from "@/components/ui/otp-input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { TagInput } from "@/components/ui/tag-input";
import { Textarea } from "@/components/ui/textarea";
import { TimeInput } from "@/components/ui/time-input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

/** Resets the form the way a <button type="reset"> does, then lets effects settle. */
async function reset(form: HTMLFormElement) {
  await act(async () => {
    form.reset();
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
}

function formOf(container: HTMLElement) {
  return container.querySelector("form") as HTMLFormElement;
}

const plans = [
  { value: "hobby", label: "Hobby" },
  { value: "pro", label: "Pro" },
  { value: "team", label: "Team" },
];

describe("form reset", () => {
  it("Checkbox follows the native box back to its starting state", async () => {
    const onCheckedChange = vi.fn();
    const { container } = render(
      <form>
        <Checkbox name="terms" label="Accept terms" onCheckedChange={onCheckedChange} />
      </form>,
    );
    const box = screen.getByRole("checkbox", { name: "Accept terms" });
    fireEvent.click(box);
    expect(box).toBeChecked();
    await reset(formOf(container));
    expect(box).not.toBeChecked();
    expect(box.closest("label")).toHaveAttribute("data-state", "unchecked");
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
  });

  it("Switch goes back to defaultChecked", async () => {
    const { container } = render(
      <form>
        <Switch name="alerts" defaultChecked aria-label="Alerts" />
      </form>,
    );
    const control = screen.getByRole("switch", { name: "Alerts" });
    fireEvent.click(control);
    expect(control).toHaveAttribute("aria-checked", "false");
    await reset(formOf(container));
    expect(control).toHaveAttribute("aria-checked", "true");
    expect((container.querySelector('input[name="alerts"]') as HTMLInputElement).checked).toBe(true);
  });

  it("RadioGroup goes back to its default value", async () => {
    const { container } = render(
      <form>
        <RadioGroup name="plan" defaultValue="hobby" aria-label="Plan">
          <RadioGroupItem value="hobby" label="Hobby" />
          <RadioGroupItem value="pro" label="Pro" />
        </RadioGroup>
      </form>,
    );
    fireEvent.click(screen.getByRole("radio", { name: "Pro" }));
    expect(screen.getByRole("radio", { name: "Pro" })).toBeChecked();
    await reset(formOf(container));
    expect(screen.getByRole("radio", { name: "Hobby" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Hobby" }).closest("label")).toHaveAttribute("data-state", "checked");
  });

  it("Select goes back to its default value", async () => {
    const { container } = render(
      <form>
        <Select name="plan" aria-label="Plan" options={plans} defaultValue="hobby" />
      </form>,
    );
    const trigger = screen.getByRole("combobox", { name: "Plan" });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("option", { name: "Team" }));
    expect(trigger).toHaveTextContent("Team");
    await reset(formOf(container));
    expect(trigger).toHaveTextContent("Hobby");
    expect(new FormData(formOf(container)).get("plan")).toBe("hobby");
  });

  it("Slider puts the thumb back", async () => {
    const { container } = render(
      <form>
        <Slider name="volume" aria-label="Volume" defaultValue={[40]} />
      </form>,
    );
    const thumb = screen.getByRole("slider", { name: "Volume" });
    fireEvent.keyDown(thumb, { key: "End" });
    expect(thumb).toHaveAttribute("aria-valuenow", "100");
    await reset(formOf(container));
    expect(thumb).toHaveAttribute("aria-valuenow", "40");
  });

  it("ToggleGroup goes back to its default selection and submits it", async () => {
    const { container } = render(
      <form>
        <ToggleGroup name="range" defaultValue="week" aria-label="Range">
          <ToggleGroupItem value="day">Day</ToggleGroupItem>
          <ToggleGroupItem value="week">Week</ToggleGroupItem>
        </ToggleGroup>
      </form>,
    );
    fireEvent.click(screen.getByRole("radio", { name: "Day" }));
    expect(new FormData(formOf(container)).get("range")).toBe("day");
    await reset(formOf(container));
    expect(screen.getByRole("radio", { name: "Week" })).toHaveAttribute("aria-checked", "true");
    expect(new FormData(formOf(container)).get("range")).toBe("week");
  });

  it("OTPInput empties with the form", async () => {
    const { container } = render(
      <form>
        <OTPInput name="code" length={4} />
      </form>,
    );
    const first = screen.getByRole("textbox", { name: "Digit 1 of 4" });
    fireEvent.change(first, { target: { value: "1234" } });
    expect(new FormData(formOf(container)).get("code")).toBe("1234");
    await reset(formOf(container));
    expect(new FormData(formOf(container)).get("code")).toBe("");
  });

  it("NumberInput goes back to its default value", async () => {
    const { container } = render(
      <form>
        <NumberInput name="seats" aria-label="Seats" defaultValue={3} />
      </form>,
    );
    const input = screen.getByRole("spinbutton", { name: "Seats" });
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input).toHaveAttribute("aria-valuenow", "4");
    await reset(formOf(container));
    expect(input).toHaveAttribute("aria-valuenow", "3");
  });

  it("TagInput puts its starting tags back", async () => {
    const { container } = render(
      <form>
        <TagInput name="topics" aria-label="Topics" defaultValue={["react"]} />
      </form>,
    );
    const input = screen.getByRole("textbox", { name: "Topics" });
    fireEvent.change(input, { target: { value: "vue" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(new FormData(formOf(container)).getAll("topics")).toEqual(["react", "vue"]);
    await reset(formOf(container));
    expect(new FormData(formOf(container)).getAll("topics")).toEqual(["react"]);
  });

  it("Combobox puts its starting selection back", async () => {
    const { container } = render(
      <form>
        <Combobox name="plan" aria-label="Plan" options={plans} defaultValue="pro" />
      </form>,
    );
    const input = screen.getByRole("combobox", { name: "Plan" });
    fireEvent.click(input);
    fireEvent.click(screen.getByRole("option", { name: "Team" }));
    expect(new FormData(formOf(container)).get("plan")).toBe("team");
    await reset(formOf(container));
    expect(new FormData(formOf(container)).get("plan")).toBe("pro");
    expect(input).toHaveValue("Pro");
  });

  it("TimeInput goes back to its default time", async () => {
    const { container } = render(
      <form>
        <TimeInput name="start" label="Start" defaultValue="09:30" hourCycle={24} />
      </form>,
    );
    const hours = screen.getByRole("spinbutton", { name: "Hours" });
    fireEvent.keyDown(hours, { key: "ArrowUp" });
    expect(new FormData(formOf(container)).get("start")).toBe("10:30");
    await reset(formOf(container));
    expect(new FormData(formOf(container)).get("start")).toBe("09:30");
  });

  it("DatePicker goes back to its default date", async () => {
    const { container } = render(
      <form>
        <DatePicker name="due" label="Due" defaultValue={new Date(2026, 9, 12)} />
      </form>,
    );
    expect(new FormData(formOf(container)).get("due")).toBe("2026-10-12");
    fireEvent.click(screen.getByRole("button", { name: "Clear date" }));
    expect(new FormData(formOf(container)).get("due")).toBe("");
    await reset(formOf(container));
    expect(new FormData(formOf(container)).get("due")).toBe("2026-10-12");
  });

  it("Textarea re-counts after a reset", async () => {
    const { container } = render(
      <form>
        <Textarea aria-label="Bio" defaultValue="Hi" maxLength={20} showCount />
      </form>,
    );
    const textarea = screen.getByRole("textbox", { name: "Bio" });
    fireEvent.change(textarea, { target: { value: "Hello there" } });
    expect(container).toHaveTextContent("11 / 20");
    await act(async () => {
      formOf(container).reset();
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    });
    expect(container).toHaveTextContent("2 / 20");
  });
});

describe("form reset, display controls", () => {
  it("Rating goes back to its default", async () => {
    const { container } = render(
      <form>
        <Rating name="score" aria-label="Score" defaultValue={2} />
      </form>,
    );
    const slider = screen.getByRole("slider", { name: "Score" });
    fireEvent.keyDown(slider, { key: "End" });
    expect(new FormData(formOf(container)).get("score")).toBe("5");
    await reset(formOf(container));
    expect(new FormData(formOf(container)).get("score")).toBe("2");
  });

  it("ColorPicker goes back to its default", async () => {
    const { container } = render(
      <form>
        <ColorPicker name="brand" aria-label="Brand" defaultValue="#ff5fa2" />
      </form>,
    );
    fireEvent.click(screen.getByRole("radio", { name: "Lime" }));
    expect(new FormData(formOf(container)).get("brand")).not.toBe("#ff5fa2");
    await reset(formOf(container));
    expect(new FormData(formOf(container)).get("brand")).toBe("#ff5fa2");
  });
});

describe("required", () => {
  it("Select blocks submission until something is picked", () => {
    const { container } = render(
      <form>
        <Select name="plan" label="Plan" options={plans} required />
      </form>,
    );
    const form = formOf(container);
    expect(form.checkValidity()).toBe(false);
    expect(screen.getByRole("combobox", { name: /Plan/ })).toHaveAttribute("aria-required", "true");
    fireEvent.click(screen.getByRole("combobox", { name: /Plan/ }));
    fireEvent.click(screen.getByRole("option", { name: "Pro" }));
    expect(form.checkValidity()).toBe(true);
  });

  it("TagInput is satisfied by tags, not by the empty text box", () => {
    const { container } = render(
      <form>
        <TagInput name="topics" aria-label="Topics" required />
      </form>,
    );
    const form = formOf(container);
    expect(form.checkValidity()).toBe(false);
    const input = screen.getByRole("textbox", { name: "Topics" });
    fireEvent.change(input, { target: { value: "react" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(input).toHaveValue("");
    expect(form.checkValidity()).toBe(true);
  });

  it("multiple Combobox is satisfied by its chips", () => {
    const { container } = render(
      <form>
        <Combobox multiple name="plans" aria-label="Plans" options={plans} defaultValue={["pro"]} required />
      </form>,
    );
    expect(formOf(container).checkValidity()).toBe(true);
  });

  it("Combobox doesn't accept typed text that was never picked", () => {
    const { container } = render(
      <form>
        <Combobox name="plan" aria-label="Plan" options={plans} required />
      </form>,
    );
    const input = screen.getByRole("combobox", { name: "Plan" });
    fireEvent.change(input, { target: { value: "Enterprise" } });
    expect(formOf(container).checkValidity()).toBe(false);
  });

  it("OTPInput asks for every slot", () => {
    const { container } = render(
      <form>
        <OTPInput name="code" length={4} required />
      </form>,
    );
    const form = formOf(container);
    fireEvent.change(screen.getByRole("textbox", { name: "Digit 1 of 4" }), { target: { value: "12" } });
    expect(form.checkValidity()).toBe(false);
    fireEvent.change(screen.getByRole("textbox", { name: "Digit 3 of 4" }), { target: { value: "34" } });
    expect(form.checkValidity()).toBe(true);
  });

  it("TimeInput and DatePicker block an empty submit", () => {
    const { container } = render(
      <form>
        <TimeInput name="start" label="Start" hourCycle={24} required />
        <DatePicker name="due" label="Due" required />
      </form>,
    );
    expect(formOf(container).checkValidity()).toBe(false);
    expect(container.querySelectorAll("input:invalid")).toHaveLength(2);
  });

  it("labels show the required dot", () => {
    render(
      <>
        <Input label="Email" required />
        <Textarea label="Notes" required />
        <Select label="Plan" options={plans} required />
      </>,
    );
    expect(screen.getAllByTitle("Required")).toHaveLength(3);
    expect(screen.getByLabelText(/Email/)).toBeRequired();
    expect(screen.getByLabelText(/Notes/)).toBeRequired();
  });
});

describe("rejected on submit", () => {
  it("Input turns invalid when the browser rejects it, and clears on typing", () => {
    const { container } = render(
      <form>
        <Input aria-label="Email" type="email" required />
      </form>,
    );
    const input = screen.getByRole("textbox", { name: "Email" });
    act(() => {
      formOf(container).checkValidity();
    });
    expect(input).toHaveAttribute("aria-invalid", "true");
    fireEvent.input(input, { target: { value: "m" } });
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("Select turns invalid on an empty submit and clears once something is picked", () => {
    const { container } = render(
      <form>
        <Select aria-label="Plan" options={plans} required />
      </form>,
    );
    const trigger = screen.getByRole("combobox", { name: "Plan" });
    act(() => {
      formOf(container).checkValidity();
    });
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("option", { name: "Pro" }));
    expect(trigger).not.toHaveAttribute("aria-invalid");
  });

  it("a reset clears the red state", async () => {
    const { container } = render(
      <form>
        <Textarea aria-label="Notes" required />
      </form>,
    );
    act(() => {
      formOf(container).checkValidity();
    });
    expect(screen.getByRole("textbox", { name: "Notes" })).toHaveAttribute("aria-invalid", "true");
    await reset(formOf(container));
    expect(screen.getByRole("textbox", { name: "Notes" })).not.toHaveAttribute("aria-invalid");
  });
});
