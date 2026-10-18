"use client";

import * as React from "react";
import { Check, Copy, Mail, MessageCircle } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export default function DrawerShare() {
  const [copied, setCopied] = React.useState(false);

  return (
    <Drawer onOpenChange={(open) => open && setCopied(false)}>
      <DrawerTrigger asChild>
        <Button variant="outline">Share playlist</Button>
      </DrawerTrigger>
      <DrawerContent className="sm:max-w-md">
        <DrawerHeader>
          <DrawerTitle>Share “Late trains, 1983”</DrawerTitle>
          <DrawerDescription>24 tracks, 1 h 38 min. People with the link can listen without an account.</DrawerDescription>
        </DrawerHeader>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: copied ? "Copied" : "Copy link", icon: copied ? Check : Copy, onClick: () => setCopied(true) },
            { label: "Messages", icon: MessageCircle },
            { label: "Email", icon: Mail },
          ].map(({ label, icon: Icon, onClick }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              className="flex flex-col items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-2 py-4 text-[13px] text-white/75 outline-none transition-colors duration-150 hover:bg-white/[0.05] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon-accent,34_211_238)/0.6)]"
            >
              <Icon className="size-5 text-white/60" aria-hidden />
              {label}
            </button>
          ))}
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="ghost">Done</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
