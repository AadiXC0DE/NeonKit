"use client";

import * as React from "react";

import { CopyButton } from "@/components/ui/copy-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { copyText, highlight, type Lang, type TokenKind } from "./highlight";
import { codeFrame } from "./styles";

const tokenClass: Record<TokenKind, string> = {
  plain: "text-white/85",
  prompt: "select-none text-[rgb(var(--neon))]",
  command: "text-white",
  flag: "[color:color-mix(in_srgb,rgb(var(--neon))_40%,white)]",
  string: "[color:color-mix(in_srgb,rgb(var(--neon))_75%,white)]",
  comment: "text-white/50",
  key: "text-white",
  section: "text-[rgb(var(--neon))]",
  value: "[color:color-mix(in_srgb,rgb(var(--neon))_75%,white)]",
  punct: "text-white/55",
  output: "text-white/60",
};

/** Scrolls sideways inside itself, and only joins the tab order when it actually overflows. */
type PreProps = {
  code: string;
  lang: Lang;
  lit?: number[];
  className?: string;
};

function Pre({ code, lang, lit = [], className }: PreProps) {
  const ref = React.useRef<HTMLPreElement>(null);
  const [scrolls, setScrolls] = React.useState(false);
  const lines = highlight(code, lang);

  React.useEffect(() => {
    const pre = ref.current;
    if (!pre) return;
    const measure = () => setScrolls(pre.scrollWidth > pre.clientWidth + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(pre);
    return () => observer.disconnect();
  }, []);

  return (
    <pre
      ref={ref}
      tabIndex={scrolls ? 0 : undefined}
      className={cn(
        "overflow-x-auto py-4 font-mono text-[13px] leading-6 outline-none",
        "[scrollbar-color:rgb(255_255_255/0.15)_transparent] [scrollbar-width:thin]",
        "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[rgb(var(--neon)/0.6)]",
        className,
      )}
    >
      <code className="block w-max min-w-full">
        {lines.map((tokens, index) => (
          <span
            key={index}
            className={cn(
              "block px-4 sm:px-5",
              lit.includes(index + 1) && "bg-[rgb(var(--neon)/0.07)] shadow-[inset_2px_0_0_rgb(var(--neon))]",
            )}
          >
            {tokens.some((token) => token.text) ? (
              tokens.map((token, i) => (
                <span key={i} className={tokenClass[token.kind]}>
                  {token.text}
                </span>
              ))
            ) : (
              " "
            )}
          </span>
        ))}
      </code>
    </pre>
  );
}

/* Tabbed code ---------------------------------------------------------------------------------- */

type TabChoices = { choices: Record<string, string>; choose: (group: string, value: string) => void };

const TabChoiceContext = React.createContext<TabChoices | null>(null);

/**
 * Remembers the last tab picked in each group for the whole session, so choosing pnpm
 * once shows pnpm in every install snippet on every page.
 */
function TabChoiceProvider({ children }: { children: React.ReactNode }) {
  const [choices, setChoices] = React.useState<Record<string, string>>({});
  const value = React.useMemo<TabChoices>(
    () => ({ choices, choose: (group, next) => setChoices((current) => ({ ...current, [group]: next })) }),
    [choices],
  );
  return <TabChoiceContext.Provider value={value}>{children}</TabChoiceContext.Provider>;
}

type CodeTabsProps = {
  /** Tab label to code. Shell code with `$ ` prompts copies without them. */
  tabs: Record<string, string>;
  /** Tabs that share a group stay in sync. */
  group: string;
  /** Names the tab list for screen readers, e.g. "Package manager". */
  label: string;
  lang?: Lang;
};

function CodeTabs({ tabs, group, label, lang = "sh" }: CodeTabsProps) {
  const shared = React.useContext(TabChoiceContext);
  const labels = Object.keys(tabs);
  const [local, setLocal] = React.useState(labels[0]);
  const preferred = shared ? (shared.choices[group] ?? labels[0]) : local;
  const value = labels.includes(preferred) ? preferred : labels[0];

  return (
    <Tabs
      value={value}
      onValueChange={(next) => (shared ? shared.choose(group, next) : setLocal(next))}
      variant="underline"
      className={cn(codeFrame, "gap-0")}
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] pl-4 pr-1 sm:pl-5">
        <TabsList aria-label={label} className="min-w-0 gap-5 border-b-0">
          {labels.map((tab) => (
            <TabsTrigger key={tab} value={tab} className="font-mono text-xs">
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
        <CopyButton size="sm" value={copyText(tabs[value], lang)} aria-label={`Copy the ${value} command`} />
      </div>
      {labels.map((tab) => (
        <TabsContent key={tab} value={tab} className="focus-visible:ring-inset focus-visible:ring-offset-0">
          <Pre code={tabs[tab]} lang={lang} />
        </TabsContent>
      ))}
    </Tabs>
  );
}

function PackageTabs({ commands }: { commands: Record<string, string> }) {
  return <CodeTabs tabs={commands} group="package-manager" label="Package manager" />;
}

export { Pre, CodeTabs, PackageTabs, TabChoiceProvider };
