import { NumberInput } from "@/components/ui/number-input";

export default function NumberInputStates() {
  return (
    <div className="grid w-full max-w-xs gap-5">
      <NumberInput size="sm" aria-label="Replicas" defaultValue={2} min={1} max={20} />
      <NumberInput aria-label="Replicas" defaultValue={3} min={1} max={20} />
      <NumberInput size="lg" aria-label="Replicas" defaultValue={4} min={1} max={20} />
      <NumberInput
        label="Timeout"
        defaultValue={900}
        min={1}
        max={300}
        trailing="seconds"
        error="Functions on this plan time out after 300 seconds."
      />
      <NumberInput
        label="Monthly spend cap"
        defaultValue={500}
        formatOptions={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
        locale="en-US"
        description="Set by your billing admin."
        disabled
      />
    </div>
  );
}
