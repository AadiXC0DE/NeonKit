import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function RadioGroupHorizontal() {
  return (
    <div className="flex flex-col items-center gap-4">
      <p id="row-density" className="text-sm text-white/55">
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
