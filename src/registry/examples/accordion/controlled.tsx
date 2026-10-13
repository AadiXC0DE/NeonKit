"use client";

import * as React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const steps = [
  {
    value: "dependencies",
    title: "1. Install the dependencies",
    body: "Only the packages a component imports. For Accordion that is motion.",
    code: "npm install motion",
  },
  {
    value: "helper",
    title: "2. Add the cn() helper",
    body: "Every component merges classes with clsx and tailwind-merge through a tiny cn() function.",
    code: "npm install clsx tailwind-merge",
  },
  {
    value: "component",
    title: "3. Copy the component",
    body: "Paste the source into components/ui/accordion.tsx, or let the shadcn CLI do it for you.",
    code: "npx shadcn@latest add https://get-neonkit.vercel.app/r/accordion.json",
  },
];

export default function AccordionControlled() {
  const [open, setOpen] = React.useState<string[]>(["dependencies"]);
  const allOpen = open.length === steps.length;

  return (
    <div className="grid w-full max-w-lg gap-3">
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => setOpen(allOpen ? [] : steps.map((step) => step.value))}>
          {allOpen ? "Collapse all" : "Expand all"}
        </Button>
      </div>
      <Accordion type="multiple" value={open} onValueChange={setOpen}>
        {steps.map((step) => (
          <AccordionItem key={step.value} value={step.value}>
            <AccordionTrigger>{step.title}</AccordionTrigger>
            <AccordionContent className="grid gap-3">
              <p>{step.body}</p>
              <code className="block overflow-x-auto whitespace-nowrap rounded-lg border border-white/10 bg-[#0a0b11] px-3 py-2 font-mono text-xs text-white/80">
                {step.code}
              </code>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
