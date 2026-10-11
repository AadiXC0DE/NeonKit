import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function RadioGroupDemo() {
  return (
    <div className="w-full max-w-xs">
      <p id="shipping-speed" className="mb-4 text-sm font-medium text-white/90">
        Shipping speed
      </p>
      <RadioGroup defaultValue="express" aria-labelledby="shipping-speed" className="gap-4">
        <RadioGroupItem value="standard" label="Standard" description="4–6 business days · Free" />
        <RadioGroupItem value="express" label="Express" description="2–3 business days · $9.00" />
        <RadioGroupItem value="overnight" label="Overnight" description="Next business day · $24.00" />
      </RadioGroup>
    </div>
  );
}
