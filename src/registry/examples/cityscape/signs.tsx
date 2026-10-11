import { Cityscape } from "@/components/ui/cityscape";

export default function CityscapeSigns() {
  return (
    <div className="relative flex h-80 w-full flex-col items-center overflow-hidden rounded-xl border border-white/10 bg-[#05060a] px-6 pt-10 text-center">
      <Cityscape
        seed={23}
        signs={[{ text: "NOODLES", color: "amber" }, { text: "BAR", color: "magenta" }, { text: "KARAOKE", color: "cyan" }]}
        style={{ fontFamily: "var(--font-tilt-neon)" }}
      />
      <p className="relative font-mono text-[11px] uppercase tracking-[0.32em] text-white/45">Night market · Thu–Sun</p>
      <h3 className="relative mt-2 text-2xl font-semibold tracking-tight text-white/90">Open until the last bowl</h3>
    </div>
  );
}
