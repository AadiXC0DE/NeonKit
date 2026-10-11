import { Fingerprint, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function SeparatorDemo() {
  return (
    <div className="grid w-full max-w-sm gap-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="grid gap-1">
        <h3 className="text-base font-semibold text-white/90">Sign in to Halcyon</h3>
        <p className="text-sm text-white/55">Use your company identity provider or a passkey.</p>
      </div>
      <div className="grid gap-2">
        <Button variant="ghost" className="border border-white/10 bg-white/[0.03] text-white/80">
          <KeyRound /> Continue with SSO
        </Button>
        <Button variant="ghost" className="border border-white/10 bg-white/[0.03] text-white/80">
          <Fingerprint /> Use a passkey
        </Button>
      </div>
      <Separator variant="tube" label="or" />
      <div className="grid gap-3">
        <Input type="email" label="Work email" placeholder="ada@halcyon.dev" autoComplete="email" />
        <Button variant="soft">Email me a sign-in link</Button>
      </div>
    </div>
  );
}
