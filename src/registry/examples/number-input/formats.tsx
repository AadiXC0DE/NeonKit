import { NumberInput } from "@/components/ui/number-input";

export default function NumberInputFormats() {
  return (
    <div className="grid w-full max-w-sm gap-5 sm:grid-cols-2">
      <NumberInput
        label="Discount"
        defaultValue={0.15}
        min={0}
        max={1}
        step={0.01}
        largeStep={0.1}
        formatOptions={{ style: "percent" }}
        locale="en-US"
      />
      <NumberInput
        label="Parcel weight"
        defaultValue={2.4}
        min={0.1}
        max={30}
        step={0.1}
        largeStep={1}
        formatOptions={{ style: "unit", unit: "kilogram", maximumFractionDigits: 1 }}
        locale="en-US"
      />
      <NumberInput
        label="Monatsbudget"
        defaultValue={1250}
        min={0}
        step={50}
        largeStep={500}
        formatOptions={{ style: "currency", currency: "EUR" }}
        locale="de-DE"
        description="Typed as 1.250,00 €"
      />
      <NumberInput
        label="Requests per minute"
        defaultValue={12000}
        min={100}
        max={1000000}
        step={100}
        largeStep={1000}
        formatOptions={{ notation: "compact" }}
        locale="en-US"
        description="Compact notation, 12K"
      />
    </div>
  );
}
