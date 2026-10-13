import { Aurora } from "@/components/ui/aurora";

export default function AuroraDemo() {
  return (
    <div className="relative flex h-[360px] w-full flex-col justify-end overflow-hidden rounded-xl border border-white/10 bg-[#05060a] px-7 pb-8 sm:px-10 sm:pb-10">
      <Aurora />
      <h2 className="relative max-w-sm text-3xl font-semibold tracking-tight text-white/90 sm:text-4xl">
        Quiet light for loud ideas
      </h2>
      <p className="relative mt-2 text-sm text-white/60">Over Tromsø, 69° N, a little after one in the morning.</p>
    </div>
  );
}
