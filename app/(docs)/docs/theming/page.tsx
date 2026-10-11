import type { Metadata } from "next";
import { CodeBlock } from "@/components/site/code-block";
import { H2, InlineCode, P, PageHeader, PagerLinks } from "@/components/site/prose";
import { ThemingPlayground } from "@/components/site/theming-playground";
import { neonColorNames, neonColors } from "@/lib/neon";

export const metadata: Metadata = {
  title: "Theming",
  description: "One CSS variable colors every NeonKit component. Here is how to set it.",
};

const toHex = (rgb: string) =>
  "#" + rgb.split(" ").map((n) => Number(n).toString(16).padStart(2, "0")).join("");

export default function ThemingPage() {
  return (
    <article className="max-w-3xl">
      <PageHeader eyebrow="Getting started" title="Theming">
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
      <P>Eleven tuned colors. Each one keeps 4.5:1 contrast with dark text when used as a solid fill.</P>
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
        {neonColorNames.map((name) => (
          <div key={name} className="flex items-center gap-3 bg-background p-4">
            <span
              className="size-8 shrink-0 rounded-md"
              style={{
                background: `rgb(${neonColors[name]})`,
                boxShadow: `0 0 18px rgb(${neonColors[name]} / 0.45)`,
              }}
            />
            <span className="min-w-0">
              <span className="block text-[14px] font-medium text-fg">{name}</span>
              <span className="block font-mono text-[11.5px] text-dim">{toHex(neonColors[name])}</span>
            </span>
          </div>
        ))}
      </div>

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
        next={{ title: "All components", href: "/components" }}
      />
    </article>
  );
}
