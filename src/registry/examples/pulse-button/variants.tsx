import { PulseButton } from "@/components/ui/pulse-button";

export default function PulseButtonVariants() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-8">
      <PulseButton variant="solid">Accept invite</PulseButton>
      <PulseButton variant="outline">Resume setup</PulseButton>
      <PulseButton variant="soft">Finish profile</PulseButton>
    </div>
  );
}
