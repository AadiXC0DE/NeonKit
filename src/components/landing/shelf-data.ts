/** What the library section shows. Plain data, so the server page and the client section can both read it. */
export type ShelfItem = { slug: string; name: string; description: string; category: string };
export type Shelf = { category: string; count: number };
export type Reel = { href: string; src: string; name: string; meta: string };

export const featured = ["knob", "glow-chart", "neon-sign"];

/** The four on each shelf that show it best, front first. */
export const shelfPicks: Record<string, string[]> = {
  Forms: ["switch", "calendar", "password-input", "slider"],
  Buttons: ["power-button", "shimmer-button", "hold-button", "button-group"],
  "Data Display": ["data-table", "heatmap", "donut-chart", "stat"],
  Navigation: ["stepper", "dock", "tree-view", "pagination"],
  Overlay: ["command", "tour", "context-menu", "hover-card"],
  Feedback: ["status-light", "toast", "progress", "alert"],
  Layout: ["device-frame", "carousel", "resizable", "item"],
  AI: ["chat-message", "reasoning", "suggestions", "conversation"],
  Text: ["split-flap", "rotating-text", "seven-segment", "led-matrix"],
  Instruments: ["gauge", "oscilloscope", "equalizer", "radar"],
  Effects: ["signal-beam", "hologram-card", "neon-frame", "crt-overlay"],
  Backgrounds: ["cityscape", "sunset", "lasers", "globe"],
};
