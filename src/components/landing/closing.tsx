import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NeonText } from "@/components/ui/neon-text";
import { RetroGrid } from "@/components/ui/retro-grid";
import { GitHubIcon } from "@/components/site/icons";
import { siteConfig } from "@/config/site";

export function Closing() {
  return (
    <section className="relative isolate overflow-hidden border-t border-line">
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-[52%] sm:h-[64%]">
        <RetroGrid className="opacity-70" cellSize={64} />
      </div>
      <div className="mx-auto flex min-h-[600px] max-w-[88rem] flex-col items-center px-4 pb-48 pt-24 sm:min-h-[760px] sm:pb-64 text-center sm:px-6">
        <NeonText as="p" buzz flicker={false} className="font-neon text-[clamp(3.5rem,11vw,8rem)] leading-none">
          open source
        </NeonText>
        <p className="mt-8 max-w-md text-[17px] leading-relaxed text-muted">
          MIT licensed and built in the open. Fork it, retune the palette, ship something that glows.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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
    </section>
  );
}
