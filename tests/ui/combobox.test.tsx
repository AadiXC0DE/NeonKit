import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";

const people: ComboboxOption[] = [
  { value: "maya", label: "Maya Chen", description: "Design lead", group: "Design" },
  { value: "theo", label: "Theo Laurent", description: "Product designer", group: "Design" },
  { value: "ines", label: "Inès Moreau", description: "Platform", group: "Engineering" },
  { value: "kai", label: "Kai Nakamura", description: "On leave", group: "Engineering", disabled: true },
  { value: "sam", label: "Sam Okafor", description: "Frontend", group: "Engineering" },
];

function input() {
  return screen.getByRole("combobox");
}

describe("Combobox", () => {
  it("is an editable combobox named by its label", () => {
    render(<Combobox label="Assignee" options={people} />);
    const field = screen.getByRole("combobox", { name: "Assignee" });
    expect(field.tagName).toBe("INPUT");
    expect(field).toHaveAttribute("aria-autocomplete", "list");
    expect(field).toHaveAttribute("aria-expanded", "false");
  });

  it("opens on ArrowDown with the first option active", () => {
    render(<Combobox label="Assignee" options={people} />);
    fireEvent.keyDown(input(), { key: "ArrowDown" });
    expect(input()).toHaveAttribute("aria-expanded", "true");
    const listbox = screen.getByRole("listbox", { name: "Assignee" });
    expect(input()).toHaveAttribute("aria-controls", listbox.id);
    const first = screen.getByRole("option", { name: /Maya Chen/ });
    expect(input()).toHaveAttribute("aria-activedescendant", first.id);
  });

  it("groups options under headings", () => {
    render(<Combobox label="Assignee" options={people} />);
    fireEvent.keyDown(input(), { key: "ArrowDown" });
    const design = screen.getByRole("group", { name: "Design" });
    expect(within(design).getAllByRole("option")).toHaveLength(2);
    expect(screen.getByRole("group", { name: "Engineering" })).toBeInTheDocument();
  });

  it("filters as you type, ignoring accents, and highlights the match", () => {
    render(<Combobox label="Assignee" options={people} />);
    fireEvent.change(input(), { target: { value: "ines" } });
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent("Inès Moreau");
    expect(options[0].querySelector("mark")).toHaveTextContent("Inès");
  });

  it("matches descriptions too", () => {
    render(<Combobox label="Assignee" options={people} />);
    fireEvent.change(input(), { target: { value: "front" } });
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByRole("option")).toHaveTextContent("Sam Okafor");
  });

  it("picks the active option with Enter", () => {
    const onValueChange = vi.fn();
    render(<Combobox label="Assignee" options={people} onValueChange={onValueChange} />);
    fireEvent.change(input(), { target: { value: "theo" } });
    fireEvent.keyDown(input(), { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith("theo");
    expect(input()).toHaveValue("Theo Laurent");
    expect(input()).toHaveAttribute("aria-expanded", "false");
  });

  it("skips disabled options with the arrow keys and wraps", () => {
    render(<Combobox label="Assignee" options={people} />);
    fireEvent.keyDown(input(), { key: "ArrowDown" });
    fireEvent.keyDown(input(), { key: "ArrowDown" });
    fireEvent.keyDown(input(), { key: "ArrowDown" });
    fireEvent.keyDown(input(), { key: "ArrowDown" });
    const sam = screen.getByRole("option", { name: /Sam Okafor/ });
    expect(input()).toHaveAttribute("aria-activedescendant", sam.id);
    fireEvent.keyDown(input(), { key: "ArrowDown" });
    const maya = screen.getByRole("option", { name: /Maya Chen/ });
    expect(input()).toHaveAttribute("aria-activedescendant", maya.id);
    fireEvent.keyDown(input(), { key: "End" });
    expect(input()).toHaveAttribute("aria-activedescendant", sam.id);
  });

  it("selects on click and marks the option selected", () => {
    render(<Combobox label="Assignee" options={people} defaultValue="maya" />);
    expect(input()).toHaveValue("Maya Chen");
    fireEvent.click(input());
    expect(screen.getByRole("option", { name: /Maya Chen/ })).toHaveAttribute("aria-selected", "true");
    fireEvent.click(screen.getByRole("option", { name: /Sam Okafor/ }));
    expect(input()).toHaveValue("Sam Okafor");
  });

  it("closes on Escape and restores the selected label", () => {
    render(<Combobox label="Assignee" options={people} defaultValue="maya" />);
    fireEvent.change(input(), { target: { value: "sa" } });
    expect(input()).toHaveAttribute("aria-expanded", "true");
    fireEvent.keyDown(input(), { key: "Escape" });
    expect(input()).toHaveAttribute("aria-expanded", "false");
    expect(input()).toHaveValue("Maya Chen");
  });

  it("clears the value when the text is emptied and the field is left", () => {
    const onValueChange = vi.fn();
    render(<Combobox label="Assignee" options={people} defaultValue="maya" onValueChange={onValueChange} />);
    fireEvent.change(input(), { target: { value: "" } });
    fireEvent.blur(input());
    expect(onValueChange).toHaveBeenCalledWith("");
    expect(input()).toHaveValue("");
  });

  it("shows the empty text when nothing matches", () => {
    render(<Combobox label="Assignee" options={people} emptyText="Nobody by that name." />);
    fireEvent.change(input(), { target: { value: "zzz" } });
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(within(screen.getByRole("listbox")).getByText("Nobody by that name.")).toBeInTheDocument();
  });

  it("offers to create a missing option", () => {
    const onCreate = vi.fn(() => "priya");
    const onValueChange = vi.fn();
    render(
      <Combobox label="Assignee" options={people} creatable onCreate={onCreate} onValueChange={onValueChange} />,
    );
    fireEvent.change(input(), { target: { value: "Priya" } });
    const create = screen.getByRole("option", { name: /Create/ });
    expect(create).toHaveTextContent("Create “Priya”");
    expect(input()).toHaveAttribute("aria-activedescendant", create.id);
    fireEvent.keyDown(input(), { key: "Enter" });
    expect(onCreate).toHaveBeenCalledWith("Priya");
    expect(onValueChange).toHaveBeenCalledWith("priya");
  });

  it("leaves filtering to the server when onSearchChange is set", () => {
    const onSearchChange = vi.fn();
    render(<Combobox label="Assignee" options={people} onSearchChange={onSearchChange} loading />);
    fireEvent.change(input(), { target: { value: "zzz" } });
    expect(onSearchChange).toHaveBeenCalledWith("zzz");
    expect(screen.getAllByRole("option")).toHaveLength(people.length);
    expect(screen.getByRole("listbox")).toHaveAttribute("aria-busy", "true");
  });

  it("shows a loading row while there are no options yet", () => {
    render(<Combobox label="Airport" options={[]} loading onSearchChange={() => {}} />);
    fireEvent.change(input(), { target: { value: "lis" } });
    expect(screen.getByText("Searching…")).toBeInTheDocument();
  });

  it("submits the value through a hidden input", () => {
    const { container } = render(<Combobox label="Assignee" name="assignee" options={people} defaultValue="ines" />);
    expect(container.querySelector('input[type="hidden"][name="assignee"]')).toHaveValue("ines");
  });

  it("carries an explicit color on the outer block", () => {
    const { container } = render(<Combobox label="Assignee" options={people} color="violet" />);
    expect((container.firstElementChild as HTMLElement).style.getPropertyValue("--neon")).toBe("168 85 247");
  });
});

describe("Combobox multiple", () => {
  it("adds chips, keeps the list open and removes the last chip with Backspace", () => {
    const onValueChange = vi.fn();
    render(<Combobox multiple label="Reviewers" options={people} onValueChange={onValueChange} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();

    fireEvent.change(input(), { target: { value: "maya" } });
    fireEvent.keyDown(input(), { key: "Enter" });
    expect(onValueChange).toHaveBeenLastCalledWith(["maya"]);
    expect(input()).toHaveValue("");
    expect(input()).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("listbox")).toHaveAttribute("aria-multiselectable", "true");
    expect(screen.getByRole("button", { name: "Remove Maya Chen" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("option", { name: /Sam Okafor/ }));
    expect(onValueChange).toHaveBeenLastCalledWith(["maya", "sam"]);

    fireEvent.keyDown(input(), { key: "Backspace" });
    expect(onValueChange).toHaveBeenLastCalledWith(["maya"]);
    expect(screen.queryByRole("button", { name: "Remove Sam Okafor" })).not.toBeInTheDocument();
  });

  it("toggles a picked option off again", () => {
    const onValueChange = vi.fn();
    render(
      <Combobox multiple label="Reviewers" options={people} defaultValue={["theo"]} onValueChange={onValueChange} />,
    );
    fireEvent.click(input());
    const theo = screen.getByRole("option", { name: /Theo Laurent/ });
    expect(theo).toHaveAttribute("aria-selected", "true");
    fireEvent.click(theo);
    expect(onValueChange).toHaveBeenLastCalledWith([]);
  });

  it("removes a chip from its button", () => {
    render(<Combobox multiple label="Reviewers" options={people} defaultValue={["theo", "ines"]} />);
    fireEvent.click(screen.getByRole("button", { name: "Remove Theo Laurent" }));
    expect(screen.queryByRole("button", { name: "Remove Theo Laurent" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove Inès Moreau" })).toBeInTheDocument();
  });

  it("submits one hidden input per value", () => {
    const { container } = render(
      <Combobox multiple name="reviewers" label="Reviewers" options={people} defaultValue={["theo", "sam"]} />,
    );
    const hidden = Array.from(container.querySelectorAll<HTMLInputElement>('input[name="reviewers"]'));
    expect(hidden.map((element) => element.value)).toEqual(["theo", "sam"]);
  });
});
