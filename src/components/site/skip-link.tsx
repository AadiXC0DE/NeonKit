"use client";

import { usePathname } from "next/navigation";

/** First stop for keyboard users: jumps past the header to the page's <main>, wherever it is. */
export function SkipLink() {
  // Template previews and block frames bring their own skip link.
  const pathname = usePathname();
  if (pathname?.startsWith("/preview/") || pathname?.startsWith("/view/")) return null;
  return (
    <a
      href="#content"
      onClick={(event) => {
        const main = document.querySelector("main");
        if (!main) return;
        event.preventDefault();
        if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
        main.focus({ preventScroll: true });
        main.scrollIntoView();
      }}
      className="fixed left-3 top-3 z-[100] -translate-y-[200%] rounded-lg bg-[#0a0c12] px-4 py-2.5 text-[14px] font-medium text-fg shadow-[0_0_0_1px_rgb(var(--neon-accent)/0.6),0_0_24px_rgb(var(--neon-accent)/0.35)] transition-transform duration-200 ease-out-quint focus-visible:translate-y-0"
    >
      Skip to content
    </a>
  );
}
