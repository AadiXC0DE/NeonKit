"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/button"
import { Copy, Check, Code, Palette, Eye, Loader2, Heart, Download, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { COLOR_PRESETS } from "@/lib/colors"

const buttonComponentSource = `"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { NeonAccent, CustomNeonColor } from "@/types/theme"
import { getNeonColor } from "@/types/theme"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        neon: "border-2 font-medium backdrop-blur-sm bg-background/80 hover:bg-background/60 transition-all duration-300",
        gradient: "bg-gradient-to-r text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-14 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
      },
      accent: {
        blue: "",
        purple: "",
        chartreuse: "",
        custom: "",
      },
    },
    compoundVariants: [
      {
        variant: "neon",
        accent: "blue",
        class: "border-[#00FFC3] text-[#00FFC3] hover:bg-[#00FFC3] hover:text-black hover:shadow-[0_0_10px_currentColor]",
      },
      {
        variant: "neon",
        accent: "purple",
        class: "border-[#D300FF] text-[#D300FF] hover:bg-[#D300FF] hover:text-white hover:shadow-[0_0_10px_currentColor]",
      },
      {
        variant: "neon",
        accent: "chartreuse",
        class: "border-[#BFFF00] text-[#BFFF00] hover:bg-[#BFFF00] hover:text-black hover:shadow-[0_0_10px_currentColor]",
      },
      {
        variant: "gradient",
        accent: "blue",
        class: "from-[#00FFC3] to-blue-600 hover:from-[#00FFC3]/90 hover:to-blue-600/90",
      },
      {
        variant: "gradient",
        accent: "purple",
        class: "from-[#D300FF] to-purple-600 hover:from-[#D300FF]/90 hover:to-purple-600/90",
      },
      {
        variant: "gradient",
        accent: "chartreuse",
        class: "from-[#BFFF00] to-green-600 hover:from-[#BFFF00]/90 hover:to-green-600/90",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      accent: "blue",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  accent?: NeonAccent
  customColor?: CustomNeonColor
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, accent, customColor, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const customStyles = React.useMemo(() => {
      if ((variant === "neon" || variant === "gradient") && accent === "custom" && customColor) {
        const color = getNeonColor(accent, customColor)
        if (variant === "neon") {
          return {
            "--custom-neon-color": color.primary,
            "--custom-neon-shadow": color.shadow || color.primary,
            borderColor: color.primary,
            color: color.primary,
          } as React.CSSProperties
        }
        if (variant === "gradient") {
          return {
            background: \`linear-gradient(to right, \${color.primary}, \${color.primary}dd)\`,
          } as React.CSSProperties
        }
      }
      return {}
    }, [variant, accent, customColor])

    const customClassName = (variant === "neon" || variant === "gradient") && accent === "custom" ? 
      variant === "neon" 
        ? "hover:bg-[var(--custom-neon-color)] hover:text-black hover:shadow-[0_0_10px_var(--custom-neon-shadow)]"
        : "hover:opacity-90"
      : ""

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
      >
        <Comp
          className={cn(buttonVariants({ variant, size, accent }), customClassName, className)}
          style={customStyles}
          ref={ref}
          disabled={disabled || loading}
          {...props}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {children}
        </Comp>
      </motion.div>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }`

const utilsSource = `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`

const themeTypesSource = `export type NeonAccent = "blue" | "purple" | "chartreuse" | "custom"

export interface CustomNeonColor {
  primary: string
  shadow?: string
}

export const getNeonColor = (accent: NeonAccent, customColor?: CustomNeonColor) => {
  if (accent === "custom" && customColor) {
    return {
      primary: customColor.primary,
      shadow: customColor.shadow || customColor.primary,
    }
  }
  
  const colors = {
    blue: { primary: "#00FFC3", shadow: "#00FFC3" },
    purple: { primary: "#D300FF", shadow: "#D300FF" },
    chartreuse: { primary: "#BFFF00", shadow: "#BFFF00" },
  }
  
  return colors[accent as keyof typeof colors] || colors.blue
}`

function ComponentSection({ 
  title, 
  description, 
  preview, 
  code
}: {
  title: string
  description: string
  preview: React.ReactNode
  code: string
}) {
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview")
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("preview")}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-colors",
            activeTab === "preview" 
              ? "bg-background text-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Eye className="w-4 h-4 mr-2 inline" />
          Preview
        </button>
        <button
          onClick={() => setActiveTab("code")}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-colors",
            activeTab === "code" 
              ? "bg-background text-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Code className="w-4 h-4 mr-2 inline" />
          Code
        </button>
      </div>

      {/* Content */}
      <div className="border rounded-lg overflow-hidden">
        {activeTab === "preview" ? (
          <div className="p-8 bg-gradient-to-br from-background to-muted/20">
            <div className="flex items-center justify-center min-h-[200px]">
              {preview}
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="flex items-center justify-between p-4 border-b bg-muted/50">
              <span className="text-sm font-medium">components/ui/button.tsx</span>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-3 py-1 rounded-md bg-background border hover:bg-accent transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-sm bg-background">
              <code>{code}</code>
            </pre>
          </div>
        )}
      </div>


    </div>
  )
}

export default function ButtonsPage() {
  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          Button Components
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Flexible button components with multiple variants, sizes, and unlimited custom colors. Copy and paste into your project.
        </p>
      </motion.div>

      <div className="space-y-16">
        {/* Neon Buttons */}
        <ComponentSection
          title="Neon Buttons"
          description="Electric neon buttons with glowing effects in multiple vibrant colors"
          preview={
            <div className="flex gap-4 flex-wrap">
              <Button variant="neon-cyan">
                Neon Cyan
              </Button>
              <Button variant="neon-purple">
                Neon Purple
              </Button>
              <Button variant="neon-chartreuse">
                Chartreuse
              </Button>
              <Button variant="neon-pink">
                Neon Pink
              </Button>
            </div>
          }
          code={`{/* Neon Cyan Button */}
<button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden h-10 px-4 py-2 bg-slate-950/90 border-2 border-cyan-400/60 text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400 hover:text-cyan-300 hover:shadow-[0_0_20px_rgb(34,211,238,0.4)] focus-visible:ring-cyan-400/50 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-cyan-400/0 before:via-cyan-400/10 before:to-cyan-400/0 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500">
  Neon Cyan
</button>

{/* Neon Purple Button */}
<button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden h-10 px-4 py-2 bg-slate-950/90 border-2 border-purple-400/60 text-purple-400 hover:bg-purple-400/10 hover:border-purple-400 hover:text-purple-300 hover:shadow-[0_0_20px_rgb(168,85,247,0.4)] focus-visible:ring-purple-400/50 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-400/0 before:via-purple-400/10 before:to-purple-400/0 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500">
  Neon Purple
</button>

{/* Chartreuse Button */}
<button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden h-10 px-4 py-2 bg-slate-950/90 border-2 border-lime-400/60 text-lime-400 hover:bg-lime-400/10 hover:border-lime-400 hover:text-lime-300 hover:shadow-[0_0_20px_rgb(163,230,53,0.4)] focus-visible:ring-lime-400/50 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-lime-400/0 before:via-lime-400/10 before:to-lime-400/0 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500">
  Chartreuse
</button>

{/* Neon Pink Button */}
<button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden h-10 px-4 py-2 bg-slate-950/90 border-2 border-pink-400/60 text-pink-400 hover:bg-pink-400/10 hover:border-pink-400 hover:text-pink-300 hover:shadow-[0_0_20px_rgb(244,114,182,0.4)] focus-visible:ring-pink-400/50 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-pink-400/0 before:via-pink-400/10 before:to-pink-400/0 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500">
  Neon Pink
</button>`}
        />

        {/* Basic Buttons Pure JSX */}
        <ComponentSection
          title="Basic Buttons"
          description="Copy-paste ready button styles without component dependencies"
          preview={
            <div className="flex gap-4 flex-wrap">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          }
          code={`{/* Default Button */}
<button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
  Default
</button>

{/* Secondary Button */}
<button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm">
  Secondary
</button>

{/* Outline Button */}
<button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm">
  Outline
</button>

{/* Ghost Button */}
<button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 hover:bg-accent hover:text-accent-foreground">
  Ghost
</button>`}
        />

        {/* Button Sizes - Pure JSX */}
        <ComponentSection
          title="Button Sizes"
          description="Different sizes for various use cases and content hierarchy"
          preview={
            <div className="flex items-center gap-4">
              <Button variant="neon-cyan" size="sm">Small</Button>
              <Button variant="neon-purple" size="default">Default</Button>
              <Button variant="neon-chartreuse" size="lg">Large</Button>
              <Button variant="neon-pink" size="xl">Extra Large</Button>
            </div>
          }
          code={`{/* Small Neon Button */}
<button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden h-9 px-3 bg-slate-950/90 border-2 border-cyan-400/60 text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400 hover:text-cyan-300 hover:shadow-[0_0_20px_rgb(34,211,238,0.4)] focus-visible:ring-cyan-400/50 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-cyan-400/0 before:via-cyan-400/10 before:to-cyan-400/0 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500">
  Small
</button>

{/* Default Neon Button */}
<button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden h-10 px-4 py-2 bg-slate-950/90 border-2 border-purple-400/60 text-purple-400 hover:bg-purple-400/10 hover:border-purple-400 hover:text-purple-300 hover:shadow-[0_0_20px_rgb(168,85,247,0.4)] focus-visible:ring-purple-400/50 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-400/0 before:via-purple-400/10 before:to-purple-400/0 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500">
  Default
</button>

{/* Large Neon Button */}
<button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-base font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden h-11 px-8 bg-slate-950/90 border-2 border-lime-400/60 text-lime-400 hover:bg-lime-400/10 hover:border-lime-400 hover:text-lime-300 hover:shadow-[0_0_20px_rgb(163,230,53,0.4)] focus-visible:ring-lime-400/50 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-lime-400/0 before:via-lime-400/10 before:to-lime-400/0 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500">
  Large
</button>

{/* Extra Large Neon Button */}
<button className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-lg font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden h-12 px-10 bg-slate-950/90 border-2 border-pink-400/60 text-pink-400 hover:bg-pink-400/10 hover:border-pink-400 hover:text-pink-300 hover:shadow-[0_0_20px_rgb(244,114,182,0.4)] focus-visible:ring-pink-400/50 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-pink-400/0 before:via-pink-400/10 before:to-pink-400/0 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500">
  Extra Large
</button>`}
        />

        {/* More Neon Variants */}
        <ComponentSection
          title="Neon Button Variants"
          description="Specialized neon buttons for different actions and states"
          preview={
            <div className="flex gap-4 flex-wrap">
              <Button variant="neon-destructive">Delete</Button>
              <Button variant="neon-success">Success</Button>
              <Button variant="neon-warning">Warning</Button>
              <Button variant="neon-cyan" loading>Loading</Button>
            </div>
          }
          code={`{/* Destructive Neon Button */}
<button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden h-10 px-4 py-2 bg-slate-950/90 border-2 border-red-400/60 text-red-400 hover:bg-red-400/10 hover:border-red-400 hover:text-red-300 hover:shadow-[0_0_20px_rgb(248,113,113,0.4)] focus-visible:ring-red-400/50 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-red-400/0 before:via-red-400/10 before:to-red-400/0 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500">
  Delete
</button>

{/* Success Neon Button */}
<button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden h-10 px-4 py-2 bg-slate-950/90 border-2 border-emerald-400/60 text-emerald-400 hover:bg-emerald-400/10 hover:border-emerald-400 hover:text-emerald-300 hover:shadow-[0_0_20px_rgb(52,211,153,0.4)] focus-visible:ring-emerald-400/50 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-emerald-400/0 before:via-emerald-400/10 before:to-emerald-400/0 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500">
  Success
</button>

{/* Warning Neon Button */}
<button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden h-10 px-4 py-2 bg-slate-950/90 border-2 border-amber-400/60 text-amber-400 hover:bg-amber-400/10 hover:border-amber-400 hover:text-amber-300 hover:shadow-[0_0_20px_rgb(251,191,36,0.4)] focus-visible:ring-amber-400/50 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-amber-400/0 before:via-amber-400/10 before:to-amber-400/0 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500">
  Warning
</button>

{/* Loading Neon Button */}
<button disabled className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden h-10 px-4 py-2 bg-slate-950/90 border-2 border-cyan-400/60 text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400 hover:text-cyan-300 hover:shadow-[0_0_20px_rgb(34,211,238,0.4)] focus-visible:ring-cyan-400/50 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-cyan-400/0 before:via-cyan-400/10 before:to-cyan-400/0 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500">
  <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
  Loading
</button>`}
        />

        {/* With Icons - Pure JSX */}
        <ComponentSection
          title="Buttons with Icons"
          description="Buttons with icons and special states"
          preview={
            <div className="flex gap-4 flex-wrap">
              <Button variant="neon-purple">
                <Heart className="w-4 h-4 mr-2" />
                With Icon
              </Button>
              <Button variant="outline">
                Download
                <Download className="w-4 h-4 ml-2" />
              </Button>
              <Button disabled>Disabled</Button>
            </div>
          }
          code={`{/* Button with Leading Icon */}
<button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden h-10 px-4 py-2 bg-slate-950/90 border-2 border-purple-400/60 text-purple-400 hover:bg-purple-400/10 hover:border-purple-400 hover:text-purple-300 hover:shadow-[0_0_20px_rgb(168,85,247,0.4)] focus-visible:ring-purple-400/50 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-400/0 before:via-purple-400/10 before:to-purple-400/0 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500">
  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
  With Icon
</button>

{/* Button with Trailing Icon */}
<button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm">
  Download
  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
</button>

{/* Disabled Button */}
<button disabled className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90">
  Disabled
</button>`}
        />

        {/* Installation Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border rounded-lg p-6 bg-gradient-to-r from-[#00FFC3]/5 to-[#D300FF]/5"
        >
          <h2 className="text-2xl font-bold mb-4">Installation</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-muted-foreground mb-3">
                Copy and paste the button code directly. Install required dependencies:
              </p>
              <div className="bg-muted rounded-lg p-3">
                <code className="text-sm">npm install framer-motion clsx tailwind-merge lucide-react</code>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>Make sure you have the <code className="bg-muted px-1 py-0.5 rounded">cn</code> utility function. <a href="/setup" className="text-[#00FFC3] hover:underline">See installation guide</a>.</p>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  )
} 