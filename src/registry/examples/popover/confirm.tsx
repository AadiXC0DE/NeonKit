"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function PopoverConfirm() {
  const [open, setOpen] = React.useState(false);
  const [deleted, setDeleted] = React.useState(false);

  if (deleted) {
    return (
      <p className="text-sm text-white/55">
        3 previews deleted.{" "}
        <button
          type="button"
          onClick={() => setDeleted(false)}
          className="cursor-pointer text-white/80 underline decoration-white/30 underline-offset-4 hover:decoration-white/70"
        >
          Undo
        </button>
      </p>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button color="red" variant="soft">
          <Trash2 /> Delete previews
        </Button>
      </PopoverTrigger>
      {/* No color here: the panel picks up red from the trigger. */}
      <PopoverContent side="top" arrow className="w-64">
        <p className="font-medium text-white/90">Delete 3 preview deployments?</p>
        <p className="mt-1 text-xs leading-5 text-white/50">
          Their URLs stop working right away. Production isn&apos;t affected.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <PopoverClose asChild>
            <Button size="sm" variant="ghost" color="white">
              Keep
            </Button>
          </PopoverClose>
          <Button
            size="sm"
            variant="solid"
            onClick={() => {
              setOpen(false);
              setDeleted(true);
            }}
          >
            Delete
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
