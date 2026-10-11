"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";

const channels = [
  { value: "email", label: "Email" },
  { value: "push", label: "Push notifications" },
  { value: "sms", label: "Text message" },
];

export default function CheckboxSelectAll() {
  const id = React.useId();
  const [selected, setSelected] = React.useState<string[]>(["email", "push"]);

  const all = selected.length === channels.length;
  const some = selected.length > 0 && !all;

  function toggle(value: string, checked: boolean) {
    setSelected((current) =>
      checked ? [...current, value] : current.filter((item) => item !== value),
    );
  }

  return (
    <fieldset className="w-full max-w-xs">
      <legend className="mb-4 text-sm text-white/55">Notify me about mentions by</legend>
      <Checkbox
        checked={all}
        indeterminate={some}
        onCheckedChange={(checked) => setSelected(checked ? channels.map((c) => c.value) : [])}
        aria-controls={channels.map((c) => `${id}-${c.value}`).join(" ")}
        label="All channels"
      />
      <div className="mt-3 flex flex-col gap-3 pl-8">
        {channels.map((channel) => (
          <Checkbox
            key={channel.value}
            id={`${id}-${channel.value}`}
            checked={selected.includes(channel.value)}
            onCheckedChange={(checked) => toggle(channel.value, checked)}
            label={channel.label}
          />
        ))}
      </div>
    </fieldset>
  );
}
