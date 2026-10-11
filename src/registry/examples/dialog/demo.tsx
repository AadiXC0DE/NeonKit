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

const field =
  "h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-white/90 outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-white/30 focus:border-[rgb(var(--neon)/0.6)] focus:shadow-[0_0_0_3px_rgb(var(--neon)/0.15)]";

export default function DialogDemo() {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Edit profile</Button>
      </DialogTrigger>
      <DialogContent>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setOpen(false);
          }}
        >
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>This is how teammates see you across Acme.</DialogDescription>
          </DialogHeader>

          <div className="mt-6 grid gap-4">
            <label className="grid gap-1.5">
              <span className="text-xs font-medium text-white/55">Name</span>
              <input name="name" defaultValue="Ana Lima" autoComplete="name" className={field} />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-medium text-white/55">Username</span>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-white/30">
                  acme.dev/
                </span>
                <input
                  name="username"
                  defaultValue="ana"
                  autoComplete="username"
                  spellCheck={false}
                  className={`${field} pl-[78px]`}
                />
              </div>
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-medium text-white/55">Role</span>
              <input name="role" defaultValue="Design engineer" className={field} />
            </label>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button type="submit" variant="solid">
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
