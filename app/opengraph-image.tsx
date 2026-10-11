import { ImageResponse } from "next/og";
import { registry } from "@/registry";

export const alt = "NeonKit — neon UI components for React";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const cyan = "34 211 238";

export default function OpengraphImage() {
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
          background: "radial-gradient(ellipse 70% 60% at 50% 42%, #0f1a22, #05060a 70%)",
          color: "#e8edf5",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: "#5a6276", letterSpacing: 4 }}>
          <span>NEON UI FOR REACT</span>
          <span>{`${registry.length} COMPONENTS · MIT`}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          <svg width="150" height="150" viewBox="0 0 32 32" fill="none">
            <rect x="3" y="3" width="26" height="26" rx="4.5" stroke={`rgb(${cyan})`} strokeWidth="2.6" />
            <path d="M11 22V10l10 12V10" stroke={`rgb(${cyan})`} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="3" y="3" width="26" height="26" rx="4.5" stroke="white" strokeOpacity="0.85" strokeWidth="0.9" />
            <path d="M11 22V10l10 12V10" stroke="white" strokeOpacity="0.85" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span
            style={{
              fontSize: 170,
              letterSpacing: -4,
              color: "#d9f8fd",
              textShadow: `0 0 6px rgb(${cyan}), 0 0 24px rgb(${cyan}), 0 0 60px rgb(${cyan} / 0.6)`,
            }}
          >
            neonkit
          </span>
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "#8a93a6", maxWidth: 900 }}>
          Calm at rest, lit when it matters. Copy them in or add them with the shadcn CLI.
        </div>
      </div>
    ),
    size,
  );
}
