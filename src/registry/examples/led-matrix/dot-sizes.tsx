import { LedMatrix } from "@/components/ui/led-matrix";

export default function LedMatrixDotSizes() {
  return (
    <div className="flex w-full max-w-lg flex-col gap-3">
      <LedMatrix text="ON AIR" speed={0} dotSize={8} gap={3} color="red" />
      <LedMatrix text="NOW PLAYING: NIGHT DRIVE · LATE SET" speed={40} dotSize={4} gap={1} color="violet" />
      <LedMatrix text="TEMP 21°  HUMIDITY 48%  WIND 12 KM/H →" speed={30} dotSize={2.5} gap={1} rows={9} color="lime" />
    </div>
  );
}
