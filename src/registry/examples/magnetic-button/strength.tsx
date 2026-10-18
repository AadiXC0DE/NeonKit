import { MagneticButton } from "@/components/ui/magnetic-button";

export default function MagneticButtonStrength() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-12">
      <MagneticButton strength={0.1} radius={32} labelStrength={0.15}>
        Subtle
      </MagneticButton>
      <MagneticButton>Default</MagneticButton>
      <MagneticButton strength={0.4} radius={96} labelStrength={0.5}>
        Strong
      </MagneticButton>
    </div>
  );
}
