"use client";

import * as React from "react";
import { CursorGlow } from "@/components/ui/cursor-glow";
import { Switch } from "@/components/ui/switch";

export default function CursorGlowWindow() {
  const [on, setOn] = React.useState(false);

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <Switch label="Light the whole page" checked={on} onCheckedChange={setOn} />
      <p className="max-w-xs text-sm text-white/50">
        With target=&quot;window&quot; the light follows the pointer anywhere on the page.
      </p>
      {on && <CursorGlow target="window" size={520} intensity={0.7} trail />}
    </div>
  );
}
