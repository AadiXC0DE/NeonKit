"use client";

import * as React from "react";
import { ChevronRight, File, Folder, FolderOpen, LoaderCircle } from "@/components/ui/icons";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

const TYPEAHEAD_RESET = 500;
const ROW_INSET = 6;
const CHEVRON = 16;
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export interface TreeNode {
  id: string;
  label: React.ReactNode;
  /** Used by typeahead, and as the name when `label` isn't plain text. */
  textValue?: string;
  /** Replaces the folder or file icon. */
  icon?: React.ReactNode;
  children?: TreeNode[];
  /** A branch whose children come from `loadChildren` the first time it opens. */
  isBranch?: boolean;
  disabled?: boolean;
  /** Small trailing content: a count, a status dot. */
  meta?: React.ReactNode;
}

type SelectionMode = "single" | "multiple" | "none";

interface Row {
  node: TreeNode;
  level: number;
  parentId: string | null;
  posinset: number;
  setsize: number;
  branch: boolean;
}

function without<T>(record: Record<string, T>, key: string) {
  const next = { ...record };
  delete next[key];
  return next;
}

const isBranch = (node: TreeNode) => node.children !== undefined || node.isBranch === true;
const textOf = (node: TreeNode) =>
  (node.textValue ?? (typeof node.label === "string" || typeof node.label === "number" ? String(node.label) : "")).toLowerCase();

function useControllableSet(
  value: string[] | undefined,
  defaultValue: string[] | undefined,
  onChange: ((value: string[]) => void) | undefined,
) {
  const [uncontrolled, setUncontrolled] = React.useState<string[]>(defaultValue ?? []);
  const current = value ?? uncontrolled;
  const set = React.useMemo(() => new Set(current), [current]);
  const update = React.useCallback(
    (next: string[]) => {
      if (value === undefined) setUncontrolled(next);
      onChange?.(next);
    },
    [value, onChange],
  );
  return [set, update] as const;
}

export interface TreeViewProps
  extends Omit<React.HTMLAttributes<HTMLUListElement>, "color" | "defaultValue" | "onSelect"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  data: TreeNode[];
  selectionMode?: SelectionMode;
  /** Selected ids when controlled. */
  selected?: string[];
  defaultSelected?: string[];
  onSelectedChange?: (ids: string[]) => void;
  /** Open branch ids when controlled. */
  expanded?: string[];
  defaultExpanded?: string[];
  onExpandedChange?: (ids: string[]) => void;
  /** Fetches a branch's children the first time it opens. Rejecting shows an error row; reopening retries. */
  loadChildren?: (node: TreeNode) => Promise<TreeNode[]>;
  /** A leaf was clicked, or Enter was pressed on it. */
  onAction?: (node: TreeNode) => void;
  showIcons?: boolean;
  /** Pixels per level. */
  indent?: number;
}

const TreeView = React.forwardRef<HTMLUListElement, TreeViewProps>(
  (
    {
      className,
      style,
      color,
      data,
      selectionMode = "single",
      selected: selectedProp,
      defaultSelected,
      onSelectedChange,
      expanded: expandedProp,
      defaultExpanded,
      onExpandedChange,
      loadChildren,
      onAction,
      showIcons = true,
      indent = 16,
      onKeyDown,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const treeId = React.useId();
    const domId = React.useCallback((id: string) => `${treeId}-${id}`, [treeId]);
    const [selected, setSelected] = useControllableSet(selectedProp, defaultSelected, onSelectedChange);
    const [expanded, setExpanded] = useControllableSet(expandedProp, defaultExpanded, onExpandedChange);
    const [loaded, setLoaded] = React.useState<Record<string, TreeNode[]>>({});
    const [loading, setLoading] = React.useState<Record<string, true>>({});
    const [failed, setFailed] = React.useState<Record<string, true>>({});
    const [opened, setOpened] = React.useState<Record<string, true>>({});
    const [focusedId, setFocusedId] = React.useState<string | null>(null);
    const [hasFocus, setHasFocus] = React.useState(false);
    const anchor = React.useRef<string | null>(null);
    const pendingFocus = React.useRef<string | null>(null);
    const typeahead = React.useRef({ text: "", timer: undefined as ReturnType<typeof setTimeout> | undefined });

    const childrenOf = React.useCallback(
      (node: TreeNode) => node.children ?? loaded[node.id],
      [loaded],
    );

    // Every known node's parent, including ones inside closed branches.
    const parents = React.useMemo(() => {
      const map = new Map<string, string | null>();
      const walk = (nodes: TreeNode[], parent: string | null) => {
        for (const node of nodes) {
          map.set(node.id, parent);
          const kids = childrenOf(node);
          if (kids) walk(kids, node.id);
        }
      };
      walk(data, null);
      return map;
    }, [data, childrenOf]);

    const rows = React.useMemo(() => {
      const list: Row[] = [];
      const walk = (nodes: TreeNode[], level: number, parentId: string | null) => {
        nodes.forEach((node, i) => {
          const branch = isBranch(node);
          list.push({ node, level, parentId, posinset: i + 1, setsize: nodes.length, branch });
          const kids = childrenOf(node);
          if (branch && expanded.has(node.id) && kids) walk(kids, level + 1, node.id);
        });
      };
      walk(data, 1, null);
      return list;
    }, [data, expanded, childrenOf]);

    const visibleIndex = React.useMemo(() => new Map(rows.map((row, i) => [row.node.id, i])), [rows]);

    // The tab stop: the focused node, or its nearest visible ancestor once a branch above it closes.
    const tabbableId = React.useMemo(() => {
      let id: string | null | undefined = focusedId;
      while (id && !visibleIndex.has(id)) id = parents.get(id);
      if (id) return id;
      const firstSelected = rows.find((row) => selected.has(row.node.id) && !row.node.disabled);
      return (firstSelected ?? rows.find((row) => !row.node.disabled))?.node.id ?? null;
    }, [focusedId, visibleIndex, parents, rows, selected]);

    useIsomorphicLayoutEffect(() => {
      const id = pendingFocus.current;
      if (!id) return;
      const element = document.getElementById(domId(id));
      if (element) {
        pendingFocus.current = null;
        element.focus({ preventScroll: true });
        element.querySelector("[data-tree-row]")?.scrollIntoView?.({ block: "nearest" });
      }
    });

    React.useEffect(() => () => clearTimeout(typeahead.current.timer), []);

    const focusNode = (id: string) => {
      setFocusedId(id);
      pendingFocus.current = id;
      const element = document.getElementById(domId(id));
      if (element) {
        pendingFocus.current = null;
        element.focus({ preventScroll: true });
        element.querySelector("[data-tree-row]")?.scrollIntoView?.({ block: "nearest" });
      }
    };

    const load = (node: TreeNode) => {
      if (!loadChildren || node.children || loaded[node.id] || loading[node.id]) return;
      setLoading((current) => ({ ...current, [node.id]: true }));
      setFailed((current) => without(current, node.id));
      loadChildren(node).then(
        (kids) => {
          setLoaded((current) => ({ ...current, [node.id]: kids }));
          setLoading((current) => without(current, node.id));
        },
        () => {
          setFailed((current) => ({ ...current, [node.id]: true }));
          setLoading((current) => without(current, node.id));
        },
      );
    };

    const setOpen = (nodes: TreeNode[], open: boolean) => {
      const next = new Set(expanded);
      let changed = false;
      for (const node of nodes) {
        if (!isBranch(node) || next.has(node.id) === open) continue;
        changed = true;
        if (open) {
          next.add(node.id);
          load(node);
        } else next.delete(node.id);
      }
      if (!changed) return;
      if (open) setOpened((current) => ({ ...current, ...Object.fromEntries(nodes.map((n) => [n.id, true])) }));
      setExpanded(Array.from(next));
    };

    const toggle = (node: TreeNode) => setOpen([node], !expanded.has(node.id));

    const select = (id: string, mode: "replace" | "toggle" | "add" | "range") => {
      if (selectionMode === "none") return;
      if (selectionMode === "single") {
        if (!selected.has(id) || selected.size !== 1) setSelected([id]);
        anchor.current = id;
        return;
      }
      if (mode === "range" && anchor.current && visibleIndex.has(anchor.current)) {
        const a = visibleIndex.get(anchor.current)!;
        const b = visibleIndex.get(id)!;
        const ids = rows.slice(Math.min(a, b), Math.max(a, b) + 1).filter((r) => !r.node.disabled).map((r) => r.node.id);
        setSelected(ids);
        return;
      }
      const next = new Set(mode === "replace" ? [] : selected);
      if (mode === "toggle" && next.has(id)) next.delete(id);
      else next.add(id);
      setSelected(Array.from(next));
      anchor.current = id;
    };

    const nextEnabled = (from: number, step: 1 | -1) => {
      for (let i = from + step; i >= 0 && i < rows.length; i += step) if (!rows[i].node.disabled) return rows[i];
      return null;
    };

    function handleKeyDown(event: React.KeyboardEvent<HTMLUListElement>) {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      const item = (event.target as HTMLElement).closest<HTMLElement>('[role="treeitem"]');
      const id = item?.dataset.nodeId;
      if (!id || !visibleIndex.has(id)) return;
      const index = visibleIndex.get(id)!;
      const row = rows[index];
      const open = row.branch && expanded.has(id);
      const multiple = selectionMode === "multiple";
      let handled = true;

      switch (event.key) {
        case "ArrowDown":
        case "ArrowUp": {
          const target = nextEnabled(index, event.key === "ArrowDown" ? 1 : -1);
          if (target) {
            focusNode(target.node.id);
            if (multiple && event.shiftKey) select(target.node.id, "add");
          }
          break;
        }
        case "ArrowRight":
          if (row.branch && !open) setOpen([row.node], true);
          else if (open) {
            const child = rows[index + 1];
            if (child && child.parentId === id && !child.node.disabled) focusNode(child.node.id);
          }
          break;
        case "ArrowLeft":
          if (open) setOpen([row.node], false);
          else if (row.parentId) focusNode(row.parentId);
          break;
        case "Home":
        case "End": {
          const target = event.key === "Home" ? nextEnabled(-1, 1) : nextEnabled(rows.length, -1);
          if (target) {
            focusNode(target.node.id);
            if (multiple && event.shiftKey && event.ctrlKey) select(target.node.id, "range");
          }
          break;
        }
        case "Enter":
          if (row.node.disabled) break;
          if (row.branch) toggle(row.node);
          else {
            select(id, "replace");
            onAction?.(row.node);
          }
          break;
        case " ":
          if (row.node.disabled) break;
          if (selectionMode === "none") {
            if (row.branch) toggle(row.node);
          } else if (multiple && event.shiftKey) select(id, "range");
          else select(id, multiple ? "toggle" : "replace");
          break;
        case "*": {
          const siblings = rows.filter((r) => r.parentId === row.parentId).map((r) => r.node);
          setOpen(siblings, true);
          break;
        }
        default:
          if (multiple && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a") {
            setSelected(rows.filter((r) => !r.node.disabled).map((r) => r.node.id));
            break;
          }
          if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey && event.key.trim()) {
            const state = typeahead.current;
            clearTimeout(state.timer);
            state.text += event.key.toLowerCase();
            state.timer = setTimeout(() => (state.text = ""), TYPEAHEAD_RESET);
            // Typing one letter repeatedly cycles through the nodes that start with it.
            const repeated = state.text.split("").every((c) => c === state.text[0]);
            const query = repeated ? state.text[0] : state.text;
            const start = repeated || state.text.length === 1 ? index + 1 : index;
            const ordered = [...rows.slice(start), ...rows.slice(0, start)];
            const match = ordered.find((r) => !r.node.disabled && textOf(r.node).startsWith(query));
            if (match) focusNode(match.node.id);
          } else handled = false;
      }
      if (handled) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    function handleRowClick(event: React.MouseEvent, row: Row) {
      const { node } = row;
      if (node.disabled) return;
      focusNode(node.id);
      const multiple = selectionMode === "multiple";
      if (multiple && event.shiftKey) {
        select(node.id, "range");
        return;
      }
      if (multiple && (event.metaKey || event.ctrlKey)) {
        select(node.id, "toggle");
        return;
      }
      select(node.id, "replace");
      if (row.branch) toggle(node);
      else onAction?.(node);
    }

    // The branch you're in: the parent of the focused node, or of the selection when the tree isn't focused.
    const activeId = hasFocus && tabbableId ? tabbableId : rows.find((r) => selected.has(r.node.id))?.node.id ?? null;
    const activeParent = activeId ? (parents.get(activeId) ?? null) : null;

    const renderLevel = (nodes: TreeNode[], level: number, parentId: string | null): React.ReactNode =>
      nodes.map((node, i) => {
        const branch = isBranch(node);
        const open = branch && expanded.has(node.id);
        const kids = childrenOf(node);
        const isSelected = selected.has(node.id);
        const isActive = activeId === node.id && activeParent !== null;
        const busy = Boolean(loading[node.id]);
        const guideLeft = ROW_INSET + (level - 1) * indent + CHEVRON / 2 - 0.5;
        const row: Row = { node, level, parentId, posinset: i + 1, setsize: nodes.length, branch };
        const icon = node.icon ?? (branch ? open ? <FolderOpen /> : <Folder /> : <File />);

        return (
          <li
            key={node.id}
            id={domId(node.id)}
            role="treeitem"
            data-node-id={node.id}
            aria-level={level}
            aria-posinset={i + 1}
            aria-setsize={nodes.length}
            aria-expanded={branch ? open : undefined}
            aria-selected={selectionMode === "none" ? undefined : isSelected}
            aria-disabled={node.disabled || undefined}
            aria-busy={busy || undefined}
            tabIndex={tabbableId === node.id ? 0 : -1}
            className="outline-none [&:focus-visible>[data-tree-row]]:shadow-[inset_0_0_0_1px_rgb(var(--neon)/0.7),0_0_12px_-2px_rgb(var(--neon)/CALC(0.45*var(--neon-glow,1)))]"
          >
            <div
              data-tree-row=""
              data-selected={isSelected ? "" : undefined}
              onClick={(event) => handleRowClick(event, row)}
              onDoubleClick={() => !node.disabled && !branch && selectionMode !== "none" && onAction?.(node)}
              style={{ paddingLeft: ROW_INSET + (level - 1) * indent }}
              className={cn(
                "group/row relative flex h-7 cursor-pointer select-none items-center gap-1.5 rounded-md pr-2 text-[13px] leading-5",
                "transition-[background-color,color,box-shadow] duration-150 ease-out",
                isSelected
                  ? "bg-[rgb(var(--neon)/0.1)] text-white"
                  : "text-white/70 hover:bg-white/[0.04] hover:text-white/90",
                node.disabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
              )}
            >
              {/* A short lit tick joins the active node to the lit guide of its branch. */}
              {isActive && (
                <span
                  aria-hidden
                  style={{ left: guideLeft - indent + 1, width: indent - CHEVRON / 2 - 0.5 + (branch ? 0 : CHEVRON - 3) }}
                  className="pointer-events-none absolute top-1/2 h-px bg-[rgb(var(--neon)/0.8)] shadow-[0_0_6px_rgb(var(--neon)/CALC(0.6*var(--neon-glow,1)))]"
                />
              )}
              <span
                aria-hidden
                onClick={(event) => {
                  if (!branch || node.disabled) return;
                  event.stopPropagation();
                  focusNode(node.id);
                  toggle(node);
                }}
                className="flex size-4 shrink-0 items-center justify-center text-white/40"
              >
                {busy ? (
                  <LoaderCircle className="size-3.5 animate-spin text-[rgb(var(--neon))]" />
                ) : branch ? (
                  <ChevronRight
                    strokeWidth={2}
                    className={cn(
                      "size-3.5 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
                      open && "rotate-90",
                    )}
                  />
                ) : null}
              </span>
              {showIcons && (
                <span
                  aria-hidden
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center [&_svg]:size-[15px] [&_svg]:stroke-[1.75]",
                    isSelected
                      ? "text-[rgb(var(--neon))] [filter:drop-shadow(0_0_4px_rgb(var(--neon)/CALC(0.6*var(--neon-glow,1))))]"
                      : branch
                        ? "text-white/55"
                        : "text-white/35",
                  )}
                >
                  {icon}
                </span>
              )}
              <span className="min-w-0 flex-1 truncate">{node.label}</span>
              {node.meta && <span className="shrink-0 text-xs tabular-nums text-white/40">{node.meta}</span>}
            </div>

            {branch && (open || opened[node.id]) && (
              <div
                className={cn(
                  "grid transition-[grid-template-rows,visibility] duration-[220ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
                  open ? "visible [grid-template-rows:1fr]" : "invisible [grid-template-rows:0fr]",
                )}
              >
                <ul role="group" className="relative min-h-0 overflow-hidden">
                  <span
                    aria-hidden
                    style={{ left: guideLeft }}
                    className="pointer-events-none absolute bottom-1 top-0 w-px bg-white/[0.08]"
                  />
                  <span
                    aria-hidden
                    style={{ left: guideLeft }}
                    className={cn(
                      "pointer-events-none absolute bottom-1 top-0 w-px bg-[rgb(var(--neon)/0.85)] shadow-[0_0_4px_rgb(var(--neon)/CALC(0.8*var(--neon-glow,1))),0_0_12px_rgb(var(--neon)/CALC(0.4*var(--neon-glow,1)))]",
                      "transition-opacity duration-200 ease-out",
                      activeParent === node.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {kids && kids.length > 0 && renderLevel(kids, level + 1, node.id)}
                  {kids && kids.length === 0 && <Placeholder level={level + 1} indent={indent}>Empty</Placeholder>}
                  {!kids && busy && <Placeholder level={level + 1} indent={indent}>Loading…</Placeholder>}
                  {!kids && failed[node.id] && (
                    <Placeholder level={level + 1} indent={indent} className="text-[#ff7a87]">
                      Couldn&apos;t load. Close and reopen to retry.
                    </Placeholder>
                  )}
                </ul>
              </div>
            )}
          </li>
        );
      });

    return (
      <ul
        ref={ref}
        role="tree"
        aria-multiselectable={selectionMode === "multiple" || undefined}
        style={neonVars(color, style)}
        onKeyDown={handleKeyDown}
        onFocus={(event) => {
          onFocus?.(event);
          setHasFocus(true);
          const id = (event.target as HTMLElement).closest<HTMLElement>('[role="treeitem"]')?.dataset.nodeId;
          if (id && id !== focusedId) setFocusedId(id);
        }}
        onBlur={(event) => {
          onBlur?.(event);
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHasFocus(false);
        }}
        className={cn("[--neon:var(--neon-accent,34_211_238)]", "grid text-white/80", className)}
        {...props}
      >
        {renderLevel(data, 1, null)}
      </ul>
    );
  },
);
TreeView.displayName = "TreeView";

function Placeholder({
  level,
  indent,
  className,
  children,
}: {
  level: number;
  indent: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <li
      role="none"
      style={{ paddingLeft: ROW_INSET + (level - 1) * indent + CHEVRON + 6 }}
      className={cn("flex h-7 items-center text-xs italic text-white/40", className)}
    >
      {children}
    </li>
  );
}

export { TreeView };
