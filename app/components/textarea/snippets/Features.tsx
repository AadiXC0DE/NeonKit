"use client";

import { Textarea } from "@/components/textarea";

export default function Features() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
      <Textarea
        variant="neon-cyan"
        placeholder="Normal state..."
        label="Normal State"
        rows={3}
      />
      <Textarea
        variant="neon-destructive"
        error
        helperText="This field is required"
        placeholder="Error state..."
        label="Error State"
        rows={3}
      />
      <Textarea
        variant="neon-success"
        success
        helperText="Valid input!"
        placeholder="Success state..."
        label="Success State"
        rows={3}
      />
      <Textarea
        placeholder="Disabled state..."
        label="Disabled State"
        rows={3}
        disabled
      />
    </div>
  );
}
