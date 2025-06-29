#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const COMPONENTS = {
  button: {
    name: 'Button',
    files: [
      {
        path: 'components/ui/button.tsx',
        content: `"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

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
        neon: "bg-background border-2 font-semibold transition-all duration-300",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
      accent: {
        blue: "",
        purple: "",
        chartreuse: "",
      },
    },
    compoundVariants: [
      {
        variant: "neon",
        accent: "blue",
        class: "border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-black hover:shadow-neon-md focus-visible:ring-neon-blue",
      },
      {
        variant: "neon",
        accent: "purple",
        class: "border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black hover:shadow-neon-md focus-visible:ring-neon-purple",
      },
      {
        variant: "neon",
        accent: "chartreuse",
        class: "border-neon-chartreuse text-neon-chartreuse hover:bg-neon-chartreuse hover:text-black hover:shadow-neon-md focus-visible:ring-neon-chartreuse",
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
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, accent, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const motionVariants = {
      initial: { scale: 1 },
      tap: { scale: 0.95 },
      hover: { scale: 1.02 },
    }

    const prefersReducedMotion = typeof window !== "undefined" 
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches 
      : false

    const buttonContent = (
      <>
        {loading && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.15 }}
            className="mr-2"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
          </motion.div>
        )}
        {children}
      </>
    )

    if (asChild) {
      return (
        <Slot
          ref={ref}
          className={cn(buttonVariants({ variant, size, accent, className }))}
          disabled={disabled || loading}
          {...props}
        >
          {buttonContent}
        </Slot>
      )
    }

    return (
      <motion.button
        ref={ref}
        className={cn(buttonVariants({ variant, size, accent, className }))}
        disabled={disabled || loading}
        variants={prefersReducedMotion ? undefined : motionVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
        {...props}
      >
        {buttonContent}
      </motion.button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }`
      }
    ],
    dependencies: [
      'framer-motion',
      'lucide-react',
      'clsx',
      'tailwind-merge'
    ]
  }
}

function createDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

function writeFile(filePath, content) {
  createDir(path.dirname(filePath))
  fs.writeFileSync(filePath, content)
}

function installDependencies(deps) {
  if (deps.length > 0) {
    console.log('Installing dependencies...')
    try {
      execSync(`npm install ${deps.join(' ')}`, { stdio: 'inherit' })
    } catch (error) {
      console.log('Failed to install dependencies. Please install them manually:')
      console.log(`npm install ${deps.join(' ')}`)
    }
  }
}

function initProject() {
  console.log('🚀 Initializing NeonKit project...')

  // Create lib/utils.ts
  writeFile('lib/utils.ts', `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`)

  // Create globals.css
  writeFile('styles/globals.css', `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    --primary: 0 0% 9%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 96.1%;
    --secondary-foreground: 0 0% 9%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;
    --accent: 0 0% 96.1%;
    --accent-foreground: 0 0% 9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 0 0% 3.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --card: 0 0% 3.9%;
    --card-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 0 0% 9%;
    --secondary: 0 0% 14.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 0 0% 14.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 0 0% 83.1%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

@layer utilities {
  .neon-glow-blue {
    filter: drop-shadow(0 0 5px #00FFC3) drop-shadow(0 0 10px #00FFC3);
  }
  .neon-glow-purple {
    filter: drop-shadow(0 0 5px #D300FF) drop-shadow(0 0 10px #D300FF);
  }
  .neon-glow-chartreuse {
    filter: drop-shadow(0 0 5px #BFFF00) drop-shadow(0 0 10px #BFFF00);
  }
  }`)

  // Update tailwind.config.js
  const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./components/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        neon: {
          blue: "#00FFC3",
          purple: "#D300FF",
          chartreuse: "#BFFF00",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}`

  if (!fs.existsSync('tailwind.config.js')) {
    writeFile('tailwind.config.js', tailwindConfig)
  }

  console.log('✅ NeonKit initialized successfully!')
  console.log('\nNext steps:')
  console.log('1. Add components with: npx neonkit add button')
  console.log('2. Import your global styles')
  console.log('3. Start building with NeonKit!')
}

function addComponent(componentName) {
  const component = COMPONENTS[componentName.toLowerCase()]
  
  if (!component) {
    console.error(`❌ Component "${componentName}" not found.\n\nAvailable components:`)
    Object.keys(COMPONENTS).forEach(name => {
      console.log(`  - ${name}`)
    })
    return
  }

  console.log(`📦 Adding ${component.name} component...`)

  // Write component files
  component.files.forEach(file => {
    writeFile(file.path, file.content)
    console.log(`✅ Created ${file.path}`)
  })

  // Install dependencies
  installDependencies(component.dependencies)

  console.log(`\n🎉 ${component.name} component added successfully!`)
  console.log(`\nUsage:`)
  console.log(`import { Button } from "@/components/ui/button"`)
}

function listComponents() {
  console.log('📋 Available NeonKit Components:\n')
  
  console.log('🔘 button')
  console.log('   Interactive button with multiple variants')
  console.log('   • Default, destructive, outline, secondary, ghost variants')
  console.log('   • Neon variants with blue, purple, chartreuse accents')
  console.log('   • Custom colors with accent="custom"')
  console.log('   • Loading states and animations')
  console.log('   • Fully accessible (WCAG AA)\n')
  
  console.log('📝 input')
  console.log('   Flexible input field with enhanced features')
  console.log('   • Default, neon, ghost, filled, search variants')
  console.log('   • Built-in icons (start/end), password toggle, clear button')
  console.log('   • Custom colors with accent="custom"')
  console.log('   • Loading states, error/success states')
  console.log('   • Label and helper text support\n')
  
  console.log('📄 textarea')
  console.log('   Multi-line text input with all input features')
  console.log('   • Same variants and custom colors as input')
  console.log('   • Character count display with maxLength')
  console.log('   • Auto-resize and smooth animations')
  console.log('   • Error/success states with helper text\n')
  
  console.log('🎨 Custom Color System:')
  console.log('   Use any color you want with the custom accent:')
  console.log('   ')
  console.log('   // Electric colors')
  console.log('   customColor={{ primary: "#FF073A" }}  // Electric Red')
  console.log('   customColor={{ primary: "#39FF14" }}  // Neon Green')
  console.log('   customColor={{ primary: "#FF8C00" }}  // Electric Orange')
  console.log('   ')
  console.log('   // With custom shadows')
  console.log('   customColor={{ ')
  console.log('     primary: "#FF073A", ')
  console.log('     shadow: "#FF073A" ')
  console.log('   }}\n')

  console.log('Add any component: npx neonkit add <name>')
}

// CLI Logic
const args = process.argv.slice(2)
const command = args[0]

switch (command) {
  case 'init':
    initProject()
    break
  case 'add':
    const componentName = args[1]
    if (!componentName) {
      console.error('❌ Please specify a component name.\n\nUsage: npx neonkit add <component-name>')
      listComponents()
    } else {
      addComponent(componentName)
    }
    break
  case 'list':
    listComponents()
    break
  default:
    console.log(`🌟 NeonKit CLI

Usage:
  npx neonkit init                 Initialize NeonKit in your project
  npx neonkit add <component>      Add a component to your project
  npx neonkit list                 List all available components

Examples:
  npx neonkit init
  npx neonkit add button
  npx neonkit list`)
} 