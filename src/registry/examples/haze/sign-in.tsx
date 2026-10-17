import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Haze } from "@/components/ui/haze";

export default function HazeSignIn() {
  return (
    <div className="relative flex min-h-[420px] w-full items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#05060a] px-6 py-10">
      <Haze light="top" density={0.9} intensity={0.6} seed={4} />
      <form className="relative flex w-full max-w-xs flex-col gap-3 rounded-xl border border-white/10 bg-[#0a0b11]/85 p-6">
        <h3 className="text-lg font-semibold text-white/95">Sign in to Lumen Board</h3>
        <p className="-mt-1 mb-1 text-sm text-white/60">Your rigs sync when you do.</p>
        <Input type="email" aria-label="Email" placeholder="you@studio.com" />
        <Input type="password" aria-label="Password" placeholder="Password" />
        <Button type="submit" variant="solid" className="mt-1">
          Sign in
        </Button>
      </form>
    </div>
  );
}
