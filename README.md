# NeonKit

Neon UI components for React and Tailwind. Calm at rest, lit when it matters. Copy them in or add them with the shadcn CLI. Either way the code is yours.

**[get-neonkit.vercel.app](https://get-neonkit.vercel.app)** · [Components](https://get-neonkit.vercel.app/components) · [Blocks](https://get-neonkit.vercel.app/blocks) · [Use with AI](https://get-neonkit.vercel.app/docs/ai) · [Request a component](https://get-neonkit.vercel.app/request)

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

- **Forms:** Button, Input, Textarea, Select, Checkbox, Radio Group, Switch, Slider, OTP Input
- **Data display:** Badge, Avatar, Card, Kbd, Tabs, Accordion
- **Feedback:** Progress, Spinner, Skeleton, Alert, Toast
- **Overlay:** Dialog, Tooltip
- **Effects:** Neon Text, Border Beam, Spotlight Card, Retro Grid

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
