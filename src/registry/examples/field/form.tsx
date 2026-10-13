"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const roles = [
  { value: "viewer", label: "Viewer", description: "Sees deploys and logs" },
  { value: "developer", label: "Developer", description: "Deploys to preview" },
  { value: "admin", label: "Admin", description: "Manages billing and members" },
];

export default function FieldForm() {
  const [sent, setSent] = React.useState<[string, string][] | null>(null);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSent(Array.from(data.entries(), ([key, value]) => [key, String(value)]));
  }

  return (
    <form
      onSubmit={submit}
      onReset={() => setSent(null)}
      className="grid w-full max-w-sm gap-5"
    >
      <Input name="email" type="email" label="Email" placeholder="maya@northwind.io" required autoComplete="off" />
      <Select name="role" label="Role" placeholder="Choose a role" options={roles} required />
      <Field label="Access" description="Production access needs an admin to approve it.">
        <ToggleGroup name="access" defaultValue="preview">
          <ToggleGroupItem value="preview">Preview</ToggleGroupItem>
          <ToggleGroupItem value="production">Production</ToggleGroupItem>
        </ToggleGroup>
      </Field>
      <DatePicker name="expires" label="Access expires" placeholder="Never" />
      <Field orientation="horizontal" label="Email a welcome guide">
        <Switch name="welcome" defaultChecked />
      </Field>
      <Checkbox name="sso" label="Require single sign-on" description="They can't sign in with a password." />

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button type="reset" variant="ghost" size="sm">
          Reset
        </Button>
        <Button type="submit" variant="solid" size="sm">
          Send invite
        </Button>
      </div>

      <dl aria-live="polite" className="grid min-h-5 gap-1 text-xs">
        {sent?.map(([key, value]) => (
          <div key={key} className="flex justify-between gap-4">
            <dt className="text-white/55">{key}</dt>
            <dd className="truncate font-mono text-white/90">{value || "empty"}</dd>
          </div>
        ))}
      </dl>
    </form>
  );
}
