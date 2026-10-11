import { ArrowRight } from "lucide-react";
import { CyberButton } from "@/components/ui/cyber-button";

export default function CyberButtonAsLink() {
  return (
    <CyberButton asChild size="lg">
      <a href="#tickets">
        Get your pass <ArrowRight />
      </a>
    </CyberButton>
  );
}
