"use client";

import { Textarea } from "@/components/textarea";

export default function BasicTextareas() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
      <Textarea placeholder="Default textarea..." label="Default" rows={3} />
      <Textarea
        variant="filled"
        placeholder="Filled textarea..."
        label="Filled"
        rows={3}
      />
      <Textarea
        variant="ghost"
        placeholder="Ghost textarea..."
        label="Ghost"
        rows={3}
      />
    </div>
  );
}
