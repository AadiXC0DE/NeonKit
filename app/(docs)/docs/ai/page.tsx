import type { Metadata } from "next";
import { CodeBlock } from "@/components/site/code-block";
import { CommandBlock } from "@/components/site/install-tabs";
import { DocArticle } from "@/components/site/doc-article";
import { H2, InlineCode, P, PageHeader, PagerLinks, Step, Steps, textLink } from "@/components/site/prose";
import { siteConfig } from "@/config/site";
import { runCommand } from "@/lib/commands";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Use with AI",
  description:
    "Use NeonKit from Cursor, Copilot, v0 and other coding agents: llms.txt, markdown docs, a namespaced shadcn registry and the shadcn MCP server.",
  alternates: { canonical: "/docs/ai" },
};

export default async function AiPage() {
  const [mcp, add] = await Promise.all([
    runCommand("shadcn@latest mcp init --client cursor"),
    runCommand("shadcn@latest add @neonkit/switch @neonkit/dialog"),
  ]);

  return (
    <DocArticle
      toc={[
        { id: "llms", title: "llms.txt" },
        { id: "registry", title: "Namespaced registry" },
        { id: "mcp", title: "MCP server" },
        { id: "agents-md", title: "Tell your agent" },
        { id: "prompt", title: "Copy-paste prompt" },
      ]}
    >
      <PageHeader title="Use with AI">
        Every page here has a plain-text twin, and the registry speaks the shadcn protocol, so a coding agent can read
        NeonKit the way you do. Point yours at it and ask for neon UI in plain words.
      </PageHeader>

      <H2 id="llms">llms.txt</H2>
      <P>
        An index for language models: what NeonKit is, how to install it, and a link to every component. Give it to
        your agent as context.
      </P>
      <dl className="mt-8 divide-y divide-white/[0.07] border-y border-white/[0.07]">
        {[
          { href: "/llms.txt", body: "The short index: what NeonKit is, how to install it, a link to every component. Start here." },
          { href: "/llms-full.txt", body: "Every guide and every component with its source, in one file." },
        ].map((link) => (
          <div key={link.href} className="grid gap-1 py-4 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-6">
            <dt>
              <a href={link.href} className={cn(textLink, "font-mono text-[14px]")}>
                {link.href}
              </a>
            </dt>
            <dd className="text-[15px] leading-[1.6] text-muted">{link.body}</dd>
          </div>
        ))}
      </dl>
      <P className="mt-8">
        Every component page also has a markdown version. Add <InlineCode>.md</InlineCode> to the URL, for example{" "}
        <a href="/components/button.md">/components/button.md</a>, or press <span className="text-fg">Copy as Markdown</span> next to its title.
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
      <CommandBlock commands={add} className="mt-4" />

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
            Swap <InlineCode>cursor</InlineCode> for <InlineCode>vscode</InlineCode>, <InlineCode>codex</InlineCode> or
            whichever MCP client you use.
          </p>
        </Step>
        <Step title="Ask">
          <ul className="space-y-3">
            {[
              "Show me the components in the neonkit registry.",
              "Add the NeonKit switch and slider to the settings page and color them lime.",
              "Build a sign-in card with NeonKit input, checkbox and button, magenta accent.",
            ].map((prompt) => (
              <li key={prompt} className="border-l border-white/15 pl-4 text-[15px] leading-[1.6] text-fg">
                &ldquo;{prompt}&rdquo;
              </li>
            ))}
          </ul>
        </Step>
      </Steps>

      <H2 id="agents-md">Tell your agent to use it</H2>
      <P>
        Add this to <InlineCode>AGENTS.md</InlineCode> or your editor&apos;s rules file, and new UI will reach for
        NeonKit by default.
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
    </DocArticle>
  );
}
