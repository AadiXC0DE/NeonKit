"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Lock, RotateCw, Wifi } from "@/components/ui/icons";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

// The screen is glass: where it meets the frame it catches the room's light, so it gets a hairline of
// --neon round the edge, brightest along the top where a lit sign would hit it. Nothing glows outward.
const rim =
  "pointer-events-none absolute inset-0 z-30 rounded-[inherit] shadow-[inset_0_0_0_1px_rgb(var(--neon)/0.22),inset_0_1px_0_rgb(var(--neon)/0.35)]";
const sheen =
  "pointer-events-none absolute inset-x-[8%] top-0 z-30 h-px bg-[linear-gradient(90deg,transparent,rgb(var(--neon)/0.9)_35%,#fff_50%,rgb(var(--neon)/0.9)_65%,transparent)] opacity-70";

function tiltTransform(tilt: boolean | number | undefined) {
  if (!tilt) return undefined;
  const deg = tilt === true ? 10 : tilt;
  return `perspective(2000px) rotateX(${Math.abs(deg) * 0.45}deg) rotateY(${-deg}deg)`;
}

export interface DeviceFrameProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Palette name or any hex color for the screen rim. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** A browser window or a phone. */
  variant?: "browser" | "phone";
  /** Browser: the address shown in the URL bar, without the scheme. */
  url?: string;
  /** Browser: tab titles. With tabs the window gets a tab strip and a toolbar. */
  tabs?: string[];
  /** Browser: which tab is in front. */
  activeTab?: number;
  /** Browser: colored window buttons, or plain grey ones. */
  controls?: "traffic" | "minimal";
  /** Phone: the cut-out at the top of the screen. */
  cutout?: "island" | "notch" | "none";
  /** Phone: a status bar over the screen showing this time, e.g. "9:41". */
  time?: string;
  /** Turn the device in perspective. `true` is 10°; negative numbers turn it the other way. */
  tilt?: boolean | number;
  /** Aspect ratio of the screen, e.g. `"16 / 10"`. Defaults to 16 / 10 for the browser and 9 / 19.5 for the phone. */
  aspectRatio?: string;
  /** Light the screen's rim with `--neon`. */
  rim?: boolean;
  /** Class names for the screen, where the children render. */
  screenClassName?: string;
}

const dots = {
  traffic: ["bg-[#ff5f57]", "bg-[#febc2e]", "bg-[#28c840]"],
  minimal: ["bg-white/15", "bg-white/15", "bg-white/15"],
} as const;

function UrlBar({ url, wide }: { url: string; wide?: boolean }) {
  const slash = url.indexOf("/");
  const host = slash < 0 ? url : url.slice(0, slash);
  const path = slash < 0 ? "" : url.slice(slash);
  return (
    <div
      className={cn(
        "flex h-7 min-w-0 items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.04] px-2.5 text-[12px]",
        wide ? "flex-1" : "w-full max-w-[26rem] justify-center",
      )}
    >
      <Lock aria-hidden className="size-3 shrink-0 text-white/40" />
      <span className="truncate">
        <span className="text-white/80">{host}</span>
        <span className="text-white/40">{path}</span>
      </span>
    </div>
  );
}

const DeviceFrame = React.forwardRef<HTMLDivElement, DeviceFrameProps>(
  (
    {
      className,
      style,
      color,
      variant = "browser",
      url,
      tabs,
      activeTab = 0,
      controls = "traffic",
      cutout = "island",
      time,
      tilt,
      aspectRatio,
      rim: lit = true,
      screenClassName,
      children,
      ...props
    },
    ref,
  ) => {
    const transform = tiltTransform(tilt);
    const rootStyle = neonVars(color, transform ? { transform, ...style } : style);

    if (variant === "phone") {
      return (
        <div
          ref={ref}
          style={rootStyle}
          className={cn(
            "[--neon:var(--neon-accent,34_211_238)]",
            "relative w-[280px] max-w-full shrink-0 [container-type:inline-size]",
            className,
          )}
          {...props}
        >
          {/* Side buttons: action and volume on the left, power on the right. */}
          <span aria-hidden className="absolute -left-[3px] top-[19%] h-[5%] w-[3px] rounded-l-[2px] bg-[linear-gradient(90deg,#2a2e39,#151820)]" />
          <span aria-hidden className="absolute -left-[3px] top-[27%] h-[9%] w-[3px] rounded-l-[2px] bg-[linear-gradient(90deg,#2a2e39,#151820)]" />
          <span aria-hidden className="absolute -left-[3px] top-[38%] h-[9%] w-[3px] rounded-l-[2px] bg-[linear-gradient(90deg,#2a2e39,#151820)]" />
          <span aria-hidden className="absolute -right-[3px] top-[30%] h-[14%] w-[3px] rounded-r-[2px] bg-[linear-gradient(270deg,#2a2e39,#151820)]" />
          <div className="relative rounded-[16cqw] border border-white/[0.12] bg-[linear-gradient(160deg,#1a1d26,#0b0d12_40%,#12141b)] p-[3.4cqw] shadow-[inset_0_0_0_1.5px_#05060a,inset_0_1px_0_1.5px_rgb(255_255_255/0.08),0_40px_80px_-40px_rgb(0_0_0/0.9)]">
            <div
              style={{ aspectRatio: aspectRatio ?? "9 / 19.5" }}
              className={cn("relative isolate overflow-hidden rounded-[12.6cqw] bg-[#05060a] [container-type:inline-size]", screenClassName)}
            >
              <div className="relative size-full">{children}</div>
              {time !== undefined && (
                <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex h-[13cqw] items-center justify-between px-[8.5cqw] pt-[1cqw] text-[4.6cqw] font-semibold text-white/90">
                  <span className="tabular-nums">{time}</span>
                  <span aria-hidden className="flex items-center gap-[1.6cqw]">
                    <Wifi className="size-[4.6cqw]" strokeWidth={2.25} />
                    <span className="relative h-[3.6cqw] w-[7.4cqw] rounded-[1.1cqw] border border-white/60 p-[0.5cqw]">
                      <span className="block h-full w-[72%] rounded-[0.5cqw] bg-white/90" />
                    </span>
                  </span>
                </div>
              )}
              {cutout === "island" && (
                <span aria-hidden className="absolute left-1/2 top-[3.4cqw] z-20 h-[8.8cqw] w-[30cqw] -translate-x-1/2 rounded-full bg-black">
                  <span className="absolute right-[3cqw] top-1/2 size-[3cqw] -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_35%,#2b3550,#0a0c12_60%)]" />
                </span>
              )}
              {cutout === "notch" && (
                <span aria-hidden className="absolute left-1/2 top-0 z-20 h-[9cqw] w-[44cqw] -translate-x-1/2 rounded-b-[5cqw] bg-black" />
              )}
              <span aria-hidden className="pointer-events-none absolute bottom-[2.2cqw] left-1/2 z-20 h-[1.4cqw] w-[36cqw] -translate-x-1/2 rounded-full bg-white/55" />
              {lit && (
                <>
                  <span aria-hidden className={rim} />
                  <span aria-hidden className={sheen} />
                </>
              )}
            </div>
          </div>
        </div>
      );
    }

    const hasTabs = !!tabs?.length;
    const lights = (
      <div aria-hidden className="flex shrink-0 items-center gap-2">
        {dots[controls].map((dot, i) => (
          <span key={i} className={cn("size-3 rounded-full shadow-[inset_0_0_0_0.5px_rgb(0_0_0/0.35)]", dot)} />
        ))}
      </div>
    );

    return (
      <div
        ref={ref}
        style={rootStyle}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "relative w-full overflow-hidden rounded-xl border border-white/10 bg-[#0c0e14] shadow-[0_1px_0_rgb(255_255_255/0.06)_inset,0_40px_90px_-40px_rgb(0_0_0/0.9)]",
          className,
        )}
        {...props}
      >
        {hasTabs ? (
          <>
            <div className="flex h-10 items-end gap-3 bg-[#08090e] pl-4 pr-2">
              <div className="flex h-full items-center">{lights}</div>
              <div className="flex min-w-0 flex-1 items-end" role="presentation">
                {tabs!.map((tab, i) => (
                  <div
                    key={`${i}-${tab}`}
                    className={cn(
                      "relative h-8 min-w-0 max-w-[13rem] flex-1 truncate rounded-t-lg px-3 pt-[7px] text-[12px]",
                      i === activeTab ? "bg-[#0c0e14] text-white/85" : "text-white/45",
                    )}
                  >
                    {tab}
                    {i !== activeTab && i + 1 !== activeTab && i < tabs!.length - 1 && (
                      <span aria-hidden className="absolute right-0 top-2 h-4 w-px bg-white/10" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex h-10 items-center gap-2 border-b border-white/[0.06] px-3">
              <span aria-hidden className="flex items-center gap-1 text-white/35">
                <ChevronLeft className="size-4" />
                <ChevronRight className="size-4" />
                <RotateCw className="ml-1 size-3.5" />
              </span>
              {url && <UrlBar url={url} wide />}
            </div>
          </>
        ) : (
          <div className="flex h-10 items-center gap-3 border-b border-white/[0.06] px-4">
            {lights}
            {url && (
              <>
                <div className="flex min-w-0 flex-1 justify-center">
                  <UrlBar url={url} />
                </div>
                {/* Balances the window buttons so the address sits in the middle of the window. */}
                <span aria-hidden className="w-[52px] shrink-[4]" />
              </>
            )}
          </div>
        )}
        <div
          style={{ aspectRatio: aspectRatio ?? "16 / 10" }}
          className={cn("relative isolate overflow-hidden bg-[#05060a] [container-type:inline-size]", screenClassName)}
        >
          <div className="relative size-full">{children}</div>
          {lit && <span aria-hidden className={sheen} />}
        </div>
        {lit && <span aria-hidden className="pointer-events-none absolute inset-0 z-30 rounded-[inherit] shadow-[inset_0_0_0_1px_rgb(var(--neon)/0.16)]" />}
      </div>
    );
  },
);
DeviceFrame.displayName = "DeviceFrame";

export { DeviceFrame };
