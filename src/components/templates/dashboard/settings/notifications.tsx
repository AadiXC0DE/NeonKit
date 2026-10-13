"use client";

import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { NOTIFY, type SettingsState } from "./model";
import { Panel, Section } from "./section";

const CHANNELS = [
  { value: "both", label: "Email and in-app" },
  { value: "app", label: "In-app only" },
  { value: "digest", label: "Daily digest at 09:00" },
];

export function NotificationsTab({
  draft,
  set,
}: {
  draft: SettingsState;
  set: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
}) {
  return (
    <>
      <Section id="s-alerts" title="Alerts" description="Just for you. Teammates choose their own in their settings.">
        <Panel className="-mt-4 divide-y divide-white/[0.06]">
          {NOTIFY.map((n) => (
            <Field key={n.key} orientation="horizontal" label={n.label} description={n.description} className="py-4">
              <Switch checked={draft.notify[n.key]} onCheckedChange={(on) => set("notify", { ...draft.notify, [n.key]: on })} />
            </Field>
          ))}
        </Panel>
      </Section>
      <Section id="s-delivery" title="Delivery" description="A digest keeps a busy release day from flooding your inbox.">
        <Panel>
          <Select
            label="Send alerts by"
            options={CHANNELS}
            value={draft.channel}
            onValueChange={(v) => set("channel", v)}
            containerClassName="max-w-xs"
          />
        </Panel>
      </Section>
    </>
  );
}
