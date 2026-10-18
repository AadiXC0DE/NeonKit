"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";

export default function ColorPickerInAForm() {
  const [saved, setSaved] = React.useState("");

  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const accent = String(new FormData(event.currentTarget).get("accent"));
    setSaved(`Saved ${accent.toUpperCase()} as the workspace accent.`);
  }

  return (
    <form onSubmit={save} className="grid w-full max-w-[18rem] gap-3">
      <ColorPicker name="accent" label="Workspace accent" defaultValue="#4f8bff" onValueChange={() => setSaved("")} />
      <Button type="submit" variant="solid" className="w-full">
        Save theme
      </Button>
      <p aria-live="polite" className="min-h-5 text-xs leading-5 text-white/55">
        {saved}
      </p>
    </form>
  );
}
