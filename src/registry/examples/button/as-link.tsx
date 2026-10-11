import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ButtonAsLink() {
  return (
    <Button asChild color="magenta">
      <a href="https://github.com/AadiXC0DE/NeonKit" target="_blank" rel="noreferrer">
        Star on GitHub <ArrowUpRight />
      </a>
    </Button>
  );
}
