import { PromptInput } from "@/components/ui/prompt-input";

export default function PromptInputDisabled() {
  return (
    <div className="grid w-full max-w-2xl gap-3">
      <PromptInput disabled placeholder="This thread is archived" />
      <p className="px-1 text-[13px] text-white/50">Archived threads are read-only. Duplicate it to keep going.</p>
    </div>
  );
}
