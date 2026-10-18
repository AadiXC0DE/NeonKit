import { Spinner } from "@/components/ui/spinner";

// One row per variant, each in the kind of moment it suits.
const activity = [
  { variant: "ring", title: "Building acme-web", detail: "Step 3 of 5 · compiling routes", meta: "0:42", label: "Building" },
  { variant: "dots", title: "Ana is typing", detail: "#launch-q4", meta: null, label: "Ana is typing" },
  { variant: "bars", title: "Recording voice note", detail: "Built-in microphone", meta: "0:07", label: "Recording" },
  { variant: "orbit", title: "Connecting to fra1", detail: "Attempt 2 of 5", meta: null, label: "Connecting" },
] as const;

export default function SpinnerDemo() {
  return (
    <ul className="w-full max-w-sm divide-y divide-white/[0.06] rounded-xl border border-white/10 bg-white/[0.02]">
      {activity.map((row) => (
        <li key={row.variant} className="flex items-center gap-3.5 px-4 py-3">
          <span className="flex size-6 shrink-0 items-center justify-center">
            <Spinner variant={row.variant} label={row.label} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white/90">{row.title}</p>
            <p className="truncate text-xs text-white/50">{row.detail}</p>
          </div>
          {row.meta && <span className="shrink-0 font-mono text-xs tabular-nums text-white/55">{row.meta}</span>}
        </li>
      ))}
    </ul>
  );
}
