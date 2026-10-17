import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sunset } from "@/components/ui/sunset";

export default function SunsetSignup() {
  return (
    <div className="relative flex h-[380px] w-full flex-col items-center overflow-hidden rounded-xl border border-white/10 bg-[#05060a] px-6 pt-10 text-center">
      <Sunset mountains={false} horizon={0.97} size={0.4} slits={10} />
      <h3 className="relative max-w-[20ch] text-2xl font-semibold sm:text-3xl tracking-[-0.03em] text-white/95 [text-shadow:0_2px_18px_rgb(5_6_10/0.9)]">
        One mixtape on the last Sunday of the month
      </h3>
      <form className="relative mt-5 flex w-full max-w-sm gap-2">
        <Input type="email" aria-label="Email address" placeholder="you@example.com" className="bg-[#05060a]" />
        <Button type="submit" variant="solid">
          Subscribe
        </Button>
      </form>
    </div>
  );
}
