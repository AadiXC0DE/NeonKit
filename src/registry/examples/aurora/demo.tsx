import { Aurora } from "@/components/ui/aurora";

export default function AuroraDemo() {
  return (
    <div className="relative flex h-[360px] w-full flex-col justify-end overflow-hidden rounded-xl border border-white/10 bg-[#05060a] px-7 pb-8 sm:px-10 sm:pb-10">
      <Aurora />
      <h2 className="relative max-w-md text-balance text-3xl font-semibold tracking-tight text-white/90 sm:text-4xl">
        Kp 6 over Tromsø tonight
      </h2>
      <p className="relative mt-2 text-sm text-white/60">
        Clear from <span className="tabular-nums">00:40</span> to <span className="tabular-nums">03:10</span>. Face north from Prestvannet.
      </p>
    </div>
  );
}
