import { DeviceFrame } from "@/components/ui/device-frame";

export default function DeviceFrameTabs() {
  return (
    <DeviceFrame
      controls="minimal"
      tabs={["Relay: webhooks that arrive", "Pricing · Relay", "RFC 0042"]}
      url="relay.dev"
      aspectRatio="16 / 9"
      className="max-w-2xl"
    >
      <div className="grid h-full place-items-center px-[8cqw] text-center">
        <div>
          <p className="text-[5.4cqw] font-semibold leading-[1.02] tracking-[-0.035em] text-white/90">
            Webhooks that arrive.
          </p>
          <p className="mx-auto mt-[2cqw] max-w-[52cqw] text-[1.9cqw] leading-relaxed text-white/55">
            At-least-once delivery, replays from the last 30 days and a dashboard your support team can read.
          </p>
          <div className="mt-[3.4cqw] flex justify-center gap-[1.4cqw] text-[1.7cqw] font-medium">
            <span className="rounded-[0.9cqw] bg-[rgb(var(--neon))] px-[2.4cqw] py-[1.1cqw] text-[#05060a] shadow-[0_0_18px_rgb(var(--neon)/CALC(0.45*var(--neon-glow,1)))]">
              Start free
            </span>
            <span className="rounded-[0.9cqw] border border-white/15 px-[2.4cqw] py-[1.1cqw] text-white/80">Read the docs</span>
          </div>
        </div>
      </div>
    </DeviceFrame>
  );
}
