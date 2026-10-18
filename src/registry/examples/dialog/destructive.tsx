"use client";

import * as React from "react";
import { Trash2 } from "@/components/ui/icons";
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

const PROJECT = "acme-web";

export default function DialogDestructive() {
  const [open, setOpen] = React.useState(false);
  const [confirmation, setConfirmation] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);

  function handleOpenChange(next: boolean) {
    if (next) setConfirmation("");
    setOpen(next);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDeleting(true);
    setTimeout(() => {
      setDeleting(false);
      setOpen(false);
    }, 1200);
  }

  return (
    <Dialog color="red" open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button color="red" variant="soft">
          <Trash2 /> Delete project
        </Button>
      </DialogTrigger>
      <DialogContent size="sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Delete project</DialogTitle>
            <DialogDescription>
              This permanently deletes <span className="text-white/80">{PROJECT}</span>, its 14
              deployments and every environment variable. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>

          <label className="mt-5 grid gap-2">
            <span className="text-xs text-white/55">
              Type <span className="font-mono text-white/80">{PROJECT}</span> to confirm
            </span>
            <input
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 font-mono text-sm text-white/90 outline-none transition-[border-color,box-shadow] duration-150 focus:border-[rgb(var(--neon)/0.6)] focus:shadow-[0_0_0_3px_rgb(var(--neon)/0.15)]"
            />
          </label>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" color="white">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              variant="solid"
              disabled={confirmation !== PROJECT}
              loading={deleting}
            >
              {deleting ? "Deleting" : "Delete project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
