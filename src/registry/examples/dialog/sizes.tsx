"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const SHARE_URL = "https://acme.dev/docs/q4-launch-plan";

const changes = [
  { title: "Preview comments", body: "Leave feedback on preview deployments, pinned to the element." },
  { title: "Faster cold starts", body: "Functions now boot 40% faster in every region." },
  { title: "Audit log export", body: "Download every workspace event from the last 90 days as CSV." },
  { title: "Custom roles", body: "Decide exactly what Viewers, Editors and Billing admins can change." },
];

function CopyLink() {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(SHARE_URL);
    } catch {
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <Button size="sm" variant="soft" onClick={copy} className="w-[84px]">
      {copied ? "Copied" : "Copy link"}
    </Button>
  );
}

export default function DialogSizes() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm">Small</Button>
        </DialogTrigger>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Sign out everywhere?</DialogTitle>
            <DialogDescription>
              You&apos;ll be signed out on 3 other devices, including the MacBook in Lisbon.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button variant="solid">Sign out</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm">Medium</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share “Q4 launch plan”</DialogTitle>
            <DialogDescription>Anyone at Acme with the link can comment.</DialogDescription>
          </DialogHeader>
          <div className="mt-5 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] py-1 pl-3 pr-1">
            <span className="min-w-0 flex-1 truncate font-mono text-xs text-white/70">{SHARE_URL}</span>
            <CopyLink />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Done</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm">Large</Button>
        </DialogTrigger>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>What&apos;s new in 2.4</DialogTitle>
            <DialogDescription>Released October 9 · 4 changes</DialogDescription>
          </DialogHeader>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {changes.map((change) => (
              <li key={change.title} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm font-medium text-white/90">{change.title}</p>
                <p className="mt-1 text-sm leading-6 text-white/55">{change.body}</p>
              </li>
            ))}
          </ul>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="solid">Got it</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
