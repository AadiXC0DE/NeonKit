"use client";

import * as React from "react";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";

const presets: (ComboboxOption & { build: string; output: string })[] = [
  { value: "nextjs", label: "Next.js", description: "React · App Router", group: "Full-stack", build: "next build", output: ".next" },
  { value: "nuxt", label: "Nuxt", description: "Vue · Nitro server", group: "Full-stack", build: "nuxt build", output: ".output" },
  { value: "sveltekit", label: "SvelteKit", description: "Svelte · Vite", group: "Full-stack", build: "vite build", output: "build" },
  { value: "react-router", label: "React Router", description: "React · Framework mode", group: "Full-stack", build: "react-router build", output: "build" },
  { value: "solidstart", label: "SolidStart", description: "Solid · Vinxi", group: "Full-stack", build: "vinxi build", output: ".output" },
  { value: "astro", label: "Astro", description: "Content sites · Islands", group: "Static", build: "astro build", output: "dist" },
  { value: "vite", label: "Vite", description: "Any SPA", group: "Static", build: "vite build", output: "dist" },
  { value: "eleventy", label: "Eleventy", description: "Templates to HTML", group: "Static", build: "eleventy", output: "_site" },
  { value: "hugo", label: "Hugo", description: "Go templates", group: "Static", build: "hugo", output: "public" },
  { value: "hono", label: "Hono", description: "Edge-ready HTTP", group: "API", build: "tsc", output: "dist" },
  { value: "express", label: "Express", description: "Node.js", group: "API", build: "tsc", output: "dist" },
  { value: "fastapi", label: "FastAPI", description: "Python · Needs a container", group: "API", build: "-", output: "-", disabled: true },
];

export default function ComboboxFramework() {
  const [value, setValue] = React.useState("astro");
  const preset = presets.find((item) => item.value === value);

  return (
    <div className="grid w-full max-w-xs gap-3">
      <Combobox
        label="Framework preset"
        placeholder="Search frameworks"
        options={presets}
        value={value}
        onValueChange={setValue}
      />
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5 font-mono text-xs">
        <dt className="text-white/40">Build</dt>
        <dd className="truncate text-white/80">{preset ? preset.build : "–"}</dd>
        <dt className="text-white/40">Output</dt>
        <dd className="truncate text-white/80">{preset ? preset.output : "–"}</dd>
      </dl>
    </div>
  );
}
