"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { team } from "../config";
import { FRAMEWORKS, REGIONS, type Framework, type Project, type RegionCode } from "../data";

const EMPTY = { name: "", repo: "", framework: "Next.js" as Framework, region: "iad" as RegionCode };
type Errors = Partial<Record<"name" | "repo", string>>;

export function NewProjectDialog({
  open,
  onOpenChange,
  taken,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taken: string[];
  onCreate: (project: Project) => void;
}) {
  const [draft, setDraft] = React.useState(EMPTY);
  const [errors, setErrors] = React.useState<Errors>({});
  const [busy, setBusy] = React.useState(false);
  const timer = React.useRef<number | undefined>(undefined);

  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  const change = (open: boolean) => {
    if (!open) {
      setDraft(EMPTY);
      setErrors({});
      setBusy(false);
      window.clearTimeout(timer.current);
    }
    onOpenChange(open);
  };

  function validate() {
    const next: Errors = {};
    const name = draft.name.trim();
    if (!name) next.name = "Give the project a name.";
    else if (!/^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/.test(name)) next.name = "3–32 lowercase letters, numbers or dashes, like “billing-api”.";
    else if (taken.includes(name)) next.name = `${team.name} already has a project called ${name}.`;
    if (!draft.repo.trim()) next.repo = "Which repository should we build from?";
    else if (!/^[\w.-]+\/[\w.-]+$/.test(draft.repo.trim())) next.repo = "Use owner/repository, like marlow/billing-api.";
    return next;
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) {
      const field = next.name ? "np-name" : "np-repo";
      document.getElementById(field)?.focus();
      return;
    }
    setBusy(true);
    timer.current = window.setTimeout(() => {
      const name = draft.name.trim();
      onCreate({
        id: `p-${name}`,
        name,
        domain: `${name}.switchback.app`,
        framework: draft.framework,
        status: "building",
        region: draft.region,
        requests: 0,
        deployedAgo: 0,
        branch: "main",
        repo: draft.repo.trim(),
      });
      change(false);
    }, 800);
  }

  const set = (key: "name" | "repo") => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = key === "name" ? event.target.value.toLowerCase().replace(/\s+/g, "-") : event.target.value;
    setDraft((d) => ({ ...d, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  return (
    <Dialog open={open} onOpenChange={change}>
      <DialogContent size="md">
        <form onSubmit={submit} noValidate>
          <DialogHeader>
            <DialogTitle>New project</DialogTitle>
            <DialogDescription>Point it at a repository and Switchback builds main on every push.</DialogDescription>
          </DialogHeader>
          <div className="mt-6 grid gap-5">
            <Input
              id="np-name"
              label="Project name"
              placeholder="billing-api"
              autoComplete="off"
              spellCheck={false}
              value={draft.name}
              onChange={set("name")}
              error={errors.name}
              description={draft.name ? `Deploys to ${draft.name}.switchback.app` : "Lowercase, with dashes. It becomes the URL."}
            />
            <Input
              id="np-repo"
              label="Git repository"
              placeholder="marlow/billing-api"
              autoComplete="off"
              spellCheck={false}
              value={draft.repo}
              onChange={set("repo")}
              error={errors.repo}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Select
                label="Framework"
                options={FRAMEWORKS.map((f) => ({ value: f, label: f }))}
                value={draft.framework}
                onValueChange={(v) => setDraft((d) => ({ ...d, framework: v as Framework }))}
              />
              <Select
                label="Primary region"
                options={REGIONS.map((r) => ({ value: r.code, label: `${r.city} · ${r.code}` }))}
                value={draft.region}
                onValueChange={(v) => setDraft((d) => ({ ...d, region: v as RegionCode }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => change(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="solid" loading={busy}>
              {busy ? "Creating…" : "Create and deploy"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
