import { ImageResponse } from "next/og";
import { toNeonRgb } from "@/lib/neon";
import { availability, brand, city, color, role } from "@/components/templates/portfolio/config";

export const alt = `${brand}, ${role.toLowerCase()} in ${city}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const channels = toNeonRgb(color).split(" ").map(Number);
  const rgb = channels.join(",");
  // The tube's hot core: the color pushed most of the way to white.
  const core = channels.map((c) => Math.round(c * 0.3 + 255 * 0.7)).join(",");
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: `radial-gradient(ellipse 70% 60% at 38% 42%, rgba(${rgb},0.14), #05060a 68%)`,
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, color: "rgba(255,255,255,0.65)" }}>
          {`${role} in ${city}`}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 150,
            letterSpacing: -2,
            color: `rgb(${core})`,
            textShadow: `0 0 6px rgba(255,255,255,0.9), 0 0 24px rgb(${rgb}), 0 0 70px rgba(${rgb},0.7)`,
          }}
        >
          {brand}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30, color: "rgba(255,255,255,0.8)" }}>
          <div style={{ width: 14, height: 14, borderRadius: 999, background: `rgb(${rgb})`, boxShadow: `0 0 16px rgb(${rgb})` }} />
          {availability}
        </div>
      </div>
    ),
    size,
  );
}
