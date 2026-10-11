import { Checkbox } from "@/components/ui/checkbox";

export default function CheckboxDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      <Checkbox
        defaultChecked
        label="Accept terms and conditions"
        description="You agree to our Terms of Service and Privacy Policy."
      />
      <Checkbox
        label="Send me product updates"
        description="One email a month about new components."
      />
    </div>
  );
}
