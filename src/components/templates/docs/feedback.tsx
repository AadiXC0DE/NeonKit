"use client";

import * as React from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";

import { cn } from "@/lib/utils";

import { repoUrl } from "./config";
import { focusRing } from "./styles";

const choices = [
  { value: "yes", label: "Yes", icon: ThumbsUp },
  { value: "no", label: "No", icon: ThumbsDown },
] as const;

export function PageFeedback({ title }: { title: string }) {
  const [answer, setAnswer] = React.useState<"yes" | "no" | null>(null);

  return (
    <div className="flex min-h-9 flex-wrap items-center gap-x-4 gap-y-3 text-sm text-white/60">
      {answer === null ? (
        <>
          <span id="feedback-label">Was this page helpful?</span>
          <div role="group" aria-labelledby="feedback-label" className="flex gap-2">
            {choices.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setAnswer(value)}
                className={cn(
                  "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-white/10 px-3 text-[13px] text-white/70",
                  "transition-[border-color,color,background-color,transform] duration-150 ease-out active:scale-[0.97]",
                  "hover:border-[rgb(var(--neon)/0.5)] hover:bg-[rgb(var(--neon)/0.06)] hover:text-white",
                  focusRing,
                )}
              >
                <Icon aria-hidden className="size-3.5" />
                {label}
              </button>
            ))}
          </div>
        </>
      ) : null}
      <p role="status" className={cn(answer === null && "sr-only")}>
        {answer === "yes" && (
          <>
            <span className="text-[rgb(var(--neon))]">Thanks.</span> Good to know this one landed.
          </>
        )}
        {answer === "no" && (
          <>
            <span className="text-[rgb(var(--neon))]">Thanks.</span> Tell us what was missing in{" "}
            <a
              href={`${repoUrl}/issues/new?title=${encodeURIComponent(`Docs: ${title}`)}`}
              target="_blank"
              rel="noreferrer"
              className={cn(
                "rounded-md text-white underline decoration-[rgb(var(--neon)/0.55)] underline-offset-4 hover:decoration-[rgb(var(--neon))]",
                focusRing,
              )}
            >
              a GitHub issue
            </a>
            .
          </>
        )}
      </p>
    </div>
  );
}
