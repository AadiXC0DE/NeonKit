import { ImageResponse } from "next/og";
import { getItem, registry } from "@/registry";

export const alt = "NeonKit component";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return registry.map((item) => ({ slug: item.slug }));
}

const cyan = "34 211 238";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getItem(slug);
  const name = item?.name ?? "NeonKit";

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
          background: "radial-gradient(ellipse 80% 70% at 30% 45%, #0f1a22, #05060a 70%)",
          color: "#e8edf5",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 24, color: "#5a6276", letterSpacing: 4 }}>
          <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
            <rect x="3" y="3" width="26" height="26" rx="4.5" stroke={`rgb(${cyan})`} strokeWidth="2.6" />
            <path d="M11 22V10l10 12V10" stroke={`rgb(${cyan})`} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>{`NEONKIT · ${(item?.category ?? "").toUpperCase()}`}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <span
            style={{
              fontSize: 132,
              letterSpacing: -5,
              lineHeight: 1,
              color: "#dcf9fd",
              textShadow: `0 0 6px rgb(${cyan}), 0 0 28px rgb(${cyan}), 0 0 70px rgb(${cyan} / 0.55)`,
            }}
          >
            {name}
          </span>
          <span style={{ fontSize: 34, color: "#8a93a6", maxWidth: 980 }}>{item?.description ?? ""}</span>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#5a6276", fontFamily: "monospace" }}>
          {`npx shadcn@latest add @neonkit/${slug}`}
        </div>
      </div>
    ),
    size,
  );
}
