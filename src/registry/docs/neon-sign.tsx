import type { ComponentDoc } from "../types";
import NeonSignDemo from "../examples/neon-sign/demo";
import NeonSignBarSign from "../examples/neon-sign/bar-sign";
import NeonSignNoVacancy from "../examples/neon-sign/no-vacancy";
import NeonSignProfiles from "../examples/neon-sign/profiles";
import NeonSignOnAir from "../examples/neon-sign/on-air";

export const doc: ComponentDoc = {
  usage: `import { NeonSign } from "@/components/ui/neon-sign"

<NeonSign
  frame="rounded"
  cable="right"
  lines={["OPEN", { text: "late", color: "pink", className: "text-[0.5em]" }]}
/>`,
  examples: [
    {
      name: "demo",
      title: "Open late",
      description:
        "Two tube colors inside a frame tube, on an acrylic plate with its power lead. Flip the power to watch it strike again.",
      component: NeonSignDemo,
    },
    {
      name: "bar-sign",
      title: "Script",
      description:
        "Signs look best in a monoline face. This one pulls Neonderthaw from Google Fonts with a stylesheet link; next/font, Tilt Neon or Sacramento work as well.",
      component: NeonSignBarSign,
    },
    {
      name: "no-vacancy",
      title: "Dying letter",
      description: "flicker=\"dying\" keeps one letter unreliable. dyingLetter picks which one.",
      component: NeonSignNoVacancy,
    },
    {
      name: "profiles",
      title: "Flicker profiles",
      description: "How each profile catches when the power comes on.",
      component: NeonSignProfiles,
    },
    {
      name: "on-air",
      title: "Status light",
      description: "Without the plate it's just the tubes, small enough for a toolbar.",
      component: NeonSignOnAir,
    },
  ],
  api: [
    {
      name: "NeonSign",
      description: "Also accepts native div attributes; the ref points at the root.",
      props: [
        { prop: "lines", type: "NeonSignLine[]", description: "One tube per line. Strings, or objects with their own color and className." },
        { prop: "children", type: "ReactNode", description: "A string works like lines (\\n splits them). Other content, such as an SVG drawn with currentColor strokes, lights as one tube." },
        { prop: "on", type: "boolean", default: "true", description: "Lit or dark. Turning it on replays the flicker profile; off leaves unlit glass." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Frame, plate edge and any line without its own color. Falls back to --neon-accent, then cyan." },
        { prop: "frame", type: '"none" | "rounded" | "pill"', default: '"none"', description: "A tube bent around the lettering, with tube supports and electrode boots." },
        { prop: "backplate", type: "boolean", default: "true", description: "Clear acrylic plate with four standoffs behind the tubes." },
        { prop: "cable", type: '"left" | "right" | "bottom" | false', default: "false", description: "The power lead, leaving the plate on that side. Adds a 2.2em bottom margin for it to hang into." },
        { prop: "flicker", type: '"clean" | "stutter" | "dying"', default: '"stutter"', description: "clean strikes at once, stutter catches letter by letter, dying does that and keeps one letter unreliable." },
        { prop: "dyingLetter", type: "number", description: "Index of the dying letter, counted across lines with spaces skipped. Picked from the text when omitted." },
        { prop: "buzz", type: "boolean", default: "false", description: "Every few seconds a random letter dips, like an ageing transformer." },
        { prop: "size", type: '"sm" | "md" | "lg" | "xl"', default: '"md"', description: "Letter height. Everything else (plate, standoffs, glow) scales in em with it." },
      ],
    },
    {
      name: "NeonSignLine",
      description: "A string, or an object:",
      props: [
        { prop: "text", type: "string", description: "The tube's lettering. Whitespace is kept; lines never wrap." },
        { prop: "color", type: "NeonColor", description: "This line's tube color." },
        { prop: "className", type: "string", description: "Per-line font, size (use em so it scales with the sign), tracking or margin." },
      ],
    },
  ],
  notes: [
    "Screen readers get the text of all lines once; the lit and unlit copies of each letter are hidden from them.",
    "Under reduced motion the sign lights without flickering, buzz is skipped, and a dying letter stays dark.",
    "Looks best with a monoline face such as Tilt Neon. Pass it through className or style; the component sets no font.",
    "The glow and the wall wash spill past the sign's box, so give it room and avoid overflow-hidden right around it.",
  ],
};
