"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  FileDropzone,
  FileList,
  type FileRejection,
} from "@/components/ui/file-dropzone";

const LIMIT = 3;

export default function FileDropzoneValidation() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [rejections, setRejections] = React.useState<FileRejection[]>([]);
  const remaining = LIMIT - files.length;

  return (
    <div className="grid w-full max-w-md gap-3">
      <FileDropzone
        accept=".csv,text/csv"
        maxSize={5 * 1024 * 1024}
        // The limit is per drop, so pass what's left.
        maxFiles={remaining}
        disabled={remaining === 0}
        label={remaining === 0 ? "That's the limit for one import" : undefined}
        description={`CSV, UTF-8 · 5 MB each · ${remaining} of ${LIMIT} slots left`}
        onFilesChange={(added) => {
          setRejections([]);
          setFiles((current) => [...current, ...added]);
        }}
        onReject={(rejected) => setRejections(rejected)}
      />

      {rejections.length > 0 && (
        <ul aria-label="Not added" className="grid gap-1 rounded-lg border border-[#ff4d5e]/25 bg-[#ff4d5e]/[0.06] px-3 py-2.5 text-xs leading-5">
          {rejections.map(({ file, message }, i) => (
            <li key={`${file.name}-${i}`} className="flex justify-between gap-3">
              <span className="truncate text-white/80">{file.name}</span>
              <span className="shrink-0 text-[#ff4d5e]">{message}</span>
            </li>
          ))}
        </ul>
      )}

      {files.length > 0 && (
        <>
          <FileList
            aria-label="Ready to import"
            files={files.map((file, i) => ({
              id: `${file.name}-${i}`,
              name: file.name,
              size: file.size,
              type: file.type,
              status: "queued",
            }))}
            onRemove={(id) => setFiles((current) => current.filter((file, i) => `${file.name}-${i}` !== id))}
          />
          <Button variant="solid" className="w-full">
            Import {files.length} {files.length === 1 ? "file" : "files"}
          </Button>
        </>
      )}
    </div>
  );
}
