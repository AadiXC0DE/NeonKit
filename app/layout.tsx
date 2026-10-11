import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, JetBrains_Mono, Tilt_Neon } from "next/font/google";
import { AccentRestorer } from "@/components/site/accent-store";
import { siteConfig } from "@/config/site";
import "@/styles/globals.css";

const sans = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });
const neon = Tilt_Neon({ subsets: ["latin"], variable: "--font-tilt-neon", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "NeonKit — neon UI components for React",
    template: "%s · NeonKit",
  },
  description: siteConfig.description,
  keywords: ["neon", "react components", "tailwind", "shadcn", "ui library", "dark mode", "cyberpunk", "glow"],
  authors: [{ name: siteConfig.author, url: siteConfig.authorUrl }],
  creator: siteConfig.author,
  openGraph: {
    type: "website",
    url: siteConfig.url,
    siteName: "NeonKit",
    title: "NeonKit — neon UI components for React",
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: "NeonKit — neon UI components for React",
    description: siteConfig.description,
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#05060a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${neon.variable}`} suppressHydrationWarning>
      <head>
        {/* Apply a visitor's saved accent before first paint. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var a=JSON.parse(localStorage.getItem("neonkit:accent"));if(a&&a.rgb)document.documentElement.style.setProperty("--neon-accent",a.rgb)}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-dvh">
        <AccentRestorer />
        {children}
      </body>
    </html>
  );
}
