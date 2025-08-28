"use client";

// --- Advanced modals component start ---
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import {
  User,
  Settings,
  CreditCard,
  Bell,
  Download,
  Share2,
  Trash2,
  Edit,
  Mail,
  Phone,
  MapPin,
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

export default function AdvancedModals() {
  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = React.useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] =
    React.useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
      {/* Profile Modal */}
      <div className="space-y-2">
        <Button
          onClick={() => setIsProfileModalOpen(true)}
          className="w-full"
          variant="neon-cyan"
        >
          <User className="w-4 h-4 mr-2" />
          User Profile
        </Button>
        <Modal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          title="User Profile"
          description="Manage your account information"
          variant="neon-cyan"
          icon={<User className="w-6 h-6" />}
          size="lg"
          actions={
            <>
              <Button
                variant="ghost"
                onClick={() => setIsProfileModalOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="neon-cyan">
                <Edit className="w-4 h-4 mr-2" />
                Update Profile
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
              <div className="w-16 h-16 bg-cyan-400/20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-semibold">John Doe</h3>
                <p className="text-sm text-white/60">john.doe@example.com</p>
                <p className="text-xs text-white/40">Member since 2023</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue="John Doe"
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-sm focus:border-cyan-400/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  defaultValue="john.doe@example.com"
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-sm focus:border-cyan-400/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  defaultValue="+1 (555) 123-4567"
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-sm focus:border-cyan-400/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Location
                </label>
                <input
                  type="text"
                  defaultValue="San Francisco, CA"
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-sm focus:border-cyan-400/50 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </Modal>
      </div>

      {/* Settings Modal */}
      <div className="space-y-2">
        <Button
          onClick={() => setIsSettingsModalOpen(true)}
          className="w-full"
          variant="neon-purple"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
        <Modal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          title="Application Settings"
          description="Customize your app experience"
          variant="neon-purple"
          icon={<Settings className="w-6 h-6" />}
          size="lg"
          actions={
            <>
              <Button
                variant="ghost"
                onClick={() => setIsSettingsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="neon-purple">Save Changes</Button>
            </>
          }
        >
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="font-medium">Notifications</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Email notifications</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Push notifications</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Marketing emails</span>
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Privacy</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Show online status</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Allow message requests</span>
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Appearance</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="theme"
                    defaultChecked
                    className="text-purple-400"
                  />
                  <span className="text-sm">Dark mode</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="theme"
                    className="text-purple-400"
                  />
                  <span className="text-sm">Light mode</span>
                </label>
              </div>
            </div>
          </div>
        </Modal>
      </div>

      {/* Payment Modal */}
      <div className="space-y-2">
        <Button
          onClick={() => setIsPaymentModalOpen(true)}
          className="w-full"
          variant="neon-success"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          Payment Method
        </Button>
        <Modal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          title="Payment Information"
          description="Manage your payment methods securely"
          variant="neon-success"
          icon={<CreditCard className="w-6 h-6" />}
          size="lg"
          actions={
            <>
              <Button
                variant="ghost"
                onClick={() => setIsPaymentModalOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="neon-success">Save Payment Method</Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-emerald-400/20 rounded flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-xs text-white/60">Expires 12/26</p>
                  </div>
                </div>
                <span className="text-xs bg-emerald-400/20 text-emerald-400 px-2 py-1 rounded">
                  Default
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Add New Card</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-sm focus:border-emerald-400/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-sm focus:border-emerald-400/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-sm focus:border-emerald-400/50 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </div>

      {/* Notification Modal */}
      <div className="space-y-2">
        <Button
          onClick={() => setIsNotificationModalOpen(true)}
          className="w-full"
          variant="neon-warning"
        >
          <Bell className="w-4 h-4 mr-2" />
          Notifications
        </Button>
        <Modal
          isOpen={isNotificationModalOpen}
          onClose={() => setIsNotificationModalOpen(false)}
          title="Recent Notifications"
          description="Stay updated with your latest activities"
          variant="neon-warning"
          icon={<Bell className="w-6 h-6" />}
          size="xl"
          actions={
            <Button
              variant="neon-warning"
              onClick={() => setIsNotificationModalOpen(false)}
            >
              Mark All as Read
            </Button>
          }
        >
          <div className="space-y-3">
            {[
              {
                title: "New message from Alice",
                message: "Hey! How are you doing?",
                time: "2 minutes ago",
                unread: true,
              },
              {
                title: "Payment received",
                message: "$50.00 has been added to your account",
                time: "1 hour ago",
                unread: true,
              },
              {
                title: "System maintenance",
                message: "Scheduled maintenance on Sunday 2-4 AM PST",
                time: "3 hours ago",
                unread: false,
              },
              {
                title: "New feature available",
                message: "Try our new dark mode themes!",
                time: "1 day ago",
                unread: false,
              },
            ].map((notification, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border transition-colors ${
                  notification.unread
                    ? "bg-amber-400/10 border-amber-400/30"
                    : "bg-white/5 border-white/10"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">
                      {notification.title}
                    </h4>
                    <p className="text-xs text-white/70 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-white/50 mt-1">
                      {notification.time}
                    </p>
                  </div>
                  {notification.unread && (
                    <div className="w-2 h-2 bg-amber-400 rounded-full flex-shrink-0 mt-1" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </Modal>
      </div>
    </div>
  );
}
// --- Advanced modals component end ---
