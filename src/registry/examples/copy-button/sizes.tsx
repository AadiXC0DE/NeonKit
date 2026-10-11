import { CopyButton } from "@/components/ui/copy-button";

export default function CopyButtonSizes() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-wrap items-center justify-center gap-4">
        <CopyButton value="#22d3ee" size="sm" variant="outline" aria-label="Copy hex, small" />
        <CopyButton value="#22d3ee" size="md" variant="outline" aria-label="Copy hex, medium" />
        <CopyButton value="#22d3ee" size="lg" variant="outline" aria-label="Copy hex, large" />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <CopyButton value="#22d3ee" size="sm" variant="outline">
          #22d3ee
        </CopyButton>
        <CopyButton value="#22d3ee" size="md" variant="outline">
          #22d3ee
        </CopyButton>
        <CopyButton value="#22d3ee" size="lg" variant="outline">
          #22d3ee
        </CopyButton>
      </div>
    </div>
  );
}
