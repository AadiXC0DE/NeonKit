import { CopyButton } from "@/components/ui/copy-button";

const url = "https://cal.example.com/ines/30min";

export default function CopyButtonShareLink() {
  return (
    <div className="w-full min-w-0 max-w-sm space-y-1.5">
      <label htmlFor="share-link" className="text-sm font-medium text-white/90">
        Booking link
      </label>
      <div className="flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] pl-3 pr-1">
        <input
          id="share-link"
          readOnly
          value={url}
          className="min-w-0 flex-1 bg-transparent text-sm text-white/80 outline-none"
        />
        <CopyButton value={url} size="sm" side="bottom" aria-label="Copy booking link" />
      </div>
    </div>
  );
}
