import { NeonClock } from "@/components/ui/neon-clock";

export default function NeonClockDigital() {
  return (
    <NeonClock
      variant="digital"
      hourCycle={12}
      className="text-[48px] lg:text-[80px]"
      label="Open until 2 AM"
      style={{ fontFamily: "var(--font-tilt-neon)" }}
    />
  );
}
