import { LedMatrix } from "@/components/ui/led-matrix";

export default function LedMatrixDestinationSign() {
  return (
    <div className="flex w-full max-w-xl items-stretch gap-1.5 rounded-xl border border-white/10 bg-[#0b0c10] p-1.5">
      <LedMatrix text="42" columns={13} rows={9} speed={0} dotSize={5} gap={1.5} color="amber" className="rounded-md" />
      <LedMatrix text="HARBOUR VIEW" rows={9} speed={0} dotSize={5} gap={1.5} color="amber" className="rounded-md" />
    </div>
  );
}
