"use client";

// --- Modal sizes component start ---
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import {
  Minimize2,
  Maximize2,
  Monitor,
  Smartphone,
  FileText,
  Image,
  Video,
  Music,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
} from "lucide-react";

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

export default function ModalSizes() {
  const [isSmallModalOpen, setIsSmallModalOpen] = React.useState(false);
  const [isDefaultModalOpen, setIsDefaultModalOpen] = React.useState(false);
  const [isLargeModalOpen, setIsLargeModalOpen] = React.useState(false);
  const [isExtraLargeModalOpen, setIsExtraLargeModalOpen] =
    React.useState(false);
  const [isFullModalOpen, setIsFullModalOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      {/* Small Modal */}
      <div className="space-y-2">
        <Button
          onClick={() => setIsSmallModalOpen(true)}
          className="w-full"
          variant="outline"
          size="sm"
        >
          <Minimize2 className="w-4 h-4 mr-2" />
          Small Modal (sm)
        </Button>
        <Modal
          isOpen={isSmallModalOpen}
          onClose={() => setIsSmallModalOpen(false)}
          title="Quick Notice"
          size="sm"
          actions={
            <Button size="sm" onClick={() => setIsSmallModalOpen(false)}>
              Okay
            </Button>
          }
        >
          <p className="text-sm">
            This is a small modal, perfect for quick confirmations and simple
            alerts.
          </p>
        </Modal>
      </div>

      {/* Default Modal */}
      <div className="space-y-2">
        <Button
          onClick={() => setIsDefaultModalOpen(true)}
          className="w-full"
          variant="outline"
        >
          <Monitor className="w-4 h-4 mr-2" />
          Default Modal
        </Button>
        <Modal
          isOpen={isDefaultModalOpen}
          onClose={() => setIsDefaultModalOpen(false)}
          title="Standard Information"
          description="This is the default modal size"
          size="default"
          actions={
            <>
              <Button
                variant="ghost"
                onClick={() => setIsDefaultModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setIsDefaultModalOpen(false)}>
                Confirm
              </Button>
            </>
          }
        >
          <p className="text-sm">
            The default modal size is ideal for most use cases, providing enough
            space for content while maintaining good readability on different
            screen sizes.
          </p>
        </Modal>
      </div>

      {/* Large Modal */}
      <div className="space-y-2">
        <Button
          onClick={() => setIsLargeModalOpen(true)}
          className="w-full"
          variant="outline"
        >
          <Maximize2 className="w-4 h-4 mr-2" />
          Large Modal (lg)
        </Button>
        <Modal
          isOpen={isLargeModalOpen}
          onClose={() => setIsLargeModalOpen(false)}
          title="Detailed Information"
          description="A larger modal for more complex content"
          variant="neon-cyan"
          size="lg"
          actions={
            <Button
              variant="neon-cyan"
              onClick={() => setIsLargeModalOpen(false)}
            >
              Understood
            </Button>
          }
        >
          <div className="space-y-4">
            <p className="text-sm">
              Large modals are perfect for displaying more detailed information,
              forms, or complex data that needs more breathing room.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Features</h4>
                <ul className="text-xs space-y-1">
                  <li>• More content space</li>
                  <li>• Better for forms</li>
                  <li>• Improved readability</li>
                  <li>• Flexible layouts</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Use Cases</h4>
                <ul className="text-xs space-y-1">
                  <li>• User profiles</li>
                  <li>• Settings panels</li>
                  <li>• Data entry forms</li>
                  <li>• Detailed previews</li>
                </ul>
              </div>
            </div>
          </div>
        </Modal>
      </div>

      {/* Extra Large Modal */}
      <div className="space-y-2">
        <Button
          onClick={() => setIsExtraLargeModalOpen(true)}
          className="w-full"
          variant="neon-purple"
        >
          <FileText className="w-4 h-4 mr-2" />
          Extra Large Modal (xl)
        </Button>
        <Modal
          isOpen={isExtraLargeModalOpen}
          onClose={() => setIsExtraLargeModalOpen(false)}
          title="Comprehensive Dashboard"
          description="An extra large modal for complex interfaces"
          variant="neon-purple"
          size="xl"
          icon={<FileText className="w-6 h-6" />}
          actions={
            <>
              <Button
                variant="ghost"
                onClick={() => setIsExtraLargeModalOpen(false)}
              >
                Close
              </Button>
              <Button variant="neon-purple">Save Changes</Button>
            </>
          }
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Text Content */}
              <div className="lg:col-span-2 space-y-3">
                <h3 className="font-semibold">Content Section</h3>
                <p className="text-sm">
                  Extra large modals provide ample space for complex layouts,
                  multiple sections, and detailed content. This size is ideal
                  for:
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Dashboard interfaces</li>
                  <li>• Multi-step wizards</li>
                  <li>• Data visualization</li>
                  <li>• Complex forms with multiple tabs</li>
                  <li>• Rich media previews</li>
                </ul>
              </div>

              {/* Sidebar */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Quick Actions</h4>
                <div className="space-y-2">
                  <button className="w-full p-2 text-left text-xs bg-white/5 rounded border border-white/10 hover:bg-white/10 transition-colors">
                    <FileText className="w-3 h-3 inline mr-2" />
                    Export Data
                  </button>
                  <button className="w-full p-2 text-left text-xs bg-white/5 rounded border border-white/10 hover:bg-white/10 transition-colors">
                    <Image className="w-3 h-3 inline mr-2" />
                    Generate Report
                  </button>
                  <button className="w-full p-2 text-left text-xs bg-white/5 rounded border border-white/10 hover:bg-white/10 transition-colors">
                    <Video className="w-3 h-3 inline mr-2" />
                    Record Session
                  </button>
                  <button className="w-full p-2 text-left text-xs bg-white/5 rounded border border-white/10 hover:bg-white/10 transition-colors">
                    <Music className="w-3 h-3 inline mr-2" />
                    Play Sound
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Content */}
            <div className="p-3 bg-white/5 rounded border border-white/10">
              <p className="text-xs text-white/60">
                This extra large modal demonstrates how much content can fit
                while maintaining good UX practices.
              </p>
            </div>
          </div>
        </Modal>
      </div>

      {/* Full Modal */}
      <div className="space-y-2">
        <Button
          onClick={() => setIsFullModalOpen(true)}
          className="w-full"
          variant="neon-chartreuse"
        >
          <Smartphone className="w-4 h-4 mr-2" />
          Full Screen Modal
        </Button>
        <Modal
          isOpen={isFullModalOpen}
          onClose={() => setIsFullModalOpen(false)}
          title="Full Screen Experience"
          description="Maximum space for immersive content"
          variant="neon-chartreuse"
          size="full"
          icon={<Smartphone className="w-6 h-6" />}
          actions={
            <Button
              variant="neon-chartreuse"
              onClick={() => setIsFullModalOpen(false)}
            >
              Close Full View
            </Button>
          }
        >
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="w-24 h-24 bg-lime-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-12 h-12 text-lime-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Full Screen Modal</h3>
              <p className="text-sm text-white/80 max-w-md mx-auto">
                This modal takes up the full screen space, perfect for:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                <Image className="w-8 h-8 text-lime-400 mx-auto mb-3" />
                <h4 className="font-medium text-sm mb-2">Image Galleries</h4>
                <p className="text-xs text-white/60">
                  Display large images or photo collections with maximum detail
                </p>
              </div>

              <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                <Video className="w-8 h-8 text-lime-400 mx-auto mb-3" />
                <h4 className="font-medium text-sm mb-2">Video Players</h4>
                <p className="text-xs text-white/60">
                  Full screen video playback and media controls
                </p>
              </div>

              <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                <FileText className="w-8 h-8 text-lime-400 mx-auto mb-3" />
                <h4 className="font-medium text-sm mb-2">Documents</h4>
                <p className="text-xs text-white/60">
                  Large document viewers and data visualization
                </p>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg border border-white/10 p-4">
              <h4 className="font-medium mb-3">Modal Size Guide</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                <div className="text-center p-2 bg-white/10 rounded">
                  <div className="font-medium">sm</div>
                  <div className="text-white/60">28rem (448px)</div>
                </div>
                <div className="text-center p-2 bg-white/10 rounded">
                  <div className="font-medium">default</div>
                  <div className="text-white/60">32rem (512px)</div>
                </div>
                <div className="text-center p-2 bg-white/10 rounded">
                  <div className="font-medium">lg</div>
                  <div className="text-white/60">42rem (672px)</div>
                </div>
                <div className="text-center p-2 bg-white/10 rounded">
                  <div className="font-medium">xl</div>
                  <div className="text-white/60">56rem (896px)</div>
                </div>
                <div className="text-center p-2 bg-white/20 rounded border border-lime-400/30">
                  <div className="font-medium">full</div>
                  <div className="text-white/60">95vw/95vh</div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
// --- Modal sizes component end ---
