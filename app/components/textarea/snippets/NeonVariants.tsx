"use client";

import { Textarea } from "@/components/textarea";

export default function NeonVariants() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
      <Textarea
        variant="neon-destructive"
        placeholder="Error textarea..."
        label="Destructive"
        rows={3}
      />
      <Textarea
        variant="neon-success"
        placeholder="Success textarea..."
        label="Success"
        rows={3}
      />
      <Textarea
        variant="neon-warning"
        placeholder="Warning textarea..."
        label="Warning"
        rows={3}
      />
      <Textarea
        variant="neon-cyan"
        maxLength={100}
        showCount
        placeholder="Type to see character count..."
        label="With Character Count"
        rows={3}
      />
    </div>
  );
}
