import type { CustomNeonColor } from "@/types/theme"

// Color conversion utilities
export function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

// Generate color variations
export function generateColorVariations(baseColor: string): CustomNeonColor {
  return {
    primary: baseColor,
    shadow: baseColor,
  }
}

// Popular color presets for users
export const COLOR_PRESETS = {
  // Reds
  "Electric Red": "#FF073A",
  "Neon Pink": "#FF10F0", 
  "Hot Pink": "#FF1493",
  
  // Blues 
  "Electric Blue": "#00FFC3", // Default
  "Cyan": "#00FFFF",
  "Azure": "#007FFF",
  
  // Greens
  "Neon Green": "#39FF14",
  "Chartreuse": "#BFFF00", // Default
  "Lime": "#32CD32",
  
  // Purples
  "Electric Purple": "#D300FF", // Default
  "Violet": "#8A2BE2",
  "Magenta": "#FF00FF",
  
  // Oranges
  "Electric Orange": "#FF8C00",
  "Neon Orange": "#FFA500",
  "Tangerine": "#FF7F00",
  
  // Yellows
  "Electric Yellow": "#FFFF00",
  "Gold": "#FFD700",
  "Amber": "#FFBF00",
} as const

// CSS custom properties generator
export function generateNeonCSS(color: CustomNeonColor, prefix = "custom"): string {
  return `
    --${prefix}-neon-primary: ${color.primary};
    --${prefix}-neon-shadow: ${color.shadow || color.primary};
    --${prefix}-neon-glow: 0 0 10px ${color.shadow || color.primary};
    --${prefix}-neon-glow-hover: 0 0 20px ${color.shadow || color.primary}, 0 0 30px ${color.shadow || color.primary};
  `
}

// Validate hex color
export function isValidHexColor(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)
} 