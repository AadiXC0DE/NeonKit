import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/ui/shimmer-button";

const sizes = ["sm", "md", "lg"] as const;

export default function ShimmerButtonSizes() {
  return (
    // Two columns, so each pair sits on one start line instead of zigzagging around the center.
    <div className="grid grid-cols-[auto_auto] items-center gap-x-3 gap-y-4">
      {sizes.map((size) => (
        <div key={size} className="contents">
          <ShimmerButton size={size} className="justify-self-end">
            Upgrade to Pro
          </ShimmerButton>
          <Button size={size} variant="ghost" className="justify-self-start">
            Compare plans
          </Button>
        </div>
      ))}
    </div>
  );
}
