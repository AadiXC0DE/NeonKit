"use client";

import * as React from "react";
import { Send, X } from "@/components/ui/icons";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import type { Member, Role } from "../data";
import type { SettingsState } from "./model";
import { Panel, Section } from "./section";

const ROLES: { value: Role; label: string; description: string }[] = [
  { value: "Admin", label: "Admin", description: "Billing, members and every project" },
  { value: "Developer", label: "Developer", description: "Deploy, roll back, edit env vars" },
  { value: "Viewer", label: "Viewer", description: "Read logs and dashboards" },
];
const SEATS = 10;

export function MembersTab({
  members,
  draft,
  set,
  onInvite,
  onRevoke,
}: {
  members: Member[];
  draft: SettingsState;
  set: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
  onInvite: (email: string, role: Role) => void;
  onRevoke: (id: string) => void;
}) {
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<Role>("Developer");
  const [error, setError] = React.useState<string | undefined>();
  const full = members.length >= SEATS;

  // Not a <form>: this sits inside the settings form, and forms can't nest. Enter in the field still sends.
  function invite() {
    const value = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return setError("Enter an email like sam@marlow.dev.");
    if (members.some((m) => m.email === value)) return setError(`${value} is already on the team.`);
    if (full) return setError(`All ${SEATS} seats are taken. Add seats on the Billing tab.`);
    onInvite(value, role);
    setEmail("");
    setError(undefined);
    toast.success("Invite sent", { description: `${value} joins as ${role.toLowerCase()} once they accept.` });
  }

  return (
    <>
      <Section id="s-invite" title="Invite" description={`${members.length} of ${SEATS} seats in use. Invites expire after seven days.`}>
        <Panel>
          <div role="group" aria-label="Invite a teammate" className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_170px_auto] sm:items-start">
            <Input
              id="invite-email"
              type="email"
              label="Email address"
              placeholder="sam@marlow.dev"
              autoComplete="off"
              value={email}
              error={error}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(undefined);
              }}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                e.preventDefault();
                invite();
              }}
            />
            <Select label="Role" options={ROLES} value={role} onValueChange={(v) => setRole(v as Role)} />
            <Button type="button" variant="soft" className="sm:mt-[26px]" onClick={invite}>
              <Send aria-hidden />
              Send invite
            </Button>
          </div>
        </Panel>
      </Section>

      <Section id="s-members" title="Members" description="Role changes apply when you save. Only the owner can transfer ownership.">
        <ul className="-mt-3.5 max-w-[640px] divide-y divide-white/[0.06]">
          {members.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 py-3.5 sm:flex-nowrap">
              <Avatar alt="" fallback={initials(m.name)} size="md" status={m.lastActive === "Now" ? "online" : undefined} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm text-white/90">
                  <span className="truncate">{m.name}</span>
                  {m.pending && (
                    <Badge size="sm" variant="outline">
                      Invited
                    </Badge>
                  )}
                  {m.lastActive === "Now" && <span className="text-xs text-white/55">(you)</span>}
                </p>
                <p className="truncate text-xs text-white/60">{m.email}</p>
              </div>
              <p className="hidden w-24 shrink-0 text-right text-xs text-white/55 md:block">{m.pending ? "Pending" : m.lastActive}</p>
              <div className="flex w-full items-center gap-1.5 pl-[52px] sm:w-auto sm:pl-0">
                {m.role === "Owner" ? (
                  <span className="inline-flex h-8 w-[150px] items-center rounded-md border border-white/[0.06] px-3 text-xs text-white/60">Owner</span>
                ) : (
                  <Select
                    size="sm"
                    aria-label={`Role for ${m.name}`}
                    options={ROLES}
                    value={draft.roles[m.id]}
                    onValueChange={(v) => set("roles", { ...draft.roles, [m.id]: v as Role })}
                    containerClassName="w-[150px]"
                  />
                )}
                {m.pending ? (
                  <Button variant="ghost" size="sm" aria-label={`Revoke invite for ${m.email}`} className="size-8 px-0" onClick={() => onRevoke(m.id)}>
                    <X aria-hidden />
                  </Button>
                ) : (
                  <span aria-hidden className="hidden size-8 sm:block" />
                )}
              </div>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}

function initials(name: string) {
  return name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
