# Contributing to NeonKit

Every component is a single file people copy into their own project. That shapes all the rules below: the file has to work on its own, read well, and survive whatever Tailwind setup it lands in.

## Layout

```
src/components/ui/<slug>.tsx        the component (this is what users copy)
src/registry/registry.json          name, category, description, npm deps, addedIn
src/registry/docs/<slug>.tsx        docs: usage, examples, API table, a11y notes
src/registry/examples/<slug>/*.tsx  live examples, shown with their source
src/lib/neon.ts                     palette + neonVars() helper
src/lib/utils.ts                    cn()
```

`npm run registry:build` turns the registry into shadcn-compatible JSON in `public/r/`.

## Component rules

**Imports.** Only `react`, `react-dom`, `@/lib/utils`, `@/lib/neon`, and the npm packages listed for the component in `registry.json` (`motion`, `lucide-react`, `@radix-ui/react-slot`, `@floating-ui/react-dom`). Import motion from `motion/react`.

**Building on other components.** A component may import another NeonKit component from `@/components/ui/<slug>` only when its registry entry lists that slug in `registryDependencies`. The CLI then installs both. The build fails on any mismatch either way. Prefer composition (Date Picker = Calendar + Popover) over copying internals.

**Anchored overlays** (menus, popovers, hover cards, comboboxes):

- Position with `@floating-ui/react-dom`: `useFloating({ placement, whileElementsMounted: autoUpdate, middleware: [offset(8), flip(), shift({ padding: 8 })] })`, plus `size()` when the panel should match or cap to the trigger and viewport.
- Render the panel in a portal (`createPortal(…, document.body)`) so `overflow: hidden` ancestors can't clip it. A portal leaves the DOM subtree, so copy the trigger's resolved color onto the panel when it opens: read `getComputedStyle(trigger).getPropertyValue("--neon")` and set both `--neon` and `--neon-accent` inline.
- Close on Escape and outside pointer down, return focus to the trigger, and keep `aria-expanded`/`aria-controls` in sync.

**Color.** Every component takes `color?: NeonColor` and reads it through one CSS variable:

```tsx
<div
  style={neonVars(color, style)}
  className={cn("[--neon:var(--neon-accent,34_211_238)]", "...", className)}
/>
```

- The first class sets the default: inherit `--neon-accent` from an ancestor, otherwise cyan. `neonVars` overrides it inline when `color` is passed.
- Use the variable through arbitrary values only: `text-[rgb(var(--neon))]`, `bg-[rgb(var(--neon)/0.12)]`, `border-[rgb(var(--neon)/0.6)]`, `shadow-[0_0_18px_rgb(var(--neon)/0.45)]`, `[text-shadow:0_0_10px_rgb(var(--neon)/0.6)]`.
- Omit `"color"` from the native props you extend: `Omit<React.HTMLAttributes<...>, "color">`.

**Tailwind 3 and 4 both.** Users copy into either, so:

- No theme tokens from this site (`bg-background`, `text-muted`, `font-neon`). Neutrals come from `white/<alpha>`, `black/<alpha>`, or arbitrary hex like `bg-[#0a0b11]`.
- Always give borders an explicit color.
- Avoid utilities that were renamed between v3 and v4: `shadow-sm`, `shadow`, `rounded`, `rounded-sm`, `blur`, `blur-sm`, `backdrop-blur-sm`, `drop-shadow`, `ring` (bare), `outline` (bare), `bg-gradient-to-*`, `flex-shrink-*`, `flex-grow-*`, `bg-opacity-*`. Use `rounded-md`/`lg`/`xl`/`full`, arbitrary shadows, `bg-[linear-gradient(...)]`, `shrink-0`, `ring-1`/`ring-2`.
- No custom keyframes from a Tailwind config. Use built-ins (`animate-spin`, `animate-pulse`, `animate-ping`) with `[animation-duration:..]`, motion, or a `<style>` tag inside the component.

**Surfaces.** Dark only. Default palette:

| Role              | Class                                  |
| ----------------- | -------------------------------------- |
| Page              | `#05060a`                              |
| Raised surface    | `bg-white/[0.03]` + `border-white/10`  |
| Popover / overlay | `bg-[#0a0b11]` + `border-white/10`     |
| Text              | `text-white/90`                        |
| Secondary text    | `text-white/55`                        |
| Placeholder       | `placeholder:text-white/30`            |

**Glow is a signal.** Light up interactive or active state (focus, checked, selected, hover) and leave resting UI calm. One element per component carries the strongest glow.

**Motion.** Enter and exit with ease-out, `cubic-bezier(0.23, 1, 0.32, 1)`, 150–250ms. Start from `scale(0.96)`, never `scale(0)`. Use `active:scale-[0.97]` for pressables. Only animate `transform`, `opacity`, `box-shadow` and colors. Honour reduced motion: `useReducedMotion()` from motion, or `motion-reduce:` variants.

**Accessibility.** Native elements first (`button`, `input`, `dialog`). Use correct roles and `aria-*` attributes. Every pointer interaction also works from the keyboard. Visible focus uses `focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]`.

**API.** Follow the existing names: `color`, `variant`, `size` (`"sm" | "md" | "lg"`), `disabled`. Use `checked`/`defaultChecked`/`onCheckedChange` and `value`/`defaultValue`/`onValueChange` for controlled and uncontrolled pairs. Use `React.forwardRef` so the file works on React 18 and 19. Spread `...props` onto the root element and set `displayName`.

**Code style.** `"use client"` at the top when the file uses hooks or events. Two-space indent, double quotes, semicolons. Keep comments to the ones that explain a non-obvious why. Put named exports at the bottom.

## Blocks

Blocks are whole sections (heroes, pricing, auth screens, app shells) built from the components. Same rules as components, plus:

- **File.** `src/components/blocks/<slug>.tsx`, one file with a default export. List it in `registry.json` → `blocks` with `dependencies`, `registryDependencies`, `addedIn` and the preview `height`. The build fails if the imports and the entry disagree.
- **Imports.** `react`, `@/lib/utils`, `@/lib/neon`, NeonKit components and listed npm packages. No `next/*`: blocks get pasted into any React app.
- **Color.** Set it once at the root with `style={neonVars("<color>")}` and a comment saying so. Everything inside inherits it.
- **Content.** A believable fictional product with specific copy and numbers, kept in constants at the top of the file. Anything that looks interactive works in the preview: forms validate and show a success state, tabs switch, filters filter.
- **Layout.** Holds up at 1440, 768 and 390 px with no horizontal page scroll. Heroes have one `h1`. Sections that sit inside a page (features, pricing, footers…) use `h2`.
- **Preview.** Each block renders alone at `/view/<slug>` and in the gallery at `/blocks/<slug>`. After adding or changing one, refresh its thumbnail against a production build: `npm run build && npm start`, then `npm run thumbs -- <slug>`.

## Templates

Templates are complete Next.js sites (several pages, one brand, one color) built from the components. They install into an app router project, so unlike blocks they may use `next/*`.

- **Files.** Sections in `src/components/templates/<slug>/`, routes in `app/preview/<slug>/`. They install to `components/templates/<slug>/` and `app/<slug>/`. List the template in `registry.json` → `templates` with `dependencies`, `registryDependencies`, `addedIn` and its `routes` (`""` first).
- **Config.** `config.ts` exports `basePath = "/preview/<slug>"`, `color` and `brand`. Every link between pages starts from `basePath`; the registry build rewrites it to `/<slug>` and fails if `/preview/<slug>` appears anywhere else.
- **Imports.** `react`, `next`, `next/*`, `@/lib/utils`, `@/lib/neon`, listed NeonKit components, files inside the template and listed npm packages.
- **Next.js.** Must build in an app with `cacheComponents` on (the `create-next-app` default): no `dynamicParams` or other segment config it rejects; unknown params call `notFound()`.
- **Pages.** One `h1` and a `main` per page, a skip link, metadata, an Open Graph image. Same contrast, layout and interaction bar as blocks.
- **Preview.** Each route renders at `/preview/<slug><route>` (no-indexed) and in the gallery at `/templates/<slug>`. Refresh screenshots against a production build with `npm run thumbs -- <slug>`.

## Examples and docs

- Each example is a default-exported component in `src/registry/examples/<slug>/<name>.tsx`. Readers copy these, so imports point at `@/components/ui/...` and the content is realistic. No lorem ipsum, no "Option 1".
- The first example (`demo`) is the hero preview and should show the component at its best.
- The preview canvas has a `--neon-accent` picker. Examples that leave `color` unset follow it, so only set `color` where the example is about color.
- `src/registry/docs/<slug>.tsx` exports `doc: ComponentDoc` (see `src/registry/types.ts`).

## Checks

```bash
npm run type-check
npm run lint
npm test
npm run build
```
