import type { Metadata, Viewport } from "next";
import Script from "next/script";
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
    default: siteConfig.title,
    template: "%s · NeonKit",
  },
  description: siteConfig.description,
  applicationName: "NeonKit",
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.author.name, url: siteConfig.author.site }],
  creator: siteConfig.author.name,
  publisher: siteConfig.author.name,
  category: "technology",
  alternates: {
    types: { "text/plain": [{ url: "/llms.txt", title: "LLM-friendly docs" }] },
  },
  openGraph: {
    type: "website",
    url: siteConfig.url,
    siteName: "NeonKit",
    locale: "en_US",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    site: `@${siteConfig.author.handle}`,
    creator: `@${siteConfig.author.handle}`,
    title: siteConfig.title,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
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
      <body className="min-h-dvh">
        {/* Apply a visitor's saved accent before first paint. */}
        <Script id="neonkit-accent" strategy="beforeInteractive">
          {`try{var a=JSON.parse(localStorage.getItem("neonkit:accent"));if(a&&a.rgb)document.documentElement.style.setProperty("--neon-accent",a.rgb)}catch(e){}`}
        </Script>
        <AccentRestorer />
        {children}
      </body>
    </html>
  );
}
