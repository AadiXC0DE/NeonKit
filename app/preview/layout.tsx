import type { Metadata } from "next";
import { FrameControl } from "@/components/site/frame-control";

// Template previews only. Installed templates set their own metadata.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FrameControl />
      {children}
    </>
  );
}
