"use client";

import { Dropdown, type DropdownOption } from "@/components/dropdown";

const basicOptions: DropdownOption[] = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" },
];

export default function SizeDropdowns() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
      <Dropdown
        variant="neon-cyan"
        options={basicOptions}
        placeholder="Small dropdown..."
        label="Small (sm)"
        size="sm"
      />
      <Dropdown
        variant="neon-purple"
        options={basicOptions}
        placeholder="Default dropdown..."
        label="Default"
        size="default"
      />
      <Dropdown
        variant="neon-chartreuse"
        options={basicOptions}
        placeholder="Large dropdown..."
        label="Large (lg)"
        size="lg"
      />
      <Dropdown
        variant="neon-pink"
        options={basicOptions}
        placeholder="Extra large dropdown..."
        label="Extra Large (xl)"
        size="xl"
      />
    </div>
  );
}
