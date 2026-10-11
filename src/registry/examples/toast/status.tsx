"use client";

import { Button } from "@/components/ui/button";
import { Toaster, toast } from "@/components/ui/toast";

function upload() {
  const id = toast.loading("Uploading 3 files…");
  setTimeout(() => toast.success("3 files uploaded", { id, description: "Added to Brand assets." }), 2200);
}

const statuses = [
  {
    label: "Success",
    run: () => toast.success("Payment received", { description: "$1,240.00 from Northwind Traders." }),
  },
  {
    label: "Error",
    run: () =>
      toast.error("Card declined", { description: "The card ending in 4242 was declined." }),
  },
  {
    label: "Warning",
    run: () =>
      toast.warning("Storage almost full", { description: "9.2 GB of 10 GB used on the Hobby plan." }),
  },
  {
    label: "Info",
    run: () =>
      toast.info("Scheduled maintenance", {
        description: "The API is read-only Sunday 02:00–02:30 UTC.",
      }),
  },
  { label: "Loading", run: upload },
];

export default function ToastStatus() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {statuses.map(({ label, run }) => (
        <Button key={label} size="sm" variant="ghost" onClick={run}>
          {label}
        </Button>
      ))}
      <Toaster />
    </div>
  );
}
