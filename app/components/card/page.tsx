"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { 
  Heart, 
  Star, 
  Share2, 
  MessageSquare, 
  Calendar, 
  Clock, 
  User, 
  Tag, 
  Zap, 
  Shield, 
  Rocket, 
  Users, 
  TrendingUp, 
  DollarSign,
  Activity,
  Copy,
  Check,
  Code,
  Palette,
  Play,
  Eye,
  ChevronRight,
  ArrowRight,
  Download,
  Mail,
  Phone,
  Globe
} from "lucide-react"

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
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
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
              <span className="text-sm font-medium">components/ui/card.tsx</span>
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

export default function CardsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-lime-400 bg-clip-text text-transparent">
            Card Components
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Beautiful card components with stunning neon effects and animations. Perfect for dashboards, feature showcases, and content display.
          </p>
        </div>

        {/* Neon Cards */}
        <ComponentSection
          title="Neon Cards"
          description="Stunning neon card variants with glowing borders and effects"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
              {/* Neon Blue Card */}
              <div className="relative rounded-lg border-2 border-cyan-400/50 bg-slate-950/90 backdrop-blur-sm p-6 shadow-[0_0_20px_rgba(34,211,238,0.15)] hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-cyan-400/10 before:via-transparent before:to-cyan-400/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 transition-all duration-300 hover:translate-y-[-4px]">
                <div className="relative z-10">
                  <div className="flex flex-col space-y-1.5 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-cyan-400/20 rounded-lg">
                        <Zap className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold leading-none tracking-tight text-white">Lightning Fast</h3>
                        <p className="text-sm text-cyan-100">Performance Optimized</p>
                      </div>
                    </div>
                  </div>
                  <div className="pb-4">
                    <p className="text-gray-300 text-sm">
                      Experience blazing fast performance with our optimized components and efficient rendering.
                    </p>
                  </div>
                </div>
              </div>

              {/* Neon Purple Card */}
              <div className="relative rounded-lg border-2 border-purple-400/50 bg-slate-950/90 backdrop-blur-sm p-6 shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:border-purple-400 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-purple-400/10 before:via-transparent before:to-purple-400/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 transition-all duration-300 hover:translate-y-[-4px]">
                <div className="relative z-10">
                  <div className="flex flex-col space-y-1.5 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-400/20 rounded-lg">
                        <Shield className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold leading-none tracking-tight text-white">Secure</h3>
                        <p className="text-sm text-purple-100">Enterprise Grade</p>
                      </div>
                    </div>
                  </div>
                  <div className="pb-4">
                    <p className="text-gray-300 text-sm">
                      Built with security in mind, featuring enterprise-grade protection and best practices.
                    </p>
                  </div>
                </div>
              </div>

              {/* Neon Chartreuse Card */}
              <div className="relative rounded-lg border-2 border-lime-400/50 bg-slate-950/90 backdrop-blur-sm p-6 shadow-[0_0_20px_rgba(163,230,53,0.15)] hover:border-lime-400 hover:shadow-[0_0_30px_rgba(163,230,53,0.3)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-lime-400/10 before:via-transparent before:to-lime-400/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 transition-all duration-300 hover:translate-y-[-4px]">
                <div className="relative z-10">
                  <div className="flex flex-col space-y-1.5 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-lime-400/20 rounded-lg">
                        <Rocket className="w-6 h-6 text-lime-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold leading-none tracking-tight text-white">Scalable</h3>
                        <p className="text-sm text-lime-100">Future Ready</p>
                      </div>
                    </div>
                  </div>
                  <div className="pb-4">
                    <p className="text-gray-300 text-sm">
                      Scale from prototype to production with components designed for growth.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          }
          code={`<div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
  {/* Neon Blue Card */}
  <div className="relative rounded-lg border-2 border-cyan-400/50 bg-slate-950/90 backdrop-blur-sm p-6 shadow-[0_0_20px_rgba(34,211,238,0.15)] hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-cyan-400/10 before:via-transparent before:to-cyan-400/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 transition-all duration-300 hover:translate-y-[-4px]">
    <div className="relative z-10">
      <div className="flex flex-col space-y-1.5 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-400/20 rounded-lg">
            <Zap className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold leading-none tracking-tight text-white">Lightning Fast</h3>
            <p className="text-sm text-cyan-100">Performance Optimized</p>
          </div>
        </div>
      </div>
      <div className="pb-4">
        <p className="text-gray-300 text-sm">
          Experience blazing fast performance with our optimized components and efficient rendering.
        </p>
      </div>
    </div>
  </div>

  {/* Neon Purple Card */}
  <div className="relative rounded-lg border-2 border-purple-400/50 bg-slate-950/90 backdrop-blur-sm p-6 shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:border-purple-400 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-purple-400/10 before:via-transparent before:to-purple-400/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 transition-all duration-300 hover:translate-y-[-4px]">
    <div className="relative z-10">
      <div className="flex flex-col space-y-1.5 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-400/20 rounded-lg">
            <Shield className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold leading-none tracking-tight text-white">Secure</h3>
            <p className="text-sm text-purple-100">Enterprise Grade</p>
          </div>
        </div>
      </div>
      <div className="pb-4">
        <p className="text-gray-300 text-sm">
          Built with security in mind, featuring enterprise-grade protection and best practices.
        </p>
      </div>
    </div>
  </div>

  {/* Neon Chartreuse Card */}
  <div className="relative rounded-lg border-2 border-lime-400/50 bg-slate-950/90 backdrop-blur-sm p-6 shadow-[0_0_20px_rgba(163,230,53,0.15)] hover:border-lime-400 hover:shadow-[0_0_30px_rgba(163,230,53,0.3)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-lime-400/10 before:via-transparent before:to-lime-400/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 transition-all duration-300 hover:translate-y-[-4px]">
    <div className="relative z-10">
      <div className="flex flex-col space-y-1.5 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-lime-400/20 rounded-lg">
            <Rocket className="w-6 h-6 text-lime-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold leading-none tracking-tight text-white">Scalable</h3>
            <p className="text-sm text-lime-100">Future Ready</p>
          </div>
        </div>
      </div>
      <div className="pb-4">
        <p className="text-gray-300 text-sm">
          Scale from prototype to production with components designed for growth.
        </p>
      </div>
    </div>
  </div>
</div>`}
        />

        {/* Custom Neon & Glass Cards */}
        <ComponentSection
          title="Custom & Glass Cards"
          description="Customizable neon colors and glassmorphism effects"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
              {/* Custom Pink Neon Card */}
              <div 
                className="relative rounded-lg border-2 bg-slate-950/90 backdrop-blur-sm p-6 transition-all duration-300 hover:translate-y-[-4px]"
                style={{
                  borderColor: '#FF008080',
                  boxShadow: '0 0 20px #FF008025',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#FF0080'
                  e.currentTarget.style.boxShadow = '0 0 30px #FF008050'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#FF008080'
                  e.currentTarget.style.boxShadow = '0 0 20px #FF008025'
                }}
              >
                <div 
                  className="absolute inset-0 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: 'linear-gradient(135deg, #FF008010, transparent, #FF008005)'
                  }}
                />
                <div className="relative z-10">
                  <div className="flex flex-col space-y-1.5 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-pink-400/20 rounded-lg">
                        <Heart className="w-6 h-6" style={{ color: "#FF0080" }} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold leading-none tracking-tight text-white">Custom Pink</h3>
                        <p className="text-sm text-pink-100">Your Brand Colors</p>
                      </div>
                    </div>
                  </div>
                  <div className="pb-4">
                    <p className="text-gray-300 text-sm">
                      Use any color for your neon effects to match your brand perfectly.
                    </p>
                  </div>
                </div>
              </div>

              {/* Glass Card */}
              <div className="relative rounded-lg backdrop-blur-lg bg-white/10 dark:bg-black/20 p-6 border border-white/20 dark:border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:translate-y-[-2px]">
                <div className="flex flex-col space-y-1.5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold leading-none tracking-tight text-white">Glass Effect</h3>
                      <p className="text-sm text-white/70">Modern Glassmorphism</p>
                    </div>
                  </div>
                </div>
                <div className="pb-4">
                  <p className="text-white/80 text-sm">
                    Beautiful glassmorphism design with backdrop blur and transparency.
                  </p>
                </div>
              </div>
            </div>
          }
          code={`<div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
  {/* Custom Pink Neon Card */}
  <div 
    className="relative rounded-lg border-2 bg-slate-950/90 backdrop-blur-sm p-6 transition-all duration-300 hover:translate-y-[-4px]"
    style={{
      borderColor: '#FF008080',
      boxShadow: '0 0 20px #FF008025',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = '#FF0080'
      e.currentTarget.style.boxShadow = '0 0 30px #FF008050'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = '#FF008080'
      e.currentTarget.style.boxShadow = '0 0 20px #FF008025'
    }}
  >
    <div 
      className="absolute inset-0 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-500"
      style={{
        background: 'linear-gradient(135deg, #FF008010, transparent, #FF008005)'
      }}
    />
    <div className="relative z-10">
      <div className="flex flex-col space-y-1.5 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-400/20 rounded-lg">
            <Heart className="w-6 h-6" style={{ color: "#FF0080" }} />
          </div>
          <div>
            <h3 className="text-lg font-semibold leading-none tracking-tight text-white">Custom Pink</h3>
            <p className="text-sm text-pink-100">Your Brand Colors</p>
          </div>
        </div>
      </div>
      <div className="pb-4">
        <p className="text-gray-300 text-sm">
          Use any color for your neon effects to match your brand perfectly.
        </p>
      </div>
    </div>
  </div>

  {/* Glass Card */}
  <div className="relative rounded-lg backdrop-blur-lg bg-white/10 dark:bg-black/20 p-6 border border-white/20 dark:border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:translate-y-[-2px]">
    <div className="flex flex-col space-y-1.5 pb-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
          <Eye className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold leading-none tracking-tight text-white">Glass Effect</h3>
          <p className="text-sm text-white/70">Modern Glassmorphism</p>
        </div>
      </div>
    </div>
    <div className="pb-4">
      <p className="text-white/80 text-sm">
        Beautiful glassmorphism design with backdrop blur and transparency.
      </p>
    </div>
  </div>
</div>`}
        />

        {/* Stats Cards */}
        <ComponentSection
          title="Stats Cards"
          description="Perfect for dashboards and analytics displays"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full max-w-5xl">
              {/* Users Stats Card */}
              <div className="relative rounded-lg border-2 border-cyan-400/50 bg-slate-950/90 backdrop-blur-sm p-6 shadow-[0_0_20px_rgba(34,211,238,0.15)] hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-cyan-400/10 before:via-transparent before:to-cyan-400/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 transition-all duration-300 hover:translate-y-[-4px]">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-300">Total Users</h3>
                    <div className="w-8 h-8 flex items-center justify-center text-cyan-400">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="text-3xl font-bold text-cyan-400">12,543</div>
                    <div className="text-sm text-green-400">↗ +12.5%</div>
                  </div>
                  <p className="text-sm text-gray-400">Active this month</p>
                </div>
              </div>

              {/* Revenue Stats Card */}
              <div className="relative rounded-lg border-2 border-lime-400/50 bg-slate-950/90 backdrop-blur-sm p-6 shadow-[0_0_20px_rgba(163,230,53,0.15)] hover:border-lime-400 hover:shadow-[0_0_30px_rgba(163,230,53,0.3)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-lime-400/10 before:via-transparent before:to-lime-400/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 transition-all duration-300 hover:translate-y-[-4px]">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-300">Revenue</h3>
                    <div className="w-8 h-8 flex items-center justify-center text-lime-400">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="text-3xl font-bold text-lime-400">$48,293</div>
                    <div className="text-sm text-green-400">↗ +8.2%</div>
                  </div>
                  <p className="text-sm text-gray-400">Monthly recurring</p>
                </div>
              </div>

              {/* Conversion Stats Card */}
              <div className="relative rounded-lg border-2 border-orange-400/50 bg-slate-950/90 backdrop-blur-sm p-6 shadow-[0_0_20px_rgba(251,146,60,0.15)] hover:border-orange-400 hover:shadow-[0_0_30px_rgba(251,146,60,0.3)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-orange-400/10 before:via-transparent before:to-orange-400/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 transition-all duration-300 hover:translate-y-[-4px]">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-300">Conversion</h3>
                    <div className="w-8 h-8 flex items-center justify-center text-orange-400">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="text-3xl font-bold text-orange-400">3.24%</div>
                    <div className="text-sm text-red-400">↘ -0.4%</div>
                  </div>
                  <p className="text-sm text-gray-400">This week</p>
                </div>
              </div>

              {/* Activity Stats Card */}
              <div className="relative rounded-lg border-2 border-purple-400/50 bg-slate-950/90 backdrop-blur-sm p-6 shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:border-purple-400 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-purple-400/10 before:via-transparent before:to-purple-400/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 transition-all duration-300 hover:translate-y-[-4px]">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-300">Activity</h3>
                    <div className="w-8 h-8 flex items-center justify-center text-purple-400">
                      <Activity className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="text-3xl font-bold text-purple-400">98.5%</div>
                    <div className="text-sm text-gray-400">→ stable</div>
                  </div>
                  <p className="text-sm text-gray-400">Uptime</p>
                </div>
              </div>
            </div>
          }
          code={`<div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full max-w-5xl">
  {/* Users Stats Card */}
  <div className="relative rounded-lg border-2 border-cyan-400/50 bg-slate-950/90 backdrop-blur-sm p-6 shadow-[0_0_20px_rgba(34,211,238,0.15)] hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-cyan-400/10 before:via-transparent before:to-cyan-400/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 transition-all duration-300 hover:translate-y-[-4px]">
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-300">Total Users</h3>
        <div className="w-8 h-8 flex items-center justify-center text-cyan-400">
          <Users className="w-5 h-5" />
        </div>
      </div>
      <div className="mb-2">
        <div className="text-3xl font-bold text-cyan-400">12,543</div>
        <div className="text-sm text-green-400">↗ +12.5%</div>
      </div>
      <p className="text-sm text-gray-400">Active this month</p>
    </div>
  </div>

  {/* Revenue Stats Card */}
  <div className="relative rounded-lg border-2 border-lime-400/50 bg-slate-950/90 backdrop-blur-sm p-6 shadow-[0_0_20px_rgba(163,230,53,0.15)] hover:border-lime-400 hover:shadow-[0_0_30px_rgba(163,230,53,0.3)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-lime-400/10 before:via-transparent before:to-lime-400/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 transition-all duration-300 hover:translate-y-[-4px]">
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-300">Revenue</h3>
        <div className="w-8 h-8 flex items-center justify-center text-lime-400">
          <DollarSign className="w-5 h-5" />
        </div>
      </div>
      <div className="mb-2">
        <div className="text-3xl font-bold text-lime-400">$48,293</div>
        <div className="text-sm text-green-400">↗ +8.2%</div>
      </div>
      <p className="text-sm text-gray-400">Monthly recurring</p>
    </div>
  </div>

  {/* Conversion Stats Card */}
  <div className="relative rounded-lg border-2 border-orange-400/50 bg-slate-950/90 backdrop-blur-sm p-6 shadow-[0_0_20px_rgba(251,146,60,0.15)] hover:border-orange-400 hover:shadow-[0_0_30px_rgba(251,146,60,0.3)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-orange-400/10 before:via-transparent before:to-orange-400/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 transition-all duration-300 hover:translate-y-[-4px]">
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-300">Conversion</h3>
        <div className="w-8 h-8 flex items-center justify-center text-orange-400">
          <TrendingUp className="w-5 h-5" />
        </div>
      </div>
      <div className="mb-2">
        <div className="text-3xl font-bold text-orange-400">3.24%</div>
        <div className="text-sm text-red-400">↘ -0.4%</div>
      </div>
      <p className="text-sm text-gray-400">This week</p>
    </div>
  </div>

  {/* Activity Stats Card */}
  <div className="relative rounded-lg border-2 border-purple-400/50 bg-slate-950/90 backdrop-blur-sm p-6 shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:border-purple-400 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-purple-400/10 before:via-transparent before:to-purple-400/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 transition-all duration-300 hover:translate-y-[-4px]">
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-300">Activity</h3>
        <div className="w-8 h-8 flex items-center justify-center text-purple-400">
          <Activity className="w-5 h-5" />
        </div>
      </div>
      <div className="mb-2">
        <div className="text-3xl font-bold text-purple-400">98.5%</div>
        <div className="text-sm text-gray-400">→ stable</div>
      </div>
      <p className="text-sm text-gray-400">Uptime</p>
    </div>
  </div>
</div>`}
        />

        {/* Interactive Cards */}
        <ComponentSection
          title="Interactive Cards"
          description="Clickable cards with hover and focus states"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
              {/* Download Report Interactive Card - Neon Cyan */}
              <div 
                className="relative rounded-lg border-2 border-cyan-400/50 bg-slate-950/90 backdrop-blur-sm p-6 cursor-pointer transition-all duration-300 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:translate-y-[-4px] hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-cyan-400/50 group before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-cyan-400/10 before:via-transparent before:to-cyan-400/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 shadow-[0_0_20px_rgba(34,211,238,0.15)]"
                onClick={() => alert('Card clicked!')}
                tabIndex={0}
              >
                <div className="relative z-10">
                  <div className="flex flex-col space-y-1.5 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-cyan-400/20 rounded-lg border border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                          <Download className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold leading-none tracking-tight text-white">Download Report</h3>
                          <p className="text-sm text-cyan-100">Monthly analytics data</p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors transform group-hover:translate-x-1" />
                    </div>
                  </div>
                  <div className="pb-4">
                    <p className="text-sm text-gray-300">
                      Get detailed insights about your app's performance and user engagement metrics.
                    </p>
                  </div>
                </div>
              </div>

              {/* Premium Features Card - Enhanced Neon Gradient */}
              <div className="relative rounded-lg bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 border-2 border-purple-400/50 shadow-[0_0_25px_rgba(168,85,247,0.2)] hover:border-purple-400 hover:shadow-[0_0_35px_rgba(168,85,247,0.4)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-cyan-400/5 before:via-purple-400/10 before:to-lime-400/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 transition-all duration-300 hover:translate-y-[-2px]">
                <div className="relative z-10">
                  <div className="flex flex-col space-y-1.5 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-400/20 rounded-lg border border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                        <Star className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold leading-none tracking-tight text-white">Premium Features</h3>
                        <p className="text-sm text-purple-100">Unlock advanced tools</p>
                      </div>
                    </div>
                  </div>
                  <div className="pb-4">
                    <p className="text-gray-300 text-sm mb-4">
                      Access exclusive features and priority support with our premium plan.
                    </p>
                    <button className="w-full py-3 px-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-lime-400 text-black rounded-lg font-bold hover:from-cyan-300 hover:via-purple-300 hover:to-lime-300 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transform hover:scale-105">
                      ✨ Upgrade Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }
          code={`<div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
  {/* Download Report Interactive Card - Neon Cyan */}
  <div 
    className="relative rounded-lg border-2 border-cyan-400/50 bg-slate-950/90 backdrop-blur-sm p-6 cursor-pointer transition-all duration-300 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:translate-y-[-4px] hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-cyan-400/50 group before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-cyan-400/10 before:via-transparent before:to-cyan-400/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 shadow-[0_0_20px_rgba(34,211,238,0.15)]"
    onClick={() => alert('Card clicked!')}
    tabIndex={0}
  >
    <div className="relative z-10">
      <div className="flex flex-col space-y-1.5 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-400/20 rounded-lg border border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              <Download className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold leading-none tracking-tight text-white">Download Report</h3>
              <p className="text-sm text-cyan-100">Monthly analytics data</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors transform group-hover:translate-x-1" />
        </div>
      </div>
      <div className="pb-4">
        <p className="text-sm text-gray-300">
          Get detailed insights about your app's performance and user engagement metrics.
        </p>
      </div>
    </div>
  </div>

  {/* Premium Features Card - Enhanced Neon Gradient */}
  <div className="relative rounded-lg bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 border-2 border-purple-400/50 shadow-[0_0_25px_rgba(168,85,247,0.2)] hover:border-purple-400 hover:shadow-[0_0_35px_rgba(168,85,247,0.4)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-cyan-400/5 before:via-purple-400/10 before:to-lime-400/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 transition-all duration-300 hover:translate-y-[-2px]">
    <div className="relative z-10">
      <div className="flex flex-col space-y-1.5 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-400/20 rounded-lg border border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Star className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold leading-none tracking-tight text-white">Premium Features</h3>
            <p className="text-sm text-purple-100">Unlock advanced tools</p>
          </div>
        </div>
      </div>
      <div className="pb-4">
        <p className="text-gray-300 text-sm mb-4">
          Access exclusive features and priority support with our premium plan.
        </p>
        <button className="w-full py-3 px-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-lime-400 text-black rounded-lg font-bold hover:from-cyan-300 hover:via-purple-300 hover:to-lime-300 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transform hover:scale-105">
          ✨ Upgrade Now
        </button>
      </div>
    </div>
  </div>
</div>`}
        />

        {/* Pricing Cards */}
        <ComponentSection
          title="Pricing Cards"
          description="Beautiful pricing cards with features and call-to-action"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
              {/* Starter Pricing Card - Neon Purple */}
              <div className="relative rounded-lg border-2 border-purple-400/50 bg-slate-950/90 backdrop-blur-sm p-6 shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:border-purple-400 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-purple-400/10 before:via-transparent before:to-purple-400/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 transition-all duration-300 hover:translate-y-[-4px]">
                <div className="relative z-10">
                  <div className="flex flex-col space-y-1.5 pb-4">
                    <h3 className="text-2xl font-semibold leading-none tracking-tight text-white">Starter</h3>
                    <p className="text-sm text-purple-100">Perfect for individuals and small projects</p>
                  </div>
                  <div className="pb-4">
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-4xl font-bold text-purple-400">$9</span>
                      <span className="text-gray-300">/ month</span>
                    </div>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-gray-300">Up to 5 projects</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-gray-300">10GB storage</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-gray-300">Email support</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-gray-300">Basic analytics</span>
                      </li>
                    </ul>
                    <button className="w-full py-2 px-4 bg-purple-400 text-black rounded-lg font-medium hover:bg-purple-300 transition-colors shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]" onClick={() => alert('Starter plan selected!')}>
                      Get Started
                    </button>
                  </div>
                </div>
              </div>

              {/* Pro Pricing Card (Popular) - Enhanced Neon Cyan */}
              <div className="relative rounded-lg border-2 border-cyan-400/50 bg-slate-950/90 backdrop-blur-sm p-6 shadow-[0_0_25px_rgba(34,211,238,0.2)] hover:border-cyan-400 hover:shadow-[0_0_40px_rgba(34,211,238,0.4)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-cyan-400/15 before:via-transparent before:to-cyan-400/8 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 transition-all duration-300 hover:translate-y-[-4px] scale-105">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-cyan-400 to-purple-400 text-black px-4 py-2 rounded-full text-sm font-bold shadow-[0_0_20px_rgba(34,211,238,0.5)]">
                    🔥 Most Popular
                  </span>
                </div>
                <div className="relative z-10">
                  <div className="flex flex-col space-y-1.5 pb-4 mt-2">
                    <h3 className="text-2xl font-semibold leading-none tracking-tight text-white">Pro</h3>
                    <p className="text-sm text-cyan-100">Ideal for growing teams and businesses</p>
                  </div>
                  <div className="pb-4">
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-4xl font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">$29</span>
                      <span className="text-gray-300">/ month</span>
                    </div>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm text-gray-300">Unlimited projects</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm text-gray-300">100GB storage</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm text-gray-300">Priority support</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm text-gray-300">Advanced analytics</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm text-gray-300">Custom integrations</span>
                      </li>
                    </ul>
                    <button className="w-full py-2 px-4 bg-gradient-to-r from-cyan-400 to-purple-400 text-black rounded-lg font-bold hover:from-cyan-300 hover:to-purple-300 transition-all shadow-[0_0_25px_rgba(34,211,238,0.4)] hover:shadow-[0_0_35px_rgba(34,211,238,0.6)] transform hover:scale-105" onClick={() => alert('Pro plan selected!')}>
                      Get Started
                    </button>
                  </div>
                </div>
              </div>

              {/* Enterprise Pricing Card - Neon Lime */}
              <div className="relative rounded-lg border-2 border-lime-400/50 bg-slate-950/90 backdrop-blur-sm p-6 shadow-[0_0_20px_rgba(163,230,53,0.15)] hover:border-lime-400 hover:shadow-[0_0_30px_rgba(163,230,53,0.3)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-lime-400/10 before:via-transparent before:to-lime-400/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 transition-all duration-300 hover:translate-y-[-4px]">
                <div className="relative z-10">
                  <div className="flex flex-col space-y-1.5 pb-4">
                    <h3 className="text-2xl font-semibold leading-none tracking-tight text-white">Enterprise</h3>
                    <p className="text-sm text-lime-100">For large organizations with custom needs</p>
                  </div>
                  <div className="pb-4">
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-4xl font-bold text-lime-400">$99</span>
                      <span className="text-gray-300">/ month</span>
                    </div>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-lime-400" />
                        <span className="text-sm text-gray-300">Everything in Pro</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-lime-400" />
                        <span className="text-sm text-gray-300">Unlimited storage</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-lime-400" />
                        <span className="text-sm text-gray-300">24/7 phone support</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-lime-400" />
                        <span className="text-sm text-gray-300">Custom development</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-lime-400" />
                        <span className="text-sm text-gray-300">SLA guarantee</span>
                      </li>
                    </ul>
                    <button className="w-full py-2 px-4 bg-lime-400 text-black rounded-lg font-medium hover:bg-lime-300 transition-colors shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:shadow-[0_0_30px_rgba(163,230,53,0.5)]" onClick={() => alert('Enterprise plan selected!')}>
                      Contact Sales
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }
          code={`<div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
  {/* Starter Pricing Card - Neon Purple */}
  <div className="relative rounded-lg border-2 border-purple-400/50 bg-slate-950/90 backdrop-blur-sm p-6 shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:border-purple-400 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-purple-400/10 before:via-transparent before:to-purple-400/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 transition-all duration-300 hover:translate-y-[-4px]">
    <div className="relative z-10">
      <div className="flex flex-col space-y-1.5 pb-4">
        <h3 className="text-2xl font-semibold leading-none tracking-tight text-white">Starter</h3>
        <p className="text-sm text-purple-100">Perfect for individuals and small projects</p>
      </div>
      <div className="pb-4">
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-4xl font-bold text-purple-400">$9</span>
          <span className="text-gray-300">/ month</span>
        </div>
        <ul className="space-y-2 mb-6">
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-300">Up to 5 projects</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-300">10GB storage</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-300">Email support</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-300">Basic analytics</span>
          </li>
        </ul>
        <button className="w-full py-2 px-4 bg-purple-400 text-black rounded-lg font-medium hover:bg-purple-300 transition-colors shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]" onClick={() => alert('Starter plan selected!')}>
          Get Started
        </button>
      </div>
    </div>
  </div>

  {/* Pro Pricing Card (Popular) - Enhanced Neon Cyan */}
  <div className="relative rounded-lg border-2 border-cyan-400/50 bg-slate-950/90 backdrop-blur-sm p-6 shadow-[0_0_25px_rgba(34,211,238,0.2)] hover:border-cyan-400 hover:shadow-[0_0_40px_rgba(34,211,238,0.4)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-cyan-400/15 before:via-transparent before:to-cyan-400/8 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 transition-all duration-300 hover:translate-y-[-4px] scale-105">
    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
      <span className="bg-gradient-to-r from-cyan-400 to-purple-400 text-black px-4 py-2 rounded-full text-sm font-bold shadow-[0_0_20px_rgba(34,211,238,0.5)]">
        🔥 Most Popular
      </span>
    </div>
    <div className="relative z-10">
      <div className="flex flex-col space-y-1.5 pb-4 mt-2">
        <h3 className="text-2xl font-semibold leading-none tracking-tight text-white">Pro</h3>
        <p className="text-sm text-cyan-100">Ideal for growing teams and businesses</p>
      </div>
      <div className="pb-4">
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-4xl font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">$29</span>
          <span className="text-gray-300">/ month</span>
        </div>
        <ul className="space-y-2 mb-6">
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-gray-300">Unlimited projects</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-gray-300">100GB storage</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-gray-300">Priority support</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-gray-300">Advanced analytics</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-gray-300">Custom integrations</span>
          </li>
        </ul>
        <button className="w-full py-2 px-4 bg-gradient-to-r from-cyan-400 to-purple-400 text-black rounded-lg font-bold hover:from-cyan-300 hover:to-purple-300 transition-all shadow-[0_0_25px_rgba(34,211,238,0.4)] hover:shadow-[0_0_35px_rgba(34,211,238,0.6)] transform hover:scale-105" onClick={() => alert('Pro plan selected!')}>
          Get Started
        </button>
      </div>
    </div>
  </div>

  {/* Enterprise Pricing Card - Neon Lime */}
  <div className="relative rounded-lg border-2 border-lime-400/50 bg-slate-950/90 backdrop-blur-sm p-6 shadow-[0_0_20px_rgba(163,230,53,0.15)] hover:border-lime-400 hover:shadow-[0_0_30px_rgba(163,230,53,0.3)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-lime-400/10 before:via-transparent before:to-lime-400/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 transition-all duration-300 hover:translate-y-[-4px]">
    <div className="relative z-10">
      <div className="flex flex-col space-y-1.5 pb-4">
        <h3 className="text-2xl font-semibold leading-none tracking-tight text-white">Enterprise</h3>
        <p className="text-sm text-lime-100">For large organizations with custom needs</p>
      </div>
      <div className="pb-4">
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-4xl font-bold text-lime-400">$99</span>
          <span className="text-gray-300">/ month</span>
        </div>
        <ul className="space-y-2 mb-6">
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-lime-400" />
            <span className="text-sm text-gray-300">Everything in Pro</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-lime-400" />
            <span className="text-sm text-gray-300">Unlimited storage</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-lime-400" />
            <span className="text-sm text-gray-300">24/7 phone support</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-lime-400" />
            <span className="text-sm text-gray-300">Custom development</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-lime-400" />
            <span className="text-sm text-gray-300">SLA guarantee</span>
          </li>
        </ul>
        <button className="w-full py-2 px-4 bg-lime-400 text-black rounded-lg font-medium hover:bg-lime-300 transition-colors shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:shadow-[0_0_30px_rgba(163,230,53,0.5)]" onClick={() => alert('Enterprise plan selected!')}>
          Contact Sales
        </button>
      </div>
    </div>
  </div>
</div>`}
        />

        {/* Profile Cards */}
        <ComponentSection
          title="Profile Cards"
          description="User profile cards with avatar, stats, and actions"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
              {/* Sarah Chen Profile Card - Neon Cyan */}
              <div className="relative rounded-lg border-2 border-cyan-400/50 bg-slate-950/90 backdrop-blur-sm p-6 shadow-[0_0_20px_rgba(34,211,238,0.15)] hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-cyan-400/10 before:via-transparent before:to-cyan-400/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 transition-all duration-300 hover:translate-y-[-4px]">
                <div className="relative z-10">
                  <div className="flex flex-col space-y-1.5 pb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                        <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-purple-400 flex items-center justify-center text-white font-bold text-lg">
                          SC
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold leading-none tracking-tight text-white">Sarah Chen</h3>
                        <p className="text-sm text-cyan-100">Senior Developer</p>
                      </div>
                    </div>
                  </div>
                  <div className="pb-4">
                    <p className="text-sm text-gray-300 mb-4">
                      Full-stack developer with 8+ years of experience building scalable web applications and leading development teams.
                    </p>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-2 rounded-lg bg-cyan-400/10 border border-cyan-400/20">
                        <div className="text-2xl font-bold text-cyan-400">127</div>
                        <div className="text-xs text-cyan-200">Projects</div>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-cyan-400/10 border border-cyan-400/20">
                        <div className="text-2xl font-bold text-cyan-400">2.3k</div>
                        <div className="text-xs text-cyan-200">Commits</div>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-cyan-400/10 border border-cyan-400/20">
                        <div className="text-2xl font-bold text-cyan-400">456</div>
                        <div className="text-xs text-cyan-200">Reviews</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 px-4 bg-cyan-400/20 text-cyan-400 rounded-lg font-medium hover:bg-cyan-400/30 transition-colors flex items-center justify-center gap-2 border border-cyan-400/50 shadow-[0_0_10px_rgba(34,211,238,0.2)] hover:shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                        <Mail className="w-4 h-4" />
                        Message
                      </button>
                      <button className="flex-1 py-2 px-4 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition-colors border border-slate-600">
                        Follow
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alex Rodriguez Profile Card - Neon Lime */}
              <div className="relative rounded-lg border-2 border-lime-400/50 bg-slate-950/90 backdrop-blur-sm p-6 shadow-[0_0_20px_rgba(163,230,53,0.15)] hover:border-lime-400 hover:shadow-[0_0_30px_rgba(163,230,53,0.3)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-lime-400/10 before:via-transparent before:to-lime-400/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 transition-all duration-300 hover:translate-y-[-4px]">
                <div className="relative z-10">
                  <div className="flex flex-col space-y-1.5 pb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-lime-400/50 shadow-[0_0_20px_rgba(163,230,53,0.3)]">
                        <div className="w-full h-full bg-gradient-to-br from-lime-400 to-orange-400 flex items-center justify-center text-black font-bold text-lg">
                          AR
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold leading-none tracking-tight text-white">Alex Rodriguez</h3>
                        <p className="text-sm text-lime-100">Product Designer</p>
                      </div>
                    </div>
                  </div>
                  <div className="pb-4">
                    <p className="text-sm text-gray-300 mb-4">
                      Creative designer passionate about user experience and building beautiful, functional interfaces that users love.
                    </p>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-2 rounded-lg bg-lime-400/10 border border-lime-400/20">
                        <div className="text-2xl font-bold text-lime-400">89</div>
                        <div className="text-xs text-lime-200">Designs</div>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-lime-400/10 border border-lime-400/20">
                        <div className="text-2xl font-bold text-lime-400">1.8k</div>
                        <div className="text-xs text-lime-200">Likes</div>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-lime-400/10 border border-lime-400/20">
                        <div className="text-2xl font-bold text-lime-400">342</div>
                        <div className="text-xs text-lime-200">Followers</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 px-4 bg-lime-400/20 text-lime-400 rounded-lg font-medium hover:bg-lime-400/30 transition-colors flex items-center justify-center gap-2 border border-lime-400/50 shadow-[0_0_10px_rgba(163,230,53,0.2)] hover:shadow-[0_0_15px_rgba(163,230,53,0.4)]">
                        <Globe className="w-4 h-4" />
                        Portfolio
                      </button>
                      <button className="flex-1 py-2 px-4 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition-colors border border-slate-600">
                        Connect
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
          code={`{/* Sarah Chen Profile Card - Neon Cyan */}
<div className="relative rounded-lg border-2 border-cyan-400/50 bg-slate-950/90 backdrop-blur-sm p-6 shadow-[0_0_20px_rgba(34,211,238,0.15)] hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-cyan-400/10 before:via-transparent before:to-cyan-400/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 transition-all duration-300 hover:translate-y-[-4px]">
  <div className="relative z-10">
    <div className="flex flex-col space-y-1.5 pb-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
          <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-purple-400 flex items-center justify-center text-white font-bold text-lg">
            SC
          </div>
        </div>
        <div>
          <h3 className="text-xl font-semibold leading-none tracking-tight text-white">Sarah Chen</h3>
          <p className="text-sm text-cyan-100">Senior Developer</p>
        </div>
      </div>
    </div>
    <div className="pb-4">
      <p className="text-sm text-gray-300 mb-4">
        Full-stack developer with 8+ years of experience building scalable web applications and leading development teams.
      </p>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-2 rounded-lg bg-cyan-400/10 border border-cyan-400/20">
          <div className="text-2xl font-bold text-cyan-400">127</div>
          <div className="text-xs text-cyan-200">Projects</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-cyan-400/10 border border-cyan-400/20">
          <div className="text-2xl font-bold text-cyan-400">2.3k</div>
          <div className="text-xs text-cyan-200">Commits</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-cyan-400/10 border border-cyan-400/20">
          <div className="text-2xl font-bold text-cyan-400">456</div>
          <div className="text-xs text-cyan-200">Reviews</div>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="flex-1 py-2 px-4 bg-cyan-400/20 text-cyan-400 rounded-lg font-medium hover:bg-cyan-400/30 transition-colors flex items-center justify-center gap-2 border border-cyan-400/50 shadow-[0_0_10px_rgba(34,211,238,0.2)] hover:shadow-[0_0_15px_rgba(34,211,238,0.4)]">
          <Mail className="w-4 h-4" />
          Message
        </button>
        <button className="flex-1 py-2 px-4 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition-colors border border-slate-600">
          Follow
        </button>
      </div>
    </div>
  </div>
</div>`}
        />

        {/* Social Media Cards */}
        <ComponentSection
          title="Social Media Cards"
          description="Social post cards with engagement elements"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
              {/* Neon Blue Social Card */}
              <div className="relative rounded-lg border-2 border-cyan-400/50 bg-slate-950/90 backdrop-blur-sm p-6 shadow-[0_0_20px_rgba(34,211,238,0.15)] hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-cyan-400/10 before:via-transparent before:to-cyan-400/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 transition-all duration-300 hover:translate-y-[-4px]">
                <div className="relative z-10">
                  <div className="flex flex-col space-y-1.5 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                        JD
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">John Doe</h4>
                        <p className="text-sm text-cyan-100">@johndoe • 2h</p>
                      </div>
                    </div>
                  </div>
                  <div className="pb-4">
                    <p className="text-gray-300 mb-4">
                      Just shipped a new feature using NeonKit! The components are incredibly easy to customize and the neon effects look amazing ✨
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <button className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition-colors">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">24</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition-colors">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm">5</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition-colors">
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm">Share</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Gradient Featured Card */}
              <div className="relative rounded-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 border border-slate-700 shadow-lg hover:shadow-xl before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-cyan-400/5 before:via-purple-400/5 before:to-lime-400/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 transition-all duration-300 hover:translate-y-[-2px]">
                <div className="relative z-10">
                  <div className="flex flex-col space-y-1.5 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-lime-400/20 rounded-full flex items-center justify-center">
                          <Star className="w-5 h-5 text-lime-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">Featured Post</h4>
                          <p className="text-sm text-white/70">Community Highlight</p>
                        </div>
                      </div>
                      <div className="text-xs bg-lime-400 text-black px-2 py-1 rounded-full font-medium">
                        NEW
                      </div>
                    </div>
                  </div>
                  <div className="pb-4">
                    <p className="text-white/90 mb-4">
                      Discover the most innovative projects built with NeonKit this month. From dashboards to landing pages, see what the community is creating.
                    </p>
                  </div>
                  <div>
                    <button className="w-full py-2 px-4 bg-gradient-to-r from-lime-400 to-cyan-400 text-black rounded-lg font-medium hover:scale-105 transition-transform">
                      View Gallery
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }
          code={`{/* Neon Blue Social Card */}
<div className="relative rounded-lg border-2 border-cyan-400/50 bg-slate-950/90 backdrop-blur-sm p-6 shadow-[0_0_20px_rgba(34,211,238,0.15)] hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-cyan-400/10 before:via-transparent before:to-cyan-400/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 transition-all duration-300 hover:translate-y-[-4px]">
  <div className="relative z-10">
    <div className="flex flex-col space-y-1.5 pb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
          JD
        </div>
        <div>
          <h4 className="font-semibold text-white">John Doe</h4>
          <p className="text-sm text-cyan-100">@johndoe • 2h</p>
        </div>
      </div>
    </div>
    <div className="pb-4">
      <p className="text-gray-300 mb-4">
        Just shipped a new feature using NeonKit! The components are incredibly easy to customize and the neon effects look amazing ✨
      </p>
      <div className="flex items-center gap-2 text-sm text-cyan-200">
        <Tag className="w-4 h-4" />
        <span>#neonkit #react #ui</span>
      </div>
    </div>
    <div className="flex items-center gap-6">
      <button className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition-colors">
        <Heart className="w-4 h-4" />
        <span className="text-sm">24</span>
      </button>
      <button className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition-colors">
        <MessageSquare className="w-4 h-4" />
        <span className="text-sm">5</span>
      </button>
      <button className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition-colors">
        <Share2 className="w-4 h-4" />
        <span className="text-sm">Share</span>
      </button>
    </div>
  </div>
</div>`}
        />

        {/* Installation Section */}
        <div className="border rounded-lg p-6 bg-gradient-to-r from-cyan-400/5 to-purple-400/5">
          <h2 className="text-2xl font-bold mb-4">Installation</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-muted-foreground mb-3">
                Copy and paste the card code directly. These components use pure JSX/CSS - no additional dependencies required!
              </p>
              <div className="bg-muted rounded-lg p-3 font-mono text-sm">
                <code>// Pure JSX/CSS components - just copy and paste!</code>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>Make sure you have the <code className="bg-muted px-1 py-0.5 rounded">cn</code> utility function. <a href="/setup" className="text-cyan-400 hover:underline">See complete installation guide</a>.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 