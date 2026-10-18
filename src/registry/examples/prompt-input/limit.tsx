"use client";

import * as React from "react";
import { PromptInput } from "@/components/ui/prompt-input";
import { Kbd } from "@/components/ui/kbd";

export default function PromptInputLimit() {
  const [posted, setPosted] = React.useState<string | null>(null);
  return (
    <div className="grid w-full max-w-xl gap-3">
      <PromptInput
        label="Release note"
        placeholder="What changed in this release?"
        defaultValue="Invites now expire after 7 days by default. Set a different window per team in Settings → Members, or turn expiry off for SSO teams."
        counter="characters"
        limit={240}
        minRows={3}
        submitOn="mod-enter"
        allowAttachments={false}
        onSubmit={({ text }) => setPosted(text)}
      />
      <p aria-live="polite" className="px-1 text-[13px] leading-6 text-white/50">
        {posted ? (
          "Posted to #releases."
        ) : (
          <>
            Post with{" "}
            <span className="inline-flex translate-y-[-1px] gap-1 align-middle">
              <Kbd size="sm" listen="Meta">⌘</Kbd>
              <Kbd size="sm" listen="Enter">Enter</Kbd>
            </span>
            . Enter alone adds a line.
          </>
        )}
      </p>
    </div>
  );
}
