import { OTPInput } from "@/components/ui/otp-input";

export default function OTPInputGrouped() {
  return (
    <div className="grid w-full min-w-0 max-w-sm justify-items-center gap-4 text-center">
      <div className="grid gap-1">
        <p className="text-sm font-medium text-white/90">Pair your TV</p>
        <p className="text-sm text-white/55">Type the code shown on the screen.</p>
      </div>
      {/* Stretched to the column so the slots can narrow on a phone instead of overflowing. */}
      <OTPInput aria-label="Pairing code" groupSize={3} size="lg" className="w-full min-w-0 justify-center" />
    </div>
  );
}
