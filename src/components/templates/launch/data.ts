export type Room = "Main hall" | "Cellar" | "Foyer";

export type Speaker = {
  id: string;
  name: string;
  role: string;
  company: string;
  city: string;
  talk: string;
};

export type Slot = {
  id: string;
  /** Local time in Rotterdam, 24h. */
  start: string;
  end: string;
  kind: "doors" | "talk" | "workshop" | "break" | "panel";
  title: string;
  speaker?: string;
  room: Room;
  note: string;
};

export type Tier = {
  id: "floor" | "late" | "stream";
  name: string;
  price: string;
  detail: string;
  stock: string;
  soldOut?: boolean;
  gate: string;
  seat: string;
};

export const speakers: Speaker[] = [
  { id: "ines", name: "Ines Morales", role: "Design engineer", company: "Halyard", city: "Lisbon", talk: "Shadows that behave" },
  { id: "kenji", name: "Kenji Aoyama", role: "Type designer", company: "Kasumi Type", city: "Osaka", talk: "Type at four pixels" },
  { id: "priya", name: "Priya Raman", role: "Motion lead", company: "Orrery", city: "London", talk: "Easing curves by ear" },
  { id: "aleksander", name: "Aleksander Nowak", role: "Performance engineer", company: "Railyard", city: "Kraków", talk: "The 100 ms budget" },
  { id: "amara", name: "Amara Okoye", role: "Product designer", company: "Tramline", city: "Lagos", talk: "Designing for one hand" },
  { id: "lotte", name: "Lotte Verbeek", role: "Colour scientist", company: "Studio Grauw", city: "Rotterdam", talk: "Colour in the dark" },
  { id: "samir", name: "Samir Haddad", role: "Interaction designer", company: "Fieldwork", city: "Montréal", talk: "Motion you don't notice" },
  { id: "joris", name: "Joris van Damme", role: "Host", company: "Low Light", city: "Rotterdam", talk: "Why we keep the lights low" },
];

export const agenda: Slot[] = [
  { id: "doors", start: "18:30", end: "19:15", kind: "doors", title: "Doors, coats and badges", room: "Foyer", note: "Badges at Gate K. The bar opens with the doors." },
  { id: "opening", start: "19:15", end: "19:30", kind: "talk", title: "Why we keep the lights low", speaker: "joris", room: "Main hall", note: "Fifteen minutes on the house rules: no slides over 40 words, no pitches, questions on cards." },
  { id: "shadows", start: "19:30", end: "20:00", kind: "talk", title: "Shadows that behave", speaker: "ines", room: "Main hall", note: "How Halyard rebuilt elevation with two shadows instead of eleven, and why the dark theme came out better for it." },
  { id: "type", start: "20:00", end: "20:30", kind: "talk", title: "Type at four pixels", speaker: "kenji", room: "Main hall", note: "Hinting, optical sizes and the 11 px table label that took a month to get right." },
  { id: "interval", start: "20:30", end: "21:00", kind: "break", title: "Interval and late kitchen", room: "Foyer", note: "Bao, dal, and a cheese toastie people still write to us about." },
  { id: "easing", start: "20:30", end: "21:15", kind: "workshop", title: "Easing curves by ear", speaker: "priya", room: "Cellar", note: "Bring a laptop. 30 seats, first come. Twelve transitions, tuned until nobody notices them." },
  { id: "budget", start: "21:00", end: "21:30", kind: "talk", title: "The 100 ms budget", speaker: "aleksander", room: "Main hall", note: "Where the time goes between a tap and a response, measured on a four-year-old Android." },
  { id: "one-hand", start: "21:30", end: "22:00", kind: "talk", title: "Designing for one hand", speaker: "amara", room: "Main hall", note: "Tramline's ticket flow, redesigned for a commuter holding a coffee and a strap. Late passes come in." },
  { id: "colour", start: "22:00", end: "22:30", kind: "talk", title: "Colour in the dark", speaker: "lotte", room: "Main hall", note: "Why your accent looks louder at night, and the four contrast checks that catch it." },
  { id: "motion", start: "22:30", end: "23:00", kind: "talk", title: "Motion you don't notice", speaker: "samir", room: "Main hall", note: "Fieldwork cut every animation over 250 ms for a month. Here's what people missed and what they didn't." },
  { id: "panel", start: "23:00", end: "23:45", kind: "panel", title: "What we'd delete", speaker: "joris", room: "Main hall", note: "Every speaker, one feature they'd remove from their own product. The stream ends at 23:45; the bar runs till 01:00." },
];

export const rooms = ["Main hall", "Cellar", "Foyer"] as const;

export const tiers: Tier[] = [
  {
    id: "floor",
    name: "Floor",
    price: "€149",
    detail: "A seat for every talk, dinner at the interval, the after-bar.",
    stock: "Sold out",
    soldOut: true,
    gate: "K",
    seat: "F 12",
  },
  {
    id: "late",
    name: "Late pass",
    price: "€39",
    detail: "From 21:30: the last three talks, the panel and the bar.",
    stock: "54 left",
    gate: "K",
    seat: "Balcony",
  },
  {
    id: "stream",
    name: "Stream",
    price: "Free",
    detail: "Every talk live with captions, and the replay the week after.",
    stock: "No limit",
    gate: "Online",
    seat: "Anywhere",
  },
];

export const waitlist = {
  /** Returned floor seats released so far, which is also the number now being called. */
  called: 63,
  /** People in line when the page loads. */
  inLine: 1184,
  /** Places a referral moves you up. */
  bump: 10,
  /** A fixed rhythm of new arrivals, so the counter ticks the same way on every load. */
  arrivals: [1, 0, 0, 2, 1, 0, 1, 0, 3, 1],
};

export const replay = {
  runtime: "4h 12m",
  talks: 8,
  watched: "2,904",
};

export const travel = [
  { id: "metro", mode: "Metro", time: "9 min", route: "Lines D or E from Rotterdam Centraal to Rijnhaven, then six minutes on foot over the Rijnhavenbrug." },
  { id: "water", mode: "Water taxi", time: "4 min", route: "From the Erasmusbrug pier to Katendrecht. Runs until 01:00; we'll have two on standby after the panel." },
  { id: "bike", mode: "Bike", time: "140 racks", route: "Covered racks on the quay. The OV-fiets rental at Centraal is a twelve-minute ride away." },
  { id: "train", mode: "From Schiphol", time: "26 min", route: "Intercity direct to Rotterdam Centraal every ten minutes, then the metro." },
];

export const venueNotes = [
  "Step-free from the quay, with a lift to the balcony",
  "Live captions on the screen and on the stream",
  "A quiet room upstairs, lights genuinely low",
  "Coat check is free; the cloakroom closes at 01:15",
];

export const faqs = [
  {
    id: "stream",
    q: "Is it streamed?",
    a: "Every talk goes out live with captions, free, no sign-up. The workshop in the Cellar isn't filmed; the replay of everything else lands the week after.",
  },
  {
    id: "waitlist",
    q: "How does the waitlist work?",
    a: "Returned floor seats go out in the order of the numbers we hand out. When yours comes up we email you, and you have 24 hours to claim it before it moves on. Each person who joins through your link moves you up ten places.",
  },
  {
    id: "late",
    q: "What does a late pass get me?",
    a: "Entry from 21:30: the last three talks, the panel and the bar until 01:00. It's a balcony standing ticket, so the view is good and the seats are few.",
  },
  {
    id: "transfer",
    q: "Can I give my ticket to someone else?",
    a: "Yes. Change the name on it for free until 12 March from the link in your confirmation email. After that the name is printed on the badge, so write to us.",
  },
  {
    id: "access",
    q: "Is the venue accessible?",
    a: "Step-free from the quay to the floor, a lift to the balcony, an induction loop in the main hall and live captions on the screen. Tell us what you need when you book and we'll hold a spot near the front.",
  },
  {
    id: "food",
    q: "Is there food?",
    a: "Floor tickets include dinner at the interval: vegetarian by default, vegan and gluten-free if you ask. The late kitchen sells the same menu until 23:00.",
  },
  {
    id: "refunds",
    q: "Can I get a refund?",
    a: "Until 5 March, minus a €4 fee. After that we can't refund, but your seat goes back to the waitlist and someone gets very happy.",
  },
];
