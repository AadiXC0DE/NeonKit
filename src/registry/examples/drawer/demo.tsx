"use client";

import * as React from "react";
import { PlugZap } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  type SnapPoint,
} from "@/components/ui/drawer";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item";

const SNAPS: SnapPoint[] = [0.4, 0.85];

const stations = [
  { name: "Alfama Riverside", detail: "350 kW · CCS", distance: "0.4 km", free: 3, total: 4 },
  { name: "Praça do Comércio garage", detail: "150 kW · CCS, Type 2", distance: "0.9 km", free: 1, total: 6 },
  { name: "Santa Apolónia station", detail: "50 kW · CHAdeMO, CCS", distance: "1.3 km", free: 0, total: 2 },
  { name: "Lidl Avenida Infante", detail: "22 kW · Type 2", distance: "1.8 km", free: 2, total: 2 },
  { name: "Cais do Sodré P2", detail: "150 kW · CCS", distance: "2.2 km", free: 4, total: 8 },
  { name: "LX Factory", detail: "75 kW · CCS", distance: "3.0 km", free: 1, total: 4 },
  { name: "Belém Cultural Centre", detail: "22 kW · Type 2", distance: "5.6 km", free: 6, total: 10 },
];

export default function DrawerDemo() {
  const [snap, setSnap] = React.useState<SnapPoint | null>(SNAPS[0]);

  return (
    <Drawer snapPoints={SNAPS} activeSnapPoint={snap} onActiveSnapPointChange={setSnap}>
      <DrawerTrigger asChild>
        <Button>Find a charger</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="flex-row items-end justify-between gap-4">
          <div className="grid gap-1">
            <DrawerTitle>Chargers near you</DrawerTitle>
            <DrawerDescription>7 stations within 6 km, sorted by distance.</DrawerDescription>
          </div>
          <span className="shrink-0 pb-1 text-[13px] tabular-nums text-white/55">17 free</span>
        </DrawerHeader>
        <ItemGroup className="-mx-3 gap-0.5">
          {stations.map((station) => (
            <Item key={station.name} size="sm" asChild>
              <button type="button">
                <ItemMedia variant="icon" className="size-9">
                  <PlugZap />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>
                    <span>{station.name}</span>
                  </ItemTitle>
                  <ItemDescription>
                    {station.detail} · {station.distance}
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <span
                    className={
                      station.free
                        ? "text-[13px] tabular-nums text-[rgb(52_211_153)]"
                        : "text-[13px] tabular-nums text-white/40"
                    }
                  >
                    {station.free}/{station.total} free
                  </span>
                </ItemActions>
              </button>
            </Item>
          ))}
        </ItemGroup>
      </DrawerContent>
    </Drawer>
  );
}
