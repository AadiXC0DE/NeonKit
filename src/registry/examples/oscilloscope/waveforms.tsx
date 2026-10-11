import { Oscilloscope, type OscilloscopeWave } from "@/components/ui/oscilloscope";

const waves: { wave: OscilloscopeWave; label: string }[] = [
  { wave: "sine", label: "Sine" },
  { wave: "square", label: "Square" },
  { wave: "saw", label: "Saw" },
  { wave: "triangle", label: "Triangle" },
];

export default function OscilloscopeWaveforms() {
  return (
    <div className="grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
      {waves.map(({ wave, label }) => (
        <figure key={wave} className="grid gap-2">
          <Oscilloscope wave={wave} frequency={2} amplitude={0.62} className="aspect-[16/9] rounded-xl" />
          <figcaption className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">{label}</figcaption>
        </figure>
      ))}
    </div>
  );
}
