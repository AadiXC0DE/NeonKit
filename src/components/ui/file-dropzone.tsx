"use client";

import * as React from "react";
import {
  CircleCheck,
  CloudUpload,
  File as FileIcon,
  FileArchive,
  FileCode,
  FileHeadphone,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideoCamera,
  RotateCw,
  X,
} from "@/components/ui/icons";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

const INVALID = "#ff4d5e";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

// Border geometry. The dash period is stretched so a whole number of dashes
// fits the perimeter exactly, which leaves no seam where the loop closes.
const RADIUS = 12;
const STROKE = 1.5;
const PERIOD = 14;

const keyframes = `
@keyframes neonkit-dropzone-march{to{stroke-dashoffset:var(--nk-dash-shift)}}
@keyframes neonkit-dropzone-ignite{0%{opacity:0}12%{opacity:.9}22%{opacity:.2}40%{opacity:1}52%{opacity:.5}68%,100%{opacity:1}}
@keyframes neonkit-dropzone-bloom{0%{opacity:.9;transform:translate(-50%,-50%) scale(.3)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.5)}}
@keyframes neonkit-filelist-in{from{opacity:0;transform:translateY(4px) scale(.98)}}
`;

/** "2.4 MB", "512 KB", "18 B". */
function formatBytes(bytes: number) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = Math.max(0, bytes);
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  const shown = unit === 0 || value >= 10 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${shown} ${units[unit]}`;
}

function acceptTokens(accept?: string) {
  return (accept ?? "")
    .split(",")
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
}

/** Same rules as `<input accept>`: extensions, exact MIME types and `type/*`. */
function matchesAccept(file: { name?: string; type: string }, tokens: string[]) {
  if (tokens.length === 0) return true;
  const name = (file.name ?? "").toLowerCase();
  const type = file.type.toLowerCase();
  return tokens.some((token) => {
    if (token.startsWith(".")) return name.endsWith(token);
    if (token.endsWith("/*")) return type.startsWith(token.slice(0, -1));
    return type === token;
  });
}

function hasFiles(event: React.DragEvent) {
  return Array.from(event.dataTransfer?.types ?? []).includes("Files");
}

export type FileRejectionReason = "file-type" | "file-size" | "file-count";

export interface FileRejection {
  file: File;
  reason: FileRejectionReason;
  /** A short sentence you can show as is, like "Larger than 10 MB". */
  message: string;
}

type DragState = "idle" | "accept" | "reject";

export interface FileDropzoneProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "onChange"> {
  /** Same format as the input attribute: ".png,.pdf", "image/*", "application/zip". */
  accept?: string;
  /** Allow more than one file per drop or selection. */
  multiple?: boolean;
  /** Largest accepted file, in bytes. */
  maxSize?: number;
  /** Most files accepted per drop or selection; the rest are rejected. */
  maxFiles?: number;
  disabled?: boolean;
  /** Called with the files that passed `accept`, `maxSize` and `maxFiles`. */
  onFilesChange?: (files: File[]) => void;
  /** Called with every file that didn't, and why. */
  onReject?: (rejections: FileRejection[]) => void;
  /** Main line of the default content. */
  label?: React.ReactNode;
  /** Second line, e.g. accepted types and the size limit. */
  description?: React.ReactNode;
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** Replaces the default icon, label and description. Keep it non-interactive. */
  children?: React.ReactNode;
  /** Submits the last accepted files under this name with a surrounding form (multipart). */
  name?: string;
  /** Blocks form submission until a file is accepted. Needs `name`. */
  required?: boolean;
}

const FileDropzone = React.forwardRef<HTMLDivElement, FileDropzoneProps>(
  (
    {
      accept,
      multiple = true,
      maxSize,
      maxFiles,
      disabled = false,
      onFilesChange,
      onReject,
      label,
      description,
      color,
      name,
      required = false,
      className,
      style,
      children,
      onClick,
      onKeyDown,
      onKeyUp,
      onDragEnter,
      onDragOver,
      onDragLeave,
      onDrop,
      onPaste,
      ...props
    },
    ref,
  ) => {
    const zoneRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => zoneRef.current as HTMLDivElement);

    const autoId = React.useId();
    const labelId = `${autoId}-label`;
    const descriptionId = `${autoId}-description`;
    const depth = React.useRef(0);
    const [drag, setDrag] = React.useState<DragState>("idle");
    const [exit, setExit] = React.useState<"leave" | "drop">("leave");
    const [ignitions, setIgnitions] = React.useState(0);
    const [bloom, setBloom] = React.useState<{ x: number; y: number; key: number; rejected: boolean } | null>(null);
    const [announcement, setAnnouncement] = React.useState("");
    const [box, setBox] = React.useState<{ width: number; height: number } | null>(null);

    const tokens = acceptTokens(accept);
    const limit = multiple ? (maxFiles ?? Infinity) : 1;
    const dragging = drag !== "idle";

    useIsomorphicLayoutEffect(() => {
      const node = zoneRef.current;
      if (!node || typeof ResizeObserver === "undefined") return;
      const observer = new ResizeObserver(() => {
        const width = node.offsetWidth;
        const height = node.offsetHeight;
        setBox((previous) =>
          previous && previous.width === width && previous.height === height ? previous : { width, height },
        );
      });
      observer.observe(node);
      return () => observer.disconnect();
    }, []);

    const submitted = React.useRef<File[]>([]);
    React.useEffect(() => {
      const form = inputRef.current?.form;
      if (!form) return;
      const onReset = () => {
        submitted.current = [];
      };
      form.addEventListener("reset", onReset);
      return () => form.removeEventListener("reset", onReset);
    }, []);

    function process(list: File[], point?: { x: number; y: number }) {
      if (list.length === 0) return;
      const accepted: File[] = [];
      const rejected: FileRejection[] = [];
      for (const file of list) {
        if (!matchesAccept(file, tokens)) {
          rejected.push({ file, reason: "file-type", message: "This file type isn't accepted" });
        } else if (maxSize !== undefined && file.size > maxSize) {
          rejected.push({ file, reason: "file-size", message: `Larger than ${formatBytes(maxSize)}` });
        } else if (accepted.length >= limit) {
          rejected.push({
            file,
            reason: "file-count",
            message: limit === 1 ? "Only one file at a time" : `Over the limit of ${limit} files`,
          });
        } else {
          accepted.push(file);
        }
      }

      const zone = zoneRef.current;
      if (zone) {
        const rect = zone.getBoundingClientRect();
        setBloom((previous) => ({
          x: point ? point.x - rect.left : rect.width / 2,
          y: point ? point.y - rect.top : rect.height / 2,
          key: (previous?.key ?? 0) + 1,
          rejected: accepted.length === 0,
        }));
      }

      const added = accepted.length
        ? `${accepted.length} ${accepted.length === 1 ? "file" : "files"} added.`
        : "";
      const refused = rejected.map((rejection) => `${rejection.file.name}: ${rejection.message}.`).join(" ");
      setAnnouncement([added, refused].filter(Boolean).join(" "));

      if (accepted.length) submitted.current = accepted;
      // With a name, the native input carries the last accepted files, so a plain form submit sends them.
      const input = inputRef.current;
      if (name && input && typeof DataTransfer !== "undefined") {
        try {
          const transfer = new DataTransfer();
          submitted.current.forEach((file) => transfer.items.add(file));
          input.files = transfer.files;
        } catch {
          // Browsers that can't assign files still report them through onFilesChange.
        }
      }

      if (accepted.length) onFilesChange?.(accepted);
      if (rejected.length) onReject?.(rejected);
    }

    function openPicker() {
      if (!disabled) inputRef.current?.click();
    }

    // While dragging, browsers expose MIME types but not names. Only call it a
    // reject when every type is known and none can match.
    function previewDrag(event: React.DragEvent): DragState {
      const items = Array.from(event.dataTransfer?.items ?? []).filter((item) => item.kind === "file");
      if (tokens.length === 0 || items.length === 0) return "accept";
      if (tokens.some((token) => token.startsWith("."))) return "accept";
      const known = items.every((item) => item.type);
      if (known && !items.some((item) => matchesAccept({ type: item.type }, tokens))) return "reject";
      return "accept";
    }

    function endDrag(how: "leave" | "drop") {
      depth.current = 0;
      setExit(how);
      setDrag("idle");
    }

    const geometry = box && box.width > STROKE * 2 && box.height > STROKE * 2 ? border(box) : null;

    const defaultLabel =
      drag === "reject" ? (
        "This file type isn't accepted"
      ) : dragging ? (
        multiple ? "Release to add files" : "Release to add the file"
      ) : (
        <>
          {multiple ? "Drop files here or " : "Drop a file here or "}
          <span className="text-[rgb(var(--neon))]">browse</span>
        </>
      );

    return (
      <>
        <div
          ref={zoneRef}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled || undefined}
          aria-labelledby={children ? undefined : labelId}
          aria-describedby={!children && description ? descriptionId : undefined}
          data-state={drag === "idle" ? "idle" : drag === "accept" ? "dragging" : "rejecting"}
          data-disabled={disabled ? "" : undefined}
          style={neonVars(drag === "reject" ? INVALID : color, style)}
          className={cn(
            "[--neon:var(--neon-accent,34_211_238)]",
            "group/dropzone relative isolate flex w-full select-none flex-col items-center justify-center rounded-xl bg-white/[0.02] text-center outline-none",
            "transition-[background-color] duration-200 ease-out",
            !geometry && "border border-dashed border-white/15",
            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-white/[0.03]",
            dragging && "bg-[rgb(var(--neon)/0.05)] hover:bg-[rgb(var(--neon)/0.05)]",
            className,
          )}
          {...props}
          onClick={(event) => {
            onClick?.(event);
            if (!event.defaultPrevented) openPicker();
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.defaultPrevented || event.target !== event.currentTarget) return;
            if (event.key === "Enter") {
              event.preventDefault();
              openPicker();
            } else if (event.key === " ") {
              // Space activates on release, like a native button.
              event.preventDefault();
            }
          }}
          onKeyUp={(event) => {
            onKeyUp?.(event);
            if (event.defaultPrevented || event.target !== event.currentTarget) return;
            if (event.key === " ") openPicker();
          }}
          onDragEnter={(event) => {
            onDragEnter?.(event);
            if (!hasFiles(event)) return;
            event.preventDefault();
            depth.current += 1;
            if (depth.current === 1 && !disabled) {
              setDrag(previewDrag(event));
              setIgnitions((count) => count + 1);
            }
          }}
          onDragOver={(event) => {
            onDragOver?.(event);
            if (!hasFiles(event)) return;
            // Always claim the drag, so a file dropped on a disabled zone doesn't open in the tab.
            // A likely reject still lands, so onReject can say why.
            event.preventDefault();
            event.dataTransfer.dropEffect = disabled ? "none" : "copy";
          }}
          onDragLeave={(event) => {
            onDragLeave?.(event);
            if (!hasFiles(event)) return;
            depth.current = Math.max(0, depth.current - 1);
            if (depth.current === 0) endDrag("leave");
          }}
          onDrop={(event) => {
            onDrop?.(event);
            if (!hasFiles(event)) return;
            event.preventDefault();
            endDrag("drop");
            if (disabled) return;
            process(Array.from(event.dataTransfer.files), { x: event.clientX, y: event.clientY });
          }}
          onPaste={(event) => {
            onPaste?.(event);
            const files = Array.from(event.clipboardData?.files ?? []);
            if (disabled || event.defaultPrevented || files.length === 0) return;
            event.preventDefault();
            process(files);
          }}
        >
          <style>{keyframes}</style>

          {geometry && (
            <>
              {/* Unlit: dark glass segments */}
              <svg
                aria-hidden
                className={cn(
                  "pointer-events-none absolute inset-0 -z-10 size-full transition-opacity duration-200",
                  "group-focus-visible/dropzone:opacity-0",
                  dragging && "opacity-0",
                )}
              >
                <rect
                  {...geometry.rect}
                  fill="none"
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  strokeDasharray={geometry.dash}
                  className={cn(
                    "stroke-white/[0.16] transition-[stroke] duration-200",
                    !disabled && "group-hover/dropzone:stroke-white/[0.26]",
                  )}
                />
              </svg>
              {/* Lit: neon tube with a hot core. Strikes on drag enter, marches while held. */}
              <svg
                key={ignitions}
                aria-hidden
                style={{ "--nk-dash-shift": `${-geometry.period}px` } as React.CSSProperties}
                className={cn(
                  "pointer-events-none absolute inset-0 -z-10 size-full overflow-visible",
                  "[filter:drop-shadow(0_0_3px_rgb(var(--neon)/CALC(0.9*var(--neon-glow,1))))_drop-shadow(0_0_12px_rgb(var(--neon)/CALC(0.45*var(--neon-glow,1))))]",
                  dragging
                    ? "opacity-100 [animation:neonkit-dropzone-ignite_360ms_linear_backwards] motion-reduce:[animation:none]"
                    : cn(
                        "opacity-0 transition-opacity ease-out group-focus-visible/dropzone:opacity-70",
                        exit === "drop" ? "duration-700" : "duration-200",
                      ),
                )}
              >
                {[
                  { width: STROKE, className: "stroke-[rgb(var(--neon))]" },
                  { width: STROKE / 2.5, className: "stroke-white/70" },
                ].map((tube) => (
                  <rect
                    key={tube.className}
                    {...geometry.rect}
                    fill="none"
                    strokeWidth={tube.width}
                    strokeLinecap="round"
                    strokeDasharray={geometry.dash}
                    className={cn(
                      tube.className,
                      "[animation:neonkit-dropzone-march_550ms_linear_infinite] motion-reduce:[animation:none]",
                      !dragging && "[animation-play-state:paused]",
                    )}
                  />
                ))}
              </svg>
            </>
          )}

          {/* The bloom: a soft flash from where the files landed */}
          <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-xl">
            {bloom && (
              <span
                key={bloom.key}
                style={{ left: bloom.x, top: bloom.y }}
                className={cn(
                  "absolute size-[28rem] rounded-full opacity-0 motion-reduce:hidden",
                  "[animation:neonkit-dropzone-bloom_700ms_cubic-bezier(0.23,1,0.32,1)_both]",
                  bloom.rejected
                    ? "bg-[radial-gradient(circle,rgb(255_77_94/0.26),rgb(255_77_94/0.06)_40%,transparent_68%)]"
                    : "bg-[radial-gradient(circle,rgb(var(--neon)/CALC(0.3*var(--neon-glow,1))),rgb(var(--neon)/CALC(0.08*var(--neon-glow,1)))_40%,transparent_68%)]",
                )}
              />
            )}
          </span>

          {children ?? (
            <div className="flex flex-col items-center gap-3 px-6 py-9">
              <span
                aria-hidden
                className={cn(
                  "grid size-11 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-white/55",
                  "transition-[transform,translate,border-color,background-color,color,box-shadow] duration-200 ease-out [&_svg]:size-6",
                  !disabled &&
                    "group-hover/dropzone:border-white/[0.16] group-hover/dropzone:text-white/80",
                  dragging &&
                    "-translate-y-0.5 border-[rgb(var(--neon)/0.55)] bg-[rgb(var(--neon)/0.1)] text-[rgb(var(--neon))] shadow-[0_0_20px_-2px_rgb(var(--neon)/CALC(0.45*var(--neon-glow,1)))] group-hover/dropzone:border-[rgb(var(--neon)/0.55)] group-hover/dropzone:text-[rgb(var(--neon))] motion-reduce:translate-y-0",
                )}
              >
                <CloudUpload />
              </span>
              <div className="grid gap-1">
                <p id={labelId} className="text-sm font-medium text-white/90">
                  {dragging ? defaultLabel : (label ?? defaultLabel)}
                </p>
                {description && (
                  <p id={descriptionId} className="text-xs leading-5 text-white/55">
                    {description}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          tabIndex={-1}
          aria-hidden
          name={name}
          required={Boolean(name) && required}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onClick={(event) => event.stopPropagation()}
          onFocus={() => zoneRef.current?.focus()}
          onChange={(event) => {
            const picked = Array.from(event.target.files ?? []);
            // Let the same file be picked again; a named input keeps what was accepted instead.
            if (!name) event.target.value = "";
            process(picked);
          }}
          // Visually hidden, not display:none, so a required one can still show the browser's message. It sits
          // beside the zone rather than inside it: a control nested in role="button" is still reachable by
          // assistive tech. With no insets it stays at its static position, just under the zone.
          className="pointer-events-none absolute size-px opacity-0"
        />
        <span role="status" className="sr-only">
          {announcement}
        </span>
      </>
    );
  },
);
FileDropzone.displayName = "FileDropzone";

function border(box: { width: number; height: number }) {
  const inset = STROKE / 2;
  const width = box.width - STROKE;
  const height = box.height - STROKE;
  const radius = Math.max(0, Math.min(RADIUS - inset, width / 2, height / 2));
  const perimeter = 2 * (width + height) - 8 * radius + 2 * Math.PI * radius;
  const count = Math.max(4, Math.round(perimeter / PERIOD));
  const period = perimeter / count;
  return {
    rect: { x: inset, y: inset, width, height, rx: radius },
    dash: `${(period * 0.55).toFixed(3)} ${(period * 0.45).toFixed(3)}`,
    period,
  };
}

export type FileStatus = "queued" | "uploading" | "done" | "error";

export interface FileListItem {
  id: string;
  name: string;
  /** In bytes. */
  size: number;
  /** MIME type. The icon falls back to the file extension. */
  type?: string;
  /** 0 to 100. */
  progress?: number;
  status: FileStatus;
  /** Shown in place of the status while `status` is "error". */
  error?: React.ReactNode;
}

const extensionIcons: [RegExp, typeof FileIcon][] = [
  [/^(png|jpe?g|gif|webp|avif|svg|heic|bmp|tiff?|ico)$/, FileImage],
  [/^(mp4|mov|webm|mkv|avi|m4v)$/, FileVideoCamera],
  [/^(mp3|wav|flac|aac|ogg|m4a|aiff?)$/, FileHeadphone],
  [/^(zip|rar|7z|tar|gz|tgz|bz2|xz)$/, FileArchive],
  [/^(csv|tsv|xlsx?|numbers|ods)$/, FileSpreadsheet],
  [/^(js|jsx|ts|tsx|json|html|css|py|rb|go|rs|java|kt|swift|c|cpp|h|sh|ya?ml|toml|sql)$/, FileCode],
  [/^(pdf|txt|md|mdx|doc|docx|rtf|pages|odt|key|pptx?)$/, FileText],
];

function iconFor(name: string, type = "") {
  if (type.startsWith("image/")) return FileImage;
  if (type.startsWith("video/")) return FileVideoCamera;
  if (type.startsWith("audio/")) return FileHeadphone;
  const extension = name.includes(".") ? name.split(".").pop()!.toLowerCase() : "";
  return extensionIcons.find(([pattern]) => pattern.test(extension))?.[1] ?? FileIcon;
}

export interface FileListProps extends Omit<React.HTMLAttributes<HTMLUListElement>, "color"> {
  files: FileListItem[];
  /** Shows a remove button on every row. */
  onRemove?: (id: string) => void;
  /** Shows a retry button on rows with status "error". */
  onRetry?: (id: string) => void;
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
}

const actionButton =
  "grid size-7 shrink-0 cursor-pointer place-items-center rounded-md text-white/40 outline-none transition-[background-color,color,transform,scale] duration-150 ease-out hover:bg-white/[0.06] hover:text-white/90 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a] [&_svg]:size-4";

const FileList = React.forwardRef<HTMLUListElement, FileListProps>(
  ({ files, onRemove, onRetry, color, className, style, ...props }, ref) => {
    // Announce finished and failed uploads once, not every progress tick.
    const signature = files.map((file) => `${file.id}:${file.status}`).join("|");
    const [seen, setSeen] = React.useState(() => ({
      signature,
      statuses: new Map(files.map((file) => [file.id, file.status])),
      message: "",
    }));
    if (seen.signature !== signature) {
      const message = files
        .filter((file) => seen.statuses.get(file.id) !== file.status)
        .map((file) =>
          file.status === "done"
            ? `${file.name} uploaded.`
            : file.status === "error"
              ? `${file.name} failed to upload.`
              : "",
        )
        .filter(Boolean)
        .join(" ");
      setSeen({
        signature,
        statuses: new Map(files.map((file) => [file.id, file.status])),
        message: message || seen.message,
      });
    }

    return (
      <>
        <style>{keyframes}</style>
        <ul
          ref={ref}
          style={neonVars(color, style)}
          className={cn("[--neon:var(--neon-accent,34_211_238)]", "grid w-full gap-2", className)}
          {...props}
        >
          {files.map((file) => {
            const Icon = iconFor(file.name, file.type);
            const failed = file.status === "error";
            const done = file.status === "done";
            const percent = done ? 100 : Math.min(100, Math.max(0, file.progress ?? 0));
            const statusText = failed
              ? (file.error ?? "Upload failed")
              : done
                ? "Uploaded"
                : file.status === "uploading"
                  ? `${Math.round(percent)}%`
                  : "Queued";

            return (
              <li
                key={file.id}
                data-status={file.status}
                style={failed ? neonVars(INVALID) : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg border border-white/[0.08] bg-white/[0.02] py-3 pl-3 pr-2",
                  "[animation:neonkit-filelist-in_220ms_cubic-bezier(0.23,1,0.32,1)_backwards] motion-reduce:[animation:none]",
                  "transition-[border-color] duration-200",
                  failed && "border-[rgb(var(--neon)/0.3)]",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-lg border bg-white/[0.03] transition-colors duration-200 [&_svg]:size-5",
                    failed
                      ? "border-[rgb(var(--neon)/0.35)] text-[rgb(var(--neon))]"
                      : file.status === "uploading"
                        ? "border-[rgb(var(--neon)/0.3)] text-[rgb(var(--neon))]"
                        : "border-white/10 text-white/55",
                  )}
                >
                  <Icon />
                </span>

                <div className="grid min-w-0 flex-1 gap-1.5">
                  {/* The name gets the whole row; size and status sit under the tube and never squeeze it. */}
                  <p className="min-w-0 truncate text-sm text-white/90" title={file.name}>
                    {file.name}
                  </p>
                  {/* The progress tube: unlit glass that fills with light */}
                  <div
                    role="progressbar"
                    aria-label={`${file.name} upload`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(percent)}
                    className="relative h-1 w-full rounded-full bg-white/[0.06] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.04)]"
                  >
                    <div
                      style={{ transform: `scaleX(${percent / 100})` }}
                      className={cn(
                        "absolute inset-0 origin-left rounded-full bg-[rgb(var(--neon))] rtl:origin-right",
                        "transition-[transform,opacity,box-shadow] duration-[400ms,700ms,700ms] ease-out motion-reduce:transition-none",
                        done
                          ? "opacity-40 shadow-none delay-[0ms,300ms,300ms]"
                          : "shadow-[0_0_8px_rgb(var(--neon)/CALC(0.65*var(--neon-glow,1)))]",
                        percent === 0 && "opacity-0",
                      )}
                    />
                  </div>
                  <div className="flex min-w-0 items-start justify-between gap-3 text-xs leading-4 tabular-nums">
                    <p
                      className={cn(
                        "flex min-w-0 items-start gap-1.5",
                        failed ? "text-[#ff4d5e]" : done ? "text-white/70" : "text-white/55",
                      )}
                    >
                      {done && (
                        <CircleCheck
                          aria-hidden
                          className="size-4 shrink-0 text-[rgb(var(--neon))] [filter:drop-shadow(0_0_4px_rgb(var(--neon)/CALC(0.6*var(--neon-glow,1))))]"
                        />
                      )}
                      <span className="min-w-0">
                        <span className="sr-only">{formatBytes(file.size)}, </span>
                        {statusText}
                      </span>
                    </p>
                    <span aria-hidden className="shrink-0 text-white/50">
                      {formatBytes(file.size)}
                    </span>
                  </div>
                </div>

                {(onRetry || onRemove) && (
                  <div className="flex shrink-0 items-center gap-0.5">
                    {/* Every row keeps the retry slot, so the progress tubes end in one column. */}
                    {onRetry && !failed && <span aria-hidden className="size-7 shrink-0" />}
                    {failed && onRetry && (
                      <button
                        type="button"
                        aria-label={`Retry ${file.name}`}
                        title="Retry"
                        onClick={() => onRetry(file.id)}
                        className={actionButton}
                      >
                        <RotateCw />
                      </button>
                    )}
                    {onRemove && (
                      <button
                        type="button"
                        aria-label={`${file.status === "uploading" ? "Cancel" : "Remove"} ${file.name}`}
                        title={file.status === "uploading" ? "Cancel" : "Remove"}
                        onClick={() => onRemove(file.id)}
                        className={actionButton}
                      >
                        <X />
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        <span role="status" className="sr-only">
          {seen.message}
        </span>
      </>
    );
  },
);
FileList.displayName = "FileList";

export { FileDropzone, FileList, formatBytes };
