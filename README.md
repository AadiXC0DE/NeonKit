# NeonKit

Dark mode React components with neon accents. No install, no provider, no theme object. Copy the JSX, paste it, move on.

Live at [get-neonkit.vercel.app](https://get-neonkit.vercel.app).

## Use a component

Open one on the site, hit the code tab, copy the JSX into your project. The Tailwind classes come with it.

Four packages, once:

```bash
npm install framer-motion clsx tailwind-merge lucide-react
```

And the `cn` helper in `lib/utils.ts`:

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## The neon variants

Seven accents, copied as complete JSX rather than driven by props.

Cyan `#22d3ee` for primary actions, purple `#a855f7` for secondary, chartreuse `#a3e635` for success, pink `#f472b6` for the odd one out, red `#f87171` for destructive, emerald `#34d399` for confirmations, amber `#fbbf24` for warnings.

```jsx
<button className="relative h-10 overflow-hidden rounded-md border-2 border-cyan-400/60 bg-slate-950/90 px-4 py-2 text-sm font-semibold text-cyan-400 backdrop-blur-sm transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-400/10 hover:text-cyan-300 hover:shadow-[0_0_20px_rgb(34,211,238,0.4)]">
  Neon Cyan
</button>
```

## Components

Buttons come in the usual set (default, destructive, outline, secondary, ghost) plus the seven neon variants. Inputs carry the same accents with a focus glow. Cards lift on hover and hold a soft border light.

## Run the docs site

```bash
npm install
npm run dev
```

Every component has a copy button at `http://localhost:3000/components`.

## How it's laid out

`src/components/` is the library. `app/components/` is the docs site you just ran. `bin/` has the CLI helpers, and `src/lib/` has the utilities and types.

Tailwind, TypeScript, Motion for the interactions, Next.js for the site. Dark only, since that is where the glow reads properly.

## License

MIT. See [LICENSE](./LICENSE).
