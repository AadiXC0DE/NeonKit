"use client";

// --- Dropdown component start ---
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Search, X, Loader2 } from "lucide-react";

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
}

interface DropdownProps {
  variant?:
    | "default"
    | "ghost"
    | "filled"
    | "neon-cyan"
    | "neon-purple"
    | "neon-chartreuse"
    | "neon-pink"
    | "neon-destructive"
    | "neon-success"
    | "neon-warning";
  size?: "sm" | "default" | "lg" | "xl";
  placeholder?: string;
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  loading?: boolean;
  error?: boolean;
  success?: boolean;
  helperText?: string;
  label?: string;
  className?: string;
  maxHeight?: number;
  multiple?: boolean;
  values?: string[];
  onMultipleChange?: (values: string[]) => void;
}

const Dropdown = React.forwardRef<HTMLDivElement, DropdownProps>(
  (
    {
      variant = "default",
      size = "default",
      placeholder = "Select an option...",
      options = [],
      value,
      onChange,
      disabled = false,
      searchable = false,
      clearable = false,
      loading = false,
      error = false,
      success = false,
      helperText,
      label,
      className,
      maxHeight = 300,
      multiple = false,
      values = [],
      onMultipleChange,
      ...props
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const searchRef = React.useRef<HTMLInputElement>(null);

    const prefersReducedMotion =
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;

    // Filter options based on search query
    const filteredOptions = React.useMemo(() => {
      if (!searchQuery) return options;
      return options.filter(
        (option) =>
          option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          option.value.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }, [options, searchQuery]);

    // Get selected option(s) for display
    const selectedOption = options.find((opt) => opt.value === value);
    const selectedOptions = multiple
      ? options.filter((opt) => values.includes(opt.value))
      : [];

    // Handle click outside to close dropdown
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
          setSearchQuery("");
          setHighlightedIndex(-1);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle keyboard navigation
    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (!isOpen) return;

        switch (event.key) {
          case "ArrowDown":
            event.preventDefault();
            setHighlightedIndex((prev) =>
              prev < filteredOptions.length - 1 ? prev + 1 : 0,
            );
            break;
          case "ArrowUp":
            event.preventDefault();
            setHighlightedIndex((prev) =>
              prev > 0 ? prev - 1 : filteredOptions.length - 1,
            );
            break;
          case "Enter":
            event.preventDefault();
            if (
              highlightedIndex >= 0 &&
              highlightedIndex < filteredOptions.length
            ) {
              handleSelect(filteredOptions[highlightedIndex].value);
            }
            break;
          case "Escape":
            setIsOpen(false);
            setSearchQuery("");
            setHighlightedIndex(-1);
            break;
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, highlightedIndex, filteredOptions]);

    // Focus search input when dropdown opens
    React.useEffect(() => {
      if (isOpen && searchable && searchRef.current) {
        searchRef.current.focus();
      }
    }, [isOpen, searchable]);

    const handleSelect = (optionValue: string) => {
      if (multiple) {
        const newValues = values.includes(optionValue)
          ? values.filter((v) => v !== optionValue)
          : [...values, optionValue];
        onMultipleChange?.(newValues);
      } else {
        onChange?.(optionValue);
        setIsOpen(false);
        setSearchQuery("");
      }
      setHighlightedIndex(-1);
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (multiple) {
        onMultipleChange?.([]);
      } else {
        onChange?.("");
      }
    };

    const toggleDropdown = () => {
      if (!disabled) {
        setIsOpen(!isOpen);
        if (!isOpen) {
          setHighlightedIndex(-1);
        }
      }
    };

    const baseClasses =
      "relative flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 cursor-pointer";

    const variants = {
      default: "border-input bg-background hover:border-accent-foreground/20",
      ghost: "border-transparent bg-accent/5 hover:bg-accent/10",
      filled: "bg-secondary border-transparent hover:bg-secondary/80",
      "neon-cyan":
        "bg-slate-950/50 border-2 border-cyan-400/60 text-cyan-100 font-medium hover:border-cyan-400/80 hover:shadow-[0_0_10px_rgb(34,211,238,0.2)] backdrop-blur-sm focus-visible:border-cyan-400 focus-visible:ring-cyan-400/50 focus-visible:shadow-[0_0_15px_rgb(34,211,238,0.3)]",
      "neon-purple":
        "bg-slate-950/50 border-2 border-purple-400/60 text-purple-100 font-medium hover:border-purple-400/80 hover:shadow-[0_0_10px_rgb(168,85,247,0.2)] backdrop-blur-sm focus-visible:border-purple-400 focus-visible:ring-purple-400/50 focus-visible:shadow-[0_0_15px_rgb(168,85,247,0.3)]",
      "neon-chartreuse":
        "bg-slate-950/50 border-2 border-lime-400/60 text-lime-100 font-medium hover:border-lime-400/80 hover:shadow-[0_0_10px_rgb(163,230,53,0.2)] backdrop-blur-sm focus-visible:border-lime-400 focus-visible:ring-lime-400/50 focus-visible:shadow-[0_0_15px_rgb(163,230,53,0.3)]",
      "neon-pink":
        "bg-slate-950/50 border-2 border-pink-400/60 text-pink-100 font-medium hover:border-pink-400/80 hover:shadow-[0_0_10px_rgb(244,114,182,0.2)] backdrop-blur-sm focus-visible:border-pink-400 focus-visible:ring-pink-400/50 focus-visible:shadow-[0_0_15px_rgb(244,114,182,0.3)]",
      "neon-destructive":
        "bg-slate-950/50 border-2 border-red-400/60 text-red-100 font-medium hover:border-red-400/80 hover:shadow-[0_0_10px_rgb(248,113,113,0.2)] backdrop-blur-sm focus-visible:border-red-400 focus-visible:ring-red-400/50 focus-visible:shadow-[0_0_15px_rgb(248,113,113,0.3)]",
      "neon-success":
        "bg-slate-950/50 border-2 border-emerald-400/60 text-emerald-100 font-medium hover:border-emerald-400/80 hover:shadow-[0_0_10px_rgb(52,211,153,0.2)] backdrop-blur-sm focus-visible:border-emerald-400 focus-visible:ring-emerald-400/50 focus-visible:shadow-[0_0_15px_rgb(52,211,153,0.3)]",
      "neon-warning":
        "bg-slate-950/50 border-2 border-amber-400/60 text-amber-100 font-medium hover:border-amber-400/80 hover:shadow-[0_0_10px_rgb(251,191,36,0.2)] backdrop-blur-sm focus-visible:border-amber-400 focus-visible:ring-amber-400/50 focus-visible:shadow-[0_0_15px_rgb(251,191,36,0.3)]",
    };

    const sizes = {
      sm: "h-8 px-2 text-xs",
      default: "h-10 px-3 py-2",
      lg: "h-11 px-4 py-3 text-base",
      xl: "h-12 px-5 py-4 text-lg",
    };

    const isNeonVariant = variant?.startsWith("neon-");
    const neonColor = isNeonVariant ? variant.split("-")[1] : null;

    const getIconColor = () => {
      if (!isNeonVariant) return "text-muted-foreground";

      const colorMap = {
        cyan: "text-cyan-400",
        purple: "text-purple-400",
        chartreuse: "text-lime-400",
        pink: "text-pink-400",
        destructive: "text-red-400",
        success: "text-emerald-400",
        warning: "text-amber-400",
      };

      return colorMap[neonColor as keyof typeof colorMap] || "text-cyan-400";
    };

    const getDropdownBgColor = () => {
      if (!isNeonVariant) return "bg-popover";
      return "bg-slate-950/95 backdrop-blur-lg border-2";
    };

    const getDropdownBorderColor = () => {
      if (!isNeonVariant) return "border-border";

      const colorMap = {
        cyan: "border-cyan-400/50",
        purple: "border-purple-400/50",
        chartreuse: "border-lime-400/50",
        pink: "border-pink-400/50",
        destructive: "border-red-400/50",
        success: "border-emerald-400/50",
        warning: "border-amber-400/50",
      };

      return (
        colorMap[neonColor as keyof typeof colorMap] || "border-cyan-400/50"
      );
    };

    const getDropdownShadow = () => {
      if (!isNeonVariant) return "";

      const colorMap = {
        cyan: "shadow-[0_0_25px_rgba(34,211,238,0.3),0_0_50px_rgba(34,211,238,0.1)]",
        purple:
          "shadow-[0_0_25px_rgba(168,85,247,0.3),0_0_50px_rgba(168,85,247,0.1)]",
        chartreuse:
          "shadow-[0_0_25px_rgba(163,230,53,0.3),0_0_50px_rgba(163,230,53,0.1)]",
        pink: "shadow-[0_0_25px_rgba(244,114,182,0.3),0_0_50px_rgba(244,114,182,0.1)]",
        destructive:
          "shadow-[0_0_25px_rgba(248,113,113,0.3),0_0_50px_rgba(248,113,113,0.1)]",
        success:
          "shadow-[0_0_25px_rgba(52,211,153,0.3),0_0_50px_rgba(52,211,153,0.1)]",
        warning:
          "shadow-[0_0_25px_rgba(251,191,36,0.3),0_0_50px_rgba(251,191,36,0.1)]",
      };

      return (
        colorMap[neonColor as keyof typeof colorMap] ||
        "shadow-[0_0_25px_rgba(34,211,238,0.3),0_0_50px_rgba(34,211,238,0.1)]"
      );
    };

    const getOptionHoverStyles = () => {
      if (!isNeonVariant) return "hover:bg-accent/50";

      const colorMap = {
        cyan: "hover:bg-cyan-400/20 hover:text-cyan-100 hover:shadow-[inset_0_0_10px_rgba(34,211,238,0.2)] hover:border-l-2 hover:border-l-cyan-400/60",
        purple:
          "hover:bg-purple-400/20 hover:text-purple-100 hover:shadow-[inset_0_0_10px_rgba(168,85,247,0.2)] hover:border-l-2 hover:border-l-purple-400/60",
        chartreuse:
          "hover:bg-lime-400/20 hover:text-lime-100 hover:shadow-[inset_0_0_10px_rgba(163,230,53,0.2)] hover:border-l-2 hover:border-l-lime-400/60",
        pink: "hover:bg-pink-400/20 hover:text-pink-100 hover:shadow-[inset_0_0_10px_rgba(244,114,182,0.2)] hover:border-l-2 hover:border-l-pink-400/60",
        destructive:
          "hover:bg-red-400/20 hover:text-red-100 hover:shadow-[inset_0_0_10px_rgba(248,113,113,0.2)] hover:border-l-2 hover:border-l-red-400/60",
        success:
          "hover:bg-emerald-400/20 hover:text-emerald-100 hover:shadow-[inset_0_0_10px_rgba(52,211,153,0.2)] hover:border-l-2 hover:border-l-emerald-400/60",
        warning:
          "hover:bg-amber-400/20 hover:text-amber-100 hover:shadow-[inset_0_0_10px_rgba(251,191,36,0.2)] hover:border-l-2 hover:border-l-amber-400/60",
      };

      return (
        colorMap[neonColor as keyof typeof colorMap] ||
        "hover:bg-cyan-400/20 hover:text-cyan-100 hover:shadow-[inset_0_0_10px_rgba(34,211,238,0.2)] hover:border-l-2 hover:border-l-cyan-400/60"
      );
    };

    const getOptionSelectedStyles = () => {
      if (!isNeonVariant) return "bg-primary/10 text-primary";

      const colorMap = {
        cyan: "bg-cyan-400/30 text-cyan-100 shadow-[inset_0_0_15px_rgba(34,211,238,0.3)] border-l-4 border-l-cyan-400",
        purple:
          "bg-purple-400/30 text-purple-100 shadow-[inset_0_0_15px_rgba(168,85,247,0.3)] border-l-4 border-l-purple-400",
        chartreuse:
          "bg-lime-400/30 text-lime-100 shadow-[inset_0_0_15px_rgba(163,230,53,0.3)] border-l-4 border-l-lime-400",
        pink: "bg-pink-400/30 text-pink-100 shadow-[inset_0_0_15px_rgba(244,114,182,0.3)] border-l-4 border-l-pink-400",
        destructive:
          "bg-red-400/30 text-red-100 shadow-[inset_0_0_15px_rgba(248,113,113,0.3)] border-l-4 border-l-red-400",
        success:
          "bg-emerald-400/30 text-emerald-100 shadow-[inset_0_0_15px_rgba(52,211,153,0.3)] border-l-4 border-l-emerald-400",
        warning:
          "bg-amber-400/30 text-amber-100 shadow-[inset_0_0_15px_rgba(251,191,36,0.3)] border-l-4 border-l-amber-400",
      };

      return (
        colorMap[neonColor as keyof typeof colorMap] ||
        "bg-cyan-400/30 text-cyan-100 shadow-[inset_0_0_15px_rgba(34,211,238,0.3)] border-l-4 border-l-cyan-400"
      );
    };

    const getOptionHighlightedStyles = () => {
      if (!isNeonVariant) return "bg-accent text-accent-foreground";

      const colorMap = {
        cyan: "bg-cyan-400/25 text-cyan-100 shadow-[inset_0_0_12px_rgba(34,211,238,0.25)] border-l-3 border-l-cyan-400/80",
        purple:
          "bg-purple-400/25 text-purple-100 shadow-[inset_0_0_12px_rgba(168,85,247,0.25)] border-l-3 border-l-purple-400/80",
        chartreuse:
          "bg-lime-400/25 text-lime-100 shadow-[inset_0_0_12px_rgba(163,230,53,0.25)] border-l-3 border-l-lime-400/80",
        pink: "bg-pink-400/25 text-pink-100 shadow-[inset_0_0_12px_rgba(244,114,182,0.25)] border-l-3 border-l-pink-400/80",
        destructive:
          "bg-red-400/25 text-red-100 shadow-[inset_0_0_12px_rgba(248,113,113,0.25)] border-l-3 border-l-red-400/80",
        success:
          "bg-emerald-400/25 text-emerald-100 shadow-[inset_0_0_12px_rgba(52,211,153,0.25)] border-l-3 border-l-emerald-400/80",
        warning:
          "bg-amber-400/25 text-amber-100 shadow-[inset_0_0_12px_rgba(251,191,36,0.25)] border-l-3 border-l-amber-400/80",
      };

      return (
        colorMap[neonColor as keyof typeof colorMap] ||
        "bg-cyan-400/25 text-cyan-100 shadow-[inset_0_0_12px_rgba(34,211,238,0.25)] border-l-3 border-l-cyan-400/80"
      );
    };

    const statusClass = error
      ? "border-destructive focus-visible:ring-destructive/50"
      : success
      ? "border-green-500 focus-visible:ring-green-500/50"
      : "";

    const displayText = () => {
      if (multiple && selectedOptions.length > 0) {
        if (selectedOptions.length === 1) {
          return selectedOptions[0].label;
        }
        return `${selectedOptions.length} selected`;
      }
      return selectedOption?.label || placeholder;
    };

    const showClear =
      clearable && ((multiple && values.length > 0) || (!multiple && value));

    return (
      <div className="space-y-2">
        {label && (
          <label className={"text-sm font-medium leading-none"}>{label}</label>
        )}

        <div ref={dropdownRef} className="relative">
          <motion.div
            ref={ref}
            className={[
              baseClasses,
              variants[variant],
              sizes[size],
              statusClass,
              isOpen &&
                isNeonVariant &&
                "shadow-[0_0_15px_rgba(34,211,238,0.3)]",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={toggleDropdown}
            initial={prefersReducedMotion ? undefined : { scale: 1 }}
            whileHover={
              prefersReducedMotion
                ? undefined
                : {
                    scale: 1.01,
                    transition: { duration: 0.2 },
                  }
            }
            {...props}
          >
            <div className="flex items-center flex-1 min-w-0">
              <span
                className={[
                  "truncate",
                  (!selectedOption && !multiple) ||
                  (multiple && selectedOptions.length === 0)
                    ? isNeonVariant
                      ? "text-opacity-70"
                      : "text-muted-foreground"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {displayText()}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {loading && (
                <Loader2
                  className={["h-4 w-4 animate-spin", getIconColor()].join(" ")}
                />
              )}

              {showClear && !loading && (
                <button
                  type="button"
                  onClick={handleClear}
                  className={[
                    "p-0.5 rounded hover:bg-accent transition-colors",
                    getIconColor(),
                  ].join(" ")}
                >
                  <X className="h-3 w-3" />
                </button>
              )}

              <ChevronDown
                className={[
                  "h-4 w-4 transition-transform duration-200",
                  isOpen && "rotate-180",
                  getIconColor(),
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
            </div>
          </motion.div>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: -10, scale: 0.95 }
                }
                animate={
                  prefersReducedMotion
                    ? { opacity: 1 }
                    : { opacity: 1, y: 0, scale: 1 }
                }
                exit={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: -10, scale: 0.95 }
                }
                transition={{ duration: 0.15 }}
                className={[
                  "absolute top-full left-0 right-0 z-50 mt-1 rounded-md shadow-lg",
                  getDropdownBgColor(),
                  getDropdownBorderColor(),
                  isNeonVariant && getDropdownShadow(),
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{ maxHeight }}
              >
                {searchable && (
                  <div
                    className={[
                      "p-2 border-b",
                      isNeonVariant
                        ? "border-b-current/20"
                        : "border-border/50",
                    ].join(" ")}
                  >
                    <div className="relative">
                      <Search
                        className={[
                          "absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4",
                          getIconColor(),
                        ].join(" ")}
                      />
                      <input
                        ref={searchRef}
                        type="text"
                        placeholder="Search options..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={[
                          "w-full pl-8 pr-3 py-2 text-sm bg-transparent border-0 focus:outline-none rounded-md",
                          isNeonVariant
                            ? `text-white placeholder:text-white/50 focus:bg-${neonColor}-400/10 focus:shadow-[inset_0_0_8px_rgba(255,255,255,0.1)]`
                            : "text-foreground placeholder:text-muted-foreground focus:bg-accent/20",
                        ].join(" ")}
                      />
                    </div>
                  </div>
                )}

                <div className="max-h-60 overflow-y-auto p-1">
                  {filteredOptions.length === 0 ? (
                    <div
                      className={[
                        "px-3 py-6 text-sm text-center rounded-md",
                        isNeonVariant
                          ? "text-white/60 bg-white/5"
                          : "text-muted-foreground",
                      ].join(" ")}
                    >
                      {searchQuery
                        ? "No options found"
                        : "No options available"}
                    </div>
                  ) : (
                    filteredOptions.map((option, index) => {
                      const isSelected = multiple
                        ? values.includes(option.value)
                        : value === option.value;
                      const isHighlighted = index === highlightedIndex;

                      return (
                        <motion.div
                          key={option.value}
                          className={[
                            "flex items-center gap-2 px-3 py-2.5 text-sm cursor-pointer rounded-md transition-all duration-200",
                            option.disabled && "opacity-50 cursor-not-allowed",
                            isSelected && getOptionSelectedStyles(),
                            isHighlighted &&
                              !option.disabled &&
                              !isSelected &&
                              getOptionHighlightedStyles(),
                            !isHighlighted &&
                              !isSelected &&
                              (isNeonVariant
                                ? `text-white/90 ${getOptionHoverStyles()}`
                                : `text-foreground ${getOptionHoverStyles()}`),
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          onClick={() =>
                            !option.disabled && handleSelect(option.value)
                          }
                          initial={
                            prefersReducedMotion ? undefined : { opacity: 0 }
                          }
                          animate={
                            prefersReducedMotion ? undefined : { opacity: 1 }
                          }
                          transition={
                            prefersReducedMotion
                              ? undefined
                              : { delay: index * 0.02 }
                          }
                        >
                          {option.icon && (
                            <div className="w-4 h-4 flex-shrink-0">
                              {option.icon}
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="truncate font-medium">
                              {option.label}
                            </div>
                            {option.description && (
                              <div
                                className={[
                                  "text-xs truncate mt-0.5",
                                  isNeonVariant
                                    ? "text-white/50"
                                    : "text-muted-foreground",
                                ].join(" ")}
                              >
                                {option.description}
                              </div>
                            )}
                          </div>

                          {isSelected && (
                            <Check
                              className={[
                                "h-4 w-4 flex-shrink-0",
                                isNeonVariant ? getIconColor() : "text-primary",
                              ].join(" ")}
                            />
                          )}
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {helperText && (
          <p
            className={[
              "text-xs",
              error
                ? "text-destructive"
                : success
                ? "text-green-600"
                : "text-muted-foreground",
            ].join(" ")}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Dropdown.displayName = "Dropdown";
// --- Dropdown component end ---

import { useState } from "react";

const basicOptions: DropdownOption[] = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" },
  { value: "option4", label: "Option 4" },
];

export default function BasicDropdowns() {
  const [selectedValue, setSelectedValue] = useState("");
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
      <Dropdown
        options={basicOptions}
        placeholder="Default dropdown..."
        label="Default"
        value={selectedValue}
        onChange={setSelectedValue}
      />
      <Dropdown
        variant="filled"
        options={basicOptions}
        placeholder="Filled dropdown..."
        label="Filled"
      />
      <Dropdown
        variant="ghost"
        options={basicOptions}
        placeholder="Ghost dropdown..."
        label="Ghost"
      />
      <Dropdown
        options={basicOptions}
        placeholder="Clearable dropdown..."
        label="Clearable"
        clearable
      />
    </div>
  );
}
