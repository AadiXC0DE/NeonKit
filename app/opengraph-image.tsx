import { ImageResponse } from "next/og";
import { icons } from "@/components/ui/icons";
import { Screw, inventory, og, ogFonts } from "@/lib/og";
import { blocks, templates } from "@/registry";
import { siteConfig } from "@/config/site";

export const alt = "NeonKit: neon UI components for React and Tailwind";
export const size = og.size;
export const contentType = "image/png";

export default async function OpengraphImage() {
  const line = "Neon UI components for React and Tailwind.";
  const count = `${inventory(blocks.length, templates.length, Object.keys(icons).length)}. MIT.`;
  const host = siteConfig.url.replace(/^https?:\/\//, "");
  const fonts = await ogFonts({ sign: "neonkit", sans: line + count, mono: host });
  const c = og.cyan;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "64px 72px 56px",
          background: `radial-gradient(ellipse 62% 52% at 50% 36%, rgb(${c} / 0.16), transparent 72%), radial-gradient(ellipse 80% 70% at 50% 40%, #0e1119, ${og.page} 72%)`,
          color: og.fg,
          fontFamily: "Mona Sans",
        }}
      >
        {/* The sign, on its backplate */}
        <div
          style={{
            position: "relative",
            display: "flex",
            padding: "4px 64px 26px",
            borderRadius: 34,
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: `inset 0 1px 0 rgb(${c} / 0.18)`,
          }}
        >
          <Screw style={{ left: 16, top: 16 }} />
          <Screw style={{ right: 16, top: 16 }} />
          <Screw style={{ left: 16, bottom: 16 }} />
          <Screw style={{ right: 16, bottom: 16 }} />
          <span
            style={{
              fontFamily: "Tilt Neon",
              fontSize: 196,
              lineHeight: 1.12,
              color: "#e4fbff",
              textShadow: `0 0 4px rgb(${c}), 0 0 18px rgb(${c}), 0 0 46px rgb(${c} / 0.75), 0 0 110px rgb(${c} / 0.45)`,
            }}
          >
            neonkit
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: 10 }}>
          <span style={{ fontSize: 40, fontWeight: 600, letterSpacing: -1.2, color: og.fg }}>{line}</span>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <span style={{ fontSize: 27, color: og.muted }}>{count}</span>
            <span style={{ fontFamily: "Fragment Mono", fontSize: 23, color: og.muted }}>{host}</span>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
