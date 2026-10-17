import { neonVars } from "@/lib/neon";
import { color } from "./config";
import { fonts } from "./fonts";
import { Footer } from "./footer";
import { Navbar } from "./navbar";

/** The frame every Nightshift page shares: color, navbar, main landmark and footer. */
export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      // The template's one color, set once. Everything inside inherits it.
      style={neonVars(color)}
      className={`${fonts} relative min-h-screen overflow-x-clip bg-[#05060a] text-white antialiased`}
    >
      <a
        href="#main"
        className="fixed left-3 top-3 z-50 -translate-y-20 rounded-lg bg-[rgb(var(--neon))] px-4 py-2 text-sm font-medium text-[#05060a] transition-transform focus:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer />
    </div>
  );
}
