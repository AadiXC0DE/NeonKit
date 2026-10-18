"use client";

import * as React from "react";
import {
  FileDropzone,
  FileList,
  type FileListItem,
  type FileRejection,
} from "@/components/ui/file-dropzone";

// Simulated uploads. In an app, progress comes from your upload request.
type Upload = FileListItem & { failAt?: number };

const MB = 1024 * 1024;
const BYTES_PER_TICK = 3.2 * MB;
const PARALLEL = 2;

const seed: Upload[] = [
  { id: "hero", name: "aurora-hero@2x.png", size: 2.7 * MB, type: "image/png", status: "done", progress: 100 },
  { id: "keynote", name: "launch-keynote.mov", size: 84.2 * MB, type: "video/quicktime", status: "uploading", progress: 6, failAt: 64 },
  { id: "kit", name: "press-kit.zip", size: 14 * MB, status: "queued", progress: 0 },
  { id: "brief", name: "aurora-brief.pdf", size: 0.8 * MB, type: "application/pdf", status: "queued", progress: 0 },
];

function tick(files: Upload[]): Upload[] {
  let slots = PARALLEL - files.filter((file) => file.status === "uploading").length;
  return files.map((file) => {
    if (file.status === "queued" && slots > 0) {
      slots--;
      return { ...file, status: "uploading" };
    }
    if (file.status !== "uploading") return file;

    const jitter = 0.6 + Math.random() * 0.8;
    const progress = Math.min(100, (file.progress ?? 0) + (BYTES_PER_TICK / file.size) * 100 * jitter);
    if (file.failAt !== undefined && progress >= file.failAt) {
      return { ...file, progress: file.failAt, status: "error", error: "Connection dropped", failAt: undefined };
    }
    return progress >= 100 ? { ...file, progress: 100, status: "done" } : { ...file, progress };
  });
}

export default function FileDropzoneDemo() {
  const [files, setFiles] = React.useState<Upload[]>(seed);
  const [rejections, setRejections] = React.useState<FileRejection[]>([]);
  const nextId = React.useRef(0);

  const active = files.some((file) => file.status === "uploading" || file.status === "queued");
  const done = files.filter((file) => file.status === "done").length;

  React.useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => setFiles(tick), 180);
    return () => window.clearInterval(timer);
  }, [active]);

  function add(added: File[]) {
    setRejections([]);
    setFiles((current) => [
      ...current,
      ...added.map((file) => ({
        id: `upload-${nextId.current++}`,
        name: file.name,
        size: file.size,
        type: file.type,
        status: "queued" as const,
        progress: 0,
      })),
    ]);
  }

  function retry(id: string) {
    setFiles((current) =>
      current.map((file) =>
        file.id === id ? { ...file, status: "queued", progress: 0, error: undefined } : file,
      ),
    );
  }

  return (
    <div className="grid w-full max-w-md gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="grid gap-1">
          <h3 className="text-sm font-medium text-white/90">Launch assets</h3>
          <p className="text-xs text-white/55">Everything here ships with the Aurora press release.</p>
        </div>
        <span className="shrink-0 text-xs tabular-nums text-white/55">
          {done}/{files.length} uploaded
        </span>
      </div>

      <FileDropzone
        accept="image/*,video/*,.pdf,.zip"
        maxSize={200 * MB}
        description="Images, video, PDF or ZIP · up to 200 MB each"
        onFilesChange={add}
        onReject={setRejections}
      />

      {rejections.length > 0 && (
        <ul className="grid gap-1 text-xs leading-5 text-[#ff4d5e]">
          {rejections.map(({ file, message }) => (
            <li key={file.name} className="break-words">
              {file.name}: {message}
            </li>
          ))}
        </ul>
      )}

      {files.length > 0 && (
        <FileList
          aria-label="Uploads"
          files={files}
          onRetry={retry}
          onRemove={(id) => setFiles((current) => current.filter((file) => file.id !== id))}
        />
      )}
    </div>
  );
}
