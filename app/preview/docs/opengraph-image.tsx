import { ImageResponse } from "next/og";

import { brand, color, version } from "@/components/templates/docs/config";
import { toNeonRgb } from "@/lib/neon";

export const alt = `${brand} docs: containers from your lockfile, without a daemon`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const rgb = toNeonRgb(color).split(" ").join(",");
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
          background: "#05060a",
          backgroundImage: `radial-gradient(ellipse 70% 60% at 85% 0%, rgba(${rgb},0.22), transparent 70%)`,
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 6,
              borderRadius: 6,
              background: `rgb(${rgb})`,
              boxShadow: `0 0 18px rgba(${rgb},0.9), 0 0 48px rgba(${rgb},0.5)`,
            }}
          />
          <div style={{ fontSize: 30, letterSpacing: -1, fontWeight: 600 }}>{`${brand.toLowerCase()} docs`}</div>
          <div
            style={{
              marginLeft: 8,
              padding: "6px 14px",
              borderRadius: 999,
              border: `1px solid rgba(${rgb},0.4)`,
              color: `rgb(${rgb})`,
              fontSize: 20,
            }}
          >
            {`v${version}`}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 84, fontWeight: 600, letterSpacing: -3.5, lineHeight: 1 }}>
            Containers from your lockfile.
          </div>
          <div style={{ fontSize: 32, color: "rgba(255,255,255,0.62)" }}>
            One 9.4 MB binary. No daemon, no root, your Dockerfiles as they are.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
