# NeonKit

Neon UI components for React and Tailwind. Calm at rest, lit when it matters. Copy them in or add them with the shadcn CLI. Either way the code is yours.

Live at [get-neonkit.vercel.app](https://get-neonkit.vercel.app).

## Add a component

NeonKit is a [shadcn registry](https://ui.shadcn.com/docs/registry), so one command writes the file, installs its dependencies and adds the color helper:

```bash
npx shadcn@latest add https://get-neonkit.vercel.app/r/button.json
```

New to shadcn? Run `npx shadcn@latest init` first. Prefer to paste? Every component page has a Manual tab with the full source.

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

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the component rules.

## License

MIT. See [LICENSE](./LICENSE).
