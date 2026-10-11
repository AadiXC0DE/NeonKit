"use client";

import * as React from "react";
import { neonColors, type NeonColorName } from "@/lib/neon";
import { Combobox } from "@/components/ui/combobox";

type Label = { value: string; label: string; color: NeonColorName };

const palette: NeonColorName[] = ["violet", "amber", "green", "pink", "blue", "orange"];

const initialLabels: Label[] = [
  { value: "bug", label: "bug", color: "red" },
  { value: "a11y", label: "a11y", color: "violet" },
  { value: "performance", label: "performance", color: "amber" },
  { value: "design-review", label: "design review", color: "pink" },
  { value: "good-first-issue", label: "good first issue", color: "green" },
  { value: "docs", label: "docs", color: "blue" },
];

function Dot({ color }: { color: NeonColorName }) {
  const rgb = neonColors[color];
  return (
    <span
      aria-hidden
      className="mx-1 size-2 rounded-full"
      style={{ background: `rgb(${rgb})`, boxShadow: `0 0 8px rgb(${rgb} / 0.7)` }}
    />
  );
}

export default function ComboboxCreatable() {
  const [labels, setLabels] = React.useState(initialLabels);
  const [value, setValue] = React.useState(["bug", "a11y"]);

  return (
    <Combobox
      multiple
      creatable
      label="Labels"
      placeholder="Add a label"
      description="Type a name that doesn't exist yet to create it."
      containerClassName="max-w-sm"
      options={labels.map((item) => ({ value: item.value, label: item.label, icon: <Dot color={item.color} /> }))}
      value={value}
      onValueChange={setValue}
      onCreate={(name) => {
        const slug = name.trim().toLowerCase().replace(/\s+/g, "-");
        setLabels((current) => [
          ...current,
          { value: slug, label: name.trim().toLowerCase(), color: palette[current.length % palette.length] },
        ]);
        return slug;
      }}
    />
  );
}
