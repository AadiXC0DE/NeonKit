"use client";

import * as React from "react";
import { PromptInput, type PromptAttachment, type PromptRejection } from "@/components/ui/prompt-input";

const CHART = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" fill="#0b0d13"/><polyline points="10,70 26,58 40,62 54,40 68,46 86,22" fill="none" stroke="#22d3ee" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
)}`;

const START: PromptAttachment[] = [
  { id: "a1", name: "churn-sept.png", type: "image/png", size: 48_200, url: CHART },
  { id: "a2", name: "cancellations-q3.csv", type: "text/csv", size: 1_183_744 },
  { id: "a3", name: "exit-survey.pdf", type: "application/pdf", size: 312_000 },
];

const reasons: Record<PromptRejection, string> = {
  type: "isn't a PNG, JPG, CSV or PDF",
  size: "is over 10 MB",
  count: "would go past the four-file limit",
};

export default function PromptInputAttachments() {
  const [files, setFiles] = React.useState(START);
  const [notice, setNotice] = React.useState("Paste a screenshot, drop files on the box, or use the clip.");

  return (
    <div className="grid w-full max-w-2xl gap-3">
      <PromptInput
        defaultValue="Why did churn spike in September? The chart and the raw cancellations are attached."
        attachments={files}
        onAttachmentsChange={setFiles}
        accept="image/png,image/jpeg,.csv,.pdf"
        maxFiles={4}
        maxFileSize={10 * 1024 * 1024}
        onRejectFiles={(rejected, reason) =>
          setNotice(`${rejected.map((file) => file.name).join(", ")} ${reasons[reason]}.`)
        }
        onSubmit={({ attachments }) => setNotice(`Sent with ${attachments.length} attachments.`)}
      />
      <p aria-live="polite" className="px-1 text-[13px] text-white/50">
        {notice}
      </p>
    </div>
  );
}
