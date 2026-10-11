import { NeonClock } from "@/components/ui/neon-clock";

export default function NeonClockBedside() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-10">
      <NeonClock variant="digital" showSeconds={false} hourCycle={24} color="pink" label="Bedroom" />
      <NeonClock variant="digital" showSeconds={false} hourCycle={24} timeZone="America/Los_Angeles" color="amber" label="Los Angeles" />
    </div>
  );
}
