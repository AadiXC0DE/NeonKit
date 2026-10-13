"use client";

import * as React from "react";
import { GitMerge, Rocket, TriangleAlert } from "@/components/ui/icons";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

const initial = [
  {
    id: "n1",
    icon: TriangleAlert,
    title: "Build failed on main",
    body: "acme-web · Type error in checkout/summary.tsx, line 48. 2 commits since the last green build.",
    time: "2m",
    unread: true,
  },
  {
    id: "n2",
    icon: GitMerge,
    title: "Mei merged #1284",
    body: "Move invoices to the new ledger API. 14 files, +312 −190.",
    time: "1h",
    unread: true,
  },
  {
    id: "n3",
    icon: Rocket,
    title: "Production deploy finished",
    body: "dpl_8f2k1 is live in fra1, iad1 and sfo1. Built in 41s.",
    time: "3h",
    unread: false,
  },
];

export default function ItemNotifications() {
  const [items, setItems] = React.useState(initial);
  const unread = items.filter((item) => item.unread).length;

  return (
    <div className="min-w-0 w-full max-w-xl">
      <div className="flex items-baseline justify-between px-1 pb-3">
        <h3 className="text-[15px] font-semibold text-white/90">Notifications</h3>
        <span className="text-[13px] tabular-nums text-white/55">{unread ? `${unread} unread` : "All read"}</span>
      </div>
      <ItemGroup className="gap-2">
        {items.map(({ id, icon: Icon, title, body, time, unread: isUnread }) => (
          <Item
            key={id}
            asChild
            variant="outline"
            active={isUnread}
          >
            <button
              type="button"
              onClick={() => setItems((list) => list.map((item) => (item.id === id ? { ...item, unread: false } : item)))}
            >
              <ItemMedia variant="icon" className="self-start">
                <Icon />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>
                  <span>{title}</span>
                  <span className="ml-auto shrink-0 text-xs font-normal tabular-nums text-white/50">{time}</span>
                </ItemTitle>
                <ItemDescription>{body}</ItemDescription>
              </ItemContent>
            </button>
          </Item>
        ))}
      </ItemGroup>
    </div>
  );
}
