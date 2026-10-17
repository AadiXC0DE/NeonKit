import type { ComponentDoc } from "../types";
import CommandDemo from "../examples/command/demo";
import CommandFileJump from "../examples/command/file-jump";
import CommandStatusPicker from "../examples/command/status-picker";
import CommandAsync from "../examples/command/async";

export const doc: ComponentDoc = {
  usage: `import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

<CommandDialog open={open} onOpenChange={setOpen}>
  <CommandInput placeholder="Search or jump to…" />
  <CommandList>
    <CommandEmpty>Nothing lit up.</CommandEmpty>
    <CommandGroup heading="Navigate">
      <CommandItem shortcut="G D" onSelect={goToDashboard}>Go to Dashboard</CommandItem>
    </CommandGroup>
  </CommandList>
</CommandDialog>`,
  examples: [
    {
      name: "demo",
      title: "Command palette",
      description:
        "Press ⌘J (⌘K is taken by this site's search). Try “gtd”, “rollback” or “theme”. Picking a theme re-tints the palette in place.",
      component: CommandDemo,
    },
    {
      name: "file-jump",
      title: "Inline file jumper",
      description: "Command works without the dialog. Fuzzy matching finds paths from a few letters, like “uicmd”.",
      component: CommandFileJump,
    },
    {
      name: "status-picker",
      title: "In a popover",
      description: "A searchable picker. Escape closes the popover, and number keys pick a status before you type.",
      component: CommandStatusPicker,
    },
    {
      name: "async",
      title: "Server results",
      description: "shouldFilter={false} shows results as given. CommandLoading runs a scan along the caret line.",
      component: CommandAsync,
    },
  ],
  api: [
    {
      name: "Command",
      description: "The root: ranks items, owns keyboard navigation and renders the panel. Also accepts native div attributes.",
      props: [
        { prop: "label", type: "string", description: "Accessible name for the input and the list." },
        { prop: "value", type: "string", description: "The highlighted item's value, when controlled." },
        { prop: "onValueChange", type: "(value: string) => void", description: "Called when the highlight moves, by keyboard, pointer or a new search." },
        {
          prop: "filter",
          type: "(value, search, keywords) => number",
          default: "fuzzy",
          description: "Return 0 to hide an item; higher scores rank first. The default ranks prefix, word start, acronym, substring, then subsequence.",
        },
        { prop: "shouldFilter", type: "boolean", default: "true", description: "Set false when results arrive pre-filtered, e.g. from a server." },
        { prop: "loop", type: "boolean", default: "true", description: "Arrow keys wrap from the last item to the first." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
      ],
    },
    {
      name: "CommandDialog",
      description:
        "Command inside a native modal <dialog>, 15vh from the top and up to 640px wide. Takes every Command prop too.",
      props: [
        { prop: "open", type: "boolean", description: "Controlled open state." },
        { prop: "defaultOpen", type: "boolean", default: "false", description: "Initial state when uncontrolled." },
        { prop: "onOpenChange", type: "(open: boolean) => void", description: "Called on Escape, the esc button or a click on the backdrop." },
      ],
    },
    {
      name: "CommandInput",
      description: "The search field. Also accepts native input attributes.",
      props: [
        { prop: "value", type: "string", description: "The search, when controlled." },
        { prop: "onValueChange", type: "(search: string) => void", description: "Called on every keystroke." },
        { prop: "placeholder", type: "string", default: '"Type a command or search…"', description: "Also the input's name when Command has no label." },
      ],
    },
    {
      name: "CommandItem",
      description: "One option. Also accepts native div attributes.",
      props: [
        { prop: "value", type: "string", default: "its text", description: "What the search matches and onSelect receives. The visible text stays searchable either way." },
        { prop: "keywords", type: "string[]", description: "Extra words that should find this item." },
        { prop: "onSelect", type: "(value: string) => void", description: "Called on click or Enter." },
        { prop: "disabled", type: "boolean", default: "false", description: "Shown dimmed, skipped by the keyboard, can't be selected." },
        { prop: "icon", type: "ReactNode", description: "Leading icon. Lights up while the item is highlighted." },
        {
          prop: "shortcut",
          type: "string | string[]",
          description: 'Keycaps on the right: "⌘K", "Ctrl+K", "G D" or ["⌘", "⇧", "P"]. Chords also set aria-keyshortcuts.',
        },
      ],
    },
    {
      name: "CommandList, CommandGroup, CommandEmpty, CommandLoading, CommandSeparator",
      description: "Structure. Each accepts the native attributes of its div.",
      props: [
        { prop: "CommandList", type: "listbox", description: "The scrolling results. Holds groups, items and the states below." },
        { prop: "CommandGroup heading", type: "ReactNode", description: "Labels the group. Hidden while none of its items match." },
        { prop: "CommandEmpty", type: "div", description: "Shown when nothing matches. Defaults to “Nothing lit up.”" },
        { prop: "CommandLoading", type: "div", description: "Render while fetching. Hides CommandEmpty and marks the list busy." },
        { prop: "CommandSeparator", type: "div", description: "A divider, hidden while searching because results re-order." },
      ],
    },
  ],
  notes: [
    "Follows the ARIA combobox pattern: focus stays in the input, which points at the highlighted option with aria-activedescendant.",
    "Arrow keys (or Ctrl+N and Ctrl+P) move, Alt+Arrow jumps between groups, Home and End go to the ends, Enter runs the item.",
    "Matched characters are lit in the item's text when children is a string. Custom filters still get the default highlighting.",
    "A polite live region announces the number of results, “No results” and loading.",
    "CommandDialog uses showModal(), so the page is inert, Escape closes it and focus returns to where it was.",
    "The component doesn't bind ⌘K for you: add a keydown listener (see the demo) so it doesn't fight other shortcuts on the page.",
  ],
};
