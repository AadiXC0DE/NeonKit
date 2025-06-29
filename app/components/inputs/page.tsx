"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/input"
import { Textarea } from "@/components/textarea" 
import { Button } from "@/components/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Copy, Check, ArrowLeft, User, Mail, Lock, Search, MessageSquare } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { COLOR_PRESETS } from "@/lib/colors"

const inputExamples = [
  {
    title: "Default Variants",
    examples: [
      { 
        variant: "default", 
        label: "Default Input", 
        placeholder: "Enter text...", 
        code: `<div className="w-full max-w-sm">
  <Input variant="default" placeholder="Enter text..." />
</div>` 
      },
      { 
        variant: "ghost", 
        label: "Ghost Input", 
        placeholder: "Ghost variant...", 
        code: `<div className="w-full max-w-sm">
  <Input variant="ghost" placeholder="Ghost variant..." />
</div>` 
      },
      { 
        variant: "filled", 
        label: "Filled Input", 
        placeholder: "Filled variant...", 
        code: `<div className="w-full max-w-sm">
  <Input variant="filled" placeholder="Filled variant..." />
</div>` 
      },
      { 
        variant: "search", 
        label: "Search Input", 
        placeholder: "Search...", 
        code: `<div className="w-full max-w-sm">
  <Input variant="search" placeholder="Search..." />
</div>` 
      },
    ]
  },
  {
    title: "Neon Variants",
    examples: [
      { 
        variant: "neon", 
        accent: "blue", 
        label: "Neon Blue", 
        placeholder: "Neon blue input...", 
        code: `<div className="w-full max-w-sm">
  <Input variant="neon" accent="blue" placeholder="Neon blue input..." />
</div>` 
      },
      { 
        variant: "neon", 
        accent: "purple", 
        label: "Neon Purple", 
        placeholder: "Neon purple input...", 
        code: `<div className="w-full max-w-sm">
  <Input variant="neon" accent="purple" placeholder="Neon purple input..." />
</div>` 
      },
      { 
        variant: "neon", 
        accent: "chartreuse", 
        label: "Neon Chartreuse", 
        placeholder: "Neon chartreuse input...", 
        code: `<div className="w-full max-w-sm">
  <Input variant="neon" accent="chartreuse" placeholder="Neon chartreuse input..." />
</div>` 
      },
    ]
  },
  {
    title: "Custom Colors",
    description: "Use any color you want with the custom accent",
    examples: [
      { 
        variant: "neon", 
        accent: "custom", 
        customColor: { primary: "#FF073A" },
        label: "Electric Red", 
        placeholder: "Electric red input...",
        code: `<div className="w-full max-w-sm">
  <Input 
    variant="neon" 
    accent="custom" 
    customColor={{ primary: "#FF073A" }}
    placeholder="Electric red input..."
  />
</div>` 
      },
      { 
        variant: "neon", 
        accent: "custom", 
        customColor: { primary: "#39FF14" },
        label: "Neon Green", 
        placeholder: "Neon green input...",
        code: `<div className="w-full max-w-sm">
  <Input 
    variant="neon" 
    accent="custom" 
    customColor={{ primary: "#39FF14" }}
    placeholder="Neon green input..."
  />
</div>` 
      },
    ]
  },
  {
    title: "With Icons & Features",
    examples: [
      { 
        variant: "default", 
        startIcon: <User className="h-4 w-4" />,
        label: "With Start Icon", 
        placeholder: "Username...",
        code: `<div className="w-full max-w-sm">
  <Input 
    startIcon={<User className="h-4 w-4" />}
    placeholder="Username..."
  />
</div>` 
      },
      { 
        variant: "default", 
        type: "password",
        label: "Password Input", 
        placeholder: "Password...",
        code: `<div className="w-full max-w-sm">
  <Input 
    type="password"
    placeholder="Password..."
  />
</div>` 
      },
      { 
        variant: "default", 
        clearable: true,
        label: "Clearable Input", 
        placeholder: "Type to see clear button...",
        code: `<div className="w-full max-w-sm">
  <Input 
    clearable
    placeholder="Type to see clear button..."
  />
</div>` 
      },
    ]
  },
  {
    title: "Sizes",
    examples: [
      { 
        variant: "default", 
        size: "sm", 
        label: "Small", 
        placeholder: "Small input...", 
        code: `<div className="w-full max-w-sm">
  <Input size="sm" placeholder="Small input..." />
</div>` 
      },
      { 
        variant: "default", 
        size: "default", 
        label: "Default", 
        placeholder: "Default input...", 
        code: `<div className="w-full max-w-sm">
  <Input size="default" placeholder="Default input..." />
</div>` 
      },
      { 
        variant: "default", 
        size: "lg", 
        label: "Large", 
        placeholder: "Large input...", 
        code: `<div className="w-full max-w-sm">
  <Input size="lg" placeholder="Large input..." />
</div>` 
      },
      { 
        variant: "default", 
        size: "xl", 
        label: "Extra Large", 
        placeholder: "Extra large input...", 
        code: `<div className="w-full max-w-sm">
  <Input size="xl" placeholder="Extra large input..." />
</div>` 
      },
    ]
  },
  {
    title: "States",
    examples: [
      { 
        variant: "default", 
        label: "Normal State", 
        placeholder: "Normal input...", 
        code: `<div className="w-full max-w-sm">
  <Input placeholder="Normal input..." />
</div>` 
      },
      { 
        variant: "default", 
        loading: true, 
        label: "Loading State", 
        placeholder: "Loading...", 
        code: `<div className="w-full max-w-sm">
  <Input loading placeholder="Loading..." />
</div>` 
      },
      { 
        variant: "default", 
        error: true, 
        helperText: "This field is required", 
        label: "Error State", 
        placeholder: "Error input...", 
        code: `<div className="w-full max-w-sm">
  <Input error helperText="This field is required" placeholder="Error input..." />
</div>` 
      },
      { 
        variant: "default", 
        success: true, 
        helperText: "Valid input!", 
        label: "Success State", 
        placeholder: "Success input...", 
        code: `<div className="w-full max-w-sm">
  <Input success helperText="Valid input!" placeholder="Success input..." />
</div>` 
      },
    ]
  }
]

const textareaExamples = [
  {
    title: "Textarea Variants",
    examples: [
      { 
        variant: "default", 
        label: "Default Textarea", 
        placeholder: "Enter multiple lines...", 
        code: `<div className="w-full max-w-sm">
  <Textarea variant="default" placeholder="Enter multiple lines..." />
</div>` 
      },
      { 
        variant: "neon", 
        accent: "blue", 
        label: "Neon Blue", 
        placeholder: "Neon blue textarea...", 
        code: `<div className="w-full max-w-sm">
  <Textarea variant="neon" accent="blue" placeholder="Neon blue textarea..." />
</div>` 
      },
      { 
        variant: "neon", 
        accent: "custom", 
        customColor: { primary: "#FF073A" }, 
        label: "Custom Red", 
        placeholder: "Custom red textarea...", 
        code: `<div className="w-full max-w-sm">
  <Textarea variant="neon" accent="custom" customColor={{ primary: "#FF073A" }} placeholder="Custom red textarea..." />
</div>` 
      },
    ]
  },
  {
    title: "Textarea Features",
    examples: [
      { 
        variant: "default", 
        label: "With Character Count", 
        placeholder: "Type to see character count...",
        maxLength: 200,
        showCount: true,
        code: `<div className="w-full max-w-sm">
  <Textarea 
    maxLength={200}
    showCount
    placeholder="Type to see character count..."
  />
</div>` 
      },
      { 
        variant: "neon", 
        accent: "purple",
        size: "lg",
        label: "Large Textarea", 
        placeholder: "Large textarea with neon purple...",
        code: `<div className="w-full max-w-sm">
  <Textarea 
    variant="neon" 
    accent="purple"
    size="lg"
    placeholder="Large textarea with neon purple..."
  />
</div>` 
      },
    ]
  }
]

function CodeBlock({ code, className }: { code: string; className?: string }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn("relative group", className)}>
      <pre className="bg-muted rounded-md p-4 text-sm overflow-x-auto">
        <code>{code}</code>
      </pre>
      <button
        onClick={copyToClipboard}
        className="absolute top-2 right-2 p-2 rounded-md bg-background border opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  )
}

function InputColorPicker() {
  const [selectedColor, setSelectedColor] = useState("#FF073A")
  const [customInput, setCustomInput] = useState("")

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Try Custom Colors on Inputs</h3>
      
      {/* Color presets */}
      <div className="grid grid-cols-3 gap-2">
        {Object.entries(COLOR_PRESETS).slice(0, 9).map(([name, color]) => (
          <button
            key={name}
            onClick={() => setSelectedColor(color)}
            className="flex items-center gap-2 p-2 rounded-md hover:bg-accent text-sm"
          >
            <div 
              className="w-4 h-4 rounded"
              style={{ backgroundColor: color }}
            />
            {name}
          </button>
        ))}
      </div>

      {/* Custom input */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="#FF073A"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          className="flex-1 px-3 py-2 rounded-md border bg-background"
        />
        <button
          onClick={() => setSelectedColor(customInput)}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground"
        >
          Apply
        </button>
      </div>

      {/* Preview */}
      <div className="p-4 border rounded-md bg-card space-y-4">
        <div className="grid gap-4">
          <Input 
            variant="neon-cyan"
            placeholder="Custom color input..."
            label="Custom Input"
          />
          <Textarea 
            variant="neon-cyan"
            placeholder="Custom color textarea..."
            label="Custom Textarea"
          />
        </div>
        
        <CodeBlock 
          code={`<div className="grid gap-4">
  <div className="w-full max-w-sm">
    <Input 
      variant="neon" 
      accent="custom" 
      customColor={{ primary: "${selectedColor}" }}
      placeholder="Custom color input..."
      label="Custom Input"
    />
  </div>
  <div className="w-full max-w-sm">
    <Textarea 
      variant="neon" 
      accent="custom" 
      customColor={{ primary: "${selectedColor}" }}
      placeholder="Custom color textarea..."
      label="Custom Textarea"
    />
  </div>
</div>`} 
        />
      </div>
    </div>
  )
}

export default function InputsPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b backdrop-blur-md bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/components">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <h1 className="text-xl font-semibold">Input Components</h1>
            </div>
            <div className="flex items-center">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Input & Textarea Components</h1>
          <p className="text-lg text-muted-foreground mb-4">
            Flexible input components with multiple variants, custom colors, and enhanced features like icons, validation states, and accessibility.
          </p>
        </motion.div>

        {/* Installation */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12 border rounded-lg p-6 bg-gradient-to-r from-[#00FFC3]/5 to-[#D300FF]/5"
        >
          <h2 className="text-2xl font-bold mb-4">Installation</h2>
          <div className="space-y-4">
            <div>
              <p className="text-muted-foreground mb-3">
                Copy and paste the input code directly. Install required dependencies:
              </p>
              <div className="bg-muted rounded-lg p-3 mb-3">
                <code className="text-sm">npm install framer-motion clsx tailwind-merge lucide-react</code>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>Make sure you have the <code className="bg-muted px-1 py-0.5 rounded">cn</code> utility function. <a href="/setup" className="text-[#00FFC3] hover:underline">See complete installation guide</a>.</p>
            </div>
          </div>
        </motion.section>

        {/* Color picker section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-12"
        >
          <div className="border rounded-lg p-6 bg-card">
            <InputColorPicker />
          </div>
        </motion.section>

        {/* Input Examples */}
        <h2 className="text-3xl font-bold mb-8">Input Component</h2>
        {inputExamples.map((section, sectionIndex) => (
          <motion.section
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + sectionIndex * 0.1 }}
            className="mb-12"
          >
            <h3 className="text-2xl font-bold mb-2">{section.title}</h3>
            {section.description && (
              <p className="text-muted-foreground mb-6">{section.description}</p>
            )}
            <div className="grid gap-6">
              {section.examples.map((example, index) => (
                <div key={index} className="border rounded-lg p-6">
                  <div className="flex items-center justify-center p-8 border rounded-md mb-4">
                    <div className="w-full max-w-sm">
                      <Input
                        variant={example.variant as any}
                        size={(example as any).size}
                        startIcon={(example as any).startIcon}
                        endIcon={(example as any).endIcon}
                        clearable={(example as any).clearable}
                        loading={(example as any).loading}
                        error={(example as any).error}
                        success={(example as any).success}
                        helperText={(example as any).helperText}
                        label={example.label}
                        placeholder={example.placeholder}
                        type={(example as any).type}
                      />
                    </div>
                  </div>
                  <CodeBlock code={example.code} />
                </div>
              ))}
            </div>
          </motion.section>
        ))}

        {/* Textarea Examples */}
        <h2 className="text-3xl font-bold mb-8 mt-16">Textarea Component</h2>
        {textareaExamples.map((section, sectionIndex) => (
          <motion.section
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + sectionIndex * 0.1 }}
            className="mb-12"
          >
            <h3 className="text-2xl font-bold mb-2">{section.title}</h3>
            <div className="grid gap-6">
              {section.examples.map((example, index) => (
                <div key={index} className="border rounded-lg p-6">
                  <div className="flex items-center justify-center p-8 border rounded-md mb-4">
                    <div className="w-full max-w-sm">
                      <Textarea
                        variant={example.variant as any}
                        size={(example as any).size}
                        error={(example as any).error}
                        success={(example as any).success}
                        helperText={(example as any).helperText}
                        label={example.label}
                        placeholder={example.placeholder}
                        maxLength={(example as any).maxLength}
                        showCount={(example as any).showCount}
                      />
                    </div>
                  </div>
                  <CodeBlock code={example.code} />
                </div>
              ))}
            </div>
          </motion.section>
        ))}

        {/* API Reference */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6">API Reference</h2>
          
          <h3 className="text-xl font-semibold mb-4">Input Props</h3>
          <div className="border rounded-lg overflow-hidden mb-8">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4 font-semibold">Prop</th>
                  <th className="text-left p-4 font-semibold">Type</th>
                  <th className="text-left p-4 font-semibold">Default</th>
                  <th className="text-left p-4 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { prop: "variant", type: '"default" | "neon" | "ghost" | "filled" | "search"', default: '"default"', description: "The visual style variant" },
                  { prop: "size", type: '"sm" | "default" | "lg" | "xl"', default: '"default"', description: "The size of the input" },
                  { prop: "accent", type: '"blue" | "purple" | "chartreuse" | "custom"', default: '"blue"', description: "Neon accent color" },
                  { prop: "customColor", type: "{ primary: string; shadow?: string }", default: "undefined", description: "Custom color object for accent='custom'" },
                  { prop: "startIcon", type: "ReactNode", default: "undefined", description: "Icon to display at the start" },
                  { prop: "endIcon", type: "ReactNode", default: "undefined", description: "Icon to display at the end" },
                  { prop: "clearable", type: "boolean", default: "false", description: "Shows clear button when input has value" },
                  { prop: "loading", type: "boolean", default: "false", description: "Shows loading spinner" },
                  { prop: "error", type: "boolean", default: "false", description: "Error state styling" },
                  { prop: "success", type: "boolean", default: "false", description: "Success state styling" },
                  { prop: "helperText", type: "string", default: "undefined", description: "Helper text below input" },
                  { prop: "label", type: "string", default: "undefined", description: "Label above input" },
                ].map((row, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-4 font-mono text-sm">{row.prop}</td>
                    <td className="p-4 font-mono text-sm text-muted-foreground">{row.type}</td>
                    <td className="p-4 font-mono text-sm">{row.default}</td>
                    <td className="p-4 text-sm">{row.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-semibold mb-4">Textarea Props</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4 font-semibold">Prop</th>
                  <th className="text-left p-4 font-semibold">Type</th>
                  <th className="text-left p-4 font-semibold">Default</th>
                  <th className="text-left p-4 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { prop: "variant", type: '"default" | "neon" | "ghost" | "filled"', default: '"default"', description: "The visual style variant" },
                  { prop: "size", type: '"sm" | "default" | "lg" | "xl"', default: '"default"', description: "The size of the textarea" },
                  { prop: "accent", type: '"blue" | "purple" | "chartreuse" | "custom"', default: '"blue"', description: "Neon accent color" },
                  { prop: "customColor", type: "{ primary: string; shadow?: string }", default: "undefined", description: "Custom color object for accent='custom'" },
                  { prop: "maxLength", type: "number", default: "undefined", description: "Maximum character length" },
                  { prop: "showCount", type: "boolean", default: "false", description: "Show character count" },
                  { prop: "error", type: "boolean", default: "false", description: "Error state styling" },
                  { prop: "success", type: "boolean", default: "false", description: "Success state styling" },
                  { prop: "helperText", type: "string", default: "undefined", description: "Helper text below textarea" },
                  { prop: "label", type: "string", default: "undefined", description: "Label above textarea" },
                ].map((row, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-4 font-mono text-sm">{row.prop}</td>
                    <td className="p-4 font-mono text-sm text-muted-foreground">{row.type}</td>
                    <td className="p-4 font-mono text-sm">{row.default}</td>
                    <td className="p-4 text-sm">{row.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>
      </div>
    </div>
  )
} 