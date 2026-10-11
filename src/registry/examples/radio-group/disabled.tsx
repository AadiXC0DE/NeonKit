import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function RadioGroupDisabled() {
  return (
    <div className="w-full max-w-xs">
      <p id="backup-frequency" className="mb-4 text-sm font-medium text-white/90">
        Backup frequency
      </p>
      <RadioGroup defaultValue="daily" aria-labelledby="backup-frequency" className="gap-4">
        <RadioGroupItem
          value="hourly"
          label="Hourly"
          description="Available on the Team plan."
          disabled
        />
        <RadioGroupItem value="daily" label="Daily" description="Every night at 02:00 UTC." />
        <RadioGroupItem value="weekly" label="Weekly" description="Sundays at 02:00 UTC." />
      </RadioGroup>
    </div>
  );
}
