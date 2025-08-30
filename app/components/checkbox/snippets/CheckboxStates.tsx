"use client";

// --- Checkbox component start ---
import * as React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.HTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean | "indeterminate";
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "default" | "lg";
  variant?:
    | "default"
    | "neon-cyan"
    | "neon-purple"
    | "neon-chartreuse"
    | "neon-pink";
  animate?: boolean;
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  (
    {
      className,
      checked,
      defaultChecked,
      onCheckedChange,
      disabled = false,
      size = "default",
      variant = "default",
      animate = true,
      ...props
    },
    ref,
  ) => {
    const [internalChecked, setInternalChecked] = React.useState(
      defaultChecked || false,
    );
    const isControlled = checked !== undefined;
    const isChecked = isControlled ? checked : internalChecked;

    const prefersReducedMotion =
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;

    const sizes = {
      sm: "w-4 h-4",
      default: "w-5 h-5",
      lg: "w-6 h-6",
    };

    const iconSizes = {
      sm: "w-3 h-3",
      default: "w-4 h-4",
      lg: "w-5 h-5",
    };

    const variants = {
      default: {
        box: "border-slate-400 bg-transparent hover:border-slate-300",
        boxChecked: "border-slate-300 bg-slate-300",
        check: "text-white",
      },
      "neon-cyan": {
        box: "border-2 border-cyan-400/60 bg-slate-950/90 shadow-[0_0_15px_rgb(34,211,238,0.4)] hover:shadow-[0_0_20px_rgb(34,211,238,0.6)] hover:border-cyan-400",
        boxChecked:
          "border-2 border-cyan-400 bg-cyan-400 shadow-[0_0_20px_rgb(34,211,238,0.8)]",
        check: "text-white",
      },
      "neon-purple": {
        box: "border-2 border-purple-400/60 bg-slate-950/90 shadow-[0_0_15px_rgb(168,85,247,0.4)] hover:shadow-[0_0_20px_rgb(168,85,247,0.6)] hover:border-purple-400",
        boxChecked:
          "border-2 border-purple-400 bg-purple-400 shadow-[0_0_20px_rgb(168,85,247,0.8)]",
        check: "text-white",
      },
      "neon-chartreuse": {
        box: "border-2 border-lime-400/60 bg-slate-950/90 shadow-[0_0_15px_rgb(163,230,53,0.4)] hover:shadow-[0_0_20px_rgb(163,230,53,0.6)] hover:border-lime-400",
        boxChecked:
          "border-2 border-lime-400 bg-lime-400 shadow-[0_0_20px_rgb(163,230,53,0.8)]",
        check: "text-white",
      },
      "neon-pink": {
        box: "border-2 border-pink-400/60 bg-slate-950/90 shadow-[0_0_15px_rgb(244,114,182,0.4)] hover:shadow-[0_0_20px_rgb(244,114,182,0.6)] hover:border-pink-400",
        boxChecked:
          "border-2 border-pink-400 bg-pink-400 shadow-[0_0_20px_rgb(244,114,182,0.8)]",
        check: "text-white",
      },
    };

    const handleClick = () => {
      if (disabled) return;

      const newChecked = isChecked === true ? false : true;

      if (isControlled) {
        onCheckedChange?.(newChecked);
      } else {
        setInternalChecked(newChecked);
        onCheckedChange?.(newChecked);
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleClick();
      }
    };

    const checkContent = (
      <motion.div
        initial={false}
        animate={{
          scale: isChecked ? 1 : 0,
          opacity: isChecked ? 1 : 0,
        }}
        transition={{ duration: animate && !prefersReducedMotion ? 0.15 : 0 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Check className={cn(iconSizes[size], variants[variant].check)} />
      </motion.div>
    );

    const indeterminateContent = (
      <motion.div
        initial={false}
        animate={{
          scale: isChecked === "indeterminate" ? 1 : 0,
          opacity: isChecked === "indeterminate" ? 1 : 0,
        }}
        transition={{ duration: animate && !prefersReducedMotion ? 0.15 : 0 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div
          className={cn(
            "w-2/3 h-0.5 rounded-full",
            variant === "default" ? "bg-white" : "bg-white",
          )}
        />
      </motion.div>
    );

    const boxContent = (
      <div
        className={cn(
          "relative inline-flex items-center justify-center rounded border-2 transition-all duration-200 ease-in-out cursor-pointer",
          sizes[size],
          isChecked === true
            ? variants[variant].boxChecked
            : variants[variant].box,
          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
      >
        {checkContent}
        {indeterminateContent}
      </div>
    );

    return (
      <button
        ref={ref}
        type="button"
        role="checkbox"
        aria-checked={isChecked === "indeterminate" ? "mixed" : isChecked}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          "inline-flex items-center focus:outline-none",
          disabled && "cursor-not-allowed",
        )}
        {...props}
      >
        {boxContent}
      </button>
    );
  },
);

Checkbox.displayName = "Checkbox";
// --- Checkbox component end ---

export default function CheckboxStatesPreview() {
  const [permissions, setPermissions] = React.useState({
    read: true,
    write: false,
    delete: false,
  });

  const [selectAll, setSelectAll] = React.useState(false);
  const [selectedItems, setSelectedItems] = React.useState({
    item1: false,
    item2: false,
    item3: false,
  });

  const updatePermission = (key: keyof typeof permissions) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const updateItem = (key: keyof typeof selectedItems) => {
    setSelectedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const allSelected = Object.values(selectedItems).every(Boolean);
  const someSelected =
    Object.values(selectedItems).some(Boolean) && !allSelected;

  const toggleAll = () => {
    const newValue = !selectAll;
    setSelectAll(newValue);
    setSelectedItems({
      item1: newValue,
      item2: newValue,
      item3: newValue,
    });
  };

  return (
    <div className="space-y-8 w-full max-w-lg">
      <div className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">
            User Permissions:
          </h4>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={permissions.read}
                onCheckedChange={() => updatePermission("read")}
                variant="neon-cyan"
              />
              <label className="text-sm font-medium">Read Access</label>
              <span className="text-xs text-muted-foreground">
                View files and folders
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                checked={permissions.write}
                onCheckedChange={() => updatePermission("write")}
                variant="neon-purple"
              />
              <label className="text-sm font-medium">Write Access</label>
              <span className="text-xs text-muted-foreground">
                Create and edit files
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                checked={permissions.delete}
                onCheckedChange={() => updatePermission("delete")}
                variant="neon-pink"
              />
              <label className="text-sm font-medium">Delete Access</label>
              <span className="text-xs text-muted-foreground">
                Remove files and folders
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">
            Bulk Selection with Indeterminate State:
          </h4>

          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 border border-border rounded-lg">
              <Checkbox
                checked={
                  allSelected ? true : someSelected ? "indeterminate" : false
                }
                onCheckedChange={toggleAll}
                variant="neon-chartreuse"
              />
              <label className="text-sm font-medium">Select All Items</label>
            </div>

            <div className="ml-6 space-y-2">
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={selectedItems.item1}
                  onCheckedChange={() => updateItem("item1")}
                  variant="neon-cyan"
                />
                <label className="text-sm">Item 1</label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={selectedItems.item2}
                  onCheckedChange={() => updateItem("item2")}
                  variant="neon-purple"
                />
                <label className="text-sm">Item 2</label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={selectedItems.item3}
                  onCheckedChange={() => updateItem("item3")}
                  variant="neon-pink"
                />
                <label className="text-sm">Item 3</label>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">
            Disabled States:
          </h4>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <Checkbox disabled variant="neon-cyan" />
              <label className="text-sm text-muted-foreground">
                Disabled Unchecked
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox disabled defaultChecked variant="neon-purple" />
              <label className="text-sm text-muted-foreground">
                Disabled Checked
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
