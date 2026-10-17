import { ImageResponse } from "next/og";
import { Mark, og, ogFonts } from "@/lib/og";
import { getItem, registry } from "@/registry";

export const alt = "NeonKit component";
export const size = og.size;
export const contentType = "image/png";

export function generateStaticParams() {
  return registry.map((item) => ({ slug: item.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getItem(slug);
  const name = item?.name ?? "NeonKit";
  const category = item?.category ?? "";
  // The card's fonts are subset to the text on it; spell out symbols they may not carry.
  const description = (item?.description ?? "").replace(/⌘/g, "Cmd ");
  const command = `npx shadcn@latest add @neonkit/${slug}`;
  const fonts = await ogFonts({ sans: `NeonKit${name}${description}${category}`, mono: command });
  const c = og.cyan;
  const titleSize = name.length > 20 ? 92 : name.length > 14 ? 108 : 128;

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
          background: `radial-gradient(ellipse 55% 60% at 18% 46%, rgb(${c} / 0.11), transparent 70%), ${og.page}`,
          color: og.fg,
          fontFamily: "Mona Sans",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Mark size={38} />
            <span style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.6 }}>NeonKit</span>
          </div>
          <span style={{ fontSize: 26, color: og.muted }}>{category}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* A short lit tube: the one thing on the card that glows */}
          <div
            style={{
              width: 132,
              height: 7,
              borderRadius: 4,
              marginBottom: 34,
              background: "#e4fbff",
              boxShadow: `0 0 4px rgb(${c}), 0 0 16px rgb(${c}), 0 0 40px rgb(${c} / 0.6)`,
            }}
          />
          <span style={{ fontSize: titleSize, fontWeight: 600, letterSpacing: -titleSize * 0.035, lineHeight: 1 }}>{name}</span>
          <span style={{ marginTop: 26, fontSize: 32, lineHeight: 1.4, color: og.muted, maxWidth: 1000, textWrap: "balance" }}>{description}</span>
        </div>

        <span style={{ fontFamily: "Fragment Mono", fontSize: 25, color: og.muted }}>{command}</span>
      </div>
    ),
    { ...size, fonts },
  );
}
