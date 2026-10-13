import { Sparkles } from "@/components/ui/icons";
import { ShimmerButton } from "@/components/ui/shimmer-button";

export default function ShimmerButtonVariants() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <ShimmerButton variant="solid">
        <Sparkles /> Start free trial
      </ShimmerButton>
      <ShimmerButton>Book a demo</ShimmerButton>
    </div>
  );
}
