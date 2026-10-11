import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CodeBlock } from "@/components/site/code-block";
import { H2, InlineCode, P, PageHeader, PagerLinks } from "@/components/site/prose";
import { registry } from "@/registry";

export const metadata: Metadata = {
  title: "Introduction",
  description: "NeonKit is a free, open-source set of neon React components for Tailwind. What it is, how it works and where to start.",
  alternates: { canonical: "/docs" },
};

const principles = [
  {
    title: "You own the code",
    body: "There is no package to update and no wrapper to fight. Each component is one file in your repo. Change anything.",
  },
  {
    title: "One variable sets the color",
    body: "Every component reads --neon. Pass color, set it on a parent, or leave it and get cyan.",
  },
  {
    title: "Glow means something",
    body: "Resting UI stays calm. Light shows up for focus, selection, hover and progress, so it carries meaning.",
  },
  {
    title: "Works where you are",
    body: "React 18 or 19, Tailwind 3.4 or 4, Next.js, Vite, Remix. Native elements and keyboard support come first.",
  },
];

export default function IntroductionPage() {
  return (
    <article className="max-w-3xl">
      <PageHeader eyebrow="Getting started" title="Introduction">
        NeonKit is {registry.length} React components for dark interfaces, lit like signage after hours. You don&apos;t
        install it as a dependency. You add the files you want and they become part of your project.
      </PageHeader>

      <div className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
        {principles.map((item, i) => (
          <div key={item.title} className="bg-background p-6">
            <p className="font-mono text-[11px] text-dim">0{i + 1}</p>
            <h3 className="mt-6 font-semibold tracking-[-0.01em] text-fg">{item.title}</h3>
            <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{item.body}</p>
          </div>
        ))}
      </div>

      <H2 id="how-it-works">How it works</H2>
      <P>
        Add a component with the shadcn CLI or paste its source. It lands in <InlineCode>components/ui</InlineCode> next to
        two tiny helpers: <InlineCode>cn</InlineCode> for merging classes and <InlineCode>neonVars</InlineCode> for color.
      </P>
      <CodeBlock
        code={`import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

export function Settings() {
  return (
    <div className="flex items-center gap-4">
      <Switch defaultChecked />           {/* cyan, the default */}
      <Button color="magenta">Save</Button> {/* a palette name */}
      <Button color="#ff6a00">Export</Button> {/* or any hex */}
    </div>
  )
}`}
      />

      <H2 id="why">Why not a package?</H2>
      <P>
        UI libraries tend to end up as a pile of overrides. When the code lives in your repo, you edit the component
        itself, and you can see every class it ships with. It&apos;s the same idea as{" "}
        <a href="https://ui.shadcn.com" target="_blank" rel="noreferrer">shadcn/ui</a>, and NeonKit plugs into its CLI,
        so the two sit side by side.
      </P>

      <div className="mt-12 grid gap-3 sm:grid-cols-2">
        <Link href="/docs/installation" className="group flex items-center justify-between rounded-xl border border-line p-5 transition-colors hover:border-line-strong">
          <span>
            <span className="block font-semibold text-fg">Install</span>
            <span className="text-[14px] text-muted">CLI or copy and paste</span>
          </span>
          <ArrowRight className="size-4 text-dim transition-transform group-hover:translate-x-0.5 group-hover:text-fg" />
        </Link>
        <Link href="/components" className="group flex items-center justify-between rounded-xl border border-line p-5 transition-colors hover:border-line-strong">
          <span>
            <span className="block font-semibold text-fg">Browse components</span>
            <span className="text-[14px] text-muted">{registry.length} and counting</span>
          </span>
          <ArrowRight className="size-4 text-dim transition-transform group-hover:translate-x-0.5 group-hover:text-fg" />
        </Link>
      </div>

      <PagerLinks next={{ title: "Installation", href: "/docs/installation" }} />
    </article>
  );
}
