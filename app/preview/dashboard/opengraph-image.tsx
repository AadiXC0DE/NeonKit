import { ImageResponse } from "next/og";
import { toNeonRgb } from "@/lib/neon";
import { brand, color } from "@/components/templates/dashboard/config";

export const alt = `${brand}: a deploy platform console`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const rgb = toNeonRgb(color);
  const neon = (alpha = 1) => `rgba(${rgb.split(" ").join(", ")}, ${alpha})`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: `radial-gradient(ellipse 70% 60% at 85% 110%, ${neon(0.22)}, transparent 70%), #05060a`,
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="64" height="64" viewBox="0 0 32 32">
            <rect x="0.5" y="0.5" width="31" height="31" rx="9" fill={neon(0.08)} stroke={neon(0.35)} />
            <path d="M9 8.5h11.5a3.75 3.75 0 0 1 0 7.5h-9a3.75 3.75 0 0 0 0 7.5H23" fill="none" stroke={neon()} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ fontSize: 40, fontWeight: 600, letterSpacing: "-0.02em" }}>{brand}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ fontSize: 84, fontWeight: 600, lineHeight: 1, letterSpacing: "-0.045em", maxWidth: 900 }}>
            Every deploy, every region, one console.
          </div>
          <div style={{ fontSize: 30, color: "rgba(255,255,255,0.62)", maxWidth: 860 }}>Live traffic, region health and rollbacks for the whole team.</div>
        </div>
        <div style={{ display: "flex", height: 4, borderRadius: 4, background: neon(), boxShadow: `0 0 24px ${neon(0.9)}, 0 0 64px ${neon(0.5)}` }} />
      </div>
    ),
    size,
  );
}
