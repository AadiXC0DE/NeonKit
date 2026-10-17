import { ContextMeter } from "@/components/ui/context-meter";

const ROWS = [
  { name: "Fresh session", used: 21_400 },
  { name: "After the refactor plan", used: 142_300 },
  { name: "Reading the full test log", used: 168_900 },
  { name: "One more file and it summarises", used: 193_700 },
];

export default function ContextMeterStates() {
  return (
    <div className="grid w-full max-w-md gap-1">
      {ROWS.map((row) => (
        <div key={row.name} className="flex items-center justify-between gap-4 border-b border-white/[0.06] py-2 last:border-b-0">
          <span className="w-0 flex-1 truncate text-[13.5px] text-white/70">{row.name}</span>
          <ContextMeter size="sm" used={row.used} limit={200_000} label={`Context window, ${row.name}`} />
        </div>
      ))}
      <div className="flex items-center justify-between gap-4 pt-2">
        <span className="w-0 flex-1 truncate text-[13.5px] text-white/70">As a percentage</span>
        <ContextMeter size="sm" used={142_300} limit={200_000} readout="percent" />
      </div>
    </div>
  );
}
