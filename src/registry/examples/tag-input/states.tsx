import { TagInput } from "@/components/ui/tag-input";

export default function TagInputStates() {
  return (
    <div className="grid w-full max-w-sm gap-5">
      <TagInput size="sm" aria-label="Keywords" placeholder="Keywords" defaultValue={["changelog", "release"]} />
      <TagInput aria-label="Keywords" placeholder="Keywords" defaultValue={["changelog", "release"]} />
      <TagInput size="lg" aria-label="Keywords" placeholder="Keywords" defaultValue={["changelog", "release"]} />
      <TagInput label="Allowed domains" placeholder="example.com" error="Add at least one domain before saving." />
      <TagInput
        label="Blocked words"
        defaultValue={["spam", "giveaway"]}
        description="Managed by your organization."
        disabled
      />
    </div>
  );
}
