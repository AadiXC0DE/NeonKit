import { ArrowRight } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";

export default function ButtonDemo() {
  return (
    // Two clusters, so a narrow row breaks between them instead of stranding Link on its own.
    <div className="flex flex-wrap items-center justify-center gap-3">
      <div className="flex items-center gap-3">
        <Button variant="solid">
          Deploy <ArrowRight />
        </Button>
        <Button>Outline</Button>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="soft">Soft</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>
    </div>
  );
}
