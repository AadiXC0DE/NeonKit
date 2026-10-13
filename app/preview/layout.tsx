import type { Metadata } from "next";

// Template previews only. Installed templates set their own metadata.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
