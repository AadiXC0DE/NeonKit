import { ArrowRight } from "lucide-react";
import { BorderBeam } from "@/components/ui/border-beam";

export default function BorderBeamButton() {
  return (
    <BorderBeam duration={3} size={120} className="rounded-full">
      <a
        href="#"
        className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-[#0a0b11] px-5 text-sm font-medium text-white/90 transition-colors hover:text-white"
      >
        Claim your handle <ArrowRight className="size-4" />
      </a>
    </BorderBeam>
  );
}
