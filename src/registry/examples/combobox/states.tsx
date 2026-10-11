import { Combobox } from "@/components/ui/combobox";

const timezones = [
  { value: "America/Los_Angeles", label: "Pacific Time", description: "Los Angeles · UTC−8" },
  { value: "America/New_York", label: "Eastern Time", description: "New York · UTC−5" },
  { value: "Europe/London", label: "Greenwich Mean Time", description: "London · UTC+0" },
  { value: "Europe/Berlin", label: "Central European Time", description: "Berlin · UTC+1" },
  { value: "Asia/Kolkata", label: "India Standard Time", description: "Kolkata · UTC+5:30" },
  { value: "Asia/Tokyo", label: "Japan Standard Time", description: "Tokyo · UTC+9" },
];

export default function ComboboxStates() {
  return (
    <div className="grid w-full max-w-xs gap-5">
      <Combobox size="sm" aria-label="Timezone" placeholder="Timezone" options={timezones} defaultValue="Europe/London" />
      <Combobox aria-label="Timezone" placeholder="Timezone" options={timezones} defaultValue="Europe/Berlin" />
      <Combobox size="lg" aria-label="Timezone" placeholder="Timezone" options={timezones} defaultValue="Asia/Tokyo" />
      <Combobox
        label="Report timezone"
        placeholder="Search timezones"
        options={timezones}
        error="Pick a timezone so the weekly report lands on Monday morning."
      />
      <Combobox
        label="Workspace timezone"
        options={timezones}
        defaultValue="America/New_York"
        description="Only workspace owners can change this."
        disabled
      />
    </div>
  );
}
