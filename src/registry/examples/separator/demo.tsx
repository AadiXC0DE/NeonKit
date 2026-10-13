import { Separator } from "@/components/ui/separator";

type Message = { author: string; initials: string; time: string; text: string };

const yesterday: Message[] = [
  { author: "Mara Okafor", initials: "MO", time: "6:42 PM", text: "Pushed the new pricing table to staging. Can someone sanity-check the annual toggle?" },
  { author: "Theo Lindqvist", initials: "TL", time: "7:05 PM", text: "Looks right to me. The yearly total rounds down on the Team plan though." },
];

const unread: Message[] = [
  { author: "Mara Okafor", initials: "MO", time: "9:12 AM", text: "Fixed the rounding. Totals now come straight from the billing API." },
  { author: "Iris Chen", initials: "IC", time: "9:20 AM", text: "Approved. Shipping it with the 2.4 release this afternoon." },
];

function Thread({ messages }: { messages: Message[] }) {
  return (
    <ul className="grid gap-4">
      {messages.map((message) => (
        <li key={message.time} className="flex gap-3">
          <span
            aria-hidden
            className="grid size-8 shrink-0 place-items-center rounded-full bg-white/[0.06] text-[11px] font-medium text-white/70"
          >
            {message.initials}
          </span>
          <div className="min-w-0">
            <p className="text-sm">
              <span className="font-medium text-white/90">{message.author}</span>{" "}
              <span className="text-xs text-white/40">{message.time}</span>
            </p>
            <p className="text-sm leading-6 text-white/65">{message.text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function SeparatorDemo() {
  return (
    <div className="grid w-full max-w-md gap-5">
      <Separator label="Yesterday" decorative={false} />
      <Thread messages={yesterday} />
      <Separator variant="tube" label="2 new messages" decorative={false} />
      <Thread messages={unread} />
    </div>
  );
}
