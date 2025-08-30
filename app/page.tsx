"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Badge } from "@/components/badge";
import { Switch } from "@/components/switch";
import { Alert } from "@/components/alert";
import { Dropdown } from "@/components/dropdown";
import { Checkbox } from "@/components/checkbox";
import { Tooltip } from "@/components/tooltip";
import { Textarea } from "@/components/textarea";
import { Slider } from "@/components/slider";
import { Radio } from "@/components/radio";
import { BackgroundGradient } from "@/components/background-gradient";

// ProgressBar component definition
interface ProgressBarProps {
  variant?:
    | "default"
    | "neon-cyan"
    | "neon-purple"
    | "neon-chartreuse"
    | "neon-pink"
    | "neon-destructive"
    | "neon-success"
    | "neon-warning";
  value?: number;
  max?: number;
  size?: "sm" | "default" | "lg";
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      variant = "default",
      value = 0,
      max = 100,
      size = "default",
      showLabel = false,
      label,
      animated = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    const baseClasses =
      "relative w-full rounded-full overflow-hidden transition-all duration-300";
    const barClasses =
      "h-full rounded-full transition-all duration-500 ease-out";

    const variants = {
      default: "bg-muted",
      "neon-cyan":
        "bg-gradient-to-r from-[#22d3ee]/20 to-[#22d3ee]/30 border border-[#22d3ee]/40",
      "neon-purple":
        "bg-gradient-to-r from-[#a855f7]/20 to-[#a855f7]/30 border border-[#a855f7]/40",
      "neon-chartreuse":
        "bg-gradient-to-r from-[#a3e635]/20 to-[#a3e635]/30 border border-[#a3e635]/40",
      "neon-pink":
        "bg-gradient-to-r from-[#f472b6]/20 to-[#f472b6]/30 border border-[#f472b6]/40",
      "neon-destructive":
        "bg-gradient-to-r from-[#f87171]/20 to-[#f87171]/30 border border-[#f87171]/40",
      "neon-success":
        "bg-gradient-to-r from-[#34d399]/20 to-[#34d399]/30 border border-[#34d399]/40",
      "neon-warning":
        "bg-gradient-to-r from-[#fbbf24]/20 to-[#fbbf24]/30 border border-[#fbbf24]/40",
    };

    const fillVariants = {
      default: "bg-primary",
      "neon-cyan":
        "bg-gradient-to-r from-[#22d3ee] to-[#22d3ee]/80 shadow-[0_0_10px_rgba(34,211,238,0.6)]",
      "neon-purple":
        "bg-gradient-to-r from-[#a855f7] to-[#a855f7]/80 shadow-[0_0_10px_rgba(168,85,247,0.6)]",
      "neon-chartreuse":
        "bg-gradient-to-r from-[#a3e635] to-[#a3e635]/80 shadow-[0_0_10px_rgba(163,230,53,0.6)]",
      "neon-pink":
        "bg-gradient-to-r from-[#f472b6] to-[#f472b6]/80 shadow-[0_0_10px_rgba(244,114,182,0.6)]",
      "neon-destructive":
        "bg-gradient-to-r from-[#f87171] to-[#f87171]/80 shadow-[0_0_10px_rgba(248,113,113,0.6)]",
      "neon-success":
        "bg-gradient-to-r from-[#34d399] to-[#34d399]/80 shadow-[0_0_10px_rgba(52,211,153,0.6)]",
      "neon-warning":
        "bg-gradient-to-r from-[#fbbf24] to-[#fbbf24]/80 shadow-[0_0_10px_rgba(251,191,36,0.6)]",
    };

    const sizes = {
      sm: "h-2",
      default: "h-3",
      lg: "h-4",
    };

    const isNeonVariant = variant?.startsWith("neon-");

    const progressBar = (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          isNeonVariant && "shadow-lg backdrop-blur-sm",
          className,
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        {...props}
      >
        <motion.div
          className={cn(barClasses, fillVariants[variant])}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: animated ? 1 : 0.3,
            ease: "easeOut",
          }}
        />

        {isNeonVariant && (
          <div
            className="absolute inset-0 rounded-full opacity-30 blur-sm"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${
                variant === "neon-cyan"
                  ? "#22d3ee"
                  : variant === "neon-purple"
                  ? "#a855f7"
                  : variant === "neon-chartreuse"
                  ? "#a3e635"
                  : variant === "neon-pink"
                  ? "#f472b6"
                  : variant === "neon-destructive"
                  ? "#f87171"
                  : variant === "neon-success"
                  ? "#34d399"
                  : variant === "neon-warning"
                  ? "#fbbf24"
                  : "#22d3ee"
              } ${percentage}%, transparent ${percentage}%)`,
            }}
          />
        )}
      </div>
    );

    if (showLabel || label) {
      return (
        <div className="space-y-2">
          {(label || showLabel) && (
            <div className="flex justify-between items-center">
              {label && (
                <span
                  className={cn(
                    "text-sm font-medium",
                    isNeonVariant && "text-foreground",
                  )}
                >
                  {label}
                </span>
              )}
              {showLabel && (
                <span
                  className={cn(
                    "text-sm font-medium",
                    isNeonVariant && "text-foreground",
                  )}
                >
                  {Math.round(percentage)}%
                </span>
              )}
            </div>
          )}
          {progressBar}
          {children}
        </div>
      );
    }

    return progressBar;
  },
);

ProgressBar.displayName = "ProgressBar";
import {
  ArrowRight,
  Github,
  Zap,
  Palette,
  Code2,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Check,
  Download,
  Bell,
  Settings,
  Eye,
  MessageSquare,
  Heart,
  Share2,
  Star,
  Activity,
  Users,
  DollarSign,
  TrendingUp,
  Mail,
  Phone,
  Globe,
  X,
  ChevronDown,
  Loader2,
  Search,
  Upload,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function HomePage() {
  const [switchChecked, setSwitchChecked] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(true);
  const [radioValue, setRadioValue] = useState("option1");
  const [sliderValue, setSliderValue] = useState([50]);
  const [progressValue, setProgressValue] = useState(75);
  const [dropdownValue, setDropdownValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dropdownOptions = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
    { value: "option4", label: "Option 4" },
  ];

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
              <Link
                href="/setup"
                className="text-sm font-medium hover:text-neon-cyan transition-colors"
              >
                Installation
              </Link>
              <Link
                href="/docs"
                className="text-sm font-medium hover:text-neon-blue transition-colors"
              >
                Documentation
              </Link>
              <Link
                href="/components"
                className="text-sm font-medium hover:text-neon-purple transition-colors"
              >
                Components
              </Link>
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="https://github.com/neonkit/neonkit"
                  target="_blank"
                  rel="noopener noreferrer"
                >
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
              Copy and paste beautiful JSX components with electric neon
              accents. Dark mode optimized, Tailwind-powered, ready to use.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="xl" variant="neon-cyan" asChild>
                <Link
                  href="/setup"
                  className="inline-flex items-center whitespace-nowrap"
                >
                  Copy Components{" "}
                  <ArrowRight className="ml-2 h-5 w-5 flex-shrink-0" />
                </Link>
              </Button>

              <Button size="xl" variant="neon-purple" asChild>
                <Link href="/components" className="inline-flex items-center">
                  Browse Library
                </Link>
              </Button>
            </div>

            {/* Bento Grid Component Showcase */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-7xl mx-auto"
            >
              {/* Bento Grid - Comprehensive Component Showcase */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 auto-rows-[180px]">
                {/* Buttons - Large Feature Box */}
                <motion.div
                  className="md:col-span-2 lg:col-span-2 row-span-2 bg-card/50 border border-neon-cyan/20 rounded-xl p-6 backdrop-blur-sm hover:border-neon-cyan/40 transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-neon-cyan rounded-full shadow-[0_0_10px_rgb(34,211,238,0.5)]"></div>
                    <h4 className="text-lg font-semibold text-neon-cyan">
                      Neon Buttons
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="neon-cyan" size="sm">
                      Cyan
                    </Button>
                    <Button variant="neon-purple" size="sm">
                      Purple
                    </Button>
                    <Button variant="neon-chartreuse" size="sm">
                      Chartreuse
                    </Button>
                    <Button variant="neon-pink" size="sm">
                      Pink
                    </Button>
                    <Button variant="neon-success" size="sm">
                      Success
                    </Button>
                    <Button variant="neon-warning" size="sm">
                      Warning
                    </Button>
                  </div>
                </motion.div>

                {/* Progress Bars - Medium Box */}
                <motion.div
                  className="md:col-span-1 lg:col-span-1 row-span-1 bg-card/50 border border-neon-chartreuse/20 rounded-xl p-4 backdrop-blur-sm hover:border-neon-chartreuse/40 transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-neon-chartreuse rounded-full shadow-[0_0_10px_rgb(163,230,53,0.5)]"></div>
                    <h4 className="text-sm font-semibold text-neon-chartreuse">
                      Progress
                    </h4>
                  </div>
                  <div className="space-y-3">
                    <ProgressBar
                      variant="neon-cyan"
                      value={75}
                      showLabel
                      size="sm"
                    />
                    <ProgressBar
                      variant="neon-purple"
                      value={60}
                      showLabel
                      size="sm"
                    />
                  </div>
                </motion.div>

                {/* Input - Medium Box */}
                <motion.div
                  className="md:col-span-1 lg:col-span-1 row-span-1 bg-card/50 border border-neon-pink/20 rounded-xl p-4 backdrop-blur-sm hover:border-neon-pink/40 transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-neon-pink rounded-full shadow-[0_0_10px_rgb(244,114,182,0.5)]"></div>
                    <h4 className="text-sm font-semibold text-neon-pink">
                      Input
                    </h4>
                  </div>
                  <Input variant="neon-cyan" placeholder="Email..." size="sm" />
                </motion.div>

                {/* Badges - Medium Box */}
                <motion.div
                  className="md:col-span-1 lg:col-span-1 row-span-1 bg-card/50 border border-neon-purple/20 rounded-xl p-4 backdrop-blur-sm hover:border-neon-purple/40 transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-neon-purple rounded-full shadow-[0_0_10px_rgb(168,85,247,0.5)]"></div>
                    <h4 className="text-sm font-semibold text-neon-purple">
                      Badges
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="neon-cyan">New</Badge>
                    <Badge variant="neon-purple">Hot</Badge>
                    <Badge variant="neon-chartreuse">Pro</Badge>
                  </div>
                </motion.div>

                {/* Switches - Medium Box */}
                <motion.div
                  className="md:col-span-1 lg:col-span-1 row-span-1 bg-card/50 border border-neon-warning/20 rounded-xl p-4 backdrop-blur-sm hover:border-neon-warning/40 transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-neon-warning rounded-full shadow-[0_0_10px_rgb(251,191,36,0.5)]"></div>
                    <h4 className="text-sm font-semibold text-neon-warning">
                      Switches
                    </h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-cyan-400">Cyan</span>
                      <Switch
                        variant="neon-cyan"
                        checked={switchChecked}
                        onCheckedChange={setSwitchChecked}
                        size="sm"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-purple-400">Purple</span>
                      <Switch
                        variant="neon-purple"
                        checked={!switchChecked}
                        size="sm"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Alert - Large Box */}
                <motion.div
                  className="md:col-span-2 lg:col-span-2 row-span-2 bg-card/50 border border-emerald-400/20 rounded-xl p-6 backdrop-blur-sm hover:border-emerald-400/40 transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_10px_rgb(52,211,153,0.5)]"></div>
                    <h4 className="text-lg font-semibold text-emerald-400">
                      Alert Component
                    </h4>
                  </div>
                  <Alert
                    variant="neon-success"
                    title="Success!"
                    description="Your action was completed successfully with beautiful neon styling that shines in dark mode."
                    closable
                  />
                </motion.div>

                {/* Dropdown - Medium Box */}
                <motion.div
                  className="md:col-span-1 lg:col-span-1 row-span-1 bg-card/50 border border-neon-destructive/20 rounded-xl p-4 backdrop-blur-sm hover:border-neon-destructive/40 transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-neon-destructive rounded-full shadow-[0_0_10px_rgb(248,113,113,0.5)]"></div>
                    <h4 className="text-sm font-semibold text-neon-destructive">
                      Dropdown
                    </h4>
                  </div>
                  <Dropdown
                    options={dropdownOptions}
                    placeholder="Select..."
                    value={dropdownValue}
                    onChange={setDropdownValue}
                    variant="neon-cyan"
                    size="sm"
                  />
                </motion.div>

                {/* Checkboxes - Medium Box */}
                <motion.div
                  className="md:col-span-1 lg:col-span-1 row-span-1 bg-card/50 border border-neon-success/20 rounded-xl p-4 backdrop-blur-sm hover:border-neon-success/40 transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-neon-success rounded-full shadow-[0_0_10px_rgb(52,211,153,0.5)]"></div>
                    <h4 className="text-sm font-semibold text-neon-success">
                      Checkboxes
                    </h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        variant="neon-cyan"
                        checked={checkboxChecked}
                        onCheckedChange={setCheckboxChecked}
                        size="sm"
                      />
                      <span className="text-xs">Agree</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        variant="neon-purple"
                        checked={!checkboxChecked}
                        size="sm"
                      />
                      <span className="text-xs">Terms</span>
                    </div>
                  </div>
                </motion.div>

                {/* Radio Buttons - Medium Box */}
                <motion.div
                  className="md:col-span-1 lg:col-span-1 row-span-1 bg-card/50 border border-neon-pink/20 rounded-xl p-4 backdrop-blur-sm hover:border-neon-pink/40 transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-neon-pink rounded-full shadow-[0_0_10px_rgb(244,114,182,0.5)]"></div>
                    <h4 className="text-sm font-semibold text-neon-pink">
                      Radio
                    </h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Radio
                        variant="neon-cyan"
                        value="option1"
                        checked={radioValue === "option1"}
                        onCheckedChange={(checked) =>
                          checked && setRadioValue("option1")
                        }
                        size="sm"
                      />
                      <span className="text-xs">Option 1</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Radio
                        variant="neon-purple"
                        value="option2"
                        checked={radioValue === "option2"}
                        onCheckedChange={(checked) =>
                          checked && setRadioValue("option2")
                        }
                        size="sm"
                      />
                      <span className="text-xs">Option 2</span>
                    </div>
                  </div>
                </motion.div>

                {/* Slider - Medium Box */}
                <motion.div
                  className="md:col-span-1 lg:col-span-1 row-span-1 bg-card/50 border border-neon-purple/20 rounded-xl p-4 backdrop-blur-sm hover:border-neon-purple/40 transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-neon-purple rounded-full shadow-[0_0_10px_rgb(168,85,247,0.5)]"></div>
                    <h4 className="text-sm font-semibold text-neon-purple">
                      Slider
                    </h4>
                  </div>
                  <Slider
                    value={sliderValue}
                    onValueChange={setSliderValue}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-center mt-2">
                    <span className="text-xs text-neon-purple">
                      {sliderValue[0]}%
                    </span>
                  </div>
                </motion.div>

                {/* Tooltip - Medium Box */}
                <motion.div
                  className="md:col-span-1 lg:col-span-1 row-span-1 bg-card/50 border border-neon-warning/20 rounded-xl p-4 backdrop-blur-sm hover:border-neon-warning/40 transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.3 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-neon-warning rounded-full shadow-[0_0_10px_rgb(251,191,36,0.5)]"></div>
                    <h4 className="text-sm font-semibold text-neon-warning">
                      Tooltip
                    </h4>
                  </div>
                  <div className="flex justify-center">
                    <Tooltip
                      content="Click me! This is a tooltip"
                      variant="neon-cyan"
                      triggerClassName="inline-flex items-center justify-center p-2 rounded-md border border-neon-cyan/30"
                    >
                      <Bell className="w-4 h-4" />
                    </Tooltip>
                  </div>
                </motion.div>

                {/* Textarea - Large Box */}
                <motion.div
                  className="md:col-span-2 lg:col-span-2 row-span-2 bg-card/50 border border-neon-chartreuse/20 rounded-xl p-6 backdrop-blur-sm hover:border-neon-chartreuse/40 transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.4 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-neon-chartreuse rounded-full shadow-[0_0_10px_rgb(163,230,53,0.5)]"></div>
                    <h4 className="text-lg font-semibold text-neon-chartreuse">
                      Textarea
                    </h4>
                  </div>
                  <Textarea
                    variant="neon-cyan"
                    placeholder="Type your message here..."
                    className="h-20 text-sm"
                  />
                </motion.div>

                {/* Card Example - Large Box */}
                <motion.div
                  className="md:col-span-2 lg:col-span-2 row-span-2 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 border border-slate-700 shadow-lg hover:shadow-xl before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-cyan-400/5 before:via-purple-400/5 before:to-lime-400/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 transition-all duration-300 hover:translate-y-[-2px] relative"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.5 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-neon-cyan rounded-full shadow-[0_0_10px_rgb(34,211,238,0.5)]"></div>
                    <h4 className="text-lg font-semibold text-neon-cyan">
                      Card Component
                    </h4>
                  </div>
                  <div className="relative z-10">
                    <div className="flex flex-col space-y-1.5 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-400/20 rounded-lg">
                          <Star className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold leading-none tracking-tight text-white">
                            Premium Features
                          </h3>
                          <p className="text-sm text-cyan-100">
                            Unlock advanced tools
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="pb-4">
                      <p className="text-gray-300 text-sm mb-4">
                        Access exclusive features and priority support with our
                        premium plan.
                      </p>
                      <button className="w-full py-2 px-4 bg-gradient-to-r from-cyan-400 to-purple-400 text-black rounded-lg font-medium hover:scale-105 transition-transform">
                        ✨ Upgrade Now
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Modal Trigger - Medium Box */}
                <motion.div
                  className="md:col-span-1 lg:col-span-1 row-span-1 bg-card/50 border border-neon-cyan/20 rounded-xl p-4 backdrop-blur-sm hover:border-neon-cyan/40 transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.6 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-neon-cyan rounded-full shadow-[0_0_10px_rgb(34,211,238,0.5)]"></div>
                    <h4 className="text-sm font-semibold text-neon-cyan">
                      Modal
                    </h4>
                  </div>
                  <div className="text-center">
                    <Button
                      variant="neon-cyan"
                      size="sm"
                      onClick={() => setIsModalOpen(true)}
                    >
                      Open Modal
                    </Button>
                  </div>
                </motion.div>

                {/* Stats Box - Medium Box */}
                <motion.div
                  className="md:col-span-1 lg:col-span-1 row-span-1 bg-card/50 border border-neon-pink/20 rounded-xl p-4 backdrop-blur-sm hover:border-neon-pink/40 transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.7 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-neon-pink rounded-full shadow-[0_0_10px_rgb(244,114,182,0.5)]"></div>
                    <h4 className="text-sm font-semibold text-neon-pink">
                      Stats
                    </h4>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-neon-pink mb-1">
                      12+
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Components
                    </div>
                    <div className="text-xs text-neon-pink">Ready to Use</div>
                  </div>
                </motion.div>

                {/* CTA Box - Medium Box */}
                <motion.div
                  className="md:col-span-1 lg:col-span-1 row-span-1 bg-gradient-to-br from-neon-cyan/10 via-neon-purple/10 to-neon-chartreuse/10 border border-neon-cyan/30 rounded-xl p-4 backdrop-blur-sm hover:border-neon-cyan/50 transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.8 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-neon-cyan rounded-full shadow-[0_0_10px_rgb(34,211,238,0.5)]"></div>
                    <h4 className="text-sm font-semibold text-neon-cyan">
                      CTA
                    </h4>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="text-sm font-semibold text-white mb-2">
                      Ready to Build?
                    </h4>
                    <p className="text-xs text-muted-foreground mb-4">
                      Start with copy-paste components
                    </p>
                    <Button
                      variant="neon-cyan"
                      size="sm"
                      className="w-full"
                      asChild
                    >
                      <Link href="/setup">Get Started</Link>
                    </Button>
                  </div>
                </motion.div>
              </div>

              {/* Modal Component - Hidden by default, triggered by button */}
              {isModalOpen && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                  onClick={() => setIsModalOpen(false)}
                >
                  <motion.div
                    className="relative w-full max-w-lg rounded-lg border-2 border-cyan-400/50 bg-slate-950/95 backdrop-blur-xl shadow-[0_0_50px_rgba(34,211,238,0.3)] p-6"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-cyan-400">
                          <CheckCircle className="h-6 w-6" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-white">
                            Success!
                          </h2>
                          <p className="text-sm text-white/80">
                            Modal opened successfully
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="text-white/60 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mb-6">
                      <p className="text-sm text-white/90">
                        This is a beautiful neon modal component with backdrop
                        blur and glowing borders.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="ghost"
                        onClick={() => setIsModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="neon-cyan"
                        onClick={() => setIsModalOpen(false)}
                      >
                        Confirm
                      </Button>
                    </div>
                  </motion.div>
                </div>
              )}
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
              Designed for developers who want clean, accessible, and
              beautifully animated components.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Palette className="h-8 w-8 text-neon-blue" />,
                title: "Copy & Paste Ready",
                description:
                  "Complete JSX with Tailwind classes. No setup, no installation, just copy and use.",
              },
              {
                icon: <Code2 className="h-8 w-8 text-neon-purple" />,
                title: "Dark Mode Optimized",
                description:
                  "7 neon variants designed exclusively for dark themes where electric effects shine.",
              },
              {
                icon: <Sparkles className="h-8 w-8 text-neon-chartreuse" />,
                title: "Smooth Animations",
                description:
                  "Framer Motion powered with accessibility-first design and reduced motion support.",
              },
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
  );
}
