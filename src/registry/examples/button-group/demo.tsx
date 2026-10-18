"use client";

import * as React from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DEPLOYS = 12;

export default function ButtonGroupDemo() {
  const [index, setIndex] = React.useState(3);
  const [target, setTarget] = React.useState("Production");

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <ButtonGroup aria-label="Browse deployments">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Previous deployment"
          disabled={index === 1}
          onClick={() => setIndex((i) => i - 1)}
          className="border border-white/10"
        >
          <ChevronLeft />
        </Button>
        <ButtonGroupText className="min-w-[88px] justify-center tabular-nums text-white/70">
          {index} of {DEPLOYS}
        </ButtonGroupText>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Next deployment"
          disabled={index === DEPLOYS}
          onClick={() => setIndex((i) => i + 1)}
          className="border border-white/10"
        >
          <ChevronRight />
        </Button>
      </ButtonGroup>

      <ButtonGroup aria-label="Promote">
        <Button variant="solid">Promote to {target}</Button>
        <ButtonGroupSeparator />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="solid" size="icon" aria-label="More promote options" className="w-9">
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setTarget("Production")}>Promote to Production</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setTarget("Staging")}>Promote to Staging</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Schedule for later…</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
    </div>
  );
}
