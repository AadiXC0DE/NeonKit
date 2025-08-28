# NeonKit

A modern, dark mode UI component library with electric neon accents. Copy and paste beautiful JSX components with Tailwind classes directly into your project.

## Quick Start

Copy and paste components directly into your project. No complex setup required!

```bash
npm install framer-motion clsx tailwind-merge lucide-react
```

Add the `cn` utility function:

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## 📁 Project Structure

This repository contains:

- **`src/components/`** - The actual component library source files
- **`app/components/`** - Interactive documentation site showcasing components with copy-paste JSX
- **`bin/`** - CLI tools for easy component installation
- **`src/lib/`** - Utility functions and type definitions

When you "copy and paste" components, you get the full JSX with Tailwind classes.

## ✨ Features

- 🎯 **Copy & Paste JSX** - Get complete JSX with Tailwind classes, no props needed
- 🌙 **Dark Mode Only** - Optimized for dark themes where neon effects shine
- 🎨 **7 Neon Variants** - Pre-built electric color combinations
- ⚡ **Framer Motion Animations** - Smooth, accessible micro-interactions
- 🔧 **TypeScript Ready** - Full type safety and IntelliSense
- 📱 **Responsive Design** - Works beautifully on all devices
- ♿ **Accessibility Built-in** - WCAG AA compliant, keyboard navigation
- 🏗️ **Tailwind Classes** - Direct styling, easy customization

## 🎨 Neon Variants

NeonKit provides 7 stunning neon variants that you copy as complete JSX:

```jsx
{/* Neon Cyan - Primary accent */}
<button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden h-10 px-4 py-2 bg-slate-950/90 border-2 border-cyan-400/60 text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400 hover:text-cyan-300 hover:shadow-[0_0_20px_rgb(34,211,238,0.4)] focus-visible:ring-cyan-400/50 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-cyan-400/0 before:via-cyan-400/10 before:to-cyan-400/0 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500">
  Neon Cyan
</button>

{/* Neon Purple - Secondary accent */}
<button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden h-10 px-4 py-2 bg-slate-950/90 border-2 border-purple-400/60 text-purple-400 hover:bg-purple-400/10 hover:border-purple-400 hover:text-purple-300 hover:shadow-[0_0_20px_rgb(168,85,247,0.4)] focus-visible:ring-purple-400/50 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-400/0 before:via-purple-400/10 before:to-purple-400/0 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500">
  Neon Purple
</button>

{/* Neon Chartreuse - Success/highlight */}
<button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden h-10 px-4 py-2 bg-slate-950/90 border-2 border-lime-400/60 text-lime-400 hover:bg-lime-400/10 hover:border-lime-400 hover:text-lime-300 hover:shadow-[0_0_20px_rgb(163,230,53,0.4)] focus-visible:ring-lime-400/50 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-lime-400/0 before:via-lime-400/10 before:to-lime-400/0 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500">
  Neon Chartreuse
</button>

{/* Neon Destructive - Delete/warning actions */}
<button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden h-10 px-4 py-2 bg-slate-950/90 border-2 border-red-400/60 text-red-400 hover:bg-red-400/10 hover:border-red-400 hover:text-red-300 hover:shadow-[0_0_20px_rgb(248,113,113,0.4)] focus-visible:ring-red-400/50 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-red-400/0 before:via-red-400/10 before:to-red-400/0 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500">
  Delete
</button>
```

## 📋 Available Components

### Buttons

Copy complete button JSX with these variants:

- **Standard**: `default`, `destructive`, `outline`, `secondary`, `ghost`
- **Neon**: `neon-cyan`, `neon-purple`, `neon-chartreuse`, `neon-pink`, `neon-destructive`, `neon-success`, `neon-warning`

### Inputs

Copy complete input JSX with neon styling:

```jsx
{/* Neon Cyan Input */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-cyan-100">Username</label>
  <input
    className="flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 bg-slate-950/50 border-2 border-cyan-400/60 text-cyan-100 font-medium placeholder:text-cyan-200/70 focus-visible:border-cyan-400 focus-visible:ring-cyan-400/50 focus-visible:shadow-[0_0_15px_rgb(34,211,238,0.3)] hover:border-cyan-400/80 hover:shadow-[0_0_10px_rgb(34,211,238,0.2)] backdrop-blur-sm"
    placeholder="Enter username..."
  />
</div>
```

### Cards

Copy complete card JSX with neon effects:

```jsx
{/* Neon Feature Card */}
<div className="relative rounded-lg border-2 bg-slate-950/90 backdrop-blur-sm p-6 transition-all duration-300 hover:translate-y-[-4px] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:via-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 border-cyan-400/50 hover:border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.15)] hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] before:from-cyan-400/10 before:to-cyan-400/5">
  <div className="relative z-10">
    <h3 className="text-xl font-semibold mb-2 text-white">Feature Title</h3>
    <p className="text-gray-300">Feature description with neon accents.</p>
  </div>
</div>
```

## 🎯 Copy & Paste Philosophy

Following the shadcn/ui approach, you get **complete JSX with Tailwind classes**:

✅ **Ready to Use** - Copy JSX directly, no setup needed  
✅ **Full Customization** - Modify Tailwind classes as needed  
✅ **No Dependencies** - Pure JSX + Tailwind classes  
✅ **Dark Mode Optimized** - Built for dark themes

## 🛠️ How It Works

1. **Browse Components** - Visit the documentation site
2. **Copy JSX** - Click "Code" tab and copy the JSX
3. **Paste & Customize** - Modify Tailwind classes as needed
4. **No Installation** - Just JSX with Tailwind classes

## 📖 Documentation Site

Visit our documentation site to:

- See live component examples
- Copy complete JSX code
- View all neon variants
- Get installation instructions

```bash
npm run dev
```

Then visit `http://localhost:3000/components` to explore!

## 🎨 Design Philosophy

NeonKit follows these core principles:

1. **Dark Mode Only** - Neon effects work best in dark environments
2. **Electric Accents** - Strategic neon highlights, not overwhelming
3. **Copy-Paste Ready** - Complete JSX with Tailwind classes
4. **Accessibility First** - WCAG AA compliant
5. **Performance Optimized** - Smooth animations, efficient CSS
6. **Developer Experience** - TypeScript support, great DX

## 🌈 Neon Color System

**Primary Neons:**

- 🔵 **Cyan** - `#22d3ee` (primary actions)
- 🟣 **Purple** - `#a855f7` (secondary actions)
- 🟢 **Chartreuse** - `#a3e635` (success states)

**Specialized Neons:**

- 🩷 **Pink** - `#f472b6` (special actions)
- 🔴 **Red** - `#f87171` (destructive actions)
- 🟢 **Emerald** - `#34d399` (success confirmations)
- 🟡 **Amber** - `#fbbf24` (warning states)

## 🏗️ Built With

- **React** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling system (core to copy-paste approach)
- **Framer Motion** - Smooth animations
- **Next.js** - Documentation site
- **Dark Mode** - Exclusive focus for neon aesthetics

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🌟 Inspiration

NeonKit is inspired by:

- [shadcn/ui](https://ui.shadcn.com) - Copy & paste philosophy
- [Aceternity UI](https://ui.aceternity.com) - Modern design patterns
- Modern neon aesthetics and cyberpunk design

---

**Made with 💙 by the NeonKit team**

_"Beautiful neon components, copy-paste ready, dark mode only."_
