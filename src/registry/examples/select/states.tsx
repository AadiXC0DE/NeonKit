import { Select } from "@/components/ui/select";

const plans = [
  { value: "hobby", label: "Hobby" },
  { value: "pro", label: "Pro" },
  { value: "enterprise", label: "Enterprise" },
];

const timezones = [
  { value: "America/Los_Angeles", label: "Pacific Time", description: "Los Angeles · UTC−8" },
  { value: "America/New_York", label: "Eastern Time", description: "New York · UTC−5" },
  { value: "Europe/London", label: "Greenwich Mean Time", description: "London · UTC+0" },
  { value: "Europe/Berlin", label: "Central European Time", description: "Berlin · UTC+1" },
  { value: "Asia/Kolkata", label: "India Standard Time", description: "Kolkata · UTC+5:30" },
  { value: "Asia/Tokyo", label: "Japan Standard Time", description: "Tokyo · UTC+9" },
];

export default function SelectStates() {
  return (
    <div className="grid w-full max-w-xs gap-5">
      <Select
        label="Timezone"
        placeholder="Choose a timezone"
        options={timezones}
        error="Pick a timezone so the weekly report lands on Monday morning."
      />
      <Select
        label="Plan"
        options={plans}
        defaultValue="pro"
        description="Only workspace owners can change the plan."
        disabled
      />
    </div>
  );
}
