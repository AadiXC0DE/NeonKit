"use client";

import * as React from "react";
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

const slots = ["Today, 18:00–20:00", "Tomorrow, 08:00–10:00", "Tomorrow, 12:00–14:00", "Friday, 18:00–20:00"];

export default function DrawerNested() {
  const [slot, setSlot] = React.useState(slots[0]);
  const [picking, setPicking] = React.useState(false);

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Order #4821</Button>
      </DrawerTrigger>
      <DrawerContent className="sm:max-w-md">
        <DrawerHeader>
          <DrawerTitle>Order #4821</DrawerTitle>
          <DrawerDescription>3 items from Mercearia Lisboa · €42.60</DrawerDescription>
        </DrawerHeader>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
          <dt className="text-white/55">Delivery</dt>
          <dd className="text-right text-white/85">{slot}</dd>
          <dt className="text-white/55">Address</dt>
          <dd className="text-right text-white/85">Rua da Prata 112, 3º</dd>
          <dt className="text-white/55">Courier</dt>
          <dd className="text-right text-white/85">Assigned an hour before</dd>
        </dl>
        <DrawerFooter>
          <Drawer open={picking} onOpenChange={setPicking}>
            <DrawerTrigger asChild>
              <Button variant="outline">Change delivery time</Button>
            </DrawerTrigger>
            <DrawerContent className="sm:max-w-md">
              <DrawerHeader>
                <DrawerTitle>Delivery time</DrawerTitle>
                <DrawerDescription>Slots open until 2 hours before they start.</DrawerDescription>
              </DrawerHeader>
              <div role="radiogroup" aria-label="Delivery slot" className="grid gap-1.5">
                {slots.map((option) => (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={option === slot}
                    onClick={() => {
                      setSlot(option);
                      setPicking(false);
                    }}
                    className={
                      option === slot
                        ? "rounded-lg border border-[rgb(var(--neon-accent,34_211_238)/0.5)] bg-[rgb(var(--neon-accent,34_211_238)/0.08)] px-3.5 py-3 text-left text-sm text-white outline-none"
                        : "rounded-lg border border-white/[0.08] px-3.5 py-3 text-left text-sm text-white/75 outline-none hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon-accent,34_211_238)/0.6)]"
                    }
                  >
                    {option}
                  </button>
                ))}
              </div>
            </DrawerContent>
          </Drawer>
          <DrawerClose asChild>
            <Button variant="ghost">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
