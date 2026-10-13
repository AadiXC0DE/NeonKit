import type { Metadata } from "next";
import { CodeBlock } from "@/components/site/code-block";
import { CommandBlock } from "@/components/site/install-tabs";
import { H2, InlineCode, P, PageHeader, PagerLinks, Step, Steps } from "@/components/site/prose";
import { registryUrl, siteConfig } from "@/config/site";
import { installCommand, runCommand } from "@/lib/commands";
import { readSource } from "@/lib/highlight";

export const metadata: Metadata = {
  title: "Installation",
  description: "Add NeonKit neon components to any React + Tailwind project with the shadcn CLI, a namespaced registry, or by hand.",
  alternates: { canonical: "/docs/installation" },
};

export default async function InstallationPage() {
  const [init, addOne, addMany, short, base, utils, neon] = await Promise.all([
    runCommand("shadcn@latest init"),
    runCommand(`shadcn@latest add ${registryUrl("switch")}`),
    runCommand(`shadcn@latest add ${registryUrl("tabs")} ${registryUrl("toast")} ${registryUrl("slider")}`),
    runCommand("shadcn@latest add @neonkit/button @neonkit/select"),
    installCommand(["clsx", "tailwind-merge"]),
    readSource("src/lib/utils.ts"),
    readSource("src/lib/neon.ts"),
  ]);

  return (
    <article className="max-w-3xl">
      <PageHeader eyebrow="Getting started" title="Installation">
        You need React 18 or newer and Tailwind CSS 3.4 or 4. Any framework works. The examples use Next.js and
        TypeScript.
      </PageHeader>

      <H2 id="cli">With the shadcn CLI</H2>
      <P>
        This is the quickest route. Each component is published as a shadcn registry item, so the CLI writes the file,
        installs its npm dependencies and adds <InlineCode>lib/neon.ts</InlineCode> for you.
      </P>
      <Steps>
        <Step title="Set up shadcn (skip if you already use it)">
          <p>
            This creates <InlineCode>components.json</InlineCode> and <InlineCode>lib/utils.ts</InlineCode>. Any
            style works, Radix or Base UI: in a Base UI project the CLI rewrites <InlineCode>asChild</InlineCode> to{" "}
            <InlineCode>render</InlineCode>, and NeonKit components accept both.
          </p>
          <CommandBlock commands={init} />
        </Step>
        <Step title="Add a component">
          <CommandBlock commands={addOne} />
          <p>Pass several URLs to add them in one go.</p>
          <CommandBlock commands={addMany} />
        </Step>
        <Step title="Use it">
          <CodeBlock
            code={`import { Switch } from "@/components/ui/switch"

export default function Page() {
  return <Switch color="lime" label="Neon on" defaultChecked />
}`}
          />
        </Step>
      </Steps>
      <P className="mt-8">
        NeonKit writes to the same <InlineCode>components/ui</InlineCode> folder as shadcn/ui. If a file with the same
        name exists (a fresh <InlineCode>shadcn init</InlineCode> ships a button), the CLI asks first. Add{" "}
        <InlineCode>--overwrite</InlineCode> to replace it without asking.
      </P>

      <H2 id="namespace">Short names</H2>
      <P>
        Register the <InlineCode>@neonkit</InlineCode> namespace in <InlineCode>components.json</InlineCode> and drop the
        URLs. This also makes NeonKit visible to the{" "}
        <a href="/docs/ai#mcp">shadcn MCP server</a>.
      </P>
      <CodeBlock
        title="components.json"
        lang="json"
        code={`{
  "registries": {
    "@neonkit": "${siteConfig.url}/r/{name}.json"
  }
}`}
      />
      <div className="mt-4">
        <CommandBlock commands={short} />
      </div>

      <H2 id="manual">Manual</H2>
      <P>Prefer to see every line? It takes about a minute.</P>
      <Steps>
        <Step title="Install the two class helpers">
          <CommandBlock commands={base} />
          <p>
            Some components also use <InlineCode>motion</InlineCode>, <InlineCode>lucide-react</InlineCode> or{" "}
            <InlineCode>@radix-ui/react-slot</InlineCode>. Each component page lists what it needs.
          </p>
        </Step>
        <Step title={<>Add <InlineCode>lib/utils.ts</InlineCode></>}>
          <CodeBlock code={utils} title="lib/utils.ts" lang="ts" />
        </Step>
        <Step title={<>Add <InlineCode>lib/neon.ts</InlineCode></>}>
          <p>The palette and the one helper that turns a color into the CSS variable.</p>
          <CodeBlock code={neon} title="lib/neon.ts" lang="ts" maxHeight={420} />
        </Step>
        <Step title="Check the path alias">
          <p>
            Components import from <InlineCode>@/lib/…</InlineCode>. Most templates set this up already.
          </p>
          <CodeBlock
            title="tsconfig.json"
            lang="json"
            code={`{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./*"] }
  }
}`}
          />
        </Step>
        <Step title="Copy a component">
          <p>
            Open any component, choose <span className="text-fg">Manual</span> and paste the source into{" "}
            <InlineCode>components/ui</InlineCode>.
          </p>
        </Step>
      </Steps>

      <H2 id="tailwind-3">Tailwind 3</H2>
      <P>
        The components avoid utilities that were renamed in v4 and style everything through arbitrary values, so they
        compile the same on 3.4. Make sure your <InlineCode>content</InlineCode> globs include the folder you paste them
        into.
      </P>
      <CodeBlock
        title="tailwind.config.js"
        lang="ts"
        code={`module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
}`}
      />

      <H2 id="background">Background</H2>
      <P>
        NeonKit is dark only. The glows are tuned against <InlineCode>#05060a</InlineCode>, and anything close to black
        works.
      </P>
      <CodeBlock code={`<body className="bg-[#05060a] text-white antialiased">`} />

      <PagerLinks
        prev={{ title: "Introduction", href: "/docs" }}
        next={{ title: "Theming", href: "/docs/theming" }}
      />
    </article>
  );
}
