"use client";

import * as React from "react";
import { Check, Copy } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const url = "https://neonkit.heyaadi.com/r/tabs.json";

const commands = [
  { manager: "npm", command: `npx shadcn@latest add ${url}` },
  { manager: "pnpm", command: `pnpm dlx shadcn@latest add ${url}` },
  { manager: "yarn", command: `yarn dlx shadcn@latest add ${url}` },
  { manager: "bun", command: `bunx --bun shadcn@latest add ${url}` },
];

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = React.useState(false);

  function copy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={copy}
      aria-label={copied ? "Copied" : "Copy command"}
      className="size-7 shrink-0 px-0"
    >
      {copied ? <Check /> : <Copy />}
    </Button>
  );
}

export default function TabsInstall() {
  return (
    <Tabs variant="underline" defaultValue="npm" className="w-full max-w-2xl gap-0 rounded-xl border border-white/10 bg-[#0a0b11]">
      <TabsList className="px-4">
        {commands.map(({ manager }) => (
          <TabsTrigger key={manager} value={manager} className="font-mono text-[13px]">
            {manager}
          </TabsTrigger>
        ))}
      </TabsList>
      {commands.map(({ manager, command }) => (
        <TabsContent key={manager} value={manager} className="flex items-center gap-3 rounded-b-xl py-3 pl-4 pr-2.5">
          <span aria-hidden className="select-none font-mono text-[13px] text-white/25">
            $
          </span>
          {/* Scrolls sideways on narrow screens; the fade says there's more. */}
          <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap pr-6 font-mono text-[13px] text-white/80 [mask-image:linear-gradient(to_right,black_calc(100%-24px),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {command}
          </code>
          <CopyButton value={command} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
