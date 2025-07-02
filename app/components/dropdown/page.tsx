"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Dropdown, DropdownOption } from "@/components/dropdown"
import { Copy, Check, Code, Eye, User, Settings, Palette, Globe, Shield, Zap, Heart, Star, Folder, FileText, Image } from "lucide-react"
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
            <div className="flex items-start justify-center min-h-[400px] py-8">
            {preview}
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="flex items-center justify-between p-4 border-b bg-muted/50">
              <span className="text-sm font-medium">components/ui/dropdown.tsx</span>
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

const basicOptions: DropdownOption[] = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" },
  { value: "option4", label: "Option 4" },
]

const iconOptions: DropdownOption[] = [
  { value: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
  { value: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
  { value: "theme", label: "Theme", icon: <Palette className="w-4 h-4" /> },
  { value: "language", label: "Language", icon: <Globe className="w-4 h-4" /> },
  { value: "security", label: "Security", icon: <Shield className="w-4 h-4" /> },
]

const detailedOptions: DropdownOption[] = [
  { 
    value: "premium", 
    label: "Premium Plan", 
    description: "Access to all features",
    icon: <Zap className="w-4 h-4" />
  },
  { 
    value: "pro", 
    label: "Pro Plan", 
    description: "Advanced features included",
    icon: <Star className="w-4 h-4" />
  },
  { 
    value: "basic", 
    label: "Basic Plan", 
    description: "Essential features only",
    icon: <Heart className="w-4 h-4" />
  },
]

const fileTypeOptions: DropdownOption[] = [
  { value: "folder", label: "Folder", icon: <Folder className="w-4 h-4" /> },
  { value: "document", label: "Document", icon: <FileText className="w-4 h-4" /> },
  { value: "image", label: "Image", icon: <Image className="w-4 h-4" /> },
  { value: "disabled", label: "Disabled Option", disabled: true },
]

export default function DropdownPage() {
  const [selectedValue, setSelectedValue] = useState("")
  const [selectedNeonValue, setSelectedNeonValue] = useState("")
  const [multiSelectValues, setMultiSelectValues] = useState<string[]>([])
  const [searchableValue, setSearchableValue] = useState("")

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          Dropdown Components
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Sleek dropdown and select components with neon effects, search functionality, and multi-select capabilities. Copy and paste into your project.
        </p>
      </motion.div>

      <div className="space-y-16">
        {/* Neon Dropdowns */}
        <ComponentSection
          title="Neon Dropdowns"
          description="Electric dropdown selects with glowing neon effects in multiple vibrant colors"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
              <Dropdown 
                variant="neon-cyan" 
                options={basicOptions}
                placeholder="Select cyan option..."
                label="Cyan Dropdown" 
                value={selectedNeonValue}
                onChange={setSelectedNeonValue}
              />
              <Dropdown 
                variant="neon-purple" 
                options={iconOptions}
                placeholder="Select purple option..."
                label="Purple Dropdown"
              />
              <Dropdown 
                variant="neon-chartreuse" 
                options={detailedOptions}
                placeholder="Select chartreuse option..."
                label="Chartreuse Dropdown"
              />
              <Dropdown 
                variant="neon-pink" 
                options={basicOptions}
                placeholder="Select pink option..."
                label="Pink Dropdown"
              />
            </div>
          }
          code={`{/* Neon Cyan Dropdown */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-cyan-100">Cyan Dropdown</label>
  <div className="relative">
    <div className="relative flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 cursor-pointer bg-slate-950/50 border-2 border-cyan-400/60 text-cyan-100 font-medium hover:border-cyan-400/80 hover:shadow-[0_0_10px_rgb(34,211,238,0.2)] backdrop-blur-sm focus-visible:border-cyan-400 focus-visible:ring-cyan-400/50 focus-visible:shadow-[0_0_15px_rgb(34,211,238,0.3)]">
      <span className="truncate text-opacity-70">Select cyan option...</span>
      <svg className="h-4 w-4 transition-transform duration-200 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <polyline points="6,9 12,15 18,9"></polyline>
      </svg>
    </div>
  </div>
</div>

{/* Neon Purple Dropdown */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-purple-100">Purple Dropdown</label>
  <div className="relative">
    <div className="relative flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 cursor-pointer bg-slate-950/50 border-2 border-purple-400/60 text-purple-100 font-medium hover:border-purple-400/80 hover:shadow-[0_0_10px_rgb(168,85,247,0.2)] backdrop-blur-sm focus-visible:border-purple-400 focus-visible:ring-purple-400/50 focus-visible:shadow-[0_0_15px_rgb(168,85,247,0.3)]">
      <span className="truncate text-opacity-70">Select purple option...</span>
      <svg className="h-4 w-4 transition-transform duration-200 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <polyline points="6,9 12,15 18,9"></polyline>
      </svg>
    </div>
  </div>
</div>

{/* Neon Chartreuse Dropdown */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-lime-100">Chartreuse Dropdown</label>
  <div className="relative">
    <div className="relative flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 cursor-pointer bg-slate-950/50 border-2 border-lime-400/60 text-lime-100 font-medium hover:border-lime-400/80 hover:shadow-[0_0_10px_rgb(163,230,53,0.2)] backdrop-blur-sm focus-visible:border-lime-400 focus-visible:ring-lime-400/50 focus-visible:shadow-[0_0_15px_rgb(163,230,53,0.3)]">
      <span className="truncate text-opacity-70">Select chartreuse option...</span>
      <svg className="h-4 w-4 transition-transform duration-200 text-lime-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <polyline points="6,9 12,15 18,9"></polyline>
      </svg>
    </div>
  </div>
</div>

{/* Neon Pink Dropdown */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-pink-100">Pink Dropdown</label>
  <div className="relative">
    <div className="relative flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 cursor-pointer bg-slate-950/50 border-2 border-pink-400/60 text-pink-100 font-medium hover:border-pink-400/80 hover:shadow-[0_0_10px_rgb(244,114,182,0.2)] backdrop-blur-sm focus-visible:border-pink-400 focus-visible:ring-pink-400/50 focus-visible:shadow-[0_0_15px_rgb(244,114,182,0.3)]">
      <span className="truncate text-opacity-70">Select pink option...</span>
      <svg className="h-4 w-4 transition-transform duration-200 text-pink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <polyline points="6,9 12,15 18,9"></polyline>
      </svg>
    </div>
  </div>
</div>`}
        />

        {/* Advanced Dropdowns */}
        <ComponentSection
          title="Advanced Dropdowns"
          description="Feature-rich dropdowns with icons, descriptions, search, and multi-select capabilities"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
              <Dropdown 
                variant="neon-cyan"
                options={iconOptions}
                placeholder="Select with icons..."
                label="With Icons" 
                searchable
              />
              <Dropdown 
                variant="neon-purple"
                options={detailedOptions}
                placeholder="Select with descriptions..."
                label="With Descriptions"
                clearable
              />
              <Dropdown 
                variant="neon-chartreuse"
                options={fileTypeOptions}
                placeholder="Multi-select options..."
                label="Multi-Select"
                multiple
                values={multiSelectValues}
                onMultipleChange={setMultiSelectValues}
              />
              <Dropdown 
                variant="neon-pink"
                options={iconOptions}
                placeholder="Searchable dropdown..."
                label="Searchable"
                searchable
                clearable
                value={searchableValue}
                onChange={setSearchableValue}
              />
            </div>
          }
          code={`{/* Dropdown with Icons */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-cyan-100">With Icons</label>
  <div className="relative">
    <div className="relative flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 cursor-pointer bg-slate-950/50 border-2 border-cyan-400/60 text-cyan-100 font-medium hover:border-cyan-400/80 hover:shadow-[0_0_10px_rgb(34,211,238,0.2)] backdrop-blur-sm focus-visible:border-cyan-400 focus-visible:ring-cyan-400/50 focus-visible:shadow-[0_0_15px_rgb(34,211,238,0.3)]">
      <span className="truncate text-opacity-70">Select with icons...</span>
      <svg className="h-4 w-4 transition-transform duration-200 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <polyline points="6,9 12,15 18,9"></polyline>
      </svg>
    </div>
  </div>
</div>

{/* Dropdown with Descriptions */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-purple-100">With Descriptions</label>
  <div className="relative">
    <div className="relative flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 cursor-pointer bg-slate-950/50 border-2 border-purple-400/60 text-purple-100 font-medium hover:border-purple-400/80 hover:shadow-[0_0_10px_rgb(168,85,247,0.2)] backdrop-blur-sm focus-visible:border-purple-400 focus-visible:ring-purple-400/50 focus-visible:shadow-[0_0_15px_rgb(168,85,247,0.3)]">
      <span className="truncate text-opacity-70">Select with descriptions...</span>
      <button className="p-0.5 rounded hover:bg-accent transition-colors text-purple-400">
        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <svg className="h-4 w-4 transition-transform duration-200 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <polyline points="6,9 12,15 18,9"></polyline>
      </svg>
    </div>
  </div>
</div>

{/* Multi-Select Dropdown */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-lime-100">Multi-Select</label>
  <div className="relative">
    <div className="relative flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 cursor-pointer bg-slate-950/50 border-2 border-lime-400/60 text-lime-100 font-medium hover:border-lime-400/80 hover:shadow-[0_0_10px_rgb(163,230,53,0.2)] backdrop-blur-sm focus-visible:border-lime-400 focus-visible:ring-lime-400/50 focus-visible:shadow-[0_0_15px_rgb(163,230,53,0.3)]">
      <span className="truncate text-opacity-70">2 selected</span>
      <div className="flex items-center gap-1">
        <button className="p-0.5 rounded hover:bg-accent transition-colors text-lime-400">
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <svg className="h-4 w-4 transition-transform duration-200 text-lime-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="6,9 12,15 18,9"></polyline>
        </svg>
      </div>
    </div>
  </div>
</div>

{/* Searchable Dropdown */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-pink-100">Searchable</label>
  <div className="relative">
    <div className="relative flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 cursor-pointer bg-slate-950/50 border-2 border-pink-400/60 text-pink-100 font-medium hover:border-pink-400/80 hover:shadow-[0_0_10px_rgb(244,114,182,0.2)] backdrop-blur-sm focus-visible:border-pink-400 focus-visible:ring-pink-400/50 focus-visible:shadow-[0_0_15px_rgb(244,114,182,0.3)]">
      <span className="truncate text-opacity-70">Searchable dropdown...</span>
      <button className="p-0.5 rounded hover:bg-accent transition-colors text-pink-400">
        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <svg className="h-4 w-4 transition-transform duration-200 text-pink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <polyline points="6,9 12,15 18,9"></polyline>
      </svg>
    </div>
  </div>
</div>`}
        />

        {/* Basic Dropdowns */}
        <ComponentSection
          title="Basic Dropdowns"
          description="Standard dropdown variants for everyday use with clean styling"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
              <Dropdown 
                options={basicOptions}
                placeholder="Default dropdown..."
                label="Default" 
                value={selectedValue}
                onChange={setSelectedValue}
              />
              <Dropdown 
                variant="filled"
                options={basicOptions}
                placeholder="Filled dropdown..."
                label="Filled"
              />
              <Dropdown 
                variant="ghost"
                options={basicOptions}
                placeholder="Ghost dropdown..."
                label="Ghost"
              />
              <Dropdown 
                options={basicOptions}
                placeholder="Clearable dropdown..."
                label="Clearable"
                clearable
              />
            </div>
          }
          code={`{/* Default Dropdown */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none">Default</label>
  <div className="relative">
    <div className="relative flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 cursor-pointer border-input bg-background hover:border-accent-foreground/20">
      <span className="truncate text-muted-foreground">Default dropdown...</span>
      <svg className="h-4 w-4 transition-transform duration-200 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <polyline points="6,9 12,15 18,9"></polyline>
      </svg>
    </div>
  </div>
</div>

{/* Filled Dropdown */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none">Filled</label>
  <div className="relative">
    <div className="relative flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 cursor-pointer bg-secondary border-transparent hover:bg-secondary/80">
      <span className="truncate text-muted-foreground">Filled dropdown...</span>
      <svg className="h-4 w-4 transition-transform duration-200 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <polyline points="6,9 12,15 18,9"></polyline>
      </svg>
    </div>
  </div>
</div>

{/* Ghost Dropdown */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none">Ghost</label>
  <div className="relative">
    <div className="relative flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 cursor-pointer border-transparent bg-accent/5 hover:bg-accent/10">
      <span className="truncate text-muted-foreground">Ghost dropdown...</span>
      <svg className="h-4 w-4 transition-transform duration-200 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <polyline points="6,9 12,15 18,9"></polyline>
      </svg>
    </div>
  </div>
</div>

{/* Clearable Dropdown */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none">Clearable</label>
  <div className="relative">
    <div className="relative flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 cursor-pointer border-input bg-background hover:border-accent-foreground/20">
      <span className="truncate">Option 1</span>
      <div className="flex items-center gap-1">
        <button className="p-0.5 rounded hover:bg-accent transition-colors text-muted-foreground">
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <svg className="h-4 w-4 transition-transform duration-200 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="6,9 12,15 18,9"></polyline>
        </svg>
      </div>
    </div>
  </div>
</div>`}
        />

        {/* Status & Loading States */}
        <ComponentSection
          title="Status & Loading States"
          description="Dropdown states for error handling, success feedback, and loading indicators"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
              <Dropdown 
                variant="neon-destructive"
                options={basicOptions}
                placeholder="Error state..."
                label="Error State" 
                error
                helperText="Please select a valid option"
              />
              <Dropdown 
                variant="neon-success"
                options={basicOptions}
                placeholder="Success state..."
                label="Success State"
                success
                helperText="Great choice!"
              />
              <Dropdown 
                variant="neon-warning"
                options={basicOptions}
                placeholder="Loading state..."
                label="Loading State"
                loading
                helperText="Loading options..."
              />
              <Dropdown 
                options={basicOptions}
                placeholder="Disabled state..."
                label="Disabled State"
                disabled
                helperText="This dropdown is disabled"
              />
            </div>
          }
          code={`{/* Error State */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-red-100">Error State</label>
  <div className="relative">
    <div className="relative flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 cursor-pointer bg-slate-950/50 border-2 border-red-400/60 text-red-100 font-medium hover:border-red-400/80 hover:shadow-[0_0_10px_rgb(248,113,113,0.2)] backdrop-blur-sm focus-visible:border-red-400 focus-visible:ring-red-400/50 focus-visible:shadow-[0_0_15px_rgb(248,113,113,0.3)] border-destructive">
      <span className="truncate text-opacity-70">Error state...</span>
      <svg className="h-4 w-4 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <polyline points="6,9 12,15 18,9"></polyline>
      </svg>
    </div>
  </div>
  <p className="text-xs text-destructive">Please select a valid option</p>
</div>

{/* Success State */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-emerald-100">Success State</label>
  <div className="relative">
    <div className="relative flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 cursor-pointer bg-slate-950/50 border-2 border-emerald-400/60 text-emerald-100 font-medium hover:border-emerald-400/80 hover:shadow-[0_0_10px_rgb(52,211,153,0.2)] backdrop-blur-sm focus-visible:border-emerald-400 focus-visible:ring-emerald-400/50 focus-visible:shadow-[0_0_15px_rgb(52,211,153,0.3)] border-green-500">
      <span className="truncate text-opacity-70">Success state...</span>
      <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <polyline points="6,9 12,15 18,9"></polyline>
      </svg>
    </div>
  </div>
  <p className="text-xs text-green-600">Great choice!</p>
</div>

{/* Loading State */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-amber-100">Loading State</label>
  <div className="relative">
    <div className="relative flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 cursor-pointer bg-slate-950/50 border-2 border-amber-400/60 text-amber-100 font-medium hover:border-amber-400/80 hover:shadow-[0_0_10px_rgb(251,191,36,0.2)] backdrop-blur-sm focus-visible:border-amber-400 focus-visible:ring-amber-400/50 focus-visible:shadow-[0_0_15px_rgb(251,191,36,0.3)]">
      <span className="truncate text-opacity-70">Loading state...</span>
      <svg className="h-4 w-4 animate-spin text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M21 12a9 9 0 11-6.219-8.56"></path>
      </svg>
    </div>
  </div>
  <p className="text-xs text-muted-foreground">Loading options...</p>
</div>

{/* Disabled State */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-muted-foreground">Disabled State</label>
  <div className="relative">
    <div className="relative flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-300 border-input bg-background opacity-50 cursor-not-allowed">
      <span className="truncate text-muted-foreground">Disabled state...</span>
      <svg className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <polyline points="6,9 12,15 18,9"></polyline>
      </svg>
    </div>
  </div>
  <p className="text-xs text-muted-foreground">This dropdown is disabled</p>
</div>`}
        />

        {/* Sizes */}
        <ComponentSection
          title="Dropdown Sizes"
          description="Different sizes to fit various design contexts and layouts"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
              <Dropdown 
                variant="neon-cyan"
                options={basicOptions}
                placeholder="Small dropdown..."
                label="Small (sm)" 
                size="sm"
              />
              <Dropdown 
                variant="neon-purple"
                options={basicOptions}
                placeholder="Default dropdown..."
                label="Default"
                size="default"
              />
              <Dropdown 
                variant="neon-chartreuse"
                options={basicOptions}
                placeholder="Large dropdown..."
                label="Large (lg)"
                size="lg"
              />
              <Dropdown 
                variant="neon-pink"
                options={basicOptions}
                placeholder="Extra large dropdown..."
                label="Extra Large (xl)"
                size="xl"
              />
            </div>
          }
          code={`{/* Small Size (sm) */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-cyan-100">
    Small (sm)
  </label>
  <div className="relative">
    <div className="relative flex h-8 w-full items-center justify-between rounded-md border px-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 cursor-pointer bg-slate-950/50 border-2 border-cyan-400/60 text-cyan-100 font-medium hover:border-cyan-400/80 hover:shadow-[0_0_10px_rgb(34,211,238,0.2)] backdrop-blur-sm focus-visible:border-cyan-400 focus-visible:ring-cyan-400/50 focus-visible:shadow-[0_0_15px_rgb(34,211,238,0.3)]">
      <span className="truncate text-opacity-70">Small dropdown...</span>
      <svg className="h-3 w-3 transition-transform duration-200 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <polyline points="6,9 12,15 18,9"></polyline>
      </svg>
    </div>
  </div>
</div>

{/* Default Size */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-purple-100">
    Default
  </label>
  <div className="relative">
    <div className="relative flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 cursor-pointer bg-slate-950/50 border-2 border-purple-400/60 text-purple-100 font-medium hover:border-purple-400/80 hover:shadow-[0_0_10px_rgb(168,85,247,0.2)] backdrop-blur-sm focus-visible:border-purple-400 focus-visible:ring-purple-400/50 focus-visible:shadow-[0_0_15px_rgb(168,85,247,0.3)]">
      <span className="truncate text-opacity-70">Default dropdown...</span>
      <svg className="h-4 w-4 transition-transform duration-200 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <polyline points="6,9 12,15 18,9"></polyline>
      </svg>
    </div>
  </div>
</div>

{/* Large Size (lg) */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-lime-100">
    Large (lg)
  </label>
  <div className="relative">
    <div className="relative flex h-11 w-full items-center justify-between rounded-md border px-4 py-3 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 cursor-pointer bg-slate-950/50 border-2 border-lime-400/60 text-lime-100 font-medium hover:border-lime-400/80 hover:shadow-[0_0_10px_rgb(163,230,53,0.2)] backdrop-blur-sm focus-visible:border-lime-400 focus-visible:ring-lime-400/50 focus-visible:shadow-[0_0_15px_rgb(163,230,53,0.3)]">
      <span className="truncate text-opacity-70">Large dropdown...</span>
      <svg className="h-5 w-5 transition-transform duration-200 text-lime-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <polyline points="6,9 12,15 18,9"></polyline>
      </svg>
    </div>
  </div>
</div>

{/* Extra Large Size (xl) */}
<div className="space-y-2">
  <label className="text-sm font-medium leading-none text-pink-100">
    Extra Large (xl)
  </label>
  <div className="relative">
    <div className="relative flex h-12 w-full items-center justify-between rounded-md border px-5 py-4 text-lg ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 cursor-pointer bg-slate-950/50 border-2 border-pink-400/60 text-pink-100 font-medium hover:border-pink-400/80 hover:shadow-[0_0_10px_rgb(244,114,182,0.2)] backdrop-blur-sm focus-visible:border-pink-400 focus-visible:ring-pink-400/50 focus-visible:shadow-[0_0_15px_rgb(244,114,182,0.3)]">
      <span className="truncate text-opacity-70">Extra large dropdown...</span>
      <svg className="h-5 w-5 transition-transform duration-200 text-pink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <polyline points="6,9 12,15 18,9"></polyline>
      </svg>
    </div>
  </div>
</div>`}
        />
      </div>
    </div>
  )
} 