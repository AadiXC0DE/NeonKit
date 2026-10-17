import { ArrowUpRight } from "@/components/ui/icons";
import { ShimmerButton } from "@/components/ui/shimmer-button";

export default function ShimmerButtonAsLink() {
  return (
    <ShimmerButton asChild color="violet">
      <a href="/changelog">
        What&apos;s new in 1.2 <ArrowUpRight />
      </a>
    </ShimmerButton>
  );
}
