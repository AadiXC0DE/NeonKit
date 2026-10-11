import { ArrowUpRight } from "lucide-react";
import { MagneticButton } from "@/components/ui/magnetic-button";

export default function MagneticButtonAsLink() {
  return (
    <MagneticButton asChild color="lime">
      <a href="https://github.com/AadiXC0DE/NeonKit" target="_blank" rel="noreferrer">
        Star on GitHub <ArrowUpRight />
      </a>
    </MagneticButton>
  );
}
