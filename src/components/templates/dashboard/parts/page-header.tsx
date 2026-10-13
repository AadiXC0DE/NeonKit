import * as React from "react";

export function PageHeader({
  eyebrow,
  title,
  children,
  actions,
}: {
  eyebrow: React.ReactNode;
  title: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
      <div className="min-w-0">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">{eyebrow}</p>
        <h1 className="mt-2.5 text-[34px] font-semibold leading-none tracking-[-0.04em] text-white sm:text-[44px]">{title}</h1>
        {children && <div className="mt-3 max-w-[60ch] text-[15px] leading-6 text-white/60">{children}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
