"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/input"
import { Copy, Check, Code, Eye, User, Mail, Lock, Search, Heart, Download, ArrowRight } from "lucide-react"
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
              <span className="text-sm font-medium">components/ui/input.tsx</span>
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

export default function InputPage() {
  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          Input Components
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Beautiful input components with neon effects, multiple variants, and rich features. Copy and paste into your project.
        </p>
      </motion.div>

      <div className="space-y-16">
        {/* Neon Inputs */}
        <ComponentSection
          title="Neon Inputs"
          description="Electric neon inputs with glowing effects in multiple vibrant colors"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
              <Input variant="neon-cyan" placeholder="Neon cyan input..." label="Cyan Input" />
              <Input variant="neon-purple" placeholder="Neon purple input..." label="Purple Input" />
              <Input variant="neon-chartreuse" placeholder="Neon chartreuse input..." label="Chartreuse Input" />
              <Input variant="neon-pink" placeholder="Neon pink input..." label="Pink Input" />
            </div>
          }
          code={`{/* Neon Cyan Input */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-cyan-100">Cyan Input</label>
  <input 
    className="flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 bg-slate-950/50 border-2 border-cyan-400/60 text-cyan-100 font-medium placeholder:text-cyan-200/70 focus-visible:border-cyan-400 focus-visible:ring-cyan-400/50 focus-visible:shadow-[0_0_15px_rgb(34,211,238,0.3)] hover:border-cyan-400/80 hover:shadow-[0_0_10px_rgb(34,211,238,0.2)] backdrop-blur-sm"
    placeholder="Neon cyan input..."
  />
</div>

{/* Neon Purple Input */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-purple-100">Purple Input</label>
  <input 
    className="flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 bg-slate-950/50 border-2 border-purple-400/60 text-purple-100 font-medium placeholder:text-purple-200/70 focus-visible:border-purple-400 focus-visible:ring-purple-400/50 focus-visible:shadow-[0_0_15px_rgb(168,85,247,0.3)] hover:border-purple-400/80 hover:shadow-[0_0_10px_rgb(168,85,247,0.2)] backdrop-blur-sm"
    placeholder="Neon purple input..."
  />
</div>

{/* Neon Chartreuse Input */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-lime-100">Chartreuse Input</label>
  <input 
    className="flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 bg-slate-950/50 border-2 border-lime-400/60 text-lime-100 font-medium placeholder:text-lime-200/70 focus-visible:border-lime-400 focus-visible:ring-lime-400/50 focus-visible:shadow-[0_0_15px_rgb(163,230,53,0.3)] hover:border-lime-400/80 hover:shadow-[0_0_10px_rgb(163,230,53,0.2)] backdrop-blur-sm"
    placeholder="Neon chartreuse input..."
              />
            </div>

{/* Neon Pink Input */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-pink-100">Pink Input</label>
  <input 
    className="flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 bg-slate-950/50 border-2 border-pink-400/60 text-pink-100 font-medium placeholder:text-pink-200/70 focus-visible:border-pink-400 focus-visible:ring-pink-400/50 focus-visible:shadow-[0_0_15px_rgb(244,114,182,0.3)] hover:border-pink-400/80 hover:shadow-[0_0_10px_rgb(244,114,182,0.2)] backdrop-blur-sm"
    placeholder="Neon pink input..."
  />
</div>`}
        />

        {/* Basic Inputs */}
        <ComponentSection
          title="Basic Inputs"
          description="Standard input variants for everyday use"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
              <Input placeholder="Default input..." label="Default" />
              <Input variant="filled" placeholder="Filled input..." label="Filled" />
              <Input variant="ghost" placeholder="Ghost input..." label="Ghost" />
              <Input variant="search" placeholder="Search..." label="Search" />
            </div>
          }
          code={`{/* Default Input */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none">Default</label>
  <input 
    className="flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 border-input bg-background hover:border-accent-foreground/20"
    placeholder="Default input..."
  />
</div>

{/* Filled Input */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none">Filled</label>
  <input 
    className="flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 bg-secondary border-transparent hover:bg-secondary/80"
    placeholder="Filled input..."
  />
</div>

{/* Ghost Input */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none">Ghost</label>
  <input 
    className="flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 border-transparent bg-accent/5 hover:bg-accent/10"
    placeholder="Ghost input..."
  />
</div>

{/* Search Input with Icon */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none">Search</label>
  <div className="relative">
    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
    <input 
      className="flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 pl-10 border-input bg-background hover:border-accent-foreground/20"
      placeholder="Search..."
    />
  </div>
</div>`}
        />

        {/* Input Sizes */}
        <ComponentSection
          title="Input Sizes"
          description="Different sizes for various use cases"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              <Input variant="neon-cyan" size="sm" placeholder="Small..." label="Small" />
              <Input variant="neon-purple" size="default" placeholder="Default..." label="Default" />
              <Input variant="neon-chartreuse" size="lg" placeholder="Large..." label="Large" />
              <Input variant="neon-pink" size="xl" placeholder="Extra large..." label="Extra Large" />
            </div>
          }
          code={`{/* Small Neon Input */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-cyan-100">Small</label>
  <input 
    className="flex h-8 w-full rounded-md border px-2 text-xs ring-offset-background file:border-0 file:bg-transparent file:text-xs file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 bg-slate-950/50 border-2 border-cyan-400/60 text-cyan-100 font-medium placeholder:text-cyan-200/70 focus-visible:border-cyan-400 focus-visible:ring-cyan-400/50 focus-visible:shadow-[0_0_15px_rgb(34,211,238,0.3)] hover:border-cyan-400/80 hover:shadow-[0_0_10px_rgb(34,211,238,0.2)] backdrop-blur-sm"
    placeholder="Small..."
  />
</div>

{/* Default Neon Input */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-purple-100">Default</label>
  <input 
    className="flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 bg-slate-950/50 border-2 border-purple-400/60 text-purple-100 font-medium placeholder:text-purple-200/70 focus-visible:border-purple-400 focus-visible:ring-purple-400/50 focus-visible:shadow-[0_0_15px_rgb(168,85,247,0.3)] hover:border-purple-400/80 hover:shadow-[0_0_10px_rgb(168,85,247,0.2)] backdrop-blur-sm"
    placeholder="Default..."
  />
</div>

{/* Large Neon Input */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-lime-100">Large</label>
  <input 
    className="flex h-11 w-full rounded-md border px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-base file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 bg-slate-950/50 border-2 border-lime-400/60 text-lime-100 font-medium placeholder:text-lime-200/70 focus-visible:border-lime-400 focus-visible:ring-lime-400/50 focus-visible:shadow-[0_0_15px_rgb(163,230,53,0.3)] hover:border-lime-400/80 hover:shadow-[0_0_10px_rgb(163,230,53,0.2)] backdrop-blur-sm"
    placeholder="Large..."
  />
</div>

{/* Extra Large Neon Input */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-pink-100">Extra Large</label>
  <input 
    className="flex h-12 w-full rounded-md border px-5 py-4 text-lg ring-offset-background file:border-0 file:bg-transparent file:text-lg file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 bg-slate-950/50 border-2 border-pink-400/60 text-pink-100 font-medium placeholder:text-pink-200/70 focus-visible:border-pink-400 focus-visible:ring-pink-400/50 focus-visible:shadow-[0_0_15px_rgb(244,114,182,0.3)] hover:border-pink-400/80 hover:shadow-[0_0_10px_rgb(244,114,182,0.2)] backdrop-blur-sm"
    placeholder="Extra large..."
  />
</div>`}
        />

        {/* Neon Input Variants */}
        <ComponentSection
          title="Neon Input Variants"
          description="Specialized neon inputs for different states and purposes"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
              <Input variant="neon-destructive" placeholder="Error input..." label="Destructive" />
              <Input variant="neon-success" placeholder="Success input..." label="Success" />
              <Input variant="neon-warning" placeholder="Warning input..." label="Warning" />
              <Input variant="neon-cyan" loading placeholder="Loading..." label="Loading" />
            </div>
          }
          code={`{/* Destructive Neon Input */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-red-100">Destructive</label>
  <input 
    className="flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 bg-slate-950/50 border-2 border-red-400/60 text-red-100 font-medium placeholder:text-red-200/70 focus-visible:border-red-400 focus-visible:ring-red-400/50 focus-visible:shadow-[0_0_15px_rgb(248,113,113,0.3)] hover:border-red-400/80 hover:shadow-[0_0_10px_rgb(248,113,113,0.2)] backdrop-blur-sm"
    placeholder="Error input..."
  />
</div>

{/* Success Neon Input */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-emerald-100">Success</label>
  <input 
    className="flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 bg-slate-950/50 border-2 border-emerald-400/60 text-emerald-100 font-medium placeholder:text-emerald-200/70 focus-visible:border-emerald-400 focus-visible:ring-emerald-400/50 focus-visible:shadow-[0_0_15px_rgb(52,211,153,0.3)] hover:border-emerald-400/80 hover:shadow-[0_0_10px_rgb(52,211,153,0.2)] backdrop-blur-sm"
    placeholder="Success input..."
  />
</div>

{/* Warning Neon Input */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-amber-100">Warning</label>
  <input 
    className="flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 bg-slate-950/50 border-2 border-amber-400/60 text-amber-100 font-medium placeholder:text-amber-200/70 focus-visible:border-amber-400 focus-visible:ring-amber-400/50 focus-visible:shadow-[0_0_15px_rgb(251,191,36,0.3)] hover:border-amber-400/80 hover:shadow-[0_0_10px_rgb(251,191,36,0.2)] backdrop-blur-sm"
    placeholder="Warning input..."
  />
</div>

{/* Loading Input with Spinner */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-cyan-100">Loading</label>
  <div className="relative">
    <input 
                disabled 
      className="flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 bg-slate-950/50 border-2 border-cyan-400/60 text-cyan-100 font-medium placeholder:text-cyan-200/70 focus-visible:border-cyan-400 focus-visible:ring-cyan-400/50 focus-visible:shadow-[0_0_15px_rgb(34,211,238,0.3)] hover:border-cyan-400/80 hover:shadow-[0_0_10px_rgb(34,211,238,0.2)] backdrop-blur-sm pr-10"
      placeholder="Loading..."
    />
    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-400">
      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  </div>
</div>`}
        />

        {/* Inputs with Icons */}
        <ComponentSection
          title="Inputs with Icons"
          description="Inputs with leading icons, password toggle, and clearable functionality"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
              <Input variant="neon-purple" startIcon={<User className="h-4 w-4" />} placeholder="Username..." label="With Start Icon" />
              <Input variant="neon-cyan" type="password" placeholder="Password..." label="Password Input" />
              <Input variant="neon-chartreuse" clearable placeholder="Type to see clear..." label="Clearable Input" />
              <Input variant="neon-pink" startIcon={<Mail className="h-4 w-4" />} placeholder="Email..." label="Email Input" />
            </div>
          }
          code={`{/* Input with Leading Icon */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-purple-100">With Start Icon</label>
  <div className="relative">
    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400">
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    </div>
    <input 
      className="flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 bg-slate-950/50 border-2 border-purple-400/60 text-purple-100 font-medium placeholder:text-purple-200/70 focus-visible:border-purple-400 focus-visible:ring-purple-400/50 focus-visible:shadow-[0_0_15px_rgb(168,85,247,0.3)] hover:border-purple-400/80 hover:shadow-[0_0_10px_rgb(168,85,247,0.2)] backdrop-blur-sm pl-10"
      placeholder="Username..."
    />
  </div>
</div>

{/* Password Input with Toggle */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-cyan-100">Password Input</label>
  <div className="relative">
    <input 
      type="password"
      className="flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 bg-slate-950/50 border-2 border-cyan-400/60 text-cyan-100 font-medium placeholder:text-cyan-200/70 focus-visible:border-cyan-400 focus-visible:ring-cyan-400/50 focus-visible:shadow-[0_0_15px_rgb(34,211,238,0.3)] hover:border-cyan-400/80 hover:shadow-[0_0_10px_rgb(34,211,238,0.2)] backdrop-blur-sm pr-10"
      placeholder="Password..."
    />
    <button 
      type="button"
      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-400 hover:text-cyan-300 transition-colors"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    </button>
  </div>
</div>

{/* Clearable Input */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-lime-100">Clearable Input</label>
  <div className="relative">
    <input 
      className="flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 bg-slate-950/50 border-2 border-lime-400/60 text-lime-100 font-medium placeholder:text-lime-200/70 focus-visible:border-lime-400 focus-visible:ring-lime-400/50 focus-visible:shadow-[0_0_15px_rgb(163,230,53,0.3)] hover:border-lime-400/80 hover:shadow-[0_0_10px_rgb(163,230,53,0.2)] backdrop-blur-sm pr-10"
      placeholder="Type to see clear..."
    />
    <button 
      type="button"
      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-lime-400 hover:text-lime-300 transition-colors"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</div>

{/* Email Input with Icon */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-pink-100">Email Input</label>
  <div className="relative">
    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-400">
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
      </svg>
    </div>
    <input 
      type="email"
      className="flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 bg-slate-950/50 border-2 border-pink-400/60 text-pink-100 font-medium placeholder:text-pink-200/70 focus-visible:border-pink-400 focus-visible:ring-pink-400/50 focus-visible:shadow-[0_0_15px_rgb(244,114,182,0.3)] hover:border-pink-400/80 hover:shadow-[0_0_10px_rgb(244,114,182,0.2)] backdrop-blur-sm pl-10"
      placeholder="Email..."
    />
  </div>
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
                Copy and paste the input code directly. Install required dependencies:
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