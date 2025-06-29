"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/button"
import { cn } from "@/lib/utils"
import { 
  Package, 
  Copy, 
  Check, 
  Terminal,
  Zap,
  Code
} from "lucide-react"

function CodeBlock({ code, className }: { code: string; className?: string }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn("relative", className)}>
      <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm border">
        <code>{code}</code>
      </pre>
      <button
        onClick={copyToClipboard}
        className="absolute top-3 right-3 p-2 bg-background border rounded-md hover:bg-accent transition-colors"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  )
}

export default function SetupPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          Installation
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Copy and paste the most beautiful components. Made with React, TypeScript, and Tailwind CSS.
        </p>
      </motion.div>

      <div className="space-y-8">
        {/* Step 1: Install Dependencies */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="border rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#00FFC3]/10 border border-[#00FFC3]/30 flex items-center justify-center">
              <Package className="w-4 h-4 text-[#00FFC3]" />
            </div>
            <h2 className="text-xl font-semibold">Install dependencies</h2>
          </div>
          
          <p className="text-muted-foreground mb-4">
            Install the required packages to use NeonKit components. Most components use Framer Motion for animations.
          </p>
          
          <CodeBlock code="npm install framer-motion clsx tailwind-merge lucide-react" />
        </motion.section>

        {/* Step 2: Add utils function */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="border rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#D300FF]/10 border border-[#D300FF]/30 flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#D300FF]" />
            </div>
            <h2 className="text-xl font-semibold">Add utils function</h2>
          </div>
          
          <p className="text-muted-foreground mb-4">
            Add this utility function to <code className="bg-muted px-1 py-0.5 rounded">lib/utils.ts</code> (create the file if it doesn't exist).
          </p>
          
          <CodeBlock code={`import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`} />
        </motion.section>



        {/* Step 3: Start copying components */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="border rounded-lg p-6 bg-gradient-to-r from-[#00FFC3]/5 to-[#D300FF]/5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#00FFC3]/20 border border-[#00FFC3]/40 flex items-center justify-center">
              <Code className="w-4 h-4 text-[#00FFC3]" />
            </div>
            <h2 className="text-xl font-semibold">Start copying components</h2>
          </div>
          
          <p className="text-muted-foreground mb-6">
            Browse our component gallery, click on any component, switch to the "Code" tab, and copy-paste into your project.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button variant="neon-cyan" asChild>
              <a href="/components">🎛️ Buttons</a>
            </Button>
            <Button variant="neon-purple" asChild>
              <a href="/components/card">🃏 Cards</a>
            </Button>
            <Button variant="neon-chartreuse" asChild>
              <a href="/components/input">📝 Inputs</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/components/textarea">📄 Textarea</a>
            </Button>
          </div>
        </motion.section>

        {/* That's it! */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center py-8"
        >
          <h3 className="text-2xl font-bold mb-4">That's it! 🎉</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            You're ready to use NeonKit components. Just copy, paste, and customize as needed.
          </p>
        </motion.section>
      </div>
    </div>
  )
} 