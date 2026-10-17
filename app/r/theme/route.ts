import { registryItem } from "@/components/site/theme-studio/exports";
import { decodeTheme } from "@/components/site/theme-studio/state";

/** `npx shadcn add "<site>/r/theme?a=pink&g=80"`: the Theme Studio's query string as a registry:theme item. */
export function GET(request: Request) {
  const theme = decodeTheme(new URL(request.url).searchParams);
  return Response.json(registryItem(theme), {
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" },
  });
}
