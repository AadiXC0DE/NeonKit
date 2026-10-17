import { NeonText } from "@/components/ui/neon-text";
import { RotatingText } from "@/components/ui/rotating-text";

export default function RotatingTextSign() {
  return (
    <div className="grid w-full max-w-md justify-items-center gap-3 rounded-2xl border border-white/[0.06] bg-[#07080d] px-6 py-10 text-center">
      <NeonText as="p" color="white" flicker={false} className="text-[2.6rem] leading-none" style={{ fontFamily: "var(--font-tilt-neon)" }}>
        Kitchen open
      </NeonText>
      <RotatingText
        color="pink"
        words={["until 2 a.m.", "on Sundays", "for takeaway"]}
        interval={3000}
        className="text-[2.6rem] leading-none"
        style={{ fontFamily: "var(--font-tilt-neon)" }}
      />
      <p className="mt-3 text-[13px] text-white/50">Bánh mì, ramen and two kinds of curry · <span className="whitespace-nowrap">41 Kreuzbergstraße</span></p>
    </div>
  );
}
