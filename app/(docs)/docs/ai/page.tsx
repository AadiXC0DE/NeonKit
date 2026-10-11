import type { Metadata } from "next";
import { CodeBlock } from "@/components/site/code-block";
import { CommandBlock } from "@/components/site/install-tabs";
import { H2, InlineCode, P, PageHeader, PagerLinks, Step, Steps } from "@/components/site/prose";
import { siteConfig } from "@/config/site";
import { runCommand } from "@/lib/commands";

export const metadata: Metadata = {
  title: "Use with AI",
  description:
    "Use NeonKit from Cursor, Claude Code, Copilot or v0: llms.txt, markdown docs, a namespaced shadcn registry and the shadcn MCP server.",
  alternates: { canonical: "/docs/ai" },
};

export default async function AiPage() {
  const [mcp, add] = await Promise.all([
    runCommand("shadcn@latest mcp init --client claude"),
    runCommand("shadcn@latest add @neonkit/switch @neonkit/dialog"),
  ]);

  return (
    <article className="max-w-3xl">
      <PageHeader eyebrow="Getting started" title="Use with AI">
        NeonKit is written to be read by coding agents as easily as by people. Point your agent at it and ask for neon UI
        in plain words.
      </PageHeader>

      <H2 id="llms">llms.txt</H2>
      <P>
        An index for language models: what NeonKit is, how to install it, and a link to every component. Give it to
        your agent as context.
      </P>
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { href: "/llms.txt", title: "/llms.txt", body: "The short index. Start here." },
          { href: "/llms-full.txt", title: "/llms-full.txt", body: "Every guide and component, with source, in one file." },
        ].map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="rounded-xl border border-line p-5 transition-colors hover:border-line-strong"
          >
            <span className="font-mono text-[14px] text-fg">{link.title}</span>
            <span className="mt-1 block text-[14px] text-muted">{link.body}</span>
          </a>
        ))}
      </div>
      <P className="mt-6">
        Every component page also has a markdown version. Add <InlineCode>.md</InlineCode> to the URL, for example{" "}
        <a href="/components/button.md">/components/button.md</a>, or use the Copy page button at the top of it.
      </P>

      <H2 id="registry">Namespaced registry</H2>
      <P>
        Register NeonKit once in <InlineCode>components.json</InlineCode>. After that, you and your agent can refer to
        components by short names.
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
        <CommandBlock commands={add} />
      </div>

      <H2 id="mcp">MCP server</H2>
      <P>
        The shadcn MCP server lets agents browse, search and install from any registry in your{" "}
        <InlineCode>components.json</InlineCode>, NeonKit included.
      </P>
      <Steps>
        <Step title="Add the namespace above">
          <p>The MCP server reads registries from your project config.</p>
        </Step>
        <Step title="Connect your client">
          <CommandBlock commands={mcp} />
          <p>
            Swap <InlineCode>claude</InlineCode> for <InlineCode>cursor</InlineCode>, <InlineCode>vscode</InlineCode> or{" "}
            <InlineCode>codex</InlineCode>.
          </p>
        </Step>
        <Step title="Ask">
          <ul className="space-y-2">
            {[
              "Show me the components in the neonkit registry.",
              "Add the NeonKit switch and slider to the settings page and color them lime.",
              "Build a sign-in card with NeonKit input, checkbox and button, magenta accent.",
            ].map((prompt) => (
              <li key={prompt} className="rounded-lg border border-line bg-white/[0.02] px-4 py-3 font-mono text-[13px] text-fg">
                {prompt}
              </li>
            ))}
          </ul>
        </Step>
      </Steps>

      <H2 id="agents-md">Tell your agent to use it</H2>
      <P>
        Add this to <InlineCode>AGENTS.md</InlineCode>, <InlineCode>CLAUDE.md</InlineCode> or your Cursor rules, and new
        UI will reach for NeonKit by default.
      </P>
      <CodeBlock
        title="AGENTS.md"
        lang="bash"
        code={`## UI components

Use NeonKit for UI: ${siteConfig.url}/llms.txt
- Install with \`npx shadcn@latest add @neonkit/<name>\`
- Color with the \`color\` prop (palette name or hex), or wrap a section in style={neonVars("<color>")}
- Dark backgrounds only, around #05060a`}
      />

      <H2 id="prompt">Copy-paste prompt</H2>
      <P>For tools without MCP, paste this at the start of a chat.</P>
      <CodeBlock
        lang="bash"
        code={`Read ${siteConfig.url}/llms.txt. Use NeonKit components for the UI in this project.
Install each one with: npx shadcn@latest add ${siteConfig.url}/r/<name>.json
Check the component's .md page for its props before using it.`}
      />

      <PagerLinks
        prev={{ title: "Theming", href: "/docs/theming" }}
        next={{ title: "All components", href: "/components" }}
      />
    </article>
  );
}
