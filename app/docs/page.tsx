"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { Badge } from "@/components/badge";
import {
  Palette,
  Code2,
  Sparkles,
  Zap,
  Accessibility,
  Smartphone,
  Package,
  FileText,
  Layers,
  Type,
  Play,
  Shield,
} from "lucide-react";
import Link from "next/link";

export default function DocsPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          Documentation
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Complete guide to NeonKit's design system, components, and
          implementation patterns. Everything you need to build beautiful,
          accessible dark-mode applications.
        </p>
      </motion.div>

      {/* Quick Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-12"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="#design-system" className="group">
            <Card className="p-6 hover:border-neon-cyan/40 transition-all duration-300 group-hover:scale-105">
              <div className="flex items-center gap-3">
                <Palette className="h-6 w-6 text-neon-cyan" />
                <div>
                  <h3 className="font-semibold">Design System</h3>
                  <p className="text-sm text-muted-foreground">
                    Colors, typography, and motion
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="#components" className="group">
            <Card className="p-6 hover:border-neon-purple/40 transition-all duration-300 group-hover:scale-105">
              <div className="flex items-center gap-3">
                <Layers className="h-6 w-6 text-neon-purple" />
                <div>
                  <h3 className="font-semibold">Components</h3>
                  <p className="text-sm text-muted-foreground">
                    20+ ready-to-use components
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="#implementation" className="group">
            <Card className="p-6 hover:border-neon-chartreuse/40 transition-all duration-300 group-hover:scale-105">
              <div className="flex items-center gap-3">
                <Code2 className="h-6 w-6 text-neon-chartreuse" />
                <div>
                  <h3 className="font-semibold">Implementation</h3>
                  <p className="text-sm text-muted-foreground">
                    Setup and usage patterns
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </motion.div>

      {/* Design System Section */}
      <motion.section
        id="design-system"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-16"
      >
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Design System</h2>
          <p className="text-lg text-muted-foreground">
            NeonKit is built around a cohesive design system optimized for dark
            mode with strategic neon accents.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Color System */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Color System</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Base Palette</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-slate-950 rounded border"></div>
                    <span>slate-950 (Background)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-slate-900 rounded border"></div>
                    <span>slate-900 (Surface)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-slate-800 rounded border"></div>
                    <span>slate-800 (Borders)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-slate-100 rounded border"></div>
                    <span>slate-100 (Text)</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Neon Accents</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.6)]"></div>
                    <span>neon-cyan (#22d3ee)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-400 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.6)]"></div>
                    <span>neon-purple (#a855f7)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-lime-400 rounded-full shadow-[0_0_8px_rgba(163,230,53,0.6)]"></div>
                    <span>neon-chartreuse (#a3e635)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-pink-400 rounded-full shadow-[0_0_8px_rgba(244,114,182,0.6)]"></div>
                    <span>neon-pink (#f472b6)</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Typography & Motion */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Typography & Motion</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Typography</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Font: Inter (system font)</li>
                  <li>• Scale: text-xs to text-6xl</li>
                  <li>• Weights: 400, 500, 600, 700</li>
                  <li>• Generous whitespace for clarity</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Motion</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Framework: Framer Motion</li>
                  <li>• Standard: duration-300</li>
                  <li>• Hover: scale transforms</li>
                  <li>• Accessibility: reduced motion support</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </motion.section>

      {/* Components Section */}
      <motion.section
        id="components"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-16"
      >
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Component Library</h2>
          <p className="text-lg text-muted-foreground">
            NeonKit provides 20+ components, each with 8 neon variants and
            comprehensive customization options.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Form Components */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-3">Form Components</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Button</span>
                <Badge variant="neon-cyan" size="sm">
                  8 variants
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Input</span>
                <Badge variant="neon-purple" size="sm">
                  8 variants
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Textarea</span>
                <Badge variant="neon-chartreuse" size="sm">
                  8 variants
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Checkbox</span>
                <Badge variant="neon-pink" size="sm">
                  8 variants
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Radio</span>
                <Badge variant="neon-success" size="sm">
                  8 variants
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Switch</span>
                <Badge variant="neon-warning" size="sm">
                  8 variants
                </Badge>
              </div>
            </div>
          </Card>

          {/* Display Components */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-3">Display Components</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Card</span>
                <Badge variant="neon-cyan" size="sm">
                  Multiple
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Alert</span>
                <Badge variant="neon-purple" size="sm">
                  8 variants
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Badge</span>
                <Badge variant="neon-chartreuse" size="sm">
                  8 variants
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Avatar</span>
                <Badge variant="neon-pink" size="sm">
                  8 variants
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Modal</span>
                <Badge variant="neon-success" size="sm">
                  8 variants
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Tooltip</span>
                <Badge variant="neon-warning" size="sm">
                  8 variants
                </Badge>
              </div>
            </div>
          </Card>

          {/* Interactive Components */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-3">
              Interactive Components
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Dropdown</span>
                <Badge variant="neon-cyan" size="sm">
                  8 variants
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Slider</span>
                <Badge variant="neon-purple" size="sm">
                  8 variants
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Progress</span>
                <Badge variant="neon-chartreuse" size="sm">
                  8 variants
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Skeleton</span>
                <Badge variant="neon-pink" size="sm">
                  Loading
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Toast</span>
                <Badge variant="neon-success" size="sm">
                  8 variants
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>File Upload</span>
                <Badge variant="neon-warning" size="sm">
                  8 variants
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Component Features */}
        <div className="mt-8">
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Neon Variants</h3>
                <p className="text-sm text-muted-foreground">
                  Every component comes with 8 stunning neon variants for
                  consistent theming
                </p>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">
                  Responsive Design
                </h3>
                <p className="text-sm text-muted-foreground">
                  Built with Tailwind's responsive utilities for all screen
                  sizes
                </p>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Accessibility</h3>
                <p className="text-sm text-muted-foreground">
                  WCAG AA compliant with proper ARIA labels and keyboard
                  navigation
                </p>
              </div>
            </div>
          </Card>
        </div>
      </motion.section>

      {/* Implementation Section */}
      <motion.section
        id="implementation"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-16"
      >
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Implementation</h2>
          <p className="text-lg text-muted-foreground">
            Get started with NeonKit in minutes. Copy-paste workflow with no
            build step required.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Installation */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Installation</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">1. Install Dependencies</h4>
                <div className="bg-muted rounded-lg p-3 text-sm font-mono">
                  npm install framer-motion clsx tailwind-merge lucide-react
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">2. Add Utils Function</h4>
                <div className="bg-muted rounded-lg p-3 text-sm font-mono">
                  <div>// lib/utils.ts</div>
                  <div>export function cn(...inputs: ClassValue[]) {"{"}</div>
                  <div> return twMerge(clsx(inputs))</div>
                  <div>{"}"}</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">3. Copy Components</h4>
                <p className="text-sm text-muted-foreground">
                  Browse our component gallery and copy-paste the code you need
                </p>
              </div>
            </div>
          </Card>

          {/* Usage Patterns */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Usage Patterns</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Basic Component</h4>
                <div className="bg-muted rounded-lg p-3 text-sm font-mono">
                  <div>{'<Button variant="neon-cyan">'}</div>
                  <div> Click me</div>
                  <div>{"</Button>"}</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">With Props</h4>
                <div className="bg-muted rounded-lg p-3 text-sm font-mono">
                  <div>{"<Input"}</div>
                  <div> variant="neon-purple"</div>
                  <div> size="lg"</div>
                  <div> placeholder="Enter text..."</div>
                  <div>{"/>"}</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Custom Styling</h4>
                <div className="bg-muted rounded-lg p-3 text-sm font-mono">
                  <div>{'<Card className="custom-class">'}</div>
                  <div> Content</div>
                  <div>{"</Card>"}</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Key Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3">Key Features</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Dark mode optimized design</li>
              <li>• 8 neon color variants per component</li>
              <li>• Framer Motion animations</li>
              <li>• TypeScript support</li>
              <li>• Tailwind CSS utilities</li>
              <li>• Accessibility-first approach</li>
              <li>• Responsive design</li>
              <li>• Copy-paste workflow</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3">Technical Specs</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• React 18+ compatible</li>
              <li>• TypeScript 5.0+</li>
              <li>• Tailwind CSS 3.0+</li>
              <li>• Framer Motion 10+</li>
              <li>• WCAG AA compliant</li>
              <li>• Tree-shakeable exports</li>
              <li>• SSR/SSG ready</li>
              <li>• Zero runtime overhead</li>
            </ul>
          </Card>
        </div>
      </motion.section>
    </div>
  );
}
