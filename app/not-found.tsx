import Link from "next/link";
import { NeonText } from "@/components/ui/neon-text";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <div className="text-center">
        <NeonText as="h1" color="red" buzz className="font-neon text-7xl sm:text-8xl">
          No Vacancy
        </NeonText>
        <p className="mt-6 font-mono text-[12px] uppercase tracking-[0.2em] text-dim">404 · this room doesn&apos;t exist</p>
        <Link
          href="/"
          className="mt-10 inline-flex h-10 items-center rounded-lg border border-line px-4 text-[14px] text-muted transition-colors hover:border-line-strong hover:text-fg"
        >
          Back to the lobby
        </Link>
      </div>
    </main>
  );
}
