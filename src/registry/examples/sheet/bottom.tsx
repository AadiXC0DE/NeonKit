"use client";

import * as React from "react";
import { CircleArrowUp, Copy, Ellipsis, ExternalLink, RefreshCw, Trash2 } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const actions = [
  { label: "Visit preview", hint: "acme-web-7f3a2c.acme.app", icon: ExternalLink },
  { label: "Copy URL", icon: Copy },
  { label: "Redeploy", hint: "Uses the build cache", icon: RefreshCw },
  { label: "Promote to production", icon: CircleArrowUp },
  { label: "Delete deployment", icon: Trash2, danger: true },
];

export default function SheetBottom() {
  const [last, setLast] = React.useState<string>();

  return (
    <div className="flex flex-col items-center gap-3">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" className="border border-white/10">
            <Ellipsis /> Deployment actions
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" size="lg" className="mx-auto max-w-lg">
          <SheetHeader>
            <SheetTitle className="font-mono text-[15px]">acme-web-7f3a2c</SheetTitle>
            <SheetDescription>Preview · feat/bottom-sheet · 2 minutes ago</SheetDescription>
          </SheetHeader>
          <ul className="-mx-2 mt-4 grid gap-0.5">
            {actions.map((action) => (
              <li key={action.label}>
                <SheetClose asChild>
                  <button
                    type="button"
                    onClick={() => setLast(action.label)}
                    className={
                      "flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-left text-sm outline-none transition-colors duration-150 hover:bg-white/[0.04] focus-visible:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] " +
                      (action.danger ? "text-[#ff4d5e]" : "text-white/85")
                    }
                  >
                    <action.icon aria-hidden className={action.danger ? "size-4" : "size-4 text-white/50"} />
                    <span className="flex-1">{action.label}</span>
                    {action.hint && <span className="truncate text-xs text-white/35">{action.hint}</span>}
                  </button>
                </SheetClose>
              </li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>
      <p aria-live="polite" className="h-5 text-xs text-white/40">
        {last ? `Picked “${last}”` : "Drag the handle down, or flick it, to dismiss."}
      </p>
    </div>
  );
}
