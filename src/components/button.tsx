"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "neon-cyan" | "neon-purple" | "neon-chartreuse" | "neon-pink" | "neon-destructive" | "neon-success" | "neon-warning"
  size?: "default" | "sm" | "lg" | "xl" | "icon"
  loading?: boolean
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = "default", 
    size = "default", 
    loading = false, 
    disabled, 
    children, 
    ...props 
  }, ref) => {
    
    const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden"
    
    const variants = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
      "neon-cyan": "bg-slate-950/90 border-2 border-cyan-400/60 text-cyan-400 font-semibold hover:bg-cyan-400/10 hover:border-cyan-400 hover:text-cyan-300 hover:shadow-[0_0_20px_rgb(34,211,238,0.4)] focus-visible:ring-cyan-400/50 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-cyan-400/0 before:via-cyan-400/10 before:to-cyan-400/0 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
      "neon-purple": "bg-slate-950/90 border-2 border-purple-400/60 text-purple-400 font-semibold hover:bg-purple-400/10 hover:border-purple-400 hover:text-purple-300 hover:shadow-[0_0_20px_rgb(168,85,247,0.4)] focus-visible:ring-purple-400/50 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-400/0 before:via-purple-400/10 before:to-purple-400/0 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
      "neon-chartreuse": "bg-slate-950/90 border-2 border-lime-400/60 text-lime-400 font-semibold hover:bg-lime-400/10 hover:border-lime-400 hover:text-lime-300 hover:shadow-[0_0_20px_rgb(163,230,53,0.4)] focus-visible:ring-lime-400/50 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-lime-400/0 before:via-lime-400/10 before:to-lime-400/0 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
      "neon-pink": "bg-slate-950/90 border-2 border-pink-400/60 text-pink-400 font-semibold hover:bg-pink-400/10 hover:border-pink-400 hover:text-pink-300 hover:shadow-[0_0_20px_rgb(244,114,182,0.4)] focus-visible:ring-pink-400/50 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-pink-400/0 before:via-pink-400/10 before:to-pink-400/0 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
      "neon-destructive": "bg-slate-950/90 border-2 border-red-400/60 text-red-400 font-semibold hover:bg-red-400/10 hover:border-red-400 hover:text-red-300 hover:shadow-[0_0_20px_rgb(248,113,113,0.4)] focus-visible:ring-red-400/50 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-red-400/0 before:via-red-400/10 before:to-red-400/0 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
      "neon-success": "bg-slate-950/90 border-2 border-emerald-400/60 text-emerald-400 font-semibold hover:bg-emerald-400/10 hover:border-emerald-400 hover:text-emerald-300 hover:shadow-[0_0_20px_rgb(52,211,153,0.4)] focus-visible:ring-emerald-400/50 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-emerald-400/0 before:via-emerald-400/10 before:to-emerald-400/0 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
      "neon-warning": "bg-slate-950/90 border-2 border-amber-400/60 text-amber-400 font-semibold hover:bg-amber-400/10 hover:border-amber-400 hover:text-amber-300 hover:shadow-[0_0_20px_rgb(251,191,36,0.4)] focus-visible:ring-amber-400/50 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-amber-400/0 before:via-amber-400/10 before:to-amber-400/0 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500"
    }
    
    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3 text-xs",
      lg: "h-11 rounded-md px-8 text-base",
      xl: "h-12 rounded-lg px-10 text-lg",
      icon: "h-10 w-10"
    }

    const buttonContent = (
      <>
        {loading && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.15 }}
            className="mr-2"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
          </motion.div>
        )}
        {children}
      </>
    )

    const isNeonVariant = variant?.startsWith('neon-')

    return (
      <motion.button
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        initial={{ scale: 1 }}
        whileHover={{ scale: isNeonVariant ? 1.05 : 1.02 }}
        whileTap={{ scale: 0.95 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
        // Spread HTML button props separately
        onClick={props.onClick}
        onMouseEnter={props.onMouseEnter}
        onMouseLeave={props.onMouseLeave}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        type={props.type}
        form={props.form}
        name={props.name}
        value={props.value}
        tabIndex={props.tabIndex}
        role={props.role}
        aria-label={props['aria-label']}
        aria-describedby={props['aria-describedby']}
        id={props.id}
      >
        {buttonContent}
      </motion.button>
    )
  }
)
Button.displayName = "Button"

export { Button } 