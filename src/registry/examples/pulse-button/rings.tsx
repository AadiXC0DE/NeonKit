import { PulseButton } from "@/components/ui/pulse-button";

export default function PulseButtonRings() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-10">
      <PulseButton variant="outline" rings={1} period={2.8}>
        One ring, slow
      </PulseButton>
      <PulseButton variant="outline">Two rings</PulseButton>
      <PulseButton variant="outline" rings={3} period={1.8}>
        Three rings, urgent
      </PulseButton>
    </div>
  );
}
