import type { Metadata } from "next";
import { CodeBlock } from "@/components/site/code-block";
import { DocArticle } from "@/components/site/doc-article";
import { H2, InlineCode, P, PageHeader, PagerLinks } from "@/components/site/prose";
import { ThemingPlayground } from "@/components/site/theming-playground";
import { neonColorNames, neonColors } from "@/lib/neon";

export const metadata: Metadata = {
  title: "Theming",
  description: "One CSS variable colors every NeonKit component. Set it per component, per section or app-wide, with any hex.",
  alternates: { canonical: "/docs/theming" },
};

const toHex = (rgb: string) =>
  "#" + rgb.split(" ").map((n) => Number(n).toString(16).padStart(2, "0")).join("");

export default function ThemingPage() {
  return (
    <DocArticle
      toc={[
        { id: "per-component", title: "Per component" },
        { id: "per-section", title: "Per section" },
        { id: "app-wide", title: "App-wide" },
        { id: "palette", title: "Palette" },
        { id: "custom-palette", title: "Changing the palette" },
      ]}
    >
      <PageHeader title="Theming">
        Every component reads its color from one CSS variable, <InlineCode>--neon</InlineCode>. Set it per component,
        per section or for the whole app.
      </PageHeader>

      <ThemingPlayground />

      <H2 id="per-component">Per component</H2>
      <P>Pass a palette name or any hex value.</P>
      <CodeBlock
        code={`<Button color="lime">Approve</Button>
<Badge color="#ff6a00">Beta</Badge>`}
      />

      <H2 id="per-section">Per section</H2>
      <P>
        Components that are not given a color inherit <InlineCode>--neon-accent</InlineCode> from the nearest parent
        that sets it. <InlineCode>neonVars</InlineCode> sets it for you.
      </P>
      <CodeBlock
        code={`import { neonVars } from "@/lib/neon"

<section style={neonVars("violet")}>
  <Tabs>…</Tabs>      {/* violet */}
  <Switch />          {/* violet */}
  <Button color="red">Delete</Button> {/* still red */}
</section>`}
      />

      <H2 id="app-wide">App-wide</H2>
      <P>
        Set the accent once in your global CSS. The value is three space-separated RGB channels, which lets components
        apply their own alpha.
      </P>
      <CodeBlock
        title="globals.css"
        lang="css"
        code={`:root {
  --neon-accent: 255 95 162; /* pink */
}`}
      />

      <H2 id="palette">Palette</H2>
      <P>Eleven tuned colors. Each keeps 4.5:1 contrast with dark text when used as a solid fill.</P>
      <ul className="mt-8 grid grid-cols-4 gap-x-4 gap-y-10 sm:grid-cols-6 lg:grid-cols-11 lg:gap-x-2">
        {neonColorNames.map((name) => {
          const rgb = neonColors[name];
          return (
            <li key={name} className="flex flex-col items-center text-center">
              <span
                aria-hidden
                className="h-20 w-[7px] rounded-full"
                style={{
                  background: `linear-gradient(to right, rgb(${rgb}), #fff 45%, rgb(${rgb}))`,
                  boxShadow: `0 0 4px rgb(${rgb}), 0 0 16px rgb(${rgb} / 0.75), 0 0 36px rgb(${rgb} / 0.35)`,
                }}
              />
              <span className="mt-5 text-[14px] font-medium text-fg">{name}</span>
              <span className="mt-0.5 font-mono text-[12px] text-muted">{toHex(rgb)}</span>
            </li>
          );
        })}
      </ul>

      <H2 id="custom-palette">Changing the palette</H2>
      <P>
        The palette lives in <InlineCode>lib/neon.ts</InlineCode>. Rename, add or retune entries and the{" "}
        <InlineCode>color</InlineCode> prop picks them up, types included.
      </P>
      <CodeBlock
        title="lib/neon.ts"
        lang="ts"
        code={`export const neonColors = {
  brand: "0 255 170", // your color, as r g b
  cyan: "34 211 238",
  // …
} as const`}
      />

      <PagerLinks
        prev={{ title: "Installation", href: "/docs/installation" }}
        next={{ title: "Use with AI", href: "/docs/ai" }}
      />
    </DocArticle>
  );
}
