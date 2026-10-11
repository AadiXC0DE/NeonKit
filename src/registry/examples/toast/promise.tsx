"use client";

import { Button } from "@/components/ui/button";
import { Toaster, toast } from "@/components/ui/toast";

type Post = { title: string };

function publishPost() {
  return new Promise<Post>((resolve) =>
    setTimeout(() => resolve({ title: "Designing for dark mode" }), 1800),
  );
}

function schedulePost() {
  return new Promise<Post>((_, reject) =>
    setTimeout(() => reject(new Error("Scheduling is available on the Pro plan.")), 1400),
  );
}

export default function ToastPromise() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button
        variant="solid"
        onClick={() => {
          toast.promise(publishPost(), {
            loading: "Publishing…",
            success: (post) => `Published “${post.title}”`,
            error: "Couldn't publish. Try again.",
          });
        }}
      >
        Publish
      </Button>
      <Button
        onClick={() => {
          toast.promise(schedulePost(), {
            loading: "Scheduling for Monday, 9:00…",
            success: "Scheduled",
            error: (error) => (error instanceof Error ? error.message : "Couldn't schedule the post."),
          });
        }}
      >
        Schedule
      </Button>
      <Toaster />
    </div>
  );
}
