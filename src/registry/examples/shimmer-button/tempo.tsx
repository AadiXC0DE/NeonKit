import { ShimmerButton } from "@/components/ui/shimmer-button";

export default function ShimmerButtonTempo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <ShimmerButton beamDuration={7} shimmerDuration={6}>
        Unhurried
      </ShimmerButton>
      <ShimmerButton>Default</ShimmerButton>
      <ShimmerButton beamDuration={2.4} shimmerDuration={2}>
        Brisk
      </ShimmerButton>
    </div>
  );
}
