"use client";

import * as React from "react";
import { Copy, MailOpen, Pin, Reply, Trash2 } from "@/components/ui/icons";
import { Avatar } from "@/components/ui/avatar";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

const thread = [
  { id: "m1", author: "Mara Okafor", time: "09:12", text: "Preview for the pricing page is up. The plan cards finally line up on mobile." },
  { id: "m2", author: "Jonas Weber", time: "09:15", text: "Looks great. Can we ship it behind the flag first and watch conversion for a day?" },
  { id: "m3", author: "Priya Raman", time: "09:21", text: "Flag is on for 10% of traffic. I'll post numbers after lunch." },
];

export default function ContextMenuMessages() {
  const [messages, setMessages] = React.useState(thread);
  const [pinned, setPinned] = React.useState<string | null>("m3");

  return (
    <div className="w-full max-w-md rounded-xl border border-white/10 bg-white/[0.02] p-2">
      {messages.map((message) => (
        <ContextMenu key={message.id}>
          <ContextMenuTrigger asChild>
            <article
              tabIndex={0}
              aria-label={`${message.author} at ${message.time}`}
              className="flex select-none gap-3 rounded-lg p-2.5 outline-none transition-colors duration-150 hover:bg-white/[0.03] focus-visible:bg-white/[0.04] focus-visible:ring-1 focus-visible:ring-[rgb(var(--neon)/0.5)] data-[state=open]:bg-white/[0.04]"
            >
              <Avatar alt={message.author} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-xs">
                  <span className="font-medium text-white/85">{message.author}</span>
                  <time className="text-white/35">{message.time}</time>
                  {pinned === message.id && (
                    <Pin aria-label="Pinned" className="size-3 text-[rgb(var(--neon))]" />
                  )}
                </p>
                <p className="mt-0.5 text-sm leading-5 text-white/70">{message.text}</p>
              </div>
            </article>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-52" aria-label="Message actions">
            <ContextMenuItem icon={<Reply />} shortcut="R">
              Reply
            </ContextMenuItem>
            <ContextMenuItem
              icon={<Copy />}
              shortcut="⌘C"
              onSelect={() => navigator.clipboard?.writeText(message.text).catch(() => {})}
            >
              Copy text
            </ContextMenuItem>
            <ContextMenuItem icon={<MailOpen />} shortcut="U">
              Mark unread
            </ContextMenuItem>
            <ContextMenuCheckboxItem
              checked={pinned === message.id}
              onCheckedChange={(checked) => setPinned(checked ? message.id : null)}
            >
              Pin to thread
            </ContextMenuCheckboxItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              variant="danger"
              icon={<Trash2 />}
              onSelect={() => setMessages((current) => current.filter((entry) => entry.id !== message.id))}
            >
              Delete message
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      ))}
      {messages.length === 0 && (
        <button
          type="button"
          onClick={() => setMessages(thread)}
          className="w-full rounded-lg p-4 text-sm text-white/50 outline-none hover:text-white/70 focus-visible:ring-1 focus-visible:ring-[rgb(var(--neon)/0.5)]"
        >
          Thread cleared. Bring it back
        </button>
      )}
    </div>
  );
}
