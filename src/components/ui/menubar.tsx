"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";
import {
  DropdownMenu,
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
  DropdownMenuTrigger,
  type DropdownMenuContentProps,
  type DropdownMenuTriggerProps,
} from "@/components/ui/dropdown-menu";

const EASE = [0.23, 1, 0.32, 1] as const;
const TRIGGER = "[data-nk-menubar-trigger]:not([disabled])";
const ITEM = '[role="menuitem"],[role="menuitemcheckbox"],[role="menuitemradio"]';

type Intent = "first" | "last" | "menu";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

interface MenubarContextValue {
  /** The open menu, or null when the bar is at rest. */
  value: string | null;
  openMenu: (key: string, intent?: Intent) => void;
  /** Where focus should land when the next menu opens; kept until the one after. */
  setIntent: (intent: Intent) => void;
  closeMenu: (key: string) => void;
  /** Which trigger is the bar's single Tab stop. */
  tabStop: string | null;
  setTabStop: (key: string) => void;
  readIntent: () => Intent;
  barRef: React.RefObject<HTMLDivElement | null>;
  barId: string;
  loop: boolean;
}

const MenubarContext = React.createContext<MenubarContextValue | null>(null);

function useMenubar(component: string) {
  const context = React.useContext(MenubarContext);
  if (!context) throw new Error(`<${component}> must be rendered inside <Menubar>.`);
  return context;
}

interface MenuContextValue {
  key: string;
  open: boolean;
  triggerRef: React.MutableRefObject<HTMLButtonElement | null>;
}

const MenuContext = React.createContext<MenuContextValue | null>(null);

function useMenubarMenu(component: string) {
  const context = React.useContext(MenuContext);
  if (!context) throw new Error(`<${component}> must be rendered inside <MenubarMenu>.`);
  return context;
}

function triggersOf(bar: HTMLElement | null) {
  return bar ? Array.from(bar.querySelectorAll<HTMLButtonElement>(TRIGGER)) : [];
}

export interface MenubarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "defaultValue"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** The open menu's value. Controlled; null when every menu is closed. */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  /** Left and Right wrap from the last menu to the first and back. */
  loop?: boolean;
}

const Menubar = React.forwardRef<HTMLDivElement, MenubarProps>(
  (
    { className, style, color, value: valueProp, defaultValue = null, onValueChange, loop = true, children, ...props },
    forwardedRef,
  ) => {
    const [uncontrolled, setUncontrolled] = React.useState<string | null>(defaultValue);
    const isControlled = valueProp !== undefined;
    const value = isControlled ? valueProp : uncontrolled;
    const [tabStop, setTabStop] = React.useState<string | null>(null);
    const intent = React.useRef<Intent>("menu");
    const barRef = React.useRef<HTMLDivElement | null>(null);
    const barId = React.useId();

    // Closing one menu and opening another can land in the same event (a click on the next
    // title closes the current menu as an outside click), so track the latest value here.
    const latest = React.useRef(value);
    useIsomorphicLayoutEffect(() => {
      latest.current = value;
    }, [value]);

    const commit = React.useCallback(
      (next: string | null) => {
        if (next === latest.current) return;
        latest.current = next;
        if (!isControlled) setUncontrolled(next);
        onValueChange?.(next);
      },
      [isControlled, onValueChange],
    );

    const context = React.useMemo<MenubarContextValue>(
      () => ({
        value,
        openMenu: (key, nextIntent) => {
          if (nextIntent) intent.current = nextIntent;
          commit(key);
        },
        setIntent: (next) => {
          intent.current = next;
        },
        closeMenu: (key) => {
          if (latest.current !== key) return;
          intent.current = "menu";
          commit(null);
        },
        tabStop,
        setTabStop,
        // Read, not consumed: dev StrictMode runs the focus effect twice and both runs must agree.
        readIntent: () => intent.current,
        barRef,
        barId,
        loop,
      }),
      [value, commit, tabStop, barId, loop],
    );

    // Until a trigger has been focused, the first one is the Tab stop.
    React.useEffect(() => {
      if (tabStop !== null) return;
      const first = triggersOf(barRef.current)[0];
      if (first?.dataset.nkMenubarTrigger) setTabStop(first.dataset.nkMenubarTrigger);
    }, [tabStop]);

    return (
      <MenubarContext.Provider value={context}>
        <div
          ref={(node) => {
            barRef.current = node;
            if (typeof forwardedRef === "function") forwardedRef(node);
            else if (forwardedRef) forwardedRef.current = node;
          }}
          role="menubar"
          aria-orientation="horizontal"
          style={neonVars(color, style)}
          className={cn(
            "[--neon:var(--neon-accent,34_211_238)]",
            "flex h-10 w-fit max-w-full items-center gap-0.5 overflow-x-auto rounded-xl border border-white/[0.08] bg-[#0a0b11] p-1 text-white/90",
            "shadow-[inset_0_1px_0_rgb(255_255_255/0.03)] [scrollbar-width:none]",
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </MenubarContext.Provider>
    );
  },
);
Menubar.displayName = "Menubar";

export interface MenubarMenuProps {
  /** Identifies the menu in Menubar's value. Generated when omitted. */
  value?: string;
  children?: React.ReactNode;
}

function MenubarMenu({ value: valueProp, children }: MenubarMenuProps) {
  const bar = useMenubar("MenubarMenu");
  const autoKey = React.useId();
  const key = valueProp ?? autoKey;
  const open = bar.value === key;
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const { readIntent } = bar;

  // DropdownMenu focuses its panel when it opens. Arrowing over from the next menu should land
  // on an item instead, as in a desktop menubar, so move focus once the panel is there.
  React.useEffect(() => {
    if (!open) return;
    const intent = readIntent();
    if (intent === "menu") return;
    // A frame later, so this lands after the menu's own focus handling, whatever order effects run in.
    const frame = window.requestAnimationFrame(() => {
      const panelId = triggerRef.current?.getAttribute("aria-controls");
      const panel = panelId ? document.getElementById(panelId) : null;
      if (!panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(ITEM)).filter(
        (item) => item.getAttribute("aria-disabled") !== "true",
      );
      const target = intent === "first" ? items[0] : items[items.length - 1];
      target?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open, readIntent]);

  const menu = React.useMemo(() => ({ key, open, triggerRef }), [key, open]);

  return (
    <MenuContext.Provider value={menu}>
      <DropdownMenu
        open={open}
        onOpenChange={(next) => (next ? bar.openMenu(key) : bar.closeMenu(key))}
      >
        {children}
      </DropdownMenu>
    </MenuContext.Provider>
  );
}
MenubarMenu.displayName = "MenubarMenu";

export type MenubarTriggerProps = Omit<DropdownMenuTriggerProps, "asChild" | "render" | "nativeButton">;

const MenubarTrigger = React.forwardRef<HTMLButtonElement, MenubarTriggerProps>(
  ({ className, children, disabled, onKeyDown, onFocus, onPointerEnter, onPointerDown, ...props }, forwardedRef) => {
    const bar = useMenubar("MenubarTrigger");
    const menu = useMenubarMenu("MenubarTrigger");
    const reduceMotion = useReducedMotion();
    const tabbable = bar.tabStop === null || bar.tabStop === menu.key;
    const { triggerRef } = menu;
    const ref = React.useCallback(
      (node: HTMLButtonElement | null) => {
        triggerRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      [triggerRef, forwardedRef],
    );

    function move(event: React.KeyboardEvent<HTMLButtonElement>, to: "next" | "prev" | "first" | "last") {
      const triggers = triggersOf(bar.barRef.current);
      const index = triggers.indexOf(event.currentTarget);
      const last = triggers.length - 1;
      const next =
        to === "first"
          ? 0
          : to === "last"
            ? last
            : to === "next"
              ? index === last
                ? bar.loop
                  ? 0
                  : last
                : index + 1
              : index === 0
                ? bar.loop
                  ? last
                  : 0
                : index - 1;
      event.preventDefault();
      triggers[next]?.focus();
    }

    return (
      <DropdownMenuTrigger
        ref={ref}
        role="menuitem"
        disabled={disabled}
        tabIndex={tabbable ? 0 : -1}
        data-nk-menubar-trigger={menu.key}
        onFocus={(event) => {
          onFocus?.(event);
          bar.setTabStop(menu.key);
        }}
        onPointerEnter={(event) => {
          onPointerEnter?.(event);
          // Once any menu is open, the others open on hover, so you can scan them in one sweep.
          if (event.pointerType !== "mouse" || disabled) return;
          if (bar.value !== null && bar.value !== menu.key) bar.openMenu(menu.key, "menu");
        }}
        onPointerDown={(event) => {
          onPointerDown?.(event);
          bar.setIntent("menu");
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          // DropdownMenu opens on these keys right after this handler; tell the bar where focus goes.
          if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") bar.setIntent("first");
          else if (event.key === "ArrowUp") bar.setIntent("last");
          if (event.key === "ArrowRight") move(event, "next");
          else if (event.key === "ArrowLeft") move(event, "prev");
          else if (event.key === "Home") move(event, "first");
          else if (event.key === "End") move(event, "last");
        }}
        className={cn(
          "relative flex h-8 shrink-0 items-center rounded-lg px-3 text-sm font-medium text-white/65 outline-none",
          "transition-[background-color,color] duration-150 ease-out hover:bg-white/[0.05] hover:text-white/90",
          "focus-visible:ring-offset-0 data-[state=open]:bg-white/[0.06] data-[state=open]:text-white",
          className,
        )}
        {...props}
      >
        {menu.open && (
          <motion.span
            aria-hidden
            layoutId={reduceMotion ? undefined : `${bar.barId}-filament`}
            transition={{ duration: 0.22, ease: EASE }}
            className="pointer-events-none absolute inset-x-2.5 bottom-[3px] h-px rounded-full bg-[rgb(var(--neon))] shadow-[0_0_4px_rgb(var(--neon)),0_0_12px_rgb(var(--neon)/0.6)]"
          />
        )}
        <span className="relative">{children}</span>
      </DropdownMenuTrigger>
    );
  },
);
MenubarTrigger.displayName = "MenubarTrigger";

export type MenubarContentProps = DropdownMenuContentProps;

const MenubarContent = React.forwardRef<HTMLDivElement, MenubarContentProps>(
  ({ onKeyDown, sideOffset = 8, alignOffset = -4, className, ...props }, ref) => {
    const bar = useMenubar("MenubarContent");
    const menu = useMenubarMenu("MenubarContent");

    return (
      <DropdownMenuContent
        ref={ref}
        side="bottom"
        align="start"
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className={cn("min-w-[14rem]", className)}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          // Submenu triggers claim ArrowRight and submenus claim ArrowLeft; the rest moves across the bar.
          if (event.defaultPrevented) return;
          if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
          const triggers = triggersOf(bar.barRef.current);
          const index = triggers.findIndex((trigger) => trigger.dataset.nkMenubarTrigger === menu.key);
          if (index < 0) return;
          const last = triggers.length - 1;
          let next = event.key === "ArrowRight" ? index + 1 : index - 1;
          if (next > last) next = bar.loop ? 0 : last;
          if (next < 0) next = bar.loop ? last : 0;
          const key = triggers[next]?.dataset.nkMenubarTrigger;
          if (!key || key === menu.key) return;
          event.preventDefault();
          bar.setTabStop(key);
          bar.openMenu(key, "first");
        }}
        {...props}
      />
    );
  },
);
MenubarContent.displayName = "MenubarContent";

const MenubarItem = DropdownMenuItem;
const MenubarCheckboxItem = DropdownMenuCheckboxItem;
const MenubarRadioGroup = DropdownMenuRadioGroup;
const MenubarRadioItem = DropdownMenuRadioItem;
const MenubarLabel = DropdownMenuLabel;
const MenubarGroup = DropdownMenuGroup;
const MenubarSeparator = DropdownMenuSeparator;
const MenubarSub = DropdownMenuSub;
const MenubarSubTrigger = DropdownMenuSubTrigger;
const MenubarSubContent = DropdownMenuSubContent;

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarLabel,
  MenubarGroup,
  MenubarSeparator,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
};
