"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

type Orientation = "horizontal" | "vertical";
type Size = "sm" | "md" | "lg";

const GroupContext = React.createContext<{ orientation: Orientation } | null>(null);

/*
 * All of the attaching is CSS on direct children, so it works for any element (Button, a menu
 * trigger, Input, your own) and for children a Server Component passes as lazy references,
 * which can't be inspected or cloned.
 * - Neighbours overlap by a pixel, so each seam is one line, not two.
 * - Inner corners are squared. Input and Textarea draw their corners on an inner field box
 *   (the element carrying their `group/field` class), so that box is squared too.
 * - Whatever is hovered, open or focused is lifted above its neighbours, so its border and
 *   focus ring never sit under the next segment.
 */
const layout: Record<Orientation, string> = {
  horizontal: cn(
    "flex-row [&>*+*]:-ml-px",
    "[&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none",
    "[&>*:not(:first-child)>[class~='group/field']]:rounded-l-none [&>*:not(:last-child)>[class~='group/field']]:rounded-r-none",
  ),
  vertical: cn(
    "flex-col [&>*+*]:-mt-px",
    "[&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none",
    "[&>*:not(:first-child)>[class~='group/field']]:rounded-t-none [&>*:not(:last-child)>[class~='group/field']]:rounded-b-none",
  ),
};

const lift =
  "[&>*]:relative [&>*:hover]:z-10 [&>[data-state=open]]:z-10 [&>[aria-pressed=true]]:z-10 [&>*:focus-visible]:z-30 [&>*:focus-within]:z-30";

// A group of groups is a toolbar: the inner groups stay attached, the outer one spaces them out.
const toolbar = "has-[>[data-slot=button-group]]:gap-2 [&>[data-slot=button-group]]:m-0";

export interface ButtonGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  orientation?: Orientation;
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, style, color, orientation = "horizontal", children, ...props }, ref) => (
    <GroupContext.Provider value={{ orientation }}>
      <div
        ref={ref}
        role="group"
        data-slot="button-group"
        data-orientation={orientation}
        style={neonVars(color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "isolate flex w-fit items-stretch",
          layout[orientation],
          lift,
          toolbar,
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </GroupContext.Provider>
  ),
);
ButtonGroup.displayName = "ButtonGroup";

const textSizes = {
  sm: "h-8 rounded-md px-2.5 text-xs [&_svg]:size-3.5",
  md: "h-10 rounded-lg px-3 text-sm [&_svg]:size-4",
  lg: "h-12 rounded-xl px-4 text-base [&_svg]:size-[18px]",
} as const;

export interface ButtonGroupTextProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Height and padding, matching Button's sizes. */
  size?: Size;
}

/** A static segment: a prefix like "https://", a unit, or a counter between two buttons. */
const ButtonGroupText = React.forwardRef<HTMLDivElement, ButtonGroupTextProps>(
  ({ className, size = "md", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex shrink-0 select-none items-center gap-2 whitespace-nowrap border border-white/10 bg-white/[0.02] font-medium text-white/55",
          textSizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);
ButtonGroupText.displayName = "ButtonGroupText";

export interface ButtonGroupSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The rule's direction. Defaults to across the group: vertical in a row, horizontal in a column. */
  orientation?: Orientation;
}

/** A seam between two segments, for split buttons and solid groups where borders don't show. */
const ButtonGroupSeparator = React.forwardRef<HTMLDivElement, ButtonGroupSeparatorProps>(
  ({ className, orientation: orientationProp, ...props }, ref) => {
    const group = React.useContext(GroupContext);
    const orientation =
      orientationProp ?? ((group?.orientation ?? "horizontal") === "horizontal" ? "vertical" : "horizontal");
    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation={orientation}
        className={cn(
          // Sits on top of the shared seam and paints over both segments' edges there.
          "relative z-20 shrink-0 self-stretch bg-[#05060a]",
          "after:absolute after:inset-0 after:bg-[rgb(var(--neon)/0.3)] after:content-['']",
          orientation === "vertical" ? "w-px" : "h-px w-full",
          className,
        )}
        {...props}
      />
    );
  },
);
ButtonGroupSeparator.displayName = "ButtonGroupSeparator";

export { ButtonGroup, ButtonGroupText, ButtonGroupSeparator };
