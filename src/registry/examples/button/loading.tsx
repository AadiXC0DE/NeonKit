"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

export default function ButtonLoading() {
  const [loading, setLoading] = React.useState(false);

  function save() {
    setLoading(true);
    setTimeout(() => setLoading(false), 1800);
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button variant="solid" color="lime" loading={loading} onClick={save}>
        {loading ? "Saving" : "Save changes"}
      </Button>
      <Button disabled>Disabled</Button>
    </div>
  );
}
