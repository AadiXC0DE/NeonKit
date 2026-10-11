import { Textarea } from "@/components/ui/textarea";

export default function TextareaStates() {
  return (
    <div className="grid w-full max-w-md gap-5">
      <Textarea
        label="Release notes"
        placeholder="What changed in 3.0?"
        error="Major releases need release notes before they can ship."
        minRows={2}
      />
      <Textarea
        label="Commit message"
        defaultValue="chore: bump motion to 14.1.0"
        description="Generated from the merge commit."
        minRows={1}
        disabled
      />
    </div>
  );
}
