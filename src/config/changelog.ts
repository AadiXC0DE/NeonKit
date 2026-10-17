/** Release notes. Components added in each version are pulled from registry.json `addedIn`. */
export type Release = {
  version: string;
  date: string; // ISO
  title: string;
  notes: string[];
};

export const releases: Release[] = [
  {
    version: "1.7",
    date: "2026-10-18",
    title: "Lights on",
    notes: [
      "New backgrounds: Dot Grid, Circuit, Lasers, Tunnel, Sunset and Haze. New effects and helpers: Signal Beam, Globe, Sparks, Rotating Text, Scroll Progress and Device Frame. And the pieces people kept asking for: Tour, Password Input, Heatmap, Suggestions and Aspect Ratio.",
      "Five new blocks built on them: a Globe Hero for edge networks, Integrations with live signal beams, a Sunset Hero for a synthwave launch, a Lasers CTA, and a Device section where a phone and a laptop run the same app.",
      "A design language page at /docs/design: glow as light, when things are allowed to glow, type, motion, radius and how the icons are built. The landing page now shows the system and the icon set live.",
      "102 new icons, 412 in all: Save, Clipboard, History, Shield, Battery, Printer, the heading and list glyphs, money, charts, health and more, each drawn to the same tube rules. Icons also answer to every lucide-react name for the glyphs they draw, including the CheckIcon-style names shadcn's own components import, so moving a project over is a change of import path.",
      "Every component page can open itself in v0, ChatGPT or Claude, next to Copy as Markdown. Block pages open in v0.",
      "Field errors now light Input, Textarea, Select and Number Input red, and disabled solid buttons are no longer lit. The new accessibility gate turned up about twenty smaller fixes across components, examples and templates.",
      "Galleries are much lighter. Previews boot one at a time between scrolls, only what's on screen animates, and frames in a sideways strip no longer reload each time they slide out. Meter now draws one halo per row instead of one per segment, which took Features Bento from 10 to 60 frames a second, and Retro Grid's floor is a fifth of the size it was, so pages that change while it moves no longer stutter.",
      "NeonKit moved to neonkit.heyaadi.com. The old address redirects, registry URLs included.",
      "Size budgets in the test suite: every component's source and its installed footprint are checked on each change.",
    ],
  },
  {
    version: "1.6",
    date: "2026-10-18",
    title: "Agents, and a lighting desk",
    notes: [
      "Seven AI components for agent interfaces: Reasoning (a filament that glows while it thinks and cools when it's done), Tool Call with approval, Agent Plan, Sources with inline citations, Context Meter, Voice Input and Model Select. Chat Message now renders its reasoning and tool calls with them.",
      "Theme Studio at /theme: edit the palette, glow, radius, surface and motion on a live scene, then export globals.css variables, a lib/neon.ts, a link, or a registry item that shadcn add applies.",
      "--neon-glow scales every glow in the library. Set it to 0 for a flat dark UI, or up to 1.5 for signage.",
      "Stat was rebuilt: icons drawn as glass tube that light when live, a full-width trend, a goal meter, and rows that line up across a group whatever wraps.",
      "The icons page is now a specimen: each glyph lit at 192px with its construction drawn over it (grid, bend radii, blockouts), 16 sets, keyboard browsing. Calendar and Table gained the blockout gaps they were missing.",
      "Every older component was rechecked at desktop and phone widths, and 80-odd needed fixes. Date Picker no longer scrolls the page to the top when it opens. Submenus, the sidebar drawer and toasts stay on screen and above sticky headers. Gauge ticks no longer overlap, Retro Grid recedes in real perspective, Border Beam keeps one speed around corners, and labels that were cut off now wrap.",
      "Templates installed into a fresh shadcn app now bring their own fonts, and links inside buttons survive Base UI's render rewrite.",
    ],
  },
  {
    version: "1.5",
    date: "2026-10-15",
    title: "A full pass",
    notes: [
      "22 new components: Alert Dialog, Drawer, Menubar, Button Group, Input Group, Item, Empty, Data Table, Tree View, Resizable, Carousel, Stat, Donut Chart, Odometer, Status Light, Dock, Image Compare, Banner, Code Block, and an AI set of Chat Message, Prompt Input and Conversation.",
      "NeonKit icons: 310 glyphs drawn as bent glass tube, with blockout gaps where one tube passes behind another. Same names and props as lucide-react, and the library no longer depends on it.",
      "Every existing component was rechecked. Custom controls now reset with their form and validate when required, asChild triggers work with children passed from server pages, nested dialogs close one at a time, and hydration mismatches in a handful of instruments are gone.",
      "A new site: Mona Sans and Fragment Mono, a landing page you can play with, and component, block, template and docs pages rebuilt to match.",
      "Every block and template was redrawn: fewer boxes, one dominant idea per section, and light only where it means something.",
    ],
  },
  {
    version: "1.4",
    date: "2026-10-14",
    title: "Templates",
    notes: [
      "Complete Next.js sites built from NeonKit components: a SaaS landing with a pricing page, a deploy dashboard, a portfolio with a lights-off mode, a launch event that changes as the doors open, and a docs starter.",
      "One shadcn command installs a template's pages, its sections and every component it uses. Change one color in its config and the whole site re-tints.",
      "Scrolling over a block preview always moves the page: previews no longer catch the first pixels of a scroll, inner panes hand off at their ends, and a knob only takes the wheel once you've picked it up.",
      "Works in Base UI shadcn projects too. The CLI rewrites asChild to render there, and every NeonKit component now accepts both.",
      "A loading Button keeps keyboard focus. Sheets and the sidebar drawer hand focus back properly, and dim labels across the library now pass contrast.",
      "A polish pass over every block: focus that no longer drops to the page, bigger tap targets on phones, and fixes found at 390 px.",
    ],
  },
  {
    version: "1.3",
    date: "2026-10-13",
    title: "Blocks",
    notes: [
      "Whole sections built from NeonKit components: navbars, heroes, features, pricing, testimonials, FAQs, calls to action, footers, auth screens, app screens and marketing pages.",
      "Every block works in the preview. Forms validate, tabs switch, cards move, players play. Each one holds up at desktop, tablet and phone widths.",
      "One shadcn command adds a block and every component it uses. Change the color at the block's root and everything inside follows.",
      "A page for every block, with a viewport switcher, the source and install steps.",
    ],
  },
  {
    version: "1.2",
    date: "2026-10-12",
    title: "Signature neon",
    notes: [
      "The pieces nobody else has: a full neon sign with backplate, cable and flicker profiles, a split-flap departures board, seven-segment and LED matrix displays.",
      "Instruments you can actually use as form controls: knobs, faders, hardware switches and gauges, plus live signal displays (meters, oscilloscope, radar, heartbeat) and glow charts.",
      "Backgrounds and surfaces: cityscape, aurora, starfield, light rays, rain on glass, particles, hologram cards and a CRT overlay.",
      "Effect buttons: shimmer, pulse, magnetic, power, cyber and hold-to-confirm.",
    ],
  },
  {
    version: "1.1",
    date: "2026-10-11",
    title: "The standard set",
    notes: [
      "Menus, popovers, a command palette, sheets, date and time pickers, tables, steppers, a sidebar and more: the primitives every app needs, each with its own neon detail.",
      "Components can build on each other. The CLI installs Date Picker together with Calendar and Popover.",
      "Menus and popovers flip and shift to stay on screen and carry their color through portals.",
      "Live component gallery, collapsible sidebar and a changelog.",
    ],
  },
  {
    version: "1.0",
    date: "2026-10-11",
    title: "The revamp",
    notes: [
      "Every component rebuilt around one CSS variable, --neon. Pass a palette name or any hex, or inherit it from a parent.",
      "Installable with the shadcn CLI, plus the @neonkit namespace and the shadcn MCP server.",
      "New docs, a new landing page, llms.txt and a markdown version of every page.",
    ],
  },
];
