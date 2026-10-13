"use client";

const restore = `try{var a=JSON.parse(localStorage.getItem("neonkit:accent"));if(a&&a.rgb)document.documentElement.style.setProperty("--neon-accent",a.rgb)}catch(e){}`;

/**
 * Applies a visitor's saved accent before first paint.
 *
 * It runs from the server HTML only. When React renders it in the browser (after a client-side
 * recovery, say) it becomes an inert text/plain block, which React leaves alone instead of
 * warning that a script inside a component will never run. The accent store takes over from there.
 */
export function AccentScript() {
  return (
    <script
      id="neonkit-accent"
      type={typeof window === "undefined" ? undefined : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: restore }}
    />
  );
}
