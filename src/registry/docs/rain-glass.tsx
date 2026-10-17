import type { ComponentDoc } from "../types";
import RainGlassDemo from "../examples/rain-glass/demo";
import RainGlassIntensity from "../examples/rain-glass/intensity";
import RainGlassWipe from "../examples/rain-glass/wipe";
import RainGlassSign from "../examples/rain-glass/sign";

export const doc: ComponentDoc = {
  usage: `import { RainGlass } from "@/components/ui/rain-glass"

<section className="relative overflow-hidden bg-[#05060a]">
  <RainGlass />
  <h1 className="relative">Nobody's in a hurry tonight</h1>
</section>`,
  examples: [
    {
      name: "demo",
      title: "Night window",
      description:
        "Out-of-focus city lights behind wet glass. Drops sit and fatten until they're heavy enough to run, snag, change course, and leave a wet streak and a trail of beads. Each drop is a little lens showing the street upside down.",
      component: RainGlassDemo,
    },
    {
      name: "intensity",
      title: "Drizzle to downpour",
      description: "intensity sets how fast beads land and drops form.",
      component: RainGlassIntensity,
    },
    {
      name: "wipe",
      title: "Wipe the glass",
      description: "With wipe, moving the pointer over the glass clears a path through the drops. Rain fills it back in.",
      component: RainGlassWipe,
    },
    {
      name: "sign",
      title: "Over your own scene",
      description: "Turn bokeh off and the glass is transparent: put anything behind it. Here a blurred NeonText sign hangs in the window.",
      component: RainGlassSign,
    },
  ],
  api: [
    {
      name: "RainGlass",
      description: "Two canvases that fill the nearest positioned parent: the lights behind the glass at half resolution, and the water on it at full resolution. Accepts native div attributes.",
      props: [
        { prop: "color", type: "NeonColor", default: "inherited", description: "Main color of the lights behind the glass and of the light caught in each drop. Amber streetlights and red tail lights mix in." },
        { prop: "intensity", type: "number", default: "0.5", description: "How hard it's raining, 0 to 1." },
        { prop: "bokeh", type: "boolean", default: "true", description: "Out-of-focus lights behind the glass, with passing traffic. Off leaves the glass transparent over your own background." },
        { prop: "speed", type: "number", default: "1", description: "Speed multiplier for the drops and the traffic. 0 freezes the frame." },
        { prop: "wipe", type: "boolean", default: "false", description: "Moving the pointer over the glass wipes the water away." },
      ],
    },
  ],
  notes: [
    "Decorative: rendered with aria-hidden and pointer-events: none. Wiping listens on the window, so content on top stays clickable.",
    "Thousands of tiny beads live in two bitmaps, not as objects; only the few dozen larger drops are simulated. Drop shading is drawn once and stamped.",
    "The first frame is already wet: a few seconds of weather run before anything is drawn. That's also the still frame you get under prefers-reduced-motion.",
    "It caps the pixel ratio at 2 and stops drawing offscreen and in hidden tabs.",
  ],
};
