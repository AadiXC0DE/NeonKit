import type { ComponentDoc } from "../types";
import GaugeDemo from "../examples/gauge/demo";
import GaugeZones from "../examples/gauge/zones";
import GaugeLive from "../examples/gauge/live";
import GaugeSizes from "../examples/gauge/sizes";

export const doc: ComponentDoc = {
  usage: `import { Gauge } from "@/components/ui/gauge"

<Gauge label="Speed" unit="km/h" value={88} max={260} ticks={13} />`,
  examples: [
    {
      name: "demo",
      title: "Dashboard",
      description:
        "The needles sweep to the stops at ignition, then follow a car through its gears. The tachometer's redline turns the arc red past 6,500 r/min.",
      component: GaugeDemo,
    },
    {
      name: "zones",
      title: "Zones",
      description: "Printed bands for cold, normal and hot. The band holding the value lights up.",
      component: GaugeZones,
    },
    {
      name: "live",
      title: "Live data",
      description: "Feed it new values as often as you like; the needle springs to each one without re-rendering the dial.",
      component: GaugeLive,
    },
    {
      name: "sizes",
      title: "Sizes and colors",
      description: "Small dials print their legends larger so they stay readable. className can set any other width.",
      component: GaugeSizes,
    },
  ],
  api: [
    {
      name: "Gauge",
      description: "Accepts every div attribute; the ref points at the root, which has role=\"meter\".",
      props: [
        { prop: "value", type: "number", description: "Current reading, clamped to min and max." },
        { prop: "min", type: "number", default: "0", description: "Start of the scale." },
        { prop: "max", type: "number", default: "100", description: "End of the scale." },
        { prop: "label", type: "string", description: "Legend printed on the dial. Also the accessible name unless aria-label is set." },
        { prop: "unit", type: "string", description: "Printed under the readout and read after the value." },
        { prop: "ticks", type: "number", default: "10", description: "Numbered intervals on the scale. Numerals shrink, then skip, to fit." },
        { prop: "redline", type: "number", description: "Start of the red zone. Past it the scale prints red and the arc burns red." },
        { prop: "zones", type: "{ from: number; to: number; color: NeonColor }[]", description: "Colored bands inside the scale. The band holding the value lights up." },
        { prop: "formatValue", type: "(value: number) => string", description: "Formats the readout and aria-valuetext." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex for the needle, arc and readout." },
        { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "160, 224 or 288px across." },
      ],
    },
  ],
  notes: [
    "The root has role=\"meter\" with aria-valuemin, aria-valuemax, aria-valuenow and aria-valuetext (the formatted value and unit).",
    "The dial itself is hidden from screen readers; the meter's value is the single source of truth.",
    "The needle, arc and readout are driven by a spring outside React rendering. Under reduced motion they jump straight to the value.",
  ],
};
