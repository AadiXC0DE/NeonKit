"use client";

import * as React from "react";
import { GitBranch, GitPullRequest, Rocket, Tag } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

const refs = [
  { value: "main", label: "main", icon: <GitBranch />, description: "Production · deployed 2 hours ago" },
  { value: "release/2.4", label: "release/2.4", icon: <GitBranch />, description: "Release candidate" },
  { value: "feat/otp-input", label: "feat/otp-input", icon: <GitPullRequest />, description: "#128 · Preview ready" },
  { value: "fix/select-typeahead", label: "fix/select-typeahead", icon: <GitPullRequest />, description: "#131 · Checks failing", disabled: true },
  { value: "v2.3.1", label: "v2.3.1", icon: <Tag />, description: "Tag · last stable" },
];

export default function SelectDeployBranch() {
  const [status, setStatus] = React.useState("");

  function deploy(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const branch = new FormData(event.currentTarget).get("branch");
    setStatus(`Queued ${branch} for production.`);
  }

  return (
    <form onSubmit={deploy} className="grid w-full max-w-sm gap-2">
      <div className="flex items-end gap-2">
        <Select
          name="branch"
          label="Deploy branch"
          options={refs}
          defaultValue="main"
          onValueChange={() => setStatus("")}
          containerClassName="flex-1"
        />
        <Button type="submit" variant="solid">
          <Rocket /> Deploy
        </Button>
      </div>
      <p aria-live="polite" className="h-5 text-xs leading-5 text-white/55">
        {status}
      </p>
    </form>
  );
}
