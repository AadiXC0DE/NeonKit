import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/ui/shimmer-button";

const sizes = ["sm", "md", "lg"] as const;

export default function ShimmerButtonSizes() {
  return (
    <div className="flex flex-col items-center gap-4">
      {sizes.map((size) => (
        <div key={size} className="flex items-center gap-3">
          <ShimmerButton size={size}>Upgrade to Pro</ShimmerButton>
          <Button size={size} variant="ghost">
            Compare plans
          </Button>
        </div>
      ))}
    </div>
  );
}
