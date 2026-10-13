"use client";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { REGIONS, type RegionCode } from "../data";
import type { SettingsErrors, SettingsState } from "./model";
import { Panel, Section } from "./section";

export function GeneralTab({
  draft,
  errors,
  set,
}: {
  draft: SettingsState;
  errors: SettingsErrors;
  set: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
}) {
  return (
    <>
      <Section id="s-team" title="Team" description="Shown on invites, invoices and the URL of every preview.">
        <Panel className="grid gap-5">
          <Input id="team-name" label="Team name" autoComplete="organization" value={draft.name} error={errors.name} onChange={(e) => set("name", e.target.value)} />
          <Input
            id="team-slug"
            label="Team URL"
            spellCheck={false}
            autoComplete="off"
            leading={<span className="font-mono text-xs text-white/55">switchback.app/</span>}
            value={draft.slug}
            error={errors.slug}
            description="Changing it keeps the old URL redirecting for 30 days."
            onChange={(e) => set("slug", e.target.value.toLowerCase())}
          />
        </Panel>
      </Section>
      <Section id="s-defaults" title="Deploy defaults" description="New projects start with these. Each project can override them.">
        <Panel className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Select
              label="Default region"
              options={REGIONS.map((r) => ({ value: r.code, label: `${r.city} · ${r.code}` }))}
              value={draft.region}
              onValueChange={(v) => set("region", v as RegionCode)}
            />
            <Input
              id="team-branch"
              label="Production branch"
              spellCheck={false}
              autoComplete="off"
              className="font-mono"
              value={draft.branch}
              error={errors.branch}
              onChange={(e) => set("branch", e.target.value)}
            />
          </div>
          <Field
            orientation="horizontal"
            label="Preview every pull request"
            description="Builds each branch on push and comments the URL on the pull request."
            className="border-t border-white/[0.06] pt-5"
          >
            <Switch checked={draft.previews} onCheckedChange={(on) => set("previews", on)} />
          </Field>
        </Panel>
      </Section>
    </>
  );
}
