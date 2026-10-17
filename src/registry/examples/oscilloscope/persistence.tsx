import { Oscilloscope } from "@/components/ui/oscilloscope";

const settings = [
  { persistence: 0, label: "Digital, no afterglow" },
  { persistence: 0.85, label: "Default phosphor" },
  { persistence: 0.96, label: "Long glow" },
];

export default function OscilloscopePersistence() {
  return (
    <div className="grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
      {settings.map(({ persistence, label }) => (
        <figure key={persistence} className="grid gap-2">
          <Oscilloscope
            wave="sine"
            frequency={1.5}
            speed={0.3}
            persistence={persistence}
            grid={false}
            className="aspect-[2/1] rounded-xl sm:aspect-square"
          />
          <figcaption className="flex items-baseline justify-between gap-3 text-[13px] text-white/55">
            {label}
            <code className="font-mono text-xs tabular-nums text-white/70">{persistence}</code>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
