"use client";

import * as React from "react";
import { UserRound } from "@/components/ui/icons";
import { FileDropzone } from "@/components/ui/file-dropzone";

export default function FileDropzoneAvatar() {
  const [photo, setPhoto] = React.useState<string | null>(null);
  const [error, setError] = React.useState("");

  // Free the previous preview when it's replaced or the component unmounts.
  React.useEffect(() => {
    if (!photo) return;
    return () => URL.revokeObjectURL(photo);
  }, [photo]);

  return (
    <div className="grid w-full max-w-[16rem] gap-2">
      <FileDropzone
        accept="image/png,image/jpeg,image/webp"
        multiple={false}
        maxSize={2 * 1024 * 1024}
        onFilesChange={([file]) => {
          setError("");
          setPhoto(URL.createObjectURL(file));
        }}
        onReject={([rejection]) => setError(`${rejection.file.name}: ${rejection.message}.`)}
      >
        <div className="flex flex-col items-center gap-3 px-6 py-7">
          <span
            aria-hidden
            style={photo ? { backgroundImage: `url(${photo})` } : undefined}
            className="grid size-20 place-items-center rounded-full border border-white/10 bg-white/[0.04] bg-cover bg-center text-white/30 [&_svg]:size-8"
          >
            {!photo && <UserRound />}
          </span>
          <div className="grid gap-1">
            <p className="text-sm font-medium text-white/90">{photo ? "Replace photo" : "Upload a photo"}</p>
            <p className="text-xs text-white/55">PNG, JPG or WebP · up to 2 MB</p>
          </div>
        </div>
      </FileDropzone>
      <p aria-live="polite" className="min-h-5 text-center text-xs leading-5 text-[#ff4d5e]">
        {error}
      </p>
    </div>
  );
}
