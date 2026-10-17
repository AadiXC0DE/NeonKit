import { ScrollArea } from "@/components/ui/scroll-area";

const log = `14:02:11.204  Cloning github.com/halcyon/web (branch: main, commit: 8f3a2c1)
14:02:12.880  Restored build cache from previous deployment (1.4 GB) in 2.1s
14:02:13.016  Running "npm ci --prefer-offline --no-audit --fund=false"
14:02:21.442  added 1,204 packages in 8s
14:02:21.590  Running "next build"
14:02:23.118  ▲ Next.js 16.4.0  ·  Turbopack  ·  experimental: ppr, reactCompiler
14:02:35.731  ✓ Compiled successfully in 12.6s
14:02:35.902  Linting and checking validity of types ...
14:02:44.207  ✓ Generating static pages (312/312)
14:02:44.560  Route (app)                                   Size     First Load JS
14:02:44.561  ┌ ○ /                                         6.2 kB          118 kB
14:02:44.561  ├ ○ /components/[slug]                        9.8 kB          131 kB
14:02:44.562  ├ ƒ /api/registry/[name]                      0 B             102 kB
14:02:44.562  └ ○ /docs/theming                             3.1 kB          115 kB
14:02:45.010  Collected 18 serverless functions (largest: api/registry/[name], 1.9 MB)
14:02:46.333  Uploading build outputs to fra1, iad1, hnd1 ...
14:02:59.020  Deployment ready in 47.8s → https://web-8f3a2c1-halcyon.neon.app`;

export default function ScrollAreaBuildLog() {
  return (
    <ScrollArea
      orientation="both"
      scrollbar="auto"
      aria-label="Build log"
      className="h-64 w-full max-w-xl rounded-xl border border-white/10 bg-[#07080c]"
    >
      <pre className="p-4 pb-5 pr-5 font-mono text-xs leading-6 text-white/65">{log}</pre>
    </ScrollArea>
  );
}
