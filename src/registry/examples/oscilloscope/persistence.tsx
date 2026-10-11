import { Oscilloscope } from "@/components/ui/oscilloscope";

const settings = [
  { persistence: 0, label: "0 · digital" },
  { persistence: 0.85, label: "0.85 · default" },
  { persistence: 0.96, label: "0.96 · long glow" },
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
            className="aspect-square rounded-xl"
          />
          <figcaption className="font-mono text-[11px] tracking-[0.08em] text-white/45">{label}</figcaption>
        </figure>
      ))}
    </div>
  );
}
