import { ImageResponse } from "next/og";

import { color, event } from "@/components/templates/launch/config";
import { toNeonRgb } from "@/lib/neon";

export const alt = "Low Light 2027: interface craft, after dark. Rotterdam, 19 March 2027.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const STATUS = "NOW BOARDING";

export default function OpengraphImage() {
  const neon = toNeonRgb(color);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: `radial-gradient(ellipse 55% 45% at 32% 88%, rgb(${neon} / 0.2), #05060a 75%)`,
          color: "#f3f1f5",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, letterSpacing: 5, color: "#8a8796" }}>
          <span>{`${event.city.toUpperCase()} · 19 MARCH 2027`}</span>
          <span>{`DOORS 18:30 · ${event.venue.toUpperCase()}`}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 132, fontWeight: 700, letterSpacing: -6, lineHeight: 0.95 }}>Low Light 2027</span>
          <span style={{ marginTop: 18, fontSize: 52, letterSpacing: -1.5, color: "#7d7a88" }}>Interface craft, after dark.</span>
        </div>

        <div style={{ display: "flex", gap: 7 }}>
          {Array.from(STATUS).map((char, index) => (
            <div
              key={index}
              style={{
                width: 58,
                height: 78,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 7,
                background: "linear-gradient(to bottom, #1d2029 50%, #121419 50%)",
                fontSize: 50,
                fontWeight: 700,
                color: `rgb(${neon})`,
                textShadow: `0 0 18px rgb(${neon} / 0.8)`,
              }}
            >
              {char}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
