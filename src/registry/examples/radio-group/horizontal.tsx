import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function RadioGroupHorizontal() {
  return (
    <div className="grid gap-3">
      <p id="row-density" className="text-sm font-medium text-white/80">
        Row density
      </p>
      <RadioGroup orientation="horizontal" defaultValue="default" aria-labelledby="row-density">
        <RadioGroupItem value="compact" label="Compact" />
        <RadioGroupItem value="default" label="Default" />
        <RadioGroupItem value="comfortable" label="Comfortable" />
      </RadioGroup>
    </div>
  );
}
