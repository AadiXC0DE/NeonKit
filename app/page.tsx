"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/button"
import { BackgroundGradient } from "@/components/background-gradient"
import { ArrowRight, Github, Zap, Palette, Code2, Sparkles } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <BackgroundGradient />
      {/* Navigation */}
      <nav className="border-b backdrop-blur-md bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-neon-blue to-neon-purple rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">NeonKit</span>
              </motion.div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/setup" className="text-sm font-medium hover:text-neon-cyan transition-colors">
                Installation
              </Link>
              <Link href="/docs" className="text-sm font-medium hover:text-neon-blue transition-colors">
                Documentation
              </Link>
              <Link href="/components" className="text-sm font-medium hover:text-neon-purple transition-colors">
                Components
              </Link>
              <Button variant="ghost" size="icon" asChild>
                <a href="https://github.com/neonkit/neonkit" target="_blank" rel="noopener noreferrer">
                  <Github className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Build with{" "}
              <span className="bg-gradient-to-r from-neon-blue via-neon-purple to-neon-chartreuse bg-clip-text text-transparent animate-glow">
                NeonKit
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Copy and paste beautiful JSX components with electric neon accents. 
              Dark mode optimized, Tailwind-powered, ready to use.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="xl" variant="neon-cyan" asChild>
                <Link href="/setup">
                  Copy Components <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button size="xl" variant="outline" asChild>
                <Link href="/components">
                  Browse Library
                </Link>
              </Button>
            </div>

            {/* Component Preview */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-card border rounded-lg p-8 max-w-3xl mx-auto backdrop-blur-sm"
            >
              <div className="flex flex-wrap gap-4 justify-center mb-6">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button variant="neon-cyan">Neon Cyan</Button>
                <Button variant="neon-purple">Neon Purple</Button>
                <Button variant="neon-chartreuse">Neon Chartreuse</Button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose NeonKit?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Designed for developers who want clean, accessible, and beautifully animated components.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Palette className="h-8 w-8 text-neon-blue" />,
                title: "Copy & Paste Ready",
                description: "Complete JSX with Tailwind classes. No setup, no installation, just copy and use."
              },
              {
                icon: <Code2 className="h-8 w-8 text-neon-purple" />,
                title: "Dark Mode Optimized",
                description: "7 neon variants designed exclusively for dark themes where electric effects shine."
              },
              {
                icon: <Sparkles className="h-8 w-8 text-neon-chartreuse" />,
                title: "Smooth Animations",
                description: "Framer Motion powered with accessibility-first design and reduced motion support."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card border rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="mb-4 flex justify-center">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-br from-neon-blue to-neon-purple rounded flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">NeonKit</span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Built with ❤️ for the future of web development
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 