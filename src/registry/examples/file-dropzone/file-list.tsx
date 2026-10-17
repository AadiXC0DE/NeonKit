"use client";

import * as React from "react";
import { FileList, type FileListItem } from "@/components/ui/file-dropzone";

const initial: FileListItem[] = [
  { id: "1", name: "q3-revenue.xlsx", size: 412_000, status: "done" },
  { id: "2", name: "board-deck-final.pdf", size: 6_300_000, type: "application/pdf", status: "uploading", progress: 42 },
  { id: "3", name: "interview-07.m4a", size: 31_800_000, type: "audio/mp4", status: "error", progress: 18, error: "Storage quota reached" },
  { id: "4", name: "site-backup.tar.gz", size: 1_240_000_000, status: "queued" },
];

export default function FileListStates() {
  const [files, setFiles] = React.useState(initial);

  return (
    <FileList
      aria-label="Uploads"
      className="max-w-md"
      files={files}
      onRetry={(id) =>
        setFiles((current) =>
          current.map((file) =>
            file.id === id ? { ...file, status: "queued", progress: 0, error: undefined } : file,
          ),
        )
      }
      onRemove={(id) => setFiles((current) => current.filter((file) => file.id !== id))}
    />
  );
}
