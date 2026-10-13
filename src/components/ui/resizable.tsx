"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

type Direction = "horizontal" | "vertical";

const EPSILON = 0.01;
const ANIMATION_MS = 240;
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

interface PanelConfig {
  minSize: number;
  maxSize: number;
  defaultSize?: number;
  collapsible: boolean;
  collapsedSize: number;
}

interface PanelCallbacks {
  onResize?: (size: number) => void;
  onCollapse?: () => void;
  onExpand?: () => void;
}

interface Structure {
  /** Panel ids in DOM order. */
  order: string[];
  /** Handle id → index of the panel before it. */
  handles: Record<string, number>;
}

interface GroupContextValue {
  groupId: string;
  direction: Direction;
  layout: number[] | null;
  structure: Structure;
  animating: boolean;
  register: (id: string, config: React.RefObject<PanelConfig & PanelCallbacks>) => () => void;
  registerHandle: () => () => void;
  startDrag: (handleId: string, event: React.PointerEvent<HTMLElement>) => void;
  resizeBy: (before: number, delta: number, animate?: boolean) => void;
  toggleCollapse: (before: number) => void;
  setPanelSize: (id: string, size: number) => void;
  getConfig: (index: number) => PanelConfig | undefined;
  draggingHandle: string | null;
  keyboardStep: number;
}

const GroupContext = React.createContext<GroupContextValue | null>(null);

function useGroup(component: string) {
  const context = React.useContext(GroupContext);
  if (!context) throw new Error(`<${component}> must be rendered inside <ResizablePanelGroup>.`);
  return context;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const isCollapsed = (config: PanelConfig, size: number) => config.collapsible && size <= config.collapsedSize + EPSILON;

/**
 * Moves the boundary after panel `before` by `delta` percent. The panel next to the
 * boundary grows; the other side shrinks, nearest panel first, so a panel at its minimum
 * passes the rest on. A collapsible panel snaps shut once pushed past half its minimum,
 * and a collapsed one only opens once pulled past half of it.
 */
function adjustLayout(start: number[], panels: PanelConfig[], before: number, delta: number): number[] {
  if (Math.abs(delta) < EPSILON || before < 0 || before >= start.length - 1) return start;
  const next = [...start];
  const grow = delta > 0 ? before : before + 1;
  const step = delta > 0 ? 1 : -1;
  const want = Math.abs(delta);

  const growing = panels[grow];
  const growFrom = start[grow];
  let target = growFrom + want;
  if (isCollapsed(growing, growFrom)) {
    if (want < (growing.minSize - growing.collapsedSize) / 2) return start;
    target = Math.max(target, growing.minSize);
  }
  target = Math.min(target, growing.maxSize);
  const need = target - growFrom;
  if (need <= EPSILON) return start;

  let taken = 0;
  for (let i = grow === before ? before + 1 : before; i >= 0 && i < start.length && need - taken > EPSILON; i += step) {
    const panel = panels[i];
    const size = start[i];
    if (isCollapsed(panel, size)) continue;
    let to = size - (need - taken);
    if (to < panel.minSize) {
      to = panel.collapsible && to < (panel.minSize + panel.collapsedSize) / 2 ? panel.collapsedSize : Math.min(size, panel.minSize);
    }
    next[i] = to;
    taken += size - to;
  }

  const grown = growFrom + taken;
  if (taken <= EPSILON || grown > growing.maxSize + EPSILON) return start;
  if (isCollapsed(growing, growFrom) && grown < growing.minSize - EPSILON) return start;
  next[grow] = grown;
  return next;
}

function initialLayout(configs: PanelConfig[]): number[] {
  const fixed = configs.reduce((sum, c) => sum + (c.defaultSize ?? 0), 0);
  const open = configs.filter((c) => c.defaultSize === undefined).length;
  const share = open ? Math.max(0, 100 - fixed) / open : 0;
  const sizes = configs.map((c) => clamp(c.defaultSize ?? share, c.collapsible ? c.collapsedSize : c.minSize, c.maxSize));
  const total = sizes.reduce((a, b) => a + b, 0) || 1;
  return sizes.map((size) => (size / total) * 100);
}

function readSaved(key: string, count: number): number[] | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length !== count || !parsed.every((n) => typeof n === "number" && n >= 0)) return null;
    const total = parsed.reduce((a: number, b: number) => a + b, 0);
    return Math.abs(total - 100) < 1 ? (parsed as number[]) : null;
  } catch {
    return null;
  }
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

export interface ResizablePanelGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "dir"> {
  /** Palette name or any hex color for the handles. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  direction?: Direction;
  /** Called with every panel's size, in percent, whenever the layout changes. */
  onLayout?: (sizes: number[]) => void;
  /** Saves the layout in localStorage under this key and restores it on the next visit. */
  autoSaveId?: string;
  /** Percent moved per arrow key press. Shift moves 1%. */
  keyboardStep?: number;
}

const ResizablePanelGroup = React.forwardRef<HTMLDivElement, ResizablePanelGroupProps>(
  (
    { className, style, color, direction = "horizontal", onLayout, autoSaveId, keyboardStep = 5, children, ...props },
    ref,
  ) => {
    const groupId = React.useId();
    const rootRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

    const panels = React.useRef(new Map<string, React.RefObject<PanelConfig & PanelCallbacks>>());
    const [version, setVersion] = React.useState(0);
    const [structure, setStructure] = React.useState<Structure>({ order: [], handles: {} });
    const [layout, setLayoutState] = React.useState<number[] | null>(null);
    const [draggingHandle, setDraggingHandle] = React.useState<string | null>(null);
    const [animating, setAnimating] = React.useState(false);
    const layoutRef = React.useRef<number[] | null>(null);
    const restore = React.useRef(new Map<string, number>());
    const animationTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const configs = React.useCallback(
      (order: string[]) => order.map((id) => panels.current.get(id)?.current as PanelConfig),
      [],
    );

    const commit = React.useCallback(
      (next: number[], from?: number[]) => {
        const previous = layoutRef.current;
        if (previous && next.every((size, i) => Math.abs(size - previous[i]) < EPSILON)) return;
        // Remember what a panel was before it collapsed, so expanding brings it back there.
        if (previous) {
          structure.order.forEach((id, i) => {
            const config = panels.current.get(id)?.current;
            if (config && isCollapsed(config, next[i]) && !isCollapsed(config, previous[i])) {
              restore.current.set(id, Math.max((from ?? previous)[i], config.minSize));
            }
          });
        }
        layoutRef.current = next;
        setLayoutState(next);
      },
      [structure.order],
    );

    // Panels and handles register on mount; read their order from the DOM so conditional
    // children land in the right place.
    useIsomorphicLayoutEffect(() => {
      const root = rootRef.current;
      if (!root) return;
      const order: string[] = [];
      const handles: Record<string, number> = {};
      for (const child of Array.from(root.children) as HTMLElement[]) {
        if (child.dataset.panelGroupId !== groupId) continue;
        if (child.dataset.panelId) order.push(child.dataset.panelId);
        else if (child.dataset.handleId) handles[child.dataset.handleId] = order.length - 1;
      }
      const sameOrder = order.join() === structure.order.join();
      if (!sameOrder || JSON.stringify(handles) !== JSON.stringify(structure.handles)) {
        setStructure({ order, handles });
      }
      if (sameOrder && layoutRef.current) return;
      const list = configs(order);
      if (list.some((c) => !c)) return;
      const saved = autoSaveId ? readSaved(`nk-resizable:${autoSaveId}`, order.length) : null;
      const next = saved ?? initialLayout(list);
      layoutRef.current = next;
      setLayoutState(next);
    }, [version, groupId, autoSaveId, configs, structure]);

    const onLayoutRef = React.useRef(onLayout);
    useIsomorphicLayoutEffect(() => {
      onLayoutRef.current = onLayout;
    });

    // Report the layout and per-panel changes.
    const reported = React.useRef<number[] | null>(null);
    React.useEffect(() => {
      if (!layout) return;
      const previous = reported.current;
      reported.current = layout;
      onLayoutRef.current?.(layout);
      structure.order.forEach((id, i) => {
        const panel = panels.current.get(id)?.current;
        if (!panel || (previous && Math.abs(previous[i] - layout[i]) < EPSILON)) return;
        panel.onResize?.(layout[i]);
        if (!previous) return;
        const was = isCollapsed(panel, previous[i]);
        const now = isCollapsed(panel, layout[i]);
        if (now && !was) panel.onCollapse?.();
        if (!now && was) panel.onExpand?.();
      });
    }, [layout, structure.order]);

    // Save once the pointer lets go, not on every frame of a drag.
    React.useEffect(() => {
      if (!autoSaveId || !layout || draggingHandle) return;
      try {
        window.localStorage.setItem(`nk-resizable:${autoSaveId}`, JSON.stringify(layout.map((n) => Math.round(n * 100) / 100)));
      } catch {
        // Storage can be full or blocked; the layout still works for this visit.
      }
    }, [autoSaveId, layout, draggingHandle]);

    React.useEffect(() => () => clearTimeout(animationTimer.current), []);

    const animate = React.useCallback(() => {
      if (prefersReducedMotion()) return;
      setAnimating(true);
      clearTimeout(animationTimer.current);
      animationTimer.current = setTimeout(() => setAnimating(false), ANIMATION_MS);
    }, []);

    const register = React.useCallback((id: string, config: React.RefObject<PanelConfig & PanelCallbacks>) => {
      panels.current.set(id, config);
      setVersion((v) => v + 1);
      return () => {
        panels.current.delete(id);
        setVersion((v) => v + 1);
      };
    }, []);

    const registerHandle = React.useCallback(() => {
      setVersion((v) => v + 1);
      return () => setVersion((v) => v + 1);
    }, []);

    const resizeBy = React.useCallback(
      (before: number, delta: number, withAnimation = false) => {
        const current = layoutRef.current;
        if (!current) return;
        const next = adjustLayout(current, configs(structure.order), before, delta);
        if (next === current) return;
        if (withAnimation) animate();
        commit(next, current);
      },
      [configs, structure.order, commit, animate],
    );

    const toggleCollapse = React.useCallback(
      (before: number) => {
        const current = layoutRef.current;
        if (!current) return;
        const list = configs(structure.order);
        // The pane before the handle is the primary one; fall back to the one after it.
        const index = list[before]?.collapsible ? before : list[before + 1]?.collapsible ? before + 1 : -1;
        if (index < 0) return;
        const config = list[index];
        const id = structure.order[index];
        const size = current[index];
        const target = isCollapsed(config, size)
          ? clamp(restore.current.get(id) ?? config.defaultSize ?? config.minSize, config.minSize, config.maxSize)
          : config.collapsedSize;
        const change = target - size;
        resizeBy(before, index === before ? change : -change, true);
      },
      [configs, structure.order, resizeBy],
    );

    const setPanelSize = React.useCallback(
      (id: string, size: number) => {
        const current = layoutRef.current;
        const index = structure.order.indexOf(id);
        if (!current || index < 0) return;
        const change = size - current[index];
        if (index < current.length - 1) resizeBy(index, change, true);
        else resizeBy(index - 1, -change, true);
      },
      [structure.order, resizeBy],
    );

    const startDrag = React.useCallback(
      (handleId: string, event: React.PointerEvent<HTMLElement>) => {
        const root = rootRef.current;
        const before = structure.handles[handleId];
        const start = layoutRef.current;
        if (!root || before === undefined || before < 0 || !start) return;
        const horizontal = direction === "horizontal";
        const rect = root.getBoundingClientRect();
        let handleSpace = 0;
        for (const child of Array.from(root.children) as HTMLElement[]) {
          if (child.dataset.panelGroupId === groupId && child.dataset.handleId) {
            const r = child.getBoundingClientRect();
            handleSpace += horizontal ? r.width : r.height;
          }
        }
        const total = (horizontal ? rect.width : rect.height) - handleSpace;
        if (total <= 0) return;

        const handle = event.currentTarget;
        const origin = horizontal ? event.clientX : event.clientY;
        const pointerId = event.pointerId;
        const list = configs(structure.order);
        handle.setPointerCapture?.(pointerId);
        setDraggingHandle(handleId);

        const body = document.body.style;
        const saved = { cursor: body.cursor, userSelect: body.userSelect };
        body.cursor = horizontal ? "col-resize" : "row-resize";
        body.userSelect = "none";

        const move = (e: PointerEvent) => {
          if (e.pointerId !== pointerId) return;
          const delta = (((horizontal ? e.clientX : e.clientY) - origin) / total) * 100;
          commit(adjustLayout(start, list, before, delta), start);
        };
        const end = (e: PointerEvent) => {
          if (e.pointerId !== pointerId) return;
          handle.removeEventListener("pointermove", move);
          handle.removeEventListener("pointerup", end);
          handle.removeEventListener("pointercancel", end);
          body.cursor = saved.cursor;
          body.userSelect = saved.userSelect;
          setDraggingHandle(null);
        };
        handle.addEventListener("pointermove", move);
        handle.addEventListener("pointerup", end);
        handle.addEventListener("pointercancel", end);
      },
      [structure.handles, structure.order, direction, groupId, configs, commit],
    );

    const getConfig = React.useCallback(
      (index: number) => panels.current.get(structure.order[index] ?? "")?.current ?? undefined,
      [structure.order],
    );

    const context = React.useMemo<GroupContextValue>(
      () => ({
        groupId,
        direction,
        layout,
        structure,
        animating,
        register,
        registerHandle,
        startDrag,
        resizeBy,
        toggleCollapse,
        setPanelSize,
        getConfig,
        draggingHandle,
        keyboardStep,
      }),
      [groupId, direction, layout, structure, animating, register, registerHandle, startDrag, resizeBy, toggleCollapse, setPanelSize, getConfig, draggingHandle, keyboardStep],
    );

    return (
      <GroupContext.Provider value={context}>
        <div
          ref={rootRef}
          data-panel-group=""
          data-direction={direction}
          style={neonVars(color, style)}
          className={cn(
            "[--neon:var(--neon-accent,34_211_238)]",
            "flex size-full overflow-hidden",
            direction === "vertical" && "flex-col",
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </GroupContext.Provider>
    );
  },
);
ResizablePanelGroup.displayName = "ResizablePanelGroup";

export interface ResizablePanelApi {
  collapse: () => void;
  expand: () => void;
  /** Sets the size in percent, taking the space from or giving it to the neighbour. */
  resize: (size: number) => void;
  getSize: () => number;
  isCollapsed: () => boolean;
}

export interface ResizablePanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Starting size in percent. Panels without one share what's left. */
  defaultSize?: number;
  /** Percent. */
  minSize?: number;
  /** Percent. */
  maxSize?: number;
  /** Lets the panel shut: drag it past half its minimum, double-click the handle or press Enter on it. */
  collapsible?: boolean;
  /** Percent left showing when collapsed, e.g. for an icon rail. */
  collapsedSize?: number;
  onResize?: (size: number) => void;
  onCollapse?: () => void;
  onExpand?: () => void;
  /** Imperative control: collapse, expand, resize. */
  apiRef?: React.Ref<ResizablePanelApi>;
}

const ResizablePanel = React.forwardRef<HTMLDivElement, ResizablePanelProps>(
  (
    {
      id: idProp,
      className,
      style,
      defaultSize,
      minSize = 0,
      maxSize = 100,
      collapsible = false,
      collapsedSize = 0,
      onResize,
      onCollapse,
      onExpand,
      apiRef,
      ...props
    },
    ref,
  ) => {
    const group = useGroup("ResizablePanel");
    const autoId = React.useId();
    const id = idProp ?? autoId;
    const config = React.useRef<PanelConfig & PanelCallbacks>({ minSize, maxSize, defaultSize, collapsible, collapsedSize });
    useIsomorphicLayoutEffect(() => {
      config.current = { minSize, maxSize, defaultSize, collapsible, collapsedSize, onResize, onCollapse, onExpand };
    });

    const { register } = group;
    useIsomorphicLayoutEffect(() => register(id, config), [register, id]);

    const index = group.structure.order.indexOf(id);
    const size = group.layout && index >= 0 ? group.layout[index] : defaultSize;
    const collapsed = size !== undefined && collapsible && size <= collapsedSize + EPSILON;

    const layoutRef = React.useRef({ size, setPanelSize: group.setPanelSize });
    useIsomorphicLayoutEffect(() => {
      layoutRef.current = { size, setPanelSize: group.setPanelSize };
    });

    React.useImperativeHandle(
      apiRef,
      () => ({
        collapse: () => {
          if (config.current.collapsible) layoutRef.current.setPanelSize(id, config.current.collapsedSize);
        },
        expand: () => {
          const c = config.current;
          const current = layoutRef.current.size ?? 0;
          if (c.collapsible && current <= c.collapsedSize + EPSILON) {
            layoutRef.current.setPanelSize(id, clamp(c.defaultSize ?? c.minSize, c.minSize, c.maxSize));
          }
        },
        resize: (next: number) => layoutRef.current.setPanelSize(id, next),
        getSize: () => layoutRef.current.size ?? 0,
        isCollapsed: () => {
          const c = config.current;
          return c.collapsible && (layoutRef.current.size ?? 0) <= c.collapsedSize + EPSILON;
        },
      }),
      [id],
    );

    return (
      <div
        ref={ref}
        id={id}
        data-panel-id={id}
        data-panel-group-id={group.groupId}
        data-state={collapsible ? (collapsed ? "collapsed" : "expanded") : undefined}
        style={{
          flexGrow: size ?? 1,
          flexShrink: 1,
          flexBasis: 0,
          transition: group.animating ? `flex ${ANIMATION_MS - 20}ms cubic-bezier(0.23, 1, 0.32, 1)` : undefined,
          ...style,
        }}
        className={cn("relative min-h-0 min-w-0 overflow-hidden", className)}
        {...props}
      />
    );
  },
);
ResizablePanel.displayName = "ResizablePanel";

export interface ResizableHandleProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Shows the grip. Without it the handle is a bare hairline that lights up. */
  withHandle?: boolean;
  disabled?: boolean;
}

const ResizableHandle = React.forwardRef<HTMLDivElement, ResizableHandleProps>(
  (
    { className, withHandle = true, disabled = false, onPointerDown, onKeyDown, onDoubleClick, "aria-label": ariaLabel, ...props },
    ref,
  ) => {
    const group = useGroup("ResizableHandle");
    const handleId = React.useId();
    const { registerHandle } = group;
    useIsomorphicLayoutEffect(() => registerHandle(), [registerHandle]);

    const horizontal = group.direction === "horizontal";
    const before = group.structure.handles[handleId] ?? -1;
    const config = group.getConfig(before);
    const size = group.layout?.[before];
    const dragging = group.draggingHandle === handleId;
    // A neighbour collapsed to nothing puts the handle on the group's edge; keep the grip inside it.
    const after = group.layout?.[before + 1];
    const edge = size !== undefined && size < 0.5 ? "start" : after !== undefined && after < 0.5 ? "end" : null;
    const panelId = group.structure.order[before];

    function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
      onKeyDown?.(event);
      if (event.defaultPrevented || disabled || before < 0 || size === undefined || !config) return;
      const step = event.shiftKey ? 1 : group.keyboardStep;
      const back = horizontal ? "ArrowLeft" : "ArrowUp";
      const forward = horizontal ? "ArrowRight" : "ArrowDown";
      let delta: number | null = null;
      if (event.key === back) delta = -step;
      else if (event.key === forward) delta = step;
      else if (event.key === "Home") delta = (config.collapsible ? config.collapsedSize : config.minSize) - size;
      else if (event.key === "End") delta = config.maxSize - size;
      else if (event.key === "Enter") {
        event.preventDefault();
        group.toggleCollapse(before);
        return;
      }
      if (delta === null) return;
      event.preventDefault();
      // Arrows step over the snap zone: from the minimum, one more step back collapses.
      if (config.collapsible && delta < 0 && size - config.minSize < EPSILON && !(event.key === "Home")) {
        delta = config.collapsedSize - size;
      }
      group.resizeBy(before, delta, event.key === "Home" || event.key === "End");
    }

    return (
      <div
        ref={ref}
        role="separator"
        tabIndex={disabled ? undefined : 0}
        aria-orientation={horizontal ? "vertical" : "horizontal"}
        aria-label={ariaLabel ?? "Resize"}
        aria-controls={panelId}
        aria-valuenow={size === undefined ? undefined : Math.round(size)}
        aria-valuemin={config ? Math.round(config.collapsible ? config.collapsedSize : config.minSize) : undefined}
        aria-valuemax={config ? Math.round(config.maxSize) : undefined}
        aria-disabled={disabled || undefined}
        data-handle-id={handleId}
        data-panel-group-id={group.groupId}
        data-dragging={dragging ? "" : undefined}
        onPointerDown={(event) => {
          onPointerDown?.(event);
          if (event.defaultPrevented || disabled || event.button !== 0) return;
          event.preventDefault();
          event.currentTarget.focus({ preventScroll: true });
          group.startDrag(handleId, event);
        }}
        onDoubleClick={(event) => {
          onDoubleClick?.(event);
          if (event.defaultPrevented || disabled || before < 0) return;
          group.toggleCollapse(before);
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          "group/handle relative z-10 flex shrink-0 touch-none select-none items-center justify-center bg-white/10 outline-none",
          // An invisible strip either side makes the 1px line easy to grab.
          "before:absolute before:content-['']",
          horizontal
            ? "w-px cursor-col-resize before:inset-y-0 before:-left-[5px] before:-right-[5px]"
            : "h-px cursor-row-resize before:inset-x-0 before:-top-[5px] before:-bottom-[5px]",
          disabled && "pointer-events-none",
          className,
        )}
        {...props}
      >
        {/* The line lights from the grip outwards while the handle is in use. */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute opacity-0 transition-opacity duration-200 ease-out",
            "group-hover/handle:opacity-60 group-focus-visible/handle:opacity-100 group-data-[dragging]/handle:opacity-100",
            horizontal
              ? "inset-y-0 left-0 w-px bg-[linear-gradient(to_bottom,transparent,rgb(var(--neon)/0.7)_35%,rgb(var(--neon)/0.7)_65%,transparent)]"
              : "inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,rgb(var(--neon)/0.7)_35%,rgb(var(--neon)/0.7)_65%,transparent)]",
          )}
        />
        {withHandle && (
          <span
            aria-hidden
            className={cn(
              "relative shrink-0 rounded-full border border-white/20 bg-[#0c0e15]",
              "transition-[background-color,border-color,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
              horizontal ? "h-8 w-[7px]" : "h-[7px] w-8",
              edge === "start" && (horizontal ? "translate-x-[4px]" : "translate-y-[4px]"),
              edge === "end" && (horizontal ? "-translate-x-[4px]" : "-translate-y-[4px]"),
              "group-hover/handle:border-[rgb(var(--neon)/0.7)] group-hover/handle:bg-[rgb(var(--neon)/0.35)] group-hover/handle:shadow-[0_0_10px_rgb(var(--neon)/0.35)]",
              "group-focus-visible/handle:border-[rgb(var(--neon))] group-focus-visible/handle:bg-[rgb(var(--neon))] group-focus-visible/handle:shadow-[0_0_2px_rgb(var(--neon)),0_0_10px_rgb(var(--neon)/0.8),0_0_24px_rgb(var(--neon)/0.45)]",
              "group-data-[dragging]/handle:border-[rgb(var(--neon))] group-data-[dragging]/handle:bg-[rgb(var(--neon))] group-data-[dragging]/handle:shadow-[0_0_2px_rgb(var(--neon)),0_0_10px_rgb(var(--neon)/0.8),0_0_24px_rgb(var(--neon)/0.45)]",
            )}
          />
        )}
      </div>
    );
  },
);
ResizableHandle.displayName = "ResizableHandle";

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
