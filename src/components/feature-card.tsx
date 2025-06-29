"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "./card"
import { Button } from "./button"
import type { NeonAccent } from "@/types/theme"
import { LucideIcon } from "lucide-react"

// ============================
// FEATURE CARDS
// ============================

// Neon Feature Card
export function NeonFeatureCard({ 
  children, 
  className, 
  icon,
  title,
  description,
  color = "cyan",
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & { 
  icon?: React.ReactNode
  title?: string
  description?: string
  color?: "cyan" | "purple" | "lime" | "orange" | "pink"
}) {
  const colorClasses = {
    cyan: {
      border: "border-cyan-400/50 hover:border-cyan-400",
      shadow: "shadow-[0_0_20px_rgba(34,211,238,0.15)] hover:shadow-[0_0_30px_rgba(34,211,238,0.3)]",
      gradient: "before:from-cyan-400/10 before:to-cyan-400/5",
      icon: "text-cyan-400"
    },
    purple: {
      border: "border-purple-400/50 hover:border-purple-400",
      shadow: "shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]",
      gradient: "before:from-purple-400/10 before:to-purple-400/5",
      icon: "text-purple-400"
    },
    lime: {
      border: "border-lime-400/50 hover:border-lime-400",
      shadow: "shadow-[0_0_20px_rgba(163,230,53,0.15)] hover:shadow-[0_0_30px_rgba(163,230,53,0.3)]",
      gradient: "before:from-lime-400/10 before:to-lime-400/5",
      icon: "text-lime-400"
    },
    orange: {
      border: "border-orange-400/50 hover:border-orange-400",
      shadow: "shadow-[0_0_20px_rgba(251,146,60,0.15)] hover:shadow-[0_0_30px_rgba(251,146,60,0.3)]",
      gradient: "before:from-orange-400/10 before:to-orange-400/5",
      icon: "text-orange-400"
    },
    pink: {
      border: "border-pink-400/50 hover:border-pink-400",
      shadow: "shadow-[0_0_20px_rgba(244,114,182,0.15)] hover:shadow-[0_0_30px_rgba(244,114,182,0.3)]",
      gradient: "before:from-pink-400/10 before:to-pink-400/5",
      icon: "text-pink-400"
    }
  }

  const colors = colorClasses[color]
  
  return (
    <div
      className={cn(
        "relative rounded-lg border-2 bg-slate-950/90 backdrop-blur-sm p-6",
        "transition-all duration-300 hover:translate-y-[-4px]",
        "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:via-transparent",
        "before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
        colors.border,
        colors.shadow,
        colors.gradient,
        className
      )}
      {...props}
    >
      <div className="relative z-10">
        {icon && (
          <div className={cn("w-12 h-12 mb-4 flex items-center justify-center", colors.icon)}>
            {icon}
          </div>
        )}
        {title && (
          <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
        )}
        {description && (
          <p className="text-gray-300 mb-4">{description}</p>
        )}
        {children}
      </div>
    </div>
  )
}

// Stats Card
export function StatsCard({ 
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
  className,
  color = "cyan",
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & { 
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  color?: "cyan" | "purple" | "lime" | "orange" | "pink"
}) {
  const colorClasses = {
    cyan: {
      border: "border-cyan-400/50 hover:border-cyan-400",
      shadow: "shadow-[0_0_20px_rgba(34,211,238,0.15)] hover:shadow-[0_0_30px_rgba(34,211,238,0.3)]",
      gradient: "before:from-cyan-400/10 before:to-cyan-400/5",
      icon: "text-cyan-400",
      value: "text-cyan-400"
    },
    purple: {
      border: "border-purple-400/50 hover:border-purple-400",
      shadow: "shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]",
      gradient: "before:from-purple-400/10 before:to-purple-400/5",
      icon: "text-purple-400",
      value: "text-purple-400"
    },
    lime: {
      border: "border-lime-400/50 hover:border-lime-400",
      shadow: "shadow-[0_0_20px_rgba(163,230,53,0.15)] hover:shadow-[0_0_30px_rgba(163,230,53,0.3)]",
      gradient: "before:from-lime-400/10 before:to-lime-400/5",
      icon: "text-lime-400",
      value: "text-lime-400"
    },
    orange: {
      border: "border-orange-400/50 hover:border-orange-400",
      shadow: "shadow-[0_0_20px_rgba(251,146,60,0.15)] hover:shadow-[0_0_30px_rgba(251,146,60,0.3)]",
      gradient: "before:from-orange-400/10 before:to-orange-400/5",
      icon: "text-orange-400",
      value: "text-orange-400"
    },
    pink: {
      border: "border-pink-400/50 hover:border-pink-400",
      shadow: "shadow-[0_0_20px_rgba(244,114,182,0.15)] hover:shadow-[0_0_30px_rgba(244,114,182,0.3)]",
      gradient: "before:from-pink-400/10 before:to-pink-400/5",
      icon: "text-pink-400",
      value: "text-pink-400"
    }
  }

  const colors = colorClasses[color]
  
  const trendColors = {
    up: "text-green-400",
    down: "text-red-400",
    neutral: "text-gray-400"
  }
  
  return (
    <div
      className={cn(
        "relative rounded-lg border-2 bg-slate-950/90 backdrop-blur-sm p-6",
        "transition-all duration-300 hover:translate-y-[-4px]",
        "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:via-transparent",
        "before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
        colors.border,
        colors.shadow,
        colors.gradient,
        className
      )}
      {...props}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-300">{title}</h3>
          {icon && (
            <div className={cn("w-8 h-8 flex items-center justify-center", colors.icon)}>
              {icon}
            </div>
          )}
        </div>
        
        <div className="mb-2">
          <div className={cn("text-3xl font-bold", colors.value)}>
            {value}
          </div>
          {trend && trendValue && (
            <div className={cn("text-sm", trend && trendColors[trend])}>
              {trend === "up" ? "↗" : trend === "down" ? "↘" : "→"} {trendValue}
            </div>
          )}
        </div>
        
        {description && (
          <p className="text-sm text-gray-400">{description}</p>
        )}
      </div>
    </div>
  )
}

// Pricing Card
export function PricingCard({ 
  title,
  price,
  period,
  description,
  features,
  buttonText = "Get Started",
  popular = false,
  className,
  onButtonClick,
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & { 
  title: string
  price: string | number
  period?: string
  description?: string
  features?: string[]
  buttonText?: string
  popular?: boolean
  onButtonClick?: () => void
}) {
  return (
    <div
      className={cn(
        "relative rounded-lg border-2 bg-slate-950/90 backdrop-blur-sm p-6",
        "transition-all duration-300 hover:translate-y-[-4px]",
        popular 
          ? "border-cyan-400/70 shadow-[0_0_25px_rgba(34,211,238,0.2)] scale-105" 
          : "border-slate-700/50 hover:border-slate-600",
        "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br",
        popular 
          ? "before:from-cyan-400/10 before:via-transparent before:to-cyan-400/5"
          : "before:from-slate-800/10 before:via-transparent before:to-slate-700/5",
        "before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
        className
      )}
      {...props}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-cyan-400 to-purple-400 text-black text-xs font-bold px-3 py-1 rounded-full">
            Most Popular
          </div>
        </div>
      )}
      
      <div className="relative z-10">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
          {description && (
            <p className="text-gray-300 text-sm">{description}</p>
          )}
        </div>
        
        <div className="text-center mb-6">
          <div className="flex items-baseline justify-center">
            <span className="text-4xl font-bold text-white">{price}</span>
            {period && (
              <span className="text-gray-400 ml-1">/{period}</span>
            )}
          </div>
        </div>
        
        {features && (
          <ul className="space-y-3 mb-6">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center text-sm text-gray-300">
                <svg className="w-4 h-4 text-cyan-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        )}
        
        <button
          onClick={onButtonClick}
          className={cn(
            "w-full py-3 px-4 rounded-lg font-medium transition-all duration-200",
            popular
              ? "bg-gradient-to-r from-cyan-400 to-purple-400 text-black hover:scale-105 hover:shadow-lg"
              : "bg-slate-800 text-white hover:bg-slate-700 border border-slate-600"
          )}
        >
          {buttonText}
        </button>
      </div>
    </div>
  )
}

// Profile Card
export function ProfileCard({ 
  name,
  role,
  avatar,
  bio,
  stats,
  actions,
  className,
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & { 
  name: string
  role?: string
  avatar?: string | React.ReactNode
  bio?: string
  stats?: Array<{ label: string; value: string | number }>
  actions?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "relative rounded-lg border-2 border-slate-700/50 bg-slate-950/90 backdrop-blur-sm p-6",
        "transition-all duration-300 hover:translate-y-[-4px] hover:border-slate-600",
        "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br",
        "before:from-slate-800/10 before:via-transparent before:to-slate-700/5",
        "before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
        className
      )}
      {...props}
    >
      <div className="relative z-10">
        <div className="flex items-center mb-4">
          {avatar && (
            <div className="w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-cyan-400/30">
              {typeof avatar === "string" ? (
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
              ) : (
                avatar
              )}
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-white">{name}</h3>
            {role && (
              <p className="text-cyan-400 text-sm">{role}</p>
            )}
          </div>
        </div>
        
        {bio && (
          <p className="text-gray-300 text-sm mb-4">{bio}</p>
        )}
        
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-lg font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
        
        {actions && (
          <div className="flex gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================
// LEGACY FEATURE CARDS (for backward compatibility)
// ============================

export interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  title?: string
  description?: string
  features?: string[]
  variant?: "default" | "neon" | "glass" | "gradient"
  animated?: boolean
}

export const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ className, icon, title, description, features, variant = "default", animated = true, ...props }, ref) => {
    const variants = {
      default: "border bg-card hover:shadow-md",
      neon: "border-2 border-cyan-400/50 bg-slate-950/80 backdrop-blur-sm hover:border-cyan-400 hover:shadow-[0_0_25px_rgb(34,211,238,0.3)]",
      glass: "backdrop-blur-md bg-white/10 border border-white/20 dark:bg-black/10 dark:border-white/10",
      gradient: "bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700"
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg p-6 transition-all duration-300",
          variants[variant],
          animated && "hover:translate-y-[-2px]",
          className
        )}
        {...props}
      >
        {icon && (
          <div className="w-12 h-12 mb-4 text-cyan-400">
            {icon}
          </div>
        )}
        {title && (
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
        )}
        {description && (
          <p className="text-muted-foreground mb-4">{description}</p>
        )}
        {features && (
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center text-sm">
                <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3" />
                {feature}
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }
)
FeatureCard.displayName = "FeatureCard"

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: "up" | "down" | "neutral"
  trendValue?: string
}

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, title, value, description, icon, trend, trendValue, ...props }, ref) => {
    const trendColors = {
      up: "text-green-500",
      down: "text-red-500",
      neutral: "text-gray-500"
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]",
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          {icon && (
            <div className="text-muted-foreground">{icon}</div>
          )}
        </div>
        <div className="text-2xl font-bold mb-1">{value}</div>
        {trend && trendValue && (
          <div className={cn("text-sm", trend && trendColors[trend])}>
            {trend === "up" ? "↗" : trend === "down" ? "↘" : "→"} {trendValue}
          </div>
        )}
        {description && (
          <p className="text-sm text-muted-foreground mt-2">{description}</p>
        )}
      </div>
    )
  }
)
StatCard.displayName = "StatCard" 