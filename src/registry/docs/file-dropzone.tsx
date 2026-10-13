import type { ComponentDoc } from "../types";
import FileDropzoneDemo from "../examples/file-dropzone/demo";
import FileDropzoneAvatar from "../examples/file-dropzone/avatar";
import FileDropzoneValidation from "../examples/file-dropzone/validation";
import FileListStates from "../examples/file-dropzone/file-list";

export const doc: ComponentDoc = {
  usage: `import { FileDropzone, FileList } from "@/components/ui/file-dropzone"

<FileDropzone
  accept="image/*,.pdf"
  maxSize={10 * 1024 * 1024}
  description="Images or PDF · up to 10 MB"
  onFilesChange={(files) => upload(files)}
/>
<FileList files={uploads} onRetry={retry} onRemove={remove} />`,
  examples: [
    {
      name: "demo",
      title: "Upload panel",
      description:
        "Drag files over and the dashed tube powers up. Drops bloom from where they land. The list tracks each upload, and the keynote fails once so you can retry it.",
      component: FileDropzoneDemo,
    },
    {
      name: "avatar",
      title: "Single image",
      description: "With multiple off and custom children, the zone becomes a profile photo picker with a live preview.",
      component: FileDropzoneAvatar,
    },
    {
      name: "validation",
      title: "Limits and rejections",
      description:
        "Rejections come back with a reason and a message. maxFiles applies per drop, so pass the slots that are left.",
      component: FileDropzoneValidation,
    },
    {
      name: "file-list",
      title: "File list states",
      description: "Queued, uploading, done and failed, with type icons picked from the MIME type or extension.",
      component: FileListStates,
    },
  ],
  api: [
    {
      name: "FileDropzone",
      description:
        "Also accepts native div attributes, and the ref points at the zone. Files come in by click, Enter or Space (the system picker), drag and drop, or paste while focused.",
      props: [
        { prop: "accept", type: "string", description: 'Same format as the input attribute: ".png,.pdf", "image/*", "application/zip".' },
        { prop: "multiple", type: "boolean", default: "true", description: "Allow more than one file per drop or selection." },
        { prop: "maxSize", type: "number", description: "Largest accepted file, in bytes." },
        { prop: "maxFiles", type: "number", description: "Most files accepted per drop or selection. Extra files are rejected." },
        { prop: "disabled", type: "boolean", default: "false", description: "Ignores clicks, drops and paste." },
        { prop: "name", type: "string", description: "Submits the last accepted files under this name with a surrounding form. Use encType=\"multipart/form-data\"." },
        { prop: "required", type: "boolean", default: "false", description: "With name, stops the submit until a file is accepted." },
        { prop: "onFilesChange", type: "(files: File[]) => void", description: "Called with the files that passed every check." },
        { prop: "onReject", type: "(rejections: FileRejection[]) => void", description: "Called with each refused file and why." },
        { prop: "label", type: "ReactNode", default: '"Drop files here or browse"', description: "Main line of the default content." },
        { prop: "description", type: "ReactNode", description: "Second line, e.g. accepted types and size limit." },
        { prop: "children", type: "ReactNode", description: "Replaces the default content. Keep it non-interactive; the whole zone is the button." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
      ],
    },
    {
      name: "FileRejection",
      props: [
        { prop: "file", type: "File", description: "The refused file." },
        { prop: "reason", type: '"file-type" | "file-size" | "file-count"', description: "Which check it failed." },
        { prop: "message", type: "string", description: 'A short sentence you can show as is, like "Larger than 10 MB".' },
      ],
    },
    {
      name: "FileList",
      description: "Renders a list. Also accepts native ul attributes; pass aria-label to name it.",
      props: [
        { prop: "files", type: "FileListItem[]", description: "The rows, in order." },
        { prop: "onRemove", type: "(id: string) => void", description: "Shows a remove button on every row (labelled Cancel while uploading)." },
        { prop: "onRetry", type: "(id: string) => void", description: "Shows a retry button on rows that failed." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex for the progress tubes." },
      ],
    },
    {
      name: "FileListItem",
      props: [
        { prop: "id", type: "string", description: "Unique id, also the React key." },
        { prop: "name", type: "string", description: "File name. The icon falls back to its extension." },
        { prop: "size", type: "number", description: "Size in bytes." },
        { prop: "type", type: "string", description: "MIME type, used to pick the icon." },
        { prop: "progress", type: "number", description: "0 to 100." },
        { prop: "status", type: '"queued" | "uploading" | "done" | "error"', description: "Drives the tube, the status text and the actions." },
        { prop: "error", type: "ReactNode", default: '"Upload failed"', description: "Shown in place of the status when it failed." },
      ],
    },
    {
      name: "formatBytes",
      description: "The size formatter the list uses, exported for your own copy.",
      props: [{ prop: "bytes", type: "number", description: 'Returns "2.4 MB", "512 KB" or "18 B".' }],
    },
  ],
  notes: [
    "The zone is a role=\"button\": Enter and Space open the system file picker, which is a hidden native file input.",
    "Focus the zone and paste to add files from the clipboard.",
    "A polite live region announces how many files were added and why any were refused. The list announces finished and failed uploads, not every progress tick.",
    "Each row's progress tube is a role=\"progressbar\" named after the file.",
    "The border is drawn in SVG with the dash period fitted to the perimeter, so the loop has no seam. Marching and the drop bloom turn off with reduced motion.",
  ],
};
