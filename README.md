# NeonKit

Neon UI components for React and Tailwind. Calm at rest, lit when it matters. Copy them in or add them with the shadcn CLI. Either way the code is yours.

**[get-neonkit.vercel.app](https://get-neonkit.vercel.app)** · [Components](https://get-neonkit.vercel.app/components) · [Blocks](https://get-neonkit.vercel.app/blocks) · [Templates](https://get-neonkit.vercel.app/templates) · [Use with AI](https://get-neonkit.vercel.app/docs/ai) · [Request a component](https://get-neonkit.vercel.app/request)

![NeonKit](https://get-neonkit.vercel.app/opengraph-image)

## Add a component

NeonKit is a [shadcn registry](https://ui.shadcn.com/docs/registry), so one command writes the file, installs its dependencies and adds the color helper:

```bash
npx shadcn@latest add https://get-neonkit.vercel.app/r/switch.json
```

New to shadcn? Run `npx shadcn@latest init` first, and add `--overwrite` if a component with the same name already exists. Prefer to paste? Every component page has a Manual tab with the full source.

Or register the namespace once in `components.json` and use short names:

```json
{ "registries": { "@neonkit": "https://get-neonkit.vercel.app/r/{name}.json" } }
```

```bash
npx shadcn@latest add @neonkit/switch @neonkit/tabs @neonkit/toast
```

## Add a block

[Blocks](https://get-neonkit.vercel.app/blocks) are whole sections built from the components: navbars, heroes, pricing, testimonials, auth screens, app shells and more. Each one works in the preview and holds up from desktop to phone. The same command adds a block and every component it uses:

```bash
npx shadcn@latest add https://get-neonkit.vercel.app/r/hero-city.json
```

## Start from a template

[Templates](https://get-neonkit.vercel.app/templates) are complete Next.js sites: a SaaS landing, a dashboard, a portfolio, a launch event and a docs starter. One command writes the pages to `app/<name>`, their sections to `components/templates/<name>` and installs every component they use:

```bash
npx shadcn@latest add https://get-neonkit.vercel.app/r/saas.json
```

Each template keeps its color, brand and base path in one `config.ts`. Change the color there and the whole site follows.

| Template | What you get | Install |
| --- | --- | --- |
| `saas` | Nightshift, a deploy scheduler. A lit 2am hero, live night-run panel, install terminal, monthly/yearly pricing, customers, FAQ, an arming-switch CTA, and a `/pricing` page with the full plan comparison. | `npx shadcn@latest add https://get-neonkit.vercel.app/r/saas.json` |
| `dashboard` | Switchback, a deploy console. Sidebar shell with ⌘K, an overview with KPIs, chart and live status board, a filterable `/projects` table and tabbed `/settings` with a hold-to-confirm danger zone. Mock data is typed in `data.ts`. | `npx shadcn@latest add https://get-neonkit.vercel.app/r/dashboard.json` |
| `portfolio` | Juno Park, a design engineer. One page under a pendant lamp whose pull cord turns every light off: work, now, experience, writing and contact. | `npx shadcn@latest add https://get-neonkit.vercel.app/r/portfolio.json` |
| `launch` | Low Light, a one-night conference. A split-flap departure board counts down, flips to live, then to the replay. Speakers, agenda, venue, waitlist and a ticket. | `npx shadcn@latest add https://get-neonkit.vercel.app/r/launch.json` |
| `docs` | Gantry, a container CLI. Sidebar nav, ⌘K search, an outline that tracks your reading, package-manager tabs, callouts and prev/next. MDX-ready, plain TSX works too. | `npx shadcn@latest add https://get-neonkit.vercel.app/r/docs.json` |

**Changing it.** Open `components/templates/<name>/config.ts`:

```ts
export const basePath = "/saas";       // where you mounted it; every internal link starts here
export const color: NeonColor = "lime"; // a palette name or any hex re-tints the whole template
export const brand = "Nightshift";      // the product name in the nav, footer and metadata
```

Move the route by moving `app/<name>` and updating `basePath`. Each template loads its own fonts (`fonts.ts`), so it looks the same in a fresh app as in the preview.

**In a fresh shadcn app**, `shadcn init` already wrote a `button.tsx`, so `shadcn add` stops at an overwrite prompt. Pass `--overwrite` to replace it with NeonKit's, which accepts both `asChild` and Base UI's `render`.

## With AI agents

Point Cursor, Copilot, v0 or any coding agent at [`/llms.txt`](https://get-neonkit.vercel.app/llms.txt). Every component page has a markdown version (add `.md` to the URL), and with the namespace above the [shadcn MCP server](https://get-neonkit.vercel.app/docs/ai#mcp) can search and install NeonKit for you.

## Color

Every component reads one CSS variable, `--neon`. You can set it three ways:

```tsx
<Button color="magenta">Ship it</Button>    // a palette name
<Button color="#ff6a00">Export</Button>     // any hex

<section style={neonVars("lime")}>…</section> // everything inside
```

Or set it app-wide in CSS: `:root { --neon-accent: 163 230 53; }`. Leave it alone and you get cyan.

## Components

122 components, 55 blocks and 5 templates.

- **Foundations** (1): Icons
- **Forms** (21): Button, Input, Textarea, Select, Checkbox, Radio Group, Switch, Slider, OTP Input, Toggle Group, Combobox, Tag Input, Number Input, File Dropzone, Rating, Color Picker, Calendar, Date Picker, Time Input, Field, Input Group
- **Buttons** (8): Shimmer Button, Pulse Button, Magnetic Button, Power Button, Cyber Button, Hold Button, Copy Button, Button Group
- **Data Display** (14): Badge, Avatar, Card, Kbd, Tabs, Accordion, Table, Timeline, Glow Chart, Code Block, Data Table, Stat, Donut Chart, Image Compare
- **Navigation** (8): Breadcrumb, Pagination, Stepper, Navigation Menu, Sidebar, Menubar, Tree View, Dock
- **Overlay** (10): Dialog, Tooltip, Dropdown Menu, Context Menu, Popover, Hover Card, Command, Sheet, Alert Dialog, Drawer
- **Feedback** (8): Progress, Spinner, Skeleton, Alert, Toast, Empty, Status Light, Banner
- **Layout** (6): Separator, Scroll Area, Collapsible, Item, Resizable, Carousel
- **AI** (10): Chat Message, Prompt Input, Conversation, Reasoning, Tool Call, Agent Plan, Sources, Context Meter, Voice Input, Model Select
- **Text** (9): Neon Text, Neon Sign, Glitch Text, Scramble Text, Terminal, Split-Flap Board, Seven-Segment Display, LED Matrix, Odometer
- **Instruments** (11): Knob, Fader, Hardware Switch, Gauge, Meter, Equalizer, Oscilloscope, Radar, Heartbeat, Countdown, Neon Clock
- **Effects** (9): Border Beam, Spotlight Card, Hologram Card, Neon Frame, Tube Divider, CRT Overlay, Cursor Glow, Marquee, Neon Icon
- **Backgrounds** (7): Retro Grid, Aurora, Starfield, Light Rays, Cityscape, Rain on Glass, Particles

All of them work on React 18 and 19 and Tailwind 3.4 and 4. They use native elements where possible, are keyboard accessible, and respect reduced motion.

## Run the site

```bash
npm install
npm run dev
```

`npm run build` also regenerates the registry JSON in `public/r/` and fails if a component imports something its registry entry doesn't declare.

## Layout

```
src/components/ui/        the components (what people copy)
src/lib/neon.ts           palette + neonVars()
src/registry/             metadata, docs, live examples
app/                      the docs site
scripts/build-registry.mjs
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the component rules. Missing a component? [Request it](https://get-neonkit.vercel.app/request).

## Support

NeonKit is free and built by one person. If it helps you, [sponsor on GitHub](https://github.com/sponsors/AadiXC0DE), [buy me a coffee](https://www.buymeacoffee.com/AadiChowdhury7), or just star the repo. It helps other people find it.

Built by [@AadiChowdhury7](https://x.com/AadiChowdhury7).

## License

MIT. See [LICENSE](./LICENSE).
