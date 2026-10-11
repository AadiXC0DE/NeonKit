import { CircularProgress } from "@/components/ui/progress";

const usage = [
  { label: "Storage", value: 72, detail: "36 of 50 GB" },
  { label: "Bandwidth", value: 41, detail: "410 GB of 1 TB" },
  { label: "Build minutes", value: 90, detail: "5,400 of 6,000", color: "amber" },
];

export default function ProgressCircular() {
  return (
    <div className="flex w-full flex-wrap justify-center gap-3">
      {usage.map(({ label, value, detail, color }) => (
        <div
          key={label}
          className="flex w-36 flex-col items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-3 pt-5 pb-4 text-center"
        >
          <CircularProgress value={value} size={76} color={color} aria-label={`${label} used`}>
            <span className="grid gap-1 leading-none">
              <span className="text-base">{value}%</span>
              <span className="text-[10px] font-normal text-white/45">used</span>
            </span>
          </CircularProgress>
          <div className="grid gap-0.5">
            <p className="text-sm text-white/90">{label}</p>
            <p className="text-xs tabular-nums text-white/45">{detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
