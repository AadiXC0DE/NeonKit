import type { PropRow } from "@/registry/types";

export function PropsTable({ rows }: { rows: PropRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[560px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-line bg-white/[0.02] font-mono text-[11px] uppercase tracking-[0.12em] text-dim">
            <th className="px-4 py-2.5 font-normal">Prop</th>
            <th className="px-4 py-2.5 font-normal">Type</th>
            <th className="px-4 py-2.5 font-normal">Default</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.prop} className="border-b border-line align-top last:border-0">
              <td className="px-4 py-3">
                <code className="font-mono text-[13px] text-fg">{row.prop}</code>
              </td>
              <td className="px-4 py-3">
                <code className="font-mono text-[12.5px] text-[#b8a6fb]">{row.type}</code>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{row.description}</p>
              </td>
              <td className="px-4 py-3">
                <code className="font-mono text-[12.5px] text-muted">{row.default ?? "—"}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
