"use client";

import * as React from "react";
import { Heart, Pause, Play, Repeat, Shuffle, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { Equalizer } from "@/components/ui/equalizer";
import { Fader } from "@/components/ui/fader";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { neonVars } from "@/lib/neon";

type Art = "tube" | "grid" | "rings" | "sun" | "moon" | "type";

const TRACKS: { title: string; artist: string; album: string; seconds: number; art: Art }[] = [
  { title: "Sodium Vapour", artist: "Mira Kestrel", album: "Low Hours", seconds: 228, art: "tube" },
  { title: "Night Bus to Ostend", artist: "The Late Shift", album: "Terminus", seconds: 252, art: "grid" },
  { title: "Harbour Lights", artist: "Low Tide Radio", album: "Harbour Lights EP", seconds: 211, art: "rings" },
  { title: "Allnighter", artist: "Paper Satellites", album: "Allnighter", seconds: 177, art: "sun" },
  { title: "Glass Arcade", artist: "Ines Maro", album: "Glass Arcade", seconds: 266, art: "moon" },
  { title: "Closing Time Again", artist: "Velvet Static", album: "Last Orders", seconds: 219, art: "type" },
];

const TUBE = "color-mix(in srgb, rgb(var(--neon)) 35%, white)";
const time = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

// Every cover is drawn in the accent plus darks, so the queue reads as one label's catalogue.
function Cover({ art, label, className }: { art: Art; label?: string; className?: string }) {
  const id = React.useId().replace(/:/g, "");
  const glow = { filter: "drop-shadow(0 0 1px rgb(var(--neon))) drop-shadow(0 0 4px rgb(var(--neon) / 0.7))" };
  const ink = art === "type" ? "#0b0a12" : "rgb(255 255 255 / 0.5)";
  return (
    <svg aria-hidden viewBox="0 0 100 100" className={cn("block", className)} preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id={`${id}-bg`} cx="0.5" cy="0.6" r="0.75">
          <stop offset="0" stopColor="rgb(var(--neon))" stopOpacity="0.16" />
          <stop offset="1" stopColor="rgb(var(--neon))" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-sun`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={TUBE} />
          <stop offset="1" stopColor="rgb(var(--neon))" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="#0b0a12" />
      <rect width="100" height="100" fill={`url(#${id}-bg)`} />
      {art === "tube" && (
        <path d="M8 58c7 0 9-16 16-16s9 26 17 26 9-34 17-34 9 30 17 30 8-12 17-12" fill="none" stroke={TUBE} strokeWidth="1.3" strokeLinecap="round" style={glow} />
      )}
      {art === "grid" && (
        <>
          {[0, 4, 10, 18, 29, 44].map((y) => <line key={y} x1="0" x2="100" y1={60 + y * 0.9} y2={60 + y * 0.9} stroke="rgb(var(--neon) / 0.4)" strokeWidth="0.4" />)}
          {[-70, -35, 0, 25, 50, 75, 100, 135, 170].map((x) => <line key={x} x1="50" y1="60" x2={x} y2="100" stroke="rgb(var(--neon) / 0.3)" strokeWidth="0.4" />)}
          <line x1="0" x2="100" y1="60" y2="60" stroke={TUBE} strokeWidth="0.9" style={glow} />
          <rect x="58" y="46" width="26" height="9" rx="2" fill="none" stroke="rgb(255 255 255 / 0.45)" strokeWidth="0.6" />
          {[62, 67, 72, 77].map((x) => <rect key={x} x={x} y="48.5" width="3" height="2.5" rx="0.4" fill="rgb(var(--neon) / 0.7)" />)}
        </>
      )}
      {art === "rings" && [6, 12, 18, 24, 30, 36, 42].map((r, i) => (
        <circle key={r} cx="62" cy="46" r={r} fill="none" stroke={i === 2 ? TUBE : "rgb(var(--neon) / 0.22)"} strokeWidth={i === 2 ? 1.2 : 0.4} style={i === 2 ? glow : undefined} />
      ))}
      {art === "sun" && (
        <>
          <circle cx="50" cy="56" r="24" fill={`url(#${id}-sun)`} />
          {[58, 63, 67.5, 71.5, 75].map((y, i) => <rect key={y} x="20" y={y} width="60" height={0.8 + i * 0.5} fill="#0b0a12" />)}
          <rect y="80" width="100" height="20" fill="#0b0a12" />
          <line x1="8" x2="92" y1="80" y2="80" stroke="rgb(var(--neon) / 0.5)" strokeWidth="0.4" />
        </>
      )}
      {art === "moon" && (
        <>
          <circle cx="54" cy="46" r="20" fill="none" stroke="rgb(var(--neon) / 0.18)" strokeWidth="0.4" />
          <path d="M60 28a20 20 0 1 0 14 30 16 16 0 1 1-14-30z" fill="none" stroke={TUBE} strokeWidth="1.2" strokeLinejoin="round" style={glow} />
          {[[18, 22], [28, 72], [84, 76], [80, 18], [14, 50], [90, 46]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="0.6" fill="rgb(255 255 255 / 0.55)" />)}
        </>
      )}
      {art === "type" && (
        <>
          <rect width="100" height="100" fill="rgb(var(--neon))" />
          <text x="-3" y="62" fill="#0b0a12" fontSize="34" fontWeight="800" letterSpacing="-2">LAST</text>
          <text x="-3" y="92" fill="#0b0a12" fontSize="34" fontWeight="800" letterSpacing="-2">ORDERS</text>
        </>
      )}
      {label && (
        <>
          <text x="8" y="12" fill={ink} fontSize="4.2" letterSpacing="0.6" className="font-mono">{label.toUpperCase()}</text>
          <text x="92" y="94" fill={ink} fontSize="4.2" letterSpacing="0.6" textAnchor="end" className="font-mono">LATE RADIO</text>
        </>
      )}
    </svg>
  );
}

function IconButton({ label, active, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string; active?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-full outline-none transition-[color,background-color,transform] duration-150 active:scale-[0.94] [&_svg]:size-[18px]",
        "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
        active ? "text-[rgb(var(--neon))] [&_svg]:[filter:drop-shadow(0_0_5px_rgb(var(--neon)/0.8))]" : "text-white/55 hover:bg-white/[0.06] hover:text-white/90",
        className,
      )}
      {...props}
    />
  );
}

type Deck = { index: number; elapsed: number };
type DeckAction =
  | { type: "tick"; repeat: boolean; shuffle: boolean }
  | { type: "skip"; step: number; shuffle: boolean }
  | { type: "seek"; to: number }
  | { type: "play"; index: number };

const advance = (index: number, step: number, shuffle: boolean) =>
  shuffle && step > 0 ? (index + 3) % TRACKS.length : (index + step + TRACKS.length) % TRACKS.length;

function deckReducer(deck: Deck, action: DeckAction): Deck {
  switch (action.type) {
    case "tick":
      if (deck.elapsed + 1 < TRACKS[deck.index].seconds) return { ...deck, elapsed: deck.elapsed + 1 };
      return { index: action.repeat ? deck.index : advance(deck.index, 1, action.shuffle), elapsed: 0 };
    case "skip":
      // Like most players, "previous" restarts the track unless you're in its first few seconds.
      if (action.step < 0 && deck.elapsed > 3) return { ...deck, elapsed: 0 };
      return { index: advance(deck.index, action.step, action.shuffle), elapsed: 0 };
    case "seek":
      return { ...deck, elapsed: action.to };
    case "play":
      return { index: action.index, elapsed: 0 };
  }
}

export default function AppMusicPlayer() {
  const [{ index, elapsed }, dispatch] = React.useReducer(deckReducer, { index: 0, elapsed: 84 });
  const [playing, setPlaying] = React.useState(true);
  const [volume, setVolume] = React.useState(72);
  const [muted, setMuted] = React.useState(false);
  const [shuffle, setShuffle] = React.useState(false);
  const [repeat, setRepeat] = React.useState(false);
  const [liked, setLiked] = React.useState<Set<number>>(() => new Set([2]));
  const [signal, setSignal] = React.useState(0);
  const track = TRACKS[index];
  const loud = muted ? 0 : volume;
  const level = playing ? signal * (loud / 100) : 0;

  React.useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => dispatch({ type: "tick", repeat, shuffle }), 1000);
    return () => window.clearInterval(id);
  }, [playing, repeat, shuffle]);

  // A rough programme level for the fader's LED column, a few times a second rather than every frame.
  React.useEffect(() => {
    if (!playing) return;
    let t = 0;
    const id = window.setInterval(() => {
      t += 1;
      setSignal(Math.min(1, 0.62 + 0.22 * Math.abs(Math.sin(t * 1.7)) + 0.1 * Math.sin(t * 0.6)));
    }, 140);
    return () => window.clearInterval(id);
  }, [playing]);

  const toggleLike = () =>
    setLiked((set) => {
      const next = new Set(set);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

  return (
    <section
      // Change the color here; everything inside follows it.
      style={neonVars("pink")}
      aria-labelledby="late-radio-title"
      className="relative isolate overflow-hidden bg-[#05060a] px-4 py-6 text-white/90 sm:px-8 sm:py-8"
    >
      <style>{`
        @keyframes nk-app-music-player-onair { 0%, 100% { opacity: 1 } 50% { opacity: .82 } }
        .nk-app-music-player-onair { animation: nk-app-music-player-onair 2.4s ease-in-out infinite }
        @media (prefers-reduced-motion: reduce) { .nk-app-music-player-onair { animation: none } }
      `}</style>

      <div className="mx-auto max-w-[1180px]">
        <header className="flex items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
          <div className="flex items-baseline gap-3">
            <span className="text-lg font-semibold tracking-[-0.03em]">late radio</span>
            <span className="hidden font-mono text-[11px] uppercase tracking-[0.16em] text-white/55 sm:inline">102.4 · Rotterdam</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden font-mono text-[11px] text-white/55 md:inline">2,481 listening</span>
            <span
              className={cn(
                "rounded-md border px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] transition-[color,border-color,box-shadow,text-shadow] duration-300",
                playing
                  ? "nk-app-music-player-onair border-[rgb(var(--neon))] text-[color-mix(in_srgb,rgb(var(--neon))_35%,white)] shadow-[0_0_10px_rgb(var(--neon)/0.6),inset_0_0_8px_rgb(var(--neon)/0.3)] [text-shadow:0_0_6px_rgb(var(--neon)),0_0_14px_rgb(var(--neon)/0.7)]"
                  : "border-[rgb(var(--neon)/0.18)] text-[rgb(var(--neon)/0.3)]",
              )}
            >
              On air
            </span>
          </div>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
          <div className="grid gap-8 md:grid-cols-[minmax(0,300px)_minmax(0,1fr)] md:items-center lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
            <div className="relative">
              <div
                aria-hidden
                className="absolute inset-x-[8%] -bottom-6 h-1/2 rounded-full bg-[rgb(var(--neon)/0.35)] blur-[48px] transition-opacity duration-700"
                style={{ opacity: playing ? 1 : 0.25 }}
              />
              <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.9)]">
                <Cover art={track.art} label={track.album} className="size-full" />
              </div>
            </div>

            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">
                Night shift with Ines Maro · {index + 1} of {TRACKS.length}
              </p>
              <h2 id="late-radio-title" className="mt-3 text-[clamp(2.25rem,4.4vw,3.4rem)] font-semibold leading-[0.95] tracking-[-0.045em] text-white">
                {track.title}
              </h2>
              <p className="mt-3 text-lg text-white/70">
                {track.artist} <span className="text-white/55">· {track.album}</span>
              </p>

              <Equalizer bars={36} height={56} gap={3} playing={playing} className="mt-7" />

              <div className="mt-6">
                <Slider
                  size="sm"
                  min={0}
                  max={track.seconds}
                  value={[elapsed]}
                  onValueChange={([v]) => dispatch({ type: "seek", to: v })}
                  thumbLabels={["Seek"]}
                  formatValue={time}
                />
                <div className="mt-2 flex justify-between font-mono text-[11px] tabular-nums text-white/55">
                  <span>{time(elapsed)}</span>
                  <span>-{time(track.seconds - elapsed)}</span>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-5">
                <div className="flex items-center gap-1 max-sm:w-full max-sm:justify-between">
                  <IconButton label="Shuffle" aria-pressed={shuffle} active={shuffle} onClick={() => setShuffle((v) => !v)}><Shuffle /></IconButton>
                  <IconButton label="Previous track" onClick={() => dispatch({ type: "skip", step: -1, shuffle })}><SkipBack /></IconButton>
                  <button
                    type="button"
                    aria-label={playing ? "Pause" : "Play"}
                    onClick={() => setPlaying((p) => !p)}
                    className="mx-1.5 inline-flex size-14 items-center justify-center rounded-full bg-[rgb(var(--neon))] text-[#05060a] shadow-[0_0_0_1px_rgb(var(--neon)),0_0_24px_rgb(var(--neon)/0.5),inset_0_1px_0_rgb(255_255_255/0.45)] outline-none transition-[transform,box-shadow] duration-150 hover:shadow-[0_0_0_1px_rgb(var(--neon)),0_0_36px_rgb(var(--neon)/0.7),inset_0_1px_0_rgb(255_255_255/0.45)] active:scale-[0.95] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]"
                  >
                    {playing ? <Pause className="size-6" fill="currentColor" /> : <Play className="ml-0.5 size-6" fill="currentColor" />}
                  </button>
                  <IconButton label="Next track" onClick={() => dispatch({ type: "skip", step: 1, shuffle })}><SkipForward /></IconButton>
                  <IconButton label="Repeat track" aria-pressed={repeat} active={repeat} onClick={() => setRepeat((v) => !v)}><Repeat /></IconButton>
                </div>
                <div className="flex min-w-[220px] flex-1 items-center gap-2 sm:max-w-[280px]">
                  <IconButton label={liked.has(index) ? "Unlike" : "Like"} aria-pressed={liked.has(index)} active={liked.has(index)} onClick={toggleLike}>
                    <Heart fill={liked.has(index) ? "currentColor" : "none"} />
                  </IconButton>
                  <IconButton label={muted ? "Unmute" : "Mute"} aria-pressed={muted} onClick={() => setMuted((m) => !m)}>
                    {loud === 0 ? <VolumeX /> : <Volume2 />}
                  </IconButton>
                  <Fader
                    orientation="horizontal"
                    size="sm"
                    aria-label="Volume"
                    value={loud}
                    onValueChange={(v) => {
                      setMuted(false);
                      setVolume(v);
                    }}
                    level={level}
                    ticks={0}
                    formatValue={(v) => `${v}%`}
                    className="min-w-0 flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          <aside aria-labelledby="late-radio-queue" className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-2">
            <div className="flex items-baseline justify-between px-3 pb-2 pt-3">
              <h3 id="late-radio-queue" className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">Up next</h3>
              <span className="font-mono text-[11px] text-white/55">{time(TRACKS.reduce((n, t) => n + t.seconds, 0))} total</span>
            </div>
            <ol className="mb-2">
              {TRACKS.map((t, i) => {
                const active = i === index;
                return (
                  <li key={t.title}>
                    <button
                      type="button"
                      aria-current={active || undefined}
                      onClick={() => {
                        if (active) return setPlaying((p) => !p);
                        dispatch({ type: "play", index: i });
                        setPlaying(true);
                      }}
                      className={cn(
                        "grid w-full grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl p-2 text-left outline-none transition-colors duration-150",
                        "hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[rgb(var(--neon)/0.6)]",
                        active && "bg-white/[0.05]",
                      )}
                    >
                      <span className="relative size-11 overflow-hidden rounded-lg border border-white/10">
                        <Cover art={t.art} className="size-full" />
                        {active && (
                          <span className="absolute inset-0 grid place-items-center bg-black/55 px-2.5">
                            <Equalizer bars={4} height={14} gap={2} peaks={false} playing={playing} className="w-full" />
                          </span>
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className={cn("block truncate text-sm", active ? "text-[color-mix(in_srgb,rgb(var(--neon))_45%,white)] [text-shadow:0_0_12px_rgb(var(--neon)/0.5)]" : "text-white/85")}>
                          {t.title}
                        </span>
                        <span className="block truncate text-xs text-white/60">{t.artist}</span>
                      </span>
                      <span className="pr-1 font-mono text-[11px] tabular-nums text-white/55">{time(t.seconds)}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <p className="mt-auto flex items-baseline justify-between gap-3 border-t border-white/[0.06] px-3 pb-2 pt-3 font-mono text-[11px] text-white/55">
              <span>Next show 03:00</span>
              <span className="truncate text-white/75">Slow Hands with Dee Okafor</span>
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
