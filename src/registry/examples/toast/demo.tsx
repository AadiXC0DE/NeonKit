"use client";

import { Button } from "@/components/ui/button";
import { Toaster, toast } from "@/components/ui/toast";

export default function ToastDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button
        variant="soft"
        onClick={() => toast("Saved to drafts", { description: "Q4 launch plan · edited just now" })}
      >
        Save draft
      </Button>
      <Button
        variant="soft"
        onClick={() =>
          toast.success("Invite sent to ana@acme.dev", {
            description: "She'll get a link to join the Acme workspace.",
          })
        }
      >
        Send invite
      </Button>
      <Button
        variant="soft"
        onClick={() =>
          toast.error("Deployment failed", {
            description: "Build exited with code 1 on main@4f2a9c1.",
            duration: 8000,
            action: {
              label: "View logs",
              onClick: () => toast.info("Streaming logs for build #1284"),
            },
          })
        }
      >
        Deploy
      </Button>
      <Toaster />
    </div>
  );
}
