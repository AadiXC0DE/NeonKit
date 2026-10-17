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
        justifyContent: "space-between",
        padding: "64px 80px",
        // The only light in the room comes from the hour.
        background: `radial-gradient(ellipse 30% 34% at 50% 61%, rgba(${rgb}, 0.18), #05060a 100%)`,
        backgroundColor: "#05060a",
        color: "white",
      }}
    >
      <div style={{ display: "flex", fontSize: 28, fontWeight: 600, letterSpacing: -0.5, color: "rgba(255,255,255,0.9)" }}>
        {brand}
      </div>
      <div style={{ display: "flex", flexDirection: "column", fontSize: 128, fontWeight: 700, letterSpacing: -5, lineHeight: 0.95 }}>
        <div style={{ display: "flex" }}>Deploys that</div>
        <div style={{ display: "flex" }}>
          land at&nbsp;
          <span
            style={{
              color: "#fde8fc",
              fontWeight: 400,
              letterSpacing: -1,
              textShadow: `0 0 4px rgba(${rgb}, 1), 0 0 18px rgba(${rgb}, 0.9), 0 0 36px rgba(${rgb}, 0.45)`,
            }}
          >
            2am
          </span>
        </div>
      </div>
      <div style={{ display: "flex", fontSize: 26, color: "rgba(255,255,255,0.6)" }}>
        Queue it, close the laptop, read the report with coffee.
      </div>
    </div>,
    size,
  );
}
