import Link from "next/link";
import { registry } from "@/registry";
import { SectionHeading } from "./section-heading";

export function Directory() {
  const half = Math.ceil(registry.length / 2);
  const columns = [registry.slice(0, half), registry.slice(half)];

  return (
    <section id="directory" className="mx-auto max-w-[88rem] px-4 py-20 sm:px-6 sm:py-28">
      <SectionHeading index="04" label="Directory" title={<>Every floor,<br className="hidden sm:block" /> one board.</>}>
        {registry.length} components. Each one is a single file with its source, examples and props on its own page.
      </SectionHeading>

      <div className="relative overflow-hidden rounded-2xl border border-line bg-[#07080d] shadow-[inset_0_1px_0_rgb(255_255_255/0.04),inset_0_0_80px_rgb(0_0_0/0.6)]">
        <div className="flex items-center justify-between border-b border-line px-5 py-3 font-mono text-[10.5px] uppercase tracking-[0.2em] text-dim">
          <span>NeonKit · Building directory</span>
          <span className="hidden sm:inline">Open 24/7</span>
        </div>
        <div className="grid md:grid-cols-2 md:divide-x md:divide-line">
          {columns.map((column, c) => (
            <ul key={c} className="py-2">
              {column.map((item, i) => {
                const n = c * half + i + 1;
                return (
                  <li key={item.slug}>
                    <Link
                      href={`/components/${item.slug}`}
                      className="group flex items-baseline gap-3 px-5 py-2.5 font-mono text-[13px] uppercase tracking-[0.08em] outline-none focus-visible:bg-white/[0.03]"
                    >
                      <span className="w-6 shrink-0 tabular-nums text-dim">{String(n).padStart(2, "0")}</span>
                      <span className="text-white/80 transition-[color,text-shadow] duration-150 group-hover:neon-text group-focus-visible:neon-text">
                        {item.name}
                      </span>
                      <span
                        aria-hidden
                        className="relative top-[-3px] h-px flex-1 bg-[radial-gradient(circle,rgb(255_255_255/0.18)_1px,transparent_1.5px)] bg-[length:6px_1px] transition-opacity group-hover:opacity-0"
                      />
                      <span className="hidden text-[11px] text-dim transition-colors group-hover:text-muted sm:inline">
                        {item.category}
                      </span>
                      {item.isNew && (
                        <span className="text-[10px] text-[rgb(var(--neon-accent))]">new</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
