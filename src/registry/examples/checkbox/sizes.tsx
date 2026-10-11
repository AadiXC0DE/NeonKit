import { Checkbox } from "@/components/ui/checkbox";

export default function CheckboxSizes() {
  return (
    <div className="flex flex-col gap-4">
      <Checkbox size="sm" defaultChecked label="Small" />
      <Checkbox size="md" defaultChecked label="Medium" />
      <Checkbox size="lg" defaultChecked label="Large" />
    </div>
  );
}
