"use client";

import { Dropdown, type DropdownOption } from "@/components/dropdown";

const basicOptions: DropdownOption[] = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" },
];

export default function StatusDropdowns() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
      <Dropdown
        variant="neon-destructive"
        options={basicOptions}
        placeholder="Error state..."
        label="Error State"
        error
        helperText="Please select a valid option"
      />
      <Dropdown
        variant="neon-success"
        options={basicOptions}
        placeholder="Success state..."
        label="Success State"
        success
        helperText="Great choice!"
      />
      <Dropdown
        variant="neon-warning"
        options={basicOptions}
        placeholder="Loading state..."
        label="Loading State"
        loading
        helperText="Loading options..."
      />
      <Dropdown
        options={basicOptions}
        placeholder="Disabled state..."
        label="Disabled State"
        disabled
        helperText="This dropdown is disabled"
      />
    </div>
  );
}
