"use client";

// --- Basic modals component start ---
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  variant?:
    | "default"
    | "neon-cyan"
    | "neon-purple"
    | "neon-chartreuse"
    | "neon-pink"
    | "neon-destructive"
    | "neon-success"
    | "neon-warning";
  size?: "sm" | "default" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      description,
      children,
      variant = "default",
      size = "default",
      showCloseButton = true,
      closeOnOverlayClick = true,
      closeOnEscape = true,
      className,
      overlayClassName,
      contentClassName,
      icon,
      actions,
      footer,
      ...props
    },
    ref,
  ) => {
    const modalRef = React.useRef<HTMLDivElement>(null);
    const prefersReducedMotion =
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;

    // Handle escape key
    React.useEffect(() => {
      if (!closeOnEscape || !isOpen) return;

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          onClose();
        }
      };

      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose, closeOnEscape]);

    // Handle overlay click
    const handleOverlayClick = (event: React.MouseEvent) => {
      if (!closeOnOverlayClick) return;
      if (event.target === event.currentTarget) {
        onClose();
      }
    };

    const isNeonVariant = variant?.startsWith("neon-");
    const neonColor = isNeonVariant ? variant.split("-")[1] : null;

    const getModalStyles = () => {
      if (!isNeonVariant) return "bg-background border border-border";

      const colorMap = {
        cyan: "bg-slate-950/95 border-2 border-cyan-400/50 backdrop-blur-xl shadow-[0_0_50px_rgba(34,211,238,0.3)]",
        purple:
          "bg-slate-950/95 border-2 border-purple-400/50 backdrop-blur-xl shadow-[0_0_50px_rgba(168,85,247,0.3)]",
        chartreuse:
          "bg-slate-950/95 border-2 border-lime-400/50 backdrop-blur-xl shadow-[0_0_50px_rgba(163,230,53,0.3)]",
        pink: "bg-slate-950/95 border-2 border-pink-400/50 backdrop-blur-xl shadow-[0_0_50px_rgba(244,114,182,0.3)]",
        destructive:
          "bg-slate-950/95 border-2 border-red-400/50 backdrop-blur-xl shadow-[0_0_50px_rgba(248,113,113,0.3)]",
        success:
          "bg-slate-950/95 border-2 border-emerald-400/50 backdrop-blur-xl shadow-[0_0_50px_rgba(52,211,153,0.3)]",
        warning:
          "bg-slate-950/95 border-2 border-amber-400/50 backdrop-blur-xl shadow-[0_0_50px_rgba(251,191,36,0.3)]",
      };

      return (
        colorMap[neonColor as keyof typeof colorMap] ||
        "bg-background border border-border"
      );
    };

    const getTextColor = () => {
      if (!isNeonVariant) return "text-foreground";
      return "text-white";
    };

    const getTitleColor = () => {
      if (!isNeonVariant) return "text-foreground";
      return "text-white font-semibold";
    };

    const getDescriptionColor = () => {
      if (!isNeonVariant) return "text-muted-foreground";
      return "text-white/80";
    };

    const getCloseButtonColor = () => {
      if (!isNeonVariant) return "text-muted-foreground hover:text-foreground";
      return "text-white/60 hover:text-white";
    };

    const getOverlayStyles = () => {
      if (!isNeonVariant) return "bg-black/50 backdrop-blur-sm";
      return "bg-black/60 backdrop-blur-md";
    };

    const sizes = {
      sm: "max-w-md",
      default: "max-w-lg",
      lg: "max-w-2xl",
      xl: "max-w-4xl",
      full: "max-w-[95vw] max-h-[95vh]",
    };

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

    const getDefaultIcon = () => {
      if (!isNeonVariant) return null;

      const iconMap = {
        destructive: <AlertCircle className="h-6 w-6" />,
        success: <CheckCircle className="h-6 w-6" />,
        warning: <AlertTriangle className="h-6 w-6" />,
        cyan: <Info className="h-6 w-6" />,
        purple: <Info className="h-6 w-6" />,
        chartreuse: <Info className="h-6 w-6" />,
        pink: <Info className="h-6 w-6" />,
      };

      return iconMap[neonColor as keyof typeof iconMap] || null;
    };

    const displayIcon = icon || getDefaultIcon();

    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "fixed inset-0 z-50 flex items-center justify-center p-4",
                getOverlayStyles(),
                overlayClassName,
              )}
              onClick={handleOverlayClick}
            >
              {/* Modal */}
              <motion.div
                ref={modalRef}
                initial={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.95, y: 20 }
                }
                animate={
                  prefersReducedMotion
                    ? { opacity: 1 }
                    : { opacity: 1, scale: 1, y: 0 }
                }
                exit={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.95, y: 20 }
                }
                transition={{
                  duration: 0.2,
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
                className={cn(
                  "relative w-full rounded-lg shadow-lg",
                  getModalStyles(),
                  sizes[size],
                  className,
                )}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                {(title || showCloseButton) && (
                  <div className="flex items-start justify-between p-6 pb-4">
                    <div className="flex items-center gap-3">
                      {displayIcon && (
                        <div className={cn("flex-shrink-0", getIconColor())}>
                          {displayIcon}
                        </div>
                      )}
                      <div>
                        {title && (
                          <h2
                            className={cn(
                              "text-lg font-semibold leading-none tracking-tight",
                              getTitleColor(),
                            )}
                          >
                            {title}
                          </h2>
                        )}
                        {description && (
                          <p
                            className={cn(
                              "text-sm mt-1",
                              getDescriptionColor(),
                            )}
                          >
                            {description}
                          </p>
                        )}
                      </div>
                    </div>
                    {showCloseButton && (
                      <button
                        onClick={onClose}
                        className={cn(
                          "rounded-md p-1 transition-colors hover:bg-accent/50",
                          getCloseButtonColor(),
                        )}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}

                {/* Content */}
                {children && (
                  <div
                    className={cn(
                      "px-6 pb-6",
                      title || showCloseButton ? "pt-0" : "pt-6",
                      getTextColor(),
                      contentClassName,
                    )}
                  >
                    {children}
                  </div>
                )}

                {/* Actions */}
                {actions && (
                  <div className="flex items-center justify-end gap-3 px-6 pb-6">
                    {actions}
                  </div>
                )}

                {/* Footer */}
                {footer && (
                  <div
                    className={cn(
                      "px-6 py-4 border-t",
                      isNeonVariant ? "border-white/10" : "border-border",
                      footer,
                    )}
                  >
                    {footer}
                  </div>
                )}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  },
);

Modal.displayName = "Modal";

export default function BasicModals() {
  const [isBasicModalOpen, setIsBasicModalOpen] = React.useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      {/* Basic Modal */}
      <div className="space-y-2">
        <Button
          onClick={() => setIsBasicModalOpen(true)}
          className="w-full"
          variant="outline"
        >
          Open Basic Modal
        </Button>
        <Modal
          isOpen={isBasicModalOpen}
          onClose={() => setIsBasicModalOpen(false)}
          title="Basic Modal"
          description="This is a simple modal with basic styling and functionality."
        >
          <p className="text-sm text-muted-foreground">
            Modals are great for displaying important information, getting user
            confirmation, or showing additional content without navigating away
            from the current page.
          </p>
        </Modal>
      </div>

      {/* Confirmation Modal */}
      <div className="space-y-2">
        <Button
          onClick={() => setIsConfirmModalOpen(true)}
          className="w-full"
          variant="outline"
        >
          Open Confirmation Modal
        </Button>
        <Modal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          title="Confirm Action"
          description="Are you sure you want to proceed with this action?"
          actions={
            <>
              <Button
                variant="ghost"
                onClick={() => setIsConfirmModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Handle confirmation
                  setIsConfirmModalOpen(false);
                }}
              >
                Confirm
              </Button>
            </>
          }
        >
          <p className="text-sm">
            This action cannot be undone. Please confirm that you want to
            continue.
          </p>
        </Modal>
      </div>

      {/* Alert Modal */}
      <div className="space-y-2">
        <Button
          onClick={() => setIsAlertModalOpen(true)}
          className="w-full"
          variant="outline"
        >
          Open Alert Modal
        </Button>
        <Modal
          isOpen={isAlertModalOpen}
          onClose={() => setIsAlertModalOpen(false)}
          title="Important Notice"
          description="Please read this important information carefully."
        >
          <div className="space-y-3">
            <p className="text-sm">
              This is an alert modal that displays important information to the
              user.
            </p>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Alerts should be used for important notifications</li>
              <li>They typically require user acknowledgment</li>
              <li>Use appropriate styling for different alert types</li>
            </ul>
          </div>
        </Modal>
      </div>
    </div>
  );
}
// --- Basic modals component end ---
