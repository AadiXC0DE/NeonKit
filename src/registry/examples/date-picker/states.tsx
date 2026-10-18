import { DatePicker } from "@/components/ui/date-picker";

export default function DatePickerStates() {
  return (
    <div className="grid w-full max-w-xs gap-5">
      <DatePicker size="sm" aria-label="Start date" defaultValue={new Date(2026, 9, 12)} />
      <DatePicker
        label="Passport expiry"
        defaultValue={new Date(2026, 11, 3)}
        error="Your passport must be valid for six months after you travel."
      />
      <DatePicker size="lg" label="Ship date" defaultValue={new Date(2026, 9, 20)} disabled description="Locked once the order ships." />
    </div>
  );
}
