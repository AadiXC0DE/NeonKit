import type { ComponentDoc } from "../types";
import EqualizerDemo from "../examples/equalizer/demo";
import EqualizerAudio from "../examples/equalizer/audio";
import EqualizerGraphicEq from "../examples/equalizer/graphic-eq";
import EqualizerTrackList from "../examples/equalizer/track-list";

export const doc: ComponentDoc = {
  usage: `import { Equalizer } from "@/components/ui/equalizer"

<Equalizer playing bars={24} height={120} />`,
  examples: [
    {
      name: "demo",
      title: "Now playing",
      description: "Simulated spectrum bars with falling peak caps. Pause and they settle to rest; the caps drop with gravity.",
      component: EqualizerDemo,
    },
    {
      name: "audio",
      title: "Real audio",
      description:
        "Pass an audio element and the bars read its spectrum through an AnalyserNode. The loop here is synthesized in the browser, so nothing is downloaded.",
      component: EqualizerAudio,
    },
    {
      name: "graphic-eq",
      title: "LED cells",
      description: "segments splits each bar into cells, like a hi-fi spectrum display.",
      component: EqualizerGraphicEq,
    },
    {
      name: "track-list",
      title: "Inline indicator",
      description: "Four bars without peak caps make a now-playing glyph. Click the active track to pause it.",
      component: EqualizerTrackList,
    },
  ],
  api: [
    {
      name: "Equalizer",
      description:
        "Renders a div holding a canvas and accepts div attributes; the ref points at the div. It fills its container's width.",
      props: [
        { prop: "bars", type: "number", default: "24", description: "Number of frequency bands." },
        { prop: "playing", type: "boolean", default: "true", description: "Bars move while true and settle to rest when false." },
        {
          prop: "audio",
          type: "HTMLAudioElement | null",
          description:
            "Drive the bars from this element's real spectrum. The AudioContext is created on the element's first play event, so it starts after a user gesture.",
        },
        { prop: "height", type: "number", default: "120", description: "Height in pixels." },
        { prop: "gap", type: "number", default: "3", description: "Space between bars in pixels." },
        { prop: "segments", type: "number", default: "0", description: "Split each bar into this many LED cells. 0 draws solid bars." },
        { prop: "peaks", type: "boolean", default: "true", description: "Peak caps that hold the recent high, then drop." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
      ],
    },
  ],
  notes: [
    "It's decorative and hidden from screen readers by default. Pass aria-label to expose it as an image, and keep the playback state in your own controls.",
    "With audio, the element's sound is routed through Web Audio. Cross-origin files need CORS headers and crossOrigin=\"anonymous\" on the element, or the browser outputs silence.",
    "Each audio element can feed only one Web Audio graph, so every Equalizer on the same element shares one analyser.",
    "The canvas pauses while it's off screen or the tab is hidden, and redraws at the device pixel ratio (capped at 2) when it resizes.",
    "With reduced motion, simulated bars hold one still frame. Real audio still reads out, a few times a second and without easing.",
  ],
};
