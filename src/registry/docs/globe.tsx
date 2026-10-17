import type { ComponentDoc } from "../types";
import GlobeDemo from "../examples/globe/demo";
import GlobeRoutes from "../examples/globe/routes";
import GlobeStill from "../examples/globe/still";

export const doc: ComponentDoc = {
  usage: `import { Globe } from "@/components/ui/globe"

<Globe
  markers={[
    { id: "fra", lat: 50.03, lng: 8.57, label: "fra1" },
    { id: "sin", lat: 1.36, lng: 103.99, label: "sin1" },
  ]}
  arcs={[{ from: "fra", to: "sin" }]}
/>`,
  examples: [
    {
      name: "demo",
      title: "Edge network",
      description: "Ten regions at their real coordinates; replication arcs fan out from iad1. Drag it, or focus it and use the arrow keys.",
      component: GlobeDemo,
    },
    {
      name: "routes",
      title: "Routes and a graticule",
      description: "Arcs take [lat, lng] pairs as well as marker ids. The graticule draws every 15°.",
      component: GlobeRoutes,
    },
    {
      name: "still",
      title: "Decoration",
      description: "Not interactive and spinning slowly: an image with a label, out of the tab order.",
      component: GlobeStill,
    },
  ],
  api: [
    {
      name: "Globe",
      description: "A canvas in a square, round box. Size it with a width class; it keeps its aspect.",
      props: [
        { prop: "markers", type: "GlobeMarker[]", default: "[]", description: "{ id?, lat, lng, label?, live? }. Labels draw beside the point and are read to screen readers; live: false draws a dim point with no pulse." },
        { prop: "arcs", type: "GlobeArc[]", default: "[]", description: "{ from, to }, each a marker id or [lat, lng]. Great-circle arcs lifted off the surface, each with a pulse of light." },
        { prop: "speed", type: "number", default: "6", description: "Auto-rotation in degrees per second. 0 holds it still." },
        { prop: "longitude", type: "number", default: "10", description: "Longitude facing the viewer at the start." },
        { prop: "tilt", type: "number", default: "20", description: "Latitude at the centre of the view; positive looks down on the north." },
        { prop: "interactive", type: "boolean", default: "true", description: "Drag to spin with inertia, and arrow keys when focused." },
        { prop: "arcDuration", type: "number", default: "2.6", description: "Seconds for a pulse to cross an arc." },
        { prop: "graticule", type: "boolean", default: "false", description: "Parallels and meridians every 15°." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Color of the land, rim, arcs and markers." },
      ],
    },
  ],
  notes: [
    "Interactive globes are a focusable group with a 'globe' role description and instructions linked by aria-describedby. Left and Right turn 15° (45° with Shift), Up and Down tilt 10°, Home resets the view.",
    "The accessible name lists the labelled markers, so the locations are available without seeing the canvas. Pass aria-label to say more.",
    "The land is a 1° grid from Natural Earth's 1:110m coastline, about 3 kB in the file. No three.js, no WebGL, no fetch.",
    "Dots are spaced about 5.5 pixels apart at any size and drawn in six batches by depth, so a frame is a handful of fills.",
    "Drawing stops off screen and in background tabs. With reduced motion it draws one still frame; dragging and the arrow keys still turn it, without inertia.",
    "Touch drags turn it sideways only; vertical swipes still scroll the page.",
  ],
};
