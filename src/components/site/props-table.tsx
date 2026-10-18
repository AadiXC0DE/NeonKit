import type { PropRow } from "@/registry/types";

/** Splits a type at its top-level `|`, so long unions wrap between members rather than inside one. */
export function unionMembers(type: string) {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < type.length; i++) {
    const char = type[i];
    if ("([{<".includes(char)) depth++;
    else if (")]}>".includes(char) && type[i - 1] !== "=") depth--;
    else if (char === "|" && depth === 0) {
      parts.push(type.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(type.slice(start).trim());
  return parts.filter(Boolean);
}

/** `code` spans in a description become inline code; the rest stays prose. */
function Description({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("`") && part.endsWith("`") && part.length > 2 ? (
          <code key={i} className="rounded bg-white/[0.06] px-1 py-px font-mono text-[0.86em] text-fg">
            {part.slice(1, -1)}
          </code>
        ) : (
          part
        ),
      )}
    </>
  );
}

function Type({ type }: { type: string }) {
  const members = unionMembers(type);
  return (
    <code className="font-mono text-[12.75px] leading-[1.7] text-[#b7c3da]">
      {members.map((member, i) => (
        <span key={i} className="[overflow-wrap:anywhere]">
          {i > 0 && <span className="text-white/25"> | </span>}
          {/* Short members stay whole; long ones (object shapes, signatures) may wrap inside. */}
          <span className={member.length <= 24 ? "whitespace-nowrap" : undefined}>{member}</span>
          {i < members.length - 1 && <wbr />}
        </span>
      ))}
    </code>
  );
}

// A plain word such as "inherited" reads as prose; anything else is a value.
const isWord = (value: string) => /^[a-z][a-z ]*$/.test(value) && !["true", "false", "null", "undefined"].includes(value);

function Default({ value }: { value?: string }) {
  if (!value)
    return (
      <>
        <span aria-hidden className="text-white/25">
          —
        </span>
        <span className="sr-only">None</span>
      </>
    );
  if (isWord(value)) return <span className="text-[13.5px] text-muted">{value}</span>;
  return <code className="font-mono text-[12.75px] text-muted [overflow-wrap:anywhere]">{value}</code>;
}

export function PropsTable({ rows }: { rows: PropRow[] }) {
  return (
    <table className="block w-full border-collapse text-left sm:table sm:table-fixed">
      <thead className="max-sm:sr-only">
        <tr className="border-b border-white/10 text-[13px] text-muted">
          <th scope="col" className="w-[30%] py-2.5 pr-6 font-normal">
            Prop
          </th>
          <th scope="col" className="py-2.5 pr-6 font-normal">
            Type
          </th>
          <th scope="col" className="w-[18%] py-2.5 font-normal">
            Default
          </th>
        </tr>
      </thead>
      <tbody className="block sm:table-row-group">
        {rows.map((row) => (
          <tr
            key={row.prop}
            className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1.5 border-b border-white/[0.06] py-4 align-top sm:table-row sm:py-0"
          >
            <th scope="row" className="min-w-0 text-left font-normal sm:py-4 sm:pr-6">
              <code className="font-mono text-[13.5px] text-fg [overflow-wrap:anywhere]">{row.prop}</code>
            </th>
            <td className="col-span-2 row-start-2 min-w-0 sm:py-4 sm:pr-6">
              <Type type={row.type} />
              <p className="mt-1.5 max-w-[34rem] text-pretty text-[14px] leading-[1.6] text-muted">
                <Description text={row.description} />
              </p>
            </td>
            <td className="col-start-2 row-start-1 text-right sm:py-4 sm:text-left">
              <Default value={row.default} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
