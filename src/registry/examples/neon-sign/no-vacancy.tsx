import { NeonSign } from "@/components/ui/neon-sign";

export default function NeonSignNoVacancy() {
  return (
    <NeonSign
      flicker="dying"
      dyingLetter={0}
      frame="pill"
      cable="left"
      size="lg"
      lines={[
        { text: "NO", color: "red", className: "text-[0.7em] tracking-[0.2em] pl-[0.2em]" },
        { text: "VACANCY", className: "tracking-[0.1em] pl-[0.1em]" },
      ]}
      style={{ fontFamily: "var(--font-tilt-neon)" }}
    />
  );
}
