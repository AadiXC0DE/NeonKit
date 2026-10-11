import { RetroGrid } from "@/components/ui/retro-grid";

export default function RetroGridDemo() {
  return (
    <div className="relative flex h-80 w-full items-start justify-center overflow-hidden rounded-xl bg-[#05060a] pt-14">
      <RetroGrid />
      <p className="relative text-center text-4xl font-semibold tracking-tight text-white/90">
        Drive
        <span className="block text-sm font-normal tracking-[0.4em] text-white/40 uppercase">
          into the night
        </span>
      </p>
    </div>
  );
}
