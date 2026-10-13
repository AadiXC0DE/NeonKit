import type { TerminalLine } from "@/components/ui/terminal";

export type CoverArt = "route" | "tokens" | "wave" | "type";

export type Project = {
  slug: string;
  client: string;
  year: number;
  title: string;
  role: string;
  outcome: string;
  cover: CoverArt;
  team: string;
  duration: string;
  stack: string[];
  stats: { value: string; label: string }[];
  problem: string;
  work: string[];
  result: string;
};

export const projects: Project[] = [
  {
    slug: "ferrybook",
    client: "Ferrybook",
    year: 2026,
    title: "A water taxi in two taps",
    role: "Product design, front end",
    outcome: "Booking went from six taps to two. Mobile conversion up 31%.",
    cover: "route",
    team: "Me, two mobile engineers, a PM",
    duration: "14 weeks",
    stack: ["React Native", "TypeScript", "Reanimated"],
    stats: [
      { value: "+31%", label: "Mobile conversion" },
      { value: "19 s", label: "Median booking, from 74 s" },
      { value: "60 fps", label: "On a 2021 budget Android" },
    ],
    problem:
      "Ferrybook asked for a pier, a destination, a time, a passenger count and a card before it told you whether a boat was coming. Half the people who opened it standing on a pier gave up and phoned the dispatcher instead.",
    work: [
      "Replaced the form with the river: tap the pier you're on, tap where you're going.",
      "Moved the price up front and repriced it live as you drag the passenger count.",
      "Built the booking sheet and the live boat tracker myself, tuned on the slowest phone in the office.",
    ],
    result:
      "Median booking time dropped from 74 to 19 seconds. Phone bookings fell by a third in the first month, which the dispatchers noticed before the dashboard did.",
  },
  {
    slug: "northdeck",
    client: "Northdeck",
    year: 2025,
    title: "One design system for nine teams",
    role: "Design system lead",
    outcome: "46 components, one token set. New screens ship in four days, not three weeks.",
    cover: "tokens",
    team: "Four engineers, one designer",
    duration: "2 years",
    stack: ["React", "CSS variables", "Figma variables", "Codemods"],
    stats: [
      { value: "46", label: "Components, down from 212 patterns" },
      { value: "4 days", label: "Design to production, from 3 weeks" },
      { value: "9 / 9", label: "Teams on the current version" },
    ],
    problem:
      "Nine product teams, four button styles, and a shared library nobody trusted enough to upgrade. Every new screen started with a debate about which spacing scale was the real one.",
    work: [
      "Audited 212 screens and cut the UI down to 46 components, each with real usage behind it.",
      "Wrote the tokens once and generated the Figma variables, CSS and native themes from them.",
      "Shipped a codemod with every breaking change, so an upgrade was a pull request instead of a sprint.",
    ],
    result:
      "Within two quarters all nine teams were on the current release. Median time from approved design to production for a new screen went from three weeks to four days.",
  },
  {
    slug: "ondo",
    client: "Ondo Radio",
    year: 2025,
    title: "A player that starts before you blink",
    role: "Design engineer",
    outcome: "Press play to sound in 0.6 s, down from 2.4 s, in a 9 KB player.",
    cover: "wave",
    team: "Me and their one backend engineer",
    duration: "8 weeks",
    stack: ["Preact", "Web Audio", "Service worker"],
    stats: [
      { value: "0.6 s", label: "Play to sound, from 2.4 s" },
      { value: "9 KB", label: "Player, gzipped" },
      { value: "1.2M", label: "Monthly listeners" },
    ],
    problem:
      "A community station with a loyal audience and a web player that loaded a 400 KB framework, two ad scripts and a cookie wall before it would make a sound.",
    work: [
      "Rewrote the player as a 9 KB island that warms the stream connection on hover.",
      "Drew a live waveform from the Web Audio analyser instead of a looping GIF.",
      "Kept the now-playing card readable at arm's length, for people cooking with it on.",
    ],
    result:
      "Time from pressing play to hearing sound fell from 2.4 to 0.6 seconds at the median. Average listening sessions grew 22% in the first six weeks.",
  },
  {
    slug: "verso",
    client: "Verso",
    year: 2024,
    title: "A reading view people stay in",
    role: "Interaction design, prototyping",
    outcome: "Median reading session up from 4 to 11 minutes.",
    cover: "type",
    team: "Me, an editor, two engineers",
    duration: "5 months",
    stack: ["SwiftUI", "React", "Prototypes in code"],
    stats: [
      { value: "11 min", label: "Median session, from 4" },
      { value: "38", label: "Coded prototypes" },
      { value: "3", label: "Platforms, one reading engine" },
    ],
    problem:
      "Verso publishes 8,000-word features and lost most readers by the second screen. The app was a news feed wearing a magazine's clothes.",
    work: [
      "Built 38 coded prototypes of the reading view and tested them with subscribers on the train.",
      "Set the type for each screen size by hand, then wrote the rules down for the engineers.",
      "Added a quiet position marker that syncs between phone and laptop, so a long read survives the commute.",
    ],
    result:
      "The median reading session went from four minutes to eleven. Finished articles per subscriber doubled, and the editors started commissioning longer pieces again.",
  },
];

export type Job = {
  period: string;
  dateTime: string;
  company: string;
  title: string;
  place: string;
  note: string;
  current?: boolean;
};

export const experience: Job[] = [
  {
    period: "2024 – now",
    dateTime: "2024",
    company: "Independent",
    title: "Design engineer",
    place: "Rotterdam",
    note: "A studio of one. Product teams bring me in for the stretch between the design file and production.",
    current: true,
  },
  {
    period: "2021 – 2024",
    dateTime: "2021",
    company: "Northdeck",
    title: "Staff design engineer",
    place: "Rotterdam",
    note: "Led the design system and the front-end platform team: four engineers, one designer, 46 components.",
  },
  {
    period: "2018 – 2021",
    dateTime: "2018",
    company: "Lumen Mobility",
    title: "Senior front-end engineer",
    place: "Utrecht",
    note: "Built the rider app's web views and the fleet dashboard. Learned to love maps and to fear time zones.",
  },
  {
    period: "2015 – 2018",
    dateTime: "2015",
    company: "Studio Brandwerk",
    title: "Interaction designer",
    place: "Amsterdam",
    note: "Campaign sites, two museum installations, and a ticket kiosk that still runs in a train station.",
  },
  {
    period: "2011 – 2015",
    dateTime: "2011",
    company: "Academy of Art & Design",
    title: "BA Interaction Design",
    place: "Rotterdam",
    note: "Graduated with a working pinball machine about bureaucracy. It scored you on forms filed.",
  },
];

export type Post = {
  slug: string;
  title: string;
  date: string;
  dateLabel: string;
  minutes: number;
  excerpt: string;
  body: string[];
};

export const posts: Post[] = [
  {
    slug: "focus-states",
    title: "What a neon sign taught me about focus states",
    date: "2026-09-18",
    dateLabel: "18 Sep 2026",
    minutes: 6,
    excerpt: "Light should mean something. Notes from a weekend bending glass with a sign maker in Schiedam.",
    body: [
      "A sign maker doesn't light a tube because it looks nice. Every lit letter is a decision about where your eye goes first, and a sign with everything lit says nothing at all.",
      "Most interfaces I audit glow everywhere: every card has a shadow, every button a gradient, and the one thing that should catch your eye, the focused field, gets a two-pixel outline in a colour nobody can see.",
      "So I've started treating light as a budget. Resting UI is unlit glass. Focus, selection and the one thing I want you to do next get the light. It's a simple rule, and it's made my reviews much shorter.",
    ],
  },
  {
    slug: "handoff",
    title: "The handoff is the bug",
    date: "2026-06-02",
    dateLabel: "2 Jun 2026",
    minutes: 9,
    excerpt: "Every gap between a design file and a pull request is a place where details go to die.",
    body: [
      "The easing curve, the 13px label, the empty state for the empty state: none of them survive a handoff. They're too small to argue for in a ticket and too fiddly to rebuild from a screenshot.",
      "The fix isn't a better spec. It's fewer handoffs. Put the person who cares about the detail in the codebase, or put the codebase in front of the person who cares.",
    ],
  },
  {
    slug: "old-android",
    title: "Designing for the phone in the drawer",
    date: "2026-03-11",
    dateLabel: "11 Mar 2026",
    minutes: 7,
    excerpt: "Most of your users aren't on your phone. A field guide to testing on a slow device.",
    body: [
      "Keep a five-year-old budget Android in your desk drawer, charged, with your app on it. Open it every time you're about to say an animation feels smooth.",
      "Half of the Ferrybook redesign came from that phone. The other half came from watching people use it with gloves on.",
    ],
  },
  {
    slug: "two-curves",
    title: "Two curves are enough",
    date: "2025-11-20",
    dateLabel: "20 Nov 2025",
    minutes: 5,
    excerpt: "Why I keep one curve for things arriving and one for things leaving, and delete the other forty.",
    body: [
      "Things that arrive should decelerate: they're landing. Things that leave should accelerate: they're getting out of your way. That's the whole system.",
      "Every product I join has a motion file with forty curves in it. We usually keep two.",
    ],
  },
];

export const nowWords = [
  "writing a 3 KB spring library.",
  "learning Dutch, slowly.",
  "restoring a 1974 Batavus.",
  "booking spring 2027.",
];

export const nowSession: TerminalLine[] = [
  { kind: "input", text: "juno now" },
  { kind: "output", text: "building  spring, a 3 KB motion lib" },
  { kind: "output", text: "reading   a 1961 railway sign manual" },
  { kind: "output", text: "fixing    a 1974 Batavus, slowly" },
  { kind: "output", text: "learning  Dutch (B1, allegedly)" },
  { kind: "input", text: "juno next", delay: 900 },
  { kind: "success", text: "Mar 2027  one team, 12 weeks" },
];
