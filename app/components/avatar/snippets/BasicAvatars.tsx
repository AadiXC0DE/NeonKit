"use client";

// --- Avatar component start ---
import * as React from "react";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string | React.ReactNode;
  size?: "sm" | "default" | "lg" | "xl";
  variant?:
    | "default"
    | "neon-cyan"
    | "neon-purple"
    | "neon-chartreuse"
    | "neon-pink";
  animate?: boolean;
  showBorder?: boolean;
  status?: "online" | "offline" | "away" | "busy";
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      className,
      src,
      alt = "",
      fallback,
      size = "default",
      variant = "default",
      animate = true,
      showBorder = true,
      status,
      ...props
    },
    ref,
  ) => {
    const prefersReducedMotion =
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;

    const [imageLoaded, setImageLoaded] = React.useState(false);
    const [imageError, setImageError] = React.useState(false);

    const sizes = {
      sm: "w-6 h-6",
      default: "w-10 h-10",
      lg: "w-12 h-12",
      xl: "w-16 h-16",
    };

    const statusSizes = {
      sm: "w-2 h-2",
      default: "w-3 h-3",
      lg: "w-3 h-3",
      xl: "w-4 h-4",
    };

    const variants = {
      default: showBorder ? "border-2 border-slate-600" : "",
      "neon-cyan": showBorder
        ? "border-2 border-cyan-300 bg-gradient-to-br from-slate-950/95 to-slate-900/95 shadow-[0_0_20px_rgb(34,211,238,0.5),inset_0_1px_3px_rgb(34,211,238,0.2)] hover:shadow-[0_0_30px_rgb(34,211,238,0.7),inset_0_1px_4px_rgb(34,211,238,0.3)] hover:border-cyan-200 hover:scale-105 backdrop-blur-sm transition-all duration-300"
        : "",
      "neon-purple": showBorder
        ? "border-2 border-purple-300 bg-gradient-to-br from-slate-950/95 to-slate-900/95 shadow-[0_0_20px_rgb(168,85,247,0.5),inset_0_1px_3px_rgb(168,85,247,0.2)] hover:shadow-[0_0_30px_rgb(168,85,247,0.7),inset_0_1px_4px_rgb(168,85,247,0.3)] hover:border-purple-200 hover:scale-105 backdrop-blur-sm transition-all duration-300"
        : "",
      "neon-chartreuse": showBorder
        ? "border-2 border-lime-300 bg-gradient-to-br from-slate-950/95 to-slate-900/95 shadow-[0_0_20px_rgb(163,230,53,0.5),inset_0_1px_3px_rgb(163,230,53,0.2)] hover:shadow-[0_0_30px_rgb(163,230,53,0.7),inset_0_1px_4px_rgb(163,230,53,0.3)] hover:border-lime-200 hover:scale-105 backdrop-blur-sm transition-all duration-300"
        : "",
      "neon-pink": showBorder
        ? "border-2 border-pink-300 bg-gradient-to-br from-slate-950/95 to-slate-900/95 shadow-[0_0_20px_rgb(244,114,182,0.5),inset_0_1px_3px_rgb(244,114,182,0.2)] hover:shadow-[0_0_30px_rgb(244,114,182,0.7),inset_0_1px_4px_rgb(244,114,182,0.3)] hover:border-pink-200 hover:scale-105 backdrop-blur-sm transition-all duration-300"
        : "",
    };

    const statusColors = {
      online: "bg-green-400",
      offline: "bg-gray-400",
      away: "bg-yellow-400",
      busy: "bg-red-400",
    };

    const getFallback = () => {
      if (fallback) {
        if (typeof fallback === "string") {
          return (
            <div className="flex items-center justify-center w-full h-full bg-slate-700 text-slate-300 font-medium">
              {fallback.charAt(0).toUpperCase()}
            </div>
          );
        }
        return fallback;
      }

      return (
        <div className="flex items-center justify-center w-full h-full bg-slate-700 text-slate-300">
          <User className="w-1/2 h-1/2" />
        </div>
      );
    };

    const content = (
      <div
        className={cn(
          "relative inline-block rounded-full overflow-hidden bg-slate-800",
          sizes[size],
          variants[variant],
          className,
        )}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          getFallback()
        )}

        {status && (
          <div
            className={cn(
              "absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-slate-900",
              statusSizes[size],
              statusColors[status],
            )}
          />
        )}
      </div>
    );

    if (!animate || prefersReducedMotion) {
      return (
        <div
          ref={ref}
          {...Object.fromEntries(
            Object.entries(props).filter(
              ([key]) =>
                !key.startsWith("onAnimation") &&
                !key.startsWith("onTransition"),
            ),
          )}
        >
          {content}
        </div>
      );
    }

    return (
      <motion.div
        ref={ref}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        {...Object.fromEntries(
          Object.entries(props).filter(
            ([key]) =>
              !key.startsWith("onAnimation") && !key.startsWith("onTransition"),
          ),
        )}
      >
        {content}
      </motion.div>
    );
  },
);

Avatar.displayName = "Avatar";
// --- Avatar component end ---

export default function BasicAvatarsPreview() {
  return (
    <div className="space-y-8 w-full max-w-lg">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
            alt="User"
          />
          <div>
            <p className="font-medium">John Doe</p>
            <p className="text-sm text-muted-foreground">With profile image</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Avatar fallback="JD" />
          <div>
            <p className="font-medium">Jane Doe</p>
            <p className="text-sm text-muted-foreground">
              With initials fallback
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Avatar />
          <div>
            <p className="font-medium">Anonymous User</p>
            <p className="text-sm text-muted-foreground">
              Default icon fallback
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">
          Team Members:
        </h4>
        <div className="flex -space-x-2">
          <Avatar src="https://images.unsplash.com/photo-1494790108755-2616b612b1b3?w=40&h=40&fit=crop&crop=face" />
          <Avatar fallback="SM" />
          <Avatar src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" />
          <Avatar fallback="AC" />
          <Avatar />
        </div>
      </div>
    </div>
  );
}
