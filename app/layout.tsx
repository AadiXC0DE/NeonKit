import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NeonKit - Futuristic UI Components",
  description:
    "A sleek, futuristic UI component library with subtle neon accents. Copy and paste beautiful JSX components with Tailwind classes directly into your project.",
  keywords: [
    "UI components",
    "React",
    "TypeScript",
    "Neon",
    "Design System",
    "Tailwind CSS",
    "Dark Mode",
    "Component Library",
  ],
  authors: [{ name: "NeonKit Team" }],
  creator: "NeonKit Team",
  publisher: "NeonKit",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "NeonKit - Futuristic UI Components",
    description:
      "A sleek, futuristic UI component library with subtle neon accents. Copy and paste beautiful JSX components with Tailwind classes.",
    url: "https://neonkit.dev",
    siteName: "NeonKit",
    images: [
      {
        url: "/Neonkitlogo.png",
        width: 1200,
        height: 630,
        alt: "NeonKit Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NeonKit - Futuristic UI Components",
    description:
      "A sleek, futuristic UI component library with subtle neon accents. Copy and paste beautiful JSX components.",
    images: ["/Neonkitlogo.png"],
    creator: "@neonkit",
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-site-verification-code", // Replace with actual code
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
