import { OTPInput } from "@/components/ui/otp-input";

export default function OTPInputAlphanumeric() {
  return (
    <div className="grid justify-items-center gap-4 text-center">
      <div className="grid gap-1">
        <p className="text-sm font-medium text-white/90">Use a recovery code</p>
        <p className="text-sm text-white/55">One of the 8-character codes you saved when you set up 2FA.</p>
      </div>
      <OTPInput aria-label="Recovery code" mode="alphanumeric" length={8} groupSize={4} size="sm" />
    </div>
  );
}
