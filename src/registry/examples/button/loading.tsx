"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

export default function ButtonLoading() {
  const [saving, setSaving] = React.useState(false);

  function save() {
    setSaving(true);
    setTimeout(() => setSaving(false), 1800);
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button variant="ghost" disabled={saving}>
        Discard
      </Button>
      <Button variant="solid" color="lime" loading={saving} onClick={save}>
        Save changes
      </Button>
      <Button disabled>Publish</Button>
    </div>
  );
}
