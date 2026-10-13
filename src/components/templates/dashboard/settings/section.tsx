import * as React from "react";
import { cn } from "@/lib/utils";

export function Section({
  id,
  title,
  description,
  children,
  className,
}: {
  id: string;
  title: string;
  description: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      aria-labelledby={id}
      className={cn("grid gap-5 border-t border-white/[0.06] py-8 first:border-t-0 first:pt-2 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12", className)}
    >
      <div>
        <h2 id={id} className="text-[15px] font-semibold tracking-[-0.01em] text-white">
          {title}
        </h2>
        <div className="mt-1.5 max-w-[48ch] text-[13px] leading-5 text-white/60">{description}</div>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6", className)}>{children}</div>;
}
