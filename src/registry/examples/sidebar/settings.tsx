"use client";

import * as React from "react";
import { Bell, CreditCard, KeyRound, Puzzle, ShieldCheck, UserRound, UsersRound, Webhook } from "@/components/ui/icons";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarInset,
  SidebarItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const sections = {
  profile: {
    label: "Profile",
    icon: <UserRound />,
    rows: [
      ["Display name", "Mira Okafor"],
      ["Email", "mira@lumenlabs.dev"],
      ["Timezone", "Europe/London"],
    ],
  },
  notifications: {
    label: "Notifications",
    icon: <Bell />,
    rows: [
      ["Failed deploys", "Email and in-app"],
      ["Mentions", "In-app"],
      ["Weekly report", "Off"],
    ],
  },
  security: {
    label: "Security",
    icon: <ShieldCheck />,
    rows: [
      ["Passkeys", "2 registered"],
      ["Two-factor", "On"],
      ["Sessions", "3 active"],
    ],
  },
  billing: {
    label: "Billing",
    icon: <CreditCard />,
    rows: [
      ["Plan", "Pro trial, 9 days left"],
      ["Payment", "Visa ending 4242"],
      ["Invoices", "Monthly, by email"],
    ],
  },
  members: {
    label: "Members",
    icon: <UsersRound />,
    rows: [
      ["Members", "8"],
      ["Pending invites", "2"],
      ["Default role", "Developer"],
    ],
  },
  integrations: {
    label: "Integrations",
    icon: <Puzzle />,
    rows: [
      ["GitHub", "lumenlabs"],
      ["Slack", "#deploys"],
      ["Linear", "Not connected"],
    ],
  },
  tokens: {
    label: "API tokens",
    icon: <KeyRound />,
    rows: [
      ["ci-deploy", "Used 2 hours ago"],
      ["local-scripts", "Never used"],
    ],
  },
  webhooks: {
    label: "Webhooks",
    icon: <Webhook />,
    rows: [
      ["deploy.succeeded", "hooks.lumenlabs.dev"],
      ["deploy.failed", "hooks.lumenlabs.dev"],
    ],
  },
};

type Section = keyof typeof sections;

export default function SidebarSettings() {
  const [active, setActive] = React.useState<Section>("profile");
  const section = sections[active];

  const item = (id: Section, badge?: React.ReactNode) => (
    <SidebarItem icon={sections[id].icon} badge={badge} active={active === id} onClick={() => setActive(id)}>
      {sections[id].label}
    </SidebarItem>
  );

  return (
    <SidebarProvider
      shortcut={false}
      className="h-[420px] w-full max-w-3xl overflow-hidden rounded-xl border border-white/10 bg-[#05060a]"
    >
      <Sidebar collapsible="none">
        <SidebarContent aria-label="Settings">
          <SidebarGroup label="Account">
            {item("profile")}
            {item("notifications")}
            {item("security")}
            {item("billing", "Trial")}
          </SidebarGroup>
          <SidebarGroup label="Workspace">
            {item("members", 8)}
            {item("integrations")}
            {item("tokens")}
            {item("webhooks")}
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="overflow-y-auto px-6 py-5">
        <div className="flex items-center gap-2">
          {/* The sidebar is a drawer below md, so the trigger only shows there. */}
          <SidebarTrigger className="-ml-2 md:hidden" />
          <h3 className="text-base font-medium text-white/90">{section.label}</h3>
        </div>
        <dl className="mt-4 grid max-w-md">
          {section.rows.map(([term, value]) => (
            <div key={term} className="flex items-baseline justify-between gap-4 border-b border-white/[0.06] py-3 text-sm">
              <dt className="text-white/55">{term}</dt>
              <dd className="truncate text-right text-white/85">{value}</dd>
            </div>
          ))}
        </dl>
      </SidebarInset>
    </SidebarProvider>
  );
}
