import type { Metadata } from "next";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { ThemeStudio } from "@/components/site/theme-studio/studio";
import { decodeTheme } from "@/components/site/theme-studio/state";

export const metadata: Metadata = {
  title: "Theme Studio",
  description:
    "Retune NeonKit's 11-color palette, glow intensity, corner radius, surface and motion on live components, then install the theme with one shadcn command.",
  alternates: { canonical: "/theme" },
};

export default async function ThemePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const theme = decodeTheme(await searchParams);
  return (
    <>
      <SiteHeader />
      <main id="content">
        <ThemeStudio initial={theme} />
      </main>
      <SiteFooter />
    </>
  );
}
