import { RetroGrid } from "@/components/ui/retro-grid";

export default function RetroGridDemo() {
  return (
    <div className="relative flex h-80 w-full items-start justify-center overflow-hidden rounded-xl bg-[#05060a] pt-14">
      <RetroGrid />
      <p className="relative text-center text-4xl font-semibold tracking-tight text-white/90">
        Drive
        <span className="mt-1 block text-base font-normal tracking-normal text-white/55">into the night</span>
      </p>
    </div>
  );
}
