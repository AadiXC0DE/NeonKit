"use client";

import Link from "next/link";
import { Bell, CheckCheck } from "@/components/ui/icons";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { basePath } from "../config";
import type { Notice } from "../data";

const TONES: Record<Notice["tone"], string> = {
  error: "bg-[rgb(255_77_94)] shadow-[0_0_8px_rgb(255_77_94/0.8)]",
  warning: "bg-[rgb(251_191_36)] shadow-[0_0_8px_rgb(251_191_36/0.7)]",
  info: "bg-[rgb(var(--neon))] shadow-[0_0_8px_rgb(var(--neon)/0.8)]",
};

export function Notifications({
  notices,
  onRead,
  onReadAll,
}: {
  notices: Notice[];
  onRead: (id: string) => void;
  onReadAll: () => void;
}) {
  const unread = notices.filter((n) => n.unread).length;

  return (
    <Popover>
      <PopoverTrigger
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        className="relative inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-white/70 outline-none transition-colors duration-150 hover:bg-white/[0.06] hover:text-white focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] data-[state=open]:bg-white/[0.06] data-[state=open]:text-white"
      >
        <Bell aria-hidden className="size-[18px]" />
        {unread > 0 && (
          <span
            aria-hidden
            className="absolute right-[7px] top-[7px] size-2 rounded-full border-2 border-[#05060a] bg-[rgb(var(--neon))] shadow-[0_0_8px_rgb(var(--neon))]"
          />
        )}
      </PopoverTrigger>
      <PopoverContent align="end" aria-label="Notifications" className="w-[min(380px,calc(100vw-24px))] p-0">
        <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-3">
          <p className="text-sm font-medium text-white/90">
            Notifications
            <span className="ml-2 font-mono text-xs font-normal text-white/55">{unread ? `${unread} new` : "all read"}</span>
          </p>
          <button
            type="button"
            onClick={onReadAll}
            disabled={!unread}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 text-xs text-white/60 outline-none transition-colors duration-150 hover:text-white focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] disabled:cursor-default disabled:opacity-40"
          >
            <CheckCheck aria-hidden className="size-3.5" />
            Mark all read
          </button>
        </div>
        <ul className="max-h-[min(420px,60dvh)] overflow-y-auto py-1.5 [scrollbar-width:thin]">
          {notices.map((notice) => (
            <li key={notice.id}>
              <button
                type="button"
                onClick={() => onRead(notice.id)}
                className="group grid w-full cursor-pointer grid-cols-[10px_minmax(0,1fr)_auto] items-start gap-x-3 px-4 py-2.5 text-left outline-none transition-colors duration-150 hover:bg-white/[0.03] focus-visible:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[rgb(var(--neon)/0.5)]"
              >
                <span aria-hidden className={cn("mt-1.5 size-2 rounded-full transition-opacity", notice.unread ? TONES[notice.tone] : "bg-white/15")} />
                <span className="min-w-0">
                  <span className={cn("block text-[13px] leading-5", notice.unread ? "font-medium text-white" : "text-white/70")}>
                    {notice.title}
                    {notice.unread && <span className="sr-only">, unread</span>}
                  </span>
                  <span className="mt-0.5 block text-xs leading-[18px] text-white/60">{notice.body}</span>
                </span>
                <span className="mt-0.5 font-mono text-[11px] text-white/55">{notice.age}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="border-t border-white/[0.07] px-4 py-2.5">
          <PopoverClose asChild>
            <Link
              href={`${basePath}/settings?tab=notifications`}
              className="text-xs text-white/60 underline-offset-4 outline-none hover:text-white hover:underline focus-visible:text-white focus-visible:underline"
            >
              Choose what you hear about
            </Link>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
}
