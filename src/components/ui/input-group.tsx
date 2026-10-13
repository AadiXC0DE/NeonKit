"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Input, type InputProps } from "@/components/ui/input";
import { Textarea, type TextareaProps } from "@/components/ui/textarea";

type Size = "sm" | "md" | "lg";

const CONTROL = "[data-nk-input-group-control]";

const SizeContext = React.createContext<Size>("md");

const sizes = {
  sm: { box: "min-h-8 rounded-md text-xs", control: "[&>input]:px-2.5", inline: "px-2.5 [&_svg]:size-3.5" },
  md: { box: "min-h-10 rounded-lg text-sm", control: "[&>input]:px-3", inline: "px-3 [&_svg]:size-4" },
  lg: { box: "min-h-12 rounded-xl text-base", control: "[&>input]:px-4", inline: "px-4 [&_svg]:size-[18px]" },
} as const;

export interface InputGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  size?: Size;
}

/**
 * One field box around a control and its addons. The focus glow wraps the whole group, and
 * a click anywhere that isn't a button lands in the control.
 */
const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className, style, color, size = "md", onMouseDown, ...props }, ref) => (
    <SizeContext.Provider value={size}>
      <div
        ref={ref}
        role="group"
        data-size={size}
        style={neonVars(color, style)}
        onMouseDown={(event) => {
          onMouseDown?.(event);
          if (event.defaultPrevented) return;
          const target = event.target as HTMLElement;
          if (target.closest("button, a, input, textarea, select, [tabindex], [contenteditable]")) return;
          const control = event.currentTarget.querySelector<HTMLElement>(CONTROL);
          if (!control || control.matches(":disabled")) return;
          event.preventDefault();
          control.focus();
        }}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "group/input-group relative flex w-full min-w-0 cursor-text flex-wrap items-center border border-white/10 bg-white/[0.03] text-white/90",
          "transition-[border-color,background-color,box-shadow] ease-[cubic-bezier(0.23,1,0.32,1)] duration-[150ms,150ms,320ms]",
          "hover:[&:not(:focus-within)]:border-white/20",
          "focus-within:border-[rgb(var(--neon)/0.8)] focus-within:bg-[rgb(var(--neon)/0.04)] focus-within:shadow-[0_0_0_1px_rgb(var(--neon)/0.2),0_0_20px_-4px_rgb(var(--neon)/0.5),inset_0_0_12px_-2px_rgb(var(--neon)/0.14)]",
          // Invalid: the whole group turns red, and so does its glow when focused.
          "has-[[aria-invalid=true]]:border-[rgb(var(--neon)/0.55)] has-[[aria-invalid=true]]:[--neon:255_77_94]",
          "has-[[data-nk-input-group-control]:disabled]:cursor-not-allowed has-[[data-nk-input-group-control]:disabled]:opacity-50",
          // A textarea grows the box; block addons become rows above or below it.
          "has-[textarea]:items-stretch",
          sizes[size].box,
          className,
        )}
        {...props}
      />
    </SizeContext.Provider>
  ),
);
InputGroup.displayName = "InputGroup";

const align = {
  "inline-start": "order-first self-stretch",
  "inline-end": "order-last self-stretch",
  "block-start": "order-first w-full justify-start",
  "block-end": "order-last w-full justify-start",
} as const;

export interface InputGroupAddonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Before or after the control on its line, or a full-width row above or below it. */
  align?: keyof typeof align;
}

const InputGroupAddon = React.forwardRef<HTMLDivElement, InputGroupAddonProps>(
  ({ className, align: alignProp = "inline-start", ...props }, ref) => {
    const size = React.useContext(SizeContext);
    const inline = alignProp.startsWith("inline");
    return (
      <div
        ref={ref}
        data-align={alignProp}
        className={cn(
          "flex shrink-0 select-none items-center gap-2 text-white/50",
          "[&_svg]:shrink-0 [&_svg]:transition-[color,filter] [&_svg]:duration-200",
          "group-focus-within/input-group:[&>svg]:text-[rgb(var(--neon)/0.9)]",
          align[alignProp],
          inline ? sizes[size].inline : "px-3 py-2",
          // Buttons sit closer to the edge than icons, so their own padding does the spacing.
          alignProp === "inline-start" && "pr-0 has-[>button:first-child]:pl-1",
          alignProp === "inline-end" && "pl-0 has-[>button:last-child]:pr-1",
          alignProp === "block-start" && "border-b border-white/[0.06] group-has-[textarea]/input-group:border-b-0 group-has-[textarea]/input-group:pb-0",
          alignProp === "block-end" && "pt-0 group-has-[textarea]/input-group:pb-2",
          className,
        )}
        {...props}
      />
    );
  },
);
InputGroupAddon.displayName = "InputGroupAddon";

const InputGroupText = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      data-slot="input-group-text"
      className={cn("flex items-center gap-1.5 whitespace-nowrap text-white/50 [&_svg]:pointer-events-none", className)}
      {...props}
    />
  ),
);
InputGroupText.displayName = "InputGroupText";

// Strips the field box off Input and Textarea; the group draws it instead.
const unboxed = cn(
  "h-auto min-h-0 flex-1 self-stretch rounded-none border-0 bg-transparent shadow-none",
  "hover:[&:not(:focus-within)]:border-transparent focus-within:border-transparent focus-within:bg-transparent focus-within:shadow-none",
);

export type InputGroupInputProps = Omit<InputProps, "label" | "description" | "error" | "leading" | "trailing" | "size">;

/** NeonKit's Input without its own box. Pass aria-invalid to turn the group red. */
const InputGroupInput = React.forwardRef<HTMLInputElement, InputGroupInputProps>(
  ({ className, containerClassName, ...props }, ref) => {
    const size = React.useContext(SizeContext);
    return (
      <Input
        ref={ref}
        size={size}
        data-nk-input-group-control=""
        containerClassName={cn("w-auto min-w-0 flex-1 self-stretch [&>div]:h-full", containerClassName)}
        className={cn(
          unboxed,
          sizes[size].control,
          // Text starts just after a leading icon or prefix, and stops just before a trailing one.
          "group-has-[>[data-align=inline-start]]/input-group:[&>input]:pl-2",
          "group-has-[>[data-align=inline-end]]/input-group:[&>input]:pr-2",
          // A text prefix or suffix ("https://", "€") reads as part of the value, so it sits flush.
          "group-has-[>[data-align=inline-start]>[data-slot=input-group-text]:last-child]/input-group:[&>input]:pl-0.5",
          "group-has-[>[data-align=inline-end]>[data-slot=input-group-text]:first-child]/input-group:[&>input]:pr-1",
          className,
        )}
        {...(props as InputProps)}
      />
    );
  },
);
InputGroupInput.displayName = "InputGroupInput";

export type InputGroupTextareaProps = Omit<TextareaProps, "label" | "description" | "error" | "size">;

/** NeonKit's Textarea without its own box. Grows with its content by default. */
const InputGroupTextarea = React.forwardRef<HTMLTextAreaElement, InputGroupTextareaProps>(
  ({ className, containerClassName, minRows = 2, ...props }, ref) => {
    const size = React.useContext(SizeContext);
    return (
      <Textarea
        ref={ref}
        size={size}
        minRows={minRows}
        data-nk-input-group-control=""
        containerClassName={cn("w-full", containerClassName)}
        className={cn(unboxed, className)}
        {...props}
      />
    );
  },
);
InputGroupTextarea.displayName = "InputGroupTextarea";

const buttonSizes = {
  sm: "h-7 gap-1.5 rounded-md px-2.5 text-xs",
  icon: "size-7 rounded-md px-0 [&_svg]:size-3.5",
} as const;

export interface InputGroupButtonProps extends Omit<ButtonProps, "size"> {
  /** `sm` for a text button, `icon` for a square one; both fit inside a 40px field. */
  size?: keyof typeof buttonSizes;
}

const InputGroupButton = React.forwardRef<HTMLButtonElement, InputGroupButtonProps>(
  ({ className, size = "sm", variant = "ghost", type = "button", ...props }, ref) => (
    <Button
      ref={ref}
      type={type}
      variant={variant}
      size="sm"
      className={cn(
        buttonSizes[size],
        "focus-visible:ring-offset-0",
        variant === "ghost" && "text-white/55",
        className,
      )}
      {...props}
    />
  ),
);
InputGroupButton.displayName = "InputGroupButton";

export {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
  InputGroupButton,
};
