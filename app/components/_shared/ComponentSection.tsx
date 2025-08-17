"use client";

import { useState } from "react";
import { Copy, Check, Code, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export function ComponentSection({
  title,
  description,
  preview,
  code,
  filePathLabel,
}: {
  title: string;
  description: string;
  preview: React.ReactNode;
  code: string;
  filePathLabel: string;
}) {
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <div className="flex items-center gap-1 p-1 bg-muted rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("preview")}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-colors",
            activeTab === "preview"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Eye className="w-4 h-4 mr-2 inline" />
          Preview
        </button>
        <button
          onClick={() => setActiveTab("code")}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-colors",
            activeTab === "code"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Code className="w-4 h-4 mr-2 inline" />
          Code
        </button>
      </div>

      <div className="border rounded-lg">
        {activeTab === "preview" ? (
          <div
            className="p-8 bg-gradient-to-br from-background to-muted/20"
            style={{ overflow: "visible" }}
          >
            <div
              className="flex items-center justify-center min-h-[200px]"
              style={{ overflow: "visible" }}
            >
              {preview}
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="flex items-center justify-between p-4 border-b bg-muted/50">
              <span className="text-sm font-medium">{filePathLabel}</span>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-3 py-1 rounded-md bg-background border hover:bg-accent transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-sm bg-background">
              <code>{code}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
