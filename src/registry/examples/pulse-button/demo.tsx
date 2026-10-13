import { Video } from "@/components/ui/icons";
import { PulseButton } from "@/components/ui/pulse-button";

export default function PulseButtonDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-8 text-center">
      <div className="space-y-1.5">
        <p className="text-base font-medium text-white/90">Design review: checkout redesign</p>
        <p className="text-[13px] leading-5 text-white/55">
          Maya is walking 38 people through the new payment flow.
        </p>
      </div>
      <PulseButton size="lg">
        <Video /> Join the call
      </PulseButton>
    </div>
  );
}
