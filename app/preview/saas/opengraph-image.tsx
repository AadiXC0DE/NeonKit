import { ImageResponse } from "next/og";
import { toNeonRgb } from "@/lib/neon";
import { brand, color } from "@/components/templates/saas/config";

export const alt = "Nightshift: deploys that land at 2am";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const rgb = toNeonRgb(color).split(" ").join(", ");
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: `radial-gradient(ellipse 60% 55% at 50% 42%, rgba(${rgb}, 0.22), #05060a 70%)`,
        backgroundColor: "#05060a",
        color: "white",
      }}
    >
      <div
        style={{
          display: "flex",
          padding: "28px 72px",
          borderRadius: 40,
          border: `3px solid rgba(${rgb}, 0.55)`,
          boxShadow: `0 0 40px rgba(${rgb}, 0.45), inset 0 0 40px rgba(${rgb}, 0.25)`,
          fontSize: 150,
          fontWeight: 300,
          letterSpacing: -2,
          color: "#fde8fc",
        }}
      >
        {brand.toLowerCase()}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 56,
          fontSize: 44,
          fontWeight: 600,
          letterSpacing: -1,
          color: "rgba(255,255,255,0.92)",
        }}
      >
        Deploys that land at 2am.
      </div>
      <div style={{ display: "flex", marginTop: 16, fontSize: 24, color: "rgba(255,255,255,0.6)" }}>
        Queue it, close the laptop, read the report with coffee.
      </div>
    </div>,
    size,
  );
}
