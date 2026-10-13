import { ArrowRight } from "@/components/ui/icons";
import { ShimmerButton } from "@/components/ui/shimmer-button";

export default function ShimmerButtonDemo() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <ShimmerButton size="lg">
        Claim your handle <ArrowRight />
      </ShimmerButton>
      <p className="text-[13px] text-white/55">Third beta cohort. Free while it lasts; 2,418 builders already in.</p>
    </div>
  );
}
