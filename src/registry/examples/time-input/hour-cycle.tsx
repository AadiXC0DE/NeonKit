import { TimeInput } from "@/components/ui/time-input";

export default function TimeInputHourCycle() {
  return (
    <div className="grid w-full max-w-sm grid-cols-2 gap-3">
      <TimeInput label="New York" hourCycle={12} defaultValue="09:30" description="12-hour clock" />
      <TimeInput label="Berlin" hourCycle={24} defaultValue="15:30" description="24-hour clock" />
    </div>
  );
}
