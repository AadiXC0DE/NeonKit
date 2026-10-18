"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { team } from "../config";
import { MEMBERS, type Member, type Role } from "../data";
import { PageHeader } from "../parts/page-header";
import { SearchParams } from "../parts/search-params";
import { BillingTab } from "./billing";
import { DangerTab } from "./danger";
import { GeneralTab } from "./general";
import { MembersTab } from "./members";
import { INITIAL, TAB_OF, validate, type SettingsErrors, type SettingsState } from "./model";
import { NotificationsTab } from "./notifications";
import { SaveBar } from "./save-bar";

const TABS = [
  { value: "general", label: "General", keys: ["name", "slug", "region", "branch", "previews"] },
  { value: "members", label: "Members", keys: ["roles"] },
  { value: "notifications", label: "Notifications", keys: ["notify", "channel"] },
  { value: "billing", label: "Billing", keys: ["spendCap"] },
  { value: "danger", label: "Danger zone", keys: [] },
] as const satisfies readonly { value: string; label: string; keys: readonly (keyof SettingsState)[] }[];

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

export function Settings() {
  const [tab, setTab] = React.useState("general");
  const [saved, setSaved] = React.useState(INITIAL);
  const [draft, setDraft] = React.useState(INITIAL);
  const [errors, setErrors] = React.useState<SettingsErrors>({});
  const [status, setStatus] = React.useState<"idle" | "saving" | "saved">("idle");
  const [members, setMembers] = React.useState<Member[]>(MEMBERS);
  const timer = React.useRef<number | undefined>(undefined);

  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  const onParams = React.useCallback((params: URLSearchParams) => {
    const next = params.get("tab");
    if (next && TABS.some((t) => t.value === next)) setTab(next);
  }, []);

  const set = React.useCallback(<K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setErrors((e) => (key in e ? { ...e, [key]: undefined } : e));
    setStatus((s) => (s === "saved" ? "idle" : s));
  }, []);

  const changedKeys = (Object.keys(draft) as (keyof SettingsState)[]).flatMap((key) => {
    if (key === "notify" || key === "roles") {
      const a = draft[key] as Record<string, unknown>;
      const b = saved[key] as Record<string, unknown>;
      return Object.keys(a).filter((k) => a[k] !== b[k]).map(() => key);
    }
    return same(draft[key], saved[key]) ? [] : [key];
  });
  const dirty = changedKeys.length > 0;

  function save(event: React.FormEvent) {
    event.preventDefault();
    const next = validate(draft);
    setErrors(next);
    const first = (Object.keys(next) as (keyof SettingsErrors)[]).find((k) => next[k]);
    if (first) {
      setTab(TAB_OF[first]);
      return;
    }
    setStatus("saving");
    timer.current = window.setTimeout(() => {
      setSaved(draft);
      setStatus("saved");
      timer.current = window.setTimeout(() => setStatus("idle"), 2000);
    }, 900);
  }

  function invite(email: string, role: Role) {
    const id = `inv-${email}`;
    const name = email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    setMembers((list) => [...list, { id, name, email, role, lastActive: "", pending: true }]);
    setSaved((s) => ({ ...s, roles: { ...s.roles, [id]: role } }));
    setDraft((d) => ({ ...d, roles: { ...d.roles, [id]: role } }));
  }

  function revoke(id: string) {
    setMembers((list) => list.filter((m) => m.id !== id));
    const drop = (s: SettingsState) => ({ ...s, roles: Object.fromEntries(Object.entries(s.roles).filter(([k]) => k !== id)) });
    setSaved(drop);
    setDraft(drop);
  }

  const marked = (keys: readonly (keyof SettingsState)[]) => keys.some((k) => changedKeys.includes(k));

  return (
    <div className="max-w-[1080px]">
      <SearchParams onChange={onParams} />
      <PageHeader title="Team settings">
        {team.name}&apos;s name, people, alerts and bill. Changes apply to every project on the team once you save.
      </PageHeader>

      <form onSubmit={save} noValidate className="mt-10">
        <Tabs value={tab} onValueChange={setTab} variant="underline" className="gap-6">
          <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
            <TabsList className="min-w-max">
              {TABS.map((t) => (
                <TabsTrigger key={t.value} value={t.value}>
                  {t.label}
                  {marked(t.keys) && (
                    <span className="size-1.5 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_6px_rgb(var(--neon))]">
                      <span className="sr-only">, unsaved changes</span>
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="general" forceMount className="pt-2">
            <GeneralTab draft={draft} errors={errors} set={set} />
          </TabsContent>
          <TabsContent value="members" forceMount className="pt-2">
            <MembersTab members={members} draft={draft} set={set} onInvite={invite} onRevoke={revoke} />
          </TabsContent>
          <TabsContent value="notifications" forceMount className="pt-2">
            <NotificationsTab draft={draft} set={set} />
          </TabsContent>
          <TabsContent value="billing" forceMount className="pt-2">
            <BillingTab draft={draft} errors={errors} seats={members.length} set={set} />
          </TabsContent>
          <TabsContent value="danger" forceMount className="pt-2">
            <DangerTab slug={saved.slug} name={saved.name} />
          </TabsContent>
        </Tabs>

        <SaveBar dirty={dirty} status={status} changes={changedKeys.length} onDiscard={() => { setDraft(saved); setErrors({}); }} />
      </form>
    </div>
  );
}
