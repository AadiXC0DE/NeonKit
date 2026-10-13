"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

const css = `
@keyframes nk-terminal-blink { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }
.nk-terminal-blink { animation: nk-terminal-blink 1.06s steps(1, end) infinite; }
[data-typing] > .nk-terminal-blink { animation: none; }
@media (prefers-reduced-motion: reduce) { .nk-terminal-blink { animation: none; } }
`;

const reducedQuery = "(prefers-reduced-motion: reduce)";

function subscribeReduced(onChange: () => void) {
  const mq = window.matchMedia?.(reducedQuery);
  mq?.addEventListener?.("change", onChange);
  return () => mq?.removeEventListener?.("change", onChange);
}

function useReducedMotionPreference() {
  return React.useSyncExternalStore(
    subscribeReduced,
    () => !!window.matchMedia?.(reducedQuery).matches,
    () => false,
  );
}

export type TerminalLine = {
  /** `input` is typed after the prompt; everything else prints. */
  kind: "input" | "output" | "success" | "error" | "comment";
  text: string;
  /** Milliseconds to wait before this line starts. */
  delay?: number;
};

const kinds: Record<TerminalLine["kind"], string> = {
  input: "text-white/90",
  output: "text-white/55",
  success: "text-[rgb(52_211_153)]",
  error: "text-[rgb(255_77_94)]",
  // Dimmer than output but still AA on the terminal's glass.
  comment: "text-white/50",
};

function Caret({ blink, className }: { blink: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative -mr-[0.6em] inline-block h-[1.2em] w-[0.6em] translate-y-[0.22em] [background-color:color-mix(in_srgb,rgb(var(--neon))_70%,white)] shadow-[0_0_8px_rgb(var(--neon)/0.8),0_0_18px_rgb(var(--neon)/0.35)]",
        blink && "nk-terminal-blink",
        className,
      )}
    />
  );
}

export interface TerminalProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "title"> {
  /** Shown in the title bar. */
  title?: React.ReactNode;
  /** The session, in order. */
  lines: TerminalLine[];
  /** Milliseconds per typed character, before a little human jitter. */
  typingSpeed?: number;
  /** Start over a few seconds after the last line. */
  loop?: boolean;
  /** Wait until the terminal scrolls into view before typing. */
  startOnView?: boolean;
  /** Printed before every input line. */
  prompt?: string;
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
}

const Terminal = React.forwardRef<HTMLDivElement, TerminalProps>(
  (
    {
      className,
      style,
      color,
      title,
      lines,
      typingSpeed = 35,
      loop = false,
      startOnView = true,
      prompt = "$",
      ...props
    },
    ref,
  ) => {
    const rootRef = React.useRef<HTMLDivElement>(null);
    const typedRef = React.useRef<HTMLSpanElement>(null);
    const restRef = React.useRef<HTMLSpanElement>(null);
    const linesRef = React.useRef(lines);
    React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

    const reduced = useReducedMotionPreference();
    const [started, setStarted] = React.useState(!startOnView);
    const [run, setRun] = React.useState(0);
    // Lines before `step` are printed; `step` itself is the one in progress.
    const [step, setStep] = React.useState(0);
    const [typing, setTyping] = React.useState(false);
    const script = JSON.stringify(lines);

    React.useEffect(() => {
      linesRef.current = lines;
    });

    React.useEffect(() => {
      const node = rootRef.current;
      if (started || !node) return;
      if (typeof IntersectionObserver === "undefined") {
        const timer = setTimeout(() => setStarted(true));
        return () => clearTimeout(timer);
      }
      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          io.disconnect();
          setStarted(true);
        },
        { threshold: 0.3 },
      );
      io.observe(node);
      return () => io.disconnect();
    }, [started]);

    React.useEffect(() => {
      if (!started || reduced) return;
      const session = linesRef.current;
      let timer: ReturnType<typeof setTimeout>;
      let index = 0;

      const write = (text: string, count: number) => {
        if (typedRef.current) typedRef.current.textContent = text.slice(0, count);
        if (restRef.current) restRef.current.textContent = text.slice(count);
      };

      const next = () => {
        setStep(index);
        setTyping(false);
        const line = session[index];
        if (!line) {
          if (loop) {
            timer = setTimeout(() => {
              index = 0;
              next();
            }, 3200);
          }
          return;
        }
        const previous = session[index - 1];
        if (line.kind === "input") {
          timer = setTimeout(() => {
            setTyping(true);
            let count = 0;
            const type = () => {
              count += 1;
              write(line.text, count);
              if (count >= line.text.length) {
                // A beat on the finished line, as if reaching for Enter.
                timer = setTimeout(() => {
                  index += 1;
                  next();
                }, 360);
                return;
              }
              // Deterministic jitter: 0.6x to 1.4x the base speed.
              timer = setTimeout(type, typingSpeed * (0.6 + ((count * 7919) % 9) / 10));
            };
            timer = setTimeout(type, typingSpeed);
          }, line.delay ?? (index === 0 ? 400 : 700));
        } else {
          timer = setTimeout(
            () => {
              index += 1;
              next();
            },
            line.delay ?? (previous?.kind === "input" ? 420 : 90),
          );
        }
      };

      timer = setTimeout(next);
      return () => clearTimeout(timer);
    }, [started, reduced, run, loop, typingSpeed, script]);

    const done = reduced || step >= lines.length;
    const shown = reduced ? lines.length : step;
    const transcript = lines
      .map((line) => (line.kind === "input" ? `${prompt} ${line.text}` : line.text))
      .join("\n");

    return (
      <div
        ref={rootRef}
        data-state={done ? "done" : typing ? "typing" : "running"}
        style={neonVars(color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "relative w-full overflow-hidden rounded-xl border border-white/10 bg-[#07080c] font-mono text-[13px] leading-6",
          "shadow-[0_24px_60px_-28px_rgb(0_0_0/0.9),inset_0_1px_0_rgb(255_255_255/0.04)]",
          className,
        )}
        {...props}
      >
        <style>{css}</style>
        <div className="relative flex h-9 items-center gap-3 border-b border-white/[0.06] px-3.5">
          <span aria-hidden className="flex w-16 gap-1.5">
            <span className="size-2.5 rounded-full bg-white/[0.08] shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]" />
            <span className="size-2.5 rounded-full bg-white/[0.08] shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]" />
            <span className="size-2.5 rounded-full bg-white/[0.08] shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]" />
          </span>
          <span className="min-w-0 flex-1 truncate text-center text-xs text-white/55">{title}</span>
          <span className="flex w-16 justify-end">
            {!loop && !reduced && (
              // Stays mounted while the session replays, so a keyboard user keeps focus on it.
              <button
                type="button"
                tabIndex={done ? 0 : -1}
                onClick={() => {
                  setStep(0);
                  setRun((n) => n + 1);
                }}
                className={cn(
                  "-mr-1.5 inline-flex h-6 cursor-pointer items-center rounded-md px-1.5 font-sans text-xs font-medium text-white/60 outline-none transition-[color,background-color,opacity] duration-150 hover:bg-white/[0.06] hover:text-white/90 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]",
                  !done && "pointer-events-none opacity-0 focus-visible:opacity-100",
                )}
              >
                Replay
              </button>
            )}
          </span>
          {/* The bar's lower edge powers up while a command is being typed */}
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-x-6 -bottom-px h-px bg-[linear-gradient(90deg,transparent,rgb(var(--neon)/0.7),transparent)] transition-opacity duration-300",
              typing ? "opacity-100" : "opacity-0",
            )}
          />
        </div>
        <div className="relative px-4 py-3.5">
          <pre className="sr-only">{transcript}</pre>
          <div aria-hidden className="whitespace-pre-wrap break-all">
            {lines.map((line, i) => {
              const input = line.kind === "input";
              if (i === shown && input) {
                return (
                  <div key={`${run}-${i}-live`} className={kinds.input}>
                    <span className="text-[rgb(var(--neon))] [text-shadow:0_0_8px_rgb(var(--neon)/0.6)]">{prompt}</span>{" "}
                    <span ref={typedRef} className="[text-shadow:0_0_10px_rgb(var(--neon)/0.25)]" />
                    <Caret blink={!typing} />
                    <span ref={restRef} className="invisible">
                      {line.text}
                    </span>
                  </div>
                );
              }
              return (
                <div key={`${run}-${i}`} className={cn(kinds[line.kind], i >= shown && "invisible")}>
                  {input && (
                    <>
                      <span className="text-[rgb(var(--neon))] [text-shadow:0_0_8px_rgb(var(--neon)/0.6)]">{prompt}</span>{" "}
                    </>
                  )}
                  {line.text}
                </div>
              );
            })}
            <div className={cn(kinds.input, !done && "invisible")}>
              <span className="text-[rgb(var(--neon))] [text-shadow:0_0_8px_rgb(var(--neon)/0.6)]">{prompt}</span>{" "}
              {done && <Caret blink />}
            </div>
          </div>
        </div>
      </div>
    );
  },
);
Terminal.displayName = "Terminal";

export interface TypewriterProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "color" | "children"> {
  /** Words to type, delete and rotate through. */
  words: string[];
  /** Keep rotating. When false it stops on the last word. */
  loop?: boolean;
  /** Show the lit caret. */
  cursor?: boolean;
  /** Milliseconds per typed character. */
  typeSpeed?: number;
  /** Milliseconds per deleted character. */
  deleteSpeed?: number;
  /** Milliseconds a finished word stays up. */
  pause?: number;
  /** Element to render. */
  as?: "span" | "p" | "div" | "h1" | "h2" | "h3" | "h4";
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
}

const Typewriter = React.forwardRef<HTMLElement, TypewriterProps>(
  (
    {
      className,
      style,
      color,
      words,
      loop = true,
      cursor = true,
      typeSpeed = 70,
      deleteSpeed = 40,
      pause = 1800,
      as: Tag = "span",
      ...props
    },
    ref,
  ) => {
    const rootRef = React.useRef<HTMLElement>(null);
    const wordRef = React.useRef<HTMLSpanElement>(null);
    const wordsRef = React.useRef(words);
    React.useImperativeHandle(ref, () => rootRef.current as HTMLElement);
    const reduced = useReducedMotionPreference();
    const list = JSON.stringify(words);

    React.useEffect(() => {
      wordsRef.current = words;
    });

    React.useEffect(() => {
      const root = rootRef.current;
      const node = wordRef.current;
      const all = wordsRef.current;
      if (!root || !node || all.length < 2) return;
      let timer: ReturnType<typeof setTimeout>;
      let index = 0;
      let count = all[0].length;
      node.textContent = all[0];

      const setTyping = (value: boolean) => {
        if (value) root.setAttribute("data-typing", "");
        else root.removeAttribute("data-typing");
      };

      const hold = () => {
        setTyping(false);
        if (!loop && index === all.length - 1) return;
        timer = setTimeout(reduced ? swap : erase, pause);
      };
      // Reduced motion: the words still rotate, they just don't type.
      const swap = () => {
        index = (index + 1) % all.length;
        node.textContent = all[index];
        hold();
      };
      const erase = () => {
        setTyping(true);
        count -= 1;
        node.textContent = all[index].slice(0, Math.max(0, count));
        if (count > 0) {
          timer = setTimeout(erase, deleteSpeed);
          return;
        }
        index = (index + 1) % all.length;
        timer = setTimeout(type, typeSpeed * 3);
      };
      const type = () => {
        count += 1;
        node.textContent = all[index].slice(0, count);
        if (count < all[index].length) {
          timer = setTimeout(type, typeSpeed * (0.7 + ((count * 7919) % 7) / 10));
          return;
        }
        hold();
      };

      hold();
      return () => {
        clearTimeout(timer);
        setTyping(false);
      };
    }, [list, loop, pause, typeSpeed, deleteSpeed, reduced]);

    return (
      <Tag
        ref={rootRef as React.Ref<HTMLHeadingElement>}
        style={neonVars(color, style)}
        className={cn("[--neon:var(--neon-accent,34_211_238)]", className)}
        {...props}
      >
        <style>{css}</style>
        <span className="sr-only">{words.join(", ")}</span>
        <span
          aria-hidden
          ref={wordRef}
          className="[color:color-mix(in_srgb,rgb(var(--neon))_45%,white)] [text-shadow:0_0_2px_rgb(var(--neon)/0.6),0_0_14px_rgb(var(--neon)/0.55),0_0_36px_rgb(var(--neon)/0.3)]"
        >
          {words[0]}
        </span>
        {cursor && (
          <span
            aria-hidden
            className="nk-terminal-blink ml-[0.06em] inline-block h-[0.9em] w-[0.07em] min-w-[2px] translate-y-[0.1em] rounded-full [background-color:color-mix(in_srgb,rgb(var(--neon))_45%,white)] shadow-[0_0_6px_rgb(var(--neon)),0_0_16px_rgb(var(--neon)/0.6)]"
          />
        )}
      </Tag>
    );
  },
);
Typewriter.displayName = "Typewriter";

export { Terminal, Typewriter };
