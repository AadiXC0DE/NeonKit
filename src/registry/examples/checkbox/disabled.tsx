import { Checkbox } from "@/components/ui/checkbox";

export default function CheckboxDisabled() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      <Checkbox
        disabled
        label="Sync over cellular"
        description="Available on the Pro plan."
      />
      <Checkbox
        disabled
        defaultChecked
        label="Encrypt backups"
        description="Required by your organization's security policy."
      />
    </div>
  );
}
