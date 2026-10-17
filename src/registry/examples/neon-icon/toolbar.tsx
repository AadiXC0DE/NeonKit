"use client";

import * as React from "react";
import { NeonIcon } from "@/components/ui/neon-icon";
import { AlignCenter, AlignLeft, AlignRight, Bold, Code, Italic, Strikethrough, Underline, type Icon } from "@/components/ui/icons";

type Mark = "bold" | "italic" | "underline" | "strike" | "code";
type Align = "left" | "center" | "right";

const marks: { id: Mark; icon: Icon; label: string }[] = [
  { id: "bold", icon: Bold, label: "Bold" },
  { id: "italic", icon: Italic, label: "Italic" },
  { id: "underline", icon: Underline, label: "Underline" },
  { id: "strike", icon: Strikethrough, label: "Strikethrough" },
  { id: "code", icon: Code, label: "Code" },
];

const aligns: { id: Align; icon: Icon; label: string }[] = [
  { id: "left", icon: AlignLeft, label: "Align left" },
  { id: "center", icon: AlignCenter, label: "Align center" },
  { id: "right", icon: AlignRight, label: "Align right" },
];

const key =
  "grid size-8 cursor-pointer place-items-center sm:size-9 rounded-lg outline-none transition-colors duration-150 hover:bg-white/[0.05] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon-accent,34_211_238)/0.6)] active:scale-[0.97]";

export default function NeonIconToolbar() {
  const [active, setActive] = React.useState<Set<Mark>>(() => new Set(["bold"]));
  const [align, setAlign] = React.useState<Align>("left");
  const [focused, setFocused] = React.useState(0);

  // Arrow keys move along the toolbar, as in the WAI-ARIA toolbar pattern.
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const buttons = [...event.currentTarget.querySelectorAll("button")];
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const next =
      event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;
    buttons[next]?.focus();
    event.preventDefault();
  };

  const toggle = (mark: Mark) =>
    setActive((current) => {
      const next = new Set(current);
      if (next.has(mark)) next.delete(mark);
      else next.add(mark);
      return next;
    });

  return (
    <div className="w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-[#0a0b11]">
      <div
        role="toolbar"
        aria-label="Formatting"
        onKeyDown={onKeyDown}
        className="flex flex-wrap items-center gap-0.5 border-b border-white/[0.07] px-2 py-1.5"
      >
        {marks.map((mark, i) => (
          <button
            key={mark.id}
            type="button"
            aria-label={mark.label}
            aria-pressed={active.has(mark.id)}
            tabIndex={focused === i ? 0 : -1}
            onFocus={() => setFocused(i)}
            onClick={() => toggle(mark.id)}
            className={key}
          >
            <NeonIcon icon={mark.icon} value={active.has(mark.id) ? 1 : 0} size={18} aria-hidden />
          </button>
        ))}
        <span aria-hidden className="mx-1.5 h-5 w-px bg-white/10" />
        {aligns.map((option, i) => (
          <button
            key={option.id}
            type="button"
            aria-label={option.label}
            aria-pressed={align === option.id}
            tabIndex={focused === marks.length + i ? 0 : -1}
            onFocus={() => setFocused(marks.length + i)}
            onClick={() => setAlign(option.id)}
            className={key}
          >
            <NeonIcon icon={option.icon} value={align === option.id ? 1 : 0} size={18} aria-hidden />
          </button>
        ))}
      </div>
      <p
        className="px-4 py-4 text-[14.5px] leading-relaxed text-white/80"
        style={{ textAlign: align }}
      >
        <span
          className={[
            active.has("bold") && "font-semibold text-white/95",
            active.has("italic") && "italic",
            active.has("underline") && "underline decoration-white/40 underline-offset-4",
            active.has("strike") && "line-through decoration-white/50",
            active.has("code") && "rounded-md bg-white/[0.06] px-1 font-mono text-[13px]",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          Webhooks now retry for 72 hours.
        </span>{" "}
        Failed deliveries back off from 30 seconds to 6 hours and show up under Settings, Events.
      </p>
    </div>
  );
}
