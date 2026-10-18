import { Heartbeat } from "@/components/ui/heartbeat";

const rates = [
  { bpm: 52, label: "Asleep" },
  { bpm: 96, label: "Brisk walk" },
  { bpm: 148, label: "Tempo run" },
];

export default function HeartbeatRates() {
  return (
    <div className="grid w-full max-w-xl gap-3">
      {rates.map((rate) => (
        <div
          key={rate.bpm}
          className="grid grid-cols-[6rem_1fr] items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2"
        >
          <div>
            <p className="font-mono text-xl tabular-nums leading-tight text-white/90">
              {rate.bpm}
              <span className="ml-1 text-[11px] text-white/55">bpm</span>
            </p>
            <p className="text-xs text-white/55">{rate.label}</p>
          </div>
          <Heartbeat bpm={rate.bpm} height={56} />
        </div>
      ))}
    </div>
  );
}
