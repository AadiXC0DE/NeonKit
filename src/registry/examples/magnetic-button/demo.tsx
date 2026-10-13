import { ArrowRight } from "@/components/ui/icons";
import { MagneticButton } from "@/components/ui/magnetic-button";

export default function MagneticButtonDemo() {
  return (
    <div className="flex flex-col items-center gap-7 text-center">
      <div className="space-y-2">
        <h3 className="text-balance text-2xl font-medium tracking-[-0.02em] text-white/90">Have something in mind?</h3>
        <p className="text-[13px] text-white/55">Taking on two projects for July through September.</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <MagneticButton size="lg" variant="solid">
          Start a conversation <ArrowRight />
        </MagneticButton>
        <MagneticButton size="lg" variant="ghost">
          See recent work
        </MagneticButton>
      </div>
    </div>
  );
}
