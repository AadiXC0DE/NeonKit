import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/site/code-block";
import { DocArticle } from "@/components/site/doc-article";
import { H2, H3, InlineCode, P, PageHeader, PagerLinks, textLink } from "@/components/site/prose";
import { neonColorNames, neonColors } from "@/lib/neon";

export const metadata: Metadata = {
  title: "Design language",
  description:
    "How NeonKit is designed: one color variable, glow as light with a core and a halo, when things are allowed to glow, type, motion, radius and the icon construction rules.",
  alternates: { canonical: "/docs/design" },
};

const toHex = (rgb: string) =>
  "#" + rgb.split(" ").map((n) => Number(n).toString(16).padStart(2, "0")).join("");

/** A plain two-column table in the docs style. */
function Table({ head, rows }: { head: [string, string]; rows: [React.ReactNode, React.ReactNode][] }) {
  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full min-w-[30rem] border-collapse text-left text-[14.5px] leading-[1.55]">
        <thead>
          <tr className="border-b border-line text-[13.5px] text-muted">
            <th className="w-[34%] py-2.5 pr-6 font-normal">{head[0]}</th>
            <th className="py-2.5 font-normal">{head[1]}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([a, b], i) => (
            <tr key={i} className="border-b border-line/70 align-top">
              <td className="py-3 pr-6 text-fg">{a}</td>
              <td className="py-3 text-muted">{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DesignPage() {
  return (
    <DocArticle
      toc={[
        { id: "principles", title: "Principles" },
        { id: "color", title: "Color" },
        { id: "light", title: "Light" },
        { id: "when-to-glow", title: "When things glow" },
        { id: "type", title: "Type" },
        { id: "shape", title: "Shape and space" },
        { id: "motion", title: "Motion" },
        { id: "icons", title: "Icons" },
        { id: "accessibility", title: "Accessibility" },
      ]}
    >
      <PageHeader title="Design language">
        The rules every NeonKit component follows, with the numbers behind them. Read this before you build your own
        pieces, so they sit next to ours without looking borrowed.
      </PageHeader>

      <H2 id="principles">Principles</H2>
      <Table
        head={["Rule", "What it means in practice"]}
        rows={[
          ["Glow is light, not paint.", "A lit thing has a hot core, colored glass and a halo that spills onto what's around it. A flat colored shadow is paint."],
          ["Calm at rest, lit when it matters.", "Nothing glows by default. Light marks state: on, selected, focused, live, or the one thing to press. A screen where everything glows has nothing lit."],
          ["One variable.", <>Color comes from <InlineCode>--neon</InlineCode> and nowhere else, so a single class recolors a component and everything inside it.</>],
          ["Hardware, built precisely.", "Knobs have detents, meters have ballistics, split-flaps flip one card at a time. If a real object works a certain way, the component does too."],
          ["Yours once installed.", "Every component is one file with no runtime package. If a rule here doesn't suit your product, change the file."],
        ]}
      />

      <H2 id="color">Color</H2>
      <P>
        <InlineCode>--neon</InlineCode> holds three space-separated RGB channels, so any alpha works with{" "}
        <InlineCode>rgb(var(--neon) / 0.4)</InlineCode>. Components that aren&apos;t given a color read{" "}
        <InlineCode>--neon-accent</InlineCode> from the nearest parent, and fall back to cyan. Details and recipes are on{" "}
        <Link href="/docs/theming" className={textLink}>
          Theming
        </Link>
        .
      </P>
      <ul aria-label="Palette" className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
        {neonColorNames.map((name) => (
          <li key={name} className="flex items-center gap-3">
            <span
              aria-hidden
              className="h-8 w-1.5 shrink-0 rounded-full"
              style={{ background: `rgb(${neonColors[name]})`, boxShadow: `0 0 10px rgb(${neonColors[name]} / 0.55)` }}
            />
            <span className="min-w-0">
              <span className="block text-[14.5px] text-fg">{name}</span>
              <span className="block font-mono text-[12.5px] text-muted">{toHex(neonColors[name])}</span>
            </span>
          </li>
        ))}
      </ul>
      <H3>Surfaces</H3>
      <P>
        The page is near-black, <InlineCode>#05060a</InlineCode>, so light has something to fall on. Panels lift by a
        few points (<InlineCode>#0a0b11</InlineCode>, <InlineCode>#10131b</InlineCode>) and are separated by 1px white
        borders at 6 to 10% rather than by shadow. Text is <InlineCode>#e8edf5</InlineCode> for content and{" "}
        <InlineCode>#8a93a6</InlineCode> for anything secondary.
      </P>

      <H2 id="light">Light</H2>
      <P>A lit element is drawn in up to three passes. Most components use two; signage uses all three.</P>
      <Table
        head={["Pass", "Recipe"]}
        rows={[
          ["Core", "White or a white-mixed tint, thin: about a third of the tube. Only on things that are fully on."],
          ["Glass", "The color at full strength. This is the part that reads as the element's color."],
          ["Halo", "The color again, blurred 14 to 40px at 30 to 55%. It's what makes a dark surface look lit."],
        ]}
      />
      <CodeBlock
        className="mt-6"
        code={`/* A lit control, as the switch does it */
box-shadow:
  0 0 14px rgb(var(--neon) / calc(0.45 * var(--neon-glow, 1))),
  inset 0 0 8px rgb(var(--neon) / calc(0.3 * var(--neon-glow, 1)));`}
      />
      <P>
        Every halo alpha is multiplied by <InlineCode>--neon-glow</InlineCode>, 1 by default. Set it to 0 for a flat dark
        interface, or up to 1.5 for something closer to signage. The{" "}
        <Link href="/theme" className={textLink}>
          Theme Studio
        </Link>{" "}
        exports it with the rest of your theme.
      </P>
      <CodeBlock
        code={`:root { --neon-glow: 0.6; }        /* quieter everywhere */
.hero { --neon-glow: 1.4; }          /* louder in one place */`}
      />

      <H2 id="when-to-glow">When things glow</H2>
      <Table
        head={["State", "Treatment"]}
        rows={[
          ["At rest", "No glow. A 1px border at white 8 to 10%, the glass dark."],
          ["Hover", "The border tints toward the color at 35 to 45%. Still no halo: hovering isn't a state worth lighting."],
          ["Focus (keyboard)", <>A 2px ring at 60% of the color, offset 2px from the element. It reaches 4.4:1 against the page in every palette color.</>],
          ["On, checked, selected", "Lit: glass plus halo, and a core on anything small enough to read as a tube."],
          ["Live", "Lit, with a slow pulse only where something is actually happening right now: a recording, a deploy, a stream."],
          ["Error", "The red gel, lit on the one field that's wrong. The rest of the form stays calm."],
          ["Disabled", "Never lit, at 40 to 50% opacity."],
        ]}
      />

      <H2 id="type">Type</H2>
      <P>
        Components inherit your app&apos;s font, so they fit whatever you already use. The NeonKit site and templates use
        this set; it&apos;s a good starting point if you have nothing yet.
      </P>
      <Table
        head={["Role", "Setting"]}
        rows={[
          ["Display", <>Mona Sans, width 112, weight 620, tracking −0.038em, line height 0.98. Short headlines, two lines at most.</>],
          ["Body", "Mona Sans at width 100 and weight 400, 15.5 to 17px, line height 1.55 to 1.65, at most about 62 characters a line."],
          ["Labels", "13 to 14px, sentence case, weight 500. No small uppercase tracked labels above headings."],
          ["Values and code", <>Fragment Mono, only for code, commands, file paths and values that change. Use <InlineCode>tabular-nums</InlineCode> on anything that ticks.</>],
          ["Signs", "Tilt Neon, only on actual neon lettering: Neon Sign, Neon Text and the like."],
        ]}
      />

      <H2 id="shape">Shape and space</H2>
      <Table
        head={["Token", "Value"]}
        rows={[
          ["Controls", "8px radius at the default size (6px small, 12px large). Heights 32, 40 and 48px."],
          ["Panels", "10 to 14px radius, 1px border, no drop shadow on dark surfaces."],
          ["Nesting", "Never more than two rounded boxes deep. Use space and a rule instead of a third box."],
          ["Hit targets", "At least 40px on touch, even when the visible control is smaller."],
        ]}
      />

      <H2 id="motion">Motion</H2>
      <Table
        head={["Kind", "Timing"]}
        rows={[
          [
            "Interface",
            <>
              150 to 300ms on <InlineCode>cubic-bezier(0.23, 1, 0.32, 1)</InlineCode>. Transform and opacity only, and
              always interruptible.
            </>,
          ],
          ["Ignition", "520ms: strike at 55%, full, a dip to 60%, full, a dip to 85%, hold. Only when something turns on."],
          ["Instruments", "Their own physics: meters strike instantly and decay over 200ms, needles overshoot, peaks hold 900ms before falling."],
          ["Reduced motion", "Every component gives a still, complete composition. Nothing that carries meaning depends on movement."],
        ]}
      />

      <H2 id="icons">Icons</H2>
      <P>
        NeonKit draws its own{" "}
        <Link href="/components/icons" className={textLink}>
          icon set
        </Link>{" "}
        as bent glass tube. Each glyph sits on a 24px grid with a 1.75 stroke, round caps and joins, and a minimum bend
        radius of 1. Where a tube passes behind another there&apos;s a blockout gap of 2 to 4 units, the way real neon is
        masked with paint. Names and props match lucide-react, so moving over is a change of import path.
      </P>
      <CodeBlock code={`import { PlugZap } from "@/components/ui/icons"

<PlugZap size={20} strokeWidth={1.5} />`} />

      <H2 id="accessibility">Accessibility</H2>
      <P>
        Components use native elements where they exist (a switch is a <InlineCode>button</InlineCode> with{" "}
        <InlineCode>role=&quot;switch&quot;</InlineCode>), follow the WAI-ARIA patterns for the rest, and are fully
        usable from the keyboard. Glow never carries meaning on its own: a lit state always comes with a change in text,
        icon, position or ARIA state. Text meets AA contrast on the default surfaces.
      </P>

      <PagerLinks
        prev={{ title: "Theming", href: "/docs/theming" }}
        next={{ title: "Theme Studio", href: "/theme" }}
      />
    </DocArticle>
  );
}
