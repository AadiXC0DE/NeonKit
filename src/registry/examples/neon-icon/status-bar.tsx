import { NeonIcon } from "@/components/ui/neon-icon";

const states = [
  { note: "Connected", signal: 0.75, signalSearching: false, wifi: 1, battery: 0.82, charging: false, time: "9:41" },
  { note: "Roaming, plugged in", signal: 0.25, signalSearching: false, wifi: 0, battery: 0.47, charging: true, time: "23:08" },
  { note: "No service, battery low", signal: 0, signalSearching: true, wifi: 0, battery: 0.12, charging: false, time: "6:15" },
];

export default function NeonIconStatusBar() {
  return (
    <div className="grid w-full max-w-sm gap-4">
      {states.map((state) => (
        <div key={state.note} className="grid gap-1.5">
          <div className="flex h-10 items-center justify-between rounded-full border border-white/10 bg-[#0a0b11] px-5">
            <span className="text-sm font-semibold tabular-nums text-white/90">{state.time}</span>
            <span className="flex items-center gap-1.5">
              <NeonIcon icon="signal" size="sm" value={state.signal} animated={state.signalSearching} />
              {state.wifi > 0 && <NeonIcon icon="wifi" size="sm" value={state.wifi} />}
              <NeonIcon icon="battery" size={22} value={state.battery} animated={state.charging} />
            </span>
          </div>
          <p className="px-5 text-xs text-white/55">{state.note}</p>
        </div>
      ))}
    </div>
  );
}
