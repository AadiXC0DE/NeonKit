"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/button";
import { ArrowLeft, ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const componentCategories = [
  {
    title: "Form Components",
    items: [
      {
        name: "Button",
        href: "/components",
        description: "Interactive buttons with multiple variants",
      },
      {
        name: "Input",
        href: "/components/input",
        description: "Text inputs with enhanced features",
      },
      {
        name: "Textarea",
        href: "/components/textarea",
        description: "Multi-line text input",
      },
      {
        name: "Dropdown",
        href: "/components/dropdown",
        description: "Select dropdowns with neon effects",
      },
    ],
  },
  {
    title: "Layout Components",
    items: [
      {
        name: "Card",
        href: "/components/card",
        description: "Content containers",
      },
      {
        name: "Container",
        href: "/components/container",
        description: "Layout containers",
        disabled: true,
      },
    ],
  },
  {
    title: "Feedback Components",
    items: [
      {
        name: "Alert",
        href: "/components/alert",
        description: "Alert messages and notifications",
        disabled: false,
      },
      {
        name: "Modal",
        href: "/components/modal",
        description: "Modal dialogs with neon effects",
        disabled: false,
      },
      {
        name: "Toast",
        href: "/components/toast",
        description: "Notification toasts",
        disabled: true,
      },
    ],
  },
];

function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 h-full bg-background border-r border-border">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <Home className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="font-semibold text-lg">Components</h2>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 space-y-6 overflow-y-auto h-[calc(100vh-120px)]">
        {/* Installation - Top Priority */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3 px-2">
            Getting Started
          </h3>
          <div className="space-y-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 }}
            >
              <Link
                href="/setup"
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group",
                  pathname === "/setup"
                    ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30"
                    : "hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">Installation</div>
                  <div
                    className={cn(
                      "text-xs",
                      pathname === "/setup"
                        ? "text-neon-cyan/70"
                        : "text-muted-foreground",
                    )}
                  >
                    Setup guide & dependencies
                  </div>
                </div>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-transform",
                    pathname === "/setup"
                      ? "rotate-90"
                      : "group-hover:translate-x-1",
                  )}
                />
              </Link>
            </motion.div>
          </div>
        </div>

        {componentCategories.map((category, categoryIndex) => (
          <div key={category.title}>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 px-2">
              {category.title}
            </h3>
            <div className="space-y-1">
              {category.items.map((item) => {
                const isActive = pathname === item.href;
                const isDisabled = "disabled" in item ? item.disabled : false;

                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: categoryIndex * 0.1 + 0.1 }}
                  >
                    {isDisabled ? (
                      <div className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground/50 cursor-not-allowed">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{item.name}</div>
                          <div className="text-xs text-muted-foreground/50">
                            Coming soon
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group",
                          isActive
                            ? "bg-accent/50 text-accent-foreground border border-border/50"
                            : "hover:bg-accent hover:text-accent-foreground",
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{item.name}</div>
                          <div
                            className={cn(
                              "text-xs",
                              isActive
                                ? "text-accent-foreground/70"
                                : "text-muted-foreground",
                            )}
                          >
                            {item.description}
                          </div>
                        </div>
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 transition-transform",
                            isActive
                              ? "rotate-90"
                              : "group-hover:translate-x-1",
                          )}
                        />
                      </Link>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Quick Links */}
        <div className="pt-6 border-t border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 px-2">
            Quick Links
          </h3>
          <div className="space-y-1">
            <Link
              href="/components/colors"
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">Color System</div>
                <div className="text-xs text-muted-foreground">
                  Custom colors guide
                </div>
              </div>
            </Link>
            <Link
              href="/components/examples"
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">Examples</div>
                <div className="text-xs text-muted-foreground">
                  Component combinations
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                NeonKit
              </span>
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Components</span>
          </div>
          <div className="ml-auto">
            {/* Dark mode only - no theme toggle needed */}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
