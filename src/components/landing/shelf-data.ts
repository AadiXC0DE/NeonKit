/** What the library section shows. Plain data, so the server page and the client section can both read it. */
export type ShelfItem = { slug: string; name: string; description: string; category: string };
export type Shelf = { category: string; count: number };
export type Reel = { href: string; src: string; name: string; meta: string };

export const featured = ["knob", "glow-chart", "neon-sign"];

/** The four on each shelf that show it best, front first. */
export const shelfPicks: Record<string, string[]> = {
  Forms: ["switch", "calendar", "input", "slider"],
  Buttons: ["power-button", "shimmer-button", "hold-button", "button-group"],
  "Data Display": ["data-table", "donut-chart", "stat", "timeline"],
  Navigation: ["stepper", "dock", "tree-view", "pagination"],
  Overlay: ["command", "context-menu", "hover-card", "tooltip"],
  Feedback: ["status-light", "toast", "progress", "alert"],
  Layout: ["carousel", "resizable", "item", "collapsible"],
  AI: ["chat-message", "conversation", "prompt-input"],
  Text: ["split-flap", "seven-segment", "led-matrix", "glitch-text"],
  Instruments: ["gauge", "oscilloscope", "equalizer", "radar"],
  Effects: ["hologram-card", "neon-frame", "crt-overlay", "spotlight-card"],
  Backgrounds: ["cityscape", "aurora", "rain-glass", "light-rays"],
};
