"use client";

import * as React from "react";
import { ChevronsUpDown } from "@/components/ui/icons";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const roles = [
  { value: "viewer", label: "Viewer", detail: "Can comment, can't deploy" },
  { value: "member", label: "Member", detail: "Deploys previews" },
  { value: "admin", label: "Admin", detail: "Deploys to production, manages billing" },
];

const field =
  "h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-white/90 outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-white/30 focus:border-[rgb(var(--neon)/0.6)] focus:shadow-[0_0_0_3px_rgb(var(--neon)/0.15)]";

export default function DialogDemo() {
  const [open, setOpen] = React.useState(false);
  const [role, setRole] = React.useState("member");
  const current = roles.find((option) => option.value === role) ?? roles[0];

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
            <div className="grid gap-1.5">
              <span id="profile-role" className="text-xs font-medium text-white/55">
                Workspace role
              </span>
              {/* A menu inside a dialog renders into the dialog, so it stays above the backdrop. */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-labelledby="profile-role profile-role-value"
                  className={`${field} flex items-center justify-between gap-3 text-left`}
                >
                  <span id="profile-role-value" className="truncate">
                    {current.label}
                    <span className="text-white/40"> · {current.detail}</span>
                  </span>
                  <ChevronsUpDown aria-hidden className="size-4 shrink-0 text-white/40" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[var(--menu-trigger-width)]">
                  <DropdownMenuRadioGroup value={role} onValueChange={setRole}>
                    {roles.map((option) => (
                      <DropdownMenuRadioItem key={option.value} value={option.value}>
                        <span className="grid">
                          <span>{option.label}</span>
                          <span className="text-xs text-white/50">{option.detail}</span>
                        </span>
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
