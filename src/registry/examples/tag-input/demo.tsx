"use client";

import * as React from "react";
import { UserPlus } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { TagInput } from "@/components/ui/tag-input";

const email = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateEmail(tag: string) {
  if (!tag.includes("@")) return `“${tag}” needs an @ and a domain.`;
  if (!email.test(tag)) return `“${tag}” isn’t a complete email address.`;
  return true;
}

export default function TagInputDemo() {
  const [recipients, setRecipients] = React.useState(["maya@lumen.dev", "ines@lumen.dev"]);
  const [sent, setSent] = React.useState("");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSent(`Sent ${recipients.length} ${recipients.length === 1 ? "invite" : "invites"}.`);
        setRecipients([]);
      }}
      className="grid w-full max-w-md gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-5"
    >
      <div className="grid gap-1">
        <h3 className="text-sm font-medium text-white/90">Invite to Lumen Labs</h3>
        <p className="text-sm text-white/55">Invites expire after 7 days.</p>
      </div>
      <TagInput
        label="To"
        name="recipients"
        placeholder="name@company.com"
        description="Separate addresses with commas, or paste a list."
        max={10}
        validate={validateEmail}
        value={recipients}
        onValueChange={(next) => {
          setRecipients(next);
          setSent("");
        }}
      />
      <div className="flex items-center justify-between gap-3">
        <p aria-live="polite" className="text-xs text-white/55">
          {sent}
        </p>
        <Button type="submit" variant="solid" size="sm" disabled={!recipients.length}>
          <UserPlus />
          {recipients.length
            ? `Send ${recipients.length} ${recipients.length === 1 ? "invite" : "invites"}`
            : "Send invites"}
        </Button>
      </div>
    </form>
  );
}
