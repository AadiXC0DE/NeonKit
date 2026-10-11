export const siteConfig = {
  name: "NeonKit",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://get-neonkit.vercel.app").replace(/\/$/, ""),
  title: "NeonKit — neon UI components for React and Tailwind",
  description:
    "Neon UI components for React and Tailwind CSS. 26 accessible, copy-paste components with a glow, one CSS variable for color, installable with the shadcn CLI.",
  keywords: [
    "neon ui",
    "neon react components",
    "tailwind neon",
    "shadcn registry",
    "shadcn neon",
    "glow button",
    "dark mode components",
    "cyberpunk ui",
    "synthwave ui",
    "react component library",
    "tailwind css components",
    "copy paste components",
    "nextjs ui",
  ],
  github: "https://github.com/AadiXC0DE/NeonKit",
  issues: "https://github.com/AadiXC0DE/NeonKit/issues",
  author: {
    name: "Aaditya Chowdhury",
    handle: "AadiChowdhury7",
    github: "https://github.com/AadiXC0DE",
    x: "https://x.com/AadiChowdhury7",
    site: "https://heyaadi.com",
  },
  sponsor: {
    github: "https://github.com/sponsors/AadiXC0DE",
    coffee: "https://www.buymeacoffee.com/AadiChowdhury7",
  },
};

export const registryUrl = (name: string) => `${siteConfig.url}/r/${name}.json`;

export const shareOnX = (text: string, url = siteConfig.url) =>
  `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
