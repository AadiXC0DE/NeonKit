"use client";

import { Textarea } from "@/components/textarea";

export default function NeonTextareas() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
      <Textarea
        variant="neon-cyan"
        placeholder="Neon cyan textarea..."
        label="Cyan Textarea"
        rows={3}
      />
      <Textarea
        variant="neon-purple"
        placeholder="Neon purple textarea..."
        label="Purple Textarea"
        rows={3}
      />
      <Textarea
        variant="neon-chartreuse"
        placeholder="Neon chartreuse textarea..."
        label="Chartreuse Textarea"
        rows={3}
      />
      <Textarea
        variant="neon-pink"
        placeholder="Neon pink textarea..."
        label="Pink Textarea"
        rows={3}
      />
    </div>
  );
}
