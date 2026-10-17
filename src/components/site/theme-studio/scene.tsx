"use client";

import * as React from "react";
import { MotionConfig } from "motion/react";
import AppMusicPlayer from "@/components/blocks/app-music-player";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { NeonSign } from "@/components/ui/neon-sign";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { accentOf, radiusVars, rgbToHex, surfaceRgb, type Theme } from "./state";

/**
 * Motion is scoped to the stage. "Reduced" ends loops and flicker after one frame
 * and keeps transitions; "off" drops transitions too. Motion-driven components
 * read MotionConfig.
 */
const motionCss = `
.nk-studio-scene[data-motion="reduced"] *, .nk-studio-scene[data-motion="reduced"] *::before, .nk-studio-scene[data-motion="reduced"] *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
.nk-studio-scene[data-motion="off"] *, .nk-studio-scene[data-motion="off"] *::before, .nk-studio-scene[data-motion="off"] *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0s !important; transition-delay: 0s !important; }
.nk-studio-block > section { --neon: var(--nk-studio-accent) !important; --neon-accent: var(--nk-studio-accent) !important; background: transparent !important; }
`;

/** The values the stage hands every component inside it. */
export function sceneStyle(theme: Theme): React.CSSProperties {
  const accent = accentOf(theme);
  return {
    "--neon-accent": accent.rgb,
    "--neon": accent.rgb,
    "--nk-studio-accent": accent.rgb,
    "--neon-glow": String(theme.glow / 100),
    "--nk-studio-surface": `rgb(${surfaceRgb(theme.tint)})`,
    ...radiusVars(theme.radius),
  } as React.CSSProperties;
}

/** The music-player block, laid out at its desktop width and scaled into its slot. */
function ScaledBlock() {
  const outer = React.useRef<HTMLDivElement>(null);
  const inner = React.useRef<HTMLDivElement>(null);
  const [box, setBox] = React.useState({ scale: 0.6, height: 380 });

  React.useEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const measure = () => {
      // Never above 1: the block is drawn at its own desktop size or smaller, never blown up.
      const scale = Math.min(1, o.clientWidth / i.offsetWidth);
      setBox({ scale, height: i.offsetHeight * scale });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(o);
    ro.observe(i);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={outer} className="relative w-full overflow-hidden" style={{ height: box.height }}>
      <div
        ref={inner}
        className="nk-studio-block absolute left-0 top-0 w-[1244px] origin-top-left"
        style={{ transform: `scale(${box.scale})` }}
      >
        <AppMusicPlayer />
      </div>
    </div>
  );
}

function Label({ children, className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("text-[13px] text-white/55", className)} {...props}>
      {children}
    </span>
  );
}

export function Scene({ theme, compact = false }: { theme: Theme; compact?: boolean }) {
  const accent = accentOf(theme);
  const [tube, setTube] = React.useState<string | null>(null);
  const [power, setPower] = React.useState(true);
  const [brightness, setBrightness] = React.useState([82]);
  // The sign follows the accent until someone picks a tube for it.
  const signTube = theme.palette.find((t) => t.name === tube) ?? accent;
  const motion = theme.motion === "full" ? "user" : "always";

  const order = (
    <div className="grid gap-x-10 gap-y-7 sm:grid-cols-2">
      <div className="grid content-start gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className="mr-1 text-[15px] font-medium text-white/90">Corner Bodega, 24h</p>
          <Badge size="sm">Rush</Badge>
          <Badge size="sm" variant="outline" dot pulse>
            On the bench
          </Badge>
        </div>
        <Progress value={68} label="Bending glass" showValue size="sm" />
        <Checkbox defaultChecked label="Weatherproof housing" />
      </div>

      <div className="grid content-start gap-4">
        <div className="grid gap-2">
          <Label id="nk-studio-tube">Tube</Label>
          <ToggleGroup
            aria-labelledby="nk-studio-tube"
            size="sm"
            variant="ghost"
            value={signTube.name}
            onValueChange={(value) => value && setTube(value)}
            className="flex-wrap"
          >
            {theme.palette.map((t) => (
              <ToggleGroupItem key={t.name} value={t.name} style={{ "--neon": t.rgb } as React.CSSProperties}>
                <span aria-hidden className="h-3 w-[3px] rounded-full" style={{ background: `rgb(${t.rgb})` }} />
                {t.name}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div className="flex items-center gap-6">
          <Switch checked={power} onCheckedChange={setPower} label={<Label>Power</Label>} />
          <div className="grid min-w-0 flex-1 gap-1.5">
            <div className="flex items-baseline justify-between">
              <Label id="nk-studio-bright">Brightness</Label>
              <span className="font-mono text-[12px] tabular-nums text-white/55">{brightness[0]}%</span>
            </div>
            <Slider aria-labelledby="nk-studio-bright" value={brightness} onValueChange={setBrightness} size="sm" />
          </div>
        </div>
      </div>

      <div className="grid content-start gap-4 sm:col-span-2">
        <Input label="Send proof to" defaultValue="ines@cornerbodega.nl" size="sm" />
        <div className="flex flex-wrap gap-2">
          <Button variant="solid" size="sm">
            Send proof
          </Button>
          <Button size="sm">Save draft</Button>
          <Button variant="ghost" size="sm">
            Cancel job
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <MotionConfig reducedMotion={motion}>
      <style>{motionCss}</style>
      <div
        data-motion={theme.motion}
        style={sceneStyle(theme)}
        className="nk-studio-scene relative isolate overflow-hidden text-white/90 [background:var(--nk-studio-surface)]"
      >
        {/* Light from the strip above the bench. It's glow, so it follows --neon-glow too. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_50%_60%_at_30%_-10%,rgb(var(--neon-accent)/calc(0.12*var(--neon-glow,1))),transparent_70%)]"
        />
        {compact ? (
          <div className="mx-auto grid max-w-[36rem] gap-5 px-4 pb-5 pt-6 sm:px-6">
            <div className="flex justify-center">
              <NeonSign
                on={power}
                size="sm"
                color={rgbToHex(signTube.rgb)}
                style={{ fontFamily: "var(--font-tilt-neon)" }}
                lines={[{ text: "Nightworks" }, { text: "signs, tubes, repairs", className: "text-[0.42em] tracking-[0.18em]" }]}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge size="sm">Rush</Badge>
              <Badge size="sm" variant="outline" dot pulse>
                On the bench
              </Badge>
              <div className="ml-auto">
                <Switch checked={power} onCheckedChange={setPower} size="sm" label={<Label>Power</Label>} />
              </div>
            </div>
            <Progress value={68} label="Bending glass" showValue size="sm" />
            <div className="flex gap-2">
              <Button variant="solid" size="sm" className="flex-1">
                Send proof
              </Button>
              <Button size="sm" className="flex-1">
                Save draft
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-10 px-10 pb-10 pt-10 xl:px-14">
            <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
              <div className="flex flex-col items-center justify-center">
                <NeonSign
                  on={power}
                  size="lg"
                  className="text-[clamp(34px,4.1vw,60px)]"
                  frame="rounded"
                  cable="right"
                  color={rgbToHex(signTube.rgb)}
                  style={{ fontFamily: "var(--font-tilt-neon)" }}
                  lines={[
                    { text: "Nightworks" },
                    { text: "signs, tubes, repairs", className: "-mt-[0.08em] text-[0.36em] tracking-[0.2em]" },
                  ]}
                />
              </div>
              {order}
            </div>
            {/* Full width, so the block renders at (or near) its real size instead of as a thumbnail. */}
            <div className="mx-auto w-full max-w-[1244px] overflow-hidden rounded-[14px] border border-white/[0.07] bg-[var(--nk-studio-surface)] shadow-[0_30px_60px_-30px_rgb(0_0_0/0.9)]">
              <ScaledBlock />
            </div>
          </div>
        )}
      </div>
    </MotionConfig>
  );
}
