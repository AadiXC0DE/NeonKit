import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ComponentPreview } from "@/components/site/component-preview";
import { DocArticle } from "@/components/site/doc-article";
import { H2, InlineCode, P, PageHeader, PagerLinks, textLink } from "@/components/site/prose";
import { highlight } from "@/lib/highlight";
import { blocks, registry, templates } from "@/registry";

export const metadata: Metadata = {
  title: "Introduction",
  description: "NeonKit is a free, open-source set of neon React components for Tailwind. What it is, how it works and where to start.",
  alternates: { canonical: "/docs" },
};

const principles = [
  {
    title: "The code is yours",
    body: "No package to update and no wrapper to fight. Each component is one file in your repo, and you can change any line of it.",
  },
  {
    title: "One variable sets the color",
    body: "Every component reads --neon. Pass color, set it on a parent, or leave it alone and get cyan.",
  },
  {
    title: "Light means something",
    body: "Resting UI stays calm. Glow shows up for focus, selection, hover and progress, so when something lights up, it's telling you why.",
  },
  {
    title: "It fits your stack",
    body: "React 18 or 19, Tailwind 3.4 or 4, Next.js, Vite or Remix. Native elements and the keyboard come first.",
  },
];

const example = `import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

export function Settings() {
  return (
    <div className="flex items-center gap-4">
      <Switch defaultChecked />              {/* cyan, the default */}
      <Button color="magenta">Save</Button>  {/* a palette name */}
      <Button color="#ff6a00">Export</Button> {/* or any hex */}
    </div>
  )
}`;

export default async function IntroductionPage() {
  const html = await highlight(example);

  return (
    <DocArticle
      toc={[
        { id: "how-it-works", title: "How it works" },
        { id: "principles", title: "Principles" },
        { id: "why", title: "Why not a package?" },
      ]}
    >
      <PageHeader title="Introduction">
        NeonKit is {registry.length} React components for dark interfaces, lit like signage after hours, plus{" "}
        {blocks.length} blocks and {templates.length} templates built from them. You don&apos;t install it as a
        dependency: you add the files you want and they become part of your project.
      </PageHeader>

      <H2 id="how-it-works">How it works</H2>
      <P>
        Add a component with the shadcn CLI or paste its source. It lands in <InlineCode>components/ui</InlineCode> next
        to two small helpers: <InlineCode>cn</InlineCode> for merging classes and <InlineCode>neonVars</InlineCode> for
        color. This is the whole idea, running:
      </P>
      <ComponentPreview html={html} code={example} title="Settings" filename="settings.tsx" className="mt-6">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Switch defaultChecked aria-label="Alerts" />
          <Button color="magenta">Save</Button>
          <Button color="#ff6a00">Export</Button>
        </div>
      </ComponentPreview>

      <H2 id="principles">Principles</H2>
      <dl className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
        {principles.map((item) => (
          <div key={item.title} className="border-t border-white/10 pt-5">
            <dt className="text-[16.5px] font-medium tracking-[-0.01em] text-fg">{item.title}</dt>
            <dd className="mt-2 text-pretty text-[15px] leading-[1.65] text-muted">{item.body}</dd>
          </div>
        ))}
      </dl>

      <H2 id="why">Why not a package?</H2>
      <P>
        UI libraries tend to end up as a pile of overrides. When the code lives in your repo, you edit the component
        itself and see every class it ships with. It&apos;s the same idea as{" "}
        <a href="https://ui.shadcn.com" target="_blank" rel="noreferrer">
          shadcn/ui
        </a>
        , and NeonKit plugs into its CLI, so the two sit side by side in one <InlineCode>components/ui</InlineCode>{" "}
        folder.
      </P>
      <P>
        Start with{" "}
        <Link href="/docs/installation" className={textLink}>
          installation
        </Link>
        , or go straight to the{" "}
        <Link href="/components" className={textLink}>
          components
        </Link>{" "}
        and copy one.
      </P>

      <PagerLinks next={{ title: "Installation", href: "/docs/installation" }} />
    </DocArticle>
  );
}
