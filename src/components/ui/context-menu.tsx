"use client";

import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuAnchor,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  type DropdownMenuCheckboxItemProps,
  type DropdownMenuContentProps,
  type DropdownMenuItemProps,
  type DropdownMenuLabelProps,
  type DropdownMenuRadioGroupProps,
  type DropdownMenuRadioItemProps,
  type DropdownMenuSubContentProps,
  type DropdownMenuSubTriggerProps,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

type RenderProp = { asChild?: boolean; render?: React.ReactElement; nativeButton?: boolean; children?: React.ReactNode };

/**
 * Base UI spells asChild as `render={<Link />}` plus `nativeButton`, and the shadcn CLI rewrites
 * asChild into that form in base-* projects. Folds it back into asChild and children.
 */
function fromRenderProp<P extends RenderProp>({ render, nativeButton, ...props }: P): Omit<P, "render" | "nativeButton"> {
  void nativeButton; // Only meaningful to Base UI.
  if (!render) return props;
  const children = props.children === undefined ? render : React.cloneElement(render, undefined, props.children);
  return { ...props, asChild: true, children };
}

const LONG_PRESS = 500;
const MOVE_TOLERANCE = 10;
// The ContextMenu key, Shift+F10 and an Android long-press can each be followed by a native
// contextmenu event; ignore it for a moment after we've opened the menu ourselves.
const ECHO_WINDOW = 500;

interface ContextMenuContextValue {
  open: boolean;
  color?: NeonColor;
  openAt: (x: number, y: number) => void;
  /** Bumps on every open so a second right-click moves the menu instead of reviving the old one. */
  generation: number;
}

const ContextMenuContext = React.createContext<ContextMenuContextValue | null>(null);

function useContextMenu(component: string) {
  const context = React.useContext(ContextMenuContext);
  if (!context) throw new Error(`<${component}> must be rendered inside <ContextMenu>.`);
  return context;
}

export interface ContextMenuProps {
  onOpenChange?: (open: boolean) => void;
  /** Palette name or hex. When omitted the menu takes the trigger area's color, then `--neon-accent`. */
  color?: NeonColor;
  children?: React.ReactNode;
}

function ContextMenu({ onOpenChange, color, children }: ContextMenuProps) {
  const [open, setOpen] = React.useState(false);
  const [point, setPoint] = React.useState({ x: 0, y: 0 });
  const [generation, setGeneration] = React.useState(0);

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      setOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );

  const openAt = React.useCallback(
    (x: number, y: number) => {
      setPoint({ x, y });
      setGeneration((count) => count + 1);
      setOpen(true);
      if (!open) onOpenChange?.(true);
    },
    [open, onOpenChange],
  );

  const context = React.useMemo(() => ({ open, color, openAt, generation }), [open, color, openAt, generation]);

  return (
    <ContextMenuContext.Provider value={context}>
      <DropdownMenu open={open} onOpenChange={handleOpenChange} anchorPoint={point} color={color}>
        {children}
      </DropdownMenu>
    </ContextMenuContext.Provider>
  );
}
ContextMenu.displayName = "ContextMenu";

export interface ContextMenuTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Merge the right-click behaviour onto the single child element instead of rendering a div. */
  asChild?: boolean;
  /** Base UI-style asChild: `render={<Link href="/" />}`. */
  render?: React.ReactElement;
  /** Accepted for Base UI compatibility; no effect. */
  nativeButton?: boolean;
  /** Lets the browser's own context menu through. */
  disabled?: boolean;
}

const ContextMenuTrigger = React.forwardRef<HTMLDivElement, ContextMenuTriggerProps>(
  (raw, ref) => {
    const {
      asChild = false,
      disabled = false,
      className,
      style,
      onContextMenu,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onKeyDown,
      ...props
    } = fromRenderProp(raw);
    const { open, color, openAt } = useContextMenu("ContextMenuTrigger");
    const press = React.useRef<{ x: number; y: number; timer: number } | null>(null);
    const openedAt = React.useRef(-Infinity);

    const cancelPress = React.useCallback(() => {
      if (!press.current) return;
      window.clearTimeout(press.current.timer);
      press.current = null;
    }, []);

    React.useEffect(() => cancelPress, [cancelPress]);

    return (
      <DropdownMenuAnchor
        ref={ref}
        asChild={asChild}
        data-state={open ? "open" : "closed"}
        data-disabled={disabled ? "" : undefined}
        // Stop iOS from showing its own callout over the long-press.
        style={neonVars(color, disabled ? style : { WebkitTouchCallout: "none", ...style })}
        className={cn("[--neon:var(--neon-accent,34_211_238)]", className)}
        {...props}
        onContextMenu={(event) => {
          onContextMenu?.(event);
          cancelPress();
          if (event.defaultPrevented || disabled) return;
          event.preventDefault();
          if (performance.now() - openedAt.current < ECHO_WINDOW) return;
          openAt(event.clientX, event.clientY);
        }}
        onPointerDown={(event) => {
          onPointerDown?.(event);
          cancelPress();
          if (event.defaultPrevented || disabled || event.pointerType === "mouse") return;
          const { clientX: x, clientY: y } = event;
          press.current = {
            x,
            y,
            timer: window.setTimeout(() => {
              press.current = null;
              openedAt.current = performance.now();
              openAt(x, y);
            }, LONG_PRESS),
          };
        }}
        onPointerMove={(event) => {
          onPointerMove?.(event);
          const start = press.current;
          if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > MOVE_TOLERANCE) cancelPress();
        }}
        onPointerUp={(event) => {
          onPointerUp?.(event);
          cancelPress();
        }}
        onPointerCancel={(event) => {
          onPointerCancel?.(event);
          cancelPress();
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || disabled) return;
          if (event.key === "ContextMenu" || (event.key === "F10" && event.shiftKey)) {
            event.preventDefault();
            openedAt.current = performance.now();
            const rect = event.currentTarget.getBoundingClientRect();
            openAt(rect.left, rect.top);
          }
        }}
      />
    );
  },
);
ContextMenuTrigger.displayName = "ContextMenuTrigger";

export type ContextMenuContentProps = DropdownMenuContentProps;

const ContextMenuContent = React.forwardRef<HTMLDivElement, ContextMenuContentProps>(
  ({ side = "right", align = "start", sideOffset = 2, onContextMenu, ...props }, ref) => {
    const { generation } = useContextMenu("ContextMenuContent");
    return (
      <DropdownMenuContent
        key={generation}
        ref={ref}
        side={side}
        align={align}
        sideOffset={sideOffset}
        // A right-click inside the menu shouldn't stack the browser's menu on top of ours.
        onContextMenu={(event) => {
          onContextMenu?.(event);
          event.preventDefault();
        }}
        {...props}
      />
    );
  },
);
ContextMenuContent.displayName = "ContextMenuContent";

export type ContextMenuItemProps = DropdownMenuItemProps;
export type ContextMenuCheckboxItemProps = DropdownMenuCheckboxItemProps;
export type ContextMenuRadioGroupProps = DropdownMenuRadioGroupProps;
export type ContextMenuRadioItemProps = DropdownMenuRadioItemProps;
export type ContextMenuLabelProps = DropdownMenuLabelProps;
export type ContextMenuSubTriggerProps = DropdownMenuSubTriggerProps;
export type ContextMenuSubContentProps = DropdownMenuSubContentProps;

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  DropdownMenuItem as ContextMenuItem,
  DropdownMenuCheckboxItem as ContextMenuCheckboxItem,
  DropdownMenuRadioGroup as ContextMenuRadioGroup,
  DropdownMenuRadioItem as ContextMenuRadioItem,
  DropdownMenuLabel as ContextMenuLabel,
  DropdownMenuGroup as ContextMenuGroup,
  DropdownMenuSeparator as ContextMenuSeparator,
  DropdownMenuSub as ContextMenuSub,
  DropdownMenuSubTrigger as ContextMenuSubTrigger,
  DropdownMenuSubContent as ContextMenuSubContent,
};
