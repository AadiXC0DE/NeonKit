import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Haze } from "@/components/ui/haze";
import { NeonSign } from "@/components/ui/neon-sign";
import { GitHubIcon } from "@/components/site/icons";
import { siteConfig } from "@/config/site";

/** The shop sign at the end of the street: OPEN, with "source" hung under it. */
export function Closing() {
  return (
    <section aria-labelledby="closing-title" className="relative isolate overflow-x-clip px-4 pb-28 pt-16 sm:px-6 sm:pb-40">
      {/* Smoke in the room, lit from the floor, fading out before the copy */}
      <Haze
        aria-hidden
        light="bottom"
        density={0.4}
        intensity={0.45}
        speed={0.6}
        className="absolute inset-x-0 top-0 -z-20 h-[70%] opacity-70 [mask-image:radial-gradient(ellipse_50%_48%_at_50%_50%,black_35%,transparent_100%)]"
      />
      {/* Light the sign throws on the wall */}
      <div
        aria-hidden
        className="absolute left-1/2 top-[38%] -z-10 h-[46%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[rgb(var(--neon-accent)/0.10)] blur-[120px]"
      />
      <div className="mx-auto max-w-[88rem]">
        <div className="flex justify-center">
          <NeonSign
            aria-hidden
            frame="rounded"
            backplate
            cable="bottom"
            buzz
            flicker="stutter"
            className="[&]:text-[clamp(52px,11vw,148px)]"
            style={{ fontFamily: "var(--font-tilt-neon)" }}
            lines={[
              { text: "OPEN", className: "pl-[0.06em] tracking-[0.06em]" },
              { text: "source", color: "pink", className: "-mt-[0.04em] pl-[0.3em] text-[0.42em] tracking-[0.3em]" },
            ]}
          />
        </div>

        <div className="mt-16 grid gap-10 sm:mt-20 lg:grid-cols-12 lg:items-end lg:gap-6">
          <h2 id="closing-title" className="type-display text-balance text-[clamp(2rem,3.4vw,3.25rem)] text-fg lg:col-span-6">
            Take it. It&apos;s MIT.
          </h2>
          <div className="lg:col-span-5 lg:col-start-8">
            <p className="max-w-[30rem] text-[16.5px] leading-[1.6] text-muted">
              Fork it, rename it, ship it inside something you sell. Credit is welcome and never required.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button asChild variant="solid" size="lg">
                <a href={siteConfig.github} target="_blank" rel="noreferrer">
                  <GitHubIcon /> Star on GitHub
                </a>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <Link href="/docs">Read the docs</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
