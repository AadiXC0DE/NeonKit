import { ArrowRight } from "@/components/ui/icons";
import { ShimmerButton } from "@/components/ui/shimmer-button";

export default function ShimmerButtonVariants() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <ShimmerButton variant="solid">
        Start free trial <ArrowRight />
      </ShimmerButton>
      <ShimmerButton>Book a demo</ShimmerButton>
    </div>
  );
}
