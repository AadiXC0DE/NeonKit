import { KbdCombo } from "@/components/ui/kbd";

const shortcuts = [
  { action: "Open command menu", keys: ["⌘", "K"] },
  { action: "Toggle sidebar", keys: ["⌘", "B"] },
  { action: "Copy component source", keys: ["⌘", "⇧", "C"] },
  { action: "Next example", keys: ["J"] },
  { action: "Previous example", keys: ["K"] },
  { action: "Go to settings", keys: ["G", "S"], then: true },
  { action: "Close dialog", keys: ["Esc"] },
];

export default function KbdShortcuts() {
  return (
    <div className="w-full max-w-sm overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">Keyboard shortcuts</caption>
        <thead>
          <tr className="border-b border-white/[0.06] text-left text-xs text-white/40">
            <th scope="col" className="px-4 py-2.5 font-medium">
              Action
            </th>
            <th scope="col" className="px-4 py-2.5 text-right font-medium">
              Shortcut
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.06]">
          {shortcuts.map((shortcut) => (
            <tr key={shortcut.action}>
              <td className="px-4 py-2.5 text-white/70">{shortcut.action}</td>
              <td className="px-4 py-2.5 text-right">
                <KbdCombo
                  keys={shortcut.keys}
                  size="sm"
                  separator={shortcut.then ? <span className="px-0.5 text-white/40">then</span> : null}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
