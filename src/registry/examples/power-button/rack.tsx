import { Fan, Lightbulb, Speaker } from "@/components/ui/icons";
import { PowerButton } from "@/components/ui/power-button";

const channels = [
  { label: "Amp", color: "amber", icon: <Speaker />, on: true },
  { label: "Stage", color: "magenta", icon: <Lightbulb />, on: true },
  { label: "Fans", color: "lime", icon: <Fan />, on: false },
] as const;

export default function PowerButtonRack() {
  return (
    <div className="flex items-start gap-8 rounded-2xl border border-white/[0.06] bg-[linear-gradient(180deg,#12141b,#0a0b10)] px-8 py-6">
      {channels.map(({ label, color, icon, on }) => (
        <div key={label} className="flex flex-col items-center gap-3">
          <PowerButton size="lg" color={color} icon={icon} defaultPressed={on} aria-label={`${label} power`} />
          <span className="text-xs font-medium text-white/60">{label}</span>
        </div>
      ))}
    </div>
  );
}
