"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Textarea } from "@/components/textarea"
import { Copy, Check, Code, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

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
              <span className="text-sm font-medium">components/ui/textarea.tsx</span>
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

export default function TextareaPage() {
  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          Textarea Components
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Beautiful textarea components with neon effects, multiple variants, and rich features. Copy and paste into your project.
        </p>
      </motion.div>

      <div className="space-y-16">
        {/* Neon Textareas */}
        <ComponentSection
          title="Neon Textareas"
          description="Electric neon textareas with glowing effects in multiple vibrant colors"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
              <Textarea variant="neon-cyan" placeholder="Neon cyan textarea..." label="Cyan Textarea" rows={3} />
              <Textarea variant="neon-purple" placeholder="Neon purple textarea..." label="Purple Textarea" rows={3} />
              <Textarea variant="neon-chartreuse" placeholder="Neon chartreuse textarea..." label="Chartreuse Textarea" rows={3} />
              <Textarea variant="neon-pink" placeholder="Neon pink textarea..." label="Pink Textarea" rows={3} />
            </div>
          }
          code={`{/* Neon Cyan Textarea */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-cyan-100">Cyan Textarea</label>
  <textarea 
    className="flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all duration-300 bg-slate-950/50 border-2 border-cyan-400/60 text-cyan-100 font-medium placeholder:text-cyan-200/70 focus-visible:border-cyan-400 focus-visible:ring-cyan-400/50 focus-visible:shadow-[0_0_15px_rgb(34,211,238,0.3)] hover:border-cyan-400/80 hover:shadow-[0_0_10px_rgb(34,211,238,0.2)] backdrop-blur-sm"
    rows={3}
    placeholder="Neon cyan textarea..."
  ></textarea>
</div>

{/* Neon Purple Textarea */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-purple-100">Purple Textarea</label>
  <textarea 
    className="flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all duration-300 bg-slate-950/50 border-2 border-purple-400/60 text-purple-100 font-medium placeholder:text-purple-200/70 focus-visible:border-purple-400 focus-visible:ring-purple-400/50 focus-visible:shadow-[0_0_15px_rgb(168,85,247,0.3)] hover:border-purple-400/80 hover:shadow-[0_0_10px_rgb(168,85,247,0.2)] backdrop-blur-sm"
    rows={3}
    placeholder="Neon purple textarea..."
  ></textarea>
</div>

{/* Neon Chartreuse Textarea */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-lime-100">Chartreuse Textarea</label>
  <textarea 
    className="flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all duration-300 bg-slate-950/50 border-2 border-lime-400/60 text-lime-100 font-medium placeholder:text-lime-200/70 focus-visible:border-lime-400 focus-visible:ring-lime-400/50 focus-visible:shadow-[0_0_15px_rgb(163,230,53,0.3)] hover:border-lime-400/80 hover:shadow-[0_0_10px_rgb(163,230,53,0.2)] backdrop-blur-sm"
    rows={3}
    placeholder="Neon chartreuse textarea..."
  ></textarea>
</div>

{/* Neon Pink Textarea */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-pink-100">Pink Textarea</label>
  <textarea 
    className="flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all duration-300 bg-slate-950/50 border-2 border-pink-400/60 text-pink-100 font-medium placeholder:text-pink-200/70 focus-visible:border-pink-400 focus-visible:ring-pink-400/50 focus-visible:shadow-[0_0_15px_rgb(244,114,182,0.3)] hover:border-pink-400/80 hover:shadow-[0_0_10px_rgb(244,114,182,0.2)] backdrop-blur-sm"
    rows={3}
    placeholder="Neon pink textarea..."
  ></textarea>
</div>`}
        />

        {/* Basic Textareas */}
        <ComponentSection
          title="Basic Textareas"
          description="Standard textarea variants for everyday use"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
              <Textarea placeholder="Default textarea..." label="Default" rows={3} />
              <Textarea variant="filled" placeholder="Filled textarea..." label="Filled" rows={3} />
              <Textarea variant="ghost" placeholder="Ghost textarea..." label="Ghost" rows={3} />
            </div>
          }
          code={`{/* Default Textarea */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none">Default</label>
  <textarea 
    className="flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all duration-300 border-input bg-background hover:border-accent-foreground/20"
    rows={3}
    placeholder="Default textarea..."
  ></textarea>
</div>

{/* Filled Textarea */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none">Filled</label>
  <textarea 
    className="flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all duration-300 bg-secondary border-transparent hover:bg-secondary/80"
    rows={3}
    placeholder="Filled textarea..."
  ></textarea>
</div>

{/* Ghost Textarea */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none">Ghost</label>
  <textarea 
    className="flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all duration-300 border-transparent bg-accent/5 hover:bg-accent/10"
    rows={3}
    placeholder="Ghost textarea..."
  ></textarea>
</div>`}
        />

        {/* Textarea Sizes */}
        <ComponentSection
          title="Textarea Sizes"
          description="Different sizes for various use cases"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              <Textarea variant="neon-cyan" size="sm" placeholder="Small..." label="Small" />
              <Textarea variant="neon-purple" size="default" placeholder="Default..." label="Default" />
              <Textarea variant="neon-chartreuse" size="lg" placeholder="Large..." label="Large" />
              <Textarea variant="neon-pink" size="xl" placeholder="Extra large..." label="Extra Large" />
            </div>
          }
          code={`{/* Small Neon Textarea */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-cyan-100">Small</label>
  <textarea 
    className="flex min-h-[60px] w-full rounded-md border px-2 py-1 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all duration-300 bg-slate-950/50 border-2 border-cyan-400/60 text-cyan-100 font-medium placeholder:text-cyan-200/70 focus-visible:border-cyan-400 focus-visible:ring-cyan-400/50 focus-visible:shadow-[0_0_15px_rgb(34,211,238,0.3)] hover:border-cyan-400/80 hover:shadow-[0_0_10px_rgb(34,211,238,0.2)] backdrop-blur-sm"
    placeholder="Small..."
  ></textarea>
</div>

{/* Default Neon Textarea */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-purple-100">Default</label>
  <textarea 
    className="flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all duration-300 bg-slate-950/50 border-2 border-purple-400/60 text-purple-100 font-medium placeholder:text-purple-200/70 focus-visible:border-purple-400 focus-visible:ring-purple-400/50 focus-visible:shadow-[0_0_15px_rgb(168,85,247,0.3)] hover:border-purple-400/80 hover:shadow-[0_0_10px_rgb(168,85,247,0.2)] backdrop-blur-sm"
    placeholder="Default..."
  ></textarea>
</div>

{/* Large Neon Textarea */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-lime-100">Large</label>
  <textarea 
    className="flex min-h-[120px] w-full rounded-md border px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all duration-300 bg-slate-950/50 border-2 border-lime-400/60 text-lime-100 font-medium placeholder:text-lime-200/70 focus-visible:border-lime-400 focus-visible:ring-lime-400/50 focus-visible:shadow-[0_0_15px_rgb(163,230,53,0.3)] hover:border-lime-400/80 hover:shadow-[0_0_10px_rgb(163,230,53,0.2)] backdrop-blur-sm"
    placeholder="Large..."
  ></textarea>
</div>

{/* Extra Large Neon Textarea */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-pink-100">Extra Large</label>
  <textarea 
    className="flex min-h-[160px] w-full rounded-md border px-5 py-4 text-lg ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all duration-300 bg-slate-950/50 border-2 border-pink-400/60 text-pink-100 font-medium placeholder:text-pink-200/70 focus-visible:border-pink-400 focus-visible:ring-pink-400/50 focus-visible:shadow-[0_0_15px_rgb(244,114,182,0.3)] hover:border-pink-400/80 hover:shadow-[0_0_10px_rgb(244,114,182,0.2)] backdrop-blur-sm"
    placeholder="Extra large..."
  ></textarea>
</div>`}
        />

        {/* Neon Textarea Variants */}
        <ComponentSection
          title="Neon Textarea Variants"
          description="Specialized neon textareas for different states and purposes"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
              <Textarea variant="neon-destructive" placeholder="Error textarea..." label="Destructive" rows={3} />
              <Textarea variant="neon-success" placeholder="Success textarea..." label="Success" rows={3} />
              <Textarea variant="neon-warning" placeholder="Warning textarea..." label="Warning" rows={3} />
              <Textarea variant="neon-cyan" maxLength={100} showCount placeholder="Type to see character count..." label="With Character Count" rows={3} />
            </div>
          }
          code={`{/* Destructive Neon Textarea */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-red-100">Destructive</label>
  <textarea 
    className="flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all duration-300 bg-slate-950/50 border-2 border-red-400/60 text-red-100 font-medium placeholder:text-red-200/70 focus-visible:border-red-400 focus-visible:ring-red-400/50 focus-visible:shadow-[0_0_15px_rgb(248,113,113,0.3)] hover:border-red-400/80 hover:shadow-[0_0_10px_rgb(248,113,113,0.2)] backdrop-blur-sm"
    rows={3}
    placeholder="Error textarea..."
  ></textarea>
</div>

{/* Success Neon Textarea */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-emerald-100">Success</label>
  <textarea 
    className="flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all duration-300 bg-slate-950/50 border-2 border-emerald-400/60 text-emerald-100 font-medium placeholder:text-emerald-200/70 focus-visible:border-emerald-400 focus-visible:ring-emerald-400/50 focus-visible:shadow-[0_0_15px_rgb(52,211,153,0.3)] hover:border-emerald-400/80 hover:shadow-[0_0_10px_rgb(52,211,153,0.2)] backdrop-blur-sm"
    rows={3}
    placeholder="Success textarea..."
  ></textarea>
</div>

{/* Warning Neon Textarea */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-amber-100">Warning</label>
  <textarea 
    className="flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all duration-300 bg-slate-950/50 border-2 border-amber-400/60 text-amber-100 font-medium placeholder:text-amber-200/70 focus-visible:border-amber-400 focus-visible:ring-amber-400/50 focus-visible:shadow-[0_0_15px_rgb(251,191,36,0.3)] hover:border-amber-400/80 hover:shadow-[0_0_10px_rgb(251,191,36,0.2)] backdrop-blur-sm"
    rows={3}
    placeholder="Warning textarea..."
  ></textarea>
</div>

{/* Character Count Textarea */}
<div className="space-y-2">
  <div className="flex items-center justify-between">
    <label className="text-sm font-medium leading-none text-cyan-100">With Character Count</label>
    <span className="text-xs text-cyan-200">0/100</span>
  </div>
  <textarea 
    className="flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all duration-300 bg-slate-950/50 border-2 border-cyan-400/60 text-cyan-100 font-medium placeholder:text-cyan-200/70 focus-visible:border-cyan-400 focus-visible:ring-cyan-400/50 focus-visible:shadow-[0_0_15px_rgb(34,211,238,0.3)] hover:border-cyan-400/80 hover:shadow-[0_0_10px_rgb(34,211,238,0.2)] backdrop-blur-sm"
    rows={3}
    maxLength={100}
    placeholder="Type to see character count..."
  ></textarea>
</div>`}
        />

        {/* Textarea Features */}
        <ComponentSection
          title="Textarea Features"
          description="Advanced features like validation states and helper text"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
              <Textarea variant="neon-cyan" placeholder="Normal state..." label="Normal State" rows={3} />
              <Textarea variant="neon-destructive" error helperText="This field is required" placeholder="Error state..." label="Error State" rows={3} />
              <Textarea variant="neon-success" success helperText="Valid input!" placeholder="Success state..." label="Success State" rows={3} />
              <Textarea placeholder="Disabled state..." label="Disabled State" rows={3} disabled />
            </div>
          }
          code={`{/* Normal State */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-cyan-100">Normal State</label>
  <textarea 
    className="flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all duration-300 bg-slate-950/50 border-2 border-cyan-400/60 text-cyan-100 font-medium placeholder:text-cyan-200/70 focus-visible:border-cyan-400 focus-visible:ring-cyan-400/50 focus-visible:shadow-[0_0_15px_rgb(34,211,238,0.3)] hover:border-cyan-400/80 hover:shadow-[0_0_10px_rgb(34,211,238,0.2)] backdrop-blur-sm"
    rows={3}
    placeholder="Normal state..."
  ></textarea>
</div>

{/* Error State */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-red-100">Error State</label>
  <textarea 
    className="flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all duration-300 bg-slate-950/50 border-2 border-red-400/60 text-red-100 font-medium placeholder:text-red-200/70 focus-visible:border-red-400 focus-visible:ring-red-400/50 focus-visible:shadow-[0_0_15px_rgb(248,113,113,0.3)] hover:border-red-400/80 hover:shadow-[0_0_10px_rgb(248,113,113,0.2)] backdrop-blur-sm border-destructive focus-visible:ring-destructive/50"
    rows={3}
    placeholder="Error state..."
  ></textarea>
  <p className="text-xs text-destructive">This field is required</p>
</div>

{/* Success State */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-emerald-100">Success State</label>
  <textarea 
    className="flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all duration-300 bg-slate-950/50 border-2 border-emerald-400/60 text-emerald-100 font-medium placeholder:text-emerald-200/70 focus-visible:border-emerald-400 focus-visible:ring-emerald-400/50 focus-visible:shadow-[0_0_15px_rgb(52,211,153,0.3)] hover:border-emerald-400/80 hover:shadow-[0_0_10px_rgb(52,211,153,0.2)] backdrop-blur-sm border-green-500 focus-visible:ring-green-500/50"
    rows={3}
    placeholder="Success state..."
  ></textarea>
  <p className="text-xs text-green-500">Valid input!</p>
</div>

{/* Disabled State */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none">Disabled State</label>
  <textarea 
    disabled
    className="flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all duration-300 border-input bg-background hover:border-accent-foreground/20"
    rows={3}
    placeholder="Disabled state..."
  ></textarea>
</div>`}
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
                Copy and paste the textarea code directly. Install required dependencies:
              </p>
              <div className="bg-muted rounded-lg p-3">
                <code className="text-sm">npm install framer-motion clsx tailwind-merge lucide-react</code>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>Make sure you have the <code className="bg-muted px-1 py-0.5 rounded">cn</code> utility function. <a href="/setup" className="text-[#00FFC3] hover:underline">See complete installation guide</a>.</p>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  )
} 