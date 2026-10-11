export const siteConfig = {
  name: "NeonKit",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://get-neonkit.vercel.app").replace(/\/$/, ""),
  github: "https://github.com/AadiXC0DE/NeonKit",
  author: "AadiXC0DE",
  authorUrl: "https://github.com/AadiXC0DE",
  description:
    "Neon UI components for React and Tailwind. Copy them in, or add them with the shadcn CLI. One CSS variable sets the color.",
};

export const registryUrl = (name: string) => `${siteConfig.url}/r/${name}.json`;
