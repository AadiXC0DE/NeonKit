import * as React from "react";
import { cn } from "@/lib/utils";

/** The display face for page titles: Mona Sans pulled wide, like the lettering on a rack label. */
export const display = "[font-stretch:112%] font-[620] tracking-[-0.038em] leading-[0.98]";

export function PageHeader({
  title,
  children,
  status,
  actions,
  className,
}: {
  /** The h1. Say what the page knows, not what it's called: the breadcrumb already names it. */
  title: React.ReactNode;
  /** One or two sentences under the title. */
  children?: React.ReactNode;
  /** A live line under the copy, such as the environment and its clock. */
  status?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-x-10 gap-y-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end", className)}>
      <div className="min-w-0">
        <h1 className={cn(display, "max-w-[20ch] text-balance text-[32px] text-white sm:text-[44px] xl:text-[52px]")}>{title}</h1>
        {children && <div className="mt-4 max-w-[58ch] text-pretty text-[15px] leading-6 text-white/60 sm:text-base sm:leading-[1.6]">{children}</div>}
        {status && <div className="mt-4 text-[13px] text-white/60">{status}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 lg:pb-1">{actions}</div>}
    </div>
  );
}
