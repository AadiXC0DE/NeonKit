"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

// ============================
// NEON CARD VARIANTS
// ============================

// Neon Blue Card
export function NeonBlueCard({ 
  children, 
  className, 
  animated = true,
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & { animated?: boolean }) {
  const animationClass = animated ? "transition-all duration-300 hover:translate-y-[-4px]" : ""
  
  return (
    <div
      className={cn(
        "relative rounded-lg border-2 border-cyan-400/50 bg-slate-950/90 backdrop-blur-sm p-6",
        "shadow-[0_0_20px_rgba(34,211,238,0.15)]",
        "hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.3)]",
        "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-cyan-400/10 before:via-transparent before:to-cyan-400/5",
        "before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
        animationClass,
        className
      )}
      {...props}
    >
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

// Neon Purple Card
export function NeonPurpleCard({ 
  children, 
  className, 
  animated = true,
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & { animated?: boolean }) {
  const animationClass = animated ? "transition-all duration-300 hover:translate-y-[-4px]" : ""
  
  return (
    <div
      className={cn(
        "relative rounded-lg border-2 border-purple-400/50 bg-slate-950/90 backdrop-blur-sm p-6",
        "shadow-[0_0_20px_rgba(168,85,247,0.15)]",
        "hover:border-purple-400 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]",
        "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-purple-400/10 before:via-transparent before:to-purple-400/5",
        "before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
        animationClass,
        className
      )}
      {...props}
    >
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

// Neon Chartreuse Card
export function NeonChartreuseCard({ 
  children, 
  className, 
  animated = true,
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & { animated?: boolean }) {
  const animationClass = animated ? "transition-all duration-300 hover:translate-y-[-4px]" : ""
  
  return (
    <div
      className={cn(
        "relative rounded-lg border-2 border-lime-400/50 bg-slate-950/90 backdrop-blur-sm p-6",
        "shadow-[0_0_20px_rgba(163,230,53,0.15)]",
        "hover:border-lime-400 hover:shadow-[0_0_30px_rgba(163,230,53,0.3)]",
        "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-lime-400/10 before:via-transparent before:to-lime-400/5",
        "before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
        animationClass,
        className
      )}
      {...props}
    >
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

// Custom Neon Card
export function CustomNeonCard({ 
  children, 
  className, 
  animated = true,
  color = "#00FFC3",
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & { 
  animated?: boolean
  color?: string 
}) {
  const animationClass = animated ? "transition-all duration-300 hover:translate-y-[-4px]" : ""
  
  return (
    <div
      className={cn(
        "relative rounded-lg border-2 bg-slate-950/90 backdrop-blur-sm p-6",
        animationClass,
        className
      )}
      style={{
        borderColor: `${color}80`,
        boxShadow: `0 0 20px ${color}25`,
        '--custom-color': color,
      } as React.CSSProperties}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = color
        e.currentTarget.style.boxShadow = `0 0 30px ${color}50`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = `${color}80`
        e.currentTarget.style.boxShadow = `0 0 20px ${color}25`
      }}
      {...props}
    >
      <div 
        className="absolute inset-0 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${color}10, transparent, ${color}05)`
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

// Glass Card
export function GlassCard({ 
  children, 
  className, 
  animated = true,
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & { animated?: boolean }) {
  const animationClass = animated ? "transition-all duration-300 hover:translate-y-[-2px]" : ""
  
  return (
    <div
      className={cn(
        "relative rounded-lg backdrop-blur-lg bg-white/10 dark:bg-black/20 p-6",
        "border border-white/20 dark:border-white/10",
        "shadow-xl hover:shadow-2xl",
        animationClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Gradient Card
export function GradientCard({ 
  children, 
  className, 
  animated = true,
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & { animated?: boolean }) {
  const animationClass = animated ? "transition-all duration-300 hover:translate-y-[-2px]" : ""
  
  return (
    <div
      className={cn(
        "relative rounded-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6",
        "border border-slate-700 shadow-lg hover:shadow-xl",
        "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br",
        "before:from-cyan-400/5 before:via-purple-400/5 before:to-lime-400/5",
        "before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
        animationClass,
        className
      )}
      {...props}
    >
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

// Interactive Card (for click actions)
export function InteractiveCard({ 
  children, 
  className, 
  onClick,
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative rounded-lg border bg-card text-card-foreground p-6",
        "cursor-pointer transition-all duration-200",
        "hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]",
        "focus:outline-none focus:ring-2 focus:ring-cyan-400/50",
        className
      )}
      onClick={onClick}
      tabIndex={0}
      {...props}
    >
      {children}
    </div>
  )
}

// ============================
// CARD PARTS
// ============================

export function CardHeader({ 
  children, 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 pb-4", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardTitle({ 
  children, 
  className, 
  gradient = false,
  ...props 
}: React.HTMLAttributes<HTMLHeadingElement> & { gradient?: boolean }) {
  return (
    <h3
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        gradient && "bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
}

export function CardDescription({ 
  children, 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  )
}

export function CardContent({ 
  children, 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn("pb-4", className)} 
      {...props}
    >
      {children}
    </div>
  )
}

export function CardFooter({ 
  children, 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center pt-4", className)}
      {...props}
    >
      {children}
    </div>
  )
}

// ============================
// LEGACY CARD (for backward compatibility)
// ============================

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outline" | "ghost" | "neon" | "glass" | "gradient" | "interactive"
  size?: "sm" | "default" | "lg" | "xl"
  animated?: boolean
  glowOnHover?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant = "default", 
    size = "default", 
    animated = true,
    glowOnHover = false,
    children, 
    ...props 
  }, ref) => {
    
    const baseClasses = "rounded-lg border bg-card text-card-foreground transition-all duration-300 relative overflow-hidden"
    
    const variants = {
      default: "shadow-sm hover:shadow-md",
      elevated: "shadow-md hover:shadow-lg",
      outline: "border-2 border-border",
      ghost: "border-transparent bg-transparent hover:bg-card/50",
      neon: "border-2 border-cyan-400/50 bg-slate-950/80 font-medium backdrop-blur-sm hover:border-cyan-400 hover:shadow-[0_0_25px_rgb(34,211,238,0.3)] before:absolute before:inset-0 before:bg-gradient-to-br before:from-cyan-400/5 before:via-transparent before:to-cyan-400/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
      glass: "backdrop-blur-md bg-white/10 border border-white/20 dark:bg-black/10 dark:border-white/10 shadow-xl",
      gradient: "bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-lg hover:shadow-xl",
      interactive: "cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200 hover:shadow-xl"
    }
    
    const sizes = {
      sm: "p-4",
      default: "p-6", 
      lg: "p-8",
      xl: "p-10"
    }

    const animationClass = animated && variant !== "interactive" ? "hover:translate-y-[-2px]" : ""

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          glowOnHover && "hover:shadow-[0_0_30px_rgb(34,211,238,0.25)]",
          animationClass,
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Card.displayName = "Card"

export { Card } 