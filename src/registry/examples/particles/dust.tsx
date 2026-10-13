import { Particles } from "@/components/ui/particles";

export default function ParticlesDust() {
  return (
    <figure className="relative flex h-72 w-full max-w-xl flex-col justify-center overflow-hidden rounded-xl border border-white/10 bg-[#05060a] px-8 sm:px-10">
      <Particles density={5} speed={0.4} interaction="attract" radius={110} />
      <blockquote className="relative max-w-sm text-lg leading-snug text-white/85">
        &ldquo;We moved our alerting over on a Friday. Nobody noticed, which is the highest praise an on-call team can give.&rdquo;
      </blockquote>
      <figcaption className="relative mt-4 text-sm text-white/60">Mara Okafor · SRE lead, Lumen</figcaption>
    </figure>
  );
}
