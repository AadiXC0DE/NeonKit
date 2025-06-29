export type NeonAccent = "blue" | "purple" | "chartreuse" | "custom"

export type ComponentSize = "sm" | "default" | "lg" | "xl" | "icon"

export type ComponentVariant = 
  | "default" 
  | "destructive" 
  | "outline" 
  | "secondary" 
  | "ghost" 
  | "neon"
  | "gradient"
  | "link"

export interface CustomNeonColor {
  primary: string      // Main color (e.g., "#FF6B6B")
  secondary?: string   // Optional secondary for gradients
  shadow?: string      // Custom shadow color
}

export interface ThemeConfig {
  accent: NeonAccent
  customColor?: CustomNeonColor
  radius: number
  fontScale: number
  animation: boolean
  reducedMotion: boolean
}

export interface ComponentProps {
  className?: string
  variant?: ComponentVariant
  size?: ComponentSize
  accent?: NeonAccent
  customColor?: CustomNeonColor
  disabled?: boolean
  loading?: boolean
}

// Predefined neon colors
export const NEON_COLORS = {
  blue: {
    primary: "#00FFC3",
    shadow: "#00FFC3",
  },
  purple: {
    primary: "#D300FF", 
    shadow: "#D300FF",
  },
  chartreuse: {
    primary: "#BFFF00",
    shadow: "#BFFF00",
  },
} as const

// Helper function to get color value
export function getNeonColor(accent: NeonAccent, customColor?: CustomNeonColor): CustomNeonColor {
  if (accent === "custom" && customColor) {
    return {
      primary: customColor.primary,
      secondary: customColor.secondary || customColor.primary,
      shadow: customColor.shadow || customColor.primary,
    }
  }
  
  return NEON_COLORS[accent as keyof typeof NEON_COLORS] || NEON_COLORS.blue
} 