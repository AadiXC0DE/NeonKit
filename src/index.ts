// Main exports
export { Button } from "./components/button";
export { Input } from "./components/input";
export { Textarea } from "./components/textarea";
export { Dropdown } from "./components/dropdown";
export type { DropdownOption } from "./components/dropdown";
export { Alert } from "./components/alert";
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "./components/card";
export { FeatureCard, StatCard } from "./components/feature-card";
export { ThemeProvider } from "./components/theme-provider";
export { ThemeToggle } from "./components/theme-toggle";
export { ModeToggle } from "./components/mode-toggle";
export { BackgroundGradient } from "./components/background-gradient";

// Hooks
// None currently - using specific neon variants instead of dynamic theming

// Utilities
export { cn } from "./lib/utils";
export {
  hexToHsl,
  generateColorVariations,
  generateNeonCSS,
  isValidHexColor,
  COLOR_PRESETS,
} from "./lib/colors";

// Types
export type {
  NeonAccent,
  CustomNeonColor,
  ComponentSize,
  ComponentVariant,
  ComponentProps,
  ThemeConfig,
} from "./types/theme";
export { getNeonColor, NEON_COLORS } from "./types/theme";
