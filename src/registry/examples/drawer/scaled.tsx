"use client";

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

export default function DrawerScaled() {
  return (
    <Drawer scaleBackground>
      <DrawerTrigger asChild>
        <Button variant="outline">Pause membership</Button>
      </DrawerTrigger>
      <DrawerContent className="sm:max-w-md">
        <DrawerHeader>
          <DrawerTitle>Pause for up to 3 months</DrawerTitle>
          <DrawerDescription>
            Billing stops on 1 November. Your locker and class bookings are kept, and you can come back early any
            time.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="solid">Pause from 1 November</Button>
          </DrawerClose>
          <DrawerClose asChild>
            <Button variant="ghost">Keep my membership</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
