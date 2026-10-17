import { RotatingText } from "@/components/ui/rotating-text";

export default function RotatingTextDemo() {
  return (
    <div className="w-full max-w-2xl text-center">
      <h3 className="text-[clamp(2.1rem,6.4vw,3.9rem)] font-semibold leading-[1.04] tracking-[-0.035em] text-white/90">
        Wire up{" "}
        <RotatingText
          words={["billing", "search", "auth", "webhooks"]}
          className="font-normal tracking-normal"
          style={{ fontFamily: "var(--font-tilt-neon)" }}
        />
        <br />
        in an afternoon.
      </h3>
      <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-white/55">
        Drop-in modules for Next.js 16. Each one ships with its migration, 40-odd tests and a kill switch.
      </p>
    </div>
  );
}
