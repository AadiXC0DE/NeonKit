import { ArrowRight } from "lucide-react";
import { ShimmerButton } from "@/components/ui/shimmer-button";

export default function ShimmerButtonDemo() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">Private beta · Cohort 3</p>
      <ShimmerButton size="lg">
        Claim your handle <ArrowRight />
      </ShimmerButton>
      <p className="text-xs text-white/45">Free while in beta. 2,418 builders already on the list.</p>
    </div>
  );
}
