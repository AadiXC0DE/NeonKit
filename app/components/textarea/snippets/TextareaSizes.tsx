"use client";

import { Textarea } from "@/components/textarea";

export default function TextareaSizes() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      <Textarea
        variant="neon-cyan"
        size="sm"
        placeholder="Small..."
        label="Small"
      />
      <Textarea
        variant="neon-purple"
        size="default"
        placeholder="Default..."
        label="Default"
      />
      <Textarea
        variant="neon-chartreuse"
        size="lg"
        placeholder="Large..."
        label="Large"
      />
      <Textarea
        variant="neon-pink"
        size="xl"
        placeholder="Extra large..."
        label="Extra Large"
      />
    </div>
  );
}
