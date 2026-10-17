"use client";

import * as React from "react";
import { useReducedMotion } from "motion/react";
import { Check, Mic, MicOff, X } from "@/components/ui/icons";
import { Meter } from "@/components/ui/meter";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

const css = `
@keyframes nk-voice-ignite{0%{filter:brightness(.35) saturate(.6)}9%{filter:brightness(1.35)}15%{filter:brightness(.55)}26%{filter:brightness(1.2)}38%{filter:brightness(.85)}100%{filter:none}}
.nk-voice-ignite{animation:nk-voice-ignite 460ms linear both}
@keyframes nk-voice-in{from{opacity:0;transform:translateX(-4px)}to{opacity:1;transform:none}}
.nk-voice-in{animation:nk-voice-in 200ms cubic-bezier(.23,1,.32,1) both}
@media (prefers-reduced-motion:reduce){.nk-voice-ignite,.nk-voice-in{animation:none}}
`;

export type VoiceInputState = "idle" | "requesting" | "listening" | "transcribing" | "done" | "denied" | "error";

export interface VoiceRecording {
  /** What the microphone heard, when it was used and the browser has MediaRecorder. */
  audio?: Blob;
  /** Milliseconds from the first sample to the stop. */
  duration: number;
}

export interface VoiceInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "onError" | "defaultValue"> {
  /** `toggle`: press to start, press again to finish. `hold`: talk while the button or Space is held. */
  mode?: "toggle" | "hold";
  /** Ask for the microphone on start, drive the meter from it and record it. Off: the meter follows `level`. */
  microphone?: boolean;
  /** Input level, 0 to 1. Overrides the microphone's own reading, e.g. from your speech SDK. */
  level?: number;
  /** Controlled state. Pair with `onStateChange`. */
  state?: VoiceInputState;
  defaultState?: VoiceInputState;
  onStateChange?: (state: VoiceInputState) => void;
  onStart?: () => void;
  /** Called with the recording when the speaker finishes. Return a promise to show Transcribing until it settles. */
  onStop?: (recording: VoiceRecording) => void | Promise<unknown>;
  onCancel?: () => void;
  /** The microphone was refused or failed, or the stop promise rejected. */
  onError?: (error: unknown) => void;
  /** Seconds. Recording stops by itself at this length; the timer turns amber 10s before. */
  maxDuration?: number;
  /** sm fits a composer toolbar; md is a full-width bar. */
  size?: "sm" | "md";
  disabled?: boolean;
  /** Accessible name of the button at rest. */
  label?: string;
  /** md only: the line shown on the display at rest. */
  hint?: string;
  color?: NeonColor;
}

const iconButton = cn(
  "relative inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg outline-none",
  "transition-[background-color,color,border-color,box-shadow,transform] duration-150 ease-out active:scale-[0.94]",
  "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-1 focus-visible:ring-offset-[#0a0c12]",
  "disabled:pointer-events-none [&_svg]:size-4",
);

const lit = cn(
  "border border-[rgb(var(--neon)/0.6)] bg-[rgb(var(--neon)/0.1)]",
  "shadow-[0_0_16px_-4px_rgb(var(--neon)/CALC(0.65*var(--neon-glow,1))),inset_0_0_10px_rgb(var(--neon)/CALC(0.14*var(--neon-glow,1)))]",
  "hover:bg-[rgb(var(--neon)/0.16)]",
);

function formatElapsed(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

type Session = {
  token: number;
  stream: MediaStream | null;
  audio: AudioContext | null;
  analyser: AnalyserNode | null;
  recorder: MediaRecorder | null;
  chunks: Blob[];
};

const geometry = {
  sm: { dot: 3, gap: 1, rows: 5, height: 19 },
  md: { dot: 3, gap: 2, rows: 7, height: 29 },
} as const;

/** The tape moves one column every this many ms, in whole steps like an LED matrix. */
const COLUMN_MS = 70;

function readRgb(element: Element) {
  const raw = getComputedStyle(element).getPropertyValue("--neon").trim();
  const parts = raw.split(/[\s,/]+/).map(Number).filter((n) => Number.isFinite(n));
  return parts.length >= 3 ? parts.slice(0, 3) : [34, 211, 238];
}

/** RMS of the waveform as a 0–1 level over a −54 to −6 dBFS window, where speech lives. */
function levelFrom(analyser: AnalyserNode, buffer: Float32Array<ArrayBuffer>) {
  analyser.getFloatTimeDomainData(buffer);
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) sum += buffer[i] * buffer[i];
  const rms = Math.sqrt(sum / buffer.length);
  const db = 20 * Math.log10(rms || 1e-8);
  return Math.min(1, Math.max(0, (db + 54) / 48));
}

const subscribeNothing = () => () => {};

/** False on the server and during hydration, so reduced-motion output can't mismatch the server HTML. */
function useIsClient() {
  return React.useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
}

const VoiceInput = React.forwardRef<HTMLDivElement, VoiceInputProps>(
  (
    {
      mode = "toggle",
      microphone = true,
      level,
      state: stateProp,
      defaultState = "idle",
      onStateChange,
      onStart,
      onStop,
      onCancel,
      onError,
      maxDuration,
      size = "sm",
      disabled = false,
      label = "Dictate",
      hint,
      color,
      className,
      style,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const isClient = useIsClient();
    const reduceMotion = (useReducedMotion() ?? false) && isClient;
    const [innerState, setInnerState] = React.useState<VoiceInputState>(defaultState);
    const state = stateProp ?? innerState;
    const stateRef = React.useRef(state);
    const [message, setMessage] = React.useState("");
    const [elapsed, setElapsed] = React.useState(0);
    const [stillLevel, setStillLevel] = React.useState(0);
    const [held, setHeld] = React.useState(false);

    const rootId = React.useId();
    const rootRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);
    const mainRef = React.useRef<HTMLButtonElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const session = React.useRef<Session>({ token: 0, stream: null, audio: null, analyser: null, recorder: null, chunks: [] });
    const startedAt = React.useRef<number | null>(null);
    const levelRef = React.useRef(0);
    const propLevel = React.useRef(level);
    const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);
    const holdingRef = React.useRef(false);

    React.useEffect(() => {
      stateRef.current = state;
      propLevel.current = level;
    });

    const later = (fn: () => void, ms: number) => {
      timers.current.push(setTimeout(fn, ms));
    };
    const clearTimers = () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };

    const setState = React.useCallback(
      (next: VoiceInputState) => {
        if (stateRef.current === next) return;
        stateRef.current = next;
        if (stateProp === undefined) setInnerState(next);
        onStateChange?.(next);
      },
      [stateProp, onStateChange],
    );

    const release = () => {
      const s = session.current;
      s.stream?.getTracks().forEach((track) => track.stop());
      s.audio?.close().catch(() => {});
      if (s.recorder && s.recorder.state !== "inactive") {
        s.recorder.onstop = null;
        try {
          s.recorder.stop();
        } catch {
          // Already stopped.
        }
      }
      session.current = { token: s.token, stream: null, audio: null, analyser: null, recorder: null, chunks: [] };
    };

    React.useEffect(
      () => () => {
        session.current.token += 1;
        release();
        clearTimers();
      },
      [],
    );

    const focusMain = () => {
      if (rootRef.current?.contains(document.activeElement)) mainRef.current?.focus();
    };

    const fail = (next: "denied" | "error", text: string, error: unknown) => {
      release();
      setMessage(text);
      setState(next);
      onError?.(error);
    };

    const start = async () => {
      const current = stateRef.current;
      if (disabled || current === "listening" || current === "requesting" || current === "transcribing") return;
      clearTimers();
      setMessage("");
      setElapsed(0);
      startedAt.current = null;
      const token = ++session.current.token;
      onStart?.();
      if (!microphone) {
        setState("listening");
        return;
      }
      const devices = typeof navigator !== "undefined" ? navigator.mediaDevices : undefined;
      if (!devices?.getUserMedia) {
        fail("error", "No microphone access on this page", new Error("getUserMedia is unavailable"));
        return;
      }
      setState("requesting");
      try {
        const stream = await devices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
        if (token !== session.current.token) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        const s = session.current;
        s.stream = stream;
        try {
          const Context =
            window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
          if (Context) {
            const audio = new Context();
            const analyser = audio.createAnalyser();
            analyser.fftSize = 1024;
            audio.createMediaStreamSource(stream).connect(analyser);
            audio.resume().catch(() => {});
            s.audio = audio;
            s.analyser = analyser;
          }
        } catch {
          // No level meter, the recording still works.
        }
        if (typeof MediaRecorder !== "undefined") {
          try {
            const recorder = new MediaRecorder(stream);
            recorder.ondataavailable = (event) => {
              if (event.data.size) s.chunks.push(event.data);
            };
            recorder.start();
            s.recorder = recorder;
          } catch {
            // Recording isn't supported for this stream; the meter still works.
          }
        }
        setState("listening");
      } catch (error) {
        if (token !== session.current.token) return;
        const name = (error as { name?: string } | null)?.name;
        if (name === "NotAllowedError" || name === "SecurityError") {
          fail("denied", "Microphone blocked. Allow it in the site settings, then try again.", error);
        } else if (name === "NotFoundError" || name === "OverconstrainedError") {
          fail("error", "No microphone found", error);
        } else {
          fail("error", "The microphone didn't start", error);
        }
      }
    };

    const finish = () => {
      if (stateRef.current !== "listening") return;
      const duration = startedAt.current === null ? 0 : performance.now() - startedAt.current;
      const token = session.current.token;
      const recorder = session.current.recorder;
      const chunks = session.current.chunks;

      const deliver = (audio?: Blob) => {
        release();
        if (token !== session.current.token) return;
        let result: void | Promise<unknown> = undefined;
        try {
          result = onStop?.({ audio, duration });
        } catch (error) {
          fail("error", "That recording couldn't be used", error);
          return;
        }
        const settle = () => {
          if (token !== session.current.token) return;
          setState("done");
          later(() => {
            if (token === session.current.token && stateRef.current === "done") setState("idle");
          }, 1100);
        };
        if (result && typeof (result as Promise<unknown>).then === "function") {
          setState("transcribing");
          (result as Promise<unknown>).then(settle, (error) => {
            if (token !== session.current.token) return;
            fail("error", "Couldn't transcribe that. Try again.", error);
          });
        } else settle();
      };

      if (recorder && recorder.state !== "inactive") {
        // Freeze the tape while the recorder flushes its last chunk.
        setState("transcribing");
        recorder.onstop = () => deliver(new Blob(chunks, { type: recorder.mimeType || "audio/webm" }));
        try {
          recorder.stop();
        } catch {
          deliver();
        }
      } else deliver();
    };

    const cancel = (quiet = false) => {
      const current = stateRef.current;
      if (current === "idle") return;
      session.current.token += 1;
      release();
      clearTimers();
      setMessage("");
      setState("idle");
      if (!quiet && (current === "listening" || current === "requesting" || current === "transcribing")) onCancel?.();
      focusMain();
    };

    const finishRef = React.useRef(finish);
    React.useEffect(() => {
      finishRef.current = finish;
    });

    const active = state === "listening" || state === "transcribing" || state === "done" || state === "requesting";
    const listening = state === "listening";

    // The clock starts with the first sample, not the click; permission prompts don't count.
    React.useEffect(() => {
      if (!listening) {
        if (state === "idle") startedAt.current = null;
        return;
      }
      if (startedAt.current === null) startedAt.current = performance.now();
      const tick = () => {
        const ms = performance.now() - (startedAt.current ?? performance.now());
        setElapsed(ms);
        if (maxDuration !== undefined && ms >= maxDuration * 1000) finishRef.current();
      };
      tick();
      const id = setInterval(tick, 200);
      return () => clearInterval(id);
    }, [listening, state, maxDuration]);

    // One loop reads the level and draws the tape. Under reduced motion it only samples, four times a second.
    const drawing = state === "listening" || state === "transcribing" || (size === "md" && state === "done");
    React.useEffect(() => {
      if (!drawing) return;
      const canvas = canvasRef.current;
      const g = geometry[size];
      const pitch = g.dot + g.gap;
      let raf = 0;
      let history = new Float32Array(1);
      let head = 0;
      let lastPush = 0;
      let windowMax = 0;
      let smooth = levelRef.current;
      let width = 0;
      let rgb = [34, 211, 238];
      const buffer = new Float32Array(1024) as Float32Array<ArrayBuffer>;
      const dpr = typeof window !== "undefined" ? Math.min(2, window.devicePixelRatio || 1) : 1;
      let context: CanvasRenderingContext2D | null = null;
      try {
        context = canvas && !reduceMotion ? canvas.getContext("2d") : null;
      } catch {
        context = null;
      }

      const fit = () => {
        if (!canvas) return;
        const next = Math.max(pitch, Math.floor(canvas.clientWidth));
        if (next === width) return;
        width = next;
        canvas.width = width * dpr;
        canvas.height = g.height * dpr;
        const cols = Math.max(1, Math.floor((width + g.gap) / pitch));
        const resized = new Float32Array(cols);
        // Keep the newest columns when the tape changes length.
        for (let i = 0; i < Math.min(cols, history.length); i++) {
          resized[cols - 1 - i] = history[(head - 1 - i + history.length * 2) % history.length];
        }
        history = resized;
        head = 0;
        rgb = readRgb(canvas);
      };
      fit();
      const observer = typeof ResizeObserver !== "undefined" && canvas ? new ResizeObserver(fit) : null;
      if (canvas) observer?.observe(canvas);

      const draw = (now: number, live: number) => {
        if (!context || !canvas) return;
        const cols = history.length;
        const rows = g.rows;
        const middle = (rows - 1) / 2;
        const top = Math.round((g.height - (rows * g.dot + (rows - 1) * g.gap)) / 2);
        const left = width - (cols * pitch - g.gap);
        const transcribing = stateRef.current !== "listening";
        const sweeping = stateRef.current === "transcribing";
        const playhead = sweeping ? (((now % 1500) / 1500) * (width + 24)) - 12 : -100;
        const [r, gg, b] = rgb;
        const core = `${Math.round(r + (255 - r) * 0.35)},${Math.round(gg + (255 - gg) * 0.35)},${Math.round(b + (255 - b) * 0.35)}`;
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        context.clearRect(0, 0, width, g.height);
        for (let i = 0; i < cols; i++) {
          const newest = i === cols - 1;
          const value = newest && !transcribing ? Math.max(live, history[(head + i) % cols]) : history[(head + i) % cols];
          const age = cols === 1 ? 1 : i / (cols - 1);
          // Older columns fade like phosphor.
          let fade = 0.28 + 0.72 * age * age;
          const x = left + i * pitch;
          if (sweeping) {
            const near = Math.max(0, 1 - Math.abs(x - playhead) / 14);
            fade = 0.3 + near * 0.7;
          } else if (transcribing) fade = 0.3;
          const extent = value * (middle + 1);
          for (let row = 0; row < rows; row++) {
            const y = top + row * pitch;
            const distance = Math.abs(row - middle);
            let on = Math.min(1, Math.max(0, extent - distance));
            if (distance === 0) on = Math.max(on, 0.24);
            context.fillStyle = "rgba(255,255,255,0.06)";
            context.fillRect(x, y, g.dot, g.dot);
            const alpha = on * fade;
            if (alpha < 0.03) continue;
            context.fillStyle = `rgba(${alpha > 0.7 ? core : `${r},${gg},${b}`},${alpha.toFixed(3)})`;
            context.fillRect(x, y, g.dot, g.dot);
          }
        }
      };

      let lastStill = 0;
      const loop = (now: number) => {
        raf = requestAnimationFrame(loop);
        const isListening = stateRef.current === "listening";
        const analyser = session.current.analyser;
        let raw = 0;
        if (propLevel.current !== undefined) raw = Math.min(1, Math.max(0, propLevel.current));
        else if (analyser) raw = levelFrom(analyser, buffer);
        // Fast attack, slower release, like a VU needle.
        smooth = raw > smooth ? smooth + (raw - smooth) * 0.6 : smooth + (raw - smooth) * 0.18;
        if (!isListening) smooth = 0;
        levelRef.current = smooth;
        windowMax = Math.max(windowMax, smooth);
        if (isListening && now - lastPush >= COLUMN_MS) {
          history[head] = windowMax;
          head = (head + 1) % history.length;
          windowMax = 0;
          lastPush = now;
        }
        if (reduceMotion) {
          if (now - lastStill > 250) {
            lastStill = now;
            setStillLevel(isListening ? smooth : 0);
          }
          return;
        }
        draw(now, isListening ? smooth : 0);
      };
      raf = requestAnimationFrame(loop);
      return () => {
        cancelAnimationFrame(raf);
        observer?.disconnect();
      };
    }, [drawing, size, reduceMotion]);

    const holdStart = () => {
      if (holdingRef.current) return;
      holdingRef.current = true;
      setHeld(true);
      void start();
    };
    const holdEnd = () => {
      if (!holdingRef.current) return;
      holdingRef.current = false;
      setHeld(false);
      const current = stateRef.current;
      if (current === "requesting") {
        // Released while the browser was asking. Once allowed, the next hold talks straight away.
        cancel(true);
        setMessage("Hold again to talk");
        return;
      }
      if (current !== "listening") return;
      const ms = startedAt.current === null ? 0 : performance.now() - startedAt.current;
      if (ms < 300) {
        cancel(true);
        setMessage("Hold to talk");
        later(() => setMessage((text) => (text === "Hold to talk" ? "" : text)), 1600);
        return;
      }
      finish();
    };

    const mainHandlers =
      mode === "hold"
        ? {
            onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => {
              if (event.button !== 0) return;
              event.currentTarget.setPointerCapture?.(event.pointerId);
              holdStart();
            },
            onPointerUp: () => holdEnd(),
            onPointerCancel: () => {
              holdingRef.current = false;
              setHeld(false);
              cancel();
            },
            onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => {
              if ((event.key === " " || event.key === "Enter") && !event.repeat) {
                event.preventDefault();
                holdStart();
              }
            },
            onKeyUp: (event: React.KeyboardEvent<HTMLButtonElement>) => {
              if (event.key === " " || event.key === "Enter") {
                event.preventDefault();
                holdEnd();
              }
            },
            onBlur: () => holdEnd(),
          }
        : {
            onClick: () => {
              const current = stateRef.current;
              if (current === "listening") finish();
              else if (current === "requesting") cancel();
              else if (current !== "transcribing") void start();
            },
          };

    const blocked = state === "denied" || state === "error";
    const nearEnd = maxDuration !== undefined && maxDuration * 1000 - elapsed <= 10_000;

    const mainLabel =
      mode === "hold"
        ? label === "Dictate"
          ? "Hold to talk"
          : label
        : state === "listening"
          ? "Finish and transcribe"
          : state === "requesting"
            ? "Cancel microphone request"
            : state === "transcribing"
              ? "Transcribing"
              : blocked
                ? `${label}, try again`
                : label;

    const statusLine =
      state === "requesting"
        ? "Waiting for the microphone"
        : state === "listening"
          ? "Listening"
          : state === "transcribing"
            ? "Transcribing"
            : state === "done"
              ? "Done"
              : message;

    const sm = size === "sm";
    const g = geometry[size];
    const mainSize = sm ? "size-8" : "size-9";
    const showTape = drawing && !reduceMotion;
    const showStill = listening && reduceMotion;

    const main = (
      <button
        ref={mainRef}
        type="button"
        aria-label={mainLabel}
        aria-pressed={mode === "hold" ? held : undefined}
        aria-describedby={blocked && message ? `${rootId}-status` : undefined}
        disabled={disabled || state === "transcribing"}
        className={cn(
          iconButton,
          mainSize,
          mode === "hold" && "touch-none select-none",
          listening || (mode === "hold" && held)
            ? lit
            : state === "done"
              ? cn(lit, "nk-voice-ignite")
              : state === "requesting"
                ? "border border-[rgb(var(--neon)/0.35)] text-white/80"
                : state === "transcribing"
                  ? "border border-white/10 text-white/35"
                  : blocked
                    ? "text-[#fbbf24] hover:bg-white/[0.06]"
                    : "text-white/55 hover:bg-white/[0.06] hover:text-white/90",
          disabled && "opacity-40",
        )}
        {...mainHandlers}
      >
        {state === "done" ? (
          <Check aria-hidden strokeWidth={2.25} className="text-[color-mix(in_srgb,rgb(var(--neon))_65%,white)] [filter:drop-shadow(0_0_4px_rgb(var(--neon)/CALC(0.9*var(--neon-glow,1))))]" />
        ) : blocked ? (
          <MicOff aria-hidden />
        ) : (listening || state === "transcribing") && mode === "toggle" ? (
          <span
            aria-hidden
            className={cn(
              "size-2.5 rounded-[2px]",
              state === "transcribing"
                ? "bg-white/30"
                : "[background:color-mix(in_srgb,rgb(var(--neon))_60%,white)] shadow-[0_0_6px_rgb(var(--neon)/var(--neon-glow,1))]",
            )}
          />
        ) : (
          <Mic
            aria-hidden
            className={cn(
              (listening || held) &&
                "text-[color-mix(in_srgb,rgb(var(--neon))_65%,white)] [filter:drop-shadow(0_0_4px_rgb(var(--neon)/CALC(0.8*var(--neon-glow,1))))]",
            )}
          />
        )}
      </button>
    );

    const display = (
      <span
        className={cn("relative flex min-w-0 items-center", sm ? "w-[72px]" : "flex-1")}
        style={{ height: g.height }}
      >
        {showTape && (
          <canvas
            ref={canvasRef}
            aria-hidden
            className="block h-full w-full [filter:drop-shadow(0_0_3px_rgb(var(--neon)/CALC(0.55*var(--neon-glow,1))))]"
          />
        )}
        {showStill && (
          <Meter
            aria-hidden
            value={state === "listening" ? stillLevel : 0}
            peak={false}
            segments={sm ? 10 : 24}
            size="sm"
            className="w-full"
          />
        )}
        {!sm && !showTape && !showStill && (
          <span
            className={cn(
              "truncate text-[13.5px]",
              blocked ? "text-white/70" : state === "requesting" ? "text-white/70" : "text-white/50",
            )}
          >
            {blocked
              ? message || (state === "denied" ? "Microphone blocked" : "The microphone didn't start")
              : message
                ? message
                : state === "requesting"
                ? "Waiting for the microphone"
                : state === "done"
                  ? "Done"
                  : state === "transcribing"
                    ? "Transcribing"
                  : (hint ?? (mode === "hold" ? "Hold to talk, or hold Space" : "Press to dictate"))}
          </span>
        )}
      </span>
    );

    const timer = (
      <span
        aria-hidden
        className={cn(
          "shrink-0 font-mono tabular-nums leading-none",
          sm ? "text-[12px]" : "text-[13px]",
          nearEnd && listening ? "text-[#fbbf24]" : state === "transcribing" ? "text-white/40" : "text-white/75",
        )}
      >
        {formatElapsed(elapsed)}
        {!sm && maxDuration !== undefined && <span className="text-white/35"> / {formatElapsed(maxDuration * 1000)}</span>}
      </span>
    );

    const cancelButton = (
      <button
        type="button"
        aria-label={state === "transcribing" ? "Discard recording" : "Cancel recording"}
        onClick={() => cancel()}
        className={cn(iconButton, sm ? "size-7" : "size-8", "text-white/50 hover:bg-white/[0.06] hover:text-white/90")}
      >
        <X aria-hidden className="!size-3.5" strokeWidth={2.25} />
      </button>
    );

    const recording = listening || state === "transcribing" || state === "requesting";

    return (
      <div
        ref={rootRef}
        data-state={state}
        data-size={size}
        style={neonVars(color, style)}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || event.key !== "Escape") return;
          if (recording) {
            event.preventDefault();
            event.stopPropagation();
            cancel();
          }
        }}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "text-white/90",
          sm
            ? cn(
                "inline-flex h-8 max-w-full items-center rounded-lg border transition-[background-color,border-color] duration-200",
                active ? "gap-1.5 border-white/[0.08] bg-white/[0.035] pr-0.5" : "gap-2 border-transparent",
              )
            : "flex h-12 w-full min-w-0 items-center gap-2.5 rounded-xl border border-white/10 bg-[#0a0c12] pl-1.5 pr-2 shadow-[inset_0_1px_0_rgb(255_255_255/0.03)]",
          className,
        )}
        {...props}
      >
        <style href="nk-voice-input" precedence="nk">{css}</style>
        {main}
        {sm ? (
          active ? (
            <span className="nk-voice-in flex min-w-0 items-center gap-2">
              {state === "requesting" || (state === "transcribing" && reduceMotion) ? (
                <span className="whitespace-nowrap pl-0.5 text-[12.5px] text-white/60">
                  {state === "requesting" ? "Allow the mic" : "Transcribing"}
                </span>
              ) : (
                <>
                  {display}
                  {timer}
                </>
              )}
              {state !== "done" && cancelButton}
            </span>
          ) : (
            (blocked || message) && (
              <span className="truncate pr-1 text-[12.5px] text-white/60">
                {state === "denied" ? "Mic blocked" : message}
              </span>
            )
          )
        ) : (
          <>
            {display}
            {(listening || state === "transcribing" || state === "done") && timer}
            {recording ? cancelButton : <span aria-hidden className="size-8 shrink-0" />}
          </>
        )}
        <span id={`${rootId}-status`} role="status" className="sr-only">
          {statusLine}
        </span>
      </div>
    );
  },
);
VoiceInput.displayName = "VoiceInput";

export { VoiceInput };
