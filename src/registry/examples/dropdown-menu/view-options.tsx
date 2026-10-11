"use client";

import * as React from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const toggles = [
  { id: "minimap", label: "Minimap", shortcut: "⌥M" },
  { id: "wrap", label: "Word wrap", shortcut: "⌥Z" },
  { id: "lineNumbers", label: "Line numbers" },
  { id: "whitespace", label: "Render whitespace" },
] as const;

type Toggle = (typeof toggles)[number]["id"];

const densities = [
  { value: "compact", label: "Compact" },
  { value: "comfortable", label: "Comfortable" },
  { value: "spacious", label: "Spacious" },
];

// Keep the menu open so several options can be flipped in one go.
const stayOpen = (event: Event) => event.preventDefault();

export default function DropdownMenuViewOptions() {
  const [view, setView] = React.useState<Record<Toggle, boolean>>({
    minimap: true,
    wrap: false,
    lineNumbers: true,
    whitespace: false,
  });
  const [density, setDensity] = React.useState("comfortable");

  const summary = [
    ...toggles.filter((toggle) => view[toggle.id]).map((toggle) => toggle.label),
    densities.find((option) => option.value === density)?.label,
  ];

  return (
    <div className="flex flex-col items-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm">
            <SlidersHorizontal /> View
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel inset>Editor</DropdownMenuLabel>
            {toggles.map((toggle) => (
              <DropdownMenuCheckboxItem
                key={toggle.id}
                checked={view[toggle.id]}
                onCheckedChange={(checked) => setView((current) => ({ ...current, [toggle.id]: checked }))}
                onSelect={stayOpen}
                shortcut={"shortcut" in toggle ? toggle.shortcut : undefined}
              >
                {toggle.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={density} onValueChange={setDensity}>
            <DropdownMenuLabel inset>Density</DropdownMenuLabel>
            {densities.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value} onSelect={stayOpen}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <p className="max-w-xs text-center text-xs leading-5 text-white/45">{summary.join(" · ")}</p>
    </div>
  );
}
