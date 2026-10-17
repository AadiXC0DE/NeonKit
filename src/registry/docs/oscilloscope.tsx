import type { ComponentDoc } from "../types";
import OscilloscopeDemo from "../examples/oscilloscope/demo";
import OscilloscopeLiveAudio from "../examples/oscilloscope/live-audio";
import OscilloscopePersistence from "../examples/oscilloscope/persistence";
import OscilloscopeWaveforms from "../examples/oscilloscope/waveforms";

export const doc: ComponentDoc = {
  usage: `import { Oscilloscope } from "@/components/ui/oscilloscope"

<Oscilloscope wave="sine" frequency={2} amplitude={0.6} />`,
  examples: [
    {
      name: "demo",
      title: "Bench scope",
      description:
        "A phosphor trace on a lit graticule. Slow parts of the wave burn bright and steep edges draw faint, the way a real beam deposits light. Children render over the glass, here as readouts.",
      component: OscilloscopeDemo,
    },
    {
      name: "waveforms",
      title: "Waveforms",
      description: "Square and saw edges overshoot and ring before they settle, like a function generator seen through the scope's bandwidth.",
      component: OscilloscopeWaveforms,
    },
    {
      name: "persistence",
      title: "Persistence",
      description: "How much light each frame keeps. Higher values leave a longer afterglow as the trace drifts.",
      component: OscilloscopePersistence,
    },
    {
      name: "live-audio",
      title: "Live audio",
      description:
        "Pass an AnalyserNode as source to draw real audio, triggered on a rising edge so periodic sound stands still. Both sources start their AudioContext inside the click.",
      component: OscilloscopeLiveAudio,
    },
  ],
  api: [
    {
      name: "Oscilloscope",
      description:
        "Renders a div with the screen's canvases and accepts div attributes; the ref points at the div. It defaults to the full width at 16:10; size it with className.",
      props: [
        { prop: "wave", type: '"sine" | "square" | "saw" | "triangle" | "noise"', default: '"sine"', description: "Generated waveform. Ignored while source is set." },
        { prop: "frequency", type: "number", default: "2", description: "Cycles across the screen." },
        { prop: "amplitude", type: "number", default: "0.6", description: "Peak height as a fraction of half the screen. With source, the input gain." },
        { prop: "speed", type: "number", default: "0.25", description: "Drift in cycles per second. 0 holds the trace still, like a triggered scope." },
        { prop: "persistence", type: "number", default: "0.85", description: "Share of each frame's light that survives into the next, 0 to 0.98." },
        { prop: "grid", type: "boolean", default: "true", description: "The graticule: 10 by 8 divisions with a ticked center cross." },
        { prop: "source", type: "AnalyserNode | null", description: "Live audio. Draws its time-domain data instead of the generated wave." },
        { prop: "children", type: "ReactNode", description: "Overlay content, positioned absolutely over the glass. Text picks up a mono, glowing readout style." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Phosphor color. Falls back to --neon-accent, then cyan." },
      ],
    },
  ],
  notes: [
    "It's hidden from screen readers by default. Pass aria-label (for example \"Sine wave, 200 Hz\") to expose it as an image.",
    "The canvases pause while off screen or in a hidden tab, size themselves with a ResizeObserver and render at the device pixel ratio, capped at 2.",
    "With reduced motion, generated waves draw one still frame. A live source keeps updating a few times a second without the afterglow.",
    "The phosphor color is read from --neon, and the canvas follows changes to an ancestor's --neon-accent without a re-render.",
    "The component never creates an AudioContext. Build the AnalyserNode in response to a click so the browser lets it start.",
  ],
};
